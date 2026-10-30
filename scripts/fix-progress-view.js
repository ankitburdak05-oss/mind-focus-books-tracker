const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(appPath, 'utf8');

// 1. Add setProgressPillFilter implementation right before renderBreakdownList
const progressFilterImpl = `
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
    subLabelText = \`Read in \${curYear}\`;
  } else {
    // 'month'
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    completedInPeriod = allDoneBooks.filter(b => {
      const my = (typeof getBookMonthYear === 'function') ? getBookMonthYear(b) : null;
      if (my) return my.year === curYear && my.month === curMonth;
      return true;
    });
    subLabelText = \`Read in \${monthNames[curMonth]}\`;
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
    elCircle.style.strokeDasharray = \`\${circumference}\`;
    elCircle.style.strokeDashoffset = \`\${offset}\`;
    elCircle.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}
window.setProgressPillFilter = setProgressPillFilter;
`;

// Insert setProgressPillFilter before openProgressBreakdownModal
code = code.replace(
  '// ================= PROGRESS DEEP-DIVE MODALS =================\nfunction openProgressBreakdownModal() {',
  progressFilterImpl + '\n// ================= PROGRESS DEEP-DIVE MODALS =================\nfunction openProgressBreakdownModal() {'
);

// 2. Enhance renderBreakdownList to show counts and support clicking books
const oldRenderBreakdownList = `function renderBreakdownList(status) {
  const container = document.getElementById('progBreakdownListContainer');
  if (!container || !state || !Array.isArray(state.books)) return;

  // Update tabs
  ['ALL', 'DONE', 'READING', 'TO_READ'].forEach(s => {
    const btn = document.getElementById(\`progBreakdownTab\${s === 'ALL' ? 'All' : s === 'DONE' ? 'Done' : s === 'READING' ? 'Reading' : 'Wish'}\`);
    if (btn) {
      if (s === status) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  let list = state.books;
  if (status !== 'ALL') {
    list = state.books.filter(b => b.status === status);
  }

  if (list.length === 0) {
    container.innerHTML = \`<div style="padding:24px;text-align:center;color:var(--text-muted);">Is category me koi kitab nahi mili.</div>\`;
    return;
  }

  container.innerHTML = list.map(b => {
    const statusPill = b.status === 'DONE' ? '🟢 Read' : b.status === 'READING' ? '🟡 Reading' : '⚪ Want to Read';
    const pagesInfo = b.total_pages ? \`\${b.current_page || 0}/\${b.total_pages} p.\` : '';
    return \`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
        <div style="width:38px;height:52px;border-radius:6px;overflow:hidden;flex-shrink:0;background:#1e1b4b;">
          \${b.cover_url ? \`<img src="\${b.cover_url}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='cover_placeholder.jpg'">\` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;">📖</div>'}
        </div>
        <div style="min-width:0;flex:1;">
          <div style="font-size:0.88rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${b.title}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);">\${b.author}</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:0.72rem;margin-top:3px;">
            <span style="font-weight:600;">\${statusPill}</span>
            <span style="color:var(--text-muted);">\${pagesInfo}</span>
          </div>
        </div>
      </div>
    \`;
  }).join('');
}`;

