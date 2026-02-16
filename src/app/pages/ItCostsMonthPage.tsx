import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ItCostsMonthView } from '../views/ItCostsMonthView';

export const ItCostsMonthPage: React.FC = () => {
    const { period } = useParams<{ period: string }>();
    const navigate = useNavigate();

    if (!period) return null;

    return (
        <div className="h-full overflow-y-auto animate-in slide-in-from-right-4 duration-500">
            <ItCostsMonthView
                period={period}
                onBack={() => navigate('/costs')}
                onDrillDown={(invoiceId: string) => navigate(`/costs/${period}/${invoiceId}`)}
            />
        </div>
    );
};
