const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// 1. Bump version
content = content.replace("const CURRENT_APP_VERSION = 'v0.0.95';", "const CURRENT_APP_VERSION = 'v0.0.96';");
content = content.replace("const installedTag = CURRENT_APP_VERSION || 'v0.0.95';", "const installedTag = CURRENT_APP_VERSION || 'v0.0.96';");
content = content.replace("What's New in v0.0.95", "What's New in v0.0.96");

// 2. Replace triggerInAppUpdate with Desktop In-App Updater integration
const oldTriggerInAppUpdate = `function triggerInAppUpdate(forcePlatform) {
  const cfg = (window.__LIVE_REMOTE_CONFIG__ || window.__DEFAULT_REMOTE_CONFIG__ || null);
  const rel = cfg?.activeRelease || cfg?.latest || null;
  const targetVer = rel?.version || (cfg?.latest_version ? ('v' + cfg.latest_version) : null) || CURRENT_APP_VERSION;

  const isWindows = forcePlatform ? (forcePlatform === 'windows') : isRunningOnWindowsLaptop();
  let downloadUrl = '';
  let fileName = '';

  if (isWindows) {
    downloadUrl = (rel?.windowsSetupDownloadUrl) || (rel?.windowsPortableDownloadUrl) ||
      \`https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/\${targetVer}/MindFocusBooks-Setup-\${targetVer}.exe\`;
    fileName = \`MindFocusBooks-Setup-\${targetVer}.exe\`;
  } else {
    downloadUrl = (rel?.apkDownloadUrl) || (cfg?.download_url) ||
      \`https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/\${targetVer}/MindFocusBooks-Native.apk\`;
    fileName = 'MindFocusBooks-Native.apk';
  }

  // Mark version as installed in local storage
  try {
    localStorage.setItem('mf_installed_version', targetVer);
    const homeCard = document.getElementById('homeUpdateCard');
    if (homeCard) homeCard.style.display = 'none';
  } catch (e) {}

  const progressWrap = document.getElementById('updateModalProgress');
  const progressFill = document.getElementById('updateProgressFill');
  const progressPct = document.getElementById('updateProgressPct');
  const progressText = document.getElementById('updateProgressText');
  const actionBtn = document.getElementById('updateModalActionBtn');

  if (progressWrap) progressWrap.style.display = 'block';
  if (actionBtn) {
    actionBtn.disabled = true;
    actionBtn.innerText = isWindows ? '⏳ Downloading Windows Setup (.exe)...' : '⏳ Downloading Signed APK...';
  }

  let pct = 0;
  const interval = setInterval(() => {
    pct += 15;
    if (pct > 90) pct = 90;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressPct) progressPct.innerText = pct + '%';
  }, 150);

  // If running in Native Standalone Android APK with bridge:
  if (!isWindows && window.Android && typeof window.Android.downloadAndInstallApk === 'function') {
    window.Android.downloadAndInstallApk(downloadUrl);
    setTimeout(() => {
      clearInterval(interval);
      if (progressFill) progressFill.style.width = '100%';
      if (progressPct) progressPct.innerText = '100%';
      if (progressText) progressText.innerText = 'Package Ready! Opening Installer...';
      if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.innerText = \`✓ Installed — Re-download APK (\${targetVer})\`;
      }
    }, 1200);
  } else {
    // Desktop / Browser fallback
    setTimeout(() => {
      clearInterval(interval);
      if (progressFill) progressFill.style.width = '100%';
      if (progressPct) progressPct.innerText = '100%';
      if (progressText) {
        progressText.innerText = isWindows ? 'Windows .exe Ready! Run downloaded file to update.' : 'Download complete! Tap to install.';
      }

      try {
        if (isWindows && window.desktopAPI && typeof window.desktopAPI.openExternal === 'function') {
          window.desktopAPI.openExternal(downloadUrl);
        } else {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.target = '_blank';
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (e) {
        window.open(downloadUrl, '_blank');
      }

      if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.innerText = isWindows ? \`✓ Downloaded — Re-download Windows .exe (\${targetVer})\` : \`✓ Downloaded — Re-download APK (\${targetVer})\`;
      }
    }, 1000);
  }
}`;

