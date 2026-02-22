import DBWorker from './db.worker?worker';
import type { DbRow } from '../types';

let worker: Worker | null = null;
let msgId = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pending = new Map<number, { resolve: (val: any) => void, reject: (err: any) => void }>();

const channel = new BroadcastChannel('litebistudio_db_v1');
const conflictListeners = new Set<(hasConflict: boolean, isReadOnly: boolean) => void>();

let hasConflict = false;
let isMaster = false;
let isReadOnlyMode = false;

const instanceId = sessionStorage.getItem('litebistudio_instance_id') || crypto.randomUUID();
sessionStorage.setItem('litebistudio_instance_id', instanceId);

channel.onmessage = async (event) => {
    if (event.data && event.data.type === 'PING') {
        if (isMaster && event.data.instanceId !== instanceId) {
            channel.postMessage({ type: 'MASTER_PONG', instanceId: event.data.instanceId });
        }
    } else if (event.data && event.data.type === 'MASTER_PONG') {
        if (event.data.instanceId === instanceId) {
            processTabConflict();
        }
    } else if (event.data && event.data.type === 'RPC_REQ' && isMaster) {
        const { id, actionType, payload } = event.data;
        // Proxy the request as if it were called on the master tab
        try {
            const result = await send(actionType, payload);
            channel.postMessage({ type: 'RPC_RES', id, result: result });
        } catch (e: any) {
            channel.postMessage({ type: 'RPC_RES', id, error: e.message });
        }
    } else if (event.data && event.data.type === 'RPC_RES' && !isMaster) {
        const { id, result, error } = event.data;
        if (pending.has(id)) {
            const { resolve, reject } = pending.get(id)!;
            pending.delete(id);
            if (error) reject(new Error(error));
            else resolve(result);
        }
    }
};

let readOnlyResolve: (() => void) | null = null;

const lockAbortController = new AbortController();

export function setReadOnlyMode(skipRedirect = false) {
    isReadOnlyMode = true;
    sessionStorage.setItem('litebistudio_accepted_readonly', 'true');
    conflictListeners.forEach(l => l(true, true));
    if (readOnlyResolve) readOnlyResolve();
    lockAbortController.abort(); // Cancel any pending lock requests for this tab
    // Force overview page on start of read-only mode to prevent blank screens, unless auto-reloaded
    if (!skipRedirect) {
        window.location.hash = '#/';
    }
}

function processTabConflict() {
    if (hasConflict) return;
    hasConflict = true;
    console.warn('[DB] Tab conflict detected! Access restricted to one tab.');

    if (sessionStorage.getItem('litebistudio_accepted_readonly') === 'true') {
        setReadOnlyMode(true);
    } else {
        conflictListeners.forEach(l => l(true, isReadOnlyMode));
    }
}

export function onTabConflict(callback: (hasConflict: boolean, isReadOnly: boolean) => void) {
    conflictListeners.add(callback);
    if (hasConflict) {
        callback(true, isReadOnlyMode);
    }
    return () => {
        conflictListeners.delete(callback);
    };
}

channel.postMessage({ type: 'PING', instanceId });

let lifecycleInitPromise: Promise<void> | null = null;

function getWorker(): Promise<Worker | 'SLAVE'> {
    if (!lifecycleInitPromise) {
        lifecycleInitPromise = new Promise((resolveLifecycle) => {
            // Check if we can become master. 
            // Note: 'ifAvailable' and 'signal' cannot be used together.
            navigator.locks.request('litebistudio_db_lifecycle', { ifAvailable: true }, async (lock) => {
                if (!lock) {
                    // Lock is already held by another tab. We are a slave.
                    isMaster = false;
                    resolveLifecycle();

                    // Request the lock normally in the background (hidden queue)
                    // so we take over if the current master tab is closed.
                    // Here we CAN use the signal to cancel if this tab enters explicit Read-Only mode.
                    try {
                        await navigator.locks.request('litebistudio_db_lifecycle', { signal: lockAbortController.signal }, async () => {
                            console.log('[DB] Previous master tab closed. Reloading to take over...');
                            window.location.reload();
                        });
                    } catch (e: any) {
                        if (e.name !== 'AbortError') console.error('[DB] Background lock request failed:', e);
                    }
                    return;
                }

                if (isReadOnlyMode) {
                    // We got the lock but the tab already switched to read-only.
                    // Release it immediately so others can take it.
                    isMaster = false;
                    resolveLifecycle();
                    return;
                }

                // We acquired the lock. We are the master.
                isMaster = true;
                const w = new DBWorker();
                w.onmessage = (e) => {
                    const { id, result, error } = e.data;
                    if (pending.has(id)) {
                        const { resolve, reject } = pending.get(id)!;
                        pending.delete(id);
                        if (error) reject(new Error(error));
                        else resolve(result);
                    }
                };
                worker = w;
                resolveLifecycle();

                // Hold the lock forever
                await new Promise(() => { });
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Failed to acquire DB lock:', err);
                }
                isMaster = false;
                resolveLifecycle();
            });
        });
    }

    return lifecycleInitPromise.then(() => (isMaster && worker) ? worker : 'SLAVE');
}

