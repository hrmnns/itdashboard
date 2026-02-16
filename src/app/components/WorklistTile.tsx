import React, { useState, useEffect } from 'react';
import { Bookmark, ListChecks, ArrowRight } from 'lucide-react';
import { getWorklistCount } from '../../lib/db';

interface WorklistTileProps {
    onClick?: () => void;
}

export const WorklistTile: React.FC<WorklistTileProps> = ({ onClick }) => {
    const [count, setCount] = useState<number | null>(null);

    const updateCount = async () => {
        const c = await getWorklistCount();
        setCount(c);
    };

    useEffect(() => {
        updateCount();
        // Listen for DB updates to refresh count
        window.addEventListener('db-updated', updateCount);
        return () => window.removeEventListener('db-updated', updateCount);
    }, []);

    return (
        <div
            onClick={onClick}
            className="group relative h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform">
                        <Bookmark className="w-5 h-5 fill-current" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Arbeitsvorrat
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                            {count === null ? '...' : count}
                        </span>
                        <span className="text-xs font-bold text-slate-400">OFFEN</span>
                    </div>
                </div>
            </div>

            <div className="relative mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 py-1 px-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <ListChecks className="w-3 h-3" />
                    Review Tasks
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
};
