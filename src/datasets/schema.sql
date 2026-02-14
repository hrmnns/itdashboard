CREATE TABLE IF NOT EXISTS kpi_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  category TEXT,
  date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS operations_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  FiscalYear INTEGER NOT NULL,
  Period TEXT NOT NULL,
  PostingDate TEXT NOT NULL,
  VendorName TEXT,
  VendorId TEXT,
  DocumentId TEXT NOT NULL,
  LineId INTEGER NOT NULL,
  CostCenter TEXT,
  GLAccount TEXT,
  Category TEXT,
  SubCategory TEXT,
  Service TEXT,
  System TEXT,
  RunChangeInnovation TEXT,
  Amount REAL NOT NULL,
  Currency TEXT NOT NULL,
  Quantity REAL,
  Unit TEXT,
  UnitPrice REAL,
  ContractId TEXT,
  POId TEXT,
  IsRecurring TEXT,
  Description TEXT,
  SourceTag TEXT
);
