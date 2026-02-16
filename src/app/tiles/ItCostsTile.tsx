import React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { DashboardRepository } from '../../lib/repositories/DashboardRepository';
import { Wallet, Users, Calendar, TrendingUp } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { DashboardTile } from '../components/ui/DashboardTile';
import type { KpiRecord } from '../../types';

export const ItCostsTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const { data, loading, error } = useAsync<{
        metrics: { totalAmount: number; vendorCount: number; avgMonthlySpend: number; monthCount: number };
        trend: KpiRecord[];
    }>(
        async () => {
            const [metrics, trend] = await Promise.all([
                DashboardRepository.getItCostsMetrics(),
                DashboardRepository.getItCostsTrend(2)
            ]);
            return { metrics, trend };
        },
        [],
        { cacheKey: 'it-costs-tile-stable', ttl: 5 * 60 * 1000 }
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
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-3 p-1">
                <Skeleton className="rounded-xl" />
                <Skeleton className="rounded-xl" />
                <Skeleton className="rounded-xl" />
                <Skeleton className="rounded-xl" />
            </div>
        );
    }

    const { metrics } = data;

    const formatCurrency = (val: number, compact = false) =>
        new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
            notation: compact ? 'compact' : 'standard'
        }).format(val);

    return (
        <DashboardTile
            title="IT Kosten"
            icon={Wallet}
            iconColor="blue"
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            onClick={onClick}
        >
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-4">
                {/* Top Left: Total Spend */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                        <Wallet className="w-3 h-3" />
                        <span>Gesamt YTD</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                        {formatCurrency(metrics.totalAmount, true)}
                    </div>
                </div>

                {/* Top Right: Monthly Average */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Ø Monat</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                        {formatCurrency(metrics.avgMonthlySpend, true)}
                    </div>
                </div>

                {/* Bottom Left: Vendors */}
                <div className="flex flex-col justify-center border-t border-slate-100 dark:border-slate-800/50 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        <Users className="w-3 h-3" />
                        <span>Lieferanten</span>
                    </div>
                    <div className="text-xl font-black text-slate-700 dark:text-slate-300 leading-none">
                        {metrics.vendorCount}
                    </div>
                </div>

                {/* Bottom Right: Months Sample */}
                <div className="flex flex-col justify-center border-t border-slate-100 dark:border-slate-800/50 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>Zeitraum</span>
                    </div>
                    <div className="text-xl font-black text-slate-700 dark:text-slate-300 leading-none">
                        {metrics.monthCount} Monate
                    </div>
                </div>
            </div>
        </DashboardTile>
    );
};
