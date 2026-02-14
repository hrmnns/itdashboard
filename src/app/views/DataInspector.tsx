import React, { useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../components/Modal';
import { Download, RefreshCw, AlertCircle, ArrowLeft, Search } from 'lucide-react';

interface DataInspectorProps {
    onBack: () => void;
}

export const DataInspector: React.FC<DataInspectorProps> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const limit = 500;

    const { data: items, loading, error, refresh } = useQuery(
        `SELECT *
        FROM invoice_items 
        WHERE 
            (?1 = '' OR VendorName LIKE '%' || ?1 || '%') OR 
            (?1 = '' OR Description LIKE '%' || ?1 || '%') OR 
            (?1 = '' OR DocumentId LIKE '%' || ?1 || '%')
        ORDER BY rowid DESC 
        LIMIT ?2`,
        [searchTerm, limit]
    );

    const columns: any[] = [
        { header: 'Period', accessor: 'Period', className: 'font-mono' },
        { header: 'Date', accessor: 'PostingDate', className: 'font-mono text-xs' },
        { header: 'Vendor', accessor: 'VendorName', className: 'font-medium' },
        { header: 'Description', accessor: 'Description', className: 'max-w-xs truncate' },
        {
            header: 'Amount',
            accessor: 'Amount',
            align: 'right',
            render: (item: any) => (
                <span className={item.Amount < 0 ? 'text-red-500' : 'text-slate-900'}>
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: item.Currency || 'EUR' }).format(item.Amount)}
                </span>
            )
        },
        { header: 'Qty', accessor: 'Quantity', align: 'right' },
        { header: 'Doc ID', accessor: 'DocumentId', className: 'text-xs font-mono text-slate-400' },
        { header: 'Line', accessor: 'LineId', align: 'right', className: 'text-xs' },
    ];

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">
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
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
                                Raw View
                            </span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Querying database... found {items?.length || 0} records.
                        </p>
                    </div>

                    <div className="relative max-w-md w-full">
                        <input
                            type="text"
                            placeholder="Search Vendor, Description or DocID..."
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
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            if (!items) return;
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + ["FiscalYear,Period,PostingDate,VendorName,Description,Amount,Currency,Quantity,DocumentId,LineId"].join(",") + "\n"
                                + items.map((e: any) => [e.FiscalYear, e.Period, e.PostingDate, e.VendorName, `"${e.Description}"`, e.Amount, e.Currency, e.Quantity, e.DocumentId, e.LineId].join(",")).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "it_dashboard_export.csv");
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
                <DataTable
                    data={items || []}
                    columns={columns}
                    searchTerm=""
                    emptyMessage="No data found in database."
                    onRowClick={(item) => setSelectedItem(item)}
                />
                <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-xs text-center text-slate-400">
                    {items?.length || 0} records loaded
                </div>
            </div>

            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title="Record Details"
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(selectedItem).map(([key, value]) => (
                                <div key={key} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                        {key}
                                    </div>
                                    <div className="text-slate-900 dark:text-slate-100 font-mono text-sm break-all">
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
