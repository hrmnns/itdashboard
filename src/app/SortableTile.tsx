import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import type { TileSize } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const getSizeClass = (size: TileSize) => {
    switch (size) {
        case 'large': return 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 min-h-[400px]';
        case 'medium': return 'col-span-1 md:col-span-2 min-h-[300px]';
        case 'small': return 'col-span-1 min-h-[200px]';
        default: return 'col-span-1';
    }
};

import { X } from 'lucide-react';

interface SortableTileProps {
    id: string;
    title: string;
    size: TileSize;
    targetView?: string;
    onRemove?: (id: string) => void;
    children: React.ReactNode;
}

export const SortableTile: React.FC<SortableTileProps> = ({
    id, title, size, targetView, onRemove, children
}) => {
    const navigate = useNavigate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={cn(getSizeClass(size), "relative group/tile")}>
            <Card
                title={title}
                className={cn(
                    "h-full touch-none",
                    targetView && "cursor-pointer border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                )}
                {...attributes}
                {...listeners}
                onClick={() => targetView && navigate(targetView)}
            >
                <div className="h-full">
                    {children}
                </div>
            </Card>

            {/* Close Button */}
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag/navigation
                        onRemove(id);
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/tile:opacity-100 transition-all duration-200 z-10"
                    title="Entfernen"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
