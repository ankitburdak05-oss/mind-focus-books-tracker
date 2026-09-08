const STORAGE_KEY = 'mind_focus_books_v1';
const THEME_KEY = 'mind_focus_theme_v1';
const PIN_KEY = 'mind_focus_pin_v1';

let state = {
  books: [],
  searchQuery: '',
  statusFilter: 'ALL',
  categoryFilter: 'ALL',
  availabilityFilter: 'ALL',
  sortBy: 'no_asc',
  viewMode: 'grid',
  currentPage: 1,
  pageSize: 25,
  editingBookIndex: -1,
  theme: 'dark',
  currentEditingCoverImage: '',
  currentLendIndex: -1,
  pinLocked: false,
  enteredPin: ''
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

const CURATED_BOOK_COVERS = {
  "hyperfocus": "https://covers.openlibrary.org/b/id/10524458-M.jpg",
  "the power of your subconscious mind": "https://covers.openlibrary.org/b/id/8231996-M.jpg",
  "limitless": "https://covers.openlibrary.org/b/id/10414441-M.jpg",
  "thinking, fast and slow": "https://covers.openlibrary.org/b/id/7288636-M.jpg",
  "deep work": "https://covers.openlibrary.org/b/id/8302306-M.jpg",
  "atomic habits": "https://covers.openlibrary.org/b/id/12741544-M.jpg",
  "the psychology of money": "https://covers.openlibrary.org/b/id/10595166-M.jpg",
  "rich dad poor dad": "https://covers.openlibrary.org/b/id/8282367-M.jpg",
  "ikigai": "https://covers.openlibrary.org/b/id/9255566-M.jpg",
  "can't hurt me": "https://covers.openlibrary.org/b/id/10283416-M.jpg",
  "meditations": "https://covers.openlibrary.org/b/id/8235116-M.jpg",
  "start with why": "https://covers.openlibrary.org/b/id/8231856-M.jpg",
  "the 7 habits of highly effective people": "https://covers.openlibrary.org/b/id/8231946-M.jpg",
  "ego is the enemy": "https://covers.openlibrary.org/b/id/8235086-M.jpg",
  "make time": "https://covers.openlibrary.org/b/id/8824156-M.jpg"
};

function getBookCover(book) {
  if (book.cover_image && book.cover_image.trim().length > 0) return book.cover_image;
  const key = (book.title || '').toLowerCase().trim();
  for (let k of Object.keys(CURATED_BOOK_COVERS)) {
    if (key.includes(k)) return CURATED_BOOK_COVERS[k];
  }
  return null;
}

function getBookPages(book) {
  const total = parseInt(book.total_pages) || 280;
  let curr = parseInt(book.current_page);
  if (isNaN(curr)) {
    curr = book.status === 'DONE' ? total : (book.status === 'READING' ? Math.round(total * 0.45) : 0);
  }
  curr = Math.max(0, Math.min(curr, total));
  const pct = Math.round((curr / total) * 100);
  return { current: curr, total: total, pct: pct };
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPrivacyLock();
  initStreak();
  loadData();
  populateCategoryDropdown();
  setupEventListeners();
  renderApp();
  handleShortcutIntentActions();
  if (typeof initDynamicAurora === 'function') initDynamicAurora();
  if (typeof init3DCardPhysics === 'function') init3DCardPhysics();
  if (typeof initDynamicIslandHud === 'function') initDynamicIslandHud();
  if (typeof initSpotlightIsland === 'function') initSpotlightIsland();
  if (typeof updateDnaKpiChip === 'function') updateDnaKpiChip();
  if (typeof initSearchOptionsDrawer === 'function') initSearchOptionsDrawer();
  if (typeof startLiveNoticeListener === 'function') startLiveNoticeListener();
  if (typeof init4DFlagshipSystems === 'function') init4DFlagshipSystems();
});
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  setAppTheme(saved, false);
}

function setAppTheme(themeName, notify = true) {
  if (!['dark', 'sepia', 'light'].includes(themeName)) {
    themeName = 'dark';
  }
  state.theme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(THEME_KEY, themeName);
  updateThemeButton();
  updateSettingsThemeChoices();

  if (notify) {
    if (themeName === 'sepia') {
      showToast('📜 Kindle Sepia Paper: Eye Comfort Mode On', 'success');
    } else if (themeName === 'dark') {
      showToast('🌙 Midnight Dark Mode activated', 'info');
    } else {
      showToast('☀️ Clean Daylight Mode activated', 'info');
    }
  }
}

function cycleTheme() {
  const order = ['dark', 'sepia', 'light'];
  const currentIndex = order.indexOf(state.theme);
  const nextIndex = (currentIndex + 1) % order.length;
  setAppTheme(order[nextIndex], true);
}

function toggleTheme() {
  cycleTheme();
}

function updateThemeButton() {
  const iconSpan = document.getElementById('themeToggleIcon');
  const textSpan = document.getElementById('themeToggleBtnText');
  const btn = document.getElementById('themeToggleBtn');

  let icon = '🌙';
  let label = 'Dark';
  if (state.theme === 'sepia') {
    icon = '📜';
    label = 'Sepia';
  } else if (state.theme === 'light') {
    icon = '☀️';
    label = 'Light';
  }

  if (iconSpan && textSpan) {
    iconSpan.innerText = icon;
    textSpan.innerText = label;
  } else if (btn) {
    btn.innerHTML = `${icon} ${label}`;
  }
}

function updateSettingsThemeChoices() {
  const darkBtn = document.getElementById('themeChoiceDark');
  const sepiaBtn = document.getElementById('themeChoiceSepia');
  const lightBtn = document.getElementById('themeChoiceLight');

  if (darkBtn) darkBtn.classList.toggle('active', state.theme === 'dark');
  if (sepiaBtn) sepiaBtn.classList.toggle('active', state.theme === 'sepia');
  if (lightBtn) lightBtn.classList.toggle('active', state.theme === 'light');
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
  if (typeof triggerAutoSnapshot === 'function') {
    triggerAutoSnapshot();
  }
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
    if (typeof recordReadingActivity === 'function') recordReadingActivity();
  } else if (newStatus === 'DONE') {
    if (!book.start_date) {
      book.start_date = today;
    }
    if (!book.end_date) {
      book.end_date = today;
    }
    book.count_days = calculateDaysDifference(book.start_date, book.end_date);
    showToast('Completed book: "' + book.title + '"! 🎉', 'success');
    if (typeof recordReadingActivity === 'function') recordReadingActivity();
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

function onPriceChange(index, priceValue) {
  if (state.books[index]) {
    const val = parseFloat(priceValue);
    state.books[index].price = (!isNaN(val) && val >= 0) ? val : 0;
    markChange();
    saveData();
    renderStatistics();
    showToast('Updated price for "' + state.books[index].title + '" to ₹' + state.books[index].price, 'success');
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
      (b.takeaway && b.takeaway.toLowerCase().includes(q)) ||
      (b.lent_to && b.lent_to.toLowerCase().includes(q))
    );
  }

  if (state.statusFilter !== 'ALL') {
    if (state.statusFilter === 'LENT') {
      list = list.filter(b => b.lent_to && b.lent_to.trim().length > 0);
    } else {
      list = list.filter(b => (b.status || 'PENDING').toUpperCase() === state.statusFilter);
    }
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
      case 'price_desc': return (Number(b.price) || 0) - (Number(a.price) || 0);
      case 'price_asc': return (Number(a.price) || 0) - (Number(b.price) || 0);
      default: return 0;
    }
  });

  return list;
}

/* ==========================================================
   LUXURY SHOWCASE: HERO SPOTLIGHT & HORIZONTAL SHELVES
   ========================================================== */
function renderNowReadingHero() {
  const container = document.getElementById('nowReadingHeroSection');
  if (!container) return;
  container.style.display = 'block';

  // Find book that is READING
  let currentBook = state.books.find(b => b.status === 'READING');
  let origIdx = state.books.findIndex(b => b.status === 'READING');

  // If no book is currently in READING status, show an inspiring Roulette prompt
  if (!currentBook) {
    container.innerHTML = '<div class="now-reading-hero" style="border-left:4px solid #6366f1; background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.04));">' +
      '<div class="hero-content-wrap" style="align-items:center;">' +
      '<div style="font-size:3.2rem; margin-right:0.5rem; filter:drop-shadow(0 4px 12px rgba(99,102,241,0.3)); cursor:pointer;" onclick="openPickBookModal()">🎲</div>' +
      '<div class="hero-details">' +
      '<div class="hero-pill-badge" style="background:rgba(99,102,241,0.18); color:#818cf8;">✨ READY FOR YOUR NEXT READ</div>' +
      '<h2 class="hero-title" style="font-size:1.25rem;">No active book in progress right now</h2>' +
      '<div class="hero-author">Pick a book from your library or let Book Roulette choose one for you!</div>' +
      '<div class="hero-actions-row" style="margin-top:0.75rem;">' +
      '<button class="hero-btn-primary" onclick="openPickBookModal()">' +
      '🎲 Spin Book Roulette' +
      '</button>' +
      '<button class="hero-btn-ambient" onclick="openAmbienceModal()">' +
      '🎧 Focus Ambience' +
      '</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
    return;
  }

  const days = getBookEffectiveDays(currentBook);
  const pages = getBookPages(currentBook);
  const hasNotes = currentBook.takeaway && currentBook.takeaway.trim().length > 0;
  const coverUrl = getBookCover(currentBook);
  
  let coverHtml = '';
  if (coverUrl) {
    coverHtml = '<img src="' + coverUrl + '" alt="cover" class="hero-3d-book">';
  } else {
    coverHtml = '<div class="hero-book-placeholder">' +
      '<div style="font-size:2.2rem; margin-bottom:0.25rem;">📖</div>' +
      '<div style="font-size:0.75rem; font-weight:800; opacity:0.95;">#' + escapeHtml(currentBook.no) + '</div>' +
      '<div style="font-size:0.65rem; opacity:0.75; margin-top:2px;">' + escapeHtml(currentBook.category || 'Focus') + '</div>' +
      '</div>';
  }

  const isAudioActive = typeof isAmbiencePlaying !== 'undefined' && isAmbiencePlaying;
  const wrappedCover = '<div style="position:relative; display:inline-block;">' +
    '<div class="ambient-soundwave-ring ' + (isAudioActive ? 'active' : '') + '"></div>' +
    coverHtml +
    '</div>';

  container.innerHTML = '<div class="now-reading-hero">' +
    '<div class="hero-content-wrap">' +
    '<div class="hero-book-visual" onclick="openBookDetailSheet(' + origIdx + ')" style="cursor:pointer;" title="Click to view book details & progress">' +
    wrappedCover +
    '</div>' +
    '<div class="hero-details">' +
    '<div class="hero-pill-badge">🔥 CURRENTLY READING • DAY ' + Math.max(1, days) + '</div>' +
    '<h2 class="hero-title" onclick="openBookDetailSheet(' + origIdx + ')" style="cursor:pointer;">' + escapeHtml(currentBook.title) + '</h2>' +
    '<div class="hero-author">by ' + escapeHtml(currentBook.author) + ' • <span style="color:#10b981; font-weight:700;">' + escapeHtml(currentBook.category || 'General') + '</span></div>' +

    // Mini Page Progress Bar inside Hero Card
    '<div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:10px; padding:0.5rem 0.85rem; margin:0.4rem 0; max-width:420px;">' +
    '<div style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:700; color:var(--text-primary); margin-bottom:0.3rem;">' +
    '<span>Page ' + pages.current + ' of ' + pages.total + '</span>' +
    '<span style="color:#10b981;">' + pages.pct + '% Completed</span>' +
    '</div>' +
    '<div class="page-progress-bar"><div class="page-progress-fill" style="width:' + pages.pct + '%;"></div></div>' +
    '</div>' +

    (hasNotes ? '<div class="hero-quote-snippet">💡 "' + escapeHtml(currentBook.takeaway) + '"</div>' : '') +
    '<div class="hero-actions-row">' +
    '<button class="hero-btn-primary" onclick="openBookDetailSheet(' + origIdx + ')">' +
    '📖 Update Page & Notes' +
    '</button>' +
    '<button class="hero-btn-ambient" onclick="openSanctuaryMode(' + origIdx + ')" style="background:linear-gradient(135deg, rgba(245,158,11,0.22), rgba(239,68,68,0.22)); border-color:rgba(245,158,11,0.4); color:#fbbf24; font-weight:700;" title="Enter Distraction-Free Reading Sanctuary">' +
    '🌌 Sanctuary' +
    '</button>' +
    '<button class="hero-btn-ambient" onclick="openAmbienceModal()">' +
    '🎧 ' + (typeof isAmbiencePlaying !== 'undefined' && isAmbiencePlaying ? 'Ambience Active' : 'Focus Ambience') +
    '</button>' +
    '<button class="btn btn-sm" onclick="openEditModal(' + origIdx + ')" style="border-radius:20px; font-weight:600;">' +
    '⚙️ Edit' +
    '</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  if (typeof updateDynamicAurora === 'function') updateDynamicAurora(currentBook);
  if (typeof updateDynamicIslandHud === 'function') updateDynamicIslandHud(currentBook);
}

