export interface SqlSnippet {
    id: string;
    label: string;
    description: string;
    sql: string;
    category: 'aggregation' | 'date' | 'formatting' | 'advanced';
}

export const SQL_SNIPPETS: SqlSnippet[] = [
    {
        id: 'group_by_month',
        label: 'Grouping by Month',
        description: 'Groups a date column into YYYY-MM format.',
        sql: "strftime('%Y-%m', PostingDate) as Month",
        category: 'date'
    },
    {
        id: 'sum_currency',
        label: 'Sum with Currency',
        description: 'Sums a column and rounds to 2 decimal places.',
        sql: "ROUND(SUM(Amount), 2) as Total",
        category: 'aggregation'
    },
    {
        id: 'case_when',
        label: 'Conditional Metric (Case When)',
        description: 'Creates a metric based on a condition.',
        sql: "SUM(CASE WHEN Category = 'Licenses' THEN Amount ELSE 0 END) as LicenseCosts",
        category: 'advanced'
    },
    {
        id: 'perc_total',
        label: 'Percentage of Total (Window)',
        description: 'Calculates percentage of the total column.',
        sql: "Amount * 100.0 / SUM(Amount) OVER() as SharePercent",
        category: 'advanced'
    },
    {
        id: 'format_eur',
        label: 'Format as EUR String',
        description: 'Formats a number with € suffix.',
        sql: "printf('%.2f €', Amount) as FormattedPrice",
        category: 'formatting'
    }
];
