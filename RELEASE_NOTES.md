# Release Notes - LiteBI Studio v1.0.0

We are proud to announce the first official release of **LiteBI Studio**, a high-performance, browser-based business intelligence platform designed for data sovereignty and ease of use.

## 🌟 Key Highlights

### 🎨 Rebranding: LiteBI Studio
The project has evolved from a specific IT Dashboard into a generic, powerful BI platform. This release introduces our new identity: **LiteBI Studio**, featuring a refined UI and a streamlined user experience.

### 📊 Generic Data Architecture
- **Domain Neutrality**: All hardcoded dependencies on specific data models (like `invoice-items`) have been removed.
- **Dynamic Schema Detection**: The platform now automatically adapts to any table structure you import or create.
- **Flexible DataRecord Model**: Core internal types now use a generalized structure to support arbitrary datasets.

### 📈 Advanced Visualization & Analytics
- **Pivot Tables**: Perform multi-dimensional analysis with hierarchical row/column grouping and multiple aggregation types (Sum, Count, Avg, Min, Max).
- **KPI Alerts & Traffic Lights**: Configure conditional formatting rules for single-value tiles to create visual monitoring systems.
- **New Chart Types**: Added support for Radar and Scatter charts, along with label-list toggles for all series.
- **Smart Formatting**: Intelligent value formatting for currencies, percentages, and large numbers across the entire UI.

### 📄 Professional Reporting
- **Report Packages**: A new dedicated module to bundle multiple dashboards into a single professional report.
- **Advanced PDF Export**: Automated generation of multi-page PDF documents including:
  - Custom Cover Pages with metadata.
  - Automatic Table of Contents (TOC).
  - Page numbering and consistent branding.

### 🤖 SQL Copilot & Templates
- **Snippet Assistant**: Access a library of schema-aware SQL templates for common analytical patterns.
- **Intelligent Autocomplete**: Experimental support for table and column suggestions within the SQL editor.

### 🔒 Security & Privacy
- **Salted PIN Protection**: Upgraded the application lock to use unique cryptographic salts, significantly hardening the system against pre-computed attacks.
- **Encrypted Backups**: Modern AES-GCM 256-bit encryption for securing your database exports.
- **Local Sovereignty**: Zero-telemetry architecture. Your data never leaves your browser unless you explicitly export it.

### 🌐 Internationalization
- Full support for **English** and **German** languages with instant switching.

## 🛠️ Performance & Technical Improvements
- **React 19 & TypeScript**: Migrated to the latest frontend stack for maximum stability and performance.
- **SQLite WASM + OPFS**: High-speed persistent storage using modern browser APIs.
- **Dynamic Build System**: Refactored schema compilation for better maintainability and error handling.

---
*LiteBI Studio - Data Sovereignty. Simply Visualized.*
