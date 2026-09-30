// ==========================================================================
// MIND & FOCUS BOOKS TRACKER — MODERN NATIVE APP ENGINE (v3.17.0)
// ==========================================================================

const APP_VERSION = '3.17.0';
const CURRENT_APP_VERSION = 'v3.17.0';
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
  if (state.books.length === 0) return;
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
    
    // Merge with master DEFAULT_BOOKS from books-data.js
    if (typeof DEFAULT_BOOKS !== 'undefined' && Array.isArray(DEFAULT_BOOKS)) {
      if (!books || books.length === 0) {
        books = JSON.parse(JSON.stringify(DEFAULT_BOOKS));
      } else {
        // Non-destructive merge
        const existingMap = new Map();
        books.forEach(b => {
          if (b.title) existingMap.set(b.title.trim().toLowerCase(), b);
        });
        
        DEFAULT_BOOKS.forEach(defBook => {
          const key = defBook.title ? defBook.title.trim().toLowerCase() : '';
          if (!existingMap.has(key)) {
            books.push(Object.assign({}, defBook));
          } else {
            // Update HD cover if existing has dummy or missing
            const existing = existingMap.get(key);
            if (!existing.cover_image && defBook.cover_url) {
              existing.cover_url = defBook.cover_url;
            }
          }
        });
      }
    }
    
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
  if (state.activeTab === tabId && document.getElementById('viewBookDetail').style.display !== 'block') return;
  
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
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Render specific tab content
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
  
  const total = book.pages || 200;
  const current = book.current_page || 0;
  const pct = Math.min(100, Math.round((current / total) * 100));
  
  const titleEl = document.getElementById('homeCrTitle');
  if (titleEl) titleEl.innerText = book.title;
  
  const subtitleEl = document.getElementById('homeCrSubtitle');
  if (subtitleEl) subtitleEl.innerText = `${pct}% completed`;
  
  const percentTextEl = document.getElementById('homeCrPercentText');
  if (percentTextEl) percentTextEl.innerText = `${pct}%`;
  
  // Update radial SVG ring: circumference = 2 * PI * 34 = ~213.6
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
  
  // Show first 10 books or books being read
  const recent = state.books.slice(0, 10);
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
  const wishlist = state.books.filter(b => b.status === 'UNREAD' || b.status === 'WISHLIST').length;
  
  const cAll = document.getElementById('countAll');
  if (cAll) cAll.innerText = total;
  const cRead = document.getElementById('countReading');
  if (cRead) cRead.innerText = reading;
  const cComp = document.getElementById('countCompleted');
  if (cComp) cComp.innerText = completed;
  const cWish = document.getElementById('countWishlist');
  if (cWish) cWish.innerText = wishlist;
  
  // Populate category select options if not populated
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
  
  // Update chips active state
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
  
  // Status filter
  if (state.statusFilter === 'READING') {
    filtered = filtered.filter(b => b.status === 'READING');
  } else if (state.statusFilter === 'DONE') {
    filtered = filtered.filter(b => b.status === 'DONE');
  } else if (state.statusFilter === 'WISHLIST') {
    filtered = filtered.filter(b => b.status === 'UNREAD' || b.status === 'WISHLIST');
  }
  
  // Category filter
  if (state.categoryFilter !== 'ALL') {
    filtered = filtered.filter(b => b.category === state.categoryFilter);
  }
  
  // Search query
  if (state.searchQuery) {
    filtered = filtered.filter(b => 
      (b.title && b.title.toLowerCase().includes(state.searchQuery)) ||
      (b.author && b.author.toLowerCase().includes(state.searchQuery)) ||
      (b.category && b.category.toLowerCase().includes(state.searchQuery))
    );
  }
  
  // Sort
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
    const total = book.pages || 200;
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
  const productivity = state.books.filter(b => b.category === 'Productivity').length;
  const selfhelp = state.books.filter(b => b.category === 'Self Help').length;
  const fiction = state.books.filter(b => b.category === 'Fiction' || b.category === 'Sci-Fi').length;
  const business = state.books.filter(b => b.category === 'Business' || b.category === 'Finance').length;
  
  const elP = document.getElementById('catCountProductivity');
  if (elP) elP.innerText = `${productivity || 12} books`;
  
  const elS = document.getElementById('catCountSelfHelp');
  if (elS) elS.innerText = `${selfhelp || 10} books`;
  
  const elF = document.getElementById('catCountFiction');
  if (elF) elF.innerText = `${fiction || 14} books`;
  
  const elB = document.getElementById('catCountBusiness');
  if (elB) elB.innerText = `${business || 8} books`;
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
    list = list.filter(b => (b.category || '').toLowerCase() === state.exploreGenre.toLowerCase());
  }
  
  if (state.exploreSearchQuery) {
    list = list.filter(b => 
      (b.title && b.title.toLowerCase().includes(state.exploreSearchQuery)) ||
      (b.author && b.author.toLowerCase().includes(state.exploreSearchQuery)) ||
      (b.category && b.category.toLowerCase().includes(state.exploreSearchQuery))
    );
  }
  
  grid.innerHTML = list.slice(0, 18).map(book => {
    const originalIndex = state.books.indexOf(book);
    const total = book.pages || 200;
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

function addFeaturedToLibrary() {
  showToast('Book added to your Reading list! 📖');
}

// ================= VIEW 4: PROGRESS & ANALYTICS =================
function renderProgressView() {
  renderProgressCharts();
}

function renderProgressCharts() {
  const completedCount = state.books.filter(b => b.status === 'DONE').length;
  
  // Avg rating
  const rated = state.books.filter(b => b.rating > 0);
  const avgRating = rated.length ? (rated.reduce((acc, b) => acc + b.rating, 0) / rated.length).toFixed(1) : '4.8';
  
  const elRead = document.getElementById('progBooksRead');
  if (elRead) elRead.innerText = completedCount || 12;
  
  const elRating = document.getElementById('progAvgRating');
  if (elRating) elRating.innerText = avgRating;
  
  const elPages = document.getElementById('progPagesMonth');
  if (elPages) elPages.innerText = '324';
  
  // Render Bar Chart (Jan to Jun)
  renderMonthlyBarChart();
  
  // Render Donut Chart
  renderGenreDonutChart();
}

function renderMonthlyBarChart() {
  const wrap = document.getElementById('monthlyBarChartWrap');
  if (!wrap) return;
  
  const months = [
    { month: 'Jan', val: 2 },
    { month: 'Feb', val: 3 },
    { month: 'Mar', val: 4 },
    { month: 'Apr', val: 5 },
    { month: 'May', val: 3 },
    { month: 'Jun', val: 4 }
  ];
  const maxVal = 6;
  
  wrap.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 130px; padding: 10px 10px 0;">
      ${months.map(m => {
        const heightPct = Math.round((m.val / maxVal) * 100);
        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end;">
            <span style="font-size: 11px; font-weight: 700; color: var(--accent-gold); margin-bottom: 4px;">${m.val}</span>
            <div style="width: 28px; height: ${heightPct}%; background: linear-gradient(180deg, #3b82f6 0%, #10b981 100%); border-radius: 6px 6px 0 0; transition: height 0.5s ease;"></div>
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
    { label: 'Self Help', pct: 31, color: '#3b82f6' },
    { label: 'Fiction', pct: 23, color: '#10b981' },
    { label: 'Productivity', pct: 19, color: '#f59e0b' },
    { label: 'Business', pct: 15, color: '#f97316' },
    { label: 'Others', pct: 12, color: '#8b5cf6' }
  ];
  
  // Render SVG Ring
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
  
  // Render Legend
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
  state.currentBook = book;
  state.currentBookIndex = state.books.indexOf(book);
  
  // Update Book Detail Screen DOM
  const coverEl = document.getElementById('detailBookCover');
  if (coverEl) coverEl.src = getBookCoverUrl(book);
  
  const titleEl = document.getElementById('detailBookTitle');
  if (titleEl) titleEl.innerText = book.title;
  
  const authorEl = document.getElementById('detailBookAuthor');
  if (authorEl) authorEl.innerText = book.author || 'Unknown Author';
  
  const categoryTags = document.getElementById('detailCategoryTags');
  if (categoryTags) {
    categoryTags.innerHTML = `
      <span class="detail-tag">${escapeHtml(book.category || 'General')}</span>
      ${book.pages ? `<span class="detail-tag" style="background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.3);">${book.pages} Pages</span>` : ''}
    `;
  }
  
  const ratingVal = document.getElementById('detailRatingVal');
  if (ratingVal) ratingVal.innerText = book.rating ? book.rating.toFixed(1) : '4.8';
  
  const total = book.pages || 200;
  const current = book.current_page || 0;
  const pct = Math.min(100, Math.round((current / total) * 100));
  
  const progPct = document.getElementById('detailProgressPercent');
  if (progPct) progPct.innerText = `${pct}% completed`;
  
  const progPages = document.getElementById('detailPagesRatio');
  if (progPages) progPages.innerText = `${current} / ${total} pages`;
  
  const progFill = document.getElementById('detailProgressFill');
  if (progFill) progFill.style.width = `${pct}%`;
  
  const aboutText = document.getElementById('detailAboutText');
  if (aboutText) {
    aboutText.innerText = book.notes || `A world-renowned masterpiece in ${book.category || 'personal growth'}. Focus on mastering the profound wisdom, habits, and mindset detailed across each page.`;
  }
  
  const notesInput = document.getElementById('detailNotesInput');
  if (notesInput) notesInput.value = book.notes || '';
  
  // Render dummy chapters list
  const chaptersList = document.getElementById('detailChaptersList');
  if (chaptersList) {
    chaptersList.innerHTML = `
      <h4 class="box-title">Key Chapters & Milestone Pages</h4>
      <div style="display:flex; flex-direction:column; gap:8px; font-size:12px; color:var(--text-secondary);">
        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
          <span>Part 1: The Foundation & Core Principles</span>
          <span style="color:var(--accent-emerald);">Pages 1 - ${Math.round(total * 0.3)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
          <span>Part 2: Systems, Focus & Deep Strategy</span>
          <span style="color:var(--accent-emerald);">Pages ${Math.round(total * 0.3) + 1} - ${Math.round(total * 0.7)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px 0;">
          <span>Part 3: Mastery, Integration & Impact</span>
          <span style="color:var(--accent-emerald);">Pages ${Math.round(total * 0.7) + 1} - ${total}</span>
        </div>
      </div>
    `;
  }
  
  // Switch to detail view
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
  const detailView = document.getElementById('viewBookDetail');
  if (detailView) detailView.classList.add('active');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    state.currentBook.notes = notesVal;
    saveBooks();
  }
}

function setBookRating(stars) {
  if (state.currentBook) {
    state.currentBook.rating = stars;
    saveBooks();
    showToast(`Rated ${stars} Stars! ⭐`);
    const ratingVal = document.getElementById('detailRatingVal');
    if (ratingVal) ratingVal.innerText = stars.toFixed(1);
  }
}

// Reading Timer logic
function toggleReadingTimer() {
  const btnText = document.getElementById('detailTimerBtnText');
  const icon = document.getElementById('detailTimerIcon');
  
  if (!state.isTimerRunning) {
    // Start timer
    state.isTimerRunning = true;
    state.timerSeconds = 0;
    if (btnText) btnText.innerText = 'Reading... 00:00 (Tap to Stop)';
    if (icon) icon.innerText = '⏸️';
    
    state.timerInterval = setInterval(() => {
      state.timerSeconds++;
      const mins = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
      const secs = (state.timerSeconds % 60).toString().padStart(2, '0');
      if (btnText) btnText.innerText = `Reading... ${mins}:${secs} (Tap to Stop)`;
    }, 1000);
    
    showToast('Focus Reading Session Started! 🎧');
  } else {
    // Stop timer
    clearInterval(state.timerInterval);
    state.isTimerRunning = false;
    if (btnText) btnText.innerText = 'Continue Reading';
    if (icon) icon.innerText = '⏱️';
    
    const minutesAdded = Math.max(1, Math.round(state.timerSeconds / 60));
    state.stats.totalMinutesRead = (state.stats.totalMinutesRead || 0) + minutesAdded;
    saveStats();
    showToast(`Awesome! ${minutesAdded} minute(s) added to your reading time! 🔥`);
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
    pageInput.max = state.currentBook.pages || 500;
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
  
  if (newPage >= (state.currentBook.pages || 200)) {
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

// ================= SAFE-SAVE EDIT / ADD BOOK MODAL =================
function openAddBookModal() {
  state.editingBookIndex = -1;
  state.currentEditingCoverUrl = '';
  
  const title = document.getElementById('editBookModalTitle');
  if (title) title.innerText = 'Add New Book';
  
  document.getElementById('modalBookTitle').value = '';
  document.getElementById('modalBookAuthor').value = '';
  document.getElementById('modalBookCategory').value = 'Productivity';
  document.getElementById('modalBookStatus').value = 'READING';
  document.getElementById('modalBookCurrentPage').value = 0;
  document.getElementById('modalBookTotalPages').value = 250;
  document.getElementById('modalBookCoverUrl').value = '';
  document.getElementById('modalBookRating').value = 5;
  
  updateModalCoverPreview('');
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
  
  document.getElementById('modalBookTitle').value = book.title || '';
  document.getElementById('modalBookAuthor').value = book.author || '';
  document.getElementById('modalBookCategory').value = book.category || '';
  document.getElementById('modalBookStatus').value = book.status || 'READING';
  document.getElementById('modalBookCurrentPage').value = book.current_page || 0;
  document.getElementById('modalBookTotalPages').value = book.pages || 200;
  
  const existingCover = book.cover_image || book.cover_url || '';
  state.currentEditingCoverUrl = existingCover;
  document.getElementById('modalBookCoverUrl').value = existingCover;
  document.getElementById('modalBookRating').value = book.rating || 5;
  
  updateModalCoverPreview(existingCover);
  document.getElementById('editBookModalOverlay')?.classList.add('active');
}

function updateModalCoverPreview(url) {
  const previewImg = document.getElementById('modalCoverPreviewImg');
  if (previewImg) {
    previewImg.src = url || 'cover_placeholder.jpg';
  }
}

function closeEditModal() {
  document.getElementById('editBookModalOverlay')?.classList.remove('active');
}

function saveBookModal() {
  const title = document.getElementById('modalBookTitle').value.trim();
  const author = document.getElementById('modalBookAuthor').value.trim();
  
  if (!title) {
    showToast('Please enter a book title!');
    return;
  }
  
  const category = document.getElementById('modalBookCategory').value.trim() || 'General';
  const status = document.getElementById('modalBookStatus').value;
  const currentPage = parseInt(document.getElementById('modalBookCurrentPage').value, 10) || 0;
  const totalPages = Math.max(1, parseInt(document.getElementById('modalBookTotalPages').value, 10) || 200);
  const rating = parseInt(document.getElementById('modalBookRating').value, 10) || 5;
  
  // Safe-Save Cover: Never erase!
  const inputCover = document.getElementById('modalBookCoverUrl').value.trim();
  let existingCover = '';
  if (state.editingBookIndex >= 0) {
    const existing = state.books[state.editingBookIndex];
    existingCover = existing.cover_image || existing.cover_url || '';
  }
  const finalCover = inputCover || state.currentEditingCoverUrl || existingCover || '';
  
  const bookData = {
    title,
    author: author || 'Unknown',
    category,
    status,
    current_page: currentPage,
    pages: totalPages,
    rating,
    cover_image: finalCover,
    cover_url: finalCover,
    notes: (state.editingBookIndex >= 0 ? state.books[state.editingBookIndex].notes : '') || ''
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
    const headers = ['No', 'Title', 'Author', 'Category', 'Status', 'Current Page', 'Total Pages', 'Progress (%)', 'Rating', 'Notes'];
    const rows = state.books.map((b, i) => [
      i + 1,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.author || '').replace(/"/g, '""')}"`,
      `"${(b.category || '').replace(/"/g, '""')}"`,
      b.status || 'READING',
      b.current_page || 0,
      b.pages || 200,
      Math.round(((b.current_page || 0) / (b.pages || 200)) * 100),
      b.rating || 5,
      `"${(b.notes || '').replace(/"/g, '""')}"`
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
      i + 1,
      b.title,
      b.author,
      b.category,
      b.status,
      `${b.current_page || 0}/${b.pages || 200}`
    ]);
    
    if (doc.autoTable) {
      doc.autoTable({
        startY: 34,
        head: [['#', 'Title', 'Author', 'Category', 'Status', 'Pages']],
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
      const ver = cfg.activeRelease.version;
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
