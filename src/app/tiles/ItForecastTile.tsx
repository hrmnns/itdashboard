import React from 'react';
import { useQuery } from '../../hooks/useQuery';
import { TrendingUp, Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const ItForecastTile: React.FC = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // Fetch YTD stats for current year AND the latest available year
    const { data: stats, loading, error } = useQuery<{
        latestYear: number;
        totalLatest: number;
        monthsLatest: number;
        totalCurrent: number;
        monthsCurrent: number;
    }>(`
        WITH LatestYear AS (SELECT MAX(FiscalYear) as yr FROM invoice_items)
        SELECT 
            (SELECT yr FROM LatestYear) as latestYear,
            (SELECT SUM(Amount) FROM invoice_items WHERE FiscalYear = (SELECT yr FROM LatestYear)) as totalLatest,
            (SELECT COUNT(DISTINCT Period) FROM invoice_items WHERE FiscalYear = (SELECT yr FROM LatestYear)) as monthsLatest,
            (SELECT SUM(Amount) FROM invoice_items WHERE FiscalYear = ${currentYear}) as totalCurrent,
            (SELECT COUNT(DISTINCT Period) FROM invoice_items WHERE FiscalYear = ${currentYear}) as monthsCurrent
    `);

    if (loading) return <div className="p-4 text-center text-slate-400 animate-pulse">Calculating forecast...</div>;
    if (error) return <div className="p-4 text-center text-red-500 text-xs text-wrap">Error: {error.message}</div>;

    const s = stats?.[0];
    const latestYearDetected = s?.latestYear || currentYear;

    // Choose which year to analyze for forecast
    // If we have data for the current year, use it. Otherwise, use the latest year found.
    const analysisYear = (s?.monthsCurrent > 0) ? currentYear : latestYearDetected;
    const actualSum = (analysisYear === currentYear) ? (s?.totalCurrent || 0) : (s?.totalLatest || 0);
    const monthsWithData = (analysisYear === currentYear) ? (s?.monthsCurrent || 0) : (s?.monthsLatest || 0);

    const isCurrentYear = analysisYear === currentYear;

    // Simple linear projection
    const monthlyAvg = monthsWithData > 0 ? actualSum / monthsWithData : 0;
    const forecastTotal = monthlyAvg * 12;
    const remainingEstimate = Math.max(0, forecastTotal - actualSum);

    // Progress calculation
    // If it's the current year, track against currentMonth. If it's a past year, it's 100% complete.
    const yearProgress = isCurrentYear ? (currentMonth / 12) * 100 : 100;
    const budgetProgress = forecastTotal > 0 ? (actualSum / forecastTotal) * 100 : 0;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumSignificantDigits: 4 }).format(val);

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono text-left">
                        <TrendingUp className="w-3 h-3 text-blue-500" />
                        {isCurrentYear ? `Projection ${analysisYear}` : `Run-Rate ${analysisYear} (Ref)`}
                    </h3>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 text-right">
                        {formatCurrency(forecastTotal)}
                    </div>
                </div>
                <div className={`p-2 rounded-xl ${isCurrentYear && budgetProgress > yearProgress ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
                    {(!isCurrentYear || budgetProgress <= yearProgress) ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    <span>{isCurrentYear ? `Year Progress (${currentMonth}/12)` : 'Historical Data (Full Year)'}</span>
                    <span>{yearProgress.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                        className={`h-full transition-all duration-1000 ${isCurrentYear ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-600'}`}
                        style={{ width: `${yearProgress}%` }}
                    />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1">
                    <span>Consumption Trend</span>
                    <span className={isCurrentYear && budgetProgress > yearProgress ? 'text-orange-500' : 'text-emerald-500'}>
                        {budgetProgress.toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-left">
                        {isCurrentYear ? 'Actual YTD' : 'Annual Total'}
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white text-right mt-1">{formatCurrency(actualSum)}</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col transition-all hover:border-blue-300 dark:hover:border-blue-800">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-left">
                        {isCurrentYear ? 'Est. Remaining' : 'Buffer / Var'}
                    </div>
                    <div className="text-sm font-black text-blue-600 dark:text-blue-400 text-right mt-1">{formatCurrency(remainingEstimate)}</div>
                </div>
            </div>

            <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] text-slate-400 italic">
                <Calculator className="w-3 h-3" />
                {isCurrentYear
                    ? `Based on ${monthsWithData} months YTD`
                    : `Reference year ${analysisYear} (Historical)`}
            </div>
        </div>
    );
};
