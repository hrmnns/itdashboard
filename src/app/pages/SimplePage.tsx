import React from 'react';

interface SimplePageProps {
    children: React.ReactNode;
    animation?: 'slide' | 'fade';
    className?: string;
}

export const SimplePage: React.FC<SimplePageProps> = ({ children, animation = 'slide', className = '' }) => {
    const animClass = animation === 'slide'
        ? 'animate-in slide-in-from-right-4 duration-500'
        : 'animate-in fade-in duration-500';

    return (
        <div className={`${animClass} h-full overflow-y-auto ${className}`}>
            {children}
        </div>
    );
};
