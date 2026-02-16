const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Open native file dialog and return file data
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

    // Save CSV via native Save As dialog
    saveCSV: (csvContent, defaultFilename) =>
        ipcRenderer.invoke('save-csv-dialog', { csvContent, defaultFilename }),

    // Listen for menu events from main process
    onMenuExportCSV: (callback) => ipcRenderer.on('menu-export-csv', callback),
    onFilesSelected: (callback) => ipcRenderer.on('files-selected', (event, files) => callback(files)),

    // Platform detection
    platform: process.platform
});
