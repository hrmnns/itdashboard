import React from 'react';
import { Info, Database, Upload } from 'lucide-react';
import { ExcelImport } from '../components/ExcelImport';
import { SchemaDocumentation } from '../components/SchemaDocumentation';
import invoiceItemsSchema from '../../schemas/invoice-items-schema.json';

interface DatasourceViewProps {
    onImportComplete: () => void;
}

export const DatasourceView: React.FC<DatasourceViewProps> = ({ onImportComplete }) => {
    return (
        <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Data Management</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Import your data from Excel or CSV files. The data will be stored locally in your browser's SQLite database.
                </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-1">
                            <Info className="w-4 h-4" />
                            Sample Data Setup
                        </h3>
                        <p className="text-xs text-blue-700/70 dark:text-blue-300/60 max-w-md">
                            New to the dashboard? Load sample data to explore tiles, charts and database functions immediately.
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                const { loadDemoData, initSchema, initDB } = await import('../../lib/db');
                                await initDB();
                                await initSchema();
                                await loadDemoData();
                                window.dispatchEvent(new Event('db-updated'));
                                onImportComplete();
                            } catch (e) {
                                console.error(e);
                                alert('Failed to load data');
                            }
                        }}
                        className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-200 dark:shadow-none"
                    >
                        Load Demo Data
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Import Data</h3>
                <ExcelImport onImportComplete={onImportComplete} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Backup & Restore</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={async () => {
                            const { exportDatabase } = await import('../../lib/db');
                            const bytes = await exportDatabase();
                            const blob = new Blob([bytes as any], { type: 'application/x-sqlite3' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'itdashboard.sqlite3';
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-500 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-all shadow-sm"
                    >
                        <Database className="w-4 h-4 text-blue-500" />
                        Download Database (.sqlite3)
                    </button>

                    <div className="relative">
                        <input
                            type="file"
                            accept=".sqlite3"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (confirm('Importing a database will overwrite your current local data. The page will reload after import. Continue?')) {
                                    try {
                                        const { importDatabase } = await import('../../lib/db');
                                        const buffer = await file.arrayBuffer();
                                        await importDatabase(buffer);
                                        alert('Database restored successfully. Reloading...');
                                        window.location.reload();
                                    } catch (err: any) {
                                        console.error(err);
                                        alert('Failed to import database: ' + err.message);
                                    }
                                }
                                e.target.value = '';
                            }}
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-500 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-all shadow-sm pointer-events-none">
                            <Upload className="w-4 h-4 text-indigo-500" />
                            Restore from Backup (.sqlite3)
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-6">
                <SchemaDocumentation
                    schema={invoiceItemsSchema}
                    title="Expected Invoice Format"
                />
            </div>
        </div>
    );
};
