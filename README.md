# IT Dashboard

A modular, static, browser-based IT Dashboard using SQLite WASM.

## Tech Stack

- **Framework**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS
- **Database**: SQLite WASM (Local browser database)
- **Icons**: Lucide React

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    http://localhost:5173

## How to Use

- When the app starts, the database is empty.
- Click **"Load Demo Data"** in the sidebar to populate the local SQLite database with sample data.
- The tiles will automatically update to show the new data.

## Project Structure

- `src/app/`: UI Components, Shell, and Tiles.
- `src/config/`: Configuration files (Tile Registry).
- `src/datasets/`: Static data and SQL schemas.
- `src/lib/`: Core utilities (Database wrapper).
- `src/hooks/`: Custom React hooks (`useQuery`).

## GitHub Pages Deployment

To deploy to GitHub Pages:

1.  **Repository Name**: Ensure your repository is named `itdashboard` (or update `base` in `vite.config.ts` if it differs).
2.  **Build**: Run `npm run build`.
3.  **Deploy**: Push the contents of the `dist/` folder to the `gh-pages` branch.

### Service Worker Workaround
SQLite WASM requires specific HTTP headers (`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`) for persistent storage (OPFS). Since GitHub Pages doesn't support custom headers, this project uses `coi-serviceworker.js` to enable these headers in the browser. 

- This allows the app to run with full OPFS support on GitHub Pages.
- If the service worker fails to load, the app will gracefully fall back to an in-memory database.


## Troubleshooting

- **SQLite Error**: Check browser console. Ensure `sqlite3.wasm` is loaded correctly (network tab).
- **Styles missing**: Ensure PostCSS and Tailwind are running.
