const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 1. package.json
const pkgPath = path.join(root, 'package.json');
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = '0.0.97';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('package.json -> 0.0.97');

// 2. build.gradle
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode\s+\d+/, 'versionCode 8592');
gradle = gradle.replace(/versionName\s+"[^"]+"/, 'versionName "0.0.97"');
fs.writeFileSync(gradlePath, gradle, 'utf8');
console.log('build.gradle -> 8592, 0.0.97');

// 3. app.js
const appPath = path.join(root, 'app.js');
let appCode = fs.readFileSync(appPath, 'utf8');
appCode = appCode.replace(/const CURRENT_APP_VERSION = 'v0\.0\.\d+';/, "const CURRENT_APP_VERSION = 'v0.0.97';");
appCode = appCode.replace(/CURRENT_APP_VERSION \|\| 'v0\.0\.\d+'/, "CURRENT_APP_VERSION || 'v0.0.97'");
appCode = appCode.replace(/What's New in v0\.0\.\d+/g, "What's New in v0.0.97");
fs.writeFileSync(appPath, appCode, 'utf8');
console.log('app.js -> v0.0.97');

// 4. index.html
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/0\.0\.96/g, '0.0.97');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html -> 0.0.97');

// 5. remote-config.json & remote-config.js
const remoteConfigPath = path.join(root, 'remote-config.json');
let rc = {
  "activeRelease": {
    "version": "v0.0.97",
    "name": "Mind Focus Books v0.0.97 (Interactive Reading Progress & Donut Stats Engine)",
    "releaseNotes": "v0.0.97: 100% Real Interactive Reading Progress (Clickable This Month / This Year / All-Time Pills, Real Books Read & Total Books Donut Counter)",
    "apkDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.97/MindFocusBooks-Native.apk",
    "windowsSetupDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.97/MindFocusBooks-Setup-v0.0.97.exe",
    "windowsPortableDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.97/MindFocusBooks-Portable-v0.0.97.exe",
    "mandatory": false,
    "timestamp": new Date().toISOString()
  },
  "latest": {
    "version": "v0.0.97",
    "name": "Mind Focus Books v0.0.97 (Interactive Reading Progress & Donut Stats Engine)",
    "releaseNotes": "v0.0.97: 100% Real Interactive Reading Progress (Clickable This Month / This Year / All-Time Pills, Real Books Read & Total Books Donut Counter)",
    "apkDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.97/MindFocusBooks-Native.apk",
    "windowsSetupDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.97/MindFocusBooks-Setup-v0.0.97.exe",
    "windowsPortableDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.97/MindFocusBooks-Portable-v0.0.97.exe"
  },
  "stagedRelease": null,
  "min_required_version": "0.0.1",
  "latest_version": "0.0.97",
  "version_code": 8592,
  "download_url": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.97/MindFocusBooks-Native.apk",
  "release_notes": "v0.0.97: 100% Real Interactive Reading Progress (Clickable This Month / This Year / All-Time Pills, Real Books Read & Total Books Donut Counter)",
  "force_update": false,
  "maintenance": false,
  "published_at": new Date().toISOString(),
  "features": {
    "inAppUpdates": true,
    "smartBookDossier": true,
    "exploreModularEngine": true,
    "windowsDesktopSupport": true,
    "aboutAppUpdatesHub": true,
    "nativeDesktopInAppUpdater": true,
    "interactiveReadingProgressPills": true
  }
};
fs.writeFileSync(remoteConfigPath, JSON.stringify(rc, null, 2) + '\n', 'utf8');

const remoteConfigJsPath = path.join(root, 'remote-config.js');
fs.writeFileSync(remoteConfigJsPath, 'window.__DEFAULT_REMOTE_CONFIG__ = ' + JSON.stringify(rc, null, 2) + ';\n', 'utf8');
console.log('remote-config.json & remote-config.js -> v0.0.97');

// 6. broadcast-notice.json & broadcast-notice.js
const bn = {
  "active": true,
  "id": "notice-v0.0.97-progress-engine",
  "version": "v0.0.97",
  "type": "feature",
  "message": "v0.0.97: 100% Real Interactive Reading Progress! Clickable Month / Year / All-Time Donut Stats",
  "actionText": "Check Progress",
  "actionUrl": "#viewProgress",
  "timestamp": new Date().toISOString()
};
fs.writeFileSync(path.join(root, 'broadcast-notice.json'), JSON.stringify(bn, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(root, 'broadcast-notice.js'), 'window.BROADCAST_NOTICE = ' + JSON.stringify(bn, null, 2) + ';\n', 'utf8');
console.log('broadcast-notice.json & broadcast-notice.js -> v0.0.97');

// 7. sw.js
const swPath = path.join(root, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const CACHE_NAME = 'books-tracker-v\d+';/, "const CACHE_NAME = 'books-tracker-v97';");
fs.writeFileSync(swPath, sw, 'utf8');
console.log('sw.js -> books-tracker-v97');
