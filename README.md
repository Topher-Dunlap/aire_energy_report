# Aire Apartments - Energy Usage Report Generator (Desktop App)

A desktop application for generating energy usage reports for Aire Apartments. Built with Electron.

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)

### Install & Run

```bash
# Install dependencies
npm install

# Start the app
npm start
```

### Build Installers

```bash
# Build for Windows (creates .exe installer in dist/)
npm run build:win

# Build for macOS (creates .dmg in dist/)
npm run build:mac

# Build for both
npm run build:all
```

> **Note:** Cross-compilation has limitations. Building a Windows installer works best on Windows, and macOS builds require a Mac. For cross-platform builds, consider using GitHub Actions or similar CI.

## How to Use

1. **Open the app** — double-click the installed application or run `npm start`
2. **Select files** — click "Select Files or ZIP" to open the native file picker. You can also drag & drop files onto the upload area.
3. **Enter the rate** — type your cost per kWh from your Xcel invoice
4. **Generate** — click "Generate Report" to process the data
5. **Export** — use "Download CSV Report" (native Save As dialog) or "Print Report"

You can also use the **File** menu:
- **File → Open** (Ctrl/Cmd+O) to select files
- **File → Export CSV** (Ctrl/Cmd+S) to save the report
- **File → Print** (Ctrl/Cmd+P) to print

## Project Structure

```
aire-energy-report/
├── package.json          # Project config & build settings
├── src/
│   ├── main.js           # Electron main process (window, menus, dialogs)
│   ├── preload.js        # Secure bridge between main & renderer
│   ├── index.html        # App UI (all report logic lives here)
│   └── lib/
│       ├── chart.umd.js  # Chart.js (bundled locally)
│       ├── papaparse.min.js  # PapaParse CSV parser
│       └── jszip.min.js  # JSZip for ZIP extraction
└── dist/                 # Built installers (after running build)
```

## Adding an App Icon

Replace these files with your own icon:
- `src/icon.png` — used at runtime (256×256 recommended)
- `src/icon.ico` — for Windows builds (use a .ico converter)
- `src/icon.icns` — for macOS builds (use `iconutil` on Mac)

If no icon files are present, the app will use the default Electron icon.

## Differences from Browser Version

| Feature | Browser Version | Desktop App |
|---------|----------------|-------------|
| File selection | Browser file picker | Native OS file dialog |
| CSV export | Browser download | Native "Save As" dialog |
| Dependencies | CDN (requires internet) | Bundled locally (works offline) |
| Distribution | Share .html file | Install .exe or .dmg |
| Menu | None | Full app menu with shortcuts |

© 2026 Dakota IT Solutions. All rights reserved.
