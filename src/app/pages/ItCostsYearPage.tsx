import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ItCostsYearView } from '../views/ItCostsYearView';

export const ItCostsYearPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full overflow-y-auto animate-in slide-in-from-right-4 duration-500">
            <ItCostsYearView
                onBack={() => navigate('/')}
                onDrillDown={(period: string) => navigate(`/costs/${period}`)}
            />
        </div>
    );
};
