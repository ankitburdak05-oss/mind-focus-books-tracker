const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

// 1. Check duplicate IDs in index.html
const idRegex = /\bid=["']([^"']+)["']/g;
const ids = {};
const duplicates = [];
let m;
while ((m = idRegex.exec(html)) !== null) {
  const id = m[1];
  if (ids[id]) {
    duplicates.push(id);
  }
  ids[id] = (ids[id] || 0) + 1;
}
console.log('--- Duplicate IDs in index.html ---');
console.log(duplicates.length ? duplicates : 'None found! ✅');

// 2. Unchecked direct property accesses on getElementById
console.log('\n--- Checking Direct Unchecked getElementById calls in app.js ---');
const lines = appJs.split('\n');
const directRegex = /document\.getElementById\(['"]([a-zA-Z0-9_-]+)['"]\)\.([a-zA-Z0-9_$]+)/g;
let directHits = 0;
lines.forEach((l, idx) => {
  let hit;
  while ((hit = directRegex.exec(l)) !== null) {
    const id = hit[1];
    const prop = hit[2];
    if (!ids[id]) {
      console.log(`Line ${idx+1}: Unchecked access .${prop} on non-existent element #${id}`);
      directHits++;
    }
  }
});
if (directHits === 0) {
  console.log('All direct getElementById property accesses point to valid HTML elements! ✅');
}

// 3. Check for any unresolved JSON / broken data
console.log('\n--- Checking data files ---');
try {
  JSON.parse(fs.readFileSync('broadcast-notice.json', 'utf8'));
  console.log('broadcast-notice.json is valid JSON! ✅');
} catch (e) {
  console.error('broadcast-notice.json error:', e.message);
}

try {
  JSON.parse(fs.readFileSync('remote-config.json', 'utf8'));
  console.log('remote-config.json is valid JSON! ✅');
} catch (e) {
  console.error('remote-config.json error:', e.message);
}

// 4. Check CSS syntax
const css = fs.readFileSync('style.css', 'utf8');
// Check unclosed braces
let braceCount = 0;
for (let i = 0; i < css.length; i++) {
  if (css[i] === '{') braceCount++;
  else if (css[i] === '}') braceCount--;
  if (braceCount < 0) {
    console.error(`CSS unmatched closing brace at character ${i}`);
    break;
  }
}
console.log(`CSS Braces balance: ${braceCount === 0 ? 'Perfect match! ✅' : 'Unbalanced (' + braceCount + ') ❌'}`);

// 5. Check HTML tags balance
console.log('\n--- Checking HTML script and link tags ---');
const scriptSrcs = [];
const scriptRegex = /<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
while ((m = scriptRegex.exec(html)) !== null) {
  scriptSrcs.push(m[1]);
}
console.log('Script files included in index.html:');
scriptSrcs.forEach(src => {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    console.log(`  [External CDN] ${src}`);
  } else {
    const exists = fs.existsSync(src.split('?')[0]);
    console.log(`  [Local] ${src} -> ${exists ? 'EXISTS ✅' : 'MISSING ❌'}`);
  }
});

// Check css links
const linkRegex = /<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
while ((m = linkRegex.exec(html)) !== null) {
  const href = m[1];
  if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('data:')) {
    const exists = fs.existsSync(href.split('?')[0]);
    console.log(`  [CSS/Icon] ${href} -> ${exists ? 'EXISTS ✅' : 'MISSING ❌'}`);
  }
}
