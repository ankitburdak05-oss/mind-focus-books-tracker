const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const androidAssets = path.join(root, 'android', 'app', 'src', 'main', 'assets');

if (!fs.existsSync(androidAssets)) {
  fs.mkdirSync(androidAssets, { recursive: true });
}

const filesToCopy = [
  'index.html',
  'style.css',
  'explore.css',
  'explore.js',
  'app.js',
  'book-pages-data.js',
  'books-data.js',
  'dictionary-data.js',
  'broadcast-notice.js',
  'broadcast-notice.json',
  'remote-config.js',
  'remote-config.json',
  'sw.js',
  'manifest.json',
  'Mind-Focus-Books-App-Offline.html'
];

filesToCopy.forEach(f => {
  const src = path.join(root, f);
  const dest = path.join(androidAssets, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${f} to Android assets`);
  }
});

console.log('Android assets synced successfully.');