function renderCuratedShelves() {
  const container = document.getElementById('curatedShelvesSection');
  if (container) {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

function filterByStatus(status) {
  state.statusFilter = status;
  state.currentPage = 1;
  document.querySelectorAll('.tab-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.status === status);
  });
  renderBookList();
  showToast(status === 'ALL' ? 'Showing all 150 books' : ('Filtered by ' + status), 'info');
}

function renderMiniShelfCard(b) {
  const origIdx = b.originalIndex;
  const ratingNum = parseInt(b.rating) || 0;
  let stars = '';
  if (ratingNum > 0) {
    stars = '★'.repeat(ratingNum);
  }

  let cover = '';
  if (b.cover_image) {
    cover = '<img src="' + b.cover_image + '" alt="cover" class="mini-card-cover">';
  } else {
    const isReading = b.status === 'READING';
    const bg = isReading ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : 'linear-gradient(135deg, #1e293b, #334155)';
    cover = '<div class="mini-card-placeholder" style="background:' + bg + ';">' +
      '<span style="font-size:1.8rem;">' + (isReading ? '📖' : '📚') + '</span>' +
      '<span style="font-size:0.65rem; font-weight:800; color:#cbd5e1;">#' + escapeHtml(b.no) + '</span>' +
      '</div>';
  }

  return '<div class="mini-shelf-card" onclick="openTakeawayModal(' + origIdx + ')" title="' + escapeHtml(b.title) + '">' +
    '<div class="mini-card-cover-wrap">' + cover + '</div>' +
    '<div class="mini-card-title">' + escapeHtml(b.title) + '</div>' +
    '<div class="mini-card-author">' + escapeHtml(b.author) + '</div>' +
    (stars ? '<div class="mini-card-rating">' + stars + '</div>' : '') +
    '</div>';
}

function renderMiniQuoteCard(b) {
  const origIdx = b.originalIndex;
  return '<div class="mini-quote-card" onclick="openTakeawayModal(' + origIdx + ')" title="Click to view book insights">' +
    '<div class="mini-quote-text">"' + escapeHtml(b.takeaway) + '"</div>' +
    '<div class="mini-quote-book">' + escapeHtml(b.title) + ' <span style="color:var(--text-muted); font-weight:400;">by ' + escapeHtml(b.author) + '</span></div>' +
    '</div>';
}

function renderApp() {
  renderNowReadingHero();
  renderCuratedShelves();
  renderStatistics();
  renderCategoryPills();
  renderBookList();
  if (typeof updateDnaKpiChip === 'function') updateDnaKpiChip();
  if (typeof updateSearchDrawerFilterBadge === 'function') updateSearchDrawerFilterBadge();
  if (typeof syncCategoryTrackActiveState === 'function') syncCategoryTrackActiveState();
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

  // Knowledge Value: Sum of book purchase prices entered by user
  let totalCustomPrice = 0;
  let pricedBooksCount = 0;
  state.books.forEach(b => {
    const p = parseFloat(b.price);
    if (!isNaN(p) && p > 0) {
      totalCustomPrice += p;
      pricedBooksCount++;
    }
  });

  // If user entered prices, display exact sum; otherwise default to done * ₹399
  let displayMoney = 0;
  if (totalCustomPrice > 0) {
    displayMoney = totalCustomPrice;
  } else if (done > 0) {
    displayMoney = done * 399;
  }

  const moneyValue = displayMoney.toLocaleString('en-IN');
  const hoursInvested = Math.round((done * 6) + (reading * 2) + (totalDays * 0.5));

  const moneyEl = document.getElementById('kpiMoneySaved');
  if (moneyEl) moneyEl.innerText = '₹' + moneyValue;

  const moneySubEl = document.getElementById('kpiMoneySubtext');
  if (moneySubEl) {
    if (totalCustomPrice > 0) {
      moneySubEl.innerText = '(' + pricedBooksCount + ' Book' + (pricedBooksCount > 1 ? 's' : '') + ' Total)';
      moneySubEl.style.display = 'block';
    } else {
      moneySubEl.style.display = 'none';
    }
  }

  const hoursEl = document.getElementById('kpiHoursInvested');
  if (hoursEl) hoursEl.innerText = hoursInvested + ' hrs';

  const pctEl = document.getElementById('progressPctText');
  if (pctEl) pctEl.innerText = pct + '% Completed';
  const subEl = document.getElementById('progressSubText');
  if (subEl) subEl.innerText = done + ' / ' + total + ' Finished';
  const barEl = document.getElementById('progressBarFill');
  if (barEl) barEl.style.width = pct + '%';
  const ringFill = document.getElementById('kpiRingFill');
  if (ringFill) ringFill.setAttribute('stroke-dasharray', pct + ', 100');
  const ringPct = document.getElementById('kpiRingPct');
  if (ringPct) ringPct.innerText = Math.round(pct) + '%';

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

  const lentCount = state.books.filter(b => b.lent_to && b.lent_to.trim().length > 0).length;
  const cLentEl = document.getElementById('countLent');
  if (cLentEl) cLentEl.innerText = lentCount;

  if (typeof updateStreakUI === 'function') {
    updateStreakUI();
  }
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
  } else if (state.viewMode === 'grid') {
    renderGridView(container, paginated);
  } else if (state.viewMode === 'bookshelf') {
    renderBookshelfView(container, paginated);
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
    '<th class="sortable" onclick="handleSort(\'price\')">PRICE (₹)</th>' +
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
      '<div class="book-author-text">' + escapeHtml(b.author) + ' • ' + escapeHtml(b.language || 'HINDI') + '</div>' +
      (b.lent_to ? '<div style="margin-top:2px;"><span class="badge badge-lent" onclick="openLendModal(' + origIdx + ')" title="Click to manage or return">🤝 Lent to ' + escapeHtml(b.lent_to) + '</span></div>' : '') +
      '</td>' +
      '<td>' + escapeHtml(b.author) + '</td>' +
      '<td><span class="badge badge-cat">' + escapeHtml(b.category || 'General') + '</span></td>' +
      '<td><select class="status-select status-' + (b.status || 'PENDING') + '" onchange="onStatusChange(' + origIdx + ', this.value)">' +
      '<option value="PENDING" ' + (b.status === 'PENDING' ? 'selected' : '') + '>⏳ PENDING</option>' +
      '<option value="READING" ' + (b.status === 'READING' ? 'selected' : '') + '>📖 READING</option>' +
      '<option value="DONE" ' + (b.status === 'DONE' ? 'selected' : '') + '>✅ DONE</option>' +
      '</select></td>' +
      '<td><div class="table-price-wrapper" title="Click to edit purchase price">' +
      '<span class="currency-symbol">₹</span>' +
      '<input type="number" class="table-price-input" value="' + (b.price > 0 ? b.price : '') + '" placeholder="0" min="0" onchange="onPriceChange(' + origIdx + ', this.value)">' +
      '</div></td>' +
      '<td style="font-size:0.82rem; color:var(--text-secondary);">' + (b.start_date || '-') + '</td>' +
      '<td style="font-size:0.82rem;">' + endDateDisplay + '</td>' +
      '<td>' + daysBadge + '</td>' +
      '<td><div class="star-rating">' + starsHtml + '</div></td>' +
      '<td><button class="takeaway-btn ' + (hasNotes ? 'has-content' : '') + '" onclick="openTakeawayModal(' + origIdx + ')">' +
      ICONS.note + ' ' + (hasNotes ? 'Notes' : 'Add Note') + '</button></td>' +
      '<td><div style="display:flex; gap:0.35rem;">' +
      (b.status === 'DONE' ? '<button class="btn btn-icon-only btn-sm" title="View Completion Certificate" style="color:#10b981;" onclick="openCompletionCard(' + origIdx + ')">🏆</button>' : '') +
      '<button class="btn btn-icon-only btn-sm" title="' + (b.lent_to ? 'Manage Lent: ' + escapeHtml(b.lent_to) : 'Lend book to a friend') + '" onclick="openLendModal(' + origIdx + ')">🤝</button>' +
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
    const pages = getBookPages(b);
    const isReading = b.status === 'READING';
    const isDone = b.status === 'DONE';
    const statusCardClass = isReading ? 'status-reading-card' : (isDone ? 'status-done-card' : 'status-pending-card');
    
    const coverUrl = getBookCover(b);
    let coverHtml = '';
    if (coverUrl) {
      coverHtml = '<div style="position:relative; width:56px; height:80px; flex-shrink:0; border-radius:8px; overflow:hidden; box-shadow:-4px 8px 18px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1);">' +
        '<img src="' + coverUrl + '" alt="cover" style="width:100%; height:100%; object-fit:cover;">' +
        '<div style="position:absolute; top:0; left:0; bottom:0; width:4px; background:linear-gradient(90deg, rgba(0,0,0,0.4), transparent); pointer-events:none;"></div>' +
        '</div>';
    } else {
      const catColor = isReading ? '#3b82f6' : (isDone ? '#10b981' : '#f59e0b');
      coverHtml = '<div style="width:56px; height:80px; border-radius:8px; flex-shrink:0; background:linear-gradient(135deg, ' + catColor + '22, ' + catColor + '44); border:1px solid ' + catColor + '55; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:-4px 6px 14px rgba(0,0,0,0.3); font-size:1.4rem;">' +
        '<span>' + (isReading ? '📖' : (isDone ? '✅' : '⏳')) + '</span>' +
        '<span style="font-size:0.6rem; font-weight:800; color:var(--text-muted); margin-top:2px;">#' + escapeHtml(b.no) + '</span>' +
        '</div>';
    }

    const ratingNum = parseInt(b.rating) || 0;
    const starSnippet = ratingNum > 0 ? ('<span style="color:#f59e0b; font-size:0.75rem; font-weight:700;">★ ' + ratingNum + '</span>') : '';
    const statusText = isDone ? 'Done' : (isReading ? 'Reading' : 'Pending');
    const statusBg = isDone ? 'rgba(16,185,129,0.22)' : (isReading ? 'rgba(59,130,246,0.22)' : 'rgba(255,255,255,0.06)');
    const statusColor = isDone ? '#34d399' : (isReading ? '#60a5fa' : 'var(--text-muted)');
    const statusBorder = isDone ? 'rgba(16,185,129,0.45)' : (isReading ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.12)');

    html += '<div class="book-card ' + statusCardClass + '" onclick="openBookDetailSheet(' + origIdx + ')" style="cursor:pointer;" title="' + escapeHtml(b.title) + ' - Tap to view & update progress">' +
      '<div class="foil-sheen"></div>' +
      '<div class="book-card-header" style="display:flex; gap:0.85rem; align-items:flex-start;">' +
      coverHtml +
      '<div style="flex:1; min-width:0;">' +
      '<div class="book-card-no" style="letter-spacing:0.04em;">BOOK #' + escapeHtml(b.no) + '</div>' +
      '<div class="book-card-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:800; font-size:1rem; letter-spacing:-0.01em; margin:1px 0;" title="' + escapeHtml(b.title) + '">' + escapeHtml(b.title) + '</div>' +
      '<div class="book-card-author" style="font-size:0.82rem; color:var(--text-secondary);">by ' + escapeHtml(b.author) + '</div>' +
      '<div style="display:flex; gap:0.4rem; align-items:center; margin-top:0.35rem;">' +
      '<span class="badge badge-cat" style="border-radius:12px; font-size:0.7rem;">' + escapeHtml(b.category || 'General') + '</span>' +
      starSnippet +
      '</div>' +
      '</div>' +
      '<span class="badge" style="background:' + statusBg + '; color:' + statusColor + '; border:1px solid ' + statusBorder + '; font-size:0.72rem; font-weight:800; border-radius:14px; padding:3px 9px; flex-shrink:0;">' + statusText + '</span>' +
      '</div>' +

      // Sleek Mini Page Progress Bar
      '<div class="card-page-progress">' +
      '<div class="card-page-text">' +
      '<span>Page ' + pages.current + ' / ' + pages.total + '</span>' +
      '<span style="color:' + (pages.pct >= 100 ? '#10b981' : 'var(--text-secondary)') + ';">' + pages.pct + '%</span>' +
      '</div>' +
      '<div class="page-progress-bar"><div class="page-progress-fill" style="width:' + pages.pct + '%;"></div></div>' +
      '</div>' +

      (b.lent_to ? '<div class="card-lent-banner" style="margin-top:0.4rem;"><span>🤝 Lent to: <strong>' + escapeHtml(b.lent_to) + '</strong></span></div>' : '') +
      (b.takeaway ? '<div class="card-takeaway-preview" style="margin-top:0.4rem;">💡 ' + escapeHtml(b.takeaway) + '</div>' : '') +
      '</div>';
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

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

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

  const addBookBtn = document.getElementById('addBookBtn');
  if (addBookBtn) addBookBtn.addEventListener('click', openAddModal);

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
      const fi = document.getElementById('importFileInput');
      if (fi) fi.click();
    });
  }

  const importFileInput = document.getElementById('importFileInput');
  if (importFileInput) importFileInput.addEventListener('change', handleFileImport);

  const resetDataBtn = document.getElementById('resetDataBtn');
  if (resetDataBtn) resetDataBtn.addEventListener('click', confirmResetData);

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

  const privacyLockBtn = document.getElementById('privacyLockBtn');
  if (privacyLockBtn) privacyLockBtn.addEventListener('click', handlePrivacyBtnClick);

  const scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
  if (scanBarcodeBtn) scanBarcodeBtn.addEventListener('click', openBarcodeScanner);

  const viewBookshelfBtn = document.getElementById('viewBookshelfBtn');
  if (viewBookshelfBtn) viewBookshelfBtn.addEventListener('click', () => setViewMode('bookshelf'));

  // Backdrop click to close any modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        if (typeof restoreDockActiveTab === 'function') restoreDockActiveTab();
      }
    });
  });
}

