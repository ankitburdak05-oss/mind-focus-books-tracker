const STORAGE_KEY = 'mind_focus_books_v1';
const THEME_KEY = 'mind_focus_theme_v1';

let state = {
  books: [],
  searchQuery: '',
  statusFilter: 'ALL',
  categoryFilter: 'ALL',
  availabilityFilter: 'ALL',
  sortBy: 'no_asc',
  viewMode: 'table',
  currentPage: 1,
  pageSize: 25,
  editingBookIndex: -1,
  theme: 'dark'
};

const ICONS = {
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>'
};

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadData();
  populateCategoryDropdown();
  setupEventListeners();
  renderApp();
});
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  state.theme = saved;
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeButton();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem(THEME_KEY, state.theme);
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = state.theme === 'dark' ? (ICONS.sun + ' Light') : (ICONS.moon + ' Dark');
  }
}

function loadData() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      state.books = JSON.parse(local);
    } catch (e) {
      state.books = (typeof DEFAULT_BOOKS !== 'undefined') ? [...DEFAULT_BOOKS] : [];
    }
  } else {
    state.books = (typeof DEFAULT_BOOKS !== 'undefined') ? [...DEFAULT_BOOKS] : [];
  }

  // Live recalculate days for reading books
  state.books.forEach(b => {
    if (b.status === 'READING' && b.start_date) {
      b.count_days = getBookEffectiveDays(b);
    }
  });
  saveData();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.books));
}

function populateCategoryDropdown() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;
  const cats = Array.from(new Set(state.books.map(b => b.category).filter(Boolean))).sort();
  select.innerHTML = '<option value="ALL">All Categories</option>' + 
    cats.map(c => '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>').join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function calculateDaysDifference(start, end) {
  if (!start) return 0;
  const sParts = String(start).split('-');
  const eParts = String(end || getTodayString()).split('-');
  if (sParts.length < 3 || eParts.length < 3) return 0;
  const sDate = new Date(parseInt(sParts[0]), parseInt(sParts[1]) - 1, parseInt(sParts[2]));
  const eDate = new Date(parseInt(eParts[0]), parseInt(eParts[1]) - 1, parseInt(eParts[2]));
  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) return 0;
  const diffTime = eDate.getTime() - sDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function getBookEffectiveEndDate(b) {
  if (b.status === 'READING') {
    return getTodayString();
  }
  return b.end_date || '';
}

function getBookEffectiveDays(b) {
  if (b.status === 'READING') {
    if (b.start_date) {
      return calculateDaysDifference(b.start_date, getTodayString());
    }
    return 0;
  } else if (b.status === 'DONE') {
    if (b.start_date && b.end_date) {
      return calculateDaysDifference(b.start_date, b.end_date);
    }
    return parseInt(b.count_days) || 0;
  }
  return parseInt(b.count_days) || 0;
}

// Change Tracking & Update Logic
let pendingChanges = 0;

function markChange() {
  pendingChanges++;
  const btn = document.getElementById('headerUpdateBtn');
  const txt = document.getElementById('updateBtnText');
  if (btn && txt) {
    txt.innerHTML = '💾 Update (' + pendingChanges + ' Change' + (pendingChanges > 1 ? 's' : '') + ')';
    btn.style.display = 'inline-flex';
    btn.classList.remove('btn-updated');
    btn.classList.add('pulse-btn');
  }
}

function handleUpdateClick() {
  saveData();

  // If running inside desktop app (pywebview), save directly to disk books-data.js as well
  if (window.pywebview && window.pywebview.api && window.pywebview.api.save_books) {
    window.pywebview.api.save_books(JSON.stringify(state.books)).then(() => {
      console.log('Saved to books-data.js file on disk!');
    }).catch(e => console.log('Disk save note:', e));
  }

  const btn = document.getElementById('headerUpdateBtn');
  const txt = document.getElementById('updateBtnText');
  if (btn && txt) {
    btn.classList.remove('pulse-btn');
    btn.classList.add('btn-updated');
    txt.innerHTML = '✅ Updated!';
    showToast('All ' + pendingChanges + ' changes successfully updated and saved!', 'success');
    pendingChanges = 0;
    setTimeout(() => {
      if (pendingChanges === 0) {
        btn.style.display = 'none';
        btn.classList.remove('btn-updated');
      }
    }, 2500);
  }
}

function onStatusChange(index, newStatus) {
  const book = state.books[index];
  if (!book) return;

  const today = getTodayString();
  book.status = newStatus;

  if (newStatus === 'READING') {
    if (!book.start_date) {
      book.start_date = today;
    }
    book.end_date = '';
    book.count_days = calculateDaysDifference(book.start_date, today);
    showToast('Started reading: "' + book.title + '"!', 'success');
  } else if (newStatus === 'DONE') {
    if (!book.start_date) {
      book.start_date = today;
    }
    if (!book.end_date) {
      book.end_date = today;
    }
    book.count_days = calculateDaysDifference(book.start_date, book.end_date);
    showToast('Completed book: "' + book.title + '"! 🎉', 'success');
    // Feature 4: Open Completion Card
    setTimeout(() => {
      openCompletionCard(index);
    }, 600);
  } else if (newStatus === 'PENDING') {
    book.end_date = '';
    showToast('Marked "' + book.title + '" as Pending.', '');
  }

  markChange();
  saveData();
  renderApp();
}

