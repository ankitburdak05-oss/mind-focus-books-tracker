const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(appPath, 'utf8');

const startMarker = 'function renderBreakdownList(status) {';
const endMarker = 'function openProgressStreakModal() {';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);

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
}

`;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.slice(0, startIdx) + newRenderBreakdownList + code.slice(endIdx);
  fs.writeFileSync(appPath, code, 'utf8');
  console.log('renderBreakdownList replaced successfully');
}
