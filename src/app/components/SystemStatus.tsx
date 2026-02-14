import React, { useEffect, useState } from 'react';
import { Database, Activity, HardDrive, Cpu, Info, ChevronRight } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { Modal } from './Modal';

export const SystemStatus: React.FC = () => {
    const { data: countData, loading, refresh } = useQuery(`
        SELECT 
            (SELECT count(*) FROM kpi_data) as kpis,
            (SELECT count(*) FROM invoice_items) as invoices,
            (SELECT count(*) FROM operations_events) as events
    `);

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const version = __APP_VERSION__;
    const buildDate = __BUILD_DATE__;

    // Refresh every 30s to keep stats updated
    useEffect(() => {
        const interval = setInterval(refresh, 30000);
        return () => clearInterval(interval);
    }, [refresh]);

    const stats = countData && countData.length > 0 ? countData[0] : { kpis: 0, invoices: 0, events: 0 };
    const totalRecords = (stats.kpis || 0) + (stats.invoices || 0) + (stats.events || 0);

    return (
        <>
            <button
                className="w-full mt-2 text-left cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-800 p-2.5 rounded-xl transition-all group flex flex-col gap-1.5"
                onClick={() => setIsDetailsOpen(true)}
            >
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">System Status</span>
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400 font-medium">Online</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pl-6">
                    <div className="flex items-center gap-1.5">
                        <Database className="w-3 h-3" />
                        <span>{loading ? '...' : `${(totalRecords / 1000).toFixed(1)}k Records`}</span>
                    </div>
                    <span className="font-mono opacity-60">v{version}</span>
                </div>
            </button>

            <Modal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title="System Information"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-indigo-500" />
                                Application
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                    <span className="text-slate-500 dark:text-slate-400">Version</span>
                                    <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{version}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                    <span className="text-slate-500 dark:text-slate-400">Build Date</span>
                                    <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{buildDate}</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                    <span className="text-slate-500 dark:text-slate-400">Environment</span>
                                    <span className="font-mono font-medium text-blue-600 dark:text-blue-400 uppercase text-[10px] tracking-wider">{import.meta.env.MODE}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-emerald-500" />
                                Database (SQLite OPFS)
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                    <span className="text-slate-500 dark:text-slate-400">Total Records</span>
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{totalRecords.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pb-1 text-xs text-slate-500 dark:text-slate-400">
                                    <span>KPIs</span>
                                    <span className="font-mono text-blue-500/80 dark:text-blue-400/80">{stats.kpis?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pb-1 text-xs text-slate-500 dark:text-slate-400">
                                    <span>Invoices</span>
                                    <span className="font-mono text-blue-500/80 dark:text-blue-400/80">{stats.invoices?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pb-1 text-xs text-slate-500 dark:text-slate-400">
                                    <span>Events</span>
                                    <span className="font-mono text-blue-500/80 dark:text-blue-400/80">{stats.events?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                            <p className="font-semibold mb-1">Storage Info</p>
                            Your data is stored locally in your browser using <strong>Origin Private File System (OPFS)</strong>. This ensures high performance and persistence. The database is never sent to any cloud server.
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};
