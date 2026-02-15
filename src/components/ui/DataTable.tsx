import React, { useMemo } from 'react';
import { Search } from 'lucide-react';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => any);
    render?: (item: T) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
    width?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchTerm?: string;
    searchFields?: (keyof T)[];
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export function DataTable<T>({
    data,
    columns,
    searchTerm = '',
    searchFields = [],
    emptyMessage = 'No items found',
    onRowClick
}: DataTableProps<T>) {

    const headerRef = React.useRef<HTMLDivElement>(null);
    const bodyRef = React.useRef<HTMLDivElement>(null);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(item =>
            searchFields.some(field => {
                const val = item[field];
                return (String(val ?? '').toLowerCase()).includes(lowerSearch);
            })
        );
    }, [data, searchTerm, searchFields]);

    const handleScroll = () => {
        if (headerRef.current && bodyRef.current) {
            headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
        }
    };

    const renderColGroup = () => (
        <colgroup>
            {columns.map((col, i) => (
                <col key={i} style={{ width: col.width || '150px', minWidth: col.width || '150px' }} />
            ))}
        </colgroup>
    );

    return (
        <div className="flex flex-col flex-1 overflow-hidden h-full relative border rounded-lg border-slate-200 dark:border-slate-700">
            {/* Header Table (Static Vertical, Scrolls Horizontal) */}
            <div
                ref={headerRef}
                className="overflow-hidden flex-none bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
            >
                <table className="w-full text-sm text-left table-fixed">
                    {renderColGroup()}
                    <thead className="text-[10px] text-slate-400 uppercase font-bold text-left">
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={`px-4 py-3 truncate ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                                    title={col.header}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Body Table (Scrolls Vertical & Horizontal) */}
            <div
                ref={bodyRef}
                onScroll={handleScroll}
                className="flex-1 overflow-auto bg-white dark:bg-slate-800"
            >
                <table className="w-full text-sm text-left table-fixed">
                    {renderColGroup()}
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredData.map((item, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick && onRowClick(item)}
                                className={`transition-colors group ${onRowClick ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                            >
                                {columns.map((col, colIndex) => {
                                    const value = typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : (item as any)[col.accessor];

                                    return (
                                        <td
                                            key={colIndex}
                                            className={`px-4 py-3 truncate ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                                            title={typeof value === 'string' ? value : undefined}
                                        >
                                            {col.render ? col.render(item) : value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-20 text-center text-slate-400">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-lg">{emptyMessage}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
