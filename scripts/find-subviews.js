const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('class="app-view"') || l.includes("class='app-view'")) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
  }
});
