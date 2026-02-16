import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { TileSize } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const getSizeClass = (size: TileSize) => {
    switch (size) {
        case 'large':
            // 2x2 unit
            return 'col-span-1 md:col-span-2 row-span-2';
        case 'medium':
            // 2x1 units (wide)
            return 'col-span-1 md:col-span-2';
        case 'small':
            // 1x1 unit
            return 'col-span-1';
        default:
            return 'col-span-1';
    }
};


interface SortableTileProps {
    id: string;
    title: string;
    size: TileSize;
    targetView?: string;
    onRemove?: (id: string) => void;
    children: React.ReactNode;
}

export const SortableTile: React.FC<SortableTileProps> = ({
    id, size, targetView, onRemove, children
}) => {
    const navigate = useNavigate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.4 : 1,
    };

    // Inject DnD props into children (individual tiles)
    // This assumes the child component accepts these props
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                onRemove: onRemove ? () => onRemove(id) : undefined,
                dragHandleProps: listeners,
                onClick: targetView ? () => navigate(targetView) : undefined
            });
        }
        return child;
    });

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(getSizeClass(size), "relative")}
            {...attributes}
        >
            {childrenWithProps}
        </div>
    );
};