function onRatingChange(index, rating) {
  if (state.books[index]) {
    state.books[index].rating = rating;
    markChange();
    saveData();
    renderApp();
    showToast('Rated ' + rating + ' ★ for "' + state.books[index].title + '"', 'success');
  }
}

function getFilteredAndSortedBooks() {
  let list = state.books.map((b, originalIndex) => ({ ...b, originalIndex }));

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(b => 
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.no && b.no.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.takeaway && b.takeaway.toLowerCase().includes(q))
    );
  }

  if (state.statusFilter !== 'ALL') {
    list = list.filter(b => (b.status || 'PENDING').toUpperCase() === state.statusFilter);
  }

  if (state.categoryFilter !== 'ALL') {
    list = list.filter(b => b.category === state.categoryFilter);
  }

  if (state.availabilityFilter !== 'ALL') {
    list = list.filter(b => (b.availability || 'AVAILABLE').toUpperCase() === state.availabilityFilter);
  }

  list.sort((a, b) => {
    switch (state.sortBy) {
      case 'no_asc': {
        const numA = parseInt((a.no || '').replace(/\D/g, '')) || 0;
        const numB = parseInt((b.no || '').replace(/\D/g, '')) || 0;
        return numA - numB;
      }
      case 'no_desc': {
        const numA = parseInt((a.no || '').replace(/\D/g, '')) || 0;
        const numB = parseInt((b.no || '').replace(/\D/g, '')) || 0;
        return numB - numA;
      }
      case 'title_asc': return (a.title || '').localeCompare(b.title || '');
      case 'title_desc': return (b.title || '').localeCompare(a.title || '');
      case 'author_asc': return (a.author || '').localeCompare(b.author || '');
      case 'rating_desc': return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      case 'days_desc': return (Number(b.count_days) || 0) - (Number(a.count_days) || 0);
      default: return 0;
    }
  });

  return list;
}

function renderApp() {
  renderStatistics();
  renderCategoryPills();
  renderBookList();
}

function renderStatistics() {
  const total = state.books.length;
  const done = state.books.filter(b => b.status === 'DONE').length;
  const reading = state.books.filter(b => b.status === 'READING').length;
  const pending = state.books.filter(b => !b.status || b.status === 'PENDING').length;

  let totalDays = 0;
  let booksWithDays = 0;
  state.books.forEach(b => {
    const days = getBookEffectiveDays(b);
    if (days > 0) {
      totalDays += days;
      booksWithDays++;
    }
  });

  const avgDays = booksWithDays > 0 ? (totalDays / booksWithDays).toFixed(1) : '0';
  const pct = total > 0 ? ((done / total) * 100).toFixed(1) : '0.0';

  // Feature 5: Money & Time Invested (ROI of Reading)
  // Assuming average book price = ₹399 & average reading time = 6 hours per completed book + 1 hr/reading
  const moneyValue = (done * 399).toLocaleString('en-IN');
  const hoursInvested = Math.round((done * 6) + (reading * 2) + (totalDays * 0.5));

  const moneyEl = document.getElementById('kpiMoneySaved');
  if (moneyEl) moneyEl.innerText = '₹' + moneyValue;

  const hoursEl = document.getElementById('kpiHoursInvested');
  if (hoursEl) hoursEl.innerText = hoursInvested + ' hrs';

  const pctEl = document.getElementById('progressPctText');
  if (pctEl) pctEl.innerText = pct + '% Completed';
  const subEl = document.getElementById('progressSubText');
  if (subEl) subEl.innerText = '(' + done + ' / ' + total + ' Books Finished)';
  const barEl = document.getElementById('progressBarFill');
  if (barEl) barEl.style.width = pct + '%';

  const tbEl = document.getElementById('kpiTotalBooks');
  if (tbEl) tbEl.innerText = total;
  const bdEl = document.getElementById('kpiBooksDone');
  if (bdEl) bdEl.innerText = done;
  const crEl = document.getElementById('kpiCurrentlyReading');
  if (crEl) crEl.innerText = reading;
  const tdEl = document.getElementById('kpiTotalDays');
  if (tdEl) tdEl.innerText = totalDays;
  const adEl = document.getElementById('kpiAvgDays');
  if (adEl) adEl.innerText = avgDays;

  const caEl = document.getElementById('countAll');
  if (caEl) caEl.innerText = total;
  const cReadingEl = document.getElementById('countReading');
  if (cReadingEl) cReadingEl.innerText = reading;
  const cDoneEl = document.getElementById('countDone');
  if (cDoneEl) cDoneEl.innerText = done;
  const cPendingEl = document.getElementById('countPending');
  if (cPendingEl) cPendingEl.innerText = pending;
}

