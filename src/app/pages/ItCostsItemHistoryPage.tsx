import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ItCostsItemHistoryView } from '../views/ItCostsItemHistoryView';

export const ItCostsItemHistoryPage: React.FC = () => {
    const { period, invoiceId } = useParams<{ period: string; invoiceId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Item is passed via router state from the invoice page
    const item = (location.state as any)?.item;

    if (!period || !invoiceId || !item) {
        // If no item state (e.g. direct URL access), go back to invoice
        if (period && invoiceId) {
            navigate(`/costs/${period}/${invoiceId}`, { replace: true });
        }
        return null;
    }

    return (
        <div className="h-full overflow-y-auto animate-in slide-in-from-right-4 duration-500">
            <ItCostsItemHistoryView
                item={item}
                onBack={() => navigate(`/costs/${period}/${invoiceId}`)}
            />
        </div>
    );
};
