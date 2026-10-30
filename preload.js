const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop API to renderer process
contextBridge.exposeInMainWorld('desktopAPI', {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron,
  openExternal: (url) => ipcRenderer.send('open-external-url', url),
  startDesktopUpdate: (downloadUrl, version) => ipcRenderer.invoke('start-desktop-update', { downloadUrl, version }),
  cancelDesktopUpdate: () => ipcRenderer.send('cancel-desktop-update'),
  installAndRestart: (installerPath) => ipcRenderer.send('install-and-restart', { installerPath }),
  onUpdateProgress: (callback) => {
    ipcRenderer.on('desktop-update-progress', (event, data) => {
      if (typeof callback === 'function') callback(data);
    });
  }
});