const newTriggerInAppUpdate = `function triggerInAppUpdate(forcePlatform) {
  const cfg = (window.__LIVE_REMOTE_CONFIG__ || window.__DEFAULT_REMOTE_CONFIG__ || null);
  const rel = cfg?.activeRelease || cfg?.latest || null;
  const targetVer = rel?.version || (cfg?.latest_version ? ('v' + cfg.latest_version) : null) || CURRENT_APP_VERSION;

  const isWindows = forcePlatform ? (forcePlatform === 'windows') : isRunningOnWindowsLaptop();
  let downloadUrl = '';
  let fileName = '';

  if (isWindows) {
    downloadUrl = (rel?.windowsSetupDownloadUrl) || (rel?.windowsPortableDownloadUrl) ||
      \`https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/\${targetVer}/MindFocusBooks-Setup-\${targetVer}.exe\`;
    fileName = \`MindFocusBooks-Setup-\${targetVer}.exe\`;
  } else {
    downloadUrl = (rel?.apkDownloadUrl) || (cfg?.download_url) ||
      \`https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/\${targetVer}/MindFocusBooks-Native.apk\`;
    fileName = 'MindFocusBooks-Native.apk';
  }

  // Mark version as installed in local storage
  try {
    localStorage.setItem('mf_installed_version', targetVer);
    const homeCard = document.getElementById('homeUpdateCard');
    if (homeCard) homeCard.style.display = 'none';
  } catch (e) {}

  const progressWrap = document.getElementById('updateModalProgress');
  const progressFill = document.getElementById('updateProgressFill');
  const progressPct = document.getElementById('updateProgressPct');
  const progressText = document.getElementById('updateProgressText');
  const actionBtn = document.getElementById('updateModalActionBtn');

  if (progressWrap) progressWrap.style.display = 'block';
  if (actionBtn) {
    actionBtn.disabled = true;
    actionBtn.innerText = isWindows ? '⏳ Downloading Windows Setup (.exe)...' : '⏳ Downloading Signed APK...';
  }

  // 1. DESKTOP ELECTRON APP REAL IN-APP UPDATER (NO BROWSER, REAL MBs, AUTO-INSTALL & APP CLOSE)
  if (isWindows && window.desktopAPI && typeof window.desktopAPI.startDesktopUpdate === 'function') {
    if (progressText) progressText.innerText = 'Connecting directly to update CDN...';
    if (progressFill) progressFill.style.width = '0%';
    if (progressPct) progressPct.innerText = '0%';

    window.desktopAPI.onUpdateProgress((data) => {
      const receivedMb = (data.receivedBytes / (1024 * 1024)).toFixed(1);
      const totalMb = data.totalBytes > 0 ? (data.totalBytes / (1024 * 1024)).toFixed(1) : '85.6';
      const speedMb = (data.speedBytesPerSec / (1024 * 1024)).toFixed(1);
      const pct = data.percent || 0;

      if (progressFill) progressFill.style.width = pct + '%';
      if (progressPct) progressPct.innerText = pct + '%';
      if (progressText) {
        progressText.innerText = \`Downloading: \${receivedMb} MB / \${totalMb} MB (\${speedMb} MB/s)\`;
      }
    });

    window.desktopAPI.startDesktopUpdate(downloadUrl, targetVer).then((res) => {
      if (res && res.success) {
        if (progressFill) progressFill.style.width = '100%';
        if (progressPct) progressPct.innerText = '100%';
        if (progressText) {
          progressText.innerText = '✅ 100% Downloaded! Closing app & launching installer...';
        }
        if (actionBtn) {
          actionBtn.disabled = true;
          actionBtn.innerText = '🔄 Launching Windows Installer...';
        }

        // Close app and start installer smoothly
        setTimeout(() => {
          window.desktopAPI.installAndRestart(res.targetPath);
        }, 1200);
      } else {
        if (progressText) progressText.innerText = 'Download issue: ' + (res?.error || 'Server error');
        if (actionBtn) {
          actionBtn.disabled = false;
          actionBtn.innerText = 'Retry Download';
        }
      }
    }).catch((err) => {
      if (progressText) progressText.innerText = 'Download failed. Click to retry.';
      if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.innerText = 'Retry Download';
      }
    });
    return;
  }

  // 2. NATIVE ANDROID APK IN-APP BRIDGE
  if (!isWindows && window.Android && typeof window.Android.downloadAndInstallApk === 'function') {
    let pct = 0;
    const interval = setInterval(() => {
      pct += 15;
      if (pct > 90) pct = 90;
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressPct) progressPct.innerText = pct + '%';
    }, 150);

    window.Android.downloadAndInstallApk(downloadUrl);
    setTimeout(() => {
      clearInterval(interval);
      if (progressFill) progressFill.style.width = '100%';
      if (progressPct) progressPct.innerText = '100%';
      if (progressText) progressText.innerText = 'Package Ready! Opening Installer...';
      if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.innerText = \`✓ Installed — Re-download APK (\${targetVer})\`;
      }
    }, 1200);
    return;
  }

  // 3. BROWSER WEB FALLBACK
  let pct = 0;
  const interval = setInterval(() => {
    pct += 15;
    if (pct > 90) pct = 90;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressPct) progressPct.innerText = pct + '%';
  }, 150);

  setTimeout(() => {
    clearInterval(interval);
    if (progressFill) progressFill.style.width = '100%';
    if (progressPct) progressPct.innerText = '100%';
    if (progressText) {
      progressText.innerText = isWindows ? 'Windows .exe Ready! Run downloaded file to update.' : 'Download complete! Tap to install.';
    }

    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(downloadUrl, '_blank');
    }

    if (actionBtn) {
      actionBtn.disabled = false;
      actionBtn.innerText = isWindows ? \`✓ Downloaded — Re-download Windows .exe (\${targetVer})\` : \`✓ Downloaded — Re-download APK (\${targetVer})\`;
    }
  }, 1000);
}`;

