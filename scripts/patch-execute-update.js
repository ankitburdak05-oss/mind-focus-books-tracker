const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(appPath, 'utf8');

const oldFunc = `function executeDownloadedUpdate() {
  playTactileClick();
  const isWindows = isRunningOnWindowsLaptop();
  if (isWindows && window.desktopAPI && typeof window.desktopAPI.openExternal === 'function') {
    window.desktopAPI.openExternal(currentTargetUpdateUrl);
  } else {
    window.open(currentTargetUpdateUrl, '_blank');
  }
}`;

const newFunc = `function executeDownloadedUpdate() {
  playTactileClick();
  const isWindows = isRunningOnWindowsLaptop();
  if (isWindows && window.desktopAPI && typeof window.desktopAPI.installAndRestart === 'function') {
    window.desktopAPI.installAndRestart();
  } else if (isWindows && window.desktopAPI && typeof window.desktopAPI.openExternal === 'function') {
    window.desktopAPI.openExternal(currentTargetUpdateUrl);
  } else {
    window.open(currentTargetUpdateUrl, '_blank');
  }
}`;

if (code.includes(oldFunc)) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync(appPath, code, 'utf8');
  console.log('executeDownloadedUpdate updated successfully');
} else {
  console.log('oldFunc not matched directly, checking normalized line endings');
  const normalized = code.replace(/\r\n/g, '\n');
  const normalizedOld = oldFunc.replace(/\r\n/g, '\n');
  if (normalized.includes(normalizedOld)) {
    code = normalized.replace(normalizedOld, newFunc.replace(/\r\n/g, '\n'));
    fs.writeFileSync(appPath, code, 'utf8');
    console.log('executeDownloadedUpdate updated via normalized line endings');
  }
}
