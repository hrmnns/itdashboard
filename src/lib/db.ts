import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

let db: any = null;
let initPromise: Promise<any> | null = null;

export async function initDB() {
    if (db) return db;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            if (!window.crossOriginIsolated) {
                console.warn('Cross-origin isolation is not enabled. OPFS will not be available. Please check COOP/COEP headers.');
            }

            // Type assertion to bypass incorrect type definition if necessary
            const config = {
                print: console.log,
                printErr: console.error,
                locateFile: (file: string) => {
                    if (file === 'sqlite3.wasm') {
                        return '/sqlite3.wasm';
                    }
                    return file;
                }
            };

            const sqlite3 = await (sqlite3InitModule as any)(config);

            // Check if OpfsDb is available
            if (sqlite3.oo1.OpfsDb) {
                try {
                    const opfsDb = new sqlite3.oo1.OpfsDb('/itdashboard.sqlite3');
                    db = opfsDb;
                    console.log('SQLite WASM initialized with OPFS');
                } catch (opfsErr) {
                    console.warn('Failed to initialize OPFS, falling back to in-memory.', opfsErr);
                    db = new sqlite3.oo1.DB(':memory:');
                    await initSchema();
                    await loadDemoData();
                }
            } else {
                console.warn('OpfsDb not available in this environment. Falling back to in-memory DB.');
                db = new sqlite3.oo1.DB(':memory:');
                await initSchema();
                await loadDemoData();
                console.log('SQLite WASM initialized in-memory');
            }

            return db;
        } catch (err: any) {
            console.error('Failed to initialize SQLite WASM', err);

            // Final fallback if everything above fails
            try {
                const sqlite3 = await (sqlite3InitModule as any)();
                db = new sqlite3.oo1.DB(':memory:');
                console.warn('Forced fallback to in-memory DB due to error');
                await initSchema();
                await loadDemoData();
                return db;
            } catch (fallbackErr) {
                console.error('Critical failure: could not even initialize in-memory DB', fallbackErr);
                throw err;
            }
        } finally {
            initPromise = null;
        }
    })();

    return initPromise;
}

export function getDB() {
    if (!db) throw new Error('Database not initialized');
    return db;
}

export function runQuery(sql: string, bind?: any[]) {
    const db = getDB();
    const result: any[] = [];
    db.exec({
        sql,
        bind,
        rowMode: 'object',
        callback: (row: any) => {
            result.push(row);
        },
    });
    return result;
}

export async function initSchema() {
    const schema = await import('../datasets/schema.sql?raw').then(m => m.default);
    const views = await import('../datasets/views.sql?raw').then(m => m.default);

    const db = getDB();
    db.exec(schema);
    db.exec(views);
    console.log('Schema and views initialized');
}

export async function loadDemoData(type: 'small' | 'large' = 'small') {
    const db = getDB();

    // Clear existing data
    db.exec('DELETE FROM kpi_data; DELETE FROM operations_events;');

    let data: any;
    if (type === 'small') {
        data = await import('../datasets/demo-small.json').then(m => m.default);
    } else {
        console.warn('Large dataset not implemented yet, using small');
        data = await import('../datasets/demo-small.json').then(m => m.default);
    }

    // Insert KPIs
    const kpiStmt = db.prepare('INSERT INTO kpi_data (metric, value, unit, category, date) VALUES (?, ?, ?, ?, ?)');
    try {
        for (const item of data.kpis) {
            kpiStmt.bind([item.metric, item.value, item.unit, item.category, item.date]);
            kpiStmt.step();
            kpiStmt.reset();
        }
    } finally {
        kpiStmt.finalize();
    }

    // Insert Events
    if (data.events) {
        const eventStmt = db.prepare('INSERT INTO operations_events (event_name, status, timestamp) VALUES (?, ?, ?)');
        try {
            for (const item of data.events) {
                eventStmt.bind([item.event_name, item.status, item.timestamp]);
                eventStmt.step();
                eventStmt.reset();
            }
        } finally {
            eventStmt.finalize();
        }
    }

    console.log(`Loaded ${type} demo data`);
}
