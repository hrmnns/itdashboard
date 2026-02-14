import React from 'react';
import { ItCostsTile } from './tiles/ItCostsTile';
import { OperationsTile } from './tiles/OperationsTile';

export const TILE_COMPONENTS: Record<string, React.FC> = {
    'ItCostsTile': ItCostsTile,
    'OperationsTile': OperationsTile,
};

export const getTileComponent = (name: string): React.FC | null => {
    return TILE_COMPONENTS[name] || null;
};
