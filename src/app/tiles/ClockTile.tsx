import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export const ClockTile: React.FC = () => {
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
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex flex-col h-full justify-between p-1">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Local Time</span>
                </div>
                <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums drop-shadow-sm">
                    {timeString}
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Calendar</span>
                </div>
                <div className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
                    {dateString}
                </div>
            </div>

            {/* Aesthetic Background Element */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
                <Clock className="w-32 h-32 -rotate-12 translate-x-8 -translate-y-4" />
            </div>
        </div>
    );
};
