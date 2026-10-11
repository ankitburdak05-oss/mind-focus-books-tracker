const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Modals & Popups
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

// 2. Book Detail View
const s1 = indexHtml.indexOf('<section id="viewBookDetail"');
const s2 = indexHtml.indexOf('<!-- ================= SCREEN 8: FOCUS TIMER ================= -->');

if (s1 !== -1 && s2 !== -1) {
  const detailHtml = indexHtml.substring(s1, s2);
  fs.writeFileSync('scratch/detail_extracted.html', detailHtml);
  console.log('Successfully extracted viewBookDetail. Length:', detailHtml.length);
} else {
  console.error('Could not find viewBookDetail delimiters');
}
