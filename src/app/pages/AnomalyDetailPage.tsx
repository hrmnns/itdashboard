import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnomalyDetailView } from '../views/AnomalyDetailView';

export const AnomalyDetailPage: React.FC = () => {
    const { period, anomalyId } = useParams<{ period: string; anomalyId: string }>();
    const navigate = useNavigate();

    if (!period || !anomalyId) return null;

    return (
        <AnomalyDetailView
            anomalyId={anomalyId}
            period={period}
            onBack={() => navigate('/anomalies')}
            onOpenInvoice={() => navigate(`/costs/${period}/${anomalyId}`)}
        />
    );
};
