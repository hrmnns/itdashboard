# 📊 LiteBI Studio

A high-performance, browser-based business intelligence platform with local SQLite persistence and no-code reporting capabilities.

## 🚀 Key Features

- **Multi-Dashboard Support**: Create, manage, and arrange multiple dashboards with a drag-and-drop grid system.
- **Visual & SQL Query Builder**: 
  - **Visual Mode**: Drag-and-drop interface for table selection, filtering, and aggregation.
  - **SQL Mode**: Full SQL editor for advanced users with real-time preview and charting.
  - **SQL Copilot**: Integrated snippet assistant and schema-aware templates for rapid query development.
- **Advanced Visualization**: 
  - **Charts**: Responsive Pie, Bar, Line, Area, Radar, and Scatter charts with multi-series support.
  - **Pivot Tables**: Multi-dimensional matrix analysis with grouping (rows/cols) and 5+ aggregation types (Sum, Count, Avg, Min, Max).
  - **KPI Alerts**: Traffic light indicator systems for single-value tiles based on customizable threshold rules.
- **Reporting & Multi-Page Export**:
  - **Report Packages**: Build complex management reports by combining multiple dashboards into one sequential document.
  - **Advanced PDF Core**: Automated multi-page exports including Cover Pages, Tables of Contents (TOC), and consistent branding.
  - **Single-Widget Export**: High-quality image and PDF export of individual results.
- **Modular Data Import**: 
  - **Smart Import**: Automated schema generation from Excel files.
  - **Generic Import**: Direct mapping of Excel data to existing database structures with pre-import validation.
- **Interactive Worklist**: 
  - Centralized management of flagged records with status tracking and existence checks.
- **Multi-Language Support**: Full internationalization (English & German) with instant UI switching.
- **Security & Privacy**:
  - **App Lock**: Optional password protection for the entire interface.
  - **Encrypted Backups**: Password-protected database exports using AES encryption.
- **Zero-Backend Architecture**: Runs entirely in the browser using SQLite WASM + OPFS for maximum performance and data sovereignty.

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript (Vite)
- **Styling**: Tailwind CSS (Modular Utility First)
- **Database**: SQLite WASM + OPFS (Persistent Browser Storage)
- **Visualization**: Recharts & Lucide Icons
- **Internationalization**: i18next & react-i18next
- **PDF Core**: html2canvas & jsPDF

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or later)
- [npm](https://www.npmjs.com/)

### Installation & Development

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/litebistudio/litebistudio.git
    cd litebistudio
    npm install
    ```

2.  **Run Locally**:
    ```bash
    npm run dev
    ```

3.  **Build Phase**:
    ```bash
    npm run build
    ```

## 🏗️ Project Architecture

- `src/app/`: Primary UI layer including views, components, and dashboard registry.
- `src/hooks/`: Unified infrastructure hooks for data fetching, reporting, and state.
- `src/lib/`: Core system logic (Database worker, Cryptography, Repositories).
- `src/config/`: Component definitions and registry configurations.
- `src/locales/`: Translation files (JSON) for all supported languages.
- `src/datasets/`: Initial SQL schemas, views, and demo data structures.

## 🌍 Deployment (GitHub Pages)

This project is optimized for static hosting while maintaining full database features.

1.  **Build**: Execute `npm run build`.
2.  **COI Headers**: Uses `coi-serviceworker.js` to enable SharedArrayBuffer/OPFS support on GitHub Pages without server-side header configuration.
3.  **Fallback**: Gracefully falls back to an in-memory database if OPFS is unavailable.

## 🔒 Security & Data Privacy

- **No External Tracking**: No telemetry or external API calls are made.
- **Local Only**: Your data never leaves your browser unless you explicitly export a backup.
- **AES-GCM Encryption**: Used for protecting backups and the application lock.

---
Built with ❤️ for Data Sovereignty and Insights.