function renderCategoryPills() {
  const container = document.getElementById('categoryTagsContainer');
  if (!container) return;

  const catCounts = {};
  state.books.forEach(b => {
    const c = b.category || 'Uncategorized';
    catCounts[c] = (catCounts[c] || 0) + 1;
  });

  const categories = Object.keys(catCounts).sort();
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

  let html = categories.map((cat, i) => {
    const color = colors[i % colors.length];
    const isAct = state.categoryFilter === cat ? 'active' : '';
    return '<button class="cat-tag-btn ' + isAct + '" onclick="setCategoryFilter(\'' + escapeHtml(cat) + '\')">' +
      '<span class="cat-color-dot" style="background:' + color + '"></span>' +
      '<span>' + escapeHtml(cat) + '</span>' +
      '<span style="opacity:0.75; font-size:0.72rem;">(' + catCounts[cat] + ')</span>' +
      '</button>';
  }).join('');

  container.innerHTML = html;
}
function renderBookList() {
  const filtered = getFilteredAndSortedBooks();
  const totalItems = filtered.length;

  const totalPages = Math.ceil(totalItems / state.pageSize) || 1;
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  const startIdx = (state.currentPage - 1) * state.pageSize;
  const paginated = filtered.slice(startIdx, startIdx + state.pageSize);

  const container = document.getElementById('booksContentArea');
  const paginationContainer = document.getElementById('paginationArea');

  if (totalItems === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><h3>No books found</h3><p>Try clearing your search query or changing active filters.</p><button class="btn btn-primary" style="margin-top:1rem;" onclick="resetFilters()">Reset Filters</button></div>';
    paginationContainer.innerHTML = '';
    return;
  }

  if (state.viewMode === 'table') {
    renderTableView(container, paginated);
  } else {
    renderGridView(container, paginated);
  }

  renderPagination(paginationContainer, totalItems, totalPages);
}

