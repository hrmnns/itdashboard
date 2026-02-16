import React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { DashboardRepository } from '../../lib/repositories/DashboardRepository';
import { Wallet, TrendingUp, Calendar } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { DashboardTile } from '../components/ui/DashboardTile';
import type { KpiRecord } from '../../types';

export const ItCostsTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const { data, loading, error } = useAsync<{
        metrics: { totalAmount: number; vendorCount: number; avgMonthlySpend: number; monthCount: number };
        trend: KpiRecord[];
    }>(
        async () => {
            const metrics = await DashboardRepository.getItCostsMetrics();
            return { metrics, trend: [] };
        },
        [],
        { cacheKey: 'it-costs-tile-square', ttl: 5 * 60 * 1000 }
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
            <div className="flex flex-col h-full gap-3 p-1">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
            </div>
        );
    }

    const { metrics } = data;

    const formatCurrency = (val: number, compact = true) =>
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
            backgroundIcon={Wallet}
        >
            <div className="flex flex-col h-full items-center justify-around py-1">
                {/* Main KPI: Total Spend */}
                <div className="text-center group-hover:scale-105 transition-transform duration-500">
                    <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Gesamt YTD</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                        {formatCurrency(metrics.totalAmount)}
                    </div>
                </div>

                {/* Secondary KPI: Monthly Average */}
                <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/50 text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Ø Monat</span>
                    </div>
                    <div className="text-2xl font-black text-slate-700 dark:text-slate-300 tabular-nums leading-none">
                        {formatCurrency(metrics.avgMonthlySpend, false)}
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        <Calendar className="w-2.5 h-2.5" />
                        Basis: {metrics.monthCount} Monate
                    </div>
                </div>
            </div>
        </DashboardTile>
    );
};
