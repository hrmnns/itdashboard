import React, { useState, useMemo } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { ArrowLeft, Search, Receipt, Calendar, Tag, AlertTriangle, PlusCircle, TrendingUp, Printer, ShieldCheck } from 'lucide-react';
import { DataTable, type Column } from '../../components/ui/DataTable';

interface ItCostsInvoiceItemsViewProps {
    invoiceId: string;
    period: string;
    onBack: () => void;
    onViewHistory: (vendorId: string, description: string) => void;
}

// Helper to get previous period (assuming YYYY-MM format)
const getPreviousPeriod = (currentPeriod: string) => {
    const [year, month] = currentPeriod.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const prevYear = date.getFullYear();
    const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
    return `${prevYear}-${prevMonth}`;
};

export const ItCostsInvoiceItemsView: React.FC<ItCostsInvoiceItemsViewProps> = ({ invoiceId, period, onBack, onViewHistory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const previousPeriod = useMemo(() => getPreviousPeriod(period), [period]);

    // Fetch all positions for this specific invoice
    const { data: currentItemsData, loading: loadingCurrent, error } = useQuery(
        `SELECT * FROM invoice_items WHERE DocumentId = ? AND Period = ? ORDER BY LineId ASC`,
        [invoiceId, period]
    );

    // Fetch previous month items for this vendor to compare
    const vendorId = currentItemsData?.[0]?.VendorId;
    // Ensure we only query if vendorId exists
    const prevQuery = vendorId ? `SELECT * FROM invoice_items WHERE Period = ? AND VendorId = ?` : '';
    const prevParams = vendorId ? [previousPeriod, vendorId] : [];

    const { data: previousItemsData, loading: loadingPrevious } = useQuery(prevQuery, prevParams);

    if (loadingCurrent || loadingPrevious) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    const items = currentItemsData || [];
    const previousItems = previousItemsData || [];
    const totalAmount = items.reduce((acc: number, item: any) => acc + item.Amount, 0);
    const vendorName = items[0]?.VendorName || 'Unknown Vendor';
    const postingDate = items[0]?.PostingDate || period;

    // Enhance items with anomaly flags
    const normalize = (s: string | null | undefined) => (s || '').replace(/\d+/g, '#').trim();

    const enhancedItems = items.map((item: any) => {
        // PRIORITY 1: Match by DocumentId + LineId + CostCenter (for unique recurring identification)
        let match = previousItems.find((p: any) =>
            String(p.DocumentId).trim() === String(item.DocumentId).trim() &&
            String(p.LineId).trim() === String(item.LineId).trim() &&
            String(p.CostCenter).trim() === String(item.CostCenter).trim()
        );

        // PRIORITY 2: Fallback to Description + Category
        if (!match) {
            match = previousItems.find((p: any) =>
                normalize(p.Description) === normalize(item.Description) &&
                p.Category === item.Category
            );
        }

        let status: 'normal' | 'new' | 'changed' = 'normal';
        let previousAmount = null;

        if (!match) {
            status = 'new';
        } else {
            const diff = Math.abs(item.Amount - match.Amount);
            const percentDiff = diff / Math.abs(match.Amount || 1);
            if (diff > 10 && percentDiff > 0.1) {
                status = 'changed';
                previousAmount = match.Amount;
            }
        }

        return { ...item, status, previousAmount };
    });

    const columns: Column<any>[] = [
        {
            header: 'Line',
            accessor: 'LineId',
            align: 'center',
            render: (item: any) => (
                <div className="flex flex-col items-center gap-1">
                    <span className="text-slate-400 font-mono text-[10px]">#{item.LineId}</span>
                    {item.status === 'new' && <PlusCircle className="w-3 h-3 text-blue-500" />}
                    {item.status === 'changed' && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                </div>
            )
        },
        {
            header: 'Description',
            accessor: 'Description',
            render: (item: any) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{item.Description}</span>
                        {item.status === 'new' && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold uppercase rounded">New</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {item.Category} {item.SubCategory ? ` › ${item.SubCategory}` : ''}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Cost Center / Account',
            accessor: 'CostCenter',
            render: (item: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[9px] font-bold uppercase tracking-wider w-fit">
                        {item.CostCenter}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{item.GLAccount}</span>
                </div>
            )
        },
        {
            header: 'Run/Change',
            accessor: 'RunChangeInnovation',
            align: 'center',
            render: (item: any) => (
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.RunChangeInnovation === 'Run' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                    {item.RunChangeInnovation}
                </span>
            )
        },
        {
            header: 'Amount',
            accessor: 'Amount',
            align: 'right',
            render: (item: any) => {
                const isCredit = item.Amount < 0;
                return (
                    <div className="flex flex-col items-end">
                        <span className={`font-bold ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                            {isCredit ? '-' : ''}€{Math.abs(item.Amount).toLocaleString()}
                        </span>
                        {item.status === 'changed' && (
                            <span className="text-[9px] text-orange-600 bg-orange-50 px-1 rounded flex items-center gap-1">
                                Var: {((item.Amount - item.previousAmount) > 0 ? '+' : '')}
                                {Math.round(item.Amount - item.previousAmount)}€
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Action',
            accessor: 'actions',
            align: 'right',
            render: (item: any) => (
                <button
                    onClick={() => onViewHistory(item.VendorId, item.Description)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                    title="Analyze History"
                >
                    <TrendingUp className="w-4 h-4" />
                </button>
            )
        }
    ];

    return (
        <div className="p-6 md:p-8 space-y-6 print:space-y-4">
            {/* Print Only Header */}
            <div className="hidden print-only mb-8 border-b-4 border-slate-900 pb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-slate-900 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-slate-900">IT DASHBOARD</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Monthly Cost Audit</h1>
                        <p className="text-slate-500 font-bold">Standard Financial Reporting • {period}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black uppercase text-slate-400 mt-2">Reference ID</div>
                        <div className="font-mono text-sm underline decoration-blue-500/30">INV-{invoiceId}</div>
                        <div className="text-[10px] font-black uppercase text-slate-400 mt-2">Export Date</div>
                        <div className="font-bold">{new Date().toLocaleDateString('de-DE')}</div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded">Invoice Details</span>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-slate-500 text-[10px] font-bold uppercase">{period}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            {vendorName}
                            <span className="text-sm font-normal text-slate-400">({invoiceId})</span>
                        </h2>
                    </div>
                </div>

                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg active:scale-95"
                >
                    <Printer className="w-4 h-4" />
                    Print / Export PDF
                </button>
            </div>

            {/* Invoice Info Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap gap-8 items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Posting Date</div>
                        <div className="text-sm font-bold">{postingDate}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-black">Total Positions</div>
                        <div className="text-sm font-bold">{items.length} Items</div>
                    </div>
                </div>
                <div className="flex-1 no-print"></div>
                <div className="flex flex-col items-end">
                    <div className="text-[10px] text-slate-400 uppercase font-black">Invoice Total</div>
                    <div className={`text-2xl font-black ${totalAmount < 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                        {totalAmount < 0 ? '-' : ''}€{Math.abs(totalAmount).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Search and Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 no-print">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find position or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <div className="flex items-center gap-1.5">
                            <PlusCircle className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">New Position</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Price Change</span>
                        </div>
                    </div>
                </div>

                <DataTable
                    data={enhancedItems}
                    columns={columns.filter(col => col.accessor !== 'actions')}
                    searchTerm={searchTerm}
                    searchFields={['Description', 'CostCenter', 'GLAccount', 'Category']}
                    emptyMessage="No positions found matching your search"
                />
            </div>
        </div>
    );
};
