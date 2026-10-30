const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(appPath, 'utf8');

// Update renderProgressCharts
const target = 'function renderProgressCharts() {\r\n\r\n  const completedCount = state.books.filter(b => b.status === \'DONE\').length;';
const targetLF = 'function renderProgressCharts() {\n\n  const completedCount = state.books.filter(b => b.status === \'DONE\').length;';

const replacement = 'function renderProgressCharts() {\r\n  if (typeof setProgressPillFilter === \'function\') {\r\n    setProgressPillFilter(window.currentProgressPeriod || \'month\');\r\n  }\r\n\r\n  const completedCount = state.books.filter(b => b.status === \'DONE\').length;';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  console.log('Replaced with CRLF target');
} else if (code.includes(targetLF)) {
  code = code.replace(targetLF, replacement.replace(/\r\n/g, '\n'));
  console.log('Replaced with LF target');
} else {
  console.log('Target not found directly, using regex');
  code = code.replace(/function renderProgressCharts\(\)\s*\{[\r\n\s]*const completedCount = state\.books\.filter\(b => b\.status === 'DONE'\)\.length;/, (match) => {
    return 'function renderProgressCharts() {\n  if (typeof setProgressPillFilter === \'function\') {\n    setProgressPillFilter(window.currentProgressPeriod || \'month\');\n  }\n\n  const completedCount = state.books.filter(b => b.status === \'DONE\').length;';
  });
}

// Also update line 17833 window.renderProgressView
code = code.replace('setProgressPillFilter(\'month\');', 'setProgressPillFilter(window.currentProgressPeriod || \'month\');');

fs.writeFileSync(appPath, code, 'utf8');
console.log('renderProgressCharts updated successfully');
