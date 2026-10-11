const fs = require('fs');
const content = fs.readFileSync('desktop-dashboard.html', 'utf8');
const regex = /onclick="([^"]+)"/g;
let m;
const set = new Set();
while ((m = regex.exec(content)) !== null) {
  set.add(m[1]);
}
console.log('Total unique onclicks:', set.size);
Array.from(set).sort().forEach(s => console.log(s));
