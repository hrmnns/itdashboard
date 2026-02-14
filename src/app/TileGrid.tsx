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

interface TileGridProps {
    onNavigate: (view: any) => void;
    visibleTileIds: string[];
    tileOrder: string[];
    onOrderChange: (newOrder: string[]) => void;
    onRemoveTile: (id: string) => void;
}

export const TileGrid: React.FC<TileGridProps> = ({
    onNavigate,
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
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
                                onNavigate={onNavigate}
                                onRemove={onRemoveTile}
                            >
                                <Component onNavigate={onNavigate} />
                            </SortableTile>
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
};
