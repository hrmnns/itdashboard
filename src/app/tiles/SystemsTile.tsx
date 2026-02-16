import React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { SystemRepository } from '../../lib/repositories/SystemRepository';
import type { SystemRecord } from '../../types';
import { CheckCircle2, XCircle, HelpCircle, Globe2, ShieldCheck, Cpu, Star, Server } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { DashboardTile } from '../components/ui/DashboardTile';

export const SystemsTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const { data: systems, loading, error } = useAsync<SystemRecord[]>(
        () => SystemRepository.getFavorites(),
        [],
        { cacheKey: 'tile-systems-favorites', ttl: 10 * 60 * 1000 }
    );

    if (loading && !systems) return (
        <div className="flex flex-col h-full gap-2 p-1">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
        </div>
    );

    if (error) return <div className="p-4 text-center text-red-500 text-xs">Error: {error.message}</div>;

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'online': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'offline': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'business': return <ShieldCheck className="w-3.5 h-3.5" />;
            case 'it': return <Cpu className="w-3.5 h-3.5" />;
            case 'sales': return <Globe2 className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    return (
        <DashboardTile
            title="Systeme & Health"
            subtitle="Favoriten"
            icon={Server}
            iconColor="slate"
            onClick={onClick}
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            footerLeft={
                <div className="flex items-center gap-1.5 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                    Status
                    <div className="flex gap-1 ml-1">
                        {systems?.slice(0, 4).map((s: any) => (
                            <div key={s.id} className={`w-2 h-2 rounded-full border border-white dark:border-slate-950 ${s.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        ))}
                    </div>
                </div>
            }
        >
            <div className="space-y-1">
                {systems && systems.length > 0 ? (
                    systems.slice(0, 3).map((system: any) => (
                        <div
                            key={system.id}
                            className="flex items-center justify-between py-1"
                        >
                            <div className="flex items-center gap-2">
                                <div className="shrink-0">
                                    {getStatusIcon(system.status)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[12px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 truncate">
                                        {system.name}
                                        {system.category && (
                                            <span className="text-[8px] font-medium text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                                                {getCategoryIcon(system.category)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                        <Star className="w-6 h-6 mb-1 opacity-20" />
                        <p className="text-[9px] font-bold uppercase tracking-widest">No Favorites</p>
                    </div>
                )}
            </div>
        </DashboardTile>
    );
};
