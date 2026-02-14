import React, { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { ArrowLeft, Calendar, TrendingUp, AlertCircle, Info, Tag, Layers, Receipt } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../components/Modal';

interface ItCostsItemHistoryViewProps {
    vendorId: string;
    description: string;
    onBack: () => void;
}

export const ItCostsItemHistoryView: React.FC<ItCostsItemHistoryViewProps> = ({ vendorId, description, onBack }) => {
    const [selectedItem, setSelectedItem] = useState<any>(null);
    // Fetch history for this item (same Vendor + Description)
    // Fetch history for this item (same Vendor + Description)

    // Use parameters to avoid escaping issues
    // Try LIKE if description contains dates (basic heuristic)
    const hasDigits = /\d/.test(description);
    const sql = hasDigits
        ? `SELECT * FROM invoice_items WHERE VendorId = ? AND Description LIKE ? ORDER BY PostingDate ASC`
        : `SELECT * FROM invoice_items WHERE VendorId = ? AND Description = ? ORDER BY PostingDate ASC`;

    const searchParam = hasDigits
        ? description.replace(/\d+/g, '%')
        : description;

    const { data, loading, error } = useQuery(sql, [vendorId, searchParam]);

    const history = data || [];
    const isRecurring = history.length > 1;

    // Chart Data Preparation (moved before conditional returns)
    const chartData = useMemo(() => {
        if (!isRecurring) return [];
        return history.map((item: any) => ({
            date: item.PostingDate,
            amount: item.Amount,
            period: item.Period
        }));
    }, [history, isRecurring]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    const firstOccurrence = history[0];
    const latestOccurrence = history[history.length - 1];

    // Simple SVG Chart Logic
    const ChartRenderer = () => {
        if (chartData.length < 2) return null;

        const height = 200;
        const width = 600;
        const padding = 20;

        const maxVal = Math.max(...chartData.map((d: any) => Math.abs(d.amount))) * 1.1;
        // For simplicity, let's plot absolute cost development.

        const getX = (index: number) => padding + (index / (chartData.length - 1)) * (width - 2 * padding);
        const getY = (val: number) => height - padding - (Math.abs(val) / maxVal) * (height - 2 * padding);

        const points = chartData.map((d: any, i: number) => `${getX(i)},${getY(d.amount)}`).join(' ');

        return (
            <div className="w-full overflow-x-auto pb-4">
                <div className="min-w-[600px]">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                        {/* Grid lines */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />

                        {/* Line */}
                        <polyline
                            points={points}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Points */}
                        {chartData.map((d: any, i: number) => (
                            <g key={i}>
                                <circle
                                    cx={getX(i)}
                                    cy={getY(d.amount)}
                                    r="4"
                                    className="fill-blue-600 stroke-white dark:stroke-slate-800 stroke-2"
                                />
                                {/* Tooltip text (simplified) */}
                                <text
                                    x={getX(i)}
                                    y={getY(d.amount) - 10}
                                    textAnchor="middle"
                                    className="text-[10px] fill-slate-500 font-bold"
                                >
                                    {Math.round(d.amount)}€
                                </text>
                                <text
                                    x={getX(i)}
                                    y={height - 5}
                                    textAnchor="middle"
                                    className="text-[8px] fill-slate-400"
                                >
                                    {d.period}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase rounded">Item History</span>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-slate-500 text-[10px] font-bold uppercase">{vendorId}</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white max-w-2xl leading-tight">
                            {description}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content: Chart or First Occurrence Alert */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Cost Development
                        </h3>

                        {isRecurring ? (
                            <ChartRenderer />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-blue-50 dark:bg-blue-900/10 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900/30">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                                </div>
                                <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">First Occurrence</h4>
                                <p className="text-blue-700 dark:text-blue-300 max-w-sm">
                                    This item has appeared significantly for the first time in the selected period. No historical trend data is available yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Item Details */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Latest Details
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Document Reference</div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-slate-400" />
                                        <span className="font-mono text-sm font-bold">{latestOccurrence?.DocumentId || '<missing>'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pl-6">
                                        <span className="text-xs text-slate-500">Line #{latestOccurrence?.LineId ?? '?'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-700" />

                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Latest Category</div>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-slate-400" />
                                    <span className={`font-medium ${!latestOccurrence?.Category ? 'text-slate-400 italic' : ''}`}>
                                        {latestOccurrence?.Category || '<empty>'}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-700" />

                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Cost Center</div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-slate-400" />
                                    <span className={`font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm ${!latestOccurrence?.CostCenter ? 'text-slate-400 italic' : ''}`}>
                                        {latestOccurrence?.CostCenter || '<empty>'}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-700" />

                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">G/L Account</div>
                                <div className={`font-mono text-sm ${!latestOccurrence?.GLAccount ? 'text-slate-400 italic' : ''}`}>
                                    {latestOccurrence?.GLAccount || '<empty>'}
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-700" />

                            <div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">First vs Latest</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <div className="text-slate-400">First Seen</div>
                                        <div className="font-medium">{firstOccurrence?.Period}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Latest</div>
                                        <div className="font-medium">{latestOccurrence?.Period}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-6">
                        <div className="text-emerald-800 dark:text-emerald-200 font-bold mb-1">Total Lifetime Cost</div>
                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                            €{history.reduce((acc: number, item: any) => acc + item.Amount, 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-emerald-600/70 mt-2 font-medium">
                            Across {history.length} occurrences
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed History Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-500" />
                        Transaction History
                    </h3>
                </div>
                <DataTable
                    data={[...history].reverse()} // Show newest first
                    columns={[
                        {
                            header: 'Date',
                            accessor: 'PostingDate',
                            render: (item: any) => (
                                <span className="font-mono text-sm">{item.PostingDate}</span>
                            )
                        },
                        {
                            header: 'Period',
                            accessor: 'Period',
                            render: (item: any) => (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-bold">{item.Period}</span>
                            )
                        },
                        {
                            header: 'Document ID',
                            accessor: 'DocumentId',
                            render: (item: any) => (
                                <span className="font-mono text-xs text-slate-500">{item.DocumentId}</span>
                            )
                        },
                        {
                            header: 'Amount',
                            accessor: 'Amount',
                            align: 'right',
                            render: (item: any) => (
                                <span className={`font-bold ${item.Amount < 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                    €{item.Amount.toLocaleString()}
                                </span>
                            )
                        }
                    ]}
                    onRowClick={(item) => setSelectedItem(item)}
                    emptyMessage="No history found"
                />
            </div>

            {/* Slide-over / Modal for details */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title="Transaction Details"
            >
                {selectedItem ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(selectedItem).map(([key, value]) => (
                            <div key={key} className="border-b border-slate-100 dark:border-slate-700 pb-2">
                                <dt className="text-[10px] font-bold uppercase text-slate-400 mb-1">{key}</dt>
                                <dd className="text-sm font-medium text-slate-900 dark:text-white break-all">
                                    {value === null || value === undefined || value === '' ? (
                                        <span className="text-slate-300 italic">&lt;empty&gt;</span>
                                    ) : (
                                        String(value)
                                    )}
                                </dd>
                            </div>
                        ))}
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};
