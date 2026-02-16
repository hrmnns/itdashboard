import React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { DashboardRepository } from '../../lib/repositories/DashboardRepository';
import type { DbRow } from '../../types';
import { CheckCircle, AlertCircle, Clock, Activity, MessageSquare } from 'lucide-react';
import { DashboardTile } from '../components/ui/DashboardTile';

export const OperationsTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const { data, loading, error } = useAsync<DbRow[]>(
        () => DashboardRepository.getRecentOperations(),
        []
    );

    if (loading) return <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading...</div>;
    if (error) return <div className="p-4 text-center text-red-500 text-xs">Error: {error.message}</div>;

    return (
        <DashboardTile
            title="Performance"
            subtitle="Events"
            icon={Activity}
            iconColor="emerald"
            onClick={onClick}
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            footerLeft={
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    <MessageSquare className="w-3 h-3" />
                    {data?.length || 0} Recent
                </div>
            }
        >
            <div className="space-y-3">
                {data && data.length > 0 ? (
                    data.slice(0, 3).map((row: any, i: number) => (
                        <div key={i} className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">
                                {row.status === 'Resolved' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                                {row.status === 'Scheduled' && <Clock className="w-3.5 h-3.5 text-blue-500" />}
                                {row.status === 'Incident' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{row.event_name}</div>
                                <div className="text-[9px] text-slate-400 font-medium">{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-[10px] text-slate-400 text-center py-4">Keine aktuellen Ereignisse.</p>
                )}
            </div>
        </DashboardTile>
    );
};
