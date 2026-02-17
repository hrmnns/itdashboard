import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    trendLabel?: string;
    color?: string; // e.g., 'text-blue-500', 'text-emerald-500' (default: theme accent)
    subtext?: string;
    className?: string; // Allow custom styling/overrides
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    trendLabel,
    color = 'text-blue-500',
    subtext,
    className = ''
}) => {
    // Trend color logic
    const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

    return (
        <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden group flex flex-col justify-between ${className}`}>

            {/* Header: Label & Icon */}
            <div className="flex items-center justify-between mb-2 z-10 relative">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">{title}</div>
                <Icon className={`w-5 h-5 ${color} opacity-80 group-hover:scale-110 transition-transform duration-500`} />
            </div>

            {/* Main Value */}
            <div className={`text-2xl font-black text-slate-900 dark:text-white text-right mt-1 z-10 relative`}>
                {value}
            </div>

            {/* Footer: Trend or Subtext */}
            {(trendValue || subtext || trendLabel) && (
                <div className="text-[10px] mt-3 font-bold uppercase text-right flex flex-col items-end z-10 relative">
                    {trendValue && (
                        <div className={`flex items-center gap-1 ${trendColor}`}>
                            {trendValue}
                        </div>
                    )}
                    {(subtext || trendLabel) && (
                        <span className="text-slate-400 font-medium normal-case tracking-normal">
                            {trendLabel || subtext}
                        </span>
                    )}
                </div>
            )}

            {/* Background Decoration (Subtle Glow) */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 pointer-events-none transition-opacity duration-300 group-hover:opacity-10 bg-current ${color}`} />
        </div>
    );
};
