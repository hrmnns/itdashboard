import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
    return (
        <div className={`animate-shimmer bg-slate-100 dark:bg-slate-800 rounded ${className}`} />
    );
};