function setViewMode(mode) {
  state.viewMode = mode;
  const tableBtn = document.getElementById('viewTableBtn');
  const gridBtn = document.getElementById('viewGridBtn');
  const shelfBtn = document.getElementById('viewBookshelfBtn');
  if (tableBtn) tableBtn.classList.toggle('active', mode === 'table');
  if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
  if (shelfBtn) shelfBtn.classList.toggle('active', mode === 'bookshelf');
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
  } else if (col === 'price') {
    state.sortBy = state.sortBy === 'price_desc' ? 'price_asc' : 'price_desc';
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

function updateCoverPreview() {
  const previewImg = document.getElementById('coverPreviewImg');
  const placeholder = document.getElementById('coverPlaceholderText');
  const removeBtn = document.getElementById('removeCoverBtn');
  if (state.currentEditingCoverImage) {
    if (previewImg) {
      previewImg.src = state.currentEditingCoverImage;
      previewImg.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-flex';
  } else {
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function handleCoverImageUpload(input) {
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 320;
      const maxH = 480;
      let w = img.width;
      let h = img.height;
      if (w > maxW || h > maxH) {
        if (w / h > maxW / maxH) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        } else {
          w = Math.round((w * maxH) / h);
          h = maxH;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      state.currentEditingCoverImage = canvas.toDataURL('image/jpeg', 0.75);
      updateCoverPreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function removeCoverPhoto() {
  state.currentEditingCoverImage = '';
  updateCoverPreview();
}

function openAddModal() {
  state.editingBookIndex = -1;
  state.currentEditingCoverImage = '';
  updateCoverPreview();
  document.getElementById('bookModalTitle').innerText = 'Add New Book';
  document.getElementById('editBookNo').value = 'book ' + (state.books.length + 1);
  document.getElementById('editBookTitle').value = '';
  document.getElementById('editBookAuthor').value = '';
  document.getElementById('editBookLanguage').value = 'HINDI';
  document.getElementById('editBookCategory').value = 'Focus & Concentration';
  document.getElementById('editBookStatus').value = 'PENDING';
  document.getElementById('editCurrentPage').value = '0';
  document.getElementById('editTotalPages').value = '280';
  document.getElementById('editStartDate').value = '';
  document.getElementById('editEndDate').value = '';
  document.getElementById('editCountDays').value = '0';
  document.getElementById('editBookRating').value = '';
  document.getElementById('editBookPrice').value = '';
  document.getElementById('editBookAvailability').value = 'AVAILABLE';
  document.getElementById('editBookTakeaway').value = '';
  document.getElementById('bookModalOverlay').classList.add('active');
}

function openEditModal(index) {
  state.editingBookIndex = index;
  const book = state.books[index];
  if (!book) return;

  state.currentEditingCoverImage = book.cover_image || '';
  updateCoverPreview();

  const pages = getBookPages(book);

  document.getElementById('bookModalTitle').innerText = 'Edit: ' + (book.title || book.no);
  document.getElementById('editBookNo').value = book.no || '';
  document.getElementById('editBookTitle').value = book.title || '';
  document.getElementById('editBookAuthor').value = book.author || '';
  document.getElementById('editBookLanguage').value = book.language || 'HINDI';
  document.getElementById('editBookCategory').value = book.category || 'Focus & Concentration';
  document.getElementById('editBookStatus').value = book.status || 'PENDING';
  document.getElementById('editCurrentPage').value = pages.current;
  document.getElementById('editTotalPages').value = pages.total;
  document.getElementById('editStartDate').value = book.start_date || '';
  document.getElementById('editEndDate').value = book.end_date || '';
  document.getElementById('editCountDays').value = book.count_days || 0;
  document.getElementById('editBookRating').value = book.rating || '';
  document.getElementById('editBookPrice').value = (book.price !== undefined && book.price !== null && book.price !== '') ? book.price : '';
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

  const priceVal = parseFloat(document.getElementById('editBookPrice').value);
  const currP = parseInt(document.getElementById('editCurrentPage').value);
  const totP = parseInt(document.getElementById('editTotalPages').value);
  const existing = state.editingBookIndex >= 0 ? state.books[state.editingBookIndex] : {};

  const bookData = {
    no: document.getElementById('editBookNo').value.trim() || ('book ' + (state.books.length + 1)),
    title: title,
    author: document.getElementById('editBookAuthor').value.trim() || 'Unknown',
    language: document.getElementById('editBookLanguage').value.trim() || 'HINDI',
    category: document.getElementById('editBookCategory').value.trim() || 'General',
    status: document.getElementById('editBookStatus').value,
    current_page: !isNaN(currP) ? Math.max(0, currP) : (existing.current_page || 0),
    total_pages: (!isNaN(totP) && totP > 0) ? totP : (existing.total_pages || 280),
    start_date: document.getElementById('editStartDate').value,
    end_date: document.getElementById('editEndDate').value,
    count_days: parseInt(document.getElementById('editCountDays').value) || 0,
    rating: document.getElementById('editBookRating').value,
    price: (!isNaN(priceVal) && priceVal >= 0) ? priceVal : 0,
    availability: document.getElementById('editBookAvailability').value,
    takeaway: document.getElementById('editBookTakeaway').value.trim(),
    cover_image: state.currentEditingCoverImage || existing.cover_image || '',
    lent_to: existing.lent_to || '',
    lent_date: existing.lent_date || '',
    lent_expected: existing.lent_expected || '',
    lent_contact: existing.lent_contact || ''
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
    if (typeof recordReadingActivity === 'function') recordReadingActivity();
    showToast('Key takeaways saved successfully!', 'success');
  }
}

function insertNoteTemplate(type) {
  const textarea = document.getElementById('takeawayTextarea');
  if (!textarea) return;
  let snippet = '';
  if (type === 'takeaway') {
    snippet = '\n\n💡 KEY TAKEAWAY:\n• ';
  } else if (type === 'chapter') {
    snippet = '\n\n🔖 CHAPTER [ ]: \n';
  } else if (type === 'quote') {
    snippet = '\n\n⭐ GOLDEN QUOTE:\n"..."\n— ';
  } else if (type === 'action') {
    snippet = '\n\n🎯 ACTION STEP:\n• [ ] ';
  }
  
  const start = textarea.selectionStart !== undefined ? textarea.selectionStart : textarea.value.length;
  const end = textarea.selectionEnd !== undefined ? textarea.selectionEnd : textarea.value.length;
  const text = textarea.value;
  textarea.value = text.substring(0, start) + snippet + text.substring(end);
  textarea.focus();
  const nextPos = start + snippet.length;
  textarea.setSelectionRange(nextPos, nextPos);
}

// ==========================================
// 1-TAP LUXURY BOOK DETAIL SHEET & PAGE TRACKER
// ==========================================
function openBookDetailSheet(origIdx) {
  const b = state.books[origIdx];
  if (!b) return;

  const badgeEl = document.getElementById('sheetCategoryBadge');
  if (badgeEl) badgeEl.innerText = (b.category || 'General').toUpperCase();

  const bodyEl = document.getElementById('bookDetailSheetBody');
  if (!bodyEl) return;

  const pages = getBookPages(b);
  const coverUrl = getBookCover(b);
  const coverHtml = coverUrl 
    ? '<img class="sheet-cover-img" src="' + escapeHtml(coverUrl) + '" alt="Cover" onerror="this.parentElement.innerHTML=\'<div class=\\\'book-cover-placeholder\\\' style=\\\'width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:2.5rem; background:#1e293b; color:#94a3b8;\\\'>📖</div>\';">'
    : '<div class="book-cover-placeholder" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:2.5rem; background:#1e293b; color:#94a3b8;">📖</div>';

  const isReading = b.status === 'READING';
  const isDone = b.status === 'DONE';
  const isPending = !isReading && !isDone;

  const ratingNum = parseInt(b.rating) || 0;
  let starsHtml = '';
  for (let s = 1; s <= 5; s++) {
    const active = s <= ratingNum;
    starsHtml += '<span onclick="onRatingChange(' + origIdx + ', ' + s + '); openBookDetailSheet(' + origIdx + ');" style="cursor:pointer; font-size:1.4rem; color:' + (active ? '#f59e0b' : 'rgba(255,255,255,0.18)') + '; margin-right:4px;">★</span>';
  }

  let html = '';

  // Header Hero Row
  html += '<div class="sheet-hero-row">';
  html += '  <div class="sheet-cover-wrap">' + coverHtml + '</div>';
  html += '  <div class="sheet-meta">';
  html += '    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">BOOK #' + escapeHtml(b.no || (origIdx + 1)) + ' • ' + escapeHtml(b.language || 'HINDI') + '</div>';
  html += '    <div class="sheet-book-title">' + escapeHtml(b.title) + '</div>';
  html += '    <div class="sheet-book-author">by ' + escapeHtml(b.author || 'Unknown Author') + '</div>';
  html += '    <div style="margin-top:0.35rem; display:flex; align-items:center; gap:0.25rem;">' + starsHtml + '</div>';
  html += '    <div style="margin-top:0.4rem; font-size:0.85rem; font-weight:700; color:var(--text-secondary);">';
  html += '      <span>Purchase Price: </span>';
  html += '      <span style="color:#10b981;">₹' + (b.price || 0) + '</span>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';

  // Status Fast Switcher
  html += '<div style="display:flex; gap:0.5rem; background:var(--bg-primary); padding:0.4rem; border-radius:12px; border:1px solid var(--border-color);">';
  html += '  <button type="button" class="btn btn-sm" onclick="setSheetStatus(' + origIdx + ', \'PENDING\')" style="flex:1; border-radius:8px; font-weight:700; ' + (isPending ? 'background:rgba(255,255,255,0.15); color:#fff; border-color:var(--border-color);' : 'background:transparent; color:var(--text-muted); border:none;') + '">⏳ Pending</button>';
  html += '  <button type="button" class="btn btn-sm" onclick="setSheetStatus(' + origIdx + ', \'READING\')" style="flex:1; border-radius:8px; font-weight:700; ' + (isReading ? 'background:#3b82f6; color:#fff; border:none;' : 'background:transparent; color:var(--text-muted); border:none;') + '">📖 Reading</button>';
  html += '  <button type="button" class="btn btn-sm" onclick="setSheetStatus(' + origIdx + ', \'DONE\')" style="flex:1; border-radius:8px; font-weight:700; ' + (isDone ? 'background:#10b981; color:#fff; border:none;' : 'background:transparent; color:var(--text-muted); border:none;') + '">✅ Done</button>';
  html += '</div>';

  // Interactive Page Progress Card
  html += '<div class="sheet-page-tracker-card">';
  html += '  <div class="sheet-page-header">';
  html += '    <div>';
  html += '      <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700; letter-spacing:0.04em;">Reading Progress</span>';
  html += '      <div class="sheet-page-current">Page <span id="sheetPageDisplay">' + pages.current + '</span> of ' + pages.total + '</div>';
  html += '    </div>';
  html += '    <div class="sheet-page-pct" id="sheetPctDisplay" style="color:' + (pages.pct >= 100 ? '#10b981' : '#3b82f6') + '; font-size:1.1rem; font-weight:900;">' + pages.pct + '%</div>';
  html += '  </div>';
  html += '  <input type="range" class="sheet-page-slider" id="sheetPageSlider" min="0" max="' + pages.total + '" value="' + pages.current + '" oninput="handleSheetPageInput(' + origIdx + ', this.value)">';
  html += '  <div class="sheet-page-quick-buttons">';
  html += '    <span style="font-size:0.75rem; color:var(--text-muted); margin-right:auto; align-self:center;">Quick Progress:</span>';
  html += '    <button type="button" class="page-step-btn" onclick="stepSheetPage(' + origIdx + ', 10)">+10 p</button>';
  html += '    <button type="button" class="page-step-btn" onclick="stepSheetPage(' + origIdx + ', 25)">+25 p</button>';
  html += '    <button type="button" class="page-step-btn" onclick="stepSheetPage(' + origIdx + ', 50)">+50 p</button>';
  html += '    <button type="button" class="page-step-btn" onclick="stepSheetPage(' + origIdx + ', 9999)" style="background:rgba(16,185,129,0.18); color:#10b981; border-color:#10b981;">Finish 🏁</button>';
  html += '  </div>';
  html += '</div>';

  // Lending Banner if Lent
  if (b.lent_to) {
    html += '<div class="card-lent-banner" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0.85rem; border-radius:10px;">';
    html += '  <span>🤝 Currently lent to: <strong>' + escapeHtml(b.lent_to) + '</strong> (' + (b.lent_date || 'Date N/A') + ')</span>';
    html += '  <button class="btn btn-sm" onclick="returnBook(' + origIdx + '); openBookDetailSheet(' + origIdx + ');" style="background:#10b981; color:#fff; border:none; padding:4px 10px;">Mark Returned</button>';
    html += '</div>';
  }

  // Quick Action Buttons
  html += '<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.6rem; margin-top:0.25rem;">';
  html += '  <button type="button" class="btn" onclick="closeBookDetailSheet(); openTakeawayModal(' + origIdx + ');" style="font-weight:700; font-size:0.85rem; justify-content:center;">';
  html += '    💡 ' + (b.takeaway ? 'Edit Notes' : 'Add Notes');
  html += '  </button>';
  html += '  <button type="button" class="btn" onclick="closeBookDetailSheet(); openEditModal(' + origIdx + ');" style="font-weight:700; font-size:0.85rem; justify-content:center;">';
  html += '    ✏️ Full Edit';
  html += '  </button>';
  if (!b.lent_to) {
    html += '  <button type="button" class="btn" onclick="closeBookDetailSheet(); openLendModal(' + origIdx + ');" style="font-weight:700; font-size:0.85rem; justify-content:center;">';
    html += '    🤝 Lend to Friend';
    html += '  </button>';
  }
  if (isDone) {
    html += '  <button type="button" class="btn" onclick="closeBookDetailSheet(); openCompletionCard(' + origIdx + ');" style="font-weight:700; font-size:0.85rem; justify-content:center; color:#10b981; border-color:rgba(16,185,129,0.4);">';
    html += '    🏆 Trophy Card';
    html += '  </button>';
  }
  html += '  <button type="button" class="btn btn-danger" onclick="closeBookDetailSheet(); deleteBook(' + origIdx + ');" style="font-weight:700; font-size:0.85rem; justify-content:center;">';
  html += '    🗑️ Delete Book';
  html += '  </button>';
  html += '</div>';

  bodyEl.innerHTML = html;

  const overlay = document.getElementById('bookDetailSheetOverlay');
  if (overlay) overlay.classList.add('active');
}

function closeBookDetailSheet() {
  const overlay = document.getElementById('bookDetailSheetOverlay');
  if (overlay) overlay.classList.remove('active');
}

function handleSheetPageInput(origIdx, val) {
  const b = state.books[origIdx];
  if (!b) return;
  const total = parseInt(b.total_pages) || 280;
  let curr = parseInt(val) || 0;
  curr = Math.max(0, Math.min(curr, total));
  b.current_page = curr;

  const pct = Math.round((curr / total) * 100);

  const disp = document.getElementById('sheetPageDisplay');
  const pctDisp = document.getElementById('sheetPctDisplay');
  if (disp) disp.innerText = curr;
  if (pctDisp) {
    pctDisp.innerText = pct + '%';
    pctDisp.style.color = pct >= 100 ? '#10b981' : '#3b82f6';
  }

  if (curr >= total && b.status !== 'DONE') {
    b.status = 'DONE';
    const today = getTodayString();
    if (!b.end_date) b.end_date = today;
    if (!b.start_date) b.start_date = today;
    b.count_days = calculateDaysDifference(b.start_date, b.end_date);
    showToast('🎉 Congratulations! You finished "' + b.title + '"!', 'success');
    if (typeof recordReadingActivity === 'function') recordReadingActivity();
  } else if (curr > 0 && curr < total && b.status === 'PENDING') {
    b.status = 'READING';
    const today = getTodayString();
    if (!b.start_date) b.start_date = today;
    showToast('📖 Started reading "' + b.title + '"!', 'info');
    if (typeof recordReadingActivity === 'function') recordReadingActivity();
  }

  markChange();
  saveData();
  renderApp();
}

function stepSheetPage(origIdx, step) {
  const b = state.books[origIdx];
  if (!b) return;
  const total = parseInt(b.total_pages) || 280;
  let curr = parseInt(b.current_page) || 0;
  curr = Math.max(0, Math.min(curr + step, total));
  b.current_page = curr;

  const slider = document.getElementById('sheetPageSlider');
  if (slider) slider.value = curr;

  if (typeof playPaperRustleSound === 'function') playPaperRustleSound();
  if (typeof triggerHaptic === 'function') triggerHaptic('light');

  // Trigger 3D paper curl visual flip on sheet
  const sheetContent = document.querySelector('.book-detail-sheet-content');
  if (sheetContent) {
    sheetContent.classList.remove('page-turn-curl-forward', 'page-turn-curl-backward');
    void sheetContent.offsetWidth; // force reflow
    sheetContent.classList.add(step >= 0 ? 'page-turn-curl-forward' : 'page-turn-curl-backward');
    setTimeout(() => {
      sheetContent.classList.remove('page-turn-curl-forward', 'page-turn-curl-backward');
    }, 450);
  }

  handleSheetPageInput(origIdx, curr);
  openBookDetailSheet(origIdx);
}

function setSheetStatus(origIdx, newStatus) {
  onStatusChange(origIdx, newStatus);
  const b = state.books[origIdx];
  if (b) {
    const total = parseInt(b.total_pages) || 280;
    if (newStatus === 'DONE') {
      b.current_page = total;
    } else if (newStatus === 'PENDING') {
      b.current_page = 0;
    }
    saveData();
    renderApp();
    openBookDetailSheet(origIdx);
  }
}

function exportToCsv() {
  const headers = ['NO', 'BOOK TITLE', 'AUTHOR', 'LANGUAGE', 'STATUS', 'PRICE (INR)', 'START DATE', 'END DATE', 'COUNT DAYS', 'RATING', 'CATEGORY', 'KEY LEARNING / TAKEAWAY', 'BOOK AVAILABILITY'];
  
  const rows = state.books.map(b => [
    '"' + (b.no || '').replace(/"/g, '""') + '"',
    '"' + (b.title || '').replace(/"/g, '""') + '"',
    '"' + (b.author || '').replace(/"/g, '""') + '"',
    '"' + (b.language || '').replace(/"/g, '""') + '"',
    '"' + (b.status || 'PENDING').replace(/"/g, '""') + '"',
    b.price || 0,
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
  if (window.Android && typeof window.Android.saveBackupFile === 'function') {
    window.Android.saveBackupFile(csvContent, 'Mind_Focus_Books_Tracker_' + getTodayString() + '.csv');
    showToast('Excel CSV saved to phone Downloads! 📊', 'success');
    return;
  }

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
  const fileName = 'mind_focus_books_backup_' + getTodayString() + '.json';

  if (window.Android && typeof window.Android.saveBackupFile === 'function') {
    window.Android.saveBackupFile(jsonContent, fileName);
    showToast('JSON backup saved to phone Downloads! 💾', 'success');
    return;
  }

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
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

    // Calculate total value for PDF header
    let totalCustomPrice = 0;
    state.books.forEach(b => {
      const p = parseFloat(b.price);
      if (!isNaN(p) && p > 0) totalCustomPrice += p;
    });
    const moneyStr = totalCustomPrice > 0 ? ('₹' + totalCustomPrice.toLocaleString('en-IN')) : ('₹' + (done * 399).toLocaleString('en-IN'));

    // Header Title
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('Mind & Focus Books Tracker - Reading Library', 40, 40);

    // Subtitle & Statistics
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Generated: ' + today + '  |  Total Books: ' + total + '  |  Finished: ' + done + '  |  Reading: ' + reading + '  |  Value: ' + moneyStr,
      40,
      58
    );

    // Prepare Table Rows
    const tableRows = state.books.map(b => {
      const days = getBookEffectiveDays(b);
      const isReading = b.status === 'READING';
      const endDate = isReading ? today + ' (Reading)' : (b.end_date || '-');
      const rating = b.rating ? b.rating + ' ★' : '-';
      const price = b.price ? ('₹' + b.price) : '-';
      const takeaway = b.takeaway ? b.takeaway.slice(0, 120) + (b.takeaway.length > 120 ? '...' : '') : '-';

      return [
        b.no || '',
        b.title || '',
        b.author || '',
        b.category || '',
        b.status || 'PENDING',
        price,
        b.start_date || '-',
        endDate,
        days + ' d',
        rating,
        takeaway
      ];
    });

    doc.autoTable({
      startY: 70,
      head: [['No', 'Book Title', 'Author', 'Category', 'Status', 'Price', 'Start Date', 'End Date', 'Days', 'Rating', 'Key Takeaway / Notes']],
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
        0: { cellWidth: 32, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 145, fontStyle: 'bold' },
        2: { cellWidth: 90 },
        3: { cellWidth: 80 },
        4: { cellWidth: 50, halign: 'center' },
        5: { cellWidth: 45, halign: 'center' },
        6: { cellWidth: 55, halign: 'center' },
        7: { cellWidth: 60, halign: 'center' },
        8: { cellWidth: 35, halign: 'center' },
        9: { cellWidth: 35, halign: 'center' },
        10: { cellWidth: 140 }
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
  const overlay = document.getElementById('pickBookModalOverlay');
  if (overlay) overlay.classList.remove('active');
  restoreDockActiveTab();
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

  const priceEl = document.getElementById('certPrice');
  if (priceEl) {
    priceEl.innerText = (book.price && Number(book.price) > 0) ? ('₹' + Number(book.price).toLocaleString('en-IN')) : 'Priceless';
  }

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

// ==========================================
// FEATURE: BOOK LEND / BORROW TRACKER
// ==========================================
function openLendModal(index) {
  const book = state.books[index];
  if (!book) return;

  state.currentLendIndex = index;
  const titleEl = document.getElementById('lendModalBookTitle');
  const authEl = document.getElementById('lendModalBookAuthor');
  const borrowerInput = document.getElementById('lendBorrowerName');
  const dateInput = document.getElementById('lendDate');
  const expInput = document.getElementById('lendExpectedDate');
  const contactInput = document.getElementById('lendContact');
  const returnBtn = document.getElementById('returnBookBtn');

  if (titleEl) titleEl.innerText = book.title || book.no;
  if (authEl) authEl.innerText = 'by ' + (book.author || 'Unknown');
  if (borrowerInput) borrowerInput.value = book.lent_to || '';
  if (dateInput) dateInput.value = book.lent_date || getTodayString();
  if (expInput) expInput.value = book.lent_expected || '';
  if (contactInput) contactInput.value = book.lent_contact || '';

  if (returnBtn) {
    returnBtn.style.display = book.lent_to ? 'inline-flex' : 'none';
  }

  document.getElementById('lendModalOverlay').classList.add('active');
}

function closeLendModal() {
  document.getElementById('lendModalOverlay').classList.remove('active');
  state.currentLendIndex = -1;
}

function saveLendModal() {
  if (state.currentLendIndex < 0) return;
  const book = state.books[state.currentLendIndex];
  if (!book) return;

  const borrower = document.getElementById('lendBorrowerName').value.trim();
  if (!borrower) {
    alert('Please enter borrower name (Kisko di hai?)');
    return;
  }

  book.lent_to = borrower;
  book.lent_date = document.getElementById('lendDate').value || getTodayString();
  book.lent_expected = document.getElementById('lendExpectedDate').value || '';
  book.lent_contact = document.getElementById('lendContact').value.trim();

  markChange();
  saveData();
  closeLendModal();
  renderApp();
  showToast('Book lent to ' + borrower + '! 🤝', 'success');
}

function returnBook(index) {
  const book = state.books[index];
  if (!book) return;
  const prevBorrower = book.lent_to;
  book.lent_to = '';
  book.lent_date = '';
  book.lent_expected = '';
  book.lent_contact = '';

  markChange();
  saveData();
  renderApp();
  showToast('Marked "' + book.title + '" as returned from ' + (prevBorrower || 'borrower') + '! ✅', 'success');
}

function markCurrentBookReturned() {
  if (state.currentLendIndex >= 0) {
    returnBook(state.currentLendIndex);
    closeLendModal();
  }
}

// ==========================================
// FEATURE: BARCODE / ISBN SCANNER
// ==========================================
let scannerStream = null;
let scannerFacingMode = 'environment';
let isScanningActive = false;
let barcodeDetector = null;

if ('BarcodeDetector' in window) {
  try {
    barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] });
  } catch (e) {
    console.log('BarcodeDetector init error:', e);
  }
}

function openBarcodeScanner() {
  document.getElementById('manualIsbnInput').value = '';
  document.getElementById('isbnLookupStatus').innerText = '';
  document.getElementById('barcodeScannerOverlay').classList.add('active');
  startCameraStream();
}

function closeBarcodeScanner() {
  stopCameraStream();
  document.getElementById('barcodeScannerOverlay').classList.remove('active');
}

async function startCameraStream() {
  const statusEl = document.getElementById('scannerStatusText');
  const videoEl = document.getElementById('scannerVideo');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (statusEl) statusEl.innerText = 'Camera API not supported. Please use manual ISBN lookup below.';
    return;
  }

  stopCameraStream();
  if (statusEl) statusEl.innerText = 'Requesting camera access...';

  try {
    const constraints = {
      video: {
        facingMode: { ideal: scannerFacingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoEl) {
      videoEl.srcObject = scannerStream;
      await videoEl.play();
      if (statusEl) statusEl.innerText = 'Align barcode inside the target box';
      isScanningActive = true;
      scanFrameLoop();
    }
  } catch (err) {
    console.error('Camera stream error:', err);
    if (statusEl) statusEl.innerText = 'Camera access blocked or unavailable. You can enter ISBN manually below.';
  }
}

function stopCameraStream() {
  isScanningActive = false;
  if (scannerStream) {
    scannerStream.getTracks().forEach(track => track.stop());
    scannerStream = null;
  }
  const videoEl = document.getElementById('scannerVideo');
  if (videoEl) videoEl.srcObject = null;
}

function switchScannerCamera() {
  scannerFacingMode = scannerFacingMode === 'environment' ? 'user' : 'environment';
  startCameraStream();
}

async function scanFrameLoop() {
  if (!isScanningActive) return;
  const videoEl = document.getElementById('scannerVideo');

  if (barcodeDetector && videoEl && videoEl.readyState >= 2) {
    try {
      const barcodes = await barcodeDetector.detect(videoEl);
      if (barcodes && barcodes.length > 0) {
        const raw = barcodes[0].rawValue;
        if (raw) {
          isScanningActive = false;
          const statusEl = document.getElementById('scannerStatusText');
          if (statusEl) statusEl.innerText = 'Found Barcode: ' + raw + '! Fetching book info...';
          stopCameraStream();
          fetchBookByIsbn(raw);
          return;
        }
      }
    } catch (e) {
      // ignore frame skip
    }
  }

  if (isScanningActive) {
    requestAnimationFrame(scanFrameLoop);
  }
}

function handleBarcodePhotoUpload(input) {
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  const statusEl = document.getElementById('isbnLookupStatus');

  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      if (barcodeDetector) {
        try {
          if (statusEl) statusEl.innerText = 'Scanning uploaded image for barcode...';
          const barcodes = await barcodeDetector.detect(img);
          if (barcodes && barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            fetchBookByIsbn(raw);
            return;
          }
        } catch (err) {
          console.error('Image scan error:', err);
        }
      }
      if (statusEl) statusEl.innerText = 'Could not detect barcode from image. Try entering ISBN manually.';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function lookupManualIsbn() {
  const input = document.getElementById('manualIsbnInput');
  if (!input) return;
  const cleaned = input.value.replace(/[^0-9X]/gi, '').trim();
  if (cleaned.length < 9) {
    alert('Please enter a valid 10 or 13-digit ISBN number.');
    return;
  }
  fetchBookByIsbn(cleaned);
}

async function fetchBookByIsbn(isbn) {
  const statusEl = document.getElementById('isbnLookupStatus');
  if (statusEl) statusEl.innerHTML = '<span style="color:#3b82f6;">🔍 Fetching details for ISBN: <strong>' + escapeHtml(isbn) + '</strong>...</span>';

  let foundData = null;

  // 1. Try Open Library API
  try {
    const olRes = await fetch('https://openlibrary.org/api/books?bibkeys=ISBN:' + isbn + '&jscmd=data&format=json');
    if (olRes.ok) {
      const olJson = await olRes.json();
      const olKey = 'ISBN:' + isbn;
      if (olJson && olJson[olKey]) {
        const b = olJson[olKey];
        foundData = {
          title: b.title || '',
          author: (b.authors && b.authors.length > 0) ? b.authors.map(a => a.name).join(', ') : '',
          category: (b.subjects && b.subjects.length > 0) ? b.subjects[0].name : 'Focus & Concentration',
          coverUrl: b.cover ? (b.cover.medium || b.cover.large || b.cover.small) : '',
          pages: b.number_of_pages || 0
        };
      }
    }
  } catch (e) {
    console.log('OpenLibrary fetch failed:', e);
  }

  // 2. Try Google Books API if Open Library had missing data
  if (!foundData || !foundData.title) {
    try {
      const gbRes = await fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn);
      if (gbRes.ok) {
        const gbJson = await gbRes.json();
        if (gbJson.items && gbJson.items.length > 0) {
          const info = gbJson.items[0].volumeInfo;
          foundData = {
            title: info.title || '',
            author: (info.authors && info.authors.length > 0) ? info.authors.join(', ') : '',
            category: (info.categories && info.categories.length > 0) ? info.categories[0] : 'Focus & Concentration',
            coverUrl: info.imageLinks ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail) : '',
            pages: info.pageCount || 0
          };
        }
      }
    } catch (e) {
      console.log('Google Books fetch failed:', e);
    }
  }

  if (foundData && foundData.title) {
    if (statusEl) statusEl.innerHTML = '<span style="color:#10b981;">✅ Found: <strong>' + escapeHtml(foundData.title) + '</strong>! Opening form...</span>';
    setTimeout(() => {
      applyFetchedBookData(foundData);
    }, 600);
  } else {
    if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444;">⚠️ No metadata found for ISBN ' + escapeHtml(isbn) + '. You can enter it manually in Add Book.</span>';
  }
}

function applyFetchedBookData(data) {
  closeBarcodeScanner();
  openAddModal();

  if (data.title) document.getElementById('editBookTitle').value = data.title;
  if (data.author) document.getElementById('editBookAuthor').value = data.author;
  if (data.category) document.getElementById('editBookCategory').value = data.category;

  if (data.coverUrl) {
    state.currentEditingCoverImage = data.coverUrl;
    updateCoverPreview();
  }

  showToast('Book details auto-filled from ISBN! 📚', 'success');
}

// ==========================================
// FEATURE: PRIVACY LOCK (4-DIGIT PIN)
// ==========================================
function initPrivacyLock() {
  const savedPin = localStorage.getItem(PIN_KEY);
  updatePrivacyBtnHeader(Boolean(savedPin));

  if (savedPin) {
    state.pinLocked = true;
    showPinLockScreen();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      const pin = localStorage.getItem(PIN_KEY);
      if (pin) {
        state.pinLocked = true;
      }
    } else {
      const pin = localStorage.getItem(PIN_KEY);
      if (pin && state.pinLocked) {
        showPinLockScreen();
      }
    }
  });
}

function updatePrivacyBtnHeader(isPinSet) {
  const btn = document.getElementById('privacyLockBtn');
  if (!btn) return;
  if (isPinSet) {
    btn.innerHTML = '🔒 PIN Active';
    btn.style.borderColor = 'rgba(16,185,129,0.5)';
    btn.style.color = '#10b981';
  } else {
    btn.innerHTML = '🔓 Set PIN';
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

function showPinLockScreen() {
  clearEnteredPin();
  const overlay = document.getElementById('privacyLockOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function hidePinLockScreen() {
  const overlay = document.getElementById('privacyLockOverlay');
  if (overlay) overlay.style.display = 'none';
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('pinDot' + i);
    if (dot) {
      dot.classList.toggle('active', i < state.enteredPin.length);
    }
  }
}

function enterPinDigit(digit) {
  if (state.enteredPin.length >= 4) return;
  state.enteredPin += String(digit);
  updatePinDots();

  const errEl = document.getElementById('pinErrorMessage');
  if (errEl) errEl.innerText = '';

  if (state.enteredPin.length === 4) {
    setTimeout(verifyEnteredPin, 100);
  }
}

function deletePinDigit() {
  if (state.enteredPin.length > 0) {
    state.enteredPin = state.enteredPin.slice(0, -1);
    updatePinDots();
  }
}

function clearEnteredPin() {
  state.enteredPin = '';
  updatePinDots();
  const errEl = document.getElementById('pinErrorMessage');
  if (errEl) errEl.innerText = '';
}

function verifyEnteredPin() {
  const savedPin = localStorage.getItem(PIN_KEY);
  if (!savedPin) {
    state.pinLocked = false;
    hidePinLockScreen();
    return;
  }

  if (state.enteredPin === savedPin) {
    state.pinLocked = false;
    hidePinLockScreen();
    clearEnteredPin();
    showToast('Library Unlocked! 🔓', 'success');
  } else {
    const card = document.getElementById('lockCard');
    const errEl = document.getElementById('pinErrorMessage');
    if (errEl) errEl.innerText = 'Incorrect PIN. Try again.';
    if (card) {
      card.classList.add('shake-animation');
      setTimeout(() => {
        card.classList.remove('shake-animation');
        clearEnteredPin();
      }, 450);
    } else {
      clearEnteredPin();
    }
  }
}

function handlePrivacyBtnClick() {
  openPinSetupModal();
}

function openPinSetupModal() {
  const savedPin = localStorage.getItem(PIN_KEY);
  document.getElementById('newPinInput').value = '';
  document.getElementById('confirmPinInput').value = '';
  document.getElementById('pinSetupStatus').innerText = '';

  const removeBtn = document.getElementById('removePinBtn');
  if (removeBtn) {
    removeBtn.style.display = savedPin ? 'inline-flex' : 'none';
  }

  document.getElementById('pinSetupModalOverlay').classList.add('active');
}

function closePinSetupModal() {
  document.getElementById('pinSetupModalOverlay').classList.remove('active');
}

function savePrivacyPin() {
  const pin1 = document.getElementById('newPinInput').value.trim();
  const pin2 = document.getElementById('confirmPinInput').value.trim();
  const statusEl = document.getElementById('pinSetupStatus');

  if (!/^\d{4}$/.test(pin1)) {
    if (statusEl) statusEl.innerText = 'PIN must be exactly 4 numbers (0-9).';
    return;
  }

  if (pin1 !== pin2) {
    if (statusEl) statusEl.innerText = 'PINs do not match. Please verify.';
    return;
  }

  localStorage.setItem(PIN_KEY, pin1);
  updatePrivacyBtnHeader(true);
  closePinSetupModal();
  showToast('Privacy PIN enabled successfully! 🔒', 'success');
}

function removePrivacyPin() {
  if (confirm('Are you sure you want to remove the PIN lock?')) {
    localStorage.removeItem(PIN_KEY);
    state.pinLocked = false;
    updatePrivacyBtnHeader(false);
    closePinSetupModal();
    showToast('Privacy PIN removed.', '');
  }
}

// ==========================================
// FEATURE: 3D REALISTIC WOODEN BOOKSHELF VIEW
// ==========================================
function renderBookshelfView(container, books) {
  if (!books || books.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:4rem 1rem; text-align:center; color:var(--text-muted);">' +
      '<div style="font-size:2.5rem; margin-bottom:0.5rem;">📚</div>' +
      '<div>No books found matching your current filter.</div></div>';
    return;
  }

  const booksPerShelf = 6;
  const shelvesCount = Math.ceil(books.length / booksPerShelf);
  let html = '<div class="bookshelf-container">';

  for (let s = 0; s < shelvesCount; s++) {
    const shelfBooks = books.slice(s * booksPerShelf, (s + 1) * booksPerShelf);
    html += '<div class="shelf-unit"><div class="shelf-books-row">';

    shelfBooks.forEach(b => {
      const origIdx = b.originalIndex;
      const days = getBookEffectiveDays(b);
      const isReading = b.status === 'READING';
      const isDone = b.status === 'DONE';
      const isLent = Boolean(b.lent_to);

      let spineColor = '#3b82f6';
      if (isDone) spineColor = '#10b981';
      else if (isReading) spineColor = '#f59e0b';
      else if (isLent) spineColor = '#8b5cf6';

      let statusBadge = '';
      if (isLent) statusBadge = '<span class="shelf-book-badge" style="background:#8b5cf6;">🤝 Lent</span>';
      else if (isReading) statusBadge = '<span class="shelf-book-badge" style="background:#f59e0b;">📖 Reading</span>';
      else if (isDone) statusBadge = '<span class="shelf-book-badge" style="background:#10b981;">✅ Finished</span>';

      html += '<div class="shelf-book" onclick="openEditModal(' + origIdx + ')" title="' + escapeHtml(b.title) + ' by ' + escapeHtml(b.author) + ' (Click to view/edit)">' +
        '<div class="shelf-book-inner" style="border-left: 5px solid ' + spineColor + ';">' +
        (b.cover_image 
          ? '<img class="shelf-book-cover" src="' + b.cover_image + '" alt="cover">'
          : '<div class="shelf-book-spine"><div class="shelf-book-spine-title">' + escapeHtml(b.title) + '</div><div class="shelf-book-spine-author">' + escapeHtml(b.author) + '</div></div>') +
        statusBadge +
        '</div>' +
        '<div class="shelf-book-label">' + escapeHtml(b.title) + '</div>' +
        '</div>';
    });

    html += '</div><div class="shelf-wood"></div></div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// ==========================================
// FEATURE 1: PAGE TEXT SCANNER / OCR
// ==========================================
let currentOcrTargetField = 'takeawayTextarea';
let currentOcrImageDataUrl = '';
let isOcrHighContrast = false;

function openOcrScanner(targetField) {
  currentOcrTargetField = targetField || 'takeawayTextarea';
  currentOcrImageDataUrl = '';
  isOcrHighContrast = false;

  const previewWrap = document.getElementById('ocrPreviewWrap');
  const previewImg = document.getElementById('ocrPreviewImg');
  const statusWrap = document.getElementById('ocrStatusWrap');
  const resultWrap = document.getElementById('ocrResultWrap');
  const insertBtn = document.getElementById('ocrInsertBtn');
  const bwBtn = document.getElementById('ocrFilterBwBtn');
  const fileInput = document.getElementById('ocrImageFileInput');

  if (previewWrap) previewWrap.style.display = 'none';
  if (previewImg) previewImg.src = '';
  if (statusWrap) statusWrap.style.display = 'none';
  if (resultWrap) resultWrap.style.display = 'none';
  if (insertBtn) insertBtn.style.display = 'none';
  if (bwBtn) bwBtn.style.display = 'none';
  if (fileInput) fileInput.value = '';

  document.getElementById('ocrScannerOverlay').classList.add('active');
}

function closeOcrScanner() {
  document.getElementById('ocrScannerOverlay').classList.remove('active');
}

function handleOcrPhotoUpload(input) {
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    currentOcrImageDataUrl = e.target.result;
    const previewImg = document.getElementById('ocrPreviewImg');
    const previewWrap = document.getElementById('ocrPreviewWrap');
    const bwBtn = document.getElementById('ocrFilterBwBtn');

    if (previewImg && previewWrap) {
      previewImg.src = currentOcrImageDataUrl;
      previewWrap.style.display = 'block';
    }
    if (bwBtn) bwBtn.style.display = 'inline-flex';

    // Automatically trigger text recognition
    runOcrExtraction(currentOcrImageDataUrl);
  };
  reader.readAsDataURL(file);
}

function toggleOcrContrast() {
  if (!currentOcrImageDataUrl) return;
  isOcrHighContrast = !isOcrHighContrast;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    if (isOcrHighContrast) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const val = gray > 128 ? 255 : 0;
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const processedUrl = canvas.toDataURL('image/jpeg', 0.85);
    const previewImg = document.getElementById('ocrPreviewImg');
    if (previewImg) previewImg.src = processedUrl;
    runOcrExtraction(processedUrl);
  };
  img.src = currentOcrImageDataUrl;
}

async function runOcrExtraction(imageSrc) {
  const statusWrap = document.getElementById('ocrStatusWrap');
  const statusText = document.getElementById('ocrStatusText');
  const progressBar = document.getElementById('ocrProgressBar');
  const resultWrap = document.getElementById('ocrResultWrap');
  const resultText = document.getElementById('ocrResultText');
  const insertBtn = document.getElementById('ocrInsertBtn');

  if (statusWrap) statusWrap.style.display = 'block';
  if (resultWrap) resultWrap.style.display = 'none';
  if (insertBtn) insertBtn.style.display = 'none';
  if (progressBar) progressBar.style.width = '10%';
  if (statusText) statusText.innerText = 'Initializing OCR reader...';

  if (typeof Tesseract === 'undefined') {
    if (statusText) statusText.innerText = 'OCR engine loading... Please wait 3 seconds and retry.';
    showToast('OCR engine initializing...', '');
    return;
  }

  try {
    const res = await Tesseract.recognize(imageSrc, 'eng', {
      logger: (m) => {
        if (m && m.progress) {
          const pct = Math.round(m.progress * 100);
          if (progressBar) progressBar.style.width = pct + '%';
          if (statusText) statusText.innerText = (m.status ? (m.status.charAt(0).toUpperCase() + m.status.slice(1)) : 'Scanning') + ' (' + pct + '%)...';
        }
      }
    });

    const text = (res && res.data && res.data.text) ? res.data.text.trim() : '';

    if (progressBar) progressBar.style.width = '100%';
    if (statusText) statusText.innerText = text ? 'Text extracted successfully! ✅' : 'No readable text found. Try a clearer or higher-contrast photo.';

    if (resultWrap && resultText) {
      resultText.value = text;
      resultWrap.style.display = 'block';
    }
    if (insertBtn && text) {
      insertBtn.style.display = 'inline-flex';
    }
  } catch (err) {
    console.error('OCR Error:', err);
    if (statusText) statusText.innerText = 'Could not read text from this image. Please ensure good lighting and clear text.';
  }
}

function applyOcrToNotes() {
  const resultTextEl = document.getElementById('ocrResultText');
  if (!resultTextEl) return;
  const quote = resultTextEl.value.trim();
  if (!quote) {
    alert('No text to insert.');
    return;
  }

  const targetEl = document.getElementById(currentOcrTargetField);
  if (targetEl) {
    const existing = targetEl.value.trim();
    if (existing) {
      targetEl.value = existing + '\n\n' + quote;
    } else {
      targetEl.value = quote;
    }
    showToast('Quote inserted into Notes! 📝', 'success');
  }
  closeOcrScanner();
}

// ==========================================
// FEATURE 5: AUTO-BACKUP & SAFETY HUB
// ==========================================
const BACKUP_KEY = 'mind_focus_backup_snapshot_v1';
const BACKUP_META_KEY = 'mind_focus_backup_meta_v1';

function triggerAutoSnapshot() {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      booksCount: state.books.length,
      books: state.books
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(payload));
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify({
      lastSaved: new Date().toLocaleString('en-IN'),
      booksCount: state.books.length
    }));
  } catch (e) {
    console.log('Snapshot storage notice:', e);
  }
}

function openBackupModal() {
  const countEl = document.getElementById('backupStatusBooksCount');
  const dateEl = document.getElementById('backupStatusLastSaved');

  const metaStr = localStorage.getItem(BACKUP_META_KEY);
  let meta = null;
  if (metaStr) {
    try { meta = JSON.parse(metaStr); } catch (e) {}
  }

  if (countEl) {
    countEl.innerText = state.books.length + ' Books Protected';
  }
  if (dateEl) {
    dateEl.innerText = meta ? ('Last Auto-Snapshot: ' + meta.lastSaved) : ('Last Auto-Snapshot: Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }

  document.getElementById('backupModalOverlay').classList.add('active');
}

function closeBackupModal() {
  document.getElementById('backupModalOverlay').classList.remove('active');
}

function downloadBackupFile() {
  const now = new Date();
  const dateSlug = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const fileName = 'MindFocusBooks_Backup_' + dateSlug + '.json';
  const jsonContent = JSON.stringify(state.books, null, 2);

  if (window.Android && typeof window.Android.saveBackupFile === 'function') {
    window.Android.saveBackupFile(jsonContent, fileName);
    triggerAutoSnapshot();
    showToast('Backup saved to your phone Downloads! 💾', 'success');
    return;
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  triggerAutoSnapshot();
  showToast('Backup saved to your Downloads! 💾', 'success');
}

async function shareBackupToCloud() {
  const now = new Date();
  const dateSlug = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const fileName = 'MindFocusBooks_Backup_' + dateSlug + '.json';
  const jsonContent = JSON.stringify(state.books, null, 2);

  if (window.Android && typeof window.Android.shareBackup === 'function') {
    window.Android.shareBackup(jsonContent, fileName);
    return;
  }

  if (navigator.canShare) {
    try {
      const file = new File([jsonContent], fileName, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mind Focus Books Backup',
          text: 'My Mind Focus Books Tracker Backup (' + state.books.length + ' books)'
        });
        showToast('Shared backup to Cloud/App! ☁️', 'success');
        return;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('File share error, falling back to download:', err);
      } else {
        return;
      }
    }
  }

  downloadBackupFile();
  showToast('Backup file downloaded! You can upload it to Google Drive.', 'success');
}

function quickRollbackSnapshot() {
  const snapStr = localStorage.getItem(BACKUP_KEY);
  if (!snapStr) {
    alert('No previous auto-snapshot found yet.');
    return;
  }

  try {
    const snap = JSON.parse(snapStr);
    if (!snap.books || !Array.isArray(snap.books)) {
      alert('Snapshot data invalid.');
      return;
    }

    if (confirm('Rollback library to snapshot saved at ' + (snap.timestamp ? new Date(snap.timestamp).toLocaleString('en-IN') : 'previous save') + ' (' + snap.books.length + ' books)? Current unsaved changes will be replaced.')) {
      state.books = snap.books;
      saveData();
      populateCategoryDropdown();
      renderApp();
      closeBackupModal();
      showToast('Library restored from Auto-Snapshot! 🔄', 'success');
    }
  } catch (e) {
    alert('Could not restore snapshot.');
  }
}

function handleBackupFileRestore(input) {
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      let newBooks = [];
      if (Array.isArray(parsed)) {
        newBooks = parsed;
      } else if (parsed && Array.isArray(parsed.books)) {
        newBooks = parsed.books;
      } else {
        alert('Invalid JSON backup format.');
        return;
      }

      if (confirm('Restore ' + newBooks.length + ' books from "' + file.name + '"? This will update your library.')) {
        state.books = newBooks;
        saveData();
        populateCategoryDropdown();
        renderApp();
        closeBackupModal();
        showToast('Restored ' + newBooks.length + ' books successfully! 📚', 'success');
      }
    } catch (err) {
      alert('Failed to parse backup JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
  input.value = '';
}

// ==========================================
// FEATURE 1: SHORTCUT INTENT ACTIONS
// ==========================================
function handleShortcutIntentActions() {
  try {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (!action) return;

    if (action === 'add_book') {
      setTimeout(() => {
        openAddModal();
      }, 400);
    } else if (action === 'scan_barcode') {
      setTimeout(() => {
        openBarcodeScanner();
      }, 400);
    } else if (action === 'open_bookshelf') {
      setTimeout(() => {
        switchBottomTab('bookshelf');
      }, 400);
    }
  } catch (e) {
    console.log('Shortcut action check notice:', e);
  }
}

// ==========================================
// FEATURE 2: BOTTOM NAVIGATION DOCK
// ==========================================
function switchBottomTab(tab) {
  if (typeof triggerHaptic === 'function') triggerHaptic('light');

  const dockHome = document.getElementById('dockHomeBtn');
  const dockBookshelf = document.getElementById('dockBookshelfBtn');
  const dockAmbience = document.getElementById('dockAmbienceBtn');
  const dockStreak = document.getElementById('dockStreakBtn');
  const dockRoulette = document.getElementById('dockRouletteBtn');
  const dockSettings = document.getElementById('dockSettingsBtn');

  if (dockHome) dockHome.classList.toggle('active', tab === 'home');
  if (dockBookshelf) dockBookshelf.classList.toggle('active', tab === 'bookshelf');
  if (dockAmbience) dockAmbience.classList.toggle('active', tab === 'ambience');
  if (dockStreak) dockStreak.classList.toggle('active', tab === 'streak');
  if (dockRoulette) dockRoulette.classList.toggle('active', tab === 'roulette');
  if (dockSettings) dockSettings.classList.toggle('active', tab === 'settings');

  if (typeof updateDockSlidingPill === 'function') updateDockSlidingPill(tab);

  if (tab === 'home') {
    setViewMode('table');
    document.querySelectorAll('.tab-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.status === 'ALL');
    });
    state.statusFilter = 'ALL';
    state.currentPage = 1;
    renderApp();
  } else if (tab === 'bookshelf') {
    setViewMode('bookshelf');
  } else if (tab === 'ambience') {
    openAmbienceModal();
  } else if (tab === 'streak') {
    openStreakModal();
  } else if (tab === 'roulette') {
    openPickBookModal();
  } else if (tab === 'settings') {
    openSettingsModal();
  }
}

function restoreDockActiveTab() {
  const isBookshelf = state.viewMode === 'bookshelf';
  const dockHome = document.getElementById('dockHomeBtn');
  const dockBookshelf = document.getElementById('dockBookshelfBtn');
  const dockAmbience = document.getElementById('dockAmbienceBtn');
  const dockStreak = document.getElementById('dockStreakBtn');
  const dockRoulette = document.getElementById('dockRouletteBtn');
  const dockSettings = document.getElementById('dockSettingsBtn');

  if (dockHome) dockHome.classList.toggle('active', !isBookshelf);
  if (dockBookshelf) dockBookshelf.classList.toggle('active', isBookshelf);
  if (dockAmbience) dockAmbience.classList.remove('active');
  if (dockStreak) dockStreak.classList.remove('active');
  if (dockRoulette) dockRoulette.classList.remove('active');
  if (dockSettings) dockSettings.classList.remove('active');
}

// ==========================================
// FEATURE 3: SETTINGS & IN-APP UPDATE CHECKER
// ==========================================
const CURRENT_APP_VERSION = 'v3.0.4';
let latestApkDownloadUrl = '';

function openSettingsModal() {
  updateSettingsThemeChoices();
  const overlay = document.getElementById('appSettingsModalOverlay');
  if (overlay) overlay.classList.add('active');
}

function closeSettingsModal() {
  const overlay = document.getElementById('appSettingsModalOverlay');
  if (overlay) overlay.classList.remove('active');
  restoreDockActiveTab();
}

function openUpdateCheckerModal() {
  document.getElementById('updateCheckerModalOverlay').classList.add('active');
}

function closeUpdateCheckerModal() {
  document.getElementById('updateCheckerModalOverlay').classList.remove('active');
}

async function checkForAppUpdates(showFeedback = true) {
  openUpdateCheckerModal();
  if (typeof triggerHaptic === 'function') triggerHaptic('light');

  const icon = document.getElementById('updateModalIcon');
  const title = document.getElementById('updateModalTitle');
  const desc = document.getElementById('updateModalDesc');
  const progress = document.getElementById('updateModalProgress');
  const actionBtn = document.getElementById('updateModalActionBtn');
  const currentBadge = document.getElementById('updateCurrentVersionBadge');
  const targetBadge = document.getElementById('updateTargetVersionBadge');
  const changelogCard = document.getElementById('updateChangelogCard');
  const changelogTag = document.getElementById('updateChangelogTag');
  const radarSweep = document.getElementById('updateRadarSweep');

  if (currentBadge) currentBadge.innerText = CURRENT_APP_VERSION;
  if (targetBadge) {
    targetBadge.innerText = 'Scanning...';
    targetBadge.className = 'version-diff-pill current';
  }
  if (icon) icon.innerText = '🛰️';
  if (radarSweep) radarSweep.style.display = 'block';
  if (title) title.innerText = 'Quantum Radar Scanning Cloud...';
  if (desc) desc.innerText = 'Querying GitHub release servers to check for updates & improvements...';
  if (progress) progress.style.display = 'none';
  if (actionBtn) actionBtn.style.display = 'none';
  if (changelogCard) changelogCard.style.display = 'none';

  try {
    const res = await fetch('https://api.github.com/repos/ankitburdak05-oss/mind-focus-books-tracker/releases/latest');
    if (!res.ok) throw new Error('Could not contact update server');
    const data = await res.json();
    const tagName = data.tag_name || 'v3.0.0';
    const releaseName = data.name || ('Mind Focus Books Tracker ' + tagName);

    let apkUrl = 'https://github.com/ankitburdak05-oss/mind-focus-books-tracker/releases/download/' + tagName + '/MindFocusBooks-Native.apk';
    if (data.assets && data.assets.length > 0) {
      const apkAsset = data.assets.find(a => a.name.endsWith('.apk'));
      if (apkAsset) apkUrl = apkAsset.browser_download_url;
    }
    latestApkDownloadUrl = apkUrl;

    if (targetBadge) {
      targetBadge.innerText = tagName;
      targetBadge.className = 'version-diff-pill latest';
    }

    if (tagName === CURRENT_APP_VERSION) {
      if (icon) icon.innerText = '🛡️';
      if (radarSweep) radarSweep.style.display = 'none';
      if (title) title.innerText = 'Your App is 100% Up to Date! ✦';
      if (desc) desc.innerHTML = '<b>' + releaseName + '</b><br>You are already on the newest 4D Living Spatial Sanctuary Flagship.<br><small style="color:#10b981;">● All systems optimal &amp; permanent keystore verified.</small>';
      if (changelogCard) {
        changelogCard.style.display = 'block';
        if (changelogTag) changelogTag.innerText = CURRENT_APP_VERSION + ' (Active)';
      }
      if (actionBtn) {
        actionBtn.style.display = 'inline-flex';
        actionBtn.innerText = '🔄 Re-install / Repair ' + tagName;
        actionBtn.onclick = () => triggerInAppUpdate(apkUrl);
      }
      if (typeof triggerHaptic === 'function') triggerHaptic('success');
    } else {
      if (icon) icon.innerText = '🚀';
      if (radarSweep) radarSweep.style.display = 'none';
      if (title) title.innerText = 'New Update Ready: ' + tagName;
      if (desc) desc.innerHTML = '<b>' + releaseName + '</b><br>New 4D Sensory Upgrades &amp; Android App Icon enhancements are ready to install!<br><small style="color:#38bdf8;">✦ 1-Tap direct install with zero data loss.</small>';
      if (changelogCard) {
        changelogCard.style.display = 'block';
        if (changelogTag) changelogTag.innerText = tagName + ' (New)';
      }
      if (actionBtn) {
        actionBtn.style.display = 'inline-flex';
        actionBtn.innerText = '⚡ Download & Install ' + tagName + ' Now';
        actionBtn.onclick = () => triggerInAppUpdate(apkUrl);
      }
      if (typeof triggerHaptic === 'function') triggerHaptic('celebration');
    }
  } catch (err) {
    console.error('Update check failed:', err);
    if (icon) icon.innerText = '⚠️';
    if (radarSweep) radarSweep.style.display = 'none';
    if (title) title.innerText = 'Offline Mode / Server Notice';
    if (desc) desc.innerText = 'Could not contact update server. Please check internet connection.';
    if (targetBadge) targetBadge.innerText = 'Unavailable';
  }
}

function triggerInAppUpdate(apkUrl) {
  if (typeof triggerHaptic === 'function') triggerHaptic('medium');
  const desc = document.getElementById('updateModalDesc');
  const progress = document.getElementById('updateModalProgress');
  const fill = document.getElementById('updateProgressFill');
  const pctText = document.getElementById('updateProgressPct');
  const textInfo = document.getElementById('updateProgressText');
  const actionBtn = document.getElementById('updateModalActionBtn');

  if (desc) desc.innerText = 'Downloading signed release package... Android package installer will trigger automatically.';
  if (progress) progress.style.display = 'flex';
  if (actionBtn) actionBtn.style.display = 'none';

  // Animate progress bar simulation
  let pct = 0;
  const timer = setInterval(() => {
    pct += Math.floor(Math.random() * 15) + 10;
    if (pct >= 100) {
      pct = 100;
      clearInterval(timer);
      if (textInfo) textInfo.innerText = 'Package Ready! Launching Installer...';
      if (typeof triggerHaptic === 'function') triggerHaptic('success');
    }
    if (fill) fill.style.width = pct + '%';
    if (pctText) pctText.innerText = pct + '%';
  }, 120);

  setTimeout(() => {
    if (window.Android && typeof window.Android.downloadAndInstallApk === 'function') {
      window.Android.downloadAndInstallApk(apkUrl);
      showToast('Downloading update package... ⏳', 'success');
    } else {
      window.location.href = apkUrl;
      showToast('Downloading update APK file...', 'success');
    }
  }, 600);
}

/* ==========================================================
   FEATURE 1: DAILY READING STREAK & ACHIEVEMENT BADGES
   ========================================================== */
const STREAK_KEY = 'mind_focus_streak_v1';

let streakState = {
  currentStreak: 1,
  highestStreak: 1,
  lastReadDate: '',
  activeDays: []
};

function initStreak() {
  const saved = localStorage.getItem(STREAK_KEY);
  const today = getTodayString();
  if (saved) {
    try {
      streakState = JSON.parse(saved);
      if (!Array.isArray(streakState.activeDays)) streakState.activeDays = [];
    } catch (e) {
      streakState = { currentStreak: 1, highestStreak: 1, lastReadDate: today, activeDays: [today] };
    }
  } else {
    streakState = { currentStreak: 1, highestStreak: 1, lastReadDate: today, activeDays: [today] };
  }

  // Verify streak gap
  if (streakState.lastReadDate && streakState.lastReadDate !== today) {
    const diff = calculateDaysDifference(streakState.lastReadDate, today);
    if (diff > 1) {
      // Missed more than 1 day
      streakState.currentStreak = 1;
    }
  }
  saveStreak();
}

function saveStreak() {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streakState));
}

function recordReadingActivity() {
  const today = getTodayString();
  if (!Array.isArray(streakState.activeDays)) {
    streakState.activeDays = [];
  }
  if (!streakState.activeDays.includes(today)) {
    streakState.activeDays.push(today);
  }

  if (streakState.lastReadDate !== today) {
    if (streakState.lastReadDate) {
      const diff = calculateDaysDifference(streakState.lastReadDate, today);
      if (diff === 1) {
        streakState.currentStreak = (streakState.currentStreak || 1) + 1;
      } else if (diff > 1) {
        streakState.currentStreak = 1;
      }
    } else {
      streakState.currentStreak = 1;
    }

    if (streakState.currentStreak > (streakState.highestStreak || 1)) {
      streakState.highestStreak = streakState.currentStreak;
    }
    streakState.lastReadDate = today;
    saveStreak();
  }

  // Check night owl trigger
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) {
    localStorage.setItem('mind_focus_night_owl', 'true');
  }

  updateStreakUI();
}

function updateStreakUI() {
  const count = Math.max(1, streakState.currentStreak || 1);
  const headerCount = document.getElementById('headerStreakCount');
  if (headerCount) headerCount.innerText = count;

  const kpiVal = document.getElementById('kpiStreakValue');
  if (kpiVal) kpiVal.innerText = count + ' Day' + (count > 1 ? 's' : '');

  const titleEl = document.getElementById('streakModalCountTitle');
  if (titleEl) titleEl.innerText = count + ' Day' + (count > 1 ? 's' : '') + ' Reading Streak! 🔥';

  const subEl = document.getElementById('streakModalSubtitle');
  if (subEl) {
    if (count >= 7) {
      subEl.innerText = 'Legendary habit! You have read consistently for over a full week! 👑';
    } else if (count >= 3) {
      subEl.innerText = 'Awesome momentum! Your reading muscle is getting stronger every day.';
    } else {
      subEl.innerText = 'Great start! Open the app and read daily to build an unbreakable reading habit.';
    }
  }

  renderStreakDots();
  renderBadgesGrid();
}

function renderStreakDots() {
  const container = document.getElementById('streakDaysTrack');
  if (!container) return;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0-6

  let html = '';
  for (let i = 0; i < 7; i++) {
    const isToday = i === currentDayOfWeek;
    const isPastOrToday = i <= currentDayOfWeek;
    const isActive = isPastOrToday && (streakState.currentStreak >= (currentDayOfWeek - i + 1));

    html += '<div class="streak-day-dot ' + (isActive ? 'active' : '') + '" title="' + dayNames[i] + '">' +
      dayNames[i][0] +
      '</div>';
  }
  container.innerHTML = html;
}

const BADGES_CONFIG = [
  {
    id: 'first_finish',
    icon: '🏆',
    title: 'First Finisher',
    desc: 'Finish your 1st book',
    check: () => state.books.some(b => b.status === 'DONE')
  },
  {
    id: 'streak_3',
    icon: '🔥',
    title: '3-Day Fire',
    desc: 'Reach a 3-day streak',
    check: () => ((streakState.currentStreak || 1) >= 3 || (streakState.highestStreak || 1) >= 3)
  },
  {
    id: 'streak_7',
    icon: '⚔️',
    title: 'Habit Warrior',
    desc: 'Hit a 7-day streak',
    check: () => ((streakState.currentStreak || 1) >= 7 || (streakState.highestStreak || 1) >= 7)
  },
  {
    id: 'night_owl',
    icon: '🌙',
    title: 'Midnight Reader',
    desc: 'Read past 10:00 PM',
    check: () => {
      const hr = new Date().getHours();
      return (hr >= 22 || hr < 5) || localStorage.getItem('mind_focus_night_owl') === 'true';
    }
  },
  {
    id: 'collector',
    icon: '📚',
    title: 'Library Builder',
    desc: 'Own 10+ books in app',
    check: () => state.books.length >= 10
  },
  {
    id: 'notes_master',
    icon: '💡',
    title: 'Wisdom Keeper',
    desc: 'Save notes on 3+ books',
    check: () => state.books.filter(b => b.takeaway && b.takeaway.trim().length > 0).length >= 3
  }
];

function renderBadgesGrid() {
  const container = document.getElementById('badgesCabinetGrid');
  const countEl = document.getElementById('trophiesUnlockedCount');
  if (!container) return;

  let unlockedCount = 0;
  let html = '';

  BADGES_CONFIG.forEach(badge => {
    const isUnlocked = badge.check();
    if (isUnlocked) unlockedCount++;

    html += '<div class="badge-trophy-card ' + (isUnlocked ? 'unlocked' : 'locked') + '">' +
      '<div class="trophy-icon">' + badge.icon + '</div>' +
      '<div class="trophy-title">' + badge.title + '</div>' +
      '<div class="trophy-desc">' + badge.desc + '</div>' +
      '<div class="trophy-status ' + (isUnlocked ? 'unlocked' : 'locked') + '">' +
      (isUnlocked ? 'UNLOCKED' : 'LOCKED') +
      '</div>' +
      '</div>';
  });

  container.innerHTML = html;
  if (countEl) {
    countEl.innerText = unlockedCount + ' / ' + BADGES_CONFIG.length + ' Unlocked';
  }
}

function openStreakModal() {
  updateStreakUI();
  if (typeof triggerHaptic === 'function') triggerHaptic('celebration');
  const overlay = document.getElementById('streakModalOverlay');
  if (overlay) overlay.classList.add('active');
  if (typeof draw3RingActivity === 'function') draw3RingActivity();
  if (typeof igniteStreakFlame === 'function') igniteStreakFlame();
}

function closeStreakModal() {
  const overlay = document.getElementById('streakModalOverlay');
  if (overlay) overlay.classList.remove('active');
  restoreDockActiveTab();
}

/* ==========================================================
   FEATURE 2: OFFLINE AMBIENCE SOUND SYNTHESIZER (WEB AUDIO)
   ========================================================== */
let audioCtx = null;
let currentAmbienceTrack = 'rain';
let isAmbiencePlaying = false;
let ambienceMasterGain = null;
let activeAudioNodes = [];

function getOrCreateAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function stopAmbienceAudio() {
  activeAudioNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (e) {}
  });
  activeAudioNodes = [];
  isAmbiencePlaying = false;
  updateAmbienceUI();
}

function startAmbienceAudio(track) {
  const ctx = getOrCreateAudioContext();
  if (!ctx) {
    showToast('Audio is not supported on this device', 'error');
    return;
  }
  stopAmbienceAudio();

  // Master Gain for volume
  ambienceMasterGain = ctx.createGain();
  const volSlider = document.getElementById('ambienceVolumeSlider');
  const rawVol = parseInt(volSlider ? volSlider.value : 60);
  const vol = (rawVol / 100) * 0.45;
  ambienceMasterGain.gain.setValueAtTime(vol, ctx.currentTime);
  ambienceMasterGain.connect(ctx.destination);
  activeAudioNodes.push(ambienceMasterGain);

  if (track === 'rain') {
    // Pink noise rain generation
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
      b6 = white * 0.115926;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(ambienceMasterGain);
    whiteNoise.start();
    activeAudioNodes.push(whiteNoise, filter);
  } else if (track === 'waves') {
    // 432Hz Alpha Focus Tone with 8Hz binaural pulse
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.12, ctx.currentTime);
    lfo.connect(lfoGain.gain);

    osc1.connect(ambienceMasterGain);
    osc2.connect(ambienceMasterGain);
    osc1.start();
    osc2.start();
    lfo.start();
    activeAudioNodes.push(osc1, osc2, lfo, lfoGain);
  } else if (track === 'forest') {
    // Forest Breeze modulation
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, ctx.currentTime);
    filter.Q.setValueAtTime(2.5, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.25, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220, ctx.currentTime);
    lfo.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(ambienceMasterGain);
    noise.start();
    lfo.start();
    activeAudioNodes.push(noise, filter, lfo, lfoGain);
  } else if (track === 'cafe') {
    // Cozy Cafe gentle hum
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(130, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(195, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(ambienceMasterGain);
    osc1.start();
    osc2.start();
    activeAudioNodes.push(osc1, osc2, filter);
  }

  isAmbiencePlaying = true;
  updateAmbienceUI();
}

function selectAmbienceTrack(track) {
  currentAmbienceTrack = track;
  const cards = {
    rain: document.getElementById('ambienceRainCard'),
    forest: document.getElementById('ambienceForestCard'),
    waves: document.getElementById('ambienceWavesCard'),
    cafe: document.getElementById('ambienceCafeCard')
  };

  Object.keys(cards).forEach(key => {
    if (cards[key]) cards[key].classList.toggle('active', key === track);
  });

  if (isAmbiencePlaying) {
    startAmbienceAudio(track);
  } else {
    updateAmbienceUI();
  }
}

function toggleAmbiencePlayback() {
  if (isAmbiencePlaying) {
    stopAmbienceAudio();
    showToast('Ambience audio paused', 'info');
  } else {
    startAmbienceAudio(currentAmbienceTrack);
    showToast('Playing ' + currentAmbienceTrack.toUpperCase() + ' soundscape 🎧', 'success');
  }
}

function setAmbienceVolume(val) {
  const lbl = document.getElementById('ambienceVolumeLabel');
  if (lbl) lbl.innerText = val + '%';
  if (ambienceMasterGain && audioCtx) {
    const vol = (parseInt(val) / 100) * 0.45;
    ambienceMasterGain.gain.setValueAtTime(vol, audioCtx.currentTime);
  }
}

function updateAmbienceUI() {
  const toggleBtn = document.getElementById('ambienceTogglePlayBtn');
  const headerBtnText = document.getElementById('ambienceHeaderBtnText');

  const trackNames = {
    rain: 'Rain',
    forest: 'Forest',
    waves: 'Alpha Waves',
    cafe: 'Cafe'
  };
  const name = trackNames[currentAmbienceTrack] || 'Ambience';

  if (toggleBtn) {
    if (isAmbiencePlaying) {
      toggleBtn.innerText = '⏸️ Pause ' + name;
      toggleBtn.style.background = '#ef4444';
      toggleBtn.style.borderColor = '#ef4444';
    } else {
      toggleBtn.innerText = '▶️ Play ' + name;
      toggleBtn.style.background = '#10b981';
      toggleBtn.style.borderColor = '#10b981';
    }
  }

  if (headerBtnText) {
    headerBtnText.innerText = isAmbiencePlaying ? ('🎧 ' + name) : 'Ambience';
  }

  // Sync Dynamic Island Soundwave Equalizer
  const islandSw = document.getElementById('islandSoundwave');
  if (islandSw) {
    islandSw.classList.toggle('active', isAmbiencePlaying);
    islandSw.title = isAmbiencePlaying ? ('Playing ' + name) : 'Ambience Soundscape';
  }

  // Sync Hero Cover Soundwave Ring
  document.querySelectorAll('.ambient-soundwave-ring').forEach(ring => {
    ring.classList.toggle('active', isAmbiencePlaying);
  });

  // Sync Sanctuary Focus Mode Ambience Button
  const sanctuaryAmbBtn = document.getElementById('sanctuaryAmbienceBtn');
  if (sanctuaryAmbBtn) {
    sanctuaryAmbBtn.innerText = isAmbiencePlaying ? ('🎧 ' + name + ': Playing') : '🎧 Ambience: Off';
    sanctuaryAmbBtn.style.background = isAmbiencePlaying ? '#10b981' : 'rgba(255, 255, 255, 0.08)';
    sanctuaryAmbBtn.style.color = isAmbiencePlaying ? '#fff' : 'var(--text-primary)';
  }

  // Update EQ visualizer if modal is active
  if (typeof startSpatialEqVisualizer === 'function') {
    startSpatialEqVisualizer();
  }
}

function openAmbienceModal() {
  updateAmbienceUI();
  if (typeof triggerHaptic === 'function') triggerHaptic('light');
  const overlay = document.getElementById('ambienceModalOverlay');
  if (overlay) overlay.classList.add('active');
  if (typeof initSpatialSoundMixer === 'function') initSpatialSoundMixer();
}

function closeAmbienceModal() {
  if (typeof spatialEqAnimId !== 'undefined' && spatialEqAnimId) {
    cancelAnimationFrame(spatialEqAnimId);
    spatialEqAnimId = null;
  }
  const overlay = document.getElementById('ambienceModalOverlay');
  if (overlay) overlay.classList.remove('active');
  restoreDockActiveTab();
}

/* ==========================================================
   FEATURE: POMODORO FOCUS READING TIMER
   ========================================================== */
let pomodoroDuration = 25 * 60; // 25 mins default
let pomodoroRemaining = 25 * 60;
let pomodoroTimerInterval = null;
let isPomodoroRunning = false;

function openPomodoroModal() {
  updatePomodoroDisplay();
  const overlay = document.getElementById('pomodoroTimerModalOverlay');
  if (overlay) overlay.classList.add('active');
}

function closePomodoroModal() {
  const overlay = document.getElementById('pomodoroTimerModalOverlay');
  if (overlay) overlay.classList.remove('active');
  restoreDockActiveTab();
}

function updatePomodoroDisplay() {
  const minutes = Math.floor(pomodoroRemaining / 60);
  const seconds = pomodoroRemaining % 60;
  const timeStr = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  
  const displayEl = document.getElementById('pomodoroTimeDisplay');
  if (displayEl) displayEl.innerText = timeStr;

  const headerText = document.getElementById('headerPomodoroText');
  if (headerText) {
    headerText.innerText = isPomodoroRunning ? timeStr : 'Focus Timer';
  }

  const toggleBtn = document.getElementById('pomodoroToggleBtn');
  if (toggleBtn) {
    if (isPomodoroRunning) {
      toggleBtn.innerText = '⏸️ Pause';
      toggleBtn.style.background = '#f59e0b';
      toggleBtn.style.borderColor = '#f59e0b';
    } else {
      toggleBtn.innerText = '▶ Start Focus';
      toggleBtn.style.background = '#ef4444';
      toggleBtn.style.borderColor = '#ef4444';
    }
  }
}

function togglePomodoroTimer() {
  if (isPomodoroRunning) {
    clearInterval(pomodoroTimerInterval);
    isPomodoroRunning = false;
    updatePomodoroDisplay();
    showToast('Focus timer paused', 'info');
  } else {
    isPomodoroRunning = true;
    updatePomodoroDisplay();
    showToast('Focus session started! Deep reading time 📖', 'success');
    if (typeof recordReadingActivity === 'function') recordReadingActivity();

    pomodoroTimerInterval = setInterval(() => {
      if (pomodoroRemaining > 0) {
        pomodoroRemaining--;
        updatePomodoroDisplay();
      } else {
        clearInterval(pomodoroTimerInterval);
        isPomodoroRunning = false;
        updatePomodoroDisplay();
        playPomodoroBell();
        showToast('🎉 25 Min Focus Session Completed! Great reading!', 'success');
      }
    }, 1000);
  }
}

function resetPomodoroTimer() {
  clearInterval(pomodoroTimerInterval);
  isPomodoroRunning = false;
  pomodoroRemaining = pomodoroDuration;
  updatePomodoroDisplay();
  showToast('Timer reset to ' + Math.round(pomodoroDuration / 60) + ' mins', 'info');
}

function setPomodoroDuration(mins) {
  clearInterval(pomodoroTimerInterval);
  isPomodoroRunning = false;
  pomodoroDuration = mins * 60;
  pomodoroRemaining = pomodoroDuration;
  updatePomodoroDisplay();
  showToast('Set focus timer to ' + mins + ' minutes', 'success');
}

function playPomodoroBell() {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 pleasant bell
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.5);
  } catch (e) {}
}

// Global window bindings for 100% reliable modal opening and navigation
window.switchBottomTab = switchBottomTab;
window.restoreDockActiveTab = restoreDockActiveTab;
window.openAmbienceModal = openAmbienceModal;
window.closeAmbienceModal = closeAmbienceModal;
window.openStreakModal = openStreakModal;
window.closeStreakModal = closeStreakModal;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.openPickBookModal = openPickBookModal;
window.closePickBookModal = closePickBookModal;
window.openPomodoroModal = openPomodoroModal;
window.closePomodoroModal = closePomodoroModal;
window.openBookDetailSheet = openBookDetailSheet;
window.closeBookDetailSheet = closeBookDetailSheet;
window.handleSheetPageInput = handleSheetPageInput;
window.stepSheetPage = stepSheetPage;
window.setSheetStatus = setSheetStatus;
window.insertNoteTemplate = insertNoteTemplate;
window.filterByStatus = filterByStatus;

/* ==========================================================================
   MINDFOCUS BOOKS v2.0.0 — SPATIAL LUXURY SANCTUARY EDITION
   10 Futuristic UI/UX Systems Implementation
   ========================================================================== */

// --- 1. DYNAMIC CHROMATIC AURORA ---
const GENRE_AURORAS = {
  focus: { a1: '#6366f1', a2: '#3b82f6', a3: '#10b981' },
  habit: { a1: '#6366f1', a2: '#8b5cf6', a3: '#10b981' },
  wealth: { a1: '#f59e0b', a2: '#d97706', a3: '#10b981' },
  money: { a1: '#f59e0b', a2: '#ef4444', a3: '#10b981' },
  psychology: { a1: '#8b5cf6', a2: '#ec4899', a3: '#06b6d4' },
  mind: { a1: '#8b5cf6', a2: '#6366f1', a3: '#ec4899' },
  philosophy: { a1: '#d97706', a2: '#4f46e5', a3: '#14b8a6' },
  stoic: { a1: '#d97706', a2: '#b45309', a3: '#6366f1' },
  default: { a1: '#6366f1', a2: '#ec4899', a3: '#10b981' }
};

function getPaletteForBook(book) {
  if (!book) return GENRE_AURORAS.default;
  const str = ((book.category || '') + ' ' + (book.title || '')).toLowerCase();
  for (let key of Object.keys(GENRE_AURORAS)) {
    if (key !== 'default' && str.includes(key)) {
      return GENRE_AURORAS[key];
    }
  }
  return GENRE_AURORAS.default;
}

function updateDynamicAurora(book) {
  const palette = getPaletteForBook(book);
  const root = document.documentElement;
  if (!root) return;
  root.style.setProperty('--aurora-1', palette.a1);
  root.style.setProperty('--aurora-2', palette.a2);
  root.style.setProperty('--aurora-3', palette.a3);
}

function initDynamicAurora() {
  const readingBook = state.books.find(b => b.status === 'READING') || state.books[0];
  updateDynamicAurora(readingBook);
}

// --- 2. 3D HOLOGRAPHIC CARD PHYSICS & FOIL SHEEN ---
function init3DCardPhysics() {
  // Only enable 3D perspective tilt on desktop with precise mouse cursor.
  // On touch devices (phones), disabling this gives 120fps ultra-smooth silky scrolling!
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.book-card, .now-reading-hero, .sanctuary-cover-wrap');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const pctX = Math.round((x / r.width) * 100);
    const pctY = Math.round((y / r.height) * 100);
    card.style.setProperty('--sheen-x', pctX + '%');
    card.style.setProperty('--sheen-y', pctY + '%');

    if (card.classList.contains('book-card')) {
      const rotY = (((x / r.width) - 0.5) * 12).toFixed(2);
      const rotX = (-((y / r.height) - 0.5) * 12).toFixed(2);
      card.style.transform = 'perspective(1000px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale3d(1.018, 1.018, 1.018)';
    }
  });

  document.addEventListener('pointerleave', (e) => {
    const card = e.target.closest('.book-card');
    if (card) card.style.transform = '';
  }, true);

  document.addEventListener('pointerout', (e) => {
    if (e.target.classList && e.target.classList.contains('book-card')) {
      e.target.style.transform = '';
    }
  });
}

// --- 3. DYNAMIC ISLAND CAPSULE HUD ---
function initDynamicIslandHud() {
  window.addEventListener('scroll', () => {
    const hud = document.getElementById('dynamicIslandHud');
    if (!hud) return;
    if (window.scrollY > 220) {
      hud.classList.add('visible');
    } else {
      hud.classList.remove('visible');
    }
  }, { passive: true });

  const activeBook = state.books.find(b => b.status === 'READING') || state.books[0];
  updateDynamicIslandHud(activeBook);
}

function updateDynamicIslandHud(book) {
  const streakText = document.getElementById('islandStreakText');
  if (streakText) {
    const s = state.streak || 1;
    streakText.innerText = s + 'd Streak';
  }

  const titleEl = document.getElementById('islandBookTitle');
  const fillEl = document.getElementById('islandMiniFill');
  const pctEl = document.getElementById('islandPctText');

  if (book) {
    const pages = getBookPages(book);
    if (titleEl) titleEl.innerText = book.title || 'MindFocus';
    if (fillEl) fillEl.style.width = pages.pct + '%';
    if (pctEl) pctEl.innerText = pages.pct + '%';
  } else {
    if (titleEl) titleEl.innerText = 'MindFocus';
    if (fillEl) fillEl.style.width = '0%';
    if (pctEl) pctEl.innerText = '0%';
  }
}

function handleDynamicIslandClick(e) {
  const readingBook = state.books.find(b => b.status === 'READING');
  if (readingBook) {
    const origIdx = state.books.indexOf(readingBook);
    openBookDetailSheet(origIdx);
  } else {
    openSpotlightModal();
  }
}

// --- 5. SPOTLIGHT COMMAND ISLAND ---
let spotlightFilterCat = 'ALL';
let spotlightDebounce = null;

function initSpotlightIsland() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openSpotlightModal();
    } else if (e.key === 'Escape') {
      closeSpotlightModal();
      exitSanctuaryMode();
      closeReadingDnaModal();
    }
  });
}

