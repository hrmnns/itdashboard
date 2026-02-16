import React, { useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { AnomalyRepository } from '../../lib/repositories/AnomalyRepository';
import { ShieldAlert, TrendingUp, Sparkles, LayoutList } from 'lucide-react';
import type { Anomaly } from '../../types';
import { Skeleton } from '../components/ui/Skeleton';
import { DashboardTile } from '../components/ui/DashboardTile';

export const AnomalyRadarTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const { data: anomalies, loading } = useAsync<Anomaly[]>(
        () => AnomalyRepository.getTopRisks(3),
        [],
        { cacheKey: 'tile-anomaly-radar', ttl: 5 * 60 * 1000 }
    );

    const topRisks = useMemo(() => anomalies || [], [anomalies]);

    if (loading && !anomalies) return (
        <div className="flex flex-col h-full gap-3 p-1">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
        </div>
    );

    return (
        <DashboardTile
            title="Anomaly Radar"
            icon={ShieldAlert}
            iconColor="rose"
            onClick={onClick}
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            footerLeft={
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                    <LayoutList className="w-3 h-3" />
                    {topRisks.length} Aktive Risiken
                </div>
            }
        >
            <div className="space-y-3">
                {topRisks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                        <Sparkles className="w-8 h-8 text-emerald-400 mb-2 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">No risks detected</p>
                    </div>
                ) : (
                    topRisks.map((risk, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 py-1"
                        >
                            <div className={`shrink-0 text-xs font-black w-6 text-center ${risk.RiskScore >= 80 ? 'text-red-500' : risk.RiskScore >= 50 ? 'text-orange-500' : 'text-blue-500'}`}>
                                {risk.RiskScore}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider truncate">
                                        {risk.VendorName}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400">
                                        {risk.Period}
                                    </span>
                                </div>
                                <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                    {risk.Description}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">
                                        €{risk.Amount.toLocaleString()}
                                    </span>
                                    {risk.AnomalyType === 'Cost Drift' && (
                                        <div className="flex items-center text-[9px] font-bold text-red-500">
                                            <TrendingUp className="w-3 h-3 mr-0.5" />
                                            +€{(risk.Amount - (risk.PrevAmount || 0)).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardTile>
    );
};
