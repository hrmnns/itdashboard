import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { TILES } from '../config/tiles';

export interface LayoutContext {
    visibleTileIds: string[];
    setVisibleTileIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    tileOrder: string[];
    setTileOrder: (order: string[] | ((prev: string[]) => string[])) => void;
    theme: 'light' | 'dark' | 'system';
    setTheme: (t: 'light' | 'dark' | 'system') => void;
}

export const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage<boolean>('isSidebarCollapsed', false);

    const { theme, setTheme } = useTheme();

    // Tile customization
    const [visibleTileIds, setVisibleTileIds] = useLocalStorage<string[]>('visibleTileIds', TILES.map(t => t.id));
    const [tileOrder, setTileOrder] = useLocalStorage<string[]>('tileOrder', TILES.map(t => t.id));

    // Sync state if new tiles are added to the configuration
    useEffect(() => {
        const allTileIds = TILES.map(t => t.id);
        const newTiles = allTileIds.filter(id => !tileOrder.includes(id));

        if (newTiles.length > 0) {
            setTileOrder(prev => [...prev, ...newTiles]);
            setVisibleTileIds(prev => [...new Set([...prev, ...newTiles])]);
        }
    }, [tileOrder, setTileOrder, visibleTileIds, setVisibleTileIds]);

    return (
        <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
            <Sidebar
                currentView={'dashboard'}
                isCollapsed={isSidebarCollapsed}
                sidebarOpen={sidebarOpen}
                onNavigate={() => { }}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onCloseMobile={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="p-1 text-slate-500 hover:text-slate-700">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">IT Dashboard</h1>
                </header>

                <div className="flex-1 min-h-0 overflow-hidden relative">
                    <Outlet context={{
                        visibleTileIds,
                        setVisibleTileIds,
                        tileOrder,
                        setTileOrder,
                        theme,
                        setTheme,
                    } satisfies LayoutContext} />
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