function renderTableView(container, books) {
  let html = '<div class="table-wrapper"><table class="books-table"><thead><tr>' +
    '<th class="sortable" onclick="handleSort(\'no\')">NO</th>' +
    '<th class="sortable" onclick="handleSort(\'title\')">BOOK TITLE</th>' +
    '<th class="sortable" onclick="handleSort(\'author\')">AUTHOR</th>' +
    '<th>CATEGORY</th>' +
    '<th>STATUS</th>' +
    '<th>START DATE</th>' +
    '<th>END DATE</th>' +
    '<th class="sortable" onclick="handleSort(\'days\')">DAYS</th>' +
    '<th class="sortable" onclick="handleSort(\'rating\')">RATING</th>' +
    '<th>TAKEAWAY</th>' +
    '<th>ACTIONS</th></tr></thead><tbody>';

  books.forEach(b => {
    const origIdx = b.originalIndex;
    const days = getBookEffectiveDays(b);
    const isReading = b.status === 'READING';
    const endDateDisplay = isReading 
      ? '<span class="badge" style="background:rgba(59,130,246,0.18); color:var(--status-reading-text); border:1px solid var(--status-reading-border); font-size:0.75rem; font-weight:600;">' + getTodayString() + ' (Today)</span>'
      : (b.end_date || '-');
    const daysBadge = isReading
      ? '<span class="badge-days" style="color:#60a5fa; border-color:#2563eb; background:rgba(59,130,246,0.1);">' + days + ' d 🔥</span>'
      : '<span class="badge-days">' + days + ' d</span>';
    const hasNotes = b.takeaway && b.takeaway.trim().length > 0;
    const ratingNum = parseInt(b.rating) || 0;

    let starsHtml = '';
    for (let s = 1; s <= 5; s++) {
      starsHtml += '<span class="' + (s <= ratingNum ? 'filled' : '') + '" onclick="onRatingChange(' + origIdx + ', ' + s + ')">★</span>';
    }

    html += '<tr>' +
      '<td style="font-weight:700; color:var(--text-muted);">' + escapeHtml(b.no) + '</td>' +
      '<td class="book-title-cell"><div class="book-title-text">' + escapeHtml(b.title) + '</div>' +
      '<div class="book-author-text">' + escapeHtml(b.author) + ' • ' + escapeHtml(b.language || 'HINDI') + '</div></td>' +
      '<td>' + escapeHtml(b.author) + '</td>' +
      '<td><span class="badge badge-cat">' + escapeHtml(b.category || 'General') + '</span></td>' +
      '<td><select class="status-select status-' + (b.status || 'PENDING') + '" onchange="onStatusChange(' + origIdx + ', this.value)">' +
      '<option value="PENDING" ' + (b.status === 'PENDING' ? 'selected' : '') + '>⏳ PENDING</option>' +
      '<option value="READING" ' + (b.status === 'READING' ? 'selected' : '') + '>📖 READING</option>' +
      '<option value="DONE" ' + (b.status === 'DONE' ? 'selected' : '') + '>✅ DONE</option>' +
      '</select></td>' +
      '<td style="font-size:0.82rem; color:var(--text-secondary);">' + (b.start_date || '-') + '</td>' +
      '<td style="font-size:0.82rem;">' + endDateDisplay + '</td>' +
      '<td>' + daysBadge + '</td>' +
      '<td><div class="star-rating">' + starsHtml + '</div></td>' +
      '<td><button class="takeaway-btn ' + (hasNotes ? 'has-content' : '') + '" onclick="openTakeawayModal(' + origIdx + ')">' +
      ICONS.note + ' ' + (hasNotes ? 'Notes' : 'Add Note') + '</button></td>' +
      '<td><div style="display:flex; gap:0.35rem;">' +
      (b.status === 'DONE' ? '<button class="btn btn-icon-only btn-sm" title="View Completion Certificate" style="color:#10b981;" onclick="openCompletionCard(' + origIdx + ')">🏆</button>' : '') +
      '<button class="btn btn-icon-only btn-sm" title="Edit book" onclick="openEditModal(' + origIdx + ')">' + ICONS.edit + '</button>' +
      '<button class="btn btn-icon-only btn-sm btn-danger" title="Delete book" onclick="deleteBook(' + origIdx + ')">' + ICONS.trash + '</button>' +
      '</div></td></tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function renderGridView(container, books) {
  let html = '<div class="books-grid">';
  books.forEach(b => {
    const origIdx = b.originalIndex;
    const days = getBookEffectiveDays(b);
    const isReading = b.status === 'READING';
    const endDateDisplay = isReading 
      ? '<span class="badge" style="background:rgba(59,130,246,0.18); color:var(--status-reading-text); border:1px solid var(--status-reading-border); font-size:0.75rem; font-weight:600;">' + getTodayString() + ' (Today)</span>'
      : (b.end_date || '-');
    const daysBadge = isReading
      ? '<span class="badge-days" style="color:#60a5fa; border-color:#2563eb; background:rgba(59,130,246,0.1);">' + days + ' d 🔥</span>'
      : '<span class="badge-days">' + days + ' d</span>';
    const ratingNum = parseInt(b.rating) || 0;
    let starsHtml = '';
    for (let s = 1; s <= 5; s++) {
      starsHtml += '<span class="' + (s <= ratingNum ? 'filled' : '') + '" onclick="onRatingChange(' + origIdx + ', ' + s + ')">★</span>';
    }

    html += '<div class="book-card">' +
      '<div class="book-card-header"><div>' +
      '<div class="book-card-no">' + escapeHtml(b.no) + '</div>' +
      '<div class="book-card-title">' + escapeHtml(b.title) + '</div>' +
      '<div class="book-card-author">by ' + escapeHtml(b.author) + ' • ' + escapeHtml(b.language || 'HINDI') + '</div></div>' +
      '<select class="status-select status-' + (b.status || 'PENDING') + '" onchange="onStatusChange(' + origIdx + ', this.value)">' +
      '<option value="PENDING" ' + (b.status === 'PENDING' ? 'selected' : '') + '>⏳ PENDING</option>' +
      '<option value="READING" ' + (b.status === 'READING' ? 'selected' : '') + '>📖 READING</option>' +
      '<option value="DONE" ' + (b.status === 'DONE' ? 'selected' : '') + '>✅ DONE</option>' +
      '</select></div>' +
      '<div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">' +
      '<span class="badge badge-cat">' + escapeHtml(b.category || 'General') + '</span>' +
      '<span class="badge-days" style="' + (isReading ? 'color:#60a5fa; border-color:#2563eb; background:rgba(59,130,246,0.1);' : '') + '">' + days + ' days read' + (isReading ? ' 🔥' : '') + '</span></div>' +
      (b.takeaway ? '<div class="card-takeaway-preview" onclick="openTakeawayModal(' + origIdx + ')" title="Click to view notes">💡 <strong>Takeaway:</strong> ' + escapeHtml(b.takeaway) + '</div>' : '') +
      '<div class="book-card-body"><div class="card-dates"><span>Start: ' + (b.start_date || 'Not started') + '</span><span>End: ' + endDateDisplay + '</span></div>' +
      '<div class="card-meta-row"><div class="star-rating">' + starsHtml + '</div>' +
      '<div class="card-actions">' +
      (b.status === 'DONE' ? '<button class="btn btn-sm" style="color:#10b981; border-color:rgba(16,185,129,0.3);" onclick="openCompletionCard(' + origIdx + ')" title="Share completion card">🏆 Card</button>' : '') +
      '<button class="btn btn-sm" onclick="openTakeawayModal(' + origIdx + ')">' + ICONS.note + ' Notes</button>' +
      '<button class="btn btn-sm btn-icon-only" onclick="openEditModal(' + origIdx + ')">' + ICONS.edit + '</button>' +
      '<button class="btn btn-sm btn-icon-only btn-danger" onclick="deleteBook(' + origIdx + ')">' + ICONS.trash + '</button>' +
      '</div></div></div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderPagination(container, totalItems, totalPages) {
  const start = (state.currentPage - 1) * state.pageSize + 1;
  const end = Math.min(start + state.pageSize - 1, totalItems);

  let pagesHtml = '';
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= state.currentPage - 2 && p <= state.currentPage + 2)) {
      pagesHtml += '<button class="page-btn ' + (p === state.currentPage ? 'active' : '') + '" onclick="goToPage(' + p + ')">' + p + '</button>';
    } else if (p === state.currentPage - 3 || p === state.currentPage + 3) {
      pagesHtml += '<span style="padding:0 0.2rem; color:var(--text-muted);">...</span>';
    }
  }

  container.innerHTML = '<div class="pagination-bar">' +
    '<div>Showing <strong>' + start + '</strong> to <strong>' + end + '</strong> of <strong>' + totalItems + '</strong> books</div>' +
    '<div class="pagination-controls">' +
    '<button class="page-btn" ' + (state.currentPage <= 1 ? 'disabled' : '') + ' onclick="goToPage(' + (state.currentPage - 1) + ')">Prev</button>' +
    pagesHtml +
    '<button class="page-btn" ' + (state.currentPage >= totalPages ? 'disabled' : '') + ' onclick="goToPage(' + (state.currentPage + 1) + ')">Next</button>' +
    '</div></div>';
}
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.currentPage = 1;
      clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      renderBookList();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearSearchBtn.style.display = 'none';
      state.currentPage = 1;
      renderBookList();
    });
  }

  document.getElementById('viewTableBtn').addEventListener('click', () => setViewMode('table'));
  document.getElementById('viewGridBtn').addEventListener('click', () => setViewMode('grid'));

  document.querySelectorAll('.tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.statusFilter = pill.dataset.status;
      state.currentPage = 1;
      renderBookList();
    });
  });

  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    state.categoryFilter = e.target.value;
    state.currentPage = 1;
    renderApp();
  });

  document.getElementById('availabilityFilter').addEventListener('change', (e) => {
    state.availabilityFilter = e.target.value;
    state.currentPage = 1;
    renderBookList();
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderBookList();
  });

  document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
    state.pageSize = parseInt(e.target.value) || 25;
    state.currentPage = 1;
    renderBookList();
  });

  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  
  const updateBtn = document.getElementById('headerUpdateBtn');
  if (updateBtn) updateBtn.addEventListener('click', handleUpdateClick);

  // Download Dropdown Toggle
  const downloadDropdown = document.getElementById('downloadDropdown');
  const downloadDropdownBtn = document.getElementById('downloadDropdownBtn');
  const downloadDropdownMenu = document.getElementById('downloadDropdownMenu');

  if (downloadDropdownBtn && downloadDropdownMenu) {
    downloadDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadDropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!downloadDropdown.contains(e.target)) {
        downloadDropdownMenu.classList.remove('show');
      }
    });
  }

  document.getElementById('addBookBtn').addEventListener('click', openAddModal);

  const pickNextBookBtn = document.getElementById('pickNextBookBtn');
  if (pickNextBookBtn) {
    pickNextBookBtn.addEventListener('click', openPickBookModal);
  }

  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (downloadDropdownMenu) downloadDropdownMenu.classList.remove('show');
      exportToCsv();
    });
  }

  const exportPdfBtn = document.getElementById('exportPdfBtn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      if (downloadDropdownMenu) downloadDropdownMenu.classList.remove('show');
      exportToPdf();
    });
  }

  const exportJsonBtn = document.getElementById('exportJsonBtn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      if (downloadDropdownMenu) downloadDropdownMenu.classList.remove('show');
      exportToJson();
    });
  }

  const importFileBtn = document.getElementById('importFileBtn');
  if (importFileBtn) {
    importFileBtn.addEventListener('click', () => {
      if (downloadDropdownMenu) downloadDropdownMenu.classList.remove('show');
      document.getElementById('importFileInput').click();
    });
  }

  document.getElementById('importFileInput').addEventListener('change', handleFileImport);
  document.getElementById('resetDataBtn').addEventListener('click', confirmResetData);

  const startDateInput = document.getElementById('editStartDate');
  const endDateInput = document.getElementById('editEndDate');
  if (startDateInput && endDateInput) {
    const updateDays = () => {
      const s = startDateInput.value;
      const e = endDateInput.value;
      document.getElementById('editCountDays').value = calculateDaysDifference(s, e);
    };
    startDateInput.addEventListener('change', updateDays);
    endDateInput.addEventListener('change', updateDays);
  }
}

