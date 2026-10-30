const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes("status === 'DONE'") || l.includes('completed_date') || l.includes('end_date')) {
    console.log((i+1) + ': ' + l.trim().slice(0, 90));
  }
});
