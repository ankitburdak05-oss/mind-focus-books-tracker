const fs = require('fs');

const originalDesk = fs.readFileSync('desktop-dashboard.html', 'utf8');
const modalsHtml = fs.readFileSync('scratch/modals_bundle.html', 'utf8');
const detailHtml = fs.readFileSync('scratch/detail_bundle.html', 'utf8');

console.log('Original desktop length:', originalDesk.length);

// 1. Ensure style.css and book-pages-data.js are linked in head
let updated = originalDesk;

if (!updated.includes('<link rel="stylesheet" href="style.css">') && !updated.includes('style.css?')) {
  updated = updated.replace(
    '<script src="books-data.js"></script>',
    '<link rel="stylesheet" href="style.css?v=3.17.1">\n  <script src="book-pages-data.js"></script>\n  <script src="books-data.js"></script>'
  );
}

// 2. Add viewBookDetail inside .desk-content (after deskViewSettings)
const settingsEndTarget = '      </div>\n\n    </main>';
if (updated.includes(settingsEndTarget) && !updated.includes('id="viewBookDetail"')) {
  const detailWrapped = `      </div>\n\n      <!-- ================= DESKTOP VIEW: BOOK DETAIL VIEW ================= -->\n      <div id="deskViewBookDetailWrap" class="desk-view-section" style="display:none; max-width:860px; margin:0 auto; padding-bottom:60px;">\n${detailHtml}\n      </div>\n\n    </main>`;
  updated = updated.replace(settingsEndTarget, detailWrapped);
}

// 3. Add modals right before <script> tag
const scriptTagTarget = '  <script>\n    // ================= DESKTOP DASHBOARD ENGINE =================';
if (updated.includes(scriptTagTarget) && !updated.includes('id="realBookReaderModal"')) {
  const modalsInsertion = `\n  <!-- ================= INJECTED APP MODALS & READER ================= -->\n${modalsHtml}\n\n  <!-- Toast Notification Container -->\n  <div id="toastContainer" class="toast-container" role="status" aria-live="polite"></div>\n\n${scriptTagTarget}`;
  updated = updated.replace(scriptTagTarget, modalsInsertion);
}

// 4. Update the bottom scripts before </body> to include core scripts
const bodyEndTarget = '</body>';
const coreScriptsBlock = `
  <!-- CORE MIND & FOCUS APP SCRIPTS -->
  <script src="jspdf.umd.min.js"></script>
  <script src="jspdf.plugin.autotable.min.js"></script>
  <script src="broadcast-notice.js"></script>
  <script src="remote-config.js"></script>
  <script src="app.js"></script>
</body>`;

if (updated.includes(bodyEndTarget) && !updated.includes('<script src="app.js"></script>')) {
  updated = updated.replace(bodyEndTarget, coreScriptsBlock);
}

fs.writeFileSync('scratch/desktop-dashboard-updated.html', updated);
console.log('Updated desktop length:', updated.length);
