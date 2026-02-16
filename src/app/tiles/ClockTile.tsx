import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, Globe } from 'lucide-react';
import { DashboardTile } from '../components/ui/DashboardTile';

export const ClockTile: React.FC<{ onRemove?: () => void; dragHandleProps?: any; onClick?: () => void }> = ({ onRemove, dragHandleProps, onClick }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const greeting = useMemo(() => {
        const hour = time.getHours();
        if (hour < 6) return 'Gute Nacht';
        if (hour < 11) return 'Guten Morgen';
        if (hour < 14) return 'Guten Appetit';
        if (hour < 18) return 'Guten Tag';
        return 'Guten Abend';
    }, [time]);

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

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <DashboardTile
            title="Dashboard"
            icon={Clock}
            iconColor="slate"
            onRemove={onRemove}
            dragHandleProps={dragHandleProps}
            onClick={onClick}
            backgroundIcon={Clock}
        >
            <div className="flex flex-col h-full items-center justify-center text-center space-y-2 py-2">
                <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
                    {greeting}
                </div>

                <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums drop-shadow-sm leading-none">
                    {timeString}
                </div>

                <div className="pt-4 w-full border-t border-slate-100 dark:border-slate-800/50 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        {dateString}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        <Globe className="w-2.5 h-2.5 text-slate-300" />
                        {timeZone}
                    </div>
                </div>
            </div>
        </DashboardTile>
    );
};