window.addEventListener('beforeunload', () => {
    if (worker) {
        worker.postMessage({ type: 'CLOSE' });
    }
});

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        if (worker) {
            worker.postMessage({ type: 'CLOSE' });
        }
        channel.close();
    });
}

function send<T>(type: string, payload?: Record<string, unknown> | DbRow[] | ArrayBuffer): Promise<T> {
    const handleSlaveRpc = () => {
        // If we are in explicit Read-Only mode (user accepted the conflict),
        // we restrict destructive actions.
        if (isReadOnlyMode) {
            if (type === 'EXEC' && payload && 'sql' in (payload as any)) {
                const sql = (payload as any).sql.toUpperCase().trimStart();
                if (!sql.startsWith('SELECT') && !sql.startsWith('PRAGMA')) {
                    return Promise.reject(new Error(`Action ${type} (WRITE) not permitted in Read-Only mode.`));
                }
            } else if (type !== 'INIT' && type !== 'GET_DIAGNOSTICS' && type !== 'EXPORT') {
                return Promise.reject(new Error(`Action ${type} not permitted in Read-Only mode.`));
            }
        }

        // Send request to master tab via BroadcastChannel
        return new Promise<T>((resolve, reject) => {
            const id = ++msgId;
            const timeout = setTimeout(() => {
                if (pending.has(id)) {
                    pending.delete(id);
                    console.error(`[DB] RPC Timeout for action: ${type} (Master tab unresponsive)`);
                    reject(new Error(`Database Master unresponsive (Timeout after 5s). Please focus the first tab or refresh.`));
                }
            }, 5000);

            pending.set(id, {
                resolve: (val) => { clearTimeout(timeout); resolve(val); },
                reject: (err) => { clearTimeout(timeout); reject(err); }
            });
            channel.postMessage({ type: 'RPC_REQ', id, actionType: type, payload });
        });
    };

    if (!isMaster && isReadOnlyMode) {
        return handleSlaveRpc();
    }

    return getWorker().then(result => {
        if (result === 'SLAVE') {
            return handleSlaveRpc();
        }
        const w = result as Worker;
        return new Promise<T>((resolve, reject) => {
            const id = ++msgId;
            pending.set(id, { resolve, reject });
            w.postMessage({ id, type, payload });
        });
    });
}

export function notifyDbChange(count: number = 1, type: string = 'insert') {
    window.dispatchEvent(new CustomEvent('db-changed', {
        detail: { type, count }
    }));
}

export function initDB() {
    return send<boolean>('INIT').then(() => { });
}

export async function runQuery(sql: string, bind?: (string | number | null | undefined)[]): Promise<DbRow[]> {
    await initDB();
    return send<DbRow[]>('EXEC', { sql, bind });
}

export async function clearDatabase() {
    await initDB();
    return send('CLEAR');
}

export async function clearTable(tableName: string) {
    await initDB();
    return send('CLEAR_TABLE', { tableName });
}

export async function exportDatabase(): Promise<Uint8Array> {
    await initDB();
    return send<Uint8Array>('EXPORT');
}

export async function importDatabase(buffer: ArrayBuffer): Promise<any> {
    return await send('IMPORT', buffer);
}

export async function loadDemoData(data?: any) {
    await initDB();
    return send<number>('LOAD_DEMO', data);
}

export async function exportDemoData(): Promise<any> {
    await initDB();
    return send('EXPORT_DEMO_DATA');
}

export async function initSchema() {
    await initDB();
    return send('INIT_SCHEMA');
}

export async function getDiagnostics() {
    await initDB();
    return send('GET_DIAGNOSTICS');
}

export function genericBulkInsert(tableName: string, records: any[]): Promise<number> {
    return send<number>('GENERIC_BULK_INSERT', { tableName, records });
}
