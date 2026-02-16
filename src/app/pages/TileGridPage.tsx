import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { TileGrid } from '../TileGrid';
import type { LayoutContext } from '../Layout';

export const TileGridPage: React.FC = () => {
    const { visibleTileIds, tileOrder, setTileOrder, setVisibleTileIds } = useOutletContext<LayoutContext>();

    return (
        <div className="h-full overflow-y-auto animate-in fade-in duration-500">
            <TileGrid
                visibleTileIds={visibleTileIds}
                tileOrder={tileOrder}
                onOrderChange={setTileOrder}
                onRemoveTile={(id) => setVisibleTileIds(visibleTileIds.filter(v => v !== id))}
            />
        </div>
    );
};
