const fs = require('fs');

const dummyElements = {};
global.window = global;
global.window.addEventListener = () => {};
global.localStorage = {
  _store: {},
  getItem: function(k) { return this._store[k] || null; },
  setItem: function(k, v) { this._store[k] = String(v); },
  removeItem: function(k) { delete this._store[k]; }
};

global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    if (!dummyElements[id]) {
      dummyElements[id] = { id, innerText: '', innerHTML: '', style: {}, classList: { toggle: (c, v) => {} } };
    }
    return dummyElements[id];
  },
  querySelector: (sel) => {
    return { innerText: '' };
  },
  querySelectorAll: () => []
};

global.state = {
  books: [
    { title: 'Atomic Habits', status: 'DONE', completed_date: '2026-10-15', total_pages: 320, current_page: 320 },
    { title: 'Deep Work', status: 'READING', total_pages: 280, current_page: 140 },
    { title: 'Psychology of Money', status: 'AVAILABLE', total_pages: 250, current_page: 0 }
  ]
};

const appCode = fs.readFileSync('app.js', 'utf8');
eval(appCode);

console.log('\n--- Testing setProgressPillFilter(\'month\') ---');
setProgressPillFilter('month');
console.log('Center Books Read:', dummyElements['progDonutCenterNum'].innerText);
console.log('Total Books:', dummyElements['progDonutTotalBooks'].innerText);
console.log('Currently Reading:', dummyElements['progDonutReading'].innerText);
console.log('To Read:', dummyElements['progDonutToRead'].innerText);
console.log('Donut Ring offset:', dummyElements['progDonutCircle'].style.strokeDashoffset);

console.log('\n--- Testing setProgressPillFilter(\'all\') ---');
setProgressPillFilter('all');
console.log('Center Books Read:', dummyElements['progDonutCenterNum'].innerText);
console.log('Total Books:', dummyElements['progDonutTotalBooks'].innerText);

console.log('\n--- Testing renderBreakdownList(\'ALL\') ---');
renderBreakdownList('ALL');
console.log('Breakdown container rendered HTML length:', dummyElements['progBreakdownListContainer'].innerHTML.length);
console.log('Tab All Text:', dummyElements['progBreakdownTabAll'].innerText);
console.log('Tab Done Text:', dummyElements['progBreakdownTabDone'].innerText);
console.log('Tab Reading Text:', dummyElements['progBreakdownTabReading'].innerText);
console.log('Tab Wish Text:', dummyElements['progBreakdownTabWish'].innerText);
