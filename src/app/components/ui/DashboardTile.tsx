import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DashboardTileProps {
    /** Tile title shown in the header */
    title: string;
    /** Optional secondary label or status text */
    subtitle?: string;
    /** Lucide icon to display in the header */
    icon: LucideIcon;
    /** Color theme for the icon background (e.g., 'blue', 'amber', 'emerald') */
    iconColor?: 'blue' | 'amber' | 'emerald' | 'indigo' | 'rose' | 'slate';
    /** Main content of the tile */
    children: React.ReactNode;
    /** Optional footer content (e.g., status badge, time) */
    footerLeft?: React.ReactNode;
    /** Optional right-aligned footer content (usually an arrow icon if clickable) */
    footerRight?: React.ReactNode;
    /** Additional classes for the container */
    className?: string;
    /** Click handler if the tile is interactive */
    onClick?: () => void;
    /** Close handler for removing the tile from dashboard */
    onRemove?: () => void;
    /** Drag handle props from dnd-kit */
    dragHandleProps?: any;
    /** Optional background icon for aesthetic effect */
    backgroundIcon?: LucideIcon;
}

export const DashboardTile: React.FC<DashboardTileProps> = ({
    title,
    subtitle,
    icon: Icon,
    iconColor = 'blue',
    children,
    footerLeft,
    footerRight,
    className,
    onClick,
    onRemove,
    dragHandleProps,
    backgroundIcon: BackgroundIcon
}) => {
    const colorVariants = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all overflow-hidden flex flex-col",
                onClick && "cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600",
                className
            )}
        >
            {/* Background Accent (subtle light effect) */}
            <div className={cn(
                "absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-3xl opacity-[0.03] dark:opacity-[0.07] group-hover:scale-150 transition-transform duration-700",
                iconColor === 'blue' && "bg-blue-500",
                iconColor === 'amber' && "bg-amber-500",
                iconColor === 'emerald' && "bg-emerald-500",
                iconColor === 'indigo' && "bg-indigo-500",
                iconColor === 'rose' && "bg-rose-500",
                iconColor === 'slate' && "bg-slate-500"
            )} />

            {/* Header Section (acts as drag handle if provided) */}
            <div
                {...dragHandleProps}
                className={cn(
                    "relative flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700/50",
                    dragHandleProps && "cursor-grab active:cursor-grabbing"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-1.5 rounded-lg transition-transform group-hover:rotate-6",
                        colorVariants[iconColor]
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    {subtitle && (
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                            {subtitle}
                        </span>
                    )}
                    {onRemove && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="p-1 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Entfernen"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Body Section */}
            <div className="relative flex-1 px-5 py-4 min-h-0 overflow-y-auto custom-scrollbar">
                {children}
            </div>

            {/* Decorative Background Icon */}
            {BackgroundIcon && (
                <div className="absolute -bottom-4 -right-4 opacity-[0.03] dark:opacity-[0.07] pointer-events-none group-hover:rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <BackgroundIcon className="w-24 h-24" />
                </div>
            )}

            {/* Footer Section */}
            {(footerLeft || footerRight || onClick) && (
                <div className="relative mt-auto flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex-1 min-w-0">
                        {footerLeft}
                    </div>
                    <div className="flex items-center gap-2">
                        {footerRight}
                        {onClick && (
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