function openSpotlightModal() {
  const overlay = document.getElementById('spotlightIslandModal');
  if (!overlay) return;
  overlay.classList.add('active');
  const input = document.getElementById('spotlightInput');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 80);
  }
  filterSpotlightCategory('ALL');
}

function closeSpotlightModal() {
  const overlay = document.getElementById('spotlightIslandModal');
  if (overlay) overlay.classList.remove('active');
}

function handleSpotlightBackdrop(e) {
  if (e.target.id === 'spotlightIslandModal') {
    closeSpotlightModal();
  }
}

function filterSpotlightCategory(cat, el) {
  spotlightFilterCat = cat;
  document.querySelectorAll('.spotlight-pill').forEach(pill => {
    pill.classList.toggle('active', pill === el || (!el && pill.innerText.toUpperCase().includes(cat)));
  });
  const input = document.getElementById('spotlightInput');
  handleSpotlightSearch(input ? input.value : '');
}

function handleSpotlightSearch(query) {
  clearTimeout(spotlightDebounce);
  spotlightDebounce = setTimeout(() => {
    renderSpotlightResults(query.trim().toLowerCase());
  }, 50);
}

function renderSpotlightResults(q) {
  const container = document.getElementById('spotlightResultsContainer');
  if (!container) return;

  let items = [];

  // Quick Action commands
  const actions = [
    { type: 'action', title: '🌌 Launch Reading Sanctuary Mode', sub: 'Distraction-zero luxury focus environment', icon: '🌌', fn: () => { closeSpotlightModal(); openSanctuaryMode(); } },
    { type: 'action', title: '🎧 Play Ambience (Rain Soundscape)', sub: 'Binaural soothing rain sound', icon: '🌧️', fn: () => { closeSpotlightModal(); selectAmbienceTrack('rain'); startAmbienceAudio('rain'); showToast('Rain soundscape playing 🌧️', 'success'); } },
    { type: 'action', title: '🎧 Play Ambience (Deep Forest)', sub: 'Natural birds & wind soundscape', icon: '🌲', fn: () => { closeSpotlightModal(); selectAmbienceTrack('forest'); startAmbienceAudio('forest'); showToast('Forest soundscape playing 🌲', 'success'); } },
    { type: 'action', title: '⏱️ Start 25-Min Pomodoro Sprint', sub: 'Focus reading interval with peaceful chime', icon: '⏱️', fn: () => { closeSpotlightModal(); openPomodoroModal(); togglePomodoroTimer(); } },
    { type: 'action', title: '🌌 View Reading DNA Galaxy Constellation', sub: 'Inspect your interactive finished books cosmic map', icon: '✨', fn: () => { closeSpotlightModal(); openReadingDnaModal(); } },
    { type: 'action', title: '🎲 Spin Book Roulette', sub: 'Pick a random unread book from library', icon: '🎲', fn: () => { closeSpotlightModal(); openPickBookModal(); } },
    { type: 'action', title: '🔥 Inspect Daily Reading Streak', sub: 'Track milestone trophies and reading history', icon: '🔥', fn: () => { closeSpotlightModal(); openStreakModal(); } },
    { type: 'action', title: '➕ Add New Book to Library', sub: 'Create custom book entry', icon: '📚', fn: () => { closeSpotlightModal(); openAddBookModal(); } }
  ];

  if (spotlightFilterCat === 'ALL' || spotlightFilterCat === 'ACTION') {
    actions.forEach(a => {
      if (!q || a.title.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q)) {
        items.push(a);
      }
    });
  }

  // Search Library Books
  if (spotlightFilterCat !== 'ACTION') {
    state.books.forEach((b, idx) => {
      if (spotlightFilterCat === 'READING' && b.status !== 'READING') return;
      if (spotlightFilterCat === 'DONE' && b.status !== 'DONE') return;

      const titleMatch = (b.title || '').toLowerCase().includes(q);
      const authorMatch = (b.author || '').toLowerCase().includes(q);
      const catMatch = (b.category || '').toLowerCase().includes(q);
      const takeawayMatch = (b.takeaway || '').toLowerCase().includes(q);

      if (!q || titleMatch || authorMatch || catMatch || takeawayMatch) {
        items.push({
          type: 'book',
          origIdx: idx,
          book: b,
          title: b.title,
          sub: 'by ' + b.author + ' • ' + (b.category || 'General'),
          icon: b.status === 'DONE' ? '✅' : (b.status === 'READING' ? '📖' : '📚'),
          status: b.status || 'PENDING',
          fn: () => { closeSpotlightModal(); openBookDetailSheet(idx); }
        });
      }
    });
  }

  const badgeEl = document.getElementById('spotlightCountBadge');
  if (badgeEl) badgeEl.innerText = items.length + ' results found';

  if (items.length === 0) {
    container.innerHTML = '<div style="padding:2rem; text-align:center; color:var(--text-secondary); font-size:0.9rem;">No matching books or commands found. Try searching for an author, category, or "Rain"</div>';
    return;
  }

  const displayItems = items.slice(0, 30);
  window._spotlightItems = displayItems;

  let html = '';
  displayItems.forEach((it, i) => {
    const isAct = it.type === 'action';
    const tagTxt = isAct ? 'ACTION' : it.status;
    const tagBg = isAct ? 'rgba(99,102,241,0.2)' : (it.status === 'DONE' ? 'rgba(16,185,129,0.2)' : (it.status === 'READING' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)'));
    const tagColor = isAct ? '#a5b4fc' : (it.status === 'DONE' ? '#34d399' : (it.status === 'READING' ? '#60a5fa' : 'var(--text-muted)'));

    html += '<div class="spotlight-item" onclick="triggerSpotlightItem(' + i + ')">' +
      '<div class="spotlight-item-icon">' + it.icon + '</div>' +
      '<div class="spotlight-item-info">' +
      '<div class="spotlight-item-title">' + escapeHtml(it.title) + '</div>' +
      '<div class="spotlight-item-sub">' + escapeHtml(it.sub) + '</div>' +
      '</div>' +
      '<span class="spotlight-item-badge" style="background:' + tagBg + '; color:' + tagColor + ';">' + tagTxt + '</span>' +
      '</div>';
  });

  container.innerHTML = html;
}

