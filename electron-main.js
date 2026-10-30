const { app, BrowserWindow, Menu, shell, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

// Ensure single instance of the application
const gotTheLock = app.requestSingleInstanceLock();
let mainWindow = null;
let activeDownloadReq = null;
let downloadedInstallerPath = null;

// Download helper with redirection and progress streaming
function downloadFileWithProgress(url, targetPath, onProgress) {
  return new Promise((resolve, reject) => {
    function getWithRedirect(currentUrl, maxRedirects = 10) {
      if (maxRedirects <= 0) {
        return reject(new Error('Too many redirects while downloading update'));
      }
      const client = currentUrl.startsWith('https') ? https : http;
      const req = client.get(currentUrl, {
        headers: {
          'User-Agent': 'MindFocusBooks-DesktopUpdater/' + app.getVersion()
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return getWithRedirect(res.headers.location, maxRedirects - 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Server returned HTTP ${res.statusCode}`));
        }

        const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        let receivedBytes = 0;
        let lastTime = Date.now();
        let lastReceived = 0;

        const fileStream = fs.createWriteStream(targetPath);

        res.on('data', (chunk) => {
          receivedBytes += chunk.length;
          const now = Date.now();
          if (now - lastTime >= 150 || receivedBytes === totalBytes) {
            const timeDiff = (now - lastTime) / 1000;
            const bytesDiff = receivedBytes - lastReceived;
            const speedBytesPerSec = timeDiff > 0 ? (bytesDiff / timeDiff) : 0;
            lastTime = now;
            lastReceived = receivedBytes;

            const percent = totalBytes > 0 ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : 0;
            if (typeof onProgress === 'function') {
              onProgress({
                receivedBytes,
                totalBytes,
                percent,
                speedBytesPerSec
              });
            }
          }
        });

        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => {
            resolve(targetPath);
          });
        });

        fileStream.on('error', (err) => {
          fs.unlink(targetPath, () => {});
          reject(err);
        });
      });

      req.on('error', (err) => {
        fs.unlink(targetPath, () => {});
        reject(err);
      });

      activeDownloadReq = req;
    }

    getWithRedirect(url);
  });
}

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
    // Open external URL in browser (for help / docs)
    ipcMain.on('open-external-url', (event, url) => {
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        shell.openExternal(url);
      }
    });

    // In-App Desktop Updater IPC handlers
    ipcMain.handle('start-desktop-update', async (event, { downloadUrl, version }) => {
      try {
        const tempDir = app.getPath('temp');
        const fileName = `MindFocusBooks-Setup-${version || 'latest'}.exe`;
        const targetPath = path.join(tempDir, fileName);

        downloadedInstallerPath = targetPath;

        await downloadFileWithProgress(downloadUrl, targetPath, (progress) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('desktop-update-progress', progress);
          }
        });

        return { success: true, targetPath };
      } catch (err) {
        console.error('Update download error:', err);
        return { success: false, error: err.message };
      }
    });

    ipcMain.on('cancel-desktop-update', () => {
      if (activeDownloadReq) {
        try {
          activeDownloadReq.destroy();
        } catch (e) {}
        activeDownloadReq = null;
      }
    });

    ipcMain.on('install-and-restart', (event, { installerPath }) => {
      const fileToRun = installerPath || downloadedInstallerPath;
      if (!fileToRun || !fs.existsSync(fileToRun)) {
        console.error('Installer file not found:', fileToRun);
        return;
      }

      // Launch the installer detached so it can run independently
      try {
        const child = spawn(fileToRun, [], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
      } catch (err) {
        // Fallback: system openPath
        shell.openPath(fileToRun);
      }

      // Close the current app immediately so Windows installer can replace files without file locking
      setTimeout(() => {
        app.quit();
      }, 300);
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
              detail: 'Version ' + app.getVersion() + '\nReal-time reading tracker, 3D personal growth library & executive analytics.\nCreated by Ankit Burdak.',
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
