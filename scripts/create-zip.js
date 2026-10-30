const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetZip = 'C:\\Users\\ram\\.gemini\\antigravity\\brain\\aa69dcbb-8cf1-4ff1-bef7-c97eec82f71f\\Mind-Focus-Books-App-Updated.zip';
const rootDir = path.resolve(__dirname, '..');

// Use powershell Compress-Archive
console.log('Archiving project to', targetZip);
if (fs.existsSync(targetZip)) {
  fs.unlinkSync(targetZip);
}

// Compress web files and android project excluding node_modules, .git, dist
const cmd = `powershell -Command "Compress-Archive -Path '${rootDir}\\index.html', '${rootDir}\\style.css', '${rootDir}\\explore.css', '${rootDir}\\explore.js', '${rootDir}\\app.js', '${rootDir}\\book-pages-data.js', '${rootDir}\\books-data.js', '${rootDir}\\dictionary-data.js', '${rootDir}\\broadcast-notice.js', '${rootDir}\\broadcast-notice.json', '${rootDir}\\remote-config.js', '${rootDir}\\remote-config.json', '${rootDir}\\sw.js', '${rootDir}\\manifest.json', '${rootDir}\\electron-main.js', '${rootDir}\\package.json', '${rootDir}\\Mind-Focus-Books-App-Offline.html' -DestinationPath '${targetZip}' -Force"`;

execSync(cmd, { stdio: 'inherit' });
console.log('Zip created successfully.');
