const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Find start of modals
const modalStartToken = '<!-- ================= REAL 3D MULTI-LANGUAGE BOOK READER MODAL ================= -->';
const modalEndToken = '<!-- Toast Notification Container -->';

const p1 = indexHtml.indexOf(modalStartToken);
const p2 = indexHtml.indexOf(modalEndToken);

if (p1 === -1 || p2 === -1) {
  console.error('Could not find modal delimiters in index.html');
  process.exit(1);
}

const modalsHtml = indexHtml.substring(p1, p2);
fs.writeFileSync('scratch/modals_extracted.html', modalsHtml);
console.log('Successfully extracted modals. Length:', modalsHtml.length);
