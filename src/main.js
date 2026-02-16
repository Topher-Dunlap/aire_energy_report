const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, 'icon.png'),
        title: 'Aire Apartments - Energy Usage Report'
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Build application menu
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Files...',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => openFileDialog()
                },
                { type: 'separator' },
                {
                    label: 'Export CSV...',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow.webContents.send('menu-export-csv')
                },
                {
                    label: 'Print Report...',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => mainWindow.webContents.print()
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Aire Energy Report',
                            message: 'Aire Apartments - Energy Usage Report Generator',
                            detail: 'Version 1.0.0\n© 2026 Dakota IT Solutions\nAll rights reserved.'
                        });
                    }
                }
            ]
        }
    ];

    // macOS-specific app menu
    if (process.platform === 'darwin') {
        menuTemplate.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

async function openFileDialog() {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Energy Report Files',
        filters: [
            { name: 'Supported Files', extensions: ['zip', 'csv'] },
            { name: 'ZIP Archives', extensions: ['zip'] },
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile', 'multiSelections']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        // Read each file and send the data to the renderer
        const files = [];
        for (const filePath of result.filePaths) {
            const buffer = fs.readFileSync(filePath);
            const name = path.basename(filePath);
            files.push({
                name,
                path: filePath,
                buffer: buffer.toString('base64'),
                size: buffer.length
            });
        }
        mainWindow.webContents.send('files-selected', files);
    }
}

// Handle file open dialog request from renderer
ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Energy Report Files',
        filters: [
            { name: 'Supported Files', extensions: ['zip', 'csv'] },
            { name: 'ZIP Archives', extensions: ['zip'] },
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile', 'multiSelections']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const files = [];
        for (const filePath of result.filePaths) {
            const buffer = fs.readFileSync(filePath);
            const name = path.basename(filePath);
            files.push({
                name,
                path: filePath,
                buffer: buffer.toString('base64'),
                size: buffer.length
            });
        }
        return files;
    }
    return [];
});

// Handle save CSV dialog request from renderer
ipcMain.handle('save-csv-dialog', async (event, { csvContent, defaultFilename }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Energy Report CSV',
        defaultPath: defaultFilename || 'energy_summary.csv',
        filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, csvContent, 'utf8');
        return { success: true, path: result.filePath };
    }
    return { success: false };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