const newRenderBreakdownList = `function renderBreakdownList(status) {
  const container = document.getElementById('progBreakdownListContainer');
  if (!container || !state || !Array.isArray(state.books)) return;

  const allBooks = state.books;
  const doneBooks = allBooks.filter(b => b.status === 'DONE');
  const readingBooks = allBooks.filter(b => b.status === 'READING');
  const toReadBooks = allBooks.filter(b => b.status !== 'DONE' && b.status !== 'READING');

  // Update tabs with live counts
  const tabAll = document.getElementById('progBreakdownTabAll');
  const tabDone = document.getElementById('progBreakdownTabDone');
  const tabReading = document.getElementById('progBreakdownTabReading');
  const tabWish = document.getElementById('progBreakdownTabWish');

  if (tabAll) {
    tabAll.innerText = \`All Books (\${allBooks.length})\`;
    tabAll.classList.toggle('active', status === 'ALL');
  }
  if (tabDone) {
    tabDone.innerText = \`✅ Read (\${doneBooks.length})\`;
    tabDone.classList.toggle('active', status === 'DONE');
  }
  if (tabReading) {
    tabReading.innerText = \`📖 In Progress (\${readingBooks.length})\`;
    tabReading.classList.toggle('active', status === 'READING');
  }
  if (tabWish) {
    tabWish.innerText = \`⏳ Want to Read (\${toReadBooks.length})\`;
    tabWish.classList.toggle('active', status === 'TO_READ');
  }

  let list = allBooks;
  if (status === 'DONE') {
    list = doneBooks;
  } else if (status === 'READING') {
    list = readingBooks;
  } else if (status === 'TO_READ') {
    list = toReadBooks;
  }

  if (list.length === 0) {
    container.innerHTML = \`<div style="padding:28px;text-align:center;color:var(--text-muted);font-size:0.9rem;">Is category me filhaal koi kitab nahi hai.</div>\`;
    return;
  }

  container.innerHTML = list.map(b => {
    const origIndex = allBooks.findIndex(item => item === b || (item.id && item.id === b.id) || (item.title && item.title === b.title));
    const statusPill = b.status === 'DONE' ? '🟢 Read' : b.status === 'READING' ? '🟡 Reading' : '⚪ Want to Read';
    const pagesInfo = b.total_pages ? \`\${b.current_page || 0}/\${b.total_pages} p.\` : '';
    const clickAttr = origIndex >= 0 ? \`onclick="closeProgressBreakdownModal(); openBookDetailViewByIndex(\${origIndex})"\` : '';

    return \`
      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;cursor:pointer;transition:all 0.15s ease;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'" \${clickAttr} title="Tap to open details">
        <div style="width:40px;height:54px;border-radius:8px;overflow:hidden;flex-shrink:0;background:#1e1b4b;box-shadow:0 2px 6px rgba(0,0,0,0.4);">
          \${b.cover_url ? \`<img src="\${b.cover_url}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='cover_placeholder.jpg'">\` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;">📖</div>'}
        </div>
        <div style="min-width:0;flex:1;">
          <div style="font-size:0.9rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(b.title)}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(b.author || 'Unknown')}</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:0.72rem;margin-top:4px;">
            <span style="font-weight:600;">\${statusPill}</span>
            \${pagesInfo ? \`<span style="color:var(--text-muted);">&bull; \${pagesInfo}</span>\` : ''}
            \${b.category ? \`<span style="color:var(--accent-gold);">&bull; \${escapeHtml(b.category)}</span>\` : ''}
          </div>
        </div>
        <div style="color:var(--text-muted);font-size:1.2rem;padding-left:4px;">&rsaquo;</div>
      </div>
    \`;
  }).join('');
}`;

code = code.replace(oldRenderBreakdownList, newRenderBreakdownList);

// 3. Make sure renderProgressCharts calls setProgressPillFilter
code = code.replace(
  'function renderProgressCharts() {\n  const completedCount = state.books.filter(b => b.status === \'DONE\').length;',
  'function renderProgressCharts() {\n  setProgressPillFilter(window.currentProgressPeriod || \'month\');\n  const completedCount = state.books.filter(b => b.status === \'DONE\').length;'
);

// 4. Update the bottom window.renderProgressView
code = code.replace(
  'window.renderProgressView = function() {\n  if (typeof setProgressPillFilter === \'function\') setProgressPillFilter(\'month\');',
  'window.renderProgressView = function() {\n  setProgressPillFilter(window.currentProgressPeriod || \'month\');'
);

fs.writeFileSync(appPath, code, 'utf8');
console.log('Progress View logic patched successfully in app.js');
