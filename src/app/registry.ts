import React from 'react';
import { ItCostsTile } from './tiles/ItCostsTile';
import { SystemsTile } from './tiles/SystemsTile';
import { ItForecastTile } from './tiles/ItForecastTile';
import { ClockTile } from './tiles/ClockTile';
import { DataInspectorTile } from './tiles/DataInspectorTile';
import { AnomalyRadarTile } from './tiles/AnomalyRadarTile';

export const TILE_COMPONENTS: Record<string, React.ComponentType<any>> = {
    'ItCostsTile': ItCostsTile,
    'SystemsTile': SystemsTile,
    'ItForecastTile': ItForecastTile,
    'ClockTile': ClockTile,
    'DataInspectorTile': DataInspectorTile,
    'AnomalyRadarTile': AnomalyRadarTile,
};

export const getTileComponent = (name: string): React.ComponentType<any> | null => {
    return TILE_COMPONENTS[name] || null;
};