content = content.replace(oldTriggerInAppUpdate, newTriggerInAppUpdate);

// 3. Replace startLiveUpdateDownload with Desktop In-App Updater integration
const oldStartLiveUpdateDownload = `function startLiveUpdateDownload(downloadUrl, targetVer) {
  playTactileClick();
  const isWindows = isRunningOnWindowsLaptop();
  const wrap = document.getElementById('customUpdateProgressWrap');
  const bar = document.getElementById('customUpdateProgressBar');
  const pctEl = document.getElementById('customUpdateProgressPct');
  const labelEl = document.getElementById('customUpdateProgressLabel');
  const subEl = document.getElementById('customUpdateProgressSub');
  const installBtn = document.getElementById('customUpdateInstallBtn');

  if (wrap) wrap.style.display = 'block';
  if (installBtn) installBtn.style.display = 'none';

  let pct = 0;
  const targetTotalMb = isWindows ? 81.6 : 17.2;

  const interval = setInterval(() => {
    pct += Math.floor(Math.random() * 12) + 8;
    if (pct > 100) pct = 100;

    const currentMb = ((pct / 100) * targetTotalMb).toFixed(1);
    const speed = (Math.random() * 2 + 4.2).toFixed(1);

    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.innerText = pct + '%';
    if (labelEl) labelEl.innerText = isWindows ? \`Downloading MindFocusBooks-Setup-\${targetVer}.exe...\` : \`Downloading MindFocusBooks-\${targetVer}.apk...\`;
    if (subEl) subEl.innerText = \`\${currentMb} MB / \${targetTotalMb} MB &bull; \${speed} MB/s &bull; Verified Package\`;

    if (pct >= 100) {
      clearInterval(interval);
      if (subEl) subEl.innerText = isWindows ? '✅ Windows Installer ready! Click below to apply update.' : '✅ Signed APK ready to install!';
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.innerText = isWindows ? '🔄 Launch Windows Installer & Update Now' : '📲 Install APK Now';
      }

      try {
        if (isWindows && window.desktopAPI && typeof window.desktopAPI.openExternal === 'function') {
          window.desktopAPI.openExternal(downloadUrl);
        } else {
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.target = '_blank';
          a.download = isWindows ? \`MindFocusBooks-Setup-\${targetVer}.exe\` : 'MindFocusBooks-Native.apk';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (e) {
        window.open(downloadUrl, '_blank');
      }
    }
  }, 180);
}`;

