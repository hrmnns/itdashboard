import React from 'react';
import { useQuery } from '../../hooks/useQuery';
import { runQuery } from '../../lib/db';
import {
    Plus, Save, RefreshCw, HelpCircle, CheckCircle2, XCircle,
    Globe2, ShieldCheck, Cpu, ExternalLink, Star, ArrowLeft, Search, Filter,
    ArrowUp, ArrowDown
} from 'lucide-react';
import { Modal } from '../components/Modal';

interface SystemsManagementViewProps {
    onBack: () => void;
}

export const SystemsManagementView: React.FC<SystemsManagementViewProps> = ({ onBack }) => {
    const { data: systems, loading, error, refresh } = useQuery('SELECT * FROM systems ORDER BY sort_order ASC, name ASC');
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isScanning, setIsScanning] = React.useState(false);
    const [scanningId, setScanningId] = React.useState<number | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('All');
    const [newSystem, setNewSystem] = React.useState({ name: '', url: '', category: 'IT' });

    const filteredSystems = systems?.filter((s: any) => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleCheckHealth = async () => {
        if (!systems || systems.length === 0) return;
        setIsScanning(true);

        for (const system of systems) {
            if (!system.url) continue;
            setScanningId(system.id);

            const status = await new Promise<string>((resolve) => {
                const img = new Image();
                const timer = setTimeout(() => {
                    img.src = "";
                    resolve('offline');
                }, 6000);

                img.onload = () => {
                    clearTimeout(timer);
                    resolve('online');
                };

                img.onerror = () => {
                    clearTimeout(timer);
                    resolve('online');
                };

                const probeUrl = new URL('/favicon.ico', system.url).href;
                img.src = `${probeUrl}?t=${Date.now()}`;
            });

            await runQuery('UPDATE systems SET status = ? WHERE id = ?', [status, system.id]);
        }

        setScanningId(null);
        setIsScanning(false);
        refresh();
    };

    const handleMove = async (id: number, currentOrder: number, direction: 'up' | 'down') => {
        if (!systems) return;

        const sorted = [...systems].sort((a, b) => a.sort_order - b.sort_order);
        const currentIndex = sorted.findIndex(s => s.id === id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= sorted.length) return;

        const targetSystem = sorted[targetIndex];

        // Swap sort_order
        await runQuery('UPDATE systems SET sort_order = ? WHERE id = ?', [targetSystem.sort_order, id]);
        await runQuery('UPDATE systems SET sort_order = ? WHERE id = ?', [currentOrder, targetSystem.id]);

        refresh();
    };

    const handleToggleFavorite = async (id: number, current: number) => {
        await runQuery('UPDATE systems SET is_favorite = ? WHERE id = ?', [current ? 0 : 1, id]);
        refresh();
    };

    const handleAddSystem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSystem.name) return;

        setIsSaving(true);
        try {
            const nextOrder = systems && systems.length > 0
                ? Math.max(...systems.map((s: any) => s.sort_order)) + 1
                : 0;

            await runQuery(
                'INSERT INTO systems (name, url, category, status, is_favorite, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
                [newSystem.name, newSystem.url, newSystem.category, 'unknown', 0, nextOrder]
            );
            await refresh();
            setIsAddModalOpen(false);
            setNewSystem({ name: '', url: '', category: 'IT' });
        } catch (err) {
            console.error(err);
            alert('Failed to add system');
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusIcon = (status: string, isChecking: boolean) => {
        if (isChecking) return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
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
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Systems Management
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Configure and monitor your IT infrastructure and core business applications.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCheckHealth}
                        disabled={isScanning}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
                        {isScanning ? 'Scanning Infrastructure...' : 'Scan All Systems'}
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        <Plus className="w-5 h-5" />
                        Add New System
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search systems by name..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-6 pr-10 focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-bold"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="IT">IT Infrastructure</option>
                        <option value="Business">Business Process</option>
                        <option value="Sales">Sales & CRM</option>
                    </select>
                </div>
            </div>

            {/* Systems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center animate-pulse text-slate-400 font-bold">Loading Infrastructure Data...</div>
                ) : filteredSystems?.map((system: any) => (
                    <div
                        key={system.id}
                        className={`group relative p-6 bg-white dark:bg-slate-900 rounded-[32px] border transition-all duration-300 ${scanningId === system.id ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl'}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm">
                                {getStatusIcon(system.status, scanningId === system.id)}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleMove(system.id, system.sort_order, 'up')}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-600 transition-all"
                                        title="Move Up"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleMove(system.id, system.sort_order, 'down')}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-600 transition-all"
                                        title="Move Down"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleToggleFavorite(system.id, system.is_favorite)}
                                    className={`p-2 rounded-xl transition-all ${system.is_favorite ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300 hover:text-slate-400'}`}
                                    title={system.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <Star className={`w-5 h-5 ${system.is_favorite ? 'fill-current' : ''}`} />
                                </button>
                                {system.url && (
                                    <a
                                        href={system.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 rounded-xl transition-all"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {system.name}
                                </h3>
                                {system.category && (
                                    <span className="text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg uppercase flex items-center gap-1.5">
                                        {getCategoryIcon(system.category)}
                                        {system.category}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-mono truncate">{system.url || 'No URL configured'}</p>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${system.status === 'online' ? 'bg-emerald-50 text-emerald-600' : system.status === 'offline' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                {scanningId === system.id ? 'VERIFYING...' : (system.status || 'UNKNOWN')}
                            </div>
                            {system.status === 'online' && (
                                <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    LIVE
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New System">
                <form onSubmit={handleAddSystem} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">System Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. SAP Production, HR Portal"
                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all text-slate-900 dark:text-white font-bold"
                            value={newSystem.name}
                            onChange={e => setNewSystem({ ...newSystem, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">System URL</label>
                        <input
                            type="url"
                            placeholder="https://portal.company.com"
                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all text-slate-900 dark:text-white font-bold"
                            value={newSystem.url}
                            onChange={e => setNewSystem({ ...newSystem, url: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 italic">URLs allow for automated health checks via browser probing.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select
                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer"
                            value={newSystem.category}
                            onChange={e => setNewSystem({ ...newSystem, category: e.target.value })}
                        >
                            <option value="IT">IT Infrastructure</option>
                            <option value="Business">Business Process</option>
                            <option value="Sales">Sales & CRM</option>
                        </select>
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3">
                        {isSaving ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                Register System
                            </>
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
};
