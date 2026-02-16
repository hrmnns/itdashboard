import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnomalyDetailView } from '../views/AnomalyDetailView';

export const AnomalyDetailPage: React.FC = () => {
    const { period, anomalyId } = useParams<{ period: string; anomalyId: string }>();
    const navigate = useNavigate();

    if (!period || !anomalyId) return null;

    return (
        <div className="animate-in slide-in-from-right-4 duration-500 h-full overflow-y-auto p-6 md:p-8">
            <AnomalyDetailView
                anomalyId={anomalyId}
                period={period}
                onBack={() => navigate('/anomalies')}
                onOpenInvoice={() => navigate(`/costs/${period}/${anomalyId}`)}
            />
        </div>
    );
};