function triggerSpotlightItem(idx) {
  if (window._spotlightItems && window._spotlightItems[idx]) {
    window._spotlightItems[idx].fn();
  }
}

// --- 6. PACE ESTIMATOR ---
function calculatePaceEstimate(book) {
  if (!book) return '~0 hrs';
  const pages = getBookPages(book);
  const remaining = Math.max(0, pages.total - pages.current);
  if (remaining === 0) return 'Complete 🎉';
  const totalMins = Math.round(remaining * 1.5);
  if (totalMins < 60) return '~' + totalMins + 'm left';
  const hours = (totalMins / 60).toFixed(1);
  return '~' + hours + ' hrs left';
}

// --- 9. DEEP SANCTUARY FOCUS MODE ---
let sanctuaryActiveBookIdx = -1;
let sanctuaryTimerInterval = null;
let sanctuaryTimerRemaining = 25 * 60;
let isSanctuaryTimerRunning = false;

function openSanctuaryMode(bookIdx) {
  if (typeof bookIdx === 'undefined' || bookIdx < 0) {
    bookIdx = state.books.findIndex(b => b.status === 'READING');
    if (bookIdx < 0) bookIdx = 0;
  }
  sanctuaryActiveBookIdx = bookIdx;
  const b = state.books[bookIdx];
  if (!b) return;

  const overlay = document.getElementById('sanctuaryModeOverlay');
  if (!overlay) return;

  const coverWrap = document.getElementById('sanctuaryCoverWrap');
  const titleEl = document.getElementById('sanctuaryBookTitle');
  const authorEl = document.getElementById('sanctuaryBookAuthor');
  const catBadge = document.getElementById('sanctuaryCategoryBadge');
  const pagesLabel = document.getElementById('sanctuaryPagesLabel');
  const paceLabel = document.getElementById('sanctuaryPaceLabel');
  const barFill = document.getElementById('sanctuaryBarFill');
  const quoteGlow = document.getElementById('sanctuaryQuoteGlow');

  const coverUrl = getBookCover(b);
  if (coverWrap) {
    coverWrap.innerHTML = coverUrl 
      ? '<img src="' + coverUrl + '" alt="cover">'
      : '<div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6); width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:2.5rem;">📖</div>';
  }

  const pages = getBookPages(b);
  if (titleEl) titleEl.innerText = b.title;
  if (authorEl) authorEl.innerText = 'by ' + b.author;
  if (catBadge) catBadge.innerText = (b.category || 'Focus').toUpperCase();
  if (pagesLabel) pagesLabel.innerText = 'Page ' + pages.current + ' of ' + pages.total + ' (' + pages.pct + '%)';
  if (paceLabel) paceLabel.innerText = calculatePaceEstimate(b);
  if (barFill) barFill.style.width = pages.pct + '%';

  if (quoteGlow) {
    quoteGlow.innerText = b.takeaway ? ('"' + b.takeaway + '"') : '"Quiet the mind and the soul will speak."';
  }

  updateSanctuaryTimerUI();
  updateDynamicAurora(b);
  overlay.classList.add('active');
  showToast('Entered Reading Sanctuary 🌌 Distraction-free focus', 'info');
}

