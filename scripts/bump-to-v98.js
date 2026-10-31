const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. package.json
const pkgPath = path.join(root, 'package.json');
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = '0.0.98';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('package.json updated to 0.0.98');

// 2. android/app/build.gradle
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  gradle = gradle.replace(/versionCode\s+\d+/, 'versionCode 8593');
  gradle = gradle.replace(/versionName\s+["'][^"']+["']/, 'versionName "0.0.98"');
  fs.writeFileSync(gradlePath, gradle, 'utf8');
  console.log('android/app/build.gradle updated to versionCode 8593, versionName 0.0.98');
}

// 3. app.js
const appPath = path.join(root, 'app.js');
let appCode = fs.readFileSync(appPath, 'utf8');
appCode = appCode.replace(/const\s+CURRENT_APP_VERSION\s*=\s*['"]v?0\.0\.97['"]/, "const CURRENT_APP_VERSION = 'v0.0.98'");
appCode = appCode.replace(/let\s+CURRENT_APP_VERSION\s*=\s*['"]v?0\.0\.97['"]/, "let CURRENT_APP_VERSION = 'v0.0.98'");
appCode = appCode.replace(/CURRENT_APP_VERSION\s*=\s*['"]v?0\.0\.97['"]/g, "CURRENT_APP_VERSION = 'v0.0.98'");
fs.writeFileSync(appPath, appCode, 'utf8');
console.log('app.js version bumped');

// 4. index.html
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/Version 0\.0\.97/g, 'Version 0.0.98');
html = html.replace(/v0\.0\.97/g, 'v0.0.98');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html version bumped');

// 5. sw.js
const swPath = path.join(root, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/books-tracker-v\d+/g, 'books-tracker-v98');
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('sw.js updated to books-tracker-v98');
}

// 6. remote-config.json & remote-config.js
const rcJsonPath = path.join(root, 'remote-config.json');
const rcJsPath = path.join(root, 'remote-config.js');
const rcData = {
  "latest_version": "v0.0.98",
  "min_supported_version": "v0.0.80",
  "critical_update": false,
  "changelog_hindi": "v0.0.98: Phone <-> Laptop Wireless Sync Hub (5-Character Pairing & QR Scanner/Photo Import), Book Lending Tracker fully connected, and offline multi-device reading sync!",
  "update_url_windows": "https://github.com/ram1122334455/Mind-focus-Books/releases/download/v0.0.98/MindFocusBooks-Portable-v0.0.98.exe",
  "update_url_android": "https://github.com/ram1122334455/Mind-focus-Books/releases/download/v0.0.98/MindFocusBooks-v0.0.98.apk",
  "timestamp": new Date().toISOString()
};
fs.writeFileSync(rcJsonPath, JSON.stringify(rcData, null, 2) + '\n', 'utf8');
fs.writeFileSync(rcJsPath, `// Remote Config Fallback for GitHub Pages & Local WebView
window.MIND_FOCUS_REMOTE_CONFIG = ${JSON.stringify(rcData, null, 2)};
`, 'utf8');
console.log('remote-config.json & remote-config.js updated');

// 7. broadcast-notice.json & broadcast-notice.js
const bnJsonPath = path.join(root, 'broadcast-notice.json');
const bnJsPath = path.join(root, 'broadcast-notice.js');
const bnData = {
  "id": "v0.0.98-sync-update",
  "title": "🎉 Phone ↔ Laptop Sync Hub Live!",
  "message": "Ab aap apne Phone aur Laptop ke beech bina kisi cable ya login ke sirf 5-akshar ke code ya QR photo upload se saara book data sync kar sakte hain!",
  "type": "feature",
  "version": "v0.0.98",
  "date": new Date().toISOString().split('T')[0]
};
fs.writeFileSync(bnJsonPath, JSON.stringify(bnData, null, 2) + '\n', 'utf8');
fs.writeFileSync(bnJsPath, `// Broadcast Notice Fallback
window.MIND_FOCUS_BROADCAST_NOTICE = ${JSON.stringify(bnData, null, 2)};
`, 'utf8');
console.log('broadcast-notice.json & broadcast-notice.js updated');
