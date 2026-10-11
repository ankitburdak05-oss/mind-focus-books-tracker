const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// List of all modals and secondary sections needed by app.js:
// 1. Modals
const modalStartToken = '<!-- ================= REAL 3D MULTI-LANGUAGE BOOK READER MODAL ================= -->';
const modalEndToken = '<!-- Toast Notification Container -->';
const modalsHtml = indexHtml.substring(indexHtml.indexOf(modalStartToken), indexHtml.indexOf(modalEndToken));

// 2. Missing IDs placeholder block
const missingStartToken = '<!-- Hidden Placeholder Block for Missing Element IDs Referenced in app.js -->';
const missingEndToken = '<!-- Toast Notification Container -->';
const missingHtml = indexHtml.substring(indexHtml.indexOf(missingStartToken), indexHtml.indexOf(missingEndToken));

// 3. Book Detail View section
const detailStartToken = '<section id="viewBookDetail" class="app-view">';
const detailEndToken = '<!-- ================= SCREEN 8: FOCUS TIMER ================= -->';
const detailHtml = indexHtml.substring(indexHtml.indexOf(detailStartToken), indexHtml.indexOf(detailEndToken));

console.log('Modals length:', modalsHtml.length);
console.log('Missing block length:', missingHtml.length);
console.log('Detail section length:', detailHtml.length);

fs.writeFileSync('scratch/modals_bundle.html', modalsHtml);
fs.writeFileSync('scratch/detail_bundle.html', detailHtml);
