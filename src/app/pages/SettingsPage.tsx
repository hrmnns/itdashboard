import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { SettingsView } from '../views/SettingsView';
import type { LayoutContext } from '../Layout';

export const SettingsPage: React.FC = () => {
    const { theme, setTheme, visibleTileIds, setVisibleTileIds, tileOrder } = useOutletContext<LayoutContext>();

    return (
        <SettingsView
            theme={theme}
            setTheme={setTheme}
            visibleTileIds={visibleTileIds}
            setVisibleTileIds={setVisibleTileIds}
            tileOrder={tileOrder}
            onBack={() => window.history.back()}
        />
    );
};
