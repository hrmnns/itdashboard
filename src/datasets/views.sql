DROP VIEW IF EXISTS kpi_history;
CREATE VIEW kpi_history AS
SELECT 
    'Volume' as metric, 
    SUM(Amount) as value, 
    'EUR' as unit, 
    'Actuals' as category, 
    CASE 
        WHEN Period LIKE '%-13' THEN date(MAX(PostingDate), '+1 day') 
        ELSE MAX(PostingDate) 
    END as date,
    Period as period
FROM records
GROUP BY Period;

DROP VIEW IF EXISTS latest_kpis;
CREATE VIEW latest_kpis AS
SELECT * FROM kpi_history
GROUP BY metric
ORDER BY date DESC;

-- Detailed summary view
DROP VIEW IF EXISTS data_summary_view;
CREATE VIEW data_summary_view AS
SELECT 
    SUM(Amount) as total_amount,
    COUNT(DISTINCT VendorName) as active_entities,
    MAX(PostingDate) as latest_date,
    MAX(FiscalYear) as latest_year,
    'EUR' as unit
FROM records;

-- Anomaly Radar View
DROP VIEW IF EXISTS view_anomalies;
CREATE VIEW view_anomalies AS
WITH ItemHistory AS (
    SELECT 
        *,
        LAG(Amount) OVER (
            PARTITION BY Category, SubCategory
            ORDER BY Period
        ) as PrevAmount,
        LAG(Period) OVER (
            PARTITION BY Category, SubCategory
            ORDER BY Period
        ) as PrevPeriod
    FROM records
),
ScoredItems AS (
    SELECT 
        *,
        -- 1. Drift Score: High deviation from previous amount
        CASE 
            WHEN PrevAmount IS NOT NULL AND Amount > PrevAmount * 1.2 AND (Amount - PrevAmount) > 500 THEN 50
            WHEN PrevAmount IS NOT NULL AND Amount < PrevAmount * 0.8 AND (PrevAmount - Amount) > 500 THEN 20
            ELSE 0 
        END as ScoreDrift,
        
        -- 2. New Item Score: First time appearance
        CASE 
            WHEN PrevAmount IS NULL THEN 30 
            ELSE 0 
        END as ScoreNew,

        -- 3. Quality Score: Synthetic IDs
        CASE 
            WHEN id < 0 THEN 25 
            ELSE 0 
        END as ScoreQuality,

        -- 4. Value Score: Logarithmic scale of amount (cap at 50)
        MIN(50, CAST((LOG10(MAX(ABS(Amount), 1)) * 10) AS INTEGER)) as ScoreValue
    FROM ItemHistory
)
SELECT 
    *,
    (ScoreDrift + ScoreNew + ScoreQuality + ScoreValue) as RiskScore,
    CASE
        WHEN ScoreDrift > 0 THEN 'Cost Drift'
        WHEN ScoreNew > 0 THEN 'New Item'
        WHEN ScoreQuality > 0 THEN 'Data Quality'
        ELSE 'Review'
    END as AnomalyType
FROM ScoredItems
WHERE RiskScore > 40;
