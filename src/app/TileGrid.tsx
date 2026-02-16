import React from 'react';
import { TILES } from '../config/tiles';
import { getTileComponent } from './registry';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableTile } from './SortableTile';
import { PlaceholderTile } from './components/ui/PlaceholderTile';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TileGridProps {
    visibleTileIds: string[];
    tileOrder: string[];
    onOrderChange: (newOrder: string[]) => void;
    onRemoveTile: (id: string) => void;
}

export const TileGrid: React.FC<TileGridProps> = ({
    visibleTileIds,
    tileOrder,
    onOrderChange,
    onRemoveTile
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = React.useState<string | null>(null);

    const handleDragStart = (event: { active: { id: any } }) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = tileOrder.indexOf(active.id as string);
            const newIndex = tileOrder.indexOf(over.id as string);

            // True Swap behavior: we exchange the contents of the indices
            const nextOrder = [...tileOrder];
            [nextOrder[oldIndex], nextOrder[newIndex]] = [nextOrder[newIndex], nextOrder[oldIndex]];
            onOrderChange(nextOrder);
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const activeTile = activeId ? TILES.find(t => t.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="relative [container-type:inline-size] w-full min-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar pb-20">
                <div className={cn(
                    "relative grid gap-6 p-6 auto-rows-[minmax(0,1fr)] transition-all",
                    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                    "[--cols:1] md:[--cols:2] lg:[--cols:3] xl:[--cols:4]",
                    "grid-auto-rows-[calc((100cqw-((var(--cols)-1)*1.5rem)-3rem)/var(--cols))]"
                )}>
                    {tileOrder.map((id) => {
                        const tile = TILES.find(t => t.id === id);

                        // If it's an empty slot OR a hidden tile, render placeholder
                        if (!tile || !visibleTileIds.includes(tile.id)) {
                            return <PlaceholderTile key={id} id={id} />;
                        }

                        const Component = getTileComponent(tile.component);
                        if (!Component) return <PlaceholderTile key={id} id={id} />;

                        return (
                            <SortableTile
                                key={tile.id}
                                id={tile.id}
                                title={tile.title}
                                size={tile.defaultSize}
                                targetView={tile.targetView}
                                onRemove={onRemoveTile}
                            >
                                <Component />
                            </SortableTile>
                        );
                    })}
                </div>
            </div>

            {/* Drag Overlay for high-fidelity preview */}
            <DragOverlay adjustScale={true} zIndex={100}>
                {activeId && activeTile ? (() => {
                    const Component = getTileComponent(activeTile.component);
                    return Component ? (
                        <div className="w-full h-full opacity-80 cursor-grabbing shadow-2xl scale-105 transition-transform">
                            <Component isOverlay={true} />
                        </div>
                    ) : null;
                })() : null}
            </DragOverlay>
        </DndContext>
    );
};
