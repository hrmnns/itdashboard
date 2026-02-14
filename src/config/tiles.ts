import type { TileConfig } from '../types';

export const TILES: TileConfig[] = [
    {
        id: 'it-costs',
        title: 'IT Kosten',
        component: 'ItCostsTile',
        defaultSize: 'medium',
    },
    {
        id: 'operations',
        title: 'Operations Status',
        component: 'OperationsTile',
        defaultSize: 'small',
    },
];
