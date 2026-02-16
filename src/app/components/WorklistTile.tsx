import React, { useState, useEffect } from 'react';
import { Bookmark, ListChecks } from 'lucide-react';
import { getWorklistCount } from '../../lib/db';
import { DashboardTile } from './ui/DashboardTile';

interface WorklistTileProps {
    onClick?: () => void;
    onRemove?: () => void;
    dragHandleProps?: any;
}

export const WorklistTile: React.FC<WorklistTileProps> = ({ onClick, onRemove, dragHandleProps }) => {
    const [count, setCount] = useState<number | null>(null);

    const updateCount = async () => {
        const c = await getWorklistCount();
        setCount(c);
    };

    useEffect(() => {
        updateCount();
        window.addEventListener('db-updated', updateCount);
        return () => window.removeEventListener('db-updated', updateCount);
    }, []);

    return (
        <DashboardTile
            title="Arbeitsvorrat"
            icon={Bookmark}
            iconColor="amber"
            onClick={onClick}
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            footerLeft={
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <ListChecks className="w-3 h-3" />
                    Review Tasks
                </div>
            }
        >
            <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {count === null ? '...' : count}
                </span>
                <span className="text-xs font-bold text-slate-400">OFFEN</span>
            </div>
        </DashboardTile>
    );
};