function setViewMode(mode) {
  state.viewMode = mode;
  document.getElementById('viewTableBtn').classList.toggle('active', mode === 'table');
  document.getElementById('viewGridBtn').classList.toggle('active', mode === 'grid');
  renderBookList();
}

function setCategoryFilter(cat) {
  if (state.categoryFilter === cat) {
    state.categoryFilter = 'ALL';
    document.getElementById('categoryFilter').value = 'ALL';
  } else {
    state.categoryFilter = cat;
    document.getElementById('categoryFilter').value = cat;
  }
  state.currentPage = 1;
  renderApp();
}

function handleSort(col) {
  if (col === 'no') {
    state.sortBy = state.sortBy === 'no_asc' ? 'no_desc' : 'no_asc';
  } else if (col === 'title') {
    state.sortBy = state.sortBy === 'title_asc' ? 'title_desc' : 'title_asc';
  } else if (col === 'author') {
    state.sortBy = state.sortBy === 'author_asc' ? 'no_asc' : 'author_asc';
  } else if (col === 'days') {
    state.sortBy = state.sortBy === 'days_desc' ? 'no_asc' : 'days_desc';
  } else if (col === 'rating') {
    state.sortBy = state.sortBy === 'rating_desc' ? 'no_asc' : 'rating_desc';
  }
  document.getElementById('sortSelect').value = state.sortBy;
  renderBookList();
}

function goToPage(p) {
  state.currentPage = p;
  renderBookList();
  window.scrollTo({ top: 380, behavior: 'smooth' });
}

function resetFilters() {
  state.searchQuery = '';
  state.statusFilter = 'ALL';
  state.categoryFilter = 'ALL';
  state.availabilityFilter = 'ALL';
  state.currentPage = 1;
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = 'ALL';
  document.getElementById('availabilityFilter').value = 'ALL';
  document.querySelectorAll('.tab-pill').forEach(p => p.classList.toggle('active', p.dataset.status === 'ALL'));
  renderApp();
}

function openAddModal() {
  state.editingBookIndex = -1;
  document.getElementById('bookModalTitle').innerText = 'Add New Book';
  document.getElementById('editBookNo').value = 'book ' + (state.books.length + 1);
  document.getElementById('editBookTitle').value = '';
  document.getElementById('editBookAuthor').value = '';
  document.getElementById('editBookLanguage').value = 'HINDI';
  document.getElementById('editBookCategory').value = 'Focus & Concentration';
  document.getElementById('editBookStatus').value = 'PENDING';
  document.getElementById('editStartDate').value = '';
  document.getElementById('editEndDate').value = '';
  document.getElementById('editCountDays').value = '0';
  document.getElementById('editBookRating').value = '';
  document.getElementById('editBookAvailability').value = 'AVAILABLE';
  document.getElementById('editBookTakeaway').value = '';
  document.getElementById('bookModalOverlay').classList.add('active');
}

