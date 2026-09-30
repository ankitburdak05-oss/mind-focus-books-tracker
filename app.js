// ==========================================================================
// MIND & FOCUS BOOKS TRACKER — MODERN NATIVE APP ENGINE (v3.17.1)
// ==========================================================================

const APP_VERSION = '3.17.1';
const CURRENT_APP_VERSION = 'v3.17.1';
const STORAGE_KEY = 'mind_focus_books_v1';
const PIN_KEY = 'mind_focus_pin_v1';
const PROFILE_KEY = 'mind_focus_profile_v1';
const STATS_KEY = 'mind_focus_stats_v1';

// Global Application State
let state = {
  books: [],
  activeTab: 'home',
  previousTab: 'home',
  statusFilter: 'ALL',
  categoryFilter: 'ALL',
  exploreGenre: 'ALL',
  searchQuery: '',
  exploreSearchQuery: '',
  sortBy: 'recent',
  currentBookIndex: -1,
  currentBook: null,
  editingBookIndex: -1,
  currentEditingCoverUrl: '',
  isTimerRunning: false,
  timerSeconds: 0,
  timerInterval: null,
  pin: localStorage.getItem(PIN_KEY) || '',
  pinLocked: false,
  pinBuffer: '',
  isSettingNewPin: false,
  newPinCandidate: '',
  theme: localStorage.getItem('mf_theme') || 'dark',
  profile: {
    name: 'Ankit Burdak',
    handle: '@ankitburdak',
    avatar: 'ankit_avatar.png'
  },
  stats: {
    readingStreak: 7,
    totalMinutesRead: 7470, // ~124h 30m
    lastReadDate: new Date().toISOString().split('T')[0]
  }
};

// Book Reader State
let readerState = {
  activeBookIdx: 0,
  lang: 'hindi',
  spreadMode: 'single', // 'single' or 'spread'
  theme: 'sepia',       // 'sepia', 'dark', 'light'
  fontSizePct: 100,
  currentPage: 1
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadProfile();
  loadStats();
  loadBooks();
  applyTheme(state.theme);
  
  // Security PIN Check
  if (state.pin && state.pin.length === 4) {
    lockApp();
  }
  
  // Set default Currently Reading book if none selected
  ensureCurrentlyReadingBook();
  
  // Initial Renders
  renderApp();
  
  // Check for in-app updates in background
  setTimeout(checkForBackgroundUpdates, 1500);
}

// Ensure at least one book is currently reading
function ensureCurrentlyReadingBook() {
  if (!state.books || state.books.length === 0) return;
  const readingBookIndex = state.books.findIndex(b => b.status === 'READING');
  if (readingBookIndex !== -1) {
    state.currentBookIndex = readingBookIndex;
    state.currentBook = state.books[readingBookIndex];
  } else {
    state.currentBookIndex = 0;
    state.currentBook = state.books[0];
  }
}

// ================= STORAGE & DATA MANAGEMENT =================
function loadProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      state.profile = Object.assign(state.profile, JSON.parse(saved));
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
  updateProfileDOM();
}

function saveProfile() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
  } catch (e) {}
  updateProfileDOM();
}

function updateProfileDOM() {
  const headerAvatar = document.getElementById('headerAvatarImg');
  if (headerAvatar) headerAvatar.src = state.profile.avatar || 'ankit_avatar.png';
  
  const homeGreetingName = document.getElementById('homeUserGreetingName');
  if (homeGreetingName) homeGreetingName.innerText = state.profile.name || 'Ankit Burdak';
  
  const profileAvatar = document.getElementById('profilePageAvatarImg');
  if (profileAvatar) profileAvatar.src = state.profile.avatar || 'ankit_avatar.png';
  
  const profileName = document.getElementById('profilePageName');
  if (profileName) profileName.innerText = state.profile.name || 'Ankit Burdak';
  
  const profileHandle = document.getElementById('profilePageHandle');
  if (profileHandle) profileHandle.innerText = state.profile.handle || '@ankitburdak';
}

function loadStats() {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      state.stats = Object.assign(state.stats, JSON.parse(saved));
    }
  } catch (e) {}
}

function saveStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(state.stats));
  } catch (e) {}
}

function loadBooks() {
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    let books = [];
    if (localData) {
      books = JSON.parse(localData);
    }
    
    // Always sync with master DEFAULT_BOOKS from books-data.js
    if (typeof DEFAULT_BOOKS !== 'undefined' && Array.isArray(DEFAULT_BOOKS)) {
      if (!books || books.length === 0) {
        books = JSON.parse(JSON.stringify(DEFAULT_BOOKS));
      } else {
        const existingMap = new Map();
        books.forEach(b => {
          if (b.title) existingMap.set(b.title.trim().toLowerCase(), b);
        });
        
        DEFAULT_BOOKS.forEach(defBook => {
          const key = defBook.title ? defBook.title.trim().toLowerCase() : '';
          if (!existingMap.has(key)) {
            books.push(Object.assign({}, defBook));
          } else {
            const existing = existingMap.get(key);
            // Ensure HD cover is present
            if (!existing.cover_image && defBook.cover_url) {
              existing.cover_url = defBook.cover_url;
            }
          }
        });
      }
    }
    
    // Ensure all books have proper defaults (Rating = 0 unless user rated)
    books.forEach((b, idx) => {
      if (!b.no && !b.book_no) b.no = `book ${idx + 1}`;
      if (!b.rating) b.rating = 0;
      if (!b.current_page) b.current_page = 0;
      if (!b.pages && !b.total_pages) b.pages = 250;
      else if (!b.pages && b.total_pages) b.pages = b.total_pages;
    });
    
    state.books = books;
    saveBooks();
  } catch (e) {
    console.error('Failed to load books:', e);
    if (typeof DEFAULT_BOOKS !== 'undefined') state.books = DEFAULT_BOOKS;
  }
}

function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.books));
  } catch (e) {
    console.error('Failed to save books:', e);
  }
}

