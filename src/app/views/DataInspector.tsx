import React, { useState, useEffect } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../components/Modal';
import { Download, RefreshCw, AlertCircle, ArrowLeft, Search, Database, Table as TableIcon } from 'lucide-react';
import { runQuery } from '../../lib/db';

interface DataInspectorProps {
    onBack: () => void;
}

export const DataInspector: React.FC<DataInspectorProps> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTable, setSelectedTable] = useState('invoice_items');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [tables, setTables] = useState<string[]>([]);
    const [tableSchema, setTableSchema] = useState<any[]>([]);
    const limit = 500;

    // 1. Fetch available tables
    useEffect(() => {
        const fetchTables = async () => {
            const result = await runQuery("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            setTables(result.map(r => r.name));
        };
        fetchTables();
    }, []);

    // 2. Fetch schema for selected table
    useEffect(() => {
        const fetchSchema = async () => {
            if (!selectedTable) return;
            const result = await runQuery(`PRAGMA table_info(${selectedTable})`);
            setTableSchema(result);
        };
        fetchSchema();
    }, [selectedTable]);

    // 3. Fetch data dynamically
    // We build a generic search across all text columns
    const searchFilter = searchTerm ? tableSchema
        .filter(col => col.type.toUpperCase().includes('TEXT') || col.name.toLowerCase().includes('id') || col.name.toLowerCase().includes('name'))
        .map(col => `${col.name} LIKE '%' || ?1 || '%'`)
        .join(' OR ') : '';

    const query = `
        SELECT *
        FROM ${selectedTable}
        ${searchFilter ? `WHERE ${searchFilter}` : ''}
        ORDER BY rowid DESC 
        LIMIT ?2
    `;

    const { data: items, loading, error, refresh } = useQuery(query, [searchTerm, limit]);

    // 4. Generate Columns dynamically
    const columns: any[] = tableSchema.map(col => {
        const isNumeric = col.type.toUpperCase().includes('INT') || col.type.toUpperCase().includes('REAL') || col.type.toUpperCase().includes('NUMERIC');
        const isAmount = col.name.toLowerCase().includes('amount') || col.name.toLowerCase().includes('price');

        return {
            header: col.name,
            accessor: col.name,
            align: isNumeric ? 'right' : 'left',
            className: col.name.toLowerCase().includes('id') ? 'font-mono text-[10px] text-slate-400' :
                (col.name === 'Period' || col.name === 'PostingDate' ? 'font-mono' : ''),
            render: isAmount ? (item: any) => (
                <span className={item[col.name] < 0 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}>
                    {new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: item.Currency || 'EUR'
                    }).format(item[col.name] || 0)}
                </span>
            ) : undefined
        };
    });

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Error loading data: {String(error)}</p>
                <div className="mt-4">
                    <button onClick={onBack} className="text-sm underline">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="mr-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Data Inspector
                        </h2>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedTable}
                            onChange={(e) => {
                                setSelectedTable(e.target.value);
                                setSearchTerm('');
                            }}
                            className="appearance-none pl-10 pr-10 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm font-medium transition-all hover:border-slate-300 dark:hover:border-slate-600"
                        >
                            {tables.map(t => (
                                <option key={t} value={t} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                    {t}
                                </option>
                            ))}
                        </select>
                        <TableIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                        <div className="absolute right-3 top-3.5 w-2 h-2 border-r-2 border-b-2 border-slate-400 rotate-45 pointer-events-none" />
                    </div>

                    <div className="relative max-w-sm w-full ml-4">
                        <input
                            type="text"
                            placeholder="Search in records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={refresh}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            if (!items || items.length === 0) return;
                            const headers = tableSchema.map(s => s.name);
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + headers.join(",") + "\n"
                                + items.map((row: any) => headers.map(h => {
                                    const val = row[h];
                                    if (val === null || val === undefined) return '';
                                    if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                                        return `"${val.replace(/"/g, '""')}"`;
                                    }
                                    return val;
                                }).join(",")).join("\n");

                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `${selectedTable}_export.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    {loading && !items ? (
                        <div className="p-12 text-center text-slate-400 animate-pulse">
                            Loading {selectedTable}...
                        </div>
                    ) : (
                        <DataTable
                            data={items || []}
                            columns={columns}
                            searchTerm=""
                            emptyMessage="No data found in this table."
                            onRowClick={(item) => setSelectedItem(item)}
                        />
                    )}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 text-[10px] flex justify-between items-center text-slate-400">
                    <div>Showing up to {limit} records</div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> IT Dashboard DB</span>
                        <span>{items?.length || 0} rows</span>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title={`${selectedTable} - Record Details`}
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(selectedItem).map(([key, value]) => (
                                <div key={key} className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-600/50">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        {key}
                                    </div>
                                    <div className="text-slate-900 dark:text-slate-100 font-mono text-xs break-all">
                                        {value === null || value === undefined || value === '' ? (
                                            <span className="text-slate-400 italic font-light">&lt;empty&gt;</span>
                                        ) : (
                                            String(value)
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
