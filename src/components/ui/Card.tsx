import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, className, children, ...props }) => {
    return (
        <div
            className={cn("bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col", className)}
            {...props}
        >
            {title && (
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                </div>
            )}
            <div className="p-4 flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
};
