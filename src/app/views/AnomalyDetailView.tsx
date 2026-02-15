import React, { useMemo } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { ViewHeader } from '../components/ui/ViewHeader';
import { ShieldAlert, TrendingUp, AlertTriangle, PlusCircle, FileText, Calendar, Wallet } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface AnomalyDetailViewProps {
    anomalyId: string; // DocumentId
    period: string;
    onBack: () => void;
    onOpenInvoice: () => void;
}

export const AnomalyDetailView: React.FC<AnomalyDetailViewProps> = ({ anomalyId, period, onBack, onOpenInvoice }) => {
    // 1. Fetch the specific anomaly details
    const { data: anomalies, loading } = useQuery(`
        SELECT * FROM view_anomalies 
        WHERE DocumentId = ? AND Period = ?
    `, [anomalyId, period]);

    const anomaly = anomalies && anomalies.length > 0 ? anomalies[0] : null;

    // 2. Fetch Report / History for this item (Context)
    // We match by VendorName and Description to find the same "Item" over time
    const { data: historyData } = useQuery(`
        SELECT Period, Amount, PostingDate 
        FROM invoice_items 
        WHERE VendorName = ? AND Description = ? 
        ORDER BY Period ASC
    `, [anomaly?.VendorName || '', anomaly?.Description || '']);

    const history = useMemo(() => historyData || [], [historyData]);

    // 3. Reasoning Engine
    const reasoning = useMemo(() => {
        if (!anomaly) return [];
        const reasons = [];

        if (anomaly.ScoreDrift > 0) {
            const diff = anomaly.Amount - (anomaly.PrevAmount || 0);
            const percent = anomaly.PrevAmount ? Math.round((diff / anomaly.PrevAmount) * 100) : 100;
            reasons.push({
                icon: TrendingUp,
                color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
                title: 'Massive Cost Drift',
                description: `Costs increased by ${percent}% (+€${diff.toLocaleString()}) compared to previous period.`,
                action: 'Check if this is a planned price increase or a billing error. Compare with contract terms.'
            });
        }

        if (anomaly.ScoreNew > 0) {
            reasons.push({
                icon: PlusCircle,
                color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
                title: 'New Position',
                description: 'This Item appeared for the first time. Verify contract coverage.',
                action: 'Confirm if this new service was authorized. Check for duplicate services under different names.'
            });
        }

        if (anomaly.ScoreQuality > 0) {
            reasons.push({
                icon: AlertTriangle,
                color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
                title: 'Data Quality Issue',
                description: 'Synthetic Document ID detected. Source data might be incomplete or manually booked.',
                action: 'Trace back to the original invoice. Ensure the source system provides a valid Document ID.'
            });
        }

        if (reasons.length === 0) {
            reasons.push({
                icon: ShieldAlert,
                color: 'text-slate-500 bg-slate-50 dark:bg-slate-900/20',
                title: 'High Value Item',
                description: 'This item has a significant impact on the total budget.',
                action: 'Review for potential consolidation or savings.'
            });
        }

        return reasons;
    }, [anomaly]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!anomaly) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-slate-700">Anomaly Not Found</h2>
            <button onClick={onBack} className="text-blue-500 hover:underline mt-4">Go Back</button>
        </div>
    );

    return (
        <div className="p-6 md:p-8 space-y-8 h-full flex flex-col max-w-5xl mx-auto">
            <ViewHeader
                title="Anomaly Investigation"
                subtitle={`Case #${anomaly.DocumentId}`}
                onBack={onBack}
                badges={
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase ${anomaly.RiskScore >= 80 ? 'bg-red-600' :
                        anomaly.RiskScore >= 50 ? 'bg-orange-600' : 'bg-blue-600'
                        }`}>
                        Risk Score: {anomaly.RiskScore}
                    </span>
                }
            />

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Item Details</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2" title={anomaly.Description}>
                            {anomaly.Description}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                            <Wallet className="w-4 h-4" />
                            {anomaly.VendorName}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-end">
                        <div className="text-xs text-slate-400">{anomaly.Period}</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">€{anomaly.Amount.toLocaleString()}</div>
                    </div>
                </div>

                {/* Reasoning Section - Automated Insights */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-blue-500" />
                        AI Reasoning Engine
                    </div>
                    <div className="space-y-3">
                        {reasoning.map((reason, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                                <div className={`p-2 rounded-lg ${reason.color}`}>
                                    <reason.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{reason.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                        {reason.description}
                                    </div>
                                    <div className="mt-2 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                                        Suggested Action: {reason.action}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Historical Context Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm h-[500px] relative">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Historical Context
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Use this chart to check if this is a one-time spike or a recurring trend.
                            It shows the cost history of this specific item (same Vendor & Description).
                        </p>
                    </div>
                    <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Past 6 Months</div>
                </div>
                <div className="w-full h-full pb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorAmountAnomaly" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="Period"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                tickFormatter={(val: number) => `€${val}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => [`€${value.toLocaleString()}`, 'Amount']}
                            />
                            <Area
                                type="monotone"
                                dataKey="Amount"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorAmountAnomaly)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Mark as Safe
                </button>
                <button
                    onClick={onOpenInvoice}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Open Invoice
                </button>
            </div>
        </div>
    );
};
