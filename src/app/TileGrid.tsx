import React from 'react';
import { TILES } from '../config/tiles';
import { getTileComponent } from './registry';
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

interface TileGridProps {
    onNavigate: (view: any) => void;
}

export const TileGrid: React.FC<TileGridProps> = ({ onNavigate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {TILES.map((tile) => {
                const Component = getTileComponent(tile.component);
                if (!Component) {
                    console.warn(`Component ${tile.component} not found`);
                    return null;
                }

                return (
                    <Card
                        key={tile.id}
                        title={tile.title}
                        className={cn(
                            getSizeClass(tile.defaultSize),
                            tile.targetView && "cursor-pointer hover:shadow-md hover:shadow-blue-500/10 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-300 group"
                        )}
                        onClick={() => tile.targetView && onNavigate(tile.targetView)}
                    >
                        <div className={cn(tile.targetView && "group-hover:scale-[1.01] transition-transform duration-300 h-full")}>
                            <Component onNavigate={onNavigate} />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};
