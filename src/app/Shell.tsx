import React, { useState } from 'react';
import { TileGrid } from './TileGrid';
import { LayoutDashboard, Settings, Database, Menu } from 'lucide-react';

export const Shell: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between md:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        IT Dashboard
                    </h1>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-500 hover:text-slate-700">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100%-80px)] justify-between">
                    <nav className="p-4 space-y-1">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200">
                            <LayoutDashboard className="w-5 h-5" />
                            Overview
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                            <Database className="w-5 h-5" />
                            Data Source
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                            <Settings className="w-5 h-5" />
                            Settings
                        </a>
                    </nav>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={async () => {
                                try {
                                    const { loadDemoData, initSchema, initDB } = await import('../lib/db');
                                    await initDB();
                                    await initSchema();
                                    await loadDemoData('small');
                                    window.dispatchEvent(new Event('db-updated'));
                                    // alert('Demo data loaded!'); // Removed alert to be less intrusive
                                } catch (e) {
                                    console.error(e);
                                    alert('Failed to load data');
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                        >
                            <Database className="w-4 h-4" />
                            Load Demo Data
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="p-1 text-slate-500 hover:text-slate-700">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">IT Dashboard</h1>
                </header>

                <div className="flex-1 overflow-auto">
                    <TileGrid />
                </div>
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};
