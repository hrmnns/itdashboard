import React from 'react';
import { useQuery } from '../../hooks/useQuery'; // Adjust path if needed

export const ItCostsTile: React.FC = () => {
    const { data, loading, error } = useQuery("SELECT * FROM latest_kpis WHERE metric = 'IT Costs' LIMIT 5");

    if (loading) return <div className="p-4 text-center text-slate-500">Loading...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
    if (!data || data.length === 0) return <div className="p-4 text-center text-slate-500">No data available. Load demo data.</div>;

    const totalCost = data.reduce((acc: number, row: any) => acc + row.value, 0);

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <div className="text-sm text-slate-500 font-medium">Total IT Costs (Last Report)</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    €{totalCost.toLocaleString()}
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row: any, i: number) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.date}</td>
                                <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-slate-100">€{row.value.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