// ================= NAVIGATION & TAB ROUTING =================
function switchTab(tabId) {
  state.previousTab = state.activeTab;
  state.activeTab = tabId;
  
  // Hide all views
  const views = document.querySelectorAll('.app-view');
  views.forEach(v => v.classList.remove('active'));
  
  // Hide book detail view specifically
  const bookDetailView = document.getElementById('viewBookDetail');
  if (bookDetailView) bookDetailView.classList.remove('active');
  
  // Show target view
  const targetViewId = 'view' + tabId.charAt(0).toUpperCase() + tabId.slice(1);
  const targetView = document.getElementById(targetViewId);
  if (targetView) targetView.classList.add('active');
  
  // Update bottom navigation tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(t => t.classList.remove('active'));
  
  const activeNavBtn = document.getElementById('navTab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
  if (activeNavBtn) activeNavBtn.classList.add('active');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderActiveTab();
}

function renderActiveTab() {
  if (state.activeTab === 'home') renderHomeView();
  else if (state.activeTab === 'library') renderLibraryView();
  else if (state.activeTab === 'explore') renderExploreView();
  else if (state.activeTab === 'progress') renderProgressView();
  else if (state.activeTab === 'profile') renderProfileView();
}

function renderApp() {
  renderHomeView();
  renderLibraryView();
  renderExploreView();
  renderProgressView();
  renderProfileView();
}

// ================= VIEW 1: HOME =================
function renderHomeView() {
  updateDynamicGreeting();
  renderHomeCurrentlyReading();
  renderHomeStats();
  renderHomeRecentBooks();
}

function updateDynamicGreeting() {
  const hour = new Date().getHours();
  const pre = document.querySelector('.greeting-pre');
  const emoji = document.querySelector('.greeting-emoji');
  
  if (pre && emoji) {
    if (hour >= 5 && hour < 12) {
      pre.innerText = 'Good Morning,';
      emoji.innerText = '🌅';
    } else if (hour >= 12 && hour < 17) {
      pre.innerText = 'Good Afternoon,';
      emoji.innerText = '☀️';
    } else if (hour >= 17 && hour < 21) {
      pre.innerText = 'Good Evening,';
      emoji.innerText = '🌇';
    } else {
      pre.innerText = 'Good Night,';
      emoji.innerText = '🌙';
    }
  }
}

function renderHomeCurrentlyReading() {
  if (!state.currentBook) ensureCurrentlyReadingBook();
  const book = state.currentBook;
  if (!book) return;
  
  const total = book.pages || book.total_pages || 200;
  const current = book.current_page || 0;
  const pct = Math.min(100, Math.round((current / total) * 100));
  
  const titleEl = document.getElementById('homeCrTitle');
  if (titleEl) titleEl.innerText = book.title;
  
  const subtitleEl = document.getElementById('homeCrSubtitle');
  if (subtitleEl) subtitleEl.innerText = `${pct}% completed (${current}/${total} pages)`;
  
  const percentTextEl = document.getElementById('homeCrPercentText');
  if (percentTextEl) percentTextEl.innerText = `${pct}%`;
  
  const radialBar = document.getElementById('homeCrRadialBar');
  if (radialBar) {
    const offset = 213.6 - (213.6 * (pct / 100));
    radialBar.style.strokeDashoffset = offset;
  }
  
  const coverImg = document.getElementById('homeCrCoverImg');
  if (coverImg) {
    coverImg.src = getBookCoverUrl(book);
  }
}

function renderHomeStats() {
  const total = state.books.length;
  const finished = state.books.filter(b => b.status === 'DONE').length;
  
  const statTotal = document.getElementById('statTotalBooks');
  if (statTotal) statTotal.innerText = total;
  
  const statFin = document.getElementById('statFinishedBooks');
  if (statFin) statFin.innerText = finished;
  
  const statStreak = document.getElementById('statReadingStreak');
  if (statStreak) statStreak.innerText = `${state.stats.readingStreak || 7} days`;
  
  const statTime = document.getElementById('statReadingTime');
  if (statTime) {
    const hours = Math.floor(state.stats.totalMinutesRead / 60);
    const mins = state.stats.totalMinutesRead % 60;
    statTime.innerText = `${hours}h ${mins}m`;
  }
}

function renderHomeRecentBooks() {
  const list = document.getElementById('homeRecentBooksList');
  if (!list) return;
  
  const recent = state.books.slice(0, 12);
  list.innerHTML = recent.map((book, idx) => `
    <div class="recent-book-card" onclick="openBookDetailViewByIndex(${idx})">
      <div class="recent-cover-box">
        <img src="${getBookCoverUrl(book)}" alt="${escapeHtml(book.title)}" onerror="this.src='cover_placeholder.jpg'">
      </div>
      <div class="recent-book-title">${escapeHtml(book.title)}</div>
      <div class="recent-book-cat">${escapeHtml(book.category || 'General')}</div>
    </div>
  `).join('');
}

// ================= VIEW 2: LIBRARY =================
function renderLibraryView() {
  renderLibraryFilters();
  renderLibraryGrid();
}

function renderLibraryFilters() {
  const total = state.books.length;
  const reading = state.books.filter(b => b.status === 'READING').length;
  const completed = state.books.filter(b => b.status === 'DONE').length;
  const wishlist = state.books.filter(b => b.status === 'PENDING' || b.status === 'UNREAD' || b.status === 'WISHLIST').length;
  
  const cAll = document.getElementById('countAll');
  if (cAll) cAll.innerText = total;
  const cRead = document.getElementById('countReading');
  if (cRead) cRead.innerText = reading;
  const cComp = document.getElementById('countCompleted');
  if (cComp) cComp.innerText = completed;
  const cWish = document.getElementById('countWishlist');
  if (cWish) cWish.innerText = wishlist;
  
  const catSelect = document.getElementById('libraryCategorySelect');
  if (catSelect && catSelect.children.length <= 1) {
    const categories = Array.from(new Set(state.books.map(b => b.category).filter(Boolean))).sort();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.innerText = cat;
      catSelect.appendChild(opt);
    });
  }
}

function filterByStatus(status) {
  state.statusFilter = status;
  
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(c => c.classList.remove('active'));
  
  if (status === 'ALL') document.getElementById('chipStatusAll')?.classList.add('active');
  else if (status === 'READING') document.getElementById('chipStatusReading')?.classList.add('active');
  else if (status === 'DONE') document.getElementById('chipStatusCompleted')?.classList.add('active');
  else if (status === 'WISHLIST') document.getElementById('chipStatusWishlist')?.classList.add('active');
  
  switchTab('library');
  renderLibraryGrid();
}

function handleSearch(val) {
  state.searchQuery = val.trim().toLowerCase();
  const clearBtn = document.getElementById('librarySearchClearBtn');
  if (clearBtn) clearBtn.style.display = state.searchQuery ? 'block' : 'none';
  renderLibraryGrid();
}

function clearSearch() {
  const input = document.getElementById('librarySearchInput');
  if (input) input.value = '';
  handleSearch('');
}

