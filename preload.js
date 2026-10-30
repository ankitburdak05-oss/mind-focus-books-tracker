const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop API to renderer process
contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron
});
