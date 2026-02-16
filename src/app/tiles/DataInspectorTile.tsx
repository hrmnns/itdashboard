import React, { useState, useEffect } from 'react';
import { Database, Search, Layers, Hash } from 'lucide-react';
import { SystemRepository } from '../../lib/repositories/SystemRepository';
import { DashboardTile } from '../components/ui/DashboardTile';
import { Skeleton } from '../components/ui/Skeleton';

export const DataInspectorTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const [stats, setStats] = useState<{ tables: number; records: number }>({ tables: 0, records: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const s = await SystemRepository.getDatabaseStats();
                setStats(s);
            } catch (err) {
                console.error('Failed to fetch DB stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <DashboardTile
            title="Database Inspector"
            subtitle="Struktur & Daten"
            icon={Database}
            iconColor="indigo"
            onClick={onClick}
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            backgroundIcon={Database}
            footerLeft={
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    <Search className="w-3 h-3" />
                    Visual Explorer
                </div>
            }
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Layers className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Tabellen</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        {loading ? <Skeleton className="h-7 w-16" /> : stats.tables}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                        <Hash className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Records</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        {loading ? <Skeleton className="h-7 w-24" /> : stats.records.toLocaleString()}
                    </div>
                </div>
            </div>
        </DashboardTile>
    );
};