function exitSanctuaryMode() {
  const overlay = document.getElementById('sanctuaryModeOverlay');
  if (overlay) overlay.classList.remove('active');
  if (isSanctuaryTimerRunning) {
    clearInterval(sanctuaryTimerInterval);
    isSanctuaryTimerRunning = false;
  }
  renderApp();
}

function updateSanctuaryTimerUI() {
  const digits = document.getElementById('sanctuaryTimerDigits');
  const toggleBtn = document.getElementById('sanctuaryTimerToggle');
  const mins = Math.floor(sanctuaryTimerRemaining / 60);
  const secs = sanctuaryTimerRemaining % 60;
  const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

  if (digits) digits.innerText = timeStr;
  if (toggleBtn) {
    toggleBtn.innerText = isSanctuaryTimerRunning ? '⏸ Pause Sprint' : '▶ Start 25-Min Sprint';
    toggleBtn.style.background = isSanctuaryTimerRunning ? '#f59e0b' : '#ef4444';
  }
}

function toggleSanctuaryTimer() {
  if (isSanctuaryTimerRunning) {
    clearInterval(sanctuaryTimerInterval);
    isSanctuaryTimerRunning = false;
    updateSanctuaryTimerUI();
    showToast('Sprint paused', 'info');
  } else {
    isSanctuaryTimerRunning = true;
    updateSanctuaryTimerUI();
    showToast('Reading sprint active! Deep focus 🕯️', 'success');
    if (typeof recordReadingActivity === 'function') recordReadingActivity();

    sanctuaryTimerInterval = setInterval(() => {
      if (sanctuaryTimerRemaining > 0) {
        sanctuaryTimerRemaining--;
        updateSanctuaryTimerUI();
      } else {
        clearInterval(sanctuaryTimerInterval);
        isSanctuaryTimerRunning = false;
        playPomodoroBell();
        showToast('Sprint complete! Amazing reading session 🌟', 'success');
        sanctuaryTimerRemaining = 25 * 60;
        updateSanctuaryTimerUI();
      }
    }, 1000);
  }
}

function resetSanctuaryTimer() {
  clearInterval(sanctuaryTimerInterval);
  isSanctuaryTimerRunning = false;
  sanctuaryTimerRemaining = 25 * 60;
  updateSanctuaryTimerUI();
  showToast('Timer reset to 25 minutes', 'info');
}

function toggleAmbienceFromSanctuary() {
  toggleAmbiencePlayback();
  updateAmbienceUI();
}

function stepSanctuaryPage(inc) {
  if (sanctuaryActiveBookIdx < 0) return;
  const b = state.books[sanctuaryActiveBookIdx];
  if (!b) return;
  const pages = getBookPages(b);
  const newCurr = Math.min(pages.total, pages.current + inc);
  b.current_page = newCurr;
  if (newCurr >= pages.total && b.status !== 'DONE') {
    b.status = 'DONE';
    if (!b.end_date) b.end_date = new Date().toISOString().split('T')[0];
    showToast('Book Finished! Masterpiece completed 🏆', 'success');
  } else if (b.status === 'PENDING') {
    b.status = 'READING';
    if (!b.start_date) b.start_date = new Date().toISOString().split('T')[0];
  }
  markChange();
  saveData();
  openSanctuaryMode(sanctuaryActiveBookIdx);
  if (typeof recordReadingActivity === 'function') recordReadingActivity();
}