function openEditModal(index) {
  state.editingBookIndex = index;
  const book = state.books[index];
  if (!book) return;

  document.getElementById('bookModalTitle').innerText = 'Edit: ' + (book.title || book.no);
  document.getElementById('editBookNo').value = book.no || '';
  document.getElementById('editBookTitle').value = book.title || '';
  document.getElementById('editBookAuthor').value = book.author || '';
  document.getElementById('editBookLanguage').value = book.language || 'HINDI';
  document.getElementById('editBookCategory').value = book.category || 'Focus & Concentration';
  document.getElementById('editBookStatus').value = book.status || 'PENDING';
  document.getElementById('editStartDate').value = book.start_date || '';
  document.getElementById('editEndDate').value = book.end_date || '';
  document.getElementById('editCountDays').value = book.count_days || 0;
  document.getElementById('editBookRating').value = book.rating || '';
  document.getElementById('editBookAvailability').value = book.availability || 'AVAILABLE';
  document.getElementById('editBookTakeaway').value = book.takeaway || '';
  document.getElementById('bookModalOverlay').classList.add('active');
}

function closeBookModal() {
  document.getElementById('bookModalOverlay').classList.remove('active');
}

function saveBookModal() {
  const title = document.getElementById('editBookTitle').value.trim();
  if (!title) {
    alert('Please enter a book title!');
    return;
  }

  const bookData = {
    no: document.getElementById('editBookNo').value.trim() || ('book ' + (state.books.length + 1)),
    title: title,
    author: document.getElementById('editBookAuthor').value.trim() || 'Unknown',
    language: document.getElementById('editBookLanguage').value.trim() || 'HINDI',
    category: document.getElementById('editBookCategory').value.trim() || 'General',
    status: document.getElementById('editBookStatus').value,
    start_date: document.getElementById('editStartDate').value,
    end_date: document.getElementById('editEndDate').value,
    count_days: parseInt(document.getElementById('editCountDays').value) || 0,
    rating: document.getElementById('editBookRating').value,
    availability: document.getElementById('editBookAvailability').value,
    takeaway: document.getElementById('editBookTakeaway').value.trim()
  };

  if (state.editingBookIndex >= 0) {
    state.books[state.editingBookIndex] = bookData;
    showToast('Updated "' + title + '"', 'success');
  } else {
    state.books.push(bookData);
    showToast('Added "' + title + '" to library', 'success');
  }

  markChange();
  saveData();
  populateCategoryDropdown();
  closeBookModal();
  renderApp();
}

function deleteBook(index) {
  const book = state.books[index];
  if (!book) return;
  if (confirm('Are you sure you want to delete "' + (book.title || book.no) + '"?')) {
    state.books.splice(index, 1);
    markChange();
    saveData();
    populateCategoryDropdown();
    renderApp();
    showToast('Deleted book.', '');
  }
}

function openTakeawayModal(index) {
  state.editingBookIndex = index;
  const book = state.books[index];
  if (!book) return;

  document.getElementById('takeawayBookTitle').innerText = book.no + ' • ' + book.title;
  document.getElementById('takeawayTextarea').value = book.takeaway || '';
  document.getElementById('takeawayModalOverlay').classList.add('active');
}

function closeTakeawayModal() {
  document.getElementById('takeawayModalOverlay').classList.remove('active');
}

function saveTakeawayModal() {
  if (state.editingBookIndex >= 0 && state.books[state.editingBookIndex]) {
    const text = document.getElementById('takeawayTextarea').value.trim();
    state.books[state.editingBookIndex].takeaway = text;
    markChange();
    saveData();
    closeTakeawayModal();
    renderBookList();
    showToast('Key takeaways saved successfully!', 'success');
  }
}

