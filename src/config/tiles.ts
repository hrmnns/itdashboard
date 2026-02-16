import type { TileConfig } from '../types';

export const TILES: TileConfig[] = [
    {
        id: 'it-costs',
        title: 'IT Kosten',
        component: 'ItCostsTile',
        targetView: '/costs',
        defaultSize: 'medium',
    },
    {
        id: 'systems',
        title: 'Systems Availability',
        component: 'SystemsTile',
        targetView: '/systems',
        defaultSize: 'medium',
    },
    {
        id: 'it-forecast',
        title: 'Budget Forecast',
        component: 'ItForecastTile',
        defaultSize: 'medium',
    },
    {
        id: 'clock',
        title: 'Status & Time',
        component: 'ClockTile',
        defaultSize: 'small',
    },
    {
        id: 'data-inspector',
        title: 'Data Inspector',
        component: 'DataInspectorTile',
        targetView: '/inspector',
        defaultSize: 'small',
    },
    {
        id: 'anomaly-radar',
        title: 'Anomaly Radar',
        component: 'AnomalyRadarTile',
        targetView: '/anomalies',
        defaultSize: 'medium',
    },
    {
        id: 'worklist',
        title: 'Arbeitsvorrat',
        component: 'WorklistTile',
        targetView: '/worklist',
        defaultSize: 'small',
    },
];