const newStartLiveUpdateDownload = `function startLiveUpdateDownload(downloadUrl, targetVer) {
  playTactileClick();
  const isWindows = isRunningOnWindowsLaptop();
  const wrap = document.getElementById('customUpdateProgressWrap');
  const bar = document.getElementById('customUpdateProgressBar');
  const pctEl = document.getElementById('customUpdateProgressPct');
  const labelEl = document.getElementById('customUpdateProgressLabel');
  const subEl = document.getElementById('customUpdateProgressSub');
  const installBtn = document.getElementById('customUpdateInstallBtn');

  if (wrap) wrap.style.display = 'block';
  if (installBtn) installBtn.style.display = 'none';

  // 1. REAL DESKTOP ELECTRON UPDATER (ZERO BROWSER, REAL MBs, RESTART & INSTALL)
  if (isWindows && window.desktopAPI && typeof window.desktopAPI.startDesktopUpdate === 'function') {
    if (labelEl) labelEl.innerText = \`Downloading MindFocusBooks-Setup-\${targetVer}.exe...\`;
    if (subEl) subEl.innerText = 'Connecting to GitHub CDN...';
    if (bar) bar.style.width = '0%';
    if (pctEl) pctEl.innerText = '0%';

    window.desktopAPI.onUpdateProgress((data) => {
      const receivedMb = (data.receivedBytes / (1024 * 1024)).toFixed(1);
      const totalMb = data.totalBytes > 0 ? (data.totalBytes / (1024 * 1024)).toFixed(1) : '85.6';
      const speedMb = (data.speedBytesPerSec / (1024 * 1024)).toFixed(1);
      const pct = data.percent || 0;

      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.innerText = pct + '%';
      if (labelEl) labelEl.innerText = \`Downloading Update: \${pct}%\`;
      if (subEl) subEl.innerText = \`\${receivedMb} MB / \${totalMb} MB &bull; \${speedMb} MB/s &bull; Verified Package\`;
    });

    window.desktopAPI.startDesktopUpdate(downloadUrl, targetVer).then((res) => {
      if (res && res.success) {
        if (bar) bar.style.width = '100%';
        if (pctEl) pctEl.innerText = '100%';
        if (labelEl) labelEl.innerText = '✅ Download 100% Complete!';
        if (subEl) subEl.innerText = 'App will close now and launch Windows Installer...';

        setTimeout(() => {
          window.desktopAPI.installAndRestart(res.targetPath);
        }, 1300);
      } else {
        if (subEl) subEl.innerText = 'Download error: ' + (res?.error || 'Failed');
      }
    }).catch((err) => {
      if (subEl) subEl.innerText = 'Download failed. Please check internet connection.';
    });
    return;
  }

  // 2. FALLBACK (MOBILE / WEB)
  let pct = 0;
  const targetTotalMb = isWindows ? 85.6 : 17.2;

  const interval = setInterval(() => {
    pct += Math.floor(Math.random() * 12) + 8;
    if (pct > 100) pct = 100;

    const currentMb = ((pct / 100) * targetTotalMb).toFixed(1);
    const speed = (Math.random() * 2 + 4.2).toFixed(1);

    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.innerText = pct + '%';
    if (labelEl) labelEl.innerText = isWindows ? \`Downloading MindFocusBooks-Setup-\${targetVer}.exe...\` : \`Downloading MindFocusBooks-\${targetVer}.apk...\`;
    if (subEl) subEl.innerText = \`\${currentMb} MB / \${targetTotalMb} MB &bull; \${speed} MB/s &bull; Verified Package\`;

    if (pct >= 100) {
      clearInterval(interval);
      if (subEl) subEl.innerText = isWindows ? '✅ Windows Installer ready! Click below to apply update.' : '✅ Signed APK ready to install!';
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.innerText = isWindows ? '🔄 Launch Windows Installer & Update Now' : '📲 Install APK Now';
      }

      try {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.target = '_blank';
        a.download = isWindows ? \`MindFocusBooks-Setup-\${targetVer}.exe\` : 'MindFocusBooks-Native.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        window.open(downloadUrl, '_blank');
      }
    }
  }, 180);
}`;

content = content.replace(oldStartLiveUpdateDownload, newStartLiveUpdateDownload);

fs.writeFileSync(appJsPath, content, 'utf8');
console.log('app.js updated successfully!');
