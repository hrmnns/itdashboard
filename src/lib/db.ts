import DBWorker from './db.worker?worker';
import type { DbRow } from '../types';

const worker = new DBWorker();
let initPromise: Promise<void> | null = null;
let msgId = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pending = new Map<number, { resolve: (val: any) => void, reject: (err: any) => void }>();

worker.onmessage = (e) => {
    const { id, result, error } = e.data;
    if (pending.has(id)) {
        const { resolve, reject } = pending.get(id)!;
        pending.delete(id);
        if (error) reject(new Error(error));
        else resolve(result);
    }
};

function send<T>(type: string, payload?: Record<string, unknown> | DbRow[] | ArrayBuffer): Promise<T> {
    return new Promise((resolve, reject) => {
        const id = ++msgId;
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, type, payload });
    });
}

export function initDB() {
    if (!initPromise) {
        initPromise = send<boolean>('INIT').then(() => { });
    }
    return initPromise;
}

export async function runQuery(sql: string, bind?: (string | number | null | undefined)[]): Promise<DbRow[]> {
    await initDB();
    return send<DbRow[]>('EXEC', { sql, bind });
}

export async function bulkInsertInvoiceItems(data: DbRow[]) {
    await initDB();
    return send('BULK_INSERT_INVOICE_ITEMS', data);
}

export async function bulkInsertKPIs(data: DbRow[]) {
    await initDB();
    return send('BULK_INSERT_KPIS', data);
}

export async function bulkInsertEvents(data: DbRow[]) {
    await initDB();
    return send('BULK_INSERT_EVENTS', data);
}

export async function clearDatabase() {
    await initDB();
    return send('CLEAR');
}

export async function exportDatabase(): Promise<Uint8Array> {
    await initDB();
    return send<Uint8Array>('EXPORT');
}

export async function importDatabase(buffer: ArrayBuffer) {
    // No need to await initDB here as we might be overwriting a broken one
    await send('IMPORT', buffer);
    // Force re-init on next call
    initPromise = null;
}

export async function loadDemoData() {
    await initDB();
    // Re-use clear for now or add specific LOAD_DEMOType
    // Actually simpler to just use specific messages if we want granular control
    // But for now let's just use INIT with a forced flag or similar? 
    // Wait, the worker automatically loads demo data on INIT if empty.
    // But the user might want to force reload.
    // Let's add explicit LOAD_DEMO support in worker first or just rely on CLEAR then INIT?
    // Let's check worker code.
    return send('LOAD_DEMO');
}

export async function initSchema() {
    await initDB();
    return send('INIT_SCHEMA');
}

export async function toggleWorklist(sourceTable: string, sourceId: number, label?: string, context?: string) {
    await initDB();
    const existing = await runQuery(
        'SELECT id FROM worklist WHERE source_table = ? AND source_id = ?',
        [sourceTable, sourceId]
    );

    if (existing.length > 0) {
        return runQuery(
            'DELETE FROM worklist WHERE source_table = ? AND source_id = ?',
            [sourceTable, sourceId]
        );
    } else {
        return runQuery(
            'INSERT INTO worklist (source_table, source_id, display_label, display_context) VALUES (?, ?, ?, ?)',
            [sourceTable, sourceId, label, context]
        );
    }
}

export async function isInWorklist(sourceTable: string, sourceId: number): Promise<boolean> {
    await initDB();
    const result = await runQuery(
        'SELECT id FROM worklist WHERE source_table = ? AND source_id = ?',
        [sourceTable, sourceId]
    );
    return result.length > 0;
}

export async function getWorklistCount(): Promise<number> {
    await initDB();
    const result = await runQuery("SELECT COUNT(*) as count FROM worklist WHERE status = 'open'");
    return (result[0]?.count as number) || 0;
}
