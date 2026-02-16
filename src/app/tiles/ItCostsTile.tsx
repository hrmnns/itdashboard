import React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { DashboardRepository } from '../../lib/repositories/DashboardRepository';
import { Wallet, Users, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { DashboardTile } from '../components/ui/DashboardTile';
import type { KpiRecord, ItCostsSummary } from '../../types';

export const ItCostsTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const { data, loading, error } = useAsync<{ summary: ItCostsSummary | null; trend: KpiRecord[] }>(
        async () => {
            const [summary, trend] = await Promise.all([
                DashboardRepository.getItCostsSummary(),
                DashboardRepository.getItCostsTrend()
            ]);
            return { summary, trend };
        },
        [],
        { cacheKey: 'it-costs-tile-combined', ttl: 5 * 60 * 1000 }
    );

    if (error) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/50 p-4 h-full flex items-center justify-center text-center">
                <p className="text-red-500 font-bold text-sm">Fehler beim Laden</p>
            </div>
        );
    }

    if (loading || !data) {
        return (
            <div className="flex flex-col h-full gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-[72px] rounded-xl" />
                    <Skeleton className="h-[72px] rounded-xl" />
                </div>
                <Skeleton className="flex-1 rounded-xl" />
            </div>
        );
    }

    const { summary, trend: trendData } = data;
    const displaySummary = summary || { total_amount: 0, active_vendors: 0, latest_date: 'N/A', latest_year: 0 };

    let trendPercent = 0;
    let isTrendUp = false;
    if (trendData && trendData.length >= 2) {
        const latest = trendData[0].value;
        const previous = trendData[1].value;
        if (previous > 0) {
            trendPercent = ((latest - previous) / previous) * 100;
            isTrendUp = latest > previous;
        }
    }

    return (
        <DashboardTile
            title="IT Kosten"
            icon={Wallet}
            iconColor="blue"
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            onClick={onClick}
        >
            <div className="flex flex-col gap-3">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                            <Wallet className="w-3.5 h-3.5" />
                            <span className="text-[9px] uppercase font-bold tracking-wider">Total</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            €{displaySummary.total_amount?.toLocaleString()}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-[9px] uppercase font-bold tracking-wider">Vendors</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            {displaySummary.active_vendors}
                        </div>
                    </div>
                </div>

                {/* Trend Indicator Section */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isTrendUp ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isTrendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4 rotate-90" />}
                        </div>
                        <div>
                            <div className={`text-base font-black ${isTrendUp ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {isTrendUp ? '+' : ''}{trendPercent.toFixed(1)}%
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">vs. Vorimonat</div>
                        </div>
                    </div>

                    {/* Sparkline Canvas */}
                    {trendData && trendData.length >= 2 && (
                        <div className="w-16 h-8">
                            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                {(() => {
                                    const points = [...trendData].reverse();
                                    const min = Math.min(...points.map(p => p.value));
                                    const max = Math.max(...points.map(p => p.value));
                                    const range = (max - min) || 1;
                                    const coords = points.map((p, i) => {
                                        const x = (i / (points.length - 1)) * 100;
                                        const y = 40 - ((p.value - min) / range) * 30 - 5;
                                        return `${x},${y}`;
                                    });
                                    return (
                                        <path
                                            d={`M ${coords.join(' L ')}`}
                                            fill="none"
                                            stroke={isTrendUp ? '#ef4444' : '#10b981'}
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    );
                                })()}
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </DashboardTile>
    );
};