function exportToCsv() {
  const headers = ['NO', 'BOOK TITLE', 'AUTHOR', 'LANGUAGE', 'STATUS', 'START DATE', 'END DATE', 'COUNT DAYS', 'RATING', 'CATEGORY', 'KEY LEARNING / TAKEAWAY', 'BOOK AVAILABILITY'];
  
  const rows = state.books.map(b => [
    '"' + (b.no || '').replace(/"/g, '""') + '"',
    '"' + (b.title || '').replace(/"/g, '""') + '"',
    '"' + (b.author || '').replace(/"/g, '""') + '"',
    '"' + (b.language || '').replace(/"/g, '""') + '"',
    '"' + (b.status || 'PENDING').replace(/"/g, '""') + '"',
    '"' + (b.start_date || '').replace(/"/g, '""') + '"',
    '"' + (b.status === 'READING' ? getTodayString() : (b.end_date || '')).replace(/"/g, '""') + '"',
    getBookEffectiveDays(b),
    b.rating || '',
    '"' + (b.category || '').replace(/"/g, '""') + '"',
    '"' + (b.takeaway || '').replace(/"/g, '""') + '"',
    '"' + (b.availability || '').replace(/"/g, '""') + '"'
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Mind_Focus_Books_Tracker_' + getTodayString() + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Excel CSV file downloaded offline!', 'success');
}

function exportToJson() {
  const jsonContent = JSON.stringify(state.books, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'mind_focus_books_backup_' + getTodayString() + '.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('JSON backup downloaded offline!', 'success');
}

function exportToPdf() {
  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      // Fallback to browser print if jsPDF library is not loaded
      window.print();
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const today = getTodayString();
    const total = state.books.length;
    const done = state.books.filter(b => b.status === 'DONE').length;
    const reading = state.books.filter(b => b.status === 'READING').length;
    const pending = total - done - reading;

    // Header Title
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('Mind & Focus Books Tracker - Reading Library', 40, 40);

    // Subtitle & Statistics
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Generated: ' + today + '  |  Total Books: ' + total + '  |  Finished: ' + done + '  |  Currently Reading: ' + reading + '  |  Pending: ' + pending,
      40,
      58
    );

    // Prepare Table Rows
    const tableRows = state.books.map(b => {
      const days = getBookEffectiveDays(b);
      const isReading = b.status === 'READING';
      const endDate = isReading ? today + ' (Reading)' : (b.end_date || '-');
      const rating = b.rating ? b.rating + ' ★' : '-';
      const takeaway = b.takeaway ? b.takeaway.slice(0, 120) + (b.takeaway.length > 120 ? '...' : '') : '-';

      return [
        b.no || '',
        b.title || '',
        b.author || '',
        b.category || '',
        b.status || 'PENDING',
        b.start_date || '-',
        endDate,
        days + ' d',
        rating,
        takeaway
      ];
    });

    doc.autoTable({
      startY: 70,
      head: [['No', 'Book Title', 'Author', 'Category', 'Status', 'Start Date', 'End Date', 'Days', 'Rating', 'Key Takeaway / Notes']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [15, 23, 42],
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 155, fontStyle: 'bold' },
        2: { cellWidth: 95 },
        3: { cellWidth: 85 },
        4: { cellWidth: 55, halign: 'center' },
        5: { cellWidth: 55, halign: 'center' },
        6: { cellWidth: 65, halign: 'center' },
        7: { cellWidth: 40, halign: 'center' },
        8: { cellWidth: 40, halign: 'center' },
        9: { cellWidth: 145 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 30, right: 30, bottom: 30 }
    });

    doc.save('Mind_Focus_Books_Library_' + today + '.pdf');
    showToast('PDF Document successfully downloaded!', 'success');
  } catch (err) {
    console.error('PDF export error:', err);
    // Graceful fallback to browser print if an issue occurs
    window.print();
  }
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (Array.isArray(data)) {
        if (confirm('Import ' + data.length + ' books? This will replace your current library.')) {
          state.books = data;
          saveData();
          populateCategoryDropdown();
          renderApp();
          showToast('Imported ' + data.length + ' books successfully!', 'success');
        }
      } else {
        alert('Invalid JSON file format. Must be an array of books.');
      }
    } catch (err) {
      alert('Error parsing JSON file: ' + err.message);
    }
    e.target.value = '';
  };
  reader.readAsText(file);
}

function confirmResetData() {
  if (confirm('Are you sure you want to reset all data back to the original 150 Excel books? Any new books added manually will be replaced.')) {
    state.books = (typeof DEFAULT_BOOKS !== 'undefined') ? [...DEFAULT_BOOKS] : [];
    saveData();
    populateCategoryDropdown();
    renderApp();
    showToast('Reset to original 150 Excel books successfully!', 'success');
  }
}

function showToast(message, type) {
  type = type || '';
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : '');
  toast.innerHTML = '<span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// PWA Install Logic
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('installAppBtn');
  if (btn) {
    btn.style.boxShadow = '0 0 16px rgba(99, 102, 241, 0.6)';
  }
});

function handleInstallApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        showToast('App installed successfully!', 'success');
      }
      deferredInstallPrompt = null;
    });
  } else {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      alert('Phone me Install karne ke liye:\n\n1. Chrome browser me upar daayi taraf 3 dots (⋮) par tap karein.\n2. "Install app" ya "Add to Home screen" par click karein.\n\nApp aapke phone ke home screen par install ho jayegi!');
    } else {
      alert('Laptop me Install karne ke liye:\n\n1. Browser me upar address bar (URL) ke right corner me ⊕ (Install) icon par click karein.\n2. "Install" par click karte hi yeh desktop app ban jayegi!');
    }
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}


// Auto-purge old caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      if (name !== 'books-tracker-v2') caches.delete(name);
    });
  });
}

// ==========================================
// FEATURE 2: PICK NEXT BOOK SPINNER
// ==========================================
let currentlyPickedBook = null;
let isSpinning = false;

function openPickBookModal() {
  const select = document.getElementById('pickMoodCategory');
  if (select) {
    const cats = [...new Set(state.books.map(b => b.category || 'General'))].sort();
    select.innerHTML = '<option value="ALL">✨ Any Category (Surprise Me)</option>' +
      cats.map(c => '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>').join('');
  }

  // Reset display
  const card = document.getElementById('spinnerDisplayCard');
  const txt = document.getElementById('spinnerText');
  const sub = document.getElementById('spinnerSubText');
  const icon = document.getElementById('spinnerIcon');
  const act = document.getElementById('pickedBookActions');
  const spinBtn = document.getElementById('spinNowBtn');

  if (icon) icon.innerText = '📚';
  if (txt) txt.innerText = 'Ready to find your next great book?';
  if (sub) sub.innerText = 'Click Spin below to pick from your pending books';
  if (act) act.style.display = 'none';
  if (spinBtn) {
    spinBtn.disabled = false;
    spinBtn.style.display = 'inline-flex';
  }
  currentlyPickedBook = null;

  document.getElementById('pickBookModalOverlay').classList.add('active');
}

