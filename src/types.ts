export type TileSize = 'small' | 'medium' | 'large';

export interface TileConfig {
    id: string;
    title: string;
    component: string; // Key to map to actual component
    defaultSize: TileSize;
}

export interface AppState {
    activeView: string;
}
