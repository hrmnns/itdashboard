import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnomalyDetectionView } from '../views/AnomalyDetectionView';

export const AnomalyDetectionPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="animate-in slide-in-from-right-4 duration-500 h-full overflow-y-auto p-6 md:p-8">
            <AnomalyDetectionView
                onBack={() => navigate('/')}
                onDrillDown={(invoiceId: string, period?: string) => {
                    if (period) {
                        navigate(`/anomalies/${period}/${invoiceId}`);
                    }
                }}
            />
        </div>
    );
};
