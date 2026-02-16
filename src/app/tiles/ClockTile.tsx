import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { DashboardTile } from '../components/ui/DashboardTile';

export const ClockTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = time.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const dateString = time.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <DashboardTile
            title="Lokale Zeit"
            icon={Clock}
            iconColor="slate"
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            onClick={onClick}
            backgroundIcon={Clock}
            footerLeft={
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {dateString}
                </div>
            }
        >
            <div className="">
                <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums drop-shadow-sm">
                    {timeString}
                </div>
            </div>
        </DashboardTile>
    );
};
