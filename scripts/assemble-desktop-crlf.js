const fs = require('fs');

const originalDesk = fs.readFileSync('desktop-dashboard.html', 'utf8');
const modalsHtml = fs.readFileSync('scratch/modals_bundle.html', 'utf8');
const detailHtml = fs.readFileSync('scratch/detail_bundle.html', 'utf8');

// Determine line endings:
const isCRLF = originalDesk.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';

console.log('CRLF detected:', isCRLF);

let content = originalDesk;

// 1. In Head: Add style.css & book-pages-data.js if missing
if (!content.includes('style.css')) {
  content = content.replace(
    `<script src="books-data.js"></script>`,
    `<link rel="stylesheet" href="style.css?v=3.17.1">${eol}  <script src="book-pages-data.js"></script>${eol}  <script src="books-data.js"></script>`
  );
}

// 2. Add deskViewBookDetailWrap right after deskViewSettings
const targetMainClose = `      </div>${eol}${eol}    </main>`;
const replacementMainClose = `      </div>${eol}${eol}      <!-- ================= DESKTOP VIEW: BOOK DETAIL VIEW ================= -->${eol}      <div id="deskViewBookDetailWrap" class="desk-view-section" style="display:none; max-width:960px; margin:0 auto; padding-bottom:60px;">${eol}${detailHtml}${eol}      </div>${eol}${eol}    </main>`;

if (content.includes(targetMainClose) && !content.includes('id="deskViewBookDetailWrap"')) {
  content = content.replace(targetMainClose, replacementMainClose);
  console.log('Added deskViewBookDetailWrap successfully');
} else {
  console.log('Main close target not matched or already present');
}

// 3. Inject Modals right before the script tag
const targetScriptTag = `  <script>${eol}    // ================= DESKTOP DASHBOARD ENGINE =================`;
const replacementScriptTag = `${eol}  <!-- ================= INJECTED FULL APP MODALS ================= -->${eol}${modalsHtml}${eol}${eol}  <!-- Toast Notification Container -->${eol}  <div id="toastContainer" class="toast-container" role="status" aria-live="polite"></div>${eol}${eol}${targetScriptTag}`;

if (content.includes(targetScriptTag) && !content.includes('id="realBookReaderModal"')) {
  content = content.replace(targetScriptTag, replacementScriptTag);
  console.log('Injected modals successfully');
} else {
  console.log('Script tag target not matched or modals already present');
}

// 4. Update core scripts before </body>
const targetBodyClose = `</body>`;
const replacementBodyClose = `  <!-- CORE MIND & FOCUS APP SCRIPTS -->${eol}  <script src="jspdf.umd.min.js"></script>${eol}  <script src="jspdf.plugin.autotable.min.js"></script>${eol}  <script src="broadcast-notice.js"></script>${eol}  <script src="remote-config.js"></script>${eol}  <script src="app.js"></script>${eol}</body>`;

if (content.includes(targetBodyClose) && !content.includes('<script src="app.js"></script>')) {
  content = content.replace(targetBodyClose, replacementBodyClose);
  console.log('Added core scripts successfully');
}

// Write to desktop-dashboard.html
fs.writeFileSync('desktop-dashboard.html', content);
console.log('Updated desktop-dashboard.html! New total length:', content.length);
