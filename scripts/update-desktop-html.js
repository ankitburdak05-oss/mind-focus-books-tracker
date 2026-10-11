const fs = require('fs');

let html = fs.readFileSync('desktop-dashboard.html', 'utf8');

// Find the start of the inline desktop engine script:
const startTag = '<script>\r\n    // ================= DESKTOP DASHBOARD ENGINE';
let startIdx = html.indexOf(startTag);
if (startIdx === -1) {
  startIdx = html.indexOf('<script>\n    // ================= DESKTOP DASHBOARD ENGINE');
}

if (startIdx === -1) {
  console.error('Could not find start of inline script');
  process.exit(1);
}

// Find the closing </script> for this inline script block
const endTag = '</script>';
const endIdx = html.indexOf(endTag, startIdx);

if (endIdx === -1) {
  console.error('Could not find end of inline script');
  process.exit(1);
}

// Extract content before the inline script
const before = html.substring(0, startIdx);

// The core app scripts block that comes after
const scriptsBlock = `  <!-- CORE MIND & FOCUS APP SCRIPTS -->
  <script src="jspdf.umd.min.js"></script>
  <script src="jspdf.plugin.autotable.min.js"></script>
  <script src="broadcast-notice.js"></script>
  <script src="remote-config.js"></script>
  <script src="app.js"></script>
  <!-- LUXURY DESKTOP WORKSPACE ENGINE -->
  <script src="desktop-engine.js"></script>
</body>
</html>`;

// Construct new HTML
const newHtml = before + scriptsBlock;

fs.writeFileSync('desktop-dashboard.html', newHtml, 'utf8');
console.log('Successfully updated desktop-dashboard.html! Total size:', newHtml.length);
