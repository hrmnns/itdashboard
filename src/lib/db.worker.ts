import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import schemaSql from '../datasets/schema.sql?raw';
import viewsSql from '../datasets/views.sql?raw';
import demoDataSmall from '../datasets/demo-small.json';

let db: any = null;
let sqlite3: any = null;

const log = (...args: any[]) => console.log('[DB Worker]', ...args);
const error = (...args: any[]) => console.error('[DB Worker]', ...args);

async function initDB() {
    if (db) return;

    try {
        log('Initializing SQLite...');
        const config = {
            print: log,
            printErr: error,
        };

        sqlite3 = await (sqlite3InitModule as any)(config);

        if (sqlite3.oo1.OpfsDb) {
            try {
                db = new sqlite3.oo1.OpfsDb('/itdashboard.sqlite3');
                log('Opened OPFS database');
            } catch (e) {
                error('OPFS unavailable, falling back to memory', e);
                db = new sqlite3.oo1.DB(':memory:');
            }
        } else {
            log('OPFS not supported, using memory');
            db = new sqlite3.oo1.DB(':memory:');
        }

        // Initialize schema
        db.exec(schemaSql);
        db.exec(viewsSql);
        log('Schema initialized');

        // Check for empty DB and load demo data
        const kpiCount = db.selectValue('SELECT count(*) FROM kpi_data');
        const invoiceCount = db.selectValue('SELECT count(*) FROM invoice_items');

        if (kpiCount === 0 && invoiceCount === 0) {
            log('Database empty, loading demo data...');
            await loadDemoData();
        }

    } catch (e) {
        error('Initialization failed', e);
        throw e;
    }
}

async function loadDemoData() {
    // Clear first just in case
    db.exec('DELETE FROM kpi_data; DELETE FROM operations_events; DELETE FROM invoice_items;');

    // KPIs
    const kpiStmt = db.prepare('INSERT INTO kpi_data (metric, value, unit, category, date) VALUES (?, ?, ?, ?, ?)');
    try {
        db.exec('BEGIN TRANSACTION');
        for (const item of demoDataSmall.kpis) {
            kpiStmt.bind([item.metric, item.value, item.unit, item.category, item.date]);
            kpiStmt.step();
            kpiStmt.reset();
        }
        db.exec('COMMIT');
    } finally {
        kpiStmt.finalize();
    }

    // Events
    if (demoDataSmall.events) {
        const eventStmt = db.prepare('INSERT INTO operations_events (event_name, status, timestamp) VALUES (?, ?, ?)');
        try {
            db.exec('BEGIN TRANSACTION');
            for (const item of demoDataSmall.events) {
                eventStmt.bind([item.event_name, item.status, item.timestamp]);
                eventStmt.step();
                eventStmt.reset();
            }
            db.exec('COMMIT');
        } finally {
            eventStmt.finalize();
        }
    }
    log('Demo data loaded');
}

async function handleMessage(e: MessageEvent) {
    const { id, type, payload } = e.data;

    try {
        let result;

        switch (type) {
            case 'INIT':
                await initDB();
                result = true;
                break;

            case 'EXEC':
                if (!db) await initDB();
                const rows: any[] = [];
                db.exec({
                    sql: payload.sql,
                    bind: payload.bind,
                    rowMode: 'object',
                    callback: (row: any) => rows.push(row)
                });
                result = rows;
                break;

            case 'BULK_INSERT_INVOICE_ITEMS':
                if (!db) await initDB();
                insertInvoiceItems(payload);
                result = true;
                break;

            case 'BULK_INSERT_KPIS':
                if (!db) await initDB();
                insertKPIs(payload);
                result = true;
                break;

            case 'BULK_INSERT_EVENTS':
                if (!db) await initDB();
                insertEvents(payload);
                result = true;
                break;

            case 'EXPORT':
                if (!db) await initDB();
                result = sqlite3.capi.sqlite3_js_db_export(db.pointer);
                break;

            case 'IMPORT':
                await importDatabase(payload);
                result = true;
                break;

            case 'CLEAR':
                if (!db) await initDB();
                db.exec('DELETE FROM kpi_data; DELETE FROM operations_events; DELETE FROM invoice_items;');
                result = true;
                break;

            case 'LOAD_DEMO':
                if (!db) await initDB();
                await loadDemoData();
                result = true;
                break;

            case 'INIT_SCHEMA':
                if (!db) await initDB();
                // Schema is already init on DB open, but strictly speaking we can run it again if needed
                // or just do nothing if only needed for ensuring connection.
                result = true;
                break;
        }

        self.postMessage({ id, result });
    } catch (error: any) {
        self.postMessage({ id, error: error.message });
    }
}

function insertInvoiceItems(data: any[]) {
    const sql = `
        INSERT INTO invoice_items (
            FiscalYear, Period, PostingDate, VendorName, VendorId, 
            DocumentId, LineId, CostCenter, GLAccount, Category, 
            SubCategory, Service, System, RunChangeInnovation, Amount, 
            Currency, Quantity, Unit, UnitPrice, ContractId, 
            POId, IsRecurring, Description, SourceTag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const stmt = db.prepare(sql);
    try {
        db.exec('BEGIN TRANSACTION');
        for (const item of data) {
            stmt.bind([
                item.FiscalYear, item.Period, item.PostingDate, item.VendorName, item.VendorId,
                item.DocumentId, item.LineId, item.CostCenter, item.GLAccount, item.Category,
                item.SubCategory, item.Service, item.System, item.RunChangeInnovation, item.Amount,
                item.Currency, item.Quantity, item.Unit, item.UnitPrice, item.ContractId,
                item.POId, item.IsRecurring, item.Description, item.SourceTag
            ]);
            stmt.step();
            stmt.reset();
        }
        db.exec('COMMIT');
    } catch (e) {
        db.exec('ROLLBACK');
        throw e;
    } finally {
        stmt.finalize();
    }
}

function insertKPIs(data: any[]) {
    const stmt = db.prepare('INSERT INTO kpi_data (metric, value, unit, category, date) VALUES (?, ?, ?, ?, ?)');
    try {
        db.exec('BEGIN TRANSACTION');
        for (const item of data) {
            stmt.bind([item.metric, item.value, item.unit, item.category, item.date]);
            stmt.step();
            stmt.reset();
        }
        db.exec('COMMIT');
    } catch (e) {
        db.exec('ROLLBACK');
        throw e;
    } finally {
        stmt.finalize();
    }
}

function insertEvents(data: any[]) {
    const stmt = db.prepare('INSERT INTO operations_events (event_name, status, timestamp) VALUES (?, ?, ?)');
    try {
        db.exec('BEGIN TRANSACTION');
        for (const item of data) {
            stmt.bind([item.event_name, item.status, item.timestamp]);
            stmt.step();
            stmt.reset();
        }
        db.exec('COMMIT');
    } catch (e) {
        db.exec('ROLLBACK');
        throw e;
    } finally {
        stmt.finalize();
    }
}

async function importDatabase(buffer: ArrayBuffer) {
    if (db) {
        db.close();
        db = null;
    }

    if (sqlite3.oo1.OpfsDb) {
        try {
            const root = await navigator.storage.getDirectory();
            try {
                await root.removeEntry('itdashboard.sqlite3');
            } catch (e) { /* ignore */ }

            const fileHandle = await root.getFileHandle('itdashboard.sqlite3', { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(buffer);
            await writable.close();
        } catch (e) {
            error('Import failed', e);
            throw e;
        }
    }

    // Re-init happens on next command or caller reloads page
}

self.onmessage = handleMessage;
