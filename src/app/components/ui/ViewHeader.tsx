import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ViewHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    actions?: React.ReactNode;
    badges?: React.ReactNode;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({ title, subtitle, onBack, actions, badges }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-300 dark:border-slate-700 shadow-sm group"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-slate-600 dark:text-slate-400" />
                    </button>
                )}
                <div>
                    {(subtitle || badges) && (
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {badges}
                            {subtitle && <span className="text-slate-400 text-xs font-medium">{subtitle}</span>}
                        </div>
                    )}
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                        {title}
                    </h2>
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
};