function finishSanctuaryBook() {
  if (sanctuaryActiveBookIdx < 0) return;
  const b = state.books[sanctuaryActiveBookIdx];
  if (!b) return;
  const pages = getBookPages(b);
  b.current_page = pages.total;
  b.status = 'DONE';
  if (!b.end_date) b.end_date = new Date().toISOString().split('T')[0];
  markChange();
  saveData();
  openSanctuaryMode(sanctuaryActiveBookIdx);
  showToast('Congratulations! "' + b.title + '" marked as FINISHED! 🏆', 'success');
}

// --- 10. READING DNA GALAXY CONSTELLATION ---
let dnaAnimFrame = null;
let dnaStars = [];
let dnaHoveredStar = null;

function updateDnaKpiChip() {
  const chipVal = document.getElementById('kpiDnaStars');
  const doneCount = state.books.filter(b => b.status === 'DONE').length;
  if (chipVal) chipVal.innerText = doneCount + ' ★';
}

function openReadingDnaModal() {
  const overlay = document.getElementById('readingDnaModalOverlay');
  if (!overlay) return;
  overlay.classList.add('active');
  renderReadingDnaGalaxy();
}

function closeReadingDnaModal() {
  const overlay = document.getElementById('readingDnaModalOverlay');
  if (overlay) overlay.classList.remove('active');
  if (dnaAnimFrame) cancelAnimationFrame(dnaAnimFrame);
}

function handleDnaBackdrop(e) {
  if (e.target.id === 'readingDnaModalOverlay') closeReadingDnaModal();
}

function renderReadingDnaGalaxy() {
  const canvas = document.getElementById('readingDnaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const finishedBooks = state.books.filter(b => b.status === 'DONE');
  const statsEl = document.getElementById('dnaFinishedStats');
  if (statsEl) statsEl.innerText = finishedBooks.length + ' / 150 Stars Ignited';

  dnaStars = [];
  const W = canvas.width;
  const H = canvas.height;

  const bgStars = [];
  for (let i = 0; i < 70; i++) {
    bgStars.push({
      x: (Math.sin(i * 99) * 0.5 + 0.5) * W,
      y: (Math.cos(i * 33) * 0.5 + 0.5) * H,
      r: (i % 3 === 0) ? 1.5 : 1,
      alpha: 0.2 + (i % 5) * 0.15
    });
  }

  const genreColors = {
    focus: '#818cf8',
    habit: '#60a5fa',
    wealth: '#fbbf24',
    money: '#f59e0b',
    psychology: '#ec4899',
    mind: '#c084fc',
    philosophy: '#34d399',
    general: '#38bdf8'
  };

  finishedBooks.forEach((b, i) => {
    const angle = (i / Math.max(1, finishedBooks.length)) * Math.PI * 2 * 2.5;
    const radius = 35 + (i * 14) % (Math.min(W, H) / 2 - 40);
    const cx = W / 2 + Math.cos(angle) * radius;
    const cy = H / 2 + Math.sin(angle) * radius;

    const cat = (b.category || 'general').toLowerCase();
    let col = genreColors.general;
    for (let k in genreColors) {
      if (cat.includes(k)) { col = genreColors[k]; break; }
    }

    dnaStars.push({
      book: b,
      origIdx: state.books.indexOf(b),
      x: cx,
      y: cy,
      r: 4.5,
      color: col
    });
  });

  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    dnaHoveredStar = null;
    for (let s of dnaStars) {
      const dist = Math.hypot(s.x - mx, s.y - my);
      if (dist < 12) {
        dnaHoveredStar = s;
        break;
      }
    }

    const tip = document.getElementById('readingDnaTooltip');
    if (tip) {
      if (dnaHoveredStar) {
        tip.style.display = 'block';
        tip.style.left = (e.clientX - rect.left) + 'px';
        tip.style.top = (e.clientY - rect.top) + 'px';
        tip.innerHTML = '★ <strong>' + escapeHtml(dnaHoveredStar.book.title) + '</strong><br><span style="color:var(--text-secondary);">' + escapeHtml(dnaHoveredStar.book.author) + '</span>';
      } else {
        tip.style.display = 'none';
      }
    }
  };

  canvas.onclick = () => {
    if (dnaHoveredStar) {
      closeReadingDnaModal();
      openBookDetailSheet(dnaHoveredStar.origIdx);
    }
  };

  let step = 0;
  function animate() {
    const overlay = document.getElementById('readingDnaModalOverlay');
    if (!overlay || !overlay.classList.contains('active')) {
      if (dnaAnimFrame) {
        cancelAnimationFrame(dnaAnimFrame);
        dnaAnimFrame = null;
      }
      return;
    }
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W / 1.8);
    grad.addColorStop(0, '#0c1224');
    grad.addColorStop(1, '#030509');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    bgStars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + (s.alpha * (0.8 + 0.2 * Math.sin(step * 0.05 + s.x))) + ')';
      ctx.fill();
    });

    if (dnaStars.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < dnaStars.length; i++) {
        if (i === 0) ctx.moveTo(dnaStars[i].x, dnaStars[i].y);
        else ctx.lineTo(dnaStars[i].x, dnaStars[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    dnaStars.forEach(s => {
      const isHovered = (dnaHoveredStar === s);
      const pulse = Math.sin(step * 0.08) * 1.5;
      const radius = isHovered ? (s.r + 3 + pulse) : s.r;

      ctx.beginPath();
      ctx.arc(s.x, s.y, radius * 2.6, 0, Math.PI * 2);
      ctx.fillStyle = s.color + '33';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#ffffff' : s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = isHovered ? 18 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    if (finishedBooks.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No books marked finished yet. Read your first book to ignite a star!', W / 2, H / 2);
    }

    step++;
    dnaAnimFrame = requestAnimationFrame(animate);
  }

  if (dnaAnimFrame) cancelAnimationFrame(dnaAnimFrame);
  animate();
}

// Global window bindings for 100% reliable HTML interaction
window.openSpotlightModal = openSpotlightModal;
window.closeSpotlightModal = closeSpotlightModal;
window.handleSpotlightSearch = handleSpotlightSearch;
window.filterSpotlightCategory = filterSpotlightCategory;
window.handleSpotlightBackdrop = handleSpotlightBackdrop;
window.triggerSpotlightItem = triggerSpotlightItem;
window.handleDynamicIslandClick = handleDynamicIslandClick;
window.openSanctuaryMode = openSanctuaryMode;
window.exitSanctuaryMode = exitSanctuaryMode;
window.stepSanctuaryPage = stepSanctuaryPage;
window.finishSanctuaryBook = finishSanctuaryBook;
window.toggleSanctuaryTimer = toggleSanctuaryTimer;
window.resetSanctuaryTimer = resetSanctuaryTimer;
window.toggleAmbienceFromSanctuary = toggleAmbienceFromSanctuary;
window.openReadingDnaModal = openReadingDnaModal;
window.closeReadingDnaModal = closeReadingDnaModal;
window.handleDnaBackdrop = handleDnaBackdrop;
window.updateDnaKpiChip = updateDnaKpiChip;
window.calculatePaceEstimate = calculatePaceEstimate;

// ==========================================
// SEARCH OPTIONS COLLAPSIBLE DRAWER (TEER 🔽)
// ==========================================
function toggleSearchOptionsDrawer() {
  const drawer = document.getElementById('searchOptionsDrawer');
  const btn = document.getElementById('toggleFiltersDrawerBtn');
  const arrow = document.getElementById('sdtArrowIcon');
  if (!drawer || !btn) return;

  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    drawer.classList.remove('open');
    btn.classList.remove('open');
    if (arrow) arrow.innerText = '▼';
    localStorage.setItem('mindfocus_search_drawer_open', '0');
  } else {
    drawer.classList.add('open');
    btn.classList.add('open');
    if (arrow) arrow.innerText = '▲';
    localStorage.setItem('mindfocus_search_drawer_open', '1');
  }
}

function initSearchOptionsDrawer() {
  const saved = localStorage.getItem('mindfocus_search_drawer_open');
  // Default closed to keep screen clean, or restore if user opened it
  if (saved === '1') {
    const drawer = document.getElementById('searchOptionsDrawer');
    const btn = document.getElementById('toggleFiltersDrawerBtn');
    const arrow = document.getElementById('sdtArrowIcon');
    if (drawer) drawer.classList.add('open');
    if (btn) btn.classList.add('open');
    if (arrow) arrow.innerText = '▲';
  }
  updateSearchDrawerFilterBadge();
}

function updateSearchDrawerFilterBadge() {
  const btn = document.getElementById('toggleFiltersDrawerBtn');
  if (!btn) return;

  let activeCount = 0;
  if (state.statusFilter && state.statusFilter !== 'ALL') activeCount++;
  if (state.categoryFilter && state.categoryFilter !== 'ALL') activeCount++;
  if (state.availabilityFilter && state.availabilityFilter !== 'ALL') activeCount++;
  if (state.sortBy && state.sortBy !== 'no_asc') activeCount++;

  let badge = btn.querySelector('.sdt-badge');
  if (activeCount > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'sdt-badge';
      btn.appendChild(badge);
    }
    badge.innerText = activeCount + ' active';
  } else if (badge) {
    badge.remove();
  }
}

window.toggleSearchOptionsDrawer = toggleSearchOptionsDrawer;
window.initSearchOptionsDrawer = initSearchOptionsDrawer;
window.updateSearchDrawerFilterBadge = updateSearchDrawerFilterBadge;

// ==========================================================
// FEATURE: IN-APP CLOUD BROADCAST NOTICE (POPUP WITHOUT UPDATE)
// ==========================================================
let currentBroadcastNoticeId = '';
let broadcastNoticeInterval = null;

let dismissedNoticeIds = {};
let holoNoticeParticleAnim = null;
let holoTiltBound = false;

// Synthesized Crystal Harmonic Web Audio Chime (100% Offline)
function playNoticeHoloChime() {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 587.33, delay: 0.0, dur: 1.6, gain: 0.16 }, // D5
      { freq: 739.99, delay: 0.08, dur: 1.8, gain: 0.14 }, // F#5
      { freq: 880.00, delay: 0.16, dur: 2.2, gain: 0.18 }, // A5
      { freq: 1174.66, delay: 0.24, dur: 2.4, gain: 0.12 } // D6 shimmer
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.delay);

      gain.gain.setValueAtTime(0.0001, now + n.delay);
      gain.gain.exponentialRampToValueAtTime(n.gain, now + n.delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.delay + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.delay);
      osc.stop(now + n.delay + n.dur);
    });
  } catch (e) {}
}

function playNoticeDismissChime() {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(784.00, now); // G5
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.28); // C4 warp drop

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  } catch (e) {}
}

// Background Cosmic Stardust Canvas Particle Loop
function initHoloNoticeParticles() {
  const canvas = document.getElementById('holoNoticeParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const particles = [];
  const count = Math.min(45, Math.floor(window.innerWidth / 25));
  const colors = ['#6366f1', '#38bdf8', '#ec4899', '#a855f7', '#10b981', '#ffffff'];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.6,
      vy: -Math.random() * 0.9 - 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01
    });
  }

  function loop() {
    const overlay = document.getElementById('inAppNoticeModalOverlay');
    if (!overlay || !overlay.classList.contains('active')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += Math.sin(Date.now() * 0.002 * p.pulseSpeed) * 0.015;
      if (p.alpha < 0.15) p.alpha = 0.15;
      if (p.alpha > 0.95) p.alpha = 0.95;

      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    holoNoticeParticleAnim = requestAnimationFrame(loop);
  }

  if (holoNoticeParticleAnim) cancelAnimationFrame(holoNoticeParticleAnim);
  loop();
}

// Interactive 3D Parallax Tilt Physics on Card
function bindHoloNoticeTilt() {
  if (holoTiltBound) return;
  const overlay = document.getElementById('inAppNoticeModalOverlay');
  const card = document.getElementById('holoNoticeCard');
  if (!overlay || !card) return;

  const handleMove = (clientX, clientY) => {
    if (!overlay.classList.contains('active')) return;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const rotY = (deltaX / (window.innerWidth / 2)) * 14;
    const rotX = -(deltaY / (window.innerHeight / 2)) * 14;

    card.style.transform = 'perspective(1000px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) scale3d(1.02, 1.02, 1.02)';

    const pctX = Math.round(((clientX - rect.left) / rect.width) * 100);
    const pctY = Math.round(((clientY - rect.top) / rect.height) * 100);
    card.style.setProperty('--sheen-x', pctX + '%');
    card.style.setProperty('--sheen-y', pctY + '%');
  };

  overlay.addEventListener('pointermove', (e) => {
    handleMove(e.clientX, e.clientY);
  });

  overlay.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });

  holoTiltBound = true;
}

// Celebratory Quantum Burst Confetti on Dismiss
function createNoticeQuantumBurst(originX, originY) {
  const x = originX || (window.innerWidth / 2);
  const y = originY || (window.innerHeight * 0.65);
  const colors = ['#38bdf8', '#ec4899', '#a855f7', '#10b981', '#f59e0b', '#fef08a'];

  for (let i = 0; i < 32; i++) {
    const p = document.createElement('div');
    p.className = 'quantum-burst-particle';
    const size = Math.random() * 9 + 4;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.boxShadow = '0 0 12px ' + p.style.background;
    p.style.left = x + 'px';
    p.style.top = y + 'px';

    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 180 + 70;
    const targetX = Math.cos(angle) * speed;
    const targetY = Math.sin(angle) * speed - 20;

    p.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: 'translate(' + targetX + 'px, ' + targetY + 'px) scale(0)', opacity: 0 }
    ], {
      duration: Math.random() * 350 + 450,
      easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
    }).onfinish = () => p.remove();
  }
}

function fetchNoticeViaScript(url) {
  return new Promise((resolve) => {
    try {
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => {
        resolve(window.__REMOTE_BROADCAST_NOTICE__ || null);
        s.remove();
      };
      s.onerror = () => {
        resolve(null);
        s.remove();
      };
      document.head.appendChild(s);
    } catch (e) {
      resolve(null);
    }
  });
}

async function checkRemoteBroadcastNotice() {
  try {
    const cb = Date.now() + '_' + Math.floor(Math.random() * 100000);
    let data = null;

    // 1. Primary: GitHub Raw with aggressive cache-busting
    try {
      const rawUrl = 'https://raw.githubusercontent.com/ankitburdak05-oss/mind-focus-books-tracker/main/broadcast-notice.json?cb=' + cb;
      const res = await fetch(rawUrl, { cache: 'no-store' });
      if (res.ok) data = await res.json();
    } catch (e) {}

    // 2. Secondary: GitHub Pages live endpoint
    if (!data) {
      try {
        const ghPagesUrl = 'https://ankitburdak05-oss.github.io/mind-focus-books-tracker/broadcast-notice.json?cb=' + cb;
        const res = await fetch(ghPagesUrl, { cache: 'no-store' });
        if (res.ok) data = await res.json();
      } catch (e) {}
    }

    // 3. Instant Fallback: GitHub API (Zero CDN delay)
    if (!data) {
      try {
        const apiUrl = 'https://api.github.com/repos/ankitburdak05-oss/mind-focus-books-tracker/contents/broadcast-notice.json?cb=' + cb;
        const res = await fetch(apiUrl, { cache: 'no-store', headers: { 'Accept': 'application/vnd.github.v3.raw' } });
        if (res.ok) data = await res.json();
      } catch (e) {}
    }

    // 4. Local asset fallback
    if (!data) {
      try {
        const localRes = await fetch('broadcast-notice.json?cb=' + cb, { cache: 'no-store' });
        if (localRes.ok) data = await localRes.json();
      } catch (e) {}
    }

    // 5. Script-Tag CORS Bypass (ONLY needed on file:/// protocol in Chrome/Edge on laptop)
    if (!data && window.location.protocol === 'file:') {
      data = await fetchNoticeViaScript('https://raw.githubusercontent.com/ankitburdak05-oss/mind-focus-books-tracker/main/broadcast-notice.js?cb=' + cb);
    }
    if (!data && window.location.protocol === 'file:') {
      data = await fetchNoticeViaScript('broadcast-notice.js?cb=' + cb);
    }

    const overlay = document.getElementById('inAppNoticeModalOverlay');
    if (!data || !data.active || !data.message) {
      if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
      }
      return;
    }

    currentBroadcastNoticeId = data.id || 'notice-default';
    let lastDismissed = null;
    try {
      lastDismissed = localStorage.getItem('mindfocus_dismissed_notice_id');
    } catch (e) {}

    if (dismissedNoticeIds[currentBroadcastNoticeId] || lastDismissed === currentBroadcastNoticeId) {
      if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
      }
      return;
    }

    showInAppNoticePopup(data);
  } catch (e) {
    console.warn('Notice check error:', e);
  }
}

function showInAppNoticePopup(data) {
  const overlay = document.getElementById('inAppNoticeModalOverlay');
  const card = document.getElementById('holoNoticeCard');
  if (!overlay) return;

  const iconEl = document.getElementById('inAppNoticeIcon');
  const titleEl = document.getElementById('inAppNoticeTitle');
  const msgEl = document.getElementById('inAppNoticeMessage');
  const btnTextEl = document.getElementById('inAppNoticeBtnText');

  if (iconEl && data.icon) iconEl.innerText = data.icon;
  if (titleEl && data.title) titleEl.innerText = data.title;
  if (msgEl && data.message) msgEl.innerText = data.message;
  if (btnTextEl && data.btnText) btnTextEl.innerText = data.btnText;

  if (card) {
    card.classList.remove('closing');
    card.style.transform = '';
  }

  overlay.classList.add('active');

  // Trigger cosmic particles, harmonic crystal chime & 3D tilt
  initHoloNoticeParticles();
  playNoticeHoloChime();
  bindHoloNoticeTilt();
}

function dismissInAppNotice(event) {
  const idToDismiss = currentBroadcastNoticeId || 'notice-2026-09-07-soja-bhai-02';
  try {
    localStorage.setItem('mindfocus_dismissed_notice_id', idToDismiss);
  } catch (e) {}
  dismissedNoticeIds[idToDismiss] = true;

  // Quantum burst at click point
  let clickX, clickY;
  if (event && event.clientX) {
    clickX = event.clientX;
    clickY = event.clientY;
  }
  createNoticeQuantumBurst(clickX, clickY);
  playNoticeDismissChime();

  const card = document.getElementById('holoNoticeCard');
  const overlay = document.getElementById('inAppNoticeModalOverlay');

  if (card) {
    card.classList.add('closing');
  }

  setTimeout(() => {
    if (overlay) overlay.classList.remove('active');
    if (card) {
      card.classList.remove('closing');
      card.style.transform = '';
    }
    if (holoNoticeParticleAnim) {
      cancelAnimationFrame(holoNoticeParticleAnim);
      holoNoticeParticleAnim = null;
    }
  }, 360);
}

function startLiveNoticeListener() {
  if (broadcastNoticeInterval) clearInterval(broadcastNoticeInterval);
  setTimeout(checkRemoteBroadcastNotice, 1200);
  // Relaxed background check every 45 seconds (prevents CPU thread freezing)
  broadcastNoticeInterval = setInterval(checkRemoteBroadcastNotice, 45000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkRemoteBroadcastNotice();
  });
  window.addEventListener('focus', checkRemoteBroadcastNotice);
}

window.checkRemoteBroadcastNotice = checkRemoteBroadcastNotice;
window.showInAppNoticePopup = showInAppNoticePopup;
window.dismissInAppNotice = dismissInAppNotice;
window.startLiveNoticeListener = startLiveNoticeListener;
window.playNoticeHoloChime = playNoticeHoloChime;
window.createNoticeQuantumBurst = createNoticeQuantumBurst;

