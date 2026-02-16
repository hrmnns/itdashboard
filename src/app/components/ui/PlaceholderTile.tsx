import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PlaceholderTileProps {
    id: string;
}

/**
 * A lightweight droppable component that represents an empty grid cell.
 * Highlights with a conspicuous 'Drop-Ready' state when a tile is dragged over it.
 */
export const PlaceholderTile: React.FC<PlaceholderTileProps> = ({ id }) => {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "group relative w-full h-full rounded-2xl border-2 border-dashed transition-all duration-300",
                isOver
                    ? "border-blue-500 bg-blue-50/80 dark:bg-blue-900/20 scale-[1.02] z-10 shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-4 ring-blue-500/20"
                    : "border-slate-200/40 dark:border-slate-800/40 hover:border-slate-300/60 dark:hover:border-slate-700/60"
            )}
        >
            <div className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                isOver ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            )}>
                <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-transform duration-500",
                    isOver ? "bg-blue-500 scale-150 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
                )} />
            </div>
        </div>
    );
};
