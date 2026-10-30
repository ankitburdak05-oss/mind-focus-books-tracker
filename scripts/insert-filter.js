const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(appPath, 'utf8');

const targetStr = '// ================= PROGRESS DEEP-DIVE MODALS =================';
const targetIdx = code.indexOf(targetStr);

console.log('Target index:', targetIdx);

const progressFilterCode = `
// ================= PROGRESS PILLS FILTER & DONUT STATS =================
window.currentProgressPeriod = 'month';

function setProgressPillFilter(period) {
  window.currentProgressPeriod = period || 'month';
  if (typeof playTactileClick === 'function') playTactileClick();

  // 1. Update pill button active states
  const pillMonth = document.getElementById('progPillMonth');
  const pillYear = document.getElementById('progPillYear');
  const pillAll = document.getElementById('progPillAll');

  if (pillMonth) pillMonth.classList.toggle('active', period === 'month');
  if (pillYear) pillYear.classList.toggle('active', period === 'year');
  if (pillAll) pillAll.classList.toggle('active', period === 'all');

  const allBooks = (state && Array.isArray(state.books)) ? state.books : [];
  const totalBooksCount = allBooks.length;
  const readingCount = allBooks.filter(b => b.status === 'READING').length;
  const toReadCount = allBooks.filter(b => b.status !== 'DONE' && b.status !== 'READING').length;
  const allDoneBooks = allBooks.filter(b => b.status === 'DONE');

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  let completedInPeriod = [];
  let subLabelText = 'Books Read';

  if (period === 'all') {
    completedInPeriod = allDoneBooks;
    subLabelText = 'Books Read (All Time)';
  } else if (period === 'year') {
    completedInPeriod = allDoneBooks.filter(b => {
      const my = (typeof getBookMonthYear === 'function') ? getBookMonthYear(b) : null;
      if (my) return my.year === curYear;
      return true;
    });
    subLabelText = 'Read in ' + curYear;
  } else {
    // 'month'
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    completedInPeriod = allDoneBooks.filter(b => {
      const my = (typeof getBookMonthYear === 'function') ? getBookMonthYear(b) : null;
      if (my) return my.year === curYear && my.month === curMonth;
      return true;
    });
    subLabelText = 'Read in ' + monthNames[curMonth];
  }

  const booksReadCount = completedInPeriod.length;

  // 2. Update Donut Center & Stats
  const elCenterNum = document.getElementById('progDonutCenterNum');
  const elSubLabel = document.querySelector('.donut-inner-content .donut-sub-label');
  const elTotal = document.getElementById('progDonutTotalBooks');
  const elReading = document.getElementById('progDonutReading');
  const elToRead = document.getElementById('progDonutToRead');
  const elCircle = document.getElementById('progDonutCircle');

  if (elCenterNum) elCenterNum.innerText = booksReadCount;
  if (elSubLabel) elSubLabel.innerText = subLabelText;
  if (elTotal) elTotal.innerText = totalBooksCount;
  if (elReading) elReading.innerText = readingCount;
  if (elToRead) elToRead.innerText = toReadCount;

  // 3. Update Animated Donut SVG Ring (circumference = 301.59)
  if (elCircle) {
    const circumference = 301.59;
    let pct = totalBooksCount > 0 ? (booksReadCount / totalBooksCount) : 0;
    if (booksReadCount > 0 && pct < 0.08) pct = 0.08;
    const offset = Math.max(0, circumference - (pct * circumference));
    elCircle.style.strokeDasharray = '' + circumference;
    elCircle.style.strokeDashoffset = '' + offset;
    elCircle.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}
window.setProgressPillFilter = setProgressPillFilter;

`;

if (targetIdx !== -1) {
  code = code.slice(0, targetIdx) + progressFilterCode + code.slice(targetIdx);
  fs.writeFileSync(appPath, code, 'utf8');
  console.log('Successfully inserted setProgressPillFilter into app.js');
} else {
  console.error('Target string not found');
}