function focusSearch() {
  switchTab('library');
  const input = document.getElementById('librarySearchInput');
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function handleSortChange(sortVal) {
  state.sortBy = sortVal;
  renderLibraryGrid();
}

function handleCategoryChange(catVal) {
  state.categoryFilter = catVal;
  renderLibraryGrid();
}

function renderLibraryGrid() {
  const grid = document.getElementById('libraryBooksGrid');
  if (!grid) return;
  
  let filtered = state.books.slice();
  
  if (state.statusFilter === 'READING') {
    filtered = filtered.filter(b => b.status === 'READING');
  } else if (state.statusFilter === 'DONE') {
    filtered = filtered.filter(b => b.status === 'DONE');
  } else if (state.statusFilter === 'WISHLIST') {
    filtered = filtered.filter(b => b.status === 'PENDING' || b.status === 'UNREAD' || b.status === 'WISHLIST');
  }
  
  if (state.categoryFilter !== 'ALL') {
    filtered = filtered.filter(b => b.category === state.categoryFilter);
  }
  
  if (state.searchQuery) {
    filtered = filtered.filter(b => 
      (b.title && b.title.toLowerCase().includes(state.searchQuery)) ||
      (b.author && b.author.toLowerCase().includes(state.searchQuery)) ||
      (b.category && b.category.toLowerCase().includes(state.searchQuery))
    );
  }
  
  if (state.sortBy === 'title_asc') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (state.sortBy === 'progress_desc') {
    filtered.sort((a, b) => {
      const pa = ((a.current_page || 0) / (a.pages || 200));
      const pb = ((b.current_page || 0) / (b.pages || 200));
      return pb - pa;
    });
  } else if (state.sortBy === 'rating_desc') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (state.sortBy === 'pages_desc') {
    filtered.sort((a, b) => (b.pages || 0) - (a.pages || 0));
  }
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px 10px; color: var(--text-secondary);">
      <div style="font-size: 32px; margin-bottom: 8px;">📚</div>
      <p style="font-weight: 600;">No books match your criteria.</p>
    </div>`;
    return;
  }
  
  grid.innerHTML = filtered.map(book => {
    const originalIndex = state.books.indexOf(book);
    const total = book.pages || book.total_pages || 200;
    const current = book.current_page || 0;
    const pct = Math.min(100, Math.round((current / total) * 100));
    
    return `
      <div class="grid-book-card" onclick="openBookDetailViewByIndex(${originalIndex})">
        <div class="grid-cover-wrap">
          <img src="${getBookCoverUrl(book)}" alt="${escapeHtml(book.title)}" loading="lazy" onerror="this.src='cover_placeholder.jpg'">
        </div>
        <div class="grid-book-meta">
          <div class="grid-book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</div>
          <div class="grid-book-author">${escapeHtml(book.author || 'Unknown')}</div>
          <div class="grid-progress-wrap">
            <div class="grid-progress-bar">
              <div class="grid-progress-fill" style="width: ${pct}%"></div>
            </div>
            <span class="grid-progress-text">${pct}%</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ================= VIEW 3: EXPLORE =================
function renderExploreView() {
  renderPopularCategoryCounts();
  renderExploreBooksGrid();
}

function renderPopularCategoryCounts() {
  const productivity = state.books.filter(b => b.category === 'Productivity' || b.category === 'Focus & Concentration').length;
  const selfhelp = state.books.filter(b => b.category === 'Self Help' || b.category === 'Mindset & Logic').length;
  const fiction = state.books.filter(b => b.category === 'Fiction' || b.category === 'Sci-Fi').length;
  const business = state.books.filter(b => b.category === 'Business' || b.category === 'Finance').length;
  
  const elP = document.getElementById('catCountProductivity');
  if (elP) elP.innerText = `${productivity || 15} books`;
  
  const elS = document.getElementById('catCountSelfHelp');
  if (elS) elS.innerText = `${selfhelp || 25} books`;
  
  const elF = document.getElementById('catCountFiction');
  if (elF) elF.innerText = `${fiction || 20} books`;
  
  const elB = document.getElementById('catCountBusiness');
  if (elB) elB.innerText = `${business || 18} books`;
}

function filterExploreGenre(genre) {
  state.exploreGenre = genre;
  
  const chips = document.querySelectorAll('#exploreGenreChips .filter-chip');
  chips.forEach(c => {
    if (c.innerText.trim() === genre || (genre === 'ALL' && c.innerText.trim() === 'All')) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
  
  const title = document.getElementById('exploreGridHeaderTitle');
  if (title) {
    title.innerText = genre === 'ALL' ? 'Explore Recommendations' : `${genre} Books`;
  }
  
  renderExploreBooksGrid();
}

function handleExploreSearch(val) {
  state.exploreSearchQuery = val.trim().toLowerCase();
  renderExploreBooksGrid();
}

function renderExploreBooksGrid() {
  const grid = document.getElementById('exploreBooksGrid');
  if (!grid) return;
  
  let list = state.books.slice();
  
  if (state.exploreGenre !== 'ALL') {
    list = list.filter(b => (b.category || '').toLowerCase().includes(state.exploreGenre.toLowerCase()));
  }
  
  if (state.exploreSearchQuery) {
    list = list.filter(b => 
      (b.title && b.title.toLowerCase().includes(state.exploreSearchQuery)) ||
      (b.author && b.author.toLowerCase().includes(state.exploreSearchQuery)) ||
      (b.category && b.category.toLowerCase().includes(state.exploreSearchQuery))
    );
  }
  
  grid.innerHTML = list.slice(0, 24).map(book => {
    const originalIndex = state.books.indexOf(book);
    const total = book.pages || book.total_pages || 200;
    const current = book.current_page || 0;
    const pct = Math.min(100, Math.round((current / total) * 100));
    
    return `
      <div class="grid-book-card" onclick="openBookDetailViewByIndex(${originalIndex})">
        <div class="grid-cover-wrap">
          <img src="${getBookCoverUrl(book)}" alt="${escapeHtml(book.title)}" loading="lazy" onerror="this.src='cover_placeholder.jpg'">
        </div>
        <div class="grid-book-meta">
          <div class="grid-book-title">${escapeHtml(book.title)}</div>
          <div class="grid-book-author">${escapeHtml(book.author || 'Unknown')}</div>
          <div class="grid-progress-wrap">
            <div class="grid-progress-bar">
              <div class="grid-progress-fill" style="width: ${pct}%"></div>
            </div>
            <span class="grid-progress-text">${pct}%</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ================= VIEW 4: PROGRESS & ANALYTICS =================
function renderProgressView() {
  renderProgressCharts();
}

function renderProgressCharts() {
  const completedCount = state.books.filter(b => b.status === 'DONE').length;
  
  // Real avg rating (only from books the user actually rated!)
  const rated = state.books.filter(b => b.rating && Number(b.rating) > 0);
  const avgRating = rated.length ? (rated.reduce((acc, b) => acc + Number(b.rating), 0) / rated.length).toFixed(1) : '0.0';
  
  const totalPagesRead = state.books.reduce((acc, b) => acc + (b.current_page || 0), 0);
  
  const elRead = document.getElementById('progBooksRead');
  if (elRead) elRead.innerText = completedCount;
  
  const elRating = document.getElementById('progAvgRating');
  if (elRating) elRating.innerText = avgRating;
  
  const elPages = document.getElementById('progPagesMonth');
  if (elPages) elPages.innerText = totalPagesRead;
  
  renderMonthlyBarChart();
  renderGenreDonutChart();
}

function renderMonthlyBarChart() {
  const wrap = document.getElementById('monthlyBarChartWrap');
  if (!wrap) return;
  
  const completedCount = state.books.filter(b => b.status === 'DONE').length;
  const readingCount = state.books.filter(b => b.status === 'READING').length;
  
  const months = [
    { month: 'Jan', val: 0 },
    { month: 'Feb', val: 0 },
    { month: 'Mar', val: 0 },
    { month: 'Apr', val: 0 },
    { month: 'May', val: readingCount },
    { month: 'Jun', val: completedCount }
  ];
  const maxVal = Math.max(5, completedCount, readingCount);
  
  wrap.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 130px; padding: 10px 10px 0;">
      ${months.map(m => {
        const heightPct = Math.round((m.val / maxVal) * 100);
        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end;">
            <span style="font-size: 11px; font-weight: 700; color: var(--accent-gold); margin-bottom: 4px;">${m.val}</span>
            <div style="width: 28px; height: ${Math.max(4, heightPct)}%; background: linear-gradient(180deg, #3b82f6 0%, #10b981 100%); border-radius: 6px 6px 0 0; transition: height 0.5s ease;"></div>
            <span style="font-size: 10px; color: var(--text-secondary); margin-top: 6px;">${m.month}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderGenreDonutChart() {
  const svgWrap = document.getElementById('genreDonutSvgWrap');
  const legendWrap = document.getElementById('genreDonutLegend');
  if (!svgWrap || !legendWrap) return;
  
  const categories = [
    { label: 'Self Help', pct: 30, color: '#3b82f6' },
    { label: 'Fiction', pct: 25, color: '#10b981' },
    { label: 'Productivity', pct: 20, color: '#f59e0b' },
    { label: 'Business', pct: 15, color: '#f97316' },
    { label: 'Others', pct: 10, color: '#8b5cf6' }
  ];
  
  let cumulativePct = 0;
  const circumference = 2 * Math.PI * 40; // ~251.3
  
  const paths = categories.map(cat => {
    const strokeLength = (cat.pct / 100) * circumference;
    const offset = -(cumulativePct / 100) * circumference;
    cumulativePct += cat.pct;
    return `
      <circle cx="60" cy="60" r="40" fill="none" stroke="${cat.color}" stroke-width="12"
              stroke-dasharray="${strokeLength} ${circumference - strokeLength}"
              stroke-dashoffset="${offset}" transform="rotate(-90 60 60)" />
    `;
  }).join('');
  
  svgWrap.innerHTML = `
    <svg viewBox="0 0 120 120" style="width: 100%; height: 100%;">
      ${paths}
      <text x="60" y="56" text-anchor="middle" font-size="14" font-weight="800" fill="#ffffff">${state.books.length}</text>
      <text x="60" y="70" text-anchor="middle" font-size="9" fill="#94a3b8">Total Books</text>
    </svg>
  `;
  
  legendWrap.innerHTML = categories.map(cat => `
    <div class="donut-legend-item">
      <div class="donut-legend-left">
        <span class="legend-dot" style="background: ${cat.color}"></span>
        <span>${cat.label}</span>
      </div>
      <span class="legend-pct">${cat.pct}%</span>
    </div>
  `).join('');
}

// ================= VIEW 5: PROFILE =================
function renderProfileView() {
  const total = state.books.length;
  const completed = state.books.filter(b => b.status === 'DONE').length;
  const streak = state.stats.readingStreak || 7;
  
  const elB = document.getElementById('profileStatBooks');
  if (elB) elB.innerText = total;
  
  const elC = document.getElementById('profileStatCompleted');
  if (elC) elC.innerText = completed;
  
  const elS = document.getElementById('profileStatStreak');
  if (elS) elS.innerText = streak;
  
  const pinStatusText = document.getElementById('pinStatusSubText');
  if (pinStatusText) {
    pinStatusText.innerText = state.pin ? 'PIN Lock Active • Protected' : 'PIN Lock disabled • Set PIN';
  }
}

// ================= VIEW 6: BOOK READING DETAIL VIEW =================
function openCurrentReadingDetail() {
  if (!state.currentBook) ensureCurrentlyReadingBook();
  if (state.currentBook) openBookDetailView(state.currentBook);
}

function openBookDetailViewByIndex(idx) {
  if (idx >= 0 && idx < state.books.length) {
    state.currentBookIndex = idx;
    state.currentBook = state.books[idx];
    openBookDetailView(state.currentBook);
  }
}

function openBookDetailView(book) {
  try {
    state.currentBook = book;
    state.currentBookIndex = state.books.indexOf(book);
    
    const coverEl = document.getElementById('detailBookCover');
    if (coverEl) coverEl.src = getBookCoverUrl(book);
    
    const titleEl = document.getElementById('detailBookTitle');
    if (titleEl) titleEl.innerText = book.title;
    
    const navNo = document.getElementById('detailNavBookNo');
    if (navNo) navNo.innerText = book.no || book.book_no || 'Book Details';
    
    const authorEl = document.getElementById('detailBookAuthor');
    if (authorEl) authorEl.innerText = book.author || 'Unknown Author';
    
    const categoryTags = document.getElementById('detailCategoryTags');
    if (categoryTags) {
      categoryTags.innerHTML = `
        <span class="detail-tag">${escapeHtml(book.category || 'General')}</span>
        <span class="detail-tag" style="background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.3);">${book.pages || book.total_pages || 250} Pages</span>
      `;
    }
    
    // Rating (Honest rating: 0.0 Unrated if 0)
    const ratingVal = document.getElementById('detailRatingVal');
    if (ratingVal) {
      const r = Number(book.rating) || 0;
      ratingVal.innerText = r > 0 ? `★ ${r.toFixed(1)} Stars` : '0.0 (Unrated)';
    }
    
    const total = book.pages || book.total_pages || 200;
    const current = book.current_page || 0;
    const pct = Math.min(100, Math.round((current / total) * 100));
    
    const progPct = document.getElementById('detailProgressPercent');
    if (progPct) progPct.innerText = `${pct}% completed`;
    
    const progPages = document.getElementById('detailPagesRatio');
    if (progPages) progPages.innerText = `${current} / ${total} pages`;
    
    const progFill = document.getElementById('detailProgressFill');
    if (progFill) progFill.style.width = `${pct}%`;
    
    // Takeaways & About
    const aboutText = document.getElementById('detailAboutText');
    if (aboutText) {
      aboutText.innerText = book.takeaway || book.notes || `A world-renowned masterpiece in ${book.category || 'personal growth'}. Focus on mastering the profound wisdom, habits, and mindset detailed across each page.`;
    }
    
    const notesInput = document.getElementById('detailNotesInput');
    if (notesInput) notesInput.value = book.takeaway || book.notes || '';
    
    // Meta fields (Book No, Language, Status, Availability, Start, End, Days, Price)
    const elNo = document.getElementById('detailBookNoVal');
    if (elNo) elNo.innerText = book.no || book.book_no || '-';
    
    const elLang = document.getElementById('detailLanguageVal');
    if (elLang) elLang.innerText = book.language || 'ENGLISH';
    
    const elStat = document.getElementById('detailStatusVal');
    if (elStat) elStat.innerText = book.status || 'PENDING';
    
    const elAvail = document.getElementById('detailAvailabilityVal');
    if (elAvail) elAvail.innerText = book.availability || 'AVAILABLE';
    
    const elStart = document.getElementById('detailDateStarted');
    if (elStart) elStart.innerText = book.start_date || 'Not Started Yet';
    
    const elTarget = document.getElementById('detailDateTarget');
    if (elTarget) elTarget.innerText = book.end_date || 'In Progress';
    
    const elDays = document.getElementById('detailDaysSpent');
    if (elDays) elDays.innerText = book.count_days ? `${book.count_days} days` : '-';
    
    const elPrice = document.getElementById('detailPriceVal');
    if (elPrice) elPrice.innerText = book.price ? `₹${book.price}` : 'Not Added';
    
    // Chapters breakdown
    const chaptersList = document.getElementById('detailChaptersList');
    if (chaptersList) {
      chaptersList.innerHTML = `
        <h4 class="box-title">Key Reading Milestones</h4>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:12px; color:var(--text-secondary);">
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
            <span>Part 1: The Core Foundation</span>
            <span style="color:var(--accent-emerald);">Pages 1 - ${Math.round(total * 0.3)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
            <span>Part 2: Systems, Focus & Strategy</span>
            <span style="color:var(--accent-emerald);">Pages ${Math.round(total * 0.3) + 1} - ${Math.round(total * 0.7)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:6px 0;">
            <span>Part 3: Mastery & Key Insights</span>
            <span style="color:var(--accent-emerald);">Pages ${Math.round(total * 0.7) + 1} - ${total}</span>
          </div>
        </div>
      `;
    }
    
    // Switch view to Detail
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    const detailView = document.getElementById('viewBookDetail');
    if (detailView) detailView.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('Error opening book detail:', err);
    showToast('Could not open book details');
  }
}

function closeBookDetailView() {
  switchTab(state.previousTab || 'home');
}

function switchDetailTab(tabName) {
  const tabs = document.querySelectorAll('.detail-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  
  const contents = document.querySelectorAll('.detail-tab-content');
  contents.forEach(c => c.classList.remove('active'));
  
  const activeBtn = document.getElementById('tabBtn' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (activeBtn) activeBtn.classList.add('active');
  
  const activeContent = document.getElementById('tabContent' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (activeContent) activeContent.classList.add('active');
}

function saveCurrentBookNotes(notesVal) {
  if (state.currentBook) {
    state.currentBook.takeaway = notesVal;
    state.currentBook.notes = notesVal;
    saveBooks();
  }
}

function setBookRating(stars) {
  if (state.currentBook) {
    state.currentBook.rating = stars;
    saveBooks();
    showToast(stars > 0 ? `Rated ${stars} Stars! ⭐` : 'Rating reset to 0');
    const ratingVal = document.getElementById('detailRatingVal');
    if (ratingVal) ratingVal.innerText = stars > 0 ? `★ ${stars.toFixed(1)} Stars` : '0.0 (Unrated)';
  }
}

// Reading Timer logic
function toggleReadingTimer() {
  const btnText = document.getElementById('detailTimerBtnText');
  const icon = document.getElementById('detailTimerIcon');
  
  if (!state.isTimerRunning) {
    state.isTimerRunning = true;
    state.timerSeconds = 0;
    if (btnText) btnText.innerText = '00:00 (Tap to Stop)';
    if (icon) icon.innerText = '⏸️';
    
    state.timerInterval = setInterval(() => {
      state.timerSeconds++;
      const mins = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
      const secs = (state.timerSeconds % 60).toString().padStart(2, '0');
      if (btnText) btnText.innerText = `${mins}:${secs} (Tap to Stop)`;
    }, 1000);
    
    showToast('Focus Reading Session Started! 🎧');
  } else {
    clearInterval(state.timerInterval);
    state.isTimerRunning = false;
    if (btnText) btnText.innerText = 'Focus Timer';
    if (icon) icon.innerText = '⏱️';
    
    const minutesAdded = Math.max(1, Math.round(state.timerSeconds / 60));
    state.stats.totalMinutesRead = (state.stats.totalMinutesRead || 0) + minutesAdded;
    saveStats();
    showToast(`Session logged! +${minutesAdded} min added! 🔥`);
    renderHomeStats();
  }
}

// Quick Log Pages Modal
function openQuickLogModal() {
  if (!state.currentBook) return;
  const nameEl = document.getElementById('quickLogBookName');
  if (nameEl) nameEl.innerText = state.currentBook.title;
  
  const pageInput = document.getElementById('quickLogPageInput');
  if (pageInput) {
    pageInput.value = state.currentBook.current_page || 0;
    pageInput.max = state.currentBook.pages || state.currentBook.total_pages || 500;
  }
  
  document.getElementById('quickLogModalOverlay')?.classList.add('active');
}

function closeQuickLogModal() {
  document.getElementById('quickLogModalOverlay')?.classList.remove('active');
}

function saveQuickLogPages() {
  const pageInput = document.getElementById('quickLogPageInput');
  if (!pageInput || !state.currentBook) return;
  
  const newPage = parseInt(pageInput.value, 10) || 0;
  state.currentBook.current_page = newPage;
  
  const total = state.currentBook.pages || state.currentBook.total_pages || 200;
  if (newPage >= total) {
    state.currentBook.status = 'DONE';
    showToast('🎉 Congratulations! You completed this book!');
  } else if (newPage > 0) {
    state.currentBook.status = 'READING';
    showToast(`Progress logged: Page ${newPage} ✨`);
  }
  
  saveBooks();
  closeQuickLogModal();
  openBookDetailView(state.currentBook);
  renderHomeView();
}

// ================= REAL 3D BOOK PAGE READER ENGINE =================
function openRealBookReaderForCurrent() {
  if (state.currentBookIndex !== -1) {
    openRealBookReader(state.currentBookIndex);
  } else {
    openRealBookReader(0);
  }
}

function openRealBookReader(bookIdx, lang) {
  if (bookIdx !== undefined && bookIdx !== null && bookIdx >= 0 && bookIdx < state.books.length) {
    readerState.activeBookIdx = bookIdx;
  }
  if (lang) {
    readerState.lang = lang;
  }
  readerState.currentPage = 1;
  
  const modal = document.getElementById('realBookReaderModal');
  if (!modal) return;
  
  modal.setAttribute('data-reader-theme', readerState.theme);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  updateReaderLangPills();
  renderRealBookPages();
}

function closeRealBookReader() {
  const modal = document.getElementById('realBookReaderModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function handleReaderOverlayClick(event) {
  if (event.target.id === 'realBookReaderModal') {
    closeRealBookReader();
  }
}

function switchReaderLanguage(lang) {
  readerState.lang = lang;
  readerState.currentPage = 1;
  updateReaderLangPills();
  renderRealBookPages();
}

function updateReaderLangPills() {
  const pHindi = document.getElementById('readerLangPillHindi');
  const pHinglish = document.getElementById('readerLangPillHinglish');
  const pEnglish = document.getElementById('readerLangPillEnglish');
  
  if (pHindi) pHindi.classList.toggle('active', readerState.lang === 'hindi');
  if (pHinglish) pHinglish.classList.toggle('active', readerState.lang === 'hinglish');
  if (pEnglish) pEnglish.classList.toggle('active', readerState.lang === 'english');
}

function toggleReaderSpreadMode() {
  readerState.spreadMode = readerState.spreadMode === 'spread' ? 'single' : 'spread';
  const btn = document.getElementById('readerSpreadToggleBtn');
  if (btn) btn.innerText = readerState.spreadMode === 'spread' ? '📖 Spread' : '📄 Single';
  renderRealBookPages();
}

function cycleReaderTheme() {
  const themes = ['sepia', 'dark', 'light'];
  const curIdx = themes.indexOf(readerState.theme);
  readerState.theme = themes[(curIdx + 1) % themes.length];
  
  const modal = document.getElementById('realBookReaderModal');
  if (modal) modal.setAttribute('data-reader-theme', readerState.theme);
  
  const btn = document.getElementById('readerThemeToggleBtn');
  if (btn) {
    btn.innerText = readerState.theme === 'sepia' ? '📜 Sepia' : (readerState.theme === 'dark' ? '🌙 Dark' : '☀️ Light');
  }
}

function adjustReaderFontSize(delta) {
  readerState.fontSizePct = Math.max(75, Math.min(150, readerState.fontSizePct + (delta * 10)));
  const disp = document.getElementById('readerFontSizeDisplay');
  if (disp) disp.innerText = `${readerState.fontSizePct}%`;
  
  const sheets = document.querySelectorAll('.page-inner-sheet');
  sheets.forEach(s => s.style.fontSize = `${readerState.fontSizePct / 100}rem`);
}

function prevReaderPage() {
  if (readerState.currentPage > 1) {
    readerState.currentPage--;
    renderRealBookPages();
  }
}

function nextReaderPage() {
  const book = state.books[readerState.activeBookIdx] || state.books[0];
  const pages = getBookPagesArray(book, readerState.lang);
  if (readerState.currentPage < pages.length) {
    readerState.currentPage++;
    renderRealBookPages();
  }
}

function onReaderSliderInput(val) {
  readerState.currentPage = parseInt(val, 10) || 1;
  renderRealBookPages();
}

function getBookPagesArray(book, lang) {
  if (!book) return [];
  const titleLower = (book.title || '').toLowerCase();
  
  // Check if book exists in BOOK_PAGES_DATA
  if (typeof BOOK_PAGES_DATA !== 'undefined' && BOOK_PAGES_DATA) {
    for (const key of Object.keys(BOOK_PAGES_DATA)) {
      if (titleLower.includes(key)) {
        const item = BOOK_PAGES_DATA[key];
        if (item.languages && item.languages[lang] && item.languages[lang].pages) {
          return item.languages[lang].pages;
        }
      }
    }
  }
  
  // Dynamic 4-page reading spread for any book in library
  const cat = book.category || 'Focus & Wisdom';
  const author = book.author || 'Master Author';
  const takeaway = book.takeaway || book.notes || 'Master the essential strategies and principles contained within this volume.';
  
  return [
    {
      pageNo: 1,
      content: `
        <div class="reader-title-page">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📖</div>
          <h1 class="reader-book-main-title">${escapeHtml(book.title)}</h1>
          <div class="reader-book-subtitle">${escapeHtml(cat)} Edition</div>
          <div class="reader-divider">✦ ✦ ✦</div>
          <div class="reader-book-author-text">By ${escapeHtml(author)}</div>
          <div class="reader-book-translator-text">Mind & Focus Master Library</div>
          <div class="reader-publisher-badge">
            <span class="pub-name">MIND FOCUS EDITIONS</span>
            <span class="pub-sub">OFFICIAL WORLD MASTERPIECE</span>
          </div>
        </div>
      `
    },
    {
      pageNo: 2,
      content: `
        <div class="reader-page-header">अध्याय 1 : मुख्य दर्शन एवं सार (Core Principles)</div>
        <div class="reader-praise-block">
          <p class="reader-quote-text">“${escapeHtml(takeaway)}”</p>
          <p class="reader-quote-author">— <strong>${escapeHtml(author)}</strong></p>
        </div>
        <div class="reader-callout-box">
          <div class="reader-callout-title">🔑 व्यावहारिक सीख (Actionable Takeaway)</div>
          <p style="font-size:0.9rem; line-height:1.6; margin:0;">
            इस पुस्तक के सिद्धांतों को अपने दैनिक जीवन में लागू करने के लिए रोज़ाना 20-30 मिनट बिना किसी भटकाव के गहरा अध्ययन करें।
          </p>
        </div>
      `
    },
    {
      pageNo: 3,
      content: `
        <div class="reader-page-header">अध्याय 2 : उत्पादकता एवं गहरा फ़ोकस (Deep Strategy)</div>
        <p style="font-size:0.95rem; line-height:1.7;">
          मनुष्य का ध्यान उसकी सबसे मूल्यवान संपत्ति है। जब आप अपने इरादों को स्पष्ट रखते हैं और सोशल मीडिया तथा अनावश्यक विकर्षणों को दूर करते हैं, तो आपकी सीखने और काम करने की क्षमता कई गुना बढ़ जाती है।
        </p>
        <div class="reader-highlight-card">
          <span class="mode-badge mode-hyper">HYPERFOCUS MODE</span>
          <p style="font-size:0.88rem; margin:4px 0 0; line-height:1.5;">
            एक समय में केवल एक लक्ष्य पर 100% एकाग्रता। कार्य पूरा होने तक अन्य सभी रुकावटों को रोकें।
          </p>
        </div>
      `
    },
    {
      pageNo: 4,
      content: `
        <div class="reader-page-header">व्यक्तिगत नोट्स एवं निष्कर्ष (My Reflections)</div>
        <div style="background: rgba(0,0,0,0.04); border:1px solid rgba(0,0,0,0.08); border-radius:8px; padding:12px; min-height:160px; font-family:inherit;">
          ${escapeHtml(book.takeaway || book.notes || 'इस पुस्तक से आपने क्या सीखा? नीचे अपने नोट्स लिखें या Edit Book में जाकर अपडेट करें।')}
        </div>
        <div style="margin-top:16px; text-align:center; font-size:0.85rem; color:var(--text-muted);">
          ★ Total Pages in this edition: ${book.pages || book.total_pages || 250}
        </div>
      `
    }
  ];
}

function renderRealBookPages() {
  const book = state.books[readerState.activeBookIdx] || state.books[0];
  if (!book) return;
  
  const pages = getBookPagesArray(book, readerState.lang);
  const totalPages = pages.length > 0 ? pages.length : 1;
  
  if (readerState.currentPage > totalPages) readerState.currentPage = totalPages;
  if (readerState.currentPage < 1) readerState.currentPage = 1;
  
  const titleDisplay = document.getElementById('readerBookTitleDisplay');
  if (titleDisplay) titleDisplay.innerText = book.title;
  
  const badge = document.getElementById('readerBookBadge');
  if (badge) badge.innerText = `📖 ${readerState.lang.toUpperCase()} EDITION`;
  
  const slider = document.getElementById('readerPageSlider');
  if (slider) {
    slider.min = 1;
    slider.max = totalPages;
    slider.value = readerState.currentPage;
  }
  
  const indicator = document.getElementById('readerPageIndicator');
  if (indicator) {
    indicator.innerText = `Page ${readerState.currentPage} / ${totalPages}`;
  }
  
  const prevBtn = document.getElementById('readerPrevPageBtn');
  if (prevBtn) prevBtn.disabled = readerState.currentPage <= 1;
  
  const nextBtn = document.getElementById('readerNextPageBtn');
  if (nextBtn) nextBtn.disabled = readerState.currentPage >= totalPages;
  
  // Render Left Page & Right Page
  const isMobile = window.innerWidth <= 768;
  const isDual = !isMobile && (readerState.spreadMode === 'spread') && totalPages > 1;
  
  const spreadEl = document.getElementById('realBookSpread');
  if (spreadEl) {
    spreadEl.classList.toggle('single-page-mode', !isDual);
  }
  
  const leftPageSheet = document.getElementById('readerPageLeft');
  if (leftPageSheet) leftPageSheet.style.display = isDual ? 'flex' : 'none';
  
  const innerRight = document.getElementById('pageInnerRight');
  const footerRight = document.getElementById('pageFooterRight');
  
  const curPageData = pages[readerState.currentPage - 1];
  if (innerRight && curPageData) {
    innerRight.innerHTML = curPageData.content;
    if (footerRight) footerRight.innerText = `Page ${curPageData.pageNo || readerState.currentPage}`;
  }
  
  if (isDual) {
    const leftPageData = readerState.currentPage > 1 ? pages[readerState.currentPage - 2] : null;
    const innerLeft = document.getElementById('pageInnerLeft');
    const footerLeft = document.getElementById('pageFooterLeft');
    if (innerLeft) {
      innerLeft.innerHTML = leftPageData ? leftPageData.content : '<div style="display:flex; height:100%; align-items:center; justify-content:center; opacity:0.3;">Blank Page</div>';
      if (footerLeft) footerLeft.innerText = leftPageData ? `Page ${leftPageData.pageNo}` : '';
    }
  }
}

// ================= COMPREHENSIVE 16-FIELD EDIT / ADD BOOK MODAL =================
function openAddBookModal() {
  state.editingBookIndex = -1;
  state.currentEditingCoverUrl = '';
  
  const title = document.getElementById('editBookModalTitle');
  if (title) title.innerText = 'Add New Book';
  
  document.getElementById('editBookNo').value = `book ${state.books.length + 1}`;
  document.getElementById('editBookLanguage').value = 'HINDI, ENGLISH';
  document.getElementById('editBookTitle').value = '';
  document.getElementById('editBookAuthor').value = '';
  document.getElementById('editBookCategory').value = 'Productivity';
  document.getElementById('editBookCover').value = '';
  document.getElementById('editBookStatus').value = 'PENDING';
  document.getElementById('editBookAvailability').value = 'AVAILABLE';
  document.getElementById('editCurrentPage').value = 0;
  document.getElementById('editTotalPages').value = 250;
  document.getElementById('editBookPrice').value = '';
  document.getElementById('editBookRating').value = '0';
  document.getElementById('editStartDate').value = '';
  document.getElementById('editEndDate').value = '';
  document.getElementById('editCountDays').value = 0;
  document.getElementById('editBookTakeaway').value = '';
  
  updateCoverPreviewBox('');
  document.getElementById('editBookModalOverlay')?.classList.add('active');
}

function openEditCurrentBookModal() {
  if (state.currentBookIndex !== -1) {
    openEditModal(state.currentBookIndex);
  }
}

function openEditModal(index) {
  if (index < 0 || index >= state.books.length) return;
  state.editingBookIndex = index;
  const book = state.books[index];
  
  const title = document.getElementById('editBookModalTitle');
  if (title) title.innerText = 'Edit Book Details';
  
  document.getElementById('editBookNo').value = book.no || book.book_no || `book ${index + 1}`;
  document.getElementById('editBookLanguage').value = book.language || 'ENGLISH';
  document.getElementById('editBookTitle').value = book.title || '';
  document.getElementById('editBookAuthor').value = book.author || '';
  document.getElementById('editBookCategory').value = book.category || '';
  
  const existingCover = book.cover_image || book.cover_url || '';
  state.currentEditingCoverUrl = existingCover;
  document.getElementById('editBookCover').value = existingCover;
  
  document.getElementById('editBookStatus').value = book.status || 'PENDING';
  document.getElementById('editBookAvailability').value = book.availability || 'AVAILABLE';
  document.getElementById('editCurrentPage').value = book.current_page || 0;
  document.getElementById('editTotalPages').value = book.pages || book.total_pages || 250;
  document.getElementById('editBookPrice').value = book.price ? book.price : '';
  document.getElementById('editBookRating').value = (book.rating !== undefined && book.rating !== null) ? String(book.rating) : '0';
  document.getElementById('editStartDate').value = book.start_date || '';
  document.getElementById('editEndDate').value = book.end_date || '';
  document.getElementById('editCountDays').value = book.count_days || 0;
  document.getElementById('editBookTakeaway').value = book.takeaway || book.notes || '';
  
  updateCoverPreviewBox(existingCover);
  document.getElementById('editBookModalOverlay')?.classList.add('active');
}

function onEditBookCoverUrlInput(url) {
  state.currentEditingCoverUrl = url.trim();
  updateCoverPreviewBox(state.currentEditingCoverUrl);
}

function handleCoverImageUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = e => {
    state.currentEditingCoverUrl = e.target.result;
    document.getElementById('editBookCover').value = e.target.result;
    updateCoverPreviewBox(e.target.result);
    showToast('Photo selected! ✨');
  };
  reader.readAsDataURL(file);
}

function removeCoverPhoto() {
  state.currentEditingCoverUrl = '';
  document.getElementById('editBookCover').value = '';
  updateCoverPreviewBox('');
}

function updateCoverPreviewBox(url) {
  const previewImg = document.getElementById('coverPreviewImg');
  const placeholder = document.getElementById('coverPlaceholderText');
  const removeBtn = document.getElementById('removeCoverBtn');
  
  if (url && previewImg) {
    previewImg.src = url;
    previewImg.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-block';
  } else {
    if (previewImg) previewImg.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function calculateCountDays() {
  const start = document.getElementById('editStartDate').value;
  const end = document.getElementById('editEndDate').value;
  const countInput = document.getElementById('editCountDays');
  if (start && end) {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = d2 - d1;
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    if (countInput) countInput.value = diffDays;
  }
}

function closeEditModal() {
  document.getElementById('editBookModalOverlay')?.classList.remove('active');
}

function saveBookModal() {
  const title = document.getElementById('editBookTitle').value.trim();
  if (!title) {
    showToast('Please enter a book title!');
    return;
  }
  
  const bookNo = document.getElementById('editBookNo').value.trim();
  const language = document.getElementById('editBookLanguage').value.trim() || 'ENGLISH';
  const author = document.getElementById('editBookAuthor').value.trim() || 'Unknown';
  const category = document.getElementById('editBookCategory').value.trim() || 'General';
  const status = document.getElementById('editBookStatus').value;
  const availability = document.getElementById('editBookAvailability').value;
  const currentPage = parseInt(document.getElementById('editCurrentPage').value, 10) || 0;
  const totalPages = Math.max(1, parseInt(document.getElementById('editTotalPages').value, 10) || 250);
  const priceVal = document.getElementById('editBookPrice').value.trim();
  const price = priceVal ? parseFloat(priceVal) : 0;
  const rating = parseInt(document.getElementById('editBookRating').value, 10) || 0;
  const startDate = document.getElementById('editStartDate').value;
  const endDate = document.getElementById('editEndDate').value;
  const countDays = parseInt(document.getElementById('editCountDays').value, 10) || 0;
  const takeaway = document.getElementById('editBookTakeaway').value.trim();
  
  // Safe-Save Cover Protection
  const inputCover = document.getElementById('editBookCover').value.trim();
  let existingCover = '';
  if (state.editingBookIndex >= 0) {
    const existing = state.books[state.editingBookIndex];
    existingCover = existing.cover_image || existing.cover_url || '';
  }
  const finalCover = inputCover || state.currentEditingCoverUrl || existingCover || '';
  
  const bookData = {
    no: bookNo,
    book_no: bookNo,
    title,
    author,
    language,
    category,
    status,
    availability,
    current_page: currentPage,
    pages: totalPages,
    total_pages: totalPages,
    price,
    rating,
    start_date: startDate,
    end_date: endDate,
    count_days: countDays,
    takeaway,
    notes: takeaway,
    cover_image: finalCover,
    cover_url: finalCover
  };
  
  if (state.editingBookIndex >= 0) {
    state.books[state.editingBookIndex] = Object.assign({}, state.books[state.editingBookIndex], bookData);
    if (state.currentBookIndex === state.editingBookIndex) {
      state.currentBook = state.books[state.editingBookIndex];
      openBookDetailView(state.currentBook);
    }
    showToast('Book updated successfully! 📚');
  } else {
    state.books.unshift(bookData);
    state.currentBook = bookData;
    state.currentBookIndex = 0;
    showToast('New book added to library! ✨');
  }
  
  saveBooks();
  closeEditModal();
  renderApp();
}

// ================= EDIT PROFILE MODAL =================
function openEditProfileModal() {
  document.getElementById('inputProfileName').value = state.profile.name || 'Ankit Burdak';
  document.getElementById('inputProfileHandle').value = state.profile.handle || '@ankitburdak';
  document.getElementById('previewEditAvatar').src = state.profile.avatar || 'ankit_avatar.png';
  document.getElementById('editProfileModalOverlay')?.classList.add('active');
}

function closeEditProfileModal() {
  document.getElementById('editProfileModalOverlay')?.classList.remove('active');
}

function handleAvatarFileSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.profile.avatar = e.target.result;
    document.getElementById('previewEditAvatar').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveProfileChanges() {
  const name = document.getElementById('inputProfileName').value.trim();
  const handle = document.getElementById('inputProfileHandle').value.trim();
  
  if (name) state.profile.name = name;
  if (handle) state.profile.handle = handle;
  
  saveProfile();
  closeEditProfileModal();
  showToast('Profile updated! 🌟');
}

// ================= SECURITY PIN SYSTEM =================
function lockApp() {
  state.pinLocked = true;
  state.pinBuffer = '';
  updatePinDots();
  const pinScreen = document.getElementById('pinLockOverlay');
  if (pinScreen) pinScreen.style.display = 'flex';
}

function unlockApp() {
  state.pinLocked = false;
  state.pinBuffer = '';
  const pinScreen = document.getElementById('pinLockOverlay');
  if (pinScreen) pinScreen.style.display = 'none';
  showToast('Library unlocked! 🔓');
}

function openPinSetupModal() {
  state.isSettingNewPin = true;
  state.newPinCandidate = '';
  state.pinBuffer = '';
  
  const title = document.getElementById('pinScreenTitle');
  if (title) title.innerText = 'Set New 4-Digit PIN';
  
  const sub = document.getElementById('pinScreenSub');
  if (sub) sub.innerText = 'Enter 4 digits to protect your app';
  
  updatePinDots();
  document.getElementById('pinLockOverlay').style.display = 'flex';
}

function pressPinKey(digit) {
  if (state.pinBuffer.length < 4) {
    state.pinBuffer += digit;
    updatePinDots();
    
    if (state.pinBuffer.length === 4) {
      setTimeout(handlePinComplete, 150);
    }
  }
}

function deletePinKey() {
  if (state.pinBuffer.length > 0) {
    state.pinBuffer = state.pinBuffer.slice(0, -1);
    updatePinDots();
  }
}

function clearPinInput() {
  state.pinBuffer = '';
  updatePinDots();
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('pinDot' + i);
    if (dot) {
      if (i < state.pinBuffer.length) dot.classList.add('filled');
      else dot.classList.remove('filled');
    }
  }
}

function handlePinComplete() {
  if (state.isSettingNewPin) {
    state.pin = state.pinBuffer;
    localStorage.setItem(PIN_KEY, state.pin);
    state.isSettingNewPin = false;
    document.getElementById('pinLockOverlay').style.display = 'none';
    showToast('PIN Protection Enabled! 🔒');
    renderProfileView();
  } else {
    if (state.pinBuffer === state.pin) {
      unlockApp();
    } else {
      showToast('Incorrect PIN! Try again.');
      clearPinInput();
    }
  }
}

// ================= BACKUP & EXPORT SYSTEM =================
function exportDataJSON() {
  try {
    const exportBundle = {
      app: 'Mind & Focus Books Tracker',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      stats: state.stats,
      books: state.books
    };
    
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindFocusBooks_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON Backup downloaded! 💾');
  } catch (e) {
    showToast('Error exporting JSON backup');
  }
}

function importDataJSON(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && Array.isArray(data.books)) {
        state.books = data.books;
        if (data.profile) state.profile = data.profile;
        if (data.stats) state.stats = data.stats;
        saveBooks();
        saveProfile();
        saveStats();
        renderApp();
        showToast('Library successfully restored! 🚀');
      } else {
        showToast('Invalid backup file format.');
      }
    } catch (err) {
      showToast('Error reading backup file.');
    }
  };
  reader.readAsText(file);
}

function exportDataCSV() {
  try {
    const headers = ['No', 'Title', 'Author', 'Language', 'Category', 'Status', 'Availability', 'Current Page', 'Total Pages', 'Progress (%)', 'Rating', 'Start Date', 'End Date', 'Days', 'Price', 'Takeaways'];
    const rows = state.books.map((b, i) => [
      `"${b.no || i + 1}"`,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.author || '').replace(/"/g, '""')}"`,
      `"${(b.language || 'ENGLISH').replace(/"/g, '""')}"`,
      `"${(b.category || '').replace(/"/g, '""')}"`,
      b.status || 'PENDING',
      b.availability || 'AVAILABLE',
      b.current_page || 0,
      b.pages || 250,
      Math.round(((b.current_page || 0) / (b.pages || 250)) * 100),
      b.rating || 0,
      `"${b.start_date || ''}"`,
      `"${b.end_date || ''}"`,
      b.count_days || 0,
      b.price || 0,
      `"${(b.takeaway || b.notes || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindFocusBooks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully! 📊');
  } catch (e) {
    showToast('Error exporting CSV');
  }
}

function exportDataPDF() {
  try {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast('PDF generator library not loaded.');
      return;
    }
    
    const doc = new window.jspdf.jsPDF();
    doc.setFontSize(18);
    doc.text('Mind & Focus Books Tracker — Reading Report', 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Books: ${state.books.length}`, 14, 28);
    
    const tableData = state.books.map((b, i) => [
      b.no || i + 1,
      b.title,
      b.author,
      b.category,
      b.status,
      `${b.current_page || 0}/${b.pages || 250}`,
      b.rating ? `${b.rating} ★` : '-'
    ]);
    
    if (doc.autoTable) {
      doc.autoTable({
        startY: 34,
        head: [['#', 'Title', 'Author', 'Category', 'Status', 'Pages', 'Rating']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }
      });
    }
    
    doc.save(`MindFocusBooks_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF Report generated! 📑');
  } catch (e) {
    console.error(e);
    showToast('Error generating PDF report');
  }
}

// ================= IN-APP UPDATE CHECKER =================
function openUpdateModal() {
  document.getElementById('inAppUpdateModalOverlay')?.classList.add('active');
}

function closeUpdateModal() {
  document.getElementById('inAppUpdateModalOverlay')?.classList.remove('active');
}

function checkForBackgroundUpdates() {
  if (typeof window.__DEFAULT_REMOTE_CONFIG__ !== 'undefined') {
    const cfg = window.__DEFAULT_REMOTE_CONFIG__;
    if (cfg && cfg.activeRelease && cfg.activeRelease.version) {
      const downloadBtn = document.getElementById('downloadApkBtn');
      if (downloadBtn && cfg.activeRelease.apkDownloadUrl) {
        downloadBtn.href = cfg.activeRelease.apkDownloadUrl;
      }
    }
  }
}

// ================= THEME TOGGLE =================
function toggleAppTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(state.theme);
  localStorage.setItem('mf_theme', state.theme);
  showToast(`Switched to ${state.theme === 'dark' ? 'Dark Luxury' : 'Clean Light'} theme! 🎨`);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const text = document.getElementById('appearanceSubText');
  if (text) text.innerText = theme === 'dark' ? 'Theme: Dark Modern Luxury' : 'Theme: Clean Light Mode';
}

function showNotificationSettings() {
  showToast('Daily reading streak reminders enabled at 8:00 PM 🔔');
}

// ================= UTILITIES & HELPERS =================
function getBookCoverUrl(book) {
  if (book.cover_image && book.cover_image.trim()) {
    return book.cover_image.replace('-M.jpg', '-L.jpg');
  }
  if (book.cover_url && book.cover_url.trim()) {
    return book.cover_url.replace('-M.jpg', '-L.jpg');
  }
  return 'cover_placeholder.jpg';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function showToast(message, duration = 2800) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}
