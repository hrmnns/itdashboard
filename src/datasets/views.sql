CREATE VIEW IF NOT EXISTS latest_kpis AS
SELECT metric, value, unit, category, date
FROM kpi_data
GROUP BY metric
ORDER BY date DESC;
