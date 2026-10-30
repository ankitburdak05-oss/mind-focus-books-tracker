const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 1. package.json
const pkgPath = path.join(root, 'package.json');
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = '0.0.96';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('package.json -> 0.0.96');

// 2. build.gradle
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode\s+\d+/, 'versionCode 8591');
gradle = gradle.replace(/versionName\s+"[^"]+"/, 'versionName "0.0.96"');
fs.writeFileSync(gradlePath, gradle, 'utf8');
console.log('build.gradle -> 8591, 0.0.96');

// 3. remote-config.json
const remoteConfigPath = path.join(root, 'remote-config.json');
let rc = {
  "activeRelease": {
    "version": "v0.0.96",
    "name": "Mind Focus Books v0.0.96 (Native In-App Desktop Updater & Live Radar Engine)",
    "releaseNotes": "v0.0.96: Native In-App Desktop Updater (No browser opening, real MB & speed progress bar, automatic app close & seamless Windows setup launcher)",
    "apkDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.96/MindFocusBooks-Native.apk",
    "windowsSetupDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.96/MindFocusBooks-Setup-v0.0.96.exe",
    "windowsPortableDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.96/MindFocusBooks-Portable-v0.0.96.exe",
    "mandatory": false,
    "timestamp": new Date().toISOString()
  },
  "latest": {
    "version": "v0.0.96",
    "name": "Mind Focus Books v0.0.96 (Native In-App Desktop Updater & Live Radar Engine)",
    "releaseNotes": "v0.0.96: Native In-App Desktop Updater (No browser opening, real MB & speed progress bar, automatic app close & seamless Windows setup launcher)",
    "apkDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.96/MindFocusBooks-Native.apk",
    "windowsSetupDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.96/MindFocusBooks-Setup-v0.0.96.exe",
    "windowsPortableDownloadUrl": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.96/MindFocusBooks-Portable-v0.0.96.exe"
  },
  "stagedRelease": null,
  "min_required_version": "0.0.1",
  "latest_version": "0.0.96",
  "version_code": 8591,
  "download_url": "https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/v0.0.96/MindFocusBooks-Native.apk",
  "release_notes": "v0.0.96: Native In-App Desktop Updater (No browser opening, real MB & speed progress bar, automatic app close & seamless Windows setup launcher)",
  "force_update": false,
  "maintenance": false,
  "published_at": new Date().toISOString(),
  "features": {
    "inAppUpdates": true,
    "smartBookDossier": true,
    "exploreModularEngine": true,
    "windowsDesktopSupport": true,
    "aboutAppUpdatesHub": true,
    "nativeDesktopInAppUpdater": true
  }
};
fs.writeFileSync(remoteConfigPath, JSON.stringify(rc, null, 2) + '\n', 'utf8');

const remoteConfigJsPath = path.join(root, 'remote-config.js');
fs.writeFileSync(remoteConfigJsPath, 'window.__DEFAULT_REMOTE_CONFIG__ = ' + JSON.stringify(rc, null, 2) + ';\n', 'utf8');
console.log('remote-config.json & remote-config.js -> v0.0.96');

// 4. broadcast-notice.json & broadcast-notice.js
const bn = {
  "active": true,
  "id": "notice-v0.0.96-desktop-inapp-updater",
  "version": "v0.0.96",
  "type": "feature",
  "message": "v0.0.96: Real In-App Desktop Updater! No browser opening, live MB progress bar & auto installer launch",
  "actionText": "Check About & Updates",
  "actionUrl": "#viewAboutApp",
  "timestamp": new Date().toISOString()
};
fs.writeFileSync(path.join(root, 'broadcast-notice.json'), JSON.stringify(bn, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(root, 'broadcast-notice.js'), 'window.BROADCAST_NOTICE = ' + JSON.stringify(bn, null, 2) + ';\n', 'utf8');
console.log('broadcast-notice.json & broadcast-notice.js -> v0.0.96');

// 5. sw.js
const swPath = path.join(root, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const CACHE_NAME = 'books-tracker-v\d+';/, "const CACHE_NAME = 'books-tracker-v96';");
fs.writeFileSync(swPath, sw, 'utf8');
console.log('sw.js -> books-tracker-v96');
