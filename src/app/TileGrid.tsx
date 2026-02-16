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
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTile } from './SortableTile';
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
                distance: 8, // Require dragging 8 pixels before starting drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tileOrder.indexOf(active.id as string);
            const newIndex = tileOrder.indexOf(over.id as string);
            onOrderChange(arrayMove(tileOrder, oldIndex, newIndex));
        }
    };

    // Filter and sort tiles based on the state
    const sortedTiles = [...tileOrder]
        .map(id => TILES.find(t => t.id === id))
        .filter(t => t && visibleTileIds.includes(t.id));

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={tileOrder}
                strategy={rectSortingStrategy}
            >
                {/* 
                  Container for the grid that allows us to use cqw units for perfect squares.
                  We define the number of columns as a CSS variable to use in the height calculation.
                */}
                <div className="[container-type:inline-size] w-full h-full">
                    <div className={cn(
                        "grid gap-6 p-6 grid-flow-dense auto-rows-[minmax(0,1fr)]",
                        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                        "[--cols:1] md:[--cols:2] lg:[--cols:3] xl:[--cols:4]",
                        // The magic formula: (Total Width - Total Gaps) / Number of Columns
                        "grid-auto-rows-[calc((100cqw-((var(--cols)-1)*1.5rem)-3rem)/var(--cols))]"
                    )}>
                        {sortedTiles.map((tile) => {
                            if (!tile) return null;
                            const Component = getTileComponent(tile.component);
                            if (!Component) {
                                console.warn(`Component ${tile.component} not found`);
                                return null;
                            }

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
            </SortableContext>
        </DndContext>
    );
};