function closePickBookModal() {
  document.getElementById('pickBookModalOverlay').classList.remove('active');
}

function spinForNextBook() {
  if (isSpinning) return;

  const moodCat = document.getElementById('pickMoodCategory').value;
  let pool = state.books.filter(b => (!b.status || b.status === 'PENDING'));

  if (moodCat !== 'ALL') {
    pool = pool.filter(b => b.category === moodCat);
  }

  if (pool.length === 0) {
    alert('No pending books found in this category! Try selecting "Any Category".');
    return;
  }

  isSpinning = true;
  const icon = document.getElementById('spinnerIcon');
  const txt = document.getElementById('spinnerText');
  const sub = document.getElementById('spinnerSubText');
  const act = document.getElementById('pickedBookActions');
  const spinBtn = document.getElementById('spinNowBtn');

  if (act) act.style.display = 'none';
  if (spinBtn) spinBtn.disabled = true;

  const icons = ['📖', '⚡', '🧠', '💡', '🔥', '📚', '🎯', '✨'];
  let count = 0;
  const totalSpins = 20;

  const interval = setInterval(() => {
    const randomBook = pool[Math.floor(Math.random() * pool.length)];
    if (icon) icon.innerText = icons[count % icons.length];
    if (txt) txt.innerText = randomBook.title;
    if (sub) sub.innerText = 'by ' + randomBook.author + ' (' + (randomBook.category || 'General') + ')';
    count++;

    if (count >= totalSpins) {
      clearInterval(interval);
      isSpinning = false;
      const finalBook = pool[Math.floor(Math.random() * pool.length)];
      currentlyPickedBook = finalBook;

      if (icon) icon.innerText = '🎉';
      if (txt) txt.innerHTML = '<span style="color:#10b981;">' + escapeHtml(finalBook.title) + '</span>';
      if (sub) sub.innerText = 'by ' + finalBook.author + ' • ' + (finalBook.category || 'General');

      if (act) act.style.display = 'flex';
      if (spinBtn) spinBtn.style.display = 'none';

      const startBtn = document.getElementById('startReadingPickedBtn');
      if (startBtn) {
        startBtn.onclick = () => {
          const idx = state.books.findIndex(b => b.no === finalBook.no && b.title === finalBook.title);
          if (idx !== -1) {
            onStatusChange(idx, 'READING');
            closePickBookModal();
            showToast('Now Reading: "' + finalBook.title + '"! 🚀', 'success');
          }
        };
      }
    }
  }, 80);
}

// ==========================================
// FEATURE 4: BOOK COMPLETION CARD
// ==========================================
let currentCompletionIndex = -1;

function openCompletionCard(index) {
  const book = state.books[index];
  if (!book) return;

  currentCompletionIndex = index;
  const titleEl = document.getElementById('certBookTitle');
  const authEl = document.getElementById('certBookAuthor');
  const dateEl = document.getElementById('certDate');
  const daysEl = document.getElementById('certDaysRead');
  const ratingEl = document.getElementById('certRating');
  const catEl = document.getElementById('certCategory');
  const takeawayText = document.getElementById('certTakeawayText');
  const takeawayBox = document.getElementById('certTakeawayBox');

  const days = getBookEffectiveDays(book);
  const ratingNum = parseInt(book.rating) || 5;
  let stars = '★'.repeat(ratingNum) + '☆'.repeat(Math.max(0, 5 - ratingNum));

  if (titleEl) titleEl.innerText = book.title || 'Untitled Book';
  if (authEl) authEl.innerText = 'by ' + (book.author || 'Unknown Author');
  if (dateEl) dateEl.innerText = book.end_date || getTodayString();
  if (daysEl) daysEl.innerText = days + (days === 1 ? ' Day' : ' Days');
  if (ratingEl) ratingEl.innerText = stars;
  if (catEl) catEl.innerText = book.category || 'General';

  if (takeawayText && takeawayBox) {
    if (book.takeaway && book.takeaway.trim().length > 0) {
      takeawayText.innerText = '"' + book.takeaway.trim() + '"';
      takeawayBox.style.display = 'block';
    } else {
      takeawayText.innerText = '"Continuous learning and daily improvement lead to mastery."';
      takeawayBox.style.display = 'block';
    }
  }

  document.getElementById('completionCardModalOverlay').classList.add('active');
}

function closeCompletionCardModal() {
  document.getElementById('completionCardModalOverlay').classList.remove('active');
}

function downloadCompletionCardImage() {
  const cardElement = document.getElementById('certificateCaptureArea');
  if (!cardElement) return;

  if (typeof html2canvas === 'undefined') {
    showToast('Snapshot library initializing... Please try again in 2 seconds.', 'error');
    return;
  }

  showToast('Generating HD completion card...', '');

  html2canvas(cardElement, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
    logging: false
  }).then(canvas => {
    const link = document.createElement('a');
    const bookTitle = (state.books[currentCompletionIndex] && state.books[currentCompletionIndex].title) 
      ? state.books[currentCompletionIndex].title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)
      : 'book';
    link.download = 'Reading_Card_' + bookTitle + '.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Completion Card PNG saved to your downloads!', 'success');
  }).catch(err => {
    console.error('Snapshot error:', err);
    showToast('Could not save image directly. Try taking a screenshot.', 'error');
  });
}
