import React, { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { TrendingUp, AlertCircle, Info, Tag, Layers, Receipt } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ViewHeader } from '../components/ui/ViewHeader';
import { SummaryCard } from '../components/ui/SummaryCard';

interface ItCostsItemHistoryViewProps {
    item: any;
    onBack: () => void;
}

export const ItCostsItemHistoryView: React.FC<ItCostsItemHistoryViewProps> = ({ item: referenceItem, onBack }) => {
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Retrieve custom key fields
    const keyFields = useMemo(() => {
        try {
            const savedMappings = JSON.parse(localStorage.getItem('excel_mappings_v2') || '{}');
            const firstMappingWithKeys = Object.values(savedMappings).find((m: any) => m.__keyFields);
            return (firstMappingWithKeys as any)?.__keyFields || ['DocumentId', 'LineId'];
        } catch (e) {
            return ['DocumentId', 'LineId'];
        }
    }, []);

    // Build dynamic SQL with all key fields to track THIS specific item identity over time
    const sql = useMemo(() => {
        const conditions: string[] = [];
        const params: any[] = [];

        keyFields.forEach((field: string) => {
            if (referenceItem[field] !== undefined && referenceItem[field] !== null) {
                conditions.push(`${field} = ?`);
                params.push(referenceItem[field]);
            } else {
                conditions.push(`${field} IS NULL`);
            }
        });

        return {
            query: `SELECT * FROM invoice_items WHERE ${conditions.join(' AND ')} ORDER BY Period ASC, PostingDate ASC`,
            params
        };
    }, [referenceItem, keyFields]);

    const { data, loading, error } = useQuery(sql.query, sql.params);

    const history = data || [];

    // 1. Detect ambiguity (multiple records per period for the same primary key)
    const ambiguityMap = useMemo(() => {
        const counts: Record<string, number> = {};
        history.forEach((i: any) => counts[i.Period] = (counts[i.Period] || 0) + 1);
        return counts;
    }, [history]);

    const hasAmbiguity = Object.values(ambiguityMap).some(count => count > 1);

    // 2. Separate "Past", "Current", and "Future" records
    const referencePeriod = referenceItem.Period;
    const records = useMemo(() => {
        return history.map((i: any) => ({
            ...i,
            isFuture: i.Period > referencePeriod,
            isCurrent: i.Period === referencePeriod,
            isPast: i.Period < referencePeriod,
            isAmbiguousInPeriod: ambiguityMap[i.Period] > 1
        }));
    }, [history, referencePeriod, ambiguityMap]);



    // 3. Advanced Metrics (Avg, Stability, Volatility)
    const metrics = useMemo(() => {
        if (history.length === 0) return null;
        const total = history.reduce((acc: number, i: any) => acc + i.Amount, 0);
        const avg = total / history.length;

        // Simple variance/stability score
        const sqDiffs = history.map((i: any) => Math.pow(i.Amount - avg, 2));
        const variance = sqDiffs.reduce((a, b) => a + b, 0) / history.length;
        const stdDev = Math.sqrt(variance);
        const volatility = avg > 0 ? (stdDev / avg) * 100 : 0; // Coefficient of variation

        return {
            total,
            avg,
            volatility,
            isStable: volatility < 10,
            isVolatile: volatility > 40
        };
    }, [history]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    const latestOccurrence = records[records.length - 1];

    // Timeline Component
    const TimelineItem = ({ record, previousRecord }: { record: any, previousRecord?: any }) => {
        const delta = previousRecord ? record.Amount - previousRecord.Amount : 0;
        const deltaPercent = previousRecord && previousRecord.Amount !== 0 ? (delta / Math.abs(previousRecord.Amount)) * 100 : 0;

        return (
            <div className={`relative pl-8 pb-8 last:pb-0 border-l-2 ${record.isFuture ? 'border-dashed border-indigo-200 dark:border-indigo-900/50' : 'border-slate-200 dark:border-slate-800'}`}>
                {/* Dot */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${record.isCurrent ? 'border-blue-500 scale-125 z-10' :
                    record.isFuture ? 'border-indigo-400' : 'border-slate-400'
                    }`} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-black uppercase tracking-wider ${record.isCurrent ? 'text-blue-600' :
                                record.isFuture ? 'text-indigo-500' : 'text-slate-500'
                                }`}>
                                {record.Period}
                                {record.isCurrent && " (Selected)"}
                                {record.isFuture && " (Future Insight 🔮)"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Receipt className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-xs text-slate-400">{record.DocumentId}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                            €{record.Amount.toLocaleString()}
                        </div>
                        {previousRecord && (
                            <div className={`text-[10px] font-bold flex items-center gap-1 ${delta > 0 ? 'text-red-500' : delta < 0 ? 'text-emerald-500' : 'text-slate-400'
                                }`}>
                                {delta !== 0 ? (
                                    <>
                                        {delta > 0 ? '+' : ''}{delta.toLocaleString()}€
                                        ({delta > 0 ? '+' : ''}{deltaPercent.toFixed(1)}%)
                                    </>
                                ) : "Unchanged"}
                            </div>
                        )}
                        {record.isAmbiguousInPeriod && (
                            <span className="mt-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded">
                                Duplicate Key Issue
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header with Navigation */}
            <ViewHeader
                title={referenceItem.Description || 'Item Record'}
                subtitle={`${referenceItem.VendorName || referenceItem.VendorId || 'Global Vendor'}`}
                onBack={onBack}
                badges={
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-sm">Lifetime Analysis</span>
                }
            />

            {/* Hero Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Lifetime Total"
                    value={`€${metrics?.total.toLocaleString()}`}
                    icon={TrendingUp}
                    color="text-blue-500"
                    subtext="Sum of all tracked entries"
                    className="overflow-hidden"
                />

                <SummaryCard
                    title="Monthly Average"
                    value={`€${Math.round(metrics?.avg || 0).toLocaleString()}`}
                    icon={TrendingUp} // Or create a new "Avg" icon
                    color="text-slate-900 dark:text-white"
                    trendValue={referenceItem.Amount > (metrics?.avg || 0) ? `+${Math.round(referenceItem.Amount - (metrics?.avg || 0))}€` : 'Below Avg'}
                    trend={referenceItem.Amount > (metrics?.avg || 0) ? 'up' : 'down'}
                    trendLabel="vs Average"
                />

                <SummaryCard
                    title="Stability Check"
                    value={metrics?.isStable ? 'Stable' : metrics?.isVolatile ? 'Volatile' : 'Normal'}
                    icon={metrics?.isVolatile ? AlertCircle : Info}
                    color={metrics?.isStable ? 'text-emerald-500' : metrics?.isVolatile ? 'text-red-500' : 'text-amber-500'}
                    subtext={`Variation: ${metrics?.volatility.toFixed(1)}%`}
                    trendLabel={metrics?.isVolatile ? 'High Risk' : ''}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Side: Timeline / Journal */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-500" />
                                Growth Timeline
                            </h3>
                        </div>

                        <div className="pl-4">
                            {records.sort((a, b) => b.Period.localeCompare(a.Period)).map((rec, idx, arr) => (
                                <TimelineItem
                                    key={`${rec.Period}-${rec.DocumentId}-${rec.LineId || idx}-${idx}`}
                                    record={rec}
                                    previousRecord={arr[idx + 1]}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Properties Grid */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Technical Identity
                        </h3>

                        <div className="grid grid-cols-1 gap-5 relative z-10">
                            {[
                                { label: 'Cost Center', value: latestOccurrence?.CostCenter, icon: Layers },
                                { label: 'G/L Account', value: latestOccurrence?.GLAccount, icon: Tag },
                                { label: 'Category', value: latestOccurrence?.Category, icon: Tag },
                                { label: 'Latest Document', value: latestOccurrence?.DocumentId, icon: Receipt },
                                { label: 'Line Item ID', value: latestOccurrence?.LineId, icon: Layers },
                            ].map((prop, i) => (
                                <div key={i} className="group">
                                    <div className="text-[9px] font-black uppercase text-slate-500 tracking-tighter mb-1">{prop.label}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400 group-hover:text-blue-400 transition-colors">
                                            <prop.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-sm font-mono break-all ${!prop.value ? 'text-slate-600 italic' : 'text-slate-200'}`}>
                                            {prop.value || '<Not Provided>'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {hasAmbiguity && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-900/30 rounded-2xl p-6">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-xs uppercase mb-2">
                                <AlertCircle className="w-4 h-4" />
                                Identity Conflict
                            </div>
                            <p className="text-xs text-amber-800 dark:text-amber-200/70 leading-relaxed mb-4">
                                This item has multiple records in some periods. This usually happens when the "Primary Keys" are not set correctly during import.
                            </p>
                            <button
                                onClick={() => setSelectedItem(referenceItem)}
                                className="w-full py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors"
                            >
                                Compare Conflicting Rows
                            </button>
                        </div>
                    )}
                </div>
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
