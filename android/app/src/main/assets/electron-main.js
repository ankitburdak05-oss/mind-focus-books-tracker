const { app, BrowserWindow, Menu, shell, globalShortcut, ipcMain } = require('electron');
const path = require('path');

// Ensure single instance of the application
const gotTheLock = app.requestSingleInstanceLock();
let mainWindow = null;

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    ipcMain.on('open-external-url', (event, url) => {
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        shell.openExternal(url);
      }
    });
    createMainWindow();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    title: 'Mind Focus Books - Reading Tracker & Library',
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: '#090e1a',
    autoHideMenuBar: true,
    show: false, // Show once ready to avoid white flash
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: true
    }
  });

  // Load the web application
  mainWindow.loadFile('index.html');

  // Once ready, show window smoothly
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links (open in user default browser instead of electron window)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Clean, minimal application menu with standard desktop shortcuts
  const template = [
    {
      label: 'View',
      submenu: [
        { role: 'reload', accelerator: 'Ctrl+R' },
        { role: 'forceReload', accelerator: 'Ctrl+Shift+R' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn', accelerator: 'Ctrl+Plus' },
        { role: 'zoomOut', accelerator: 'Ctrl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen', accelerator: 'F11' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close', accelerator: 'Ctrl+W' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Mind Focus Books',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Mind Focus Books',
              message: 'Mind Focus Books Desktop Edition',
              detail: 'Version ' + app.getVersion() + '\\nReal-time reading tracker, 3D personal growth library & executive analytics.\\nCreated by Ankit Burdak.',
              icon: path.join(__dirname, 'icon-192.png')
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