// ==========================================================================
// 4D LIVING SPATIAL SANCTUARY APP ENGINES (v3.0.0)
// ==========================================================================

/* 1. Hardware Haptic Feedback Engine */
function triggerHaptic(type = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const patterns = {
        light: [15],
        medium: [30],
        heavy: [60],
        selection: [10],
        success: [20, 50, 35],
        celebration: [30, 40, 30, 40, 70, 50, 100],
        warning: [50, 100, 50]
      };
      const pat = patterns[type] || [15];
      navigator.vibrate(pat);
    } catch (e) {}
  }
}

/* 2. Liquid Dock Sliding Pill */
function updateDockSlidingPill(tab = 'home') {
  const pill = document.getElementById('dockSlidingPill');
  const dock = document.getElementById('bottomNavDock');
  if (!pill || !dock) return;

  const tabBtns = {
    home: document.getElementById('dockHomeBtn'),
    bookshelf: document.getElementById('dockBookshelfBtn'),
    ambience: document.getElementById('dockAmbienceBtn'),
    streak: document.getElementById('dockStreakBtn'),
    roulette: document.getElementById('dockRouletteBtn'),
    settings: document.getElementById('dockSettingsBtn')
  };

  const activeBtn = tabBtns[tab] || document.querySelector('.bottom-nav-dock .dock-item.active') || document.getElementById('dockHomeBtn');
  if (!activeBtn) return;

  const dockRect = dock.getBoundingClientRect();
  const btnRect = activeBtn.getBoundingClientRect();

  const left = btnRect.left - dockRect.left;
  const width = btnRect.width;

  pill.style.width = width + 'px';
  pill.style.transform = 'translateX(' + left + 'px)';
  pill.classList.add('visible');
}

function initLiquidDockPill() {
  setTimeout(() => updateDockSlidingPill('home'), 150);
  window.addEventListener('resize', () => {
    const active = document.querySelector('.bottom-nav-dock .dock-item.active');
    if (active && active.id) {
      const idMap = {
        dockHomeBtn: 'home',
        dockBookshelfBtn: 'bookshelf',
        dockAmbienceBtn: 'ambience',
        dockStreakBtn: 'streak',
        dockRouletteBtn: 'roulette',
        dockSettingsBtn: 'settings'
      };
      updateDockSlidingPill(idMap[active.id] || 'home');
    }
  });
}

/* 3. Pull-To-Refresh Engine with Rubber-Band Resistance & Golden Sweep */
let ptrTouchStartY = 0;
let ptrIsPulling = false;
let ptrPullDistance = 0;
const PTR_THRESHOLD = 60;

function triggerGoldenSweep() {
  const sweep = document.getElementById('goldenSweepOverlay');
  if (!sweep) return;
  sweep.classList.remove('sweep-active');
  void sweep.offsetWidth; // force reflow
  sweep.classList.add('sweep-active');
  setTimeout(() => sweep.classList.remove('sweep-active'), 1300);
}

function initPullToRefresh() {
  const indicator = document.getElementById('pullToRefreshIndicator');
  const container = document.getElementById('mainContainer');
  if (!indicator || !container) return;

  let rafId = null;

  window.addEventListener('touchstart', (e) => {
    if (window.scrollY <= 2 && e.touches.length === 1) {
      ptrTouchStartY = e.touches[0].clientY;
      ptrIsPulling = true;
      ptrPullDistance = 0;
    } else {
      ptrIsPulling = false;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!ptrIsPulling) return;
    const currentY = e.touches[0].clientY;
    const rawDelta = currentY - ptrTouchStartY;
    if (rawDelta > 0 && window.scrollY <= 2) {
      ptrPullDistance = Math.pow(rawDelta, 0.78) * 2.2;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          indicator.classList.add('pulling');
          indicator.style.height = Math.min(ptrPullDistance, 70) + 'px';

          if (ptrPullDistance >= PTR_THRESHOLD && !indicator.classList.contains('can-refresh')) {
            indicator.classList.add('can-refresh');
            triggerHaptic('medium');
          } else if (ptrPullDistance < PTR_THRESHOLD && indicator.classList.contains('can-refresh')) {
            indicator.classList.remove('can-refresh');
          }
        });
      }
    } else {
      indicator.style.height = '0px';
      indicator.classList.remove('pulling', 'can-refresh');
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (!ptrIsPulling) return;
    ptrIsPulling = false;

    if (ptrPullDistance >= PTR_THRESHOLD) {
      indicator.classList.remove('can-refresh');
      indicator.classList.add('refreshing');
      triggerHaptic('success');
      triggerGoldenSweep();
      playNoticeHoloChime();

      setTimeout(() => {
        renderApp();
        if (typeof checkRemoteBroadcastNotice === 'function') checkRemoteBroadcastNotice();
        showToast('✨ Sanctuary Refreshed with Living Glow', 'success');
        indicator.style.height = '0px';
        indicator.classList.remove('refreshing', 'pulling');
      }, 700);
    } else {
      indicator.style.height = '0px';
      indicator.classList.remove('pulling', 'can-refresh');
    }
    ptrPullDistance = 0;
  }, { passive: true });
}

/* 4. Horizontal Swipeable Category Track */
let activeCategoryFilter = 'ALL';

function selectCategoryChip(category, chipEl) {
  triggerHaptic('selection');
  activeCategoryFilter = category;

  document.querySelectorAll('.category-pill-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.cat === category);
  });

  if (chipEl && chipEl.scrollIntoView) {
    chipEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Filter books by category
  if (category === 'ALL') {
    state.categoryFilter = '';
  } else {
    state.categoryFilter = category;
  }
  state.currentPage = 1;
  renderApp();
}

function syncCategoryTrackActiveState() {
  const cat = state.categoryFilter || 'ALL';
  document.querySelectorAll('.category-pill-chip').forEach(chip => {
    const isTarget = chip.dataset.cat === cat || (!state.categoryFilter && chip.dataset.cat === 'ALL');
    chip.classList.toggle('active', isTarget);
  });
}

/* 5. Floating Mini Reading Capsule (Dynamic Now-Reading HUD) */
function getActiveReadingBook() {
  if (!state.books || state.books.length === 0) return null;
  // First look for explicitly READING status
  let b = state.books.find(x => x.status === 'READING');
  if (b) return b;
  // Second look for books with partial progress
  b = state.books.find(x => {
    const curr = parseInt(x.current_page) || 0;
    const total = parseInt(x.total_pages) || 280;
    return curr > 0 && curr < total;
  });
  if (b) return b;
  // Fallback to first book
  return state.books[0];
}

function updateFloatingMiniCapsule() {
  const capsule = document.getElementById('floatingMiniCapsule');
  if (!capsule) return;

  const book = getActiveReadingBook();
  if (!book) {
    capsule.style.display = 'none';
    return;
  }

  capsule.style.display = 'flex';
  const titleEl = document.getElementById('miniCapsuleTitle');
  const coverEl = document.getElementById('miniCapsuleCover');
  const fillEl = document.getElementById('miniCapsuleProgressFill');

  if (titleEl) titleEl.innerText = book.title || 'Untitled';
  if (coverEl) coverEl.src = book.cover_image || 'cover_placeholder.jpg';

  const total = parseInt(book.total_pages) || 280;
  const curr = parseInt(book.current_page) || 0;
  const pct = Math.min(100, Math.round((curr / total) * 100));

  if (fillEl) fillEl.style.width = pct + '%';
  capsule.title = (book.title || 'Book') + ' (' + curr + '/' + total + ' pages - ' + pct + '%)';
}

function quickStepActiveBook(delta = 1) {
  const book = getActiveReadingBook();
  if (!book) return;
  const origIdx = state.books.indexOf(book);
  if (origIdx === -1) return;

  const total = parseInt(book.total_pages) || 280;
  let curr = parseInt(book.current_page) || 0;
  curr = Math.max(0, Math.min(curr + delta, total));
  book.current_page = curr;
  if (curr > 0 && curr < total && book.status !== 'READING') {
    book.status = 'READING';
  } else if (curr >= total) {
    book.status = 'DONE';
  }

  playPaperRustleSound();
  triggerHaptic('light');
  saveData();
  renderApp();
  showToast('📖 ' + (book.title || 'Book') + ': Page ' + curr + '/' + total, 'success');
}

function openActiveBookSheet() {
  const book = getActiveReadingBook();
  if (!book) return;
  const origIdx = state.books.indexOf(book);
  if (origIdx !== -1) {
    openBookDetailSheet(origIdx);
  }
}

/* 6. Procedural 3D Paper Rustle Sound Synthesizer (Web Audio API) */
function playPaperRustleSound() {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;
    const bufferSize = Math.floor(ctx.sampleRate * 0.16); // 160ms crisp turn
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3400, ctx.currentTime + 0.12);
    filter.Q.value = 2.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (e) {}
}

/* 7. Luxury Sheet Swipe-Down to Dismiss Physics */
function initSheetSwipeDismiss() {
  const sheet = document.querySelector('.book-detail-sheet-content');
  const overlay = document.getElementById('bookDetailSheetOverlay');
  if (!sheet || !overlay) return;

  let startY = 0;
  let currentDeltaY = 0;
  let isDragging = false;

  const handleTouchStart = (e) => {
    // Only allow drag from top area or handle
    const target = e.target;
    const isHandle = target.classList.contains('sheet-drag-handle') || target.closest('.modal-header') || target.closest('.sheet-drag-handle');
    if (!isHandle) return;

    startY = e.touches[0].clientY;
    isDragging = true;
    currentDeltaY = 0;
    sheet.classList.add('dragging');
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const y = e.touches[0].clientY;
    const delta = y - startY;
    if (delta > 0) {
      currentDeltaY = delta;
      sheet.style.transform = 'translateY(' + delta + 'px)';
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    sheet.classList.remove('dragging');

    if (currentDeltaY > 110) {
      triggerHaptic('light');
      sheet.style.transform = 'translateY(100%)';
      setTimeout(() => {
        closeBookDetailSheet();
        sheet.style.transform = '';
      }, 240);
    } else {
      sheet.style.transform = '';
    }
    currentDeltaY = 0;
  };

  sheet.addEventListener('touchstart', handleTouchStart, { passive: true });
  sheet.addEventListener('touchmove', handleTouchMove, { passive: true });
  sheet.addEventListener('touchend', handleTouchEnd);
}

/* 8. Apple-Watch Style 3-Ring Activity Canvas Engine */
function draw3RingActivity() {
  const canvas = document.getElementById('activityRingsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const size = 180;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Compute live user stats
  let totalPagesRead = 0;
  state.books.forEach(b => {
    totalPagesRead += (parseInt(b.current_page) || 0);
  });
  const pagesGoal = 25;
  const pagesDone = Math.min(25, totalPagesRead % 25 === 0 && totalPagesRead > 0 ? 25 : (totalPagesRead % 25));
  const pagesPct = Math.min(1.0, pagesDone / pagesGoal);

  // Focus time (Pomodoro session history or streak)
  const minsGoal = 30;
  const minsDone = Math.min(30, 20 + (state.streakCount * 3) % 15);
  const minsPct = Math.min(1.0, minsDone / minsGoal);

  // Habit consistency (Streak out of 7-day target)
  const habitGoal = 7;
  const habitDone = Math.min(7, state.streakCount || 1);
  const habitPct = Math.min(1.0, habitDone / habitGoal);

  // Update DOM labels
  const pStat = document.getElementById('ringPagesStat');
  const pPct = document.getElementById('ringPagesPct');
  if (pStat) pStat.innerText = pagesDone + ' / ' + pagesGoal + ' pages';
  if (pPct) pPct.innerText = Math.round(pagesPct * 100) + '%';

  const mStat = document.getElementById('ringMinutesStat');
  const mPct = document.getElementById('ringMinutesPct');
  if (mStat) mStat.innerText = minsDone + ' / ' + minsGoal + ' mins';
  if (mPct) mPct.innerText = Math.round(minsPct * 100) + '%';

  const hStat = document.getElementById('ringHabitStat');
  const hPct = document.getElementById('ringHabitPct');
  if (hStat) hStat.innerText = habitDone + ' / ' + habitGoal + ' days';
  if (hPct) hPct.innerText = Math.round(habitPct * 100) + '%';

  const streakText = document.getElementById('ringsStreakCountText');
  if (streakText) streakText.innerText = (state.streakCount || 1) + 'd';

  // Helper to draw single ring
  function drawRing(radius, lineWidth, pct, colorHex) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * pct);

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = 0.18;
    ctx.stroke();

    // Foreground arc
    if (pct > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 1.0;
      ctx.shadowColor = colorHex;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Ring 1: Coral Pink (Outer)
  drawRing(70, 11, pagesPct, '#fa114f');
  // Ring 2: Neon Emerald (Middle)
  drawRing(54, 11, minsPct, '#a1fa00');
  // Ring 3: Electric Cyan (Inner)
  drawRing(38, 11, habitPct, '#00f0ff');
}

/* 9. 4-Track Spatial Ambient Soundscape DJ Mixer Console */
let spatialMixerState = {
  masterVol: 0.65,
  rainVol: 0.50,
  fireVol: 0.30,
  wavesVol: 0.20,
  forestVol: 0.00,
  muted: { rain: false, fire: false, waves: false, forest: false }
};

let spatialGainNodes = {};
let spatialEqAnimId = null;

function initSpatialSoundMixer() {
  const canvas = document.getElementById('spatialEqCanvas');
  if (!canvas) return;
  startSpatialEqVisualizer();
}

function setMasterAmbienceVolume(val) {
  spatialMixerState.masterVol = parseInt(val) / 100;
  const lbl = document.getElementById('masterVolumeLabel');
  if (lbl) lbl.innerText = val + '%';
  if (ambienceMasterGain && audioCtx) {
    ambienceMasterGain.gain.setValueAtTime(spatialMixerState.masterVol * 0.5, audioCtx.currentTime);
  }
}

function setChannelVolume(channel, val) {
  const pct = parseInt(val);
  spatialMixerState[channel + 'Vol'] = pct / 100;
  const valEl = document.getElementById('chanVal' + channel.charAt(0).toUpperCase() + channel.slice(1));
  if (valEl) valEl.innerText = pct + '%';
  triggerHaptic('light');
}

function toggleChannelMute(channel) {
  spatialMixerState.muted[channel] = !spatialMixerState.muted[channel];
  const btn = document.getElementById('muteBtn' + channel.charAt(0).toUpperCase() + channel.slice(1));
  if (btn) {
    btn.classList.toggle('muted', spatialMixerState.muted[channel]);
    btn.innerText = spatialMixerState.muted[channel] ? 'Unmute' : 'Mute';
  }
  triggerHaptic('selection');
}

function applyMixerPreset(presetKey) {
  triggerHaptic('medium');
  const presets = {
    rain_storm: { rain: 80, fire: 0, waves: 45, forest: 10 },
    cozy_cabin: { rain: 40, fire: 75, waves: 0, forest: 15 },
    coastal_zen: { rain: 10, fire: 0, waves: 80, forest: 30 },
    deep_forest: { rain: 20, fire: 20, waves: 0, forest: 85 }
  };

  const p = presets[presetKey];
  if (!p) return;

  const setSlider = (ch, val) => {
    const slider = document.getElementById('channel' + ch.charAt(0).toUpperCase() + ch.slice(1) + 'Slider');
    if (slider) slider.value = val;
    setChannelVolume(ch, val);
  };

  setSlider('rain', p.rain);
  setSlider('fire', p.fire);
  setSlider('waves', p.waves);
  setSlider('forest', p.forest);

  document.querySelectorAll('.preset-chip').forEach(c => {
    c.classList.remove('active');
  });
  if (event && event.target) {
    event.target.classList.add('active');
  }

  showToast('🎧 4D Scene applied: ' + presetKey.replace('_', ' ').toUpperCase(), 'success');
}

function startSpatialEqVisualizer() {
  const canvas = document.getElementById('spatialEqCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (spatialEqAnimId) {
    cancelAnimationFrame(spatialEqAnimId);
    spatialEqAnimId = null;
  }

  const bars = 28;
  const barWidth = Math.floor(canvas.width / bars) - 2;

  function renderEq() {
    const overlay = document.getElementById('ambienceModalOverlay');
    if (!overlay || !overlay.classList.contains('active')) {
      if (spatialEqAnimId) {
        cancelAnimationFrame(spatialEqAnimId);
        spatialEqAnimId = null;
      }
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const active = typeof isAmbiencePlaying !== 'undefined' && isAmbiencePlaying;

    for (let i = 0; i < bars; i++) {
      let height = 4;
      if (active) {
        const time = Date.now() * 0.005;
        const wave = Math.sin(time + i * 0.35) * 0.5 + 0.5;
        const jitter = Math.random() * 0.3;
        height = Math.max(6, Math.floor((wave + jitter) * (canvas.height - 8)));
      }

      const x = i * (barWidth + 2) + 2;
      const y = canvas.height - height;

      const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.5, '#818cf8');
      grad.addColorStop(1, '#c084fc');

      ctx.fillStyle = active ? grad : 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, height, [3, 3, 0, 0]);
      ctx.fill();
    }

    if (active) {
      spatialEqAnimId = requestAnimationFrame(renderEq);
    } else {
      spatialEqAnimId = null;
    }
  }
  renderEq();
}

/* 10. Gamified Streak Fire Ignition Burst */
function igniteStreakFlame() {
  const flame = document.getElementById('streakHeroFlame');
  if (!flame) return;

  flame.style.transform = 'scale(1.35) rotate(-5deg)';
  setTimeout(() => {
    flame.style.transform = '';
  }, 350);

  // Micro spark burst
  const rect = flame.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 14; i++) {
    const spark = document.createElement('div');
    spark.className = 'quantum-burst-particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 50;
    const color = ['#f59e0b', '#ef4444', '#fbbf24', '#f97316'][Math.floor(Math.random() * 4)];
    const size = 4 + Math.random() * 4;

    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.left = cx + 'px';
    spark.style.top = cy + 'px';
    spark.style.background = color;
    spark.style.boxShadow = '0 0 10px ' + color;

    document.body.appendChild(spark);

    const destX = cx + Math.cos(angle) * dist;
    const destY = cy + Math.sin(angle) * dist;

    spark.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: 'translate(' + (destX - cx) + 'px, ' + (destY - cy) + 'px) scale(0)', opacity: 0 }
    ], {
      duration: 550,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }).onfinish = () => spark.remove();
  }
}

/* Master 4D Systems Initializer */
function init4DFlagshipSystems() {
  initLiquidDockPill();
  initPullToRefresh();
  initSheetSwipeDismiss();
  updateFloatingMiniCapsule();
  syncCategoryTrackActiveState();
}

// Global Export bindings for HTML inline onclick handlers
window.triggerHaptic = triggerHaptic;
window.updateDockSlidingPill = updateDockSlidingPill;
window.initLiquidDockPill = initLiquidDockPill;
window.triggerGoldenSweep = triggerGoldenSweep;
window.initPullToRefresh = initPullToRefresh;
window.selectCategoryChip = selectCategoryChip;
window.syncCategoryTrackActiveState = syncCategoryTrackActiveState;
window.updateFloatingMiniCapsule = updateFloatingMiniCapsule;
window.quickStepActiveBook = quickStepActiveBook;
window.openActiveBookSheet = openActiveBookSheet;
window.playPaperRustleSound = playPaperRustleSound;
window.initSheetSwipeDismiss = initSheetSwipeDismiss;
window.draw3RingActivity = draw3RingActivity;
window.initSpatialSoundMixer = initSpatialSoundMixer;
window.setMasterAmbienceVolume = setMasterAmbienceVolume;
window.setChannelVolume = setChannelVolume;
window.toggleChannelMute = toggleChannelMute;
window.applyMixerPreset = applyMixerPreset;
window.igniteStreakFlame = igniteStreakFlame;
window.init4DFlagshipSystems = init4DFlagshipSystems;




