
const CARD_DISPLAY_KEY = 'mf_card_display_config';

function loadCardDisplayConfig() {
  try {
    const saved = localStorage.getItem(CARD_DISPLAY_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e){}
  return { showAuthor: true, showProgress: true, showRating: true, showCategory: true };
}

state.cardDisplayConfig = loadCardDisplayConfig();

function toggleCardInfoSetting(settingKey, isChecked) {
  if (!state.cardDisplayConfig) state.cardDisplayConfig = loadCardDisplayConfig();
  state.cardDisplayConfig[settingKey] = !!isChecked;
  localStorage.setItem(CARD_DISPLAY_KEY, JSON.stringify(state.cardDisplayConfig));
  
  updateCardPreviewSample();
  renderLibraryGrid();
  showToast('Card display updated');
}

function updateCardPreviewSample() {
  const cfg = state.cardDisplayConfig || loadCardDisplayConfig();
  const authorEl = document.getElementById('samplePreviewAuthor');
  const progEl = document.getElementById('samplePreviewProgress');
  if (authorEl) authorEl.style.display = cfg.showAuthor !== false ? 'block' : 'none';
  if (progEl) progEl.style.display = cfg.showProgress !== false ? 'block' : 'none';

  const tAuthor = document.getElementById('toggleCardAuthor');
  const tProg = document.getElementById('toggleCardProgress');
  const tRating = document.getElementById('toggleCardRating');
  const tCat = document.getElementById('toggleCardCategory');
  if (tAuthor) tAuthor.checked = cfg.showAuthor !== false;
  if (tProg) tProg.checked = cfg.showProgress !== false;
  if (tRating) tRating.checked = cfg.showRating !== false;
  if (tCat) tCat.checked = cfg.showCategory !== false;
}

// ==========================================================================
// MIND & FOCUS BOOKS TRACKER — MODERN NATIVE APP ENGINE (v0.0.5)
// ==========================================================================

const APP_VERSION = '0.0.5';
const CURRENT_APP_VERSION = 'v0.0.5';
const STORAGE_KEY = 'mind_focus_books_v1';
const PIN_KEY = 'mind_focus_pin_v1';
const PROFILE_KEY = 'mind_focus_profile_v1';
const STATS_KEY = 'mind_focus_stats_v1';
const HOME_SECS_KEY = 'mf_home_sections_config';
const BOOK_ORDER_KEY = 'mf_custom_book_order';
const LAYOUT_KEY = 'mf_library_layout_mode';
const SHELVES_KEY = 'mf_custom_shelves';
const COLS_KEY = 'mf_library_cols';

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
  sortBy: 'custom', // Default to custom order
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
    readingStreak: 0,
    totalMinutesRead: 0,
    lastReadDate: ''
  },
  // Adjustments & Instagram Settings State (v0.0.4)
  homeSections: [],
  customBookOrder: [],
  libraryColumns: parseInt(localStorage.getItem('mf_library_cols'), 10) || 3,
  libraryLayout: localStorage.getItem(LAYOUT_KEY) || 'grid3',
  customShelves: [],
  activeShelfFilter: null,
  activeShelfForDetail: null
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
  loadLendingRecords();
  loadAdjustmentConfigs();
  applyTheme(state.theme);
  
  // Security PIN Check
  if (state.pin && state.pin.length === 4) {
    lockApp();
  }
  
  // Set default Currently Reading book if none selected
  ensureCurrentlyReadingBook();
  
  // Apply Home Sections Config
  applyHomeSectionsConfig();

  // Initial Renders
  renderApp();
  
  // Check for in-app updates in background immediately on startup
  setTimeout(checkForBackgroundUpdates, 300);
  setTimeout(checkRemoteBroadcastNotice, 600);
}

// Ensure at least one book is currently reading
function ensureCurrentlyReadingBook() {
  if (!state.books || state.books.length === 0) return;
  const activeBooks = state.books.filter(b => !b.notInterested);
  const readingBook = activeBooks.find(b => b.status === 'READING');
  if (readingBook) {
    state.currentBookIndex = state.books.indexOf(readingBook);
    state.currentBook = readingBook;
  } else if (activeBooks.length > 0) {
    state.currentBookIndex = state.books.indexOf(activeBooks[0]);
    state.currentBook = activeBooks[0];
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
      const parsed = JSON.parse(saved);
      // Clean up legacy hardcoded 7470 / 7 streak if user hasn't finished books
      if (parsed.totalMinutesRead === 7470 && parsed.readingStreak === 7) {
        parsed.totalMinutesRead = 0;
        parsed.readingStreak = 0;
      }
      state.stats = Object.assign(state.stats, parsed);
    }
  } catch (e) {}
}

function getTodayLocalDate(dateObj) {
  const d = dateObj || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDaysElapsed(startDateStr, endDateStr) {
  if (!startDateStr) return 0;
  try {
    const endStr = endDateStr || getTodayLocalDate();
    const p1 = String(startDateStr).split('-').map(Number);
    const p2 = String(endStr).split('-').map(Number);
    if (p1.length < 3 || p2.length < 3) return 0;
    const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
    const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
    const diffMs = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    return Math.max(0, diffDays); // 4 Oct to 4 Oct = 0 Days, 4 Oct to 5 Oct = 1 Day
  } catch (e) {
    return 0;
  }
}

// Auto-detect system clock / laptop date change every 1 second and live refresh UI!
let __lastKnownSystemDate__ = getTodayLocalDate();
setInterval(() => {
  const cur = getTodayLocalDate();
  if (cur !== __lastKnownSystemDate__) {
    __lastKnownSystemDate__ = cur;
    if (state.activeTab === 'home') {
      renderHomeView();
    }
    const detailView = document.getElementById('viewBookDetail');
    if (detailView && detailView.classList.contains('active') && state.currentBook) {
      openBookDetailView(state.currentBook);
    }
  }
}, 1000);

function saveStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(state.stats));
  } catch (e) {}
}

function recordReadingSession(minutes) {
  if (!minutes || minutes <= 0) return;
  state.stats.totalMinutesRead = (state.stats.totalMinutesRead || 0) + minutes;
  
  const today = getTodayLocalDate();
  if (state.stats.lastReadDate !== today) {
    const yesterday = getTodayLocalDate(new Date(Date.now() - 86400000));
    if (state.stats.lastReadDate === yesterday) {
      state.stats.readingStreak = (state.stats.readingStreak || 0) + 1;
    } else {
      state.stats.readingStreak = 1;
    }
    state.stats.lastReadDate = today;
  }
  saveStats();
  renderHomeStats();
  const elS = document.getElementById('profileStatStreak');
  if (elS) elS.innerText = state.stats.readingStreak || 0;
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
    
    // Ensure all books have proper defaults (Rating = 0 unless user rated, Price = 0 unless user-set)
    const priceSanitized = localStorage.getItem('mf_price_sanitized_v3_20_final');
    books.forEach((b, idx) => {
      if (!b.no && !b.book_no) b.no = `book ${idx + 1}`;
      if (!b.rating) b.rating = 0;
      if (!b.current_page) b.current_page = 0;
      if (!b.pages && !b.total_pages) b.pages = 250;
      else if (!b.pages && b.total_pages) b.pages = b.total_pages;
      
      // Strict Price Enforcement: Reset all prices to 0 unless explicitly marked user-set
      if (!priceSanitized && !b.price_user_set) {
        b.price = 0;
      }
    });
    
    if (!priceSanitized) {
      localStorage.setItem('mf_price_sanitized_v3_20_final', 'true');
    }
    
    state.books = books;
    saveBooks();
  } catch (e) {
    console.error('Failed to load books:', e);
    if (typeof DEFAULT_BOOKS !== 'undefined') state.books = DEFAULT_BOOKS;
  }
}

function resetAllBookPricesToZero() {
  if (confirm('Reset prices of all books to ₹0?\n\n(Only books where you explicitly add a price will show a cost in your budget).')) {
    state.books.forEach(b => {
      b.price = 0;
      b.price_user_set = false;
    });
    saveBooks();
    renderReadingBudget();
    renderLibrary();
    showToast('All book prices reset to ₹0! 💰');
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
  
  const today = getTodayLocalDate();
  const total = book.pages || book.total_pages || 200;
  const current = book.current_page || 0;
  const pct = Math.min(100, Math.round((current / total) * 100));
  
  const titleEl = document.getElementById('homeCrTitle');
  if (titleEl) titleEl.innerText = book.title;
  
  // Calculate active reading days spent for currently reading book
  const startD = book.start_date || today;
  const daysSpent = (book.status === 'DONE') ? (book.count_days != null ? book.count_days : 0) : calculateDaysElapsed(startD, today);
  
  const subtitleEl = document.getElementById('homeCrSubtitle');
  if (subtitleEl) {
    subtitleEl.innerHTML = `
      <span>${pct}% completed (${current}/${total} pages)</span>
      <span style="display:inline-block; margin-left:6px; padding:2px 8px; border-radius:10px; background:rgba(245,158,11,0.18); color:var(--accent-gold); font-weight:700; font-size:11px;">
        ⏳ ${daysSpent} Day${daysSpent === 1 ? '' : 's'} Spent
      </span>
      <span style="display:inline-block; margin-left:4px; padding:2px 8px; border-radius:10px; background:rgba(16,185,129,0.18); color:var(--accent-emerald); font-weight:700; font-size:11px;">
        📅 ${formatDateDisplay(today)}
      </span>
    `;
  }
  
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
  const reading = state.books.filter(b => b.status === 'READING').length;
  const pending = Math.max(0, total - finished - reading);
  
  const today = getTodayLocalDate();
  const activeReadingBook = state.books.find(b => b.status === 'READING') || state.currentBook;
  let activeDays = 0;
  if (activeReadingBook && activeReadingBook.status === 'READING') {
    activeDays = calculateDaysElapsed(activeReadingBook.start_date || today, today);
  }
  const displayStreak = Math.max(state.stats.readingStreak || 0, activeDays);
  
  // 1. Compact KPI Bar
  const kpiDone = document.getElementById('kpiDoneCount');
  if (kpiDone) kpiDone.innerText = finished;
  const kpiRead = document.getElementById('kpiReadingCount');
  if (kpiRead) kpiRead.innerText = reading;
  const kpiPend = document.getElementById('kpiPendingCount');
  if (kpiPend) kpiPend.innerText = pending;
  const kpiStrk = document.getElementById('kpiStreakVal');
  if (kpiStrk) kpiStrk.innerText = `${displayStreak} Days`;

  // 2. Standard 2x2 Stats Grid
  const statTotal = document.getElementById('statTotalBooks');
  if (statTotal) statTotal.innerText = total;
  
  const statFin = document.getElementById('statFinishedBooks');
  if (statFin) statFin.innerText = finished;
  
  const statStreak = document.getElementById('statReadingStreak');
  if (statStreak) statStreak.innerText = `${displayStreak} days`;
  
  const statTime = document.getElementById('statReadingTime');
  if (statTime) {
    const totalMins = state.stats.totalMinutesRead || 0;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    statTime.innerText = `${hours}h ${mins}m`;
  }
}

function renderHomeRecentBooks() {
  const list = document.getElementById('homeRecentBooksList');
  if (!list) return;
  
  const currentTitle = state.currentBook ? state.currentBook.title : '';
  const filtered = state.books.filter(b => b.title !== currentTitle && !b.notInterested);
  const recent = filtered.slice(0, 12);
  list.innerHTML = recent.map((book) => {
    const originalIndex = state.books.indexOf(book);
    return `
    <div class="recent-book-card" onclick="openBookDetailViewByIndex(${originalIndex >= 0 ? originalIndex : 0})">
      <div class="recent-cover-box">
        <img src="${getBookCoverUrl(book)}" alt="${escapeHtml(book.title)}" onerror="this.src='cover_placeholder.jpg'">
      </div>
      <div class="recent-book-title">${escapeHtml(book.title)}</div>
      <div class="recent-book-cat">${escapeHtml(book.category || 'General')}</div>
    </div>
  `;
  }).join('');
}

// ================= VIEW 2: LIBRARY =================
function renderLibraryView() {
  renderLibraryFilters();
  renderLibraryGrid();
}

function renderLibraryFilters() {
  const activeBooks = state.books.filter(b => !b.notInterested);
  const total = activeBooks.length;
  const reading = activeBooks.filter(b => b.status === 'READING').length;
  const completed = activeBooks.filter(b => b.status === 'DONE').length;
  const wishlist = activeBooks.filter(b => b.status === 'PENDING' || b.status === 'UNREAD' || b.status === 'WISHLIST').length;
  
  const cAll = document.getElementById('countAll');
  if (cAll) cAll.innerText = total;
  const cRead = document.getElementById('countReading');
  if (cRead) cRead.innerText = reading;
  const cComp = document.getElementById('countCompleted');
  if (cComp) cComp.innerText = completed;
  const cWish = document.getElementById('countWishlist');
  if (cWish) cWish.innerText = wishlist;
  
  const catSelect = document.getElementById('libraryCategorySelect');
  if (catSelect) {
    const currentVal = catSelect.value || 'ALL';
    catSelect.innerHTML = '<option value="ALL">All Categories</option>';
    const categories = Array.from(new Set(activeBooks.map(b => b.category).filter(Boolean))).sort();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.innerText = cat;
      if (cat === currentVal) opt.selected = true;
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
  
  // Apply current layout mode & columns (1 to 10)
  const cols = state.libraryColumns || 3;
  const isCompactList = state.libraryLayout === 'compactList';
  
  if (isCompactList) {
    grid.className = 'library-books-grid layout-compact-list';
  } else {
    grid.className = `library-books-grid cols-${cols}`;
    grid.style.setProperty('--lib-cols', cols);
  }
  
  if (typeof updateLibraryColumnsUI === 'function') {
    updateLibraryColumnsUI();
  }

  // Update shelf chip counter/label
  const shelfChip = document.getElementById('chipShelfFilter');
  const countShelvesEl = document.getElementById('countShelves');
  if (countShelvesEl) countShelvesEl.innerText = (state.customShelves || []).length;
  if (shelfChip) {
    if (state.activeShelfFilter) {
      const activeShelfObj = (state.customShelves || []).find(s => s.id === state.activeShelfFilter);
      shelfChip.innerHTML = `${activeShelfObj ? activeShelfObj.icon + ' ' + activeShelfObj.name : '📁 Shelf'} (Filtered)`;
      shelfChip.classList.add('active');
    } else {
      shelfChip.innerHTML = `📁 Shelves (<span id="countShelves">${(state.customShelves || []).length}</span>)`;
      shelfChip.classList.remove('active');
    }
  }

  let filtered = state.books.filter(b => !b.notInterested);
  
  // Custom Shelf Filter
  if (state.activeShelfFilter) {
    const activeShelf = (state.customShelves || []).find(s => s.id === state.activeShelfFilter);
    if (activeShelf && Array.isArray(activeShelf.bookTitles)) {
      filtered = filtered.filter(b => activeShelf.bookTitles.includes(b.title));
    }
  }

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
      (b.category && b.category.toLowerCase().includes(state.searchQuery)) ||
      (b.takeaway && b.takeaway.toLowerCase().includes(state.searchQuery)) ||
      (b.notes && b.notes.toLowerCase().includes(state.searchQuery)) ||
      (b.no && b.no.toLowerCase().includes(state.searchQuery)) ||
      (b.tags && Array.isArray(b.tags) && b.tags.some(t => t.toLowerCase().includes(state.searchQuery)))
    );
  }
  
  // Custom Sequence & Standard Sorting
  if (state.sortBy === 'custom') {
    filtered.sort((a, b) => {
      const order = state.customBookOrder || [];
      const idxA = order.indexOf(a.title);
      const idxB = order.indexOf(b.title);
      const rankA = idxA === -1 ? 999999 : idxA;
      const rankB = idxB === -1 ? 999999 : idxB;
      if (rankA !== rankB) return rankA - rankB;
      return (a.no || 0) - (b.no || 0);
    });
  } else if (state.sortBy === 'title_asc') {
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
      ${state.activeShelfFilter ? '<button type="button" class="btn-gold-pill" style="margin-top:10px;" onclick="clearShelfFilter()">Clear Shelf Filter</button>' : ''}
    </div>`;
    return;
  }
  
  grid.innerHTML = filtered.map(book => {
    const originalIndex = state.books.indexOf(book);
    const total = book.pages || book.total_pages || 200;
    const current = book.current_page || 0;
    const pct = Math.min(100, Math.round((current / total) * 100));
    
    // Compact Horizontal List Mode (1 Row per Book)
    if (isCompactList) {
      return `
        <div class="compact-book-row" onclick="openBookDetailViewByIndex(${originalIndex})">
          <img class="compact-book-thumb" src="${getBookCoverUrl(book)}" alt="${escapeHtml(book.title)}" loading="lazy" onerror="this.src='cover_placeholder.jpg'">
          <div class="compact-book-info">
            <div class="compact-book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</div>
            <div class="compact-book-author">${escapeHtml(book.author || 'Unknown')}</div>
            <div class="compact-book-meta-row">
              <span class="compact-category-tag">${escapeHtml(book.category || 'General')}</span>
              <div class="compact-progress-track">
                <div class="compact-progress-bar" style="width: ${pct}%"></div>
              </div>
              <span class="compact-pct-text">${pct}%</span>
            </div>
          </div>
        </div>
      `;
    }

    // Grid Mode (1 to 10 Columns)
    return `
      <div class="grid-book-card" onclick="openBookDetailViewByIndex(${originalIndex})">
        <div class="grid-cover-wrap">
          <img src="${getBookCoverUrl(book)}" alt="${escapeHtml(book.title)}" loading="lazy" onerror="this.src='cover_placeholder.jpg'">
        </div>
        <div class="grid-book-meta">
          <div class="grid-book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</div>
          ${((!state.cardDisplayConfig || state.cardDisplayConfig.showAuthor !== false) && cols <= 5) ? `<div class="grid-book-author">${escapeHtml(book.author || 'Unknown')}</div>` : ''}
          ${((!state.cardDisplayConfig || state.cardDisplayConfig.showProgress !== false) && cols <= 5) ? `
          <div class="grid-progress-wrap">
            <div class="grid-progress-bar">
              <div class="grid-progress-fill" style="width: ${pct}%"></div>
            </div>
            <span class="grid-progress-text">${pct}%</span>
          </div>` : ''}
          ${((!state.cardDisplayConfig || state.cardDisplayConfig.showRating !== false) && Number(book.rating) > 0 && cols <= 4) ? `
          <div style="font-size:0.7rem; color:var(--accent-gold); font-weight:700; margin-top:2px;">★ ${(Number(book.rating)).toFixed(1)}</div>` : ''}</div>
      </div>
    `;
  }).join('');
}

function toggleHomeSectionVisibility(secId, isVisible) {
  const target = (state.homeSections || []).find(s => s.id === secId);
  if (target) {
    target.visible = !!isVisible;
    localStorage.setItem(HOME_SECS_KEY, JSON.stringify(state.homeSections));
    applyHomeSectionsConfig();
    showToast(`${target.name} ${isVisible ? 'shown' : 'hidden'} on Home`);
  }
}

function moveHomeSection(secId, direction) {
  const list = state.homeSections || [];
  const idx = list.findIndex(s => s.id === secId);
  if (idx < 0) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= list.length) return;

  const temp = list[idx];
  list[idx] = list[targetIdx];
  list[targetIdx] = temp;

  localStorage.setItem(HOME_SECS_KEY, JSON.stringify(list));
  applyHomeSectionsConfig();
  renderHomeSectionsAdjustView();
  showToast('Home section reordered');
}

function resetHomeSectionsToDefault() {
  state.homeSections = JSON.parse(JSON.stringify(DEFAULT_HOME_SECTIONS));
  localStorage.setItem(HOME_SECS_KEY, JSON.stringify(state.homeSections));
  applyHomeSectionsConfig();
  renderHomeSectionsAdjustView();
  showToast('Home sections reset to default');
}

// --------------------------------------------------------------------------
// FEATURE 1: BOOK SEQUENCE & REORDERING STUDIO
// --------------------------------------------------------------------------
let currentBookOrderQuery = '';

function renderBookOrderStudioView(filterQuery) {
  const container = document.getElementById('bookOrderRankList');
  if (!container) return;

  // Active books only
  let activeBooks = (state.books || []).filter(b => !b.notInterested);

  // Initialize customBookOrder if empty
  if (!state.customBookOrder || state.customBookOrder.length === 0) {
    state.customBookOrder = activeBooks.map(b => b.title);
  }

  // Sort books by customBookOrder
  activeBooks.sort((a, b) => {
    const idxA = state.customBookOrder.indexOf(a.title);
    const idxB = state.customBookOrder.indexOf(b.title);
    const rankA = idxA === -1 ? 999999 : idxA;
    const rankB = idxB === -1 ? 999999 : idxB;
    return rankA - rankB;
  });

  const q = (filterQuery !== undefined ? filterQuery : currentBookOrderQuery).toLowerCase().trim();
  let displayedBooks = activeBooks;
  if (q) {
    displayedBooks = activeBooks.filter(b => 
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
  }

  if (displayedBooks.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary); font-size:0.88rem;">No matching books found for "${escapeHtml(q)}".</div>`;
    return;
  }

  container.innerHTML = displayedBooks.map(book => {
    const rankIndex = state.customBookOrder.indexOf(book.title);
    const displayRank = rankIndex >= 0 ? rankIndex + 1 : activeBooks.indexOf(book) + 1;

    let rankBadgeClass = '';
    let rankLabel = `#${displayRank}`;
    let cardRankClass = '';

    if (displayRank === 1) {
      cardRankClass = 'top-rank-1';
      rankBadgeClass = 'gold';
      rankLabel = `👑 #1`;
    } else if (displayRank === 2) {
      cardRankClass = 'top-rank-2';
      rankBadgeClass = 'gold';
      rankLabel = `⭐ #2`;
    } else if (displayRank === 3) {
      cardRankClass = 'top-rank-3';
      rankBadgeClass = 'gold';
      rankLabel = `⭐ #3`;
    }

    return `
      <div class="book-rank-card ${cardRankClass}">
        <div class="rank-badge ${rankBadgeClass}" onclick="promptSetBookRank('${escapeHtml(book.title)}')" title="Tap to enter custom rank">${rankLabel}</div>
        <img class="compact-book-thumb" src="${getBookCoverUrl(book)}" alt="${escapeHtml(book.title)}" onerror="this.src='cover_placeholder.jpg'" style="width:40px; height:56px; border-radius:8px; object-fit:cover; box-shadow:0 3px 10px rgba(0,0,0,0.4);">
        <div class="compact-book-info" style="flex:1; min-width:0;">
          <div class="compact-book-title" style="font-size:0.9rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(book.title)}</div>
          <div class="compact-book-author" style="font-size:0.75rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(book.author || 'Unknown')}</div>
        </div>
        <div class="rank-actions" style="display:flex; align-items:center; gap:6px;">
          ${displayRank !== 1 ? `
            <button type="button" class="btn-make-top" onclick="pinBookToTop('${escapeHtml(book.title)}')" title="Make #1 in Library">🔝 #1</button>
          ` : `
            <span style="font-size:0.72rem; color:var(--accent-gold); font-weight:800; padding:4px 8px; background:rgba(245,158,11,0.15); border-radius:6px;">TOP</span>
          `}
          <button type="button" class="btn-rank-move" onclick="moveBookInCustomOrder('${escapeHtml(book.title)}', -1)" title="Move Up" ${displayRank === 1 ? 'disabled style="opacity:0.25; cursor:not-allowed;"' : ''}>▲</button>
          <button type="button" class="btn-rank-move" onclick="moveBookInCustomOrder('${escapeHtml(book.title)}', 1)" title="Move Down">▼</button>
        </div>
      </div>
    `;
  }).join('');
}

function pinBookToTop(bookTitle) {
  ensureCustomOrderArray();
  const list = state.customBookOrder;
  const idx = list.indexOf(bookTitle);
  if (idx >= 0) {
    list.splice(idx, 1);
  }
  list.unshift(bookTitle);

  localStorage.setItem(BOOK_ORDER_KEY, JSON.stringify(list));
  saveBooks();
  renderBookOrderStudioView();
  renderLibraryGrid();
  showToast(`👑 "${bookTitle}" is now #1 in your library!`);
}

function filterBookOrderStudio(query) {
  currentBookOrderQuery = query || '';
  renderBookOrderStudioView(currentBookOrderQuery);
}

function ensureCustomOrderArray() {
  if (!state.customBookOrder || state.customBookOrder.length === 0) {
    state.customBookOrder = (state.books || []).map(b => b.title);
  }
}

function moveBookInCustomOrder(bookTitle, direction) {
  ensureCustomOrderArray();
  const list = state.customBookOrder;
  let idx = list.indexOf(bookTitle);

  if (idx < 0) {
    list.push(bookTitle);
    idx = list.length - 1;
  }

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= list.length) return;

  const temp = list[idx];
  list[idx] = list[targetIdx];
  list[targetIdx] = temp;

  localStorage.setItem(BOOK_ORDER_KEY, JSON.stringify(list));
  renderBookOrderStudioView();
  renderLibraryGrid();
  showToast(`Moved "${bookTitle.slice(0, 18)}..."`);
}

function pinBookToTop(bookTitle) {
  ensureCustomOrderArray();
  const list = state.customBookOrder;
  const idx = list.indexOf(bookTitle);
  if (idx >= 0) list.splice(idx, 1);
  list.unshift(bookTitle);

  localStorage.setItem(BOOK_ORDER_KEY, JSON.stringify(list));
  renderBookOrderStudioView();
  renderLibraryGrid();
  showToast(`⭐ Pinned "${bookTitle.slice(0, 20)}" to #1!`);
}

function promptSetBookRank(bookTitle) {
  ensureCustomOrderArray();
  const currentRank = state.customBookOrder.indexOf(bookTitle) + 1;
  const total = (state.books || []).length;
  const input = prompt(`Enter desired rank for "${bookTitle}" (1 to ${total}):`, currentRank || 1);
  if (!input) return;

  const newRank = parseInt(input.trim(), 10);
  if (isNaN(newRank) || newRank < 1 || newRank > total) {
    showToast('Please enter a valid rank number');
    return;
  }

  const list = state.customBookOrder;
  const idx = list.indexOf(bookTitle);
  if (idx >= 0) list.splice(idx, 1);
  list.splice(newRank - 1, 0, bookTitle);

  localStorage.setItem(BOOK_ORDER_KEY, JSON.stringify(list));
  renderBookOrderStudioView();
  renderLibraryGrid();
  showToast(`Set "${bookTitle.slice(0, 18)}" as rank #${newRank}`);
}

function resetCustomBookOrder() {
  state.customBookOrder = (state.books || []).map(b => b.title);
  localStorage.setItem(BOOK_ORDER_KEY, JSON.stringify(state.customBookOrder));
  renderBookOrderStudioView();
  renderLibraryGrid();
  showToast('Book sequence reset to default order');
}

// --------------------------------------------------------------------------
// FEATURE 4: DYNAMIC 1 TO 10 CARD SIZES & COLUMNS
// --------------------------------------------------------------------------
function setLibraryColumns(colsVal) {
  const cols = Math.max(1, Math.min(10, parseInt(colsVal, 10) || 3));
  state.libraryColumns = cols;
  state.libraryLayout = 'grid' + cols;
  localStorage.setItem(COLS_KEY, cols);
  localStorage.setItem(LAYOUT_KEY, 'grid' + cols);

  updateLibraryColumnsUI();
  renderLibraryGrid();

  showToast(`Card Size: ${cols} Cards per Row`);
}

function stepLibraryColumns(delta) {
  const cur = state.libraryColumns || 3;
  setLibraryColumns(cur + delta);
}

function toggleLibraryCardSizeStrip() {
  const strip = document.getElementById('libraryCardSizeStrip');
  if (strip) {
    const isHidden = window.getComputedStyle(strip).display === 'none';
    strip.style.display = isHidden ? 'flex' : 'none';
  }
}

function getCardSizeDescription(cols) {
  if (cols === 1) return 'Level 1: 1 Card per Row (Giant Hero Card — Sabse Bada Cover)';
  if (cols === 2) return 'Level 2: 2 Cards per Row (Bada Grid — High Detail)';
  if (cols === 3) return 'Level 3: 3 Cards per Row (Standard Classic Grid)';
  if (cols === 4) return 'Level 4: 4 Cards per Row (Medium Grid)';
  if (cols === 5) return 'Level 5: 5 Cards per Row (Compact Grid)';
  if (cols <= 9) return `Level ${cols}: ${cols} Cards per Row (Mini Gallery Tiles)`;
  return 'Level 10: 10 Cards per Row (Micro Tiles — Ek Screen Par Dher Saari Kitabein!)';
}

function updateLibraryColumnsUI() {
  const cols = state.libraryColumns || 3;
  const isCompactList = state.libraryLayout === 'compactList';

  // Library header button
  const labelBtn = document.getElementById('btnLayoutColsLabel');
  if (labelBtn) {
    labelBtn.innerText = isCompactList ? 'List' : `${cols} Col`;
    labelBtn.classList.toggle('active', !isCompactList);
  }

  const listBtn = document.getElementById('btnLayoutList');
  if (listBtn) listBtn.classList.toggle('active', isCompactList);

  // Strip label & pill highlights
  const displayLabel = document.getElementById('libColsDisplayLabel');
  if (displayLabel) displayLabel.innerText = isCompactList ? 'Compact List Mode' : `${cols} Cards / Row`;

  const pillRow = document.getElementById('libColsPillRow');
  if (pillRow) {
    pillRow.querySelectorAll('.card-size-num-btn').forEach(btn => {
      const btnCol = parseInt(btn.getAttribute('data-col'), 10);
      btn.classList.toggle('active', !isCompactList && btnCol === cols);
    });
  }

  // Settings Studio
  const settingsBadge = document.getElementById('settingsColsBadge');
  if (settingsBadge) settingsBadge.innerText = isCompactList ? 'List Mode' : `${cols} Columns`;

  const settingsRange = document.getElementById('settingsColsRange');
  if (settingsRange) settingsRange.value = cols;

  const settingsDesc = document.getElementById('settingsColsDescription');
  if (settingsDesc) settingsDesc.innerText = isCompactList ? 'Compact horizontal 1-row strips' : getCardSizeDescription(cols);

  const settingsBtnsGrid = document.getElementById('settingsColsButtonsGrid');
  if (settingsBtnsGrid) {
    settingsBtnsGrid.querySelectorAll('.card-size-num-btn').forEach(btn => {
      const btnCol = parseInt(btn.getAttribute('data-set-col'), 10);
      btn.classList.toggle('active', !isCompactList && btnCol === cols);
    });
  }

  const radioList = document.getElementById('radioIndicatorCompactList');
  if (radioList) radioList.innerText = isCompactList ? '🟢' : '⚪';

  const cardList = document.getElementById('layoutChoiceCompactList');
  if (cardList) cardList.style.borderColor = isCompactList ? 'var(--accent-gold)' : 'var(--border-card)';
}

function setLibraryLayout(layoutName) {
  if (layoutName === 'compactList') {
    state.libraryLayout = 'compactList';
    localStorage.setItem(LAYOUT_KEY, 'compactList');
    updateLibraryColumnsUI();
    renderLibraryGrid();
    showToast('Layout changed to Compact List (1 Row)');
    return;
  }

  if (layoutName === 'grid2') {
    setLibraryColumns(2);
    return;
  }
  if (layoutName === 'grid3') {
    setLibraryColumns(3);
    return;
  }

  setLibraryColumns(state.libraryColumns || 3);
}

function renderLibraryLayoutAdjustView() {
  updateLibraryColumnsUI();
  if (typeof updateCardPreviewSample === 'function') updateCardPreviewSample();

  const cols = state.libraryColumns || 3;
  const cardBada = document.getElementById('presetCardBada');
  const cardNormal = document.getElementById('presetCardNormal');
  const cardCompact = document.getElementById('presetCardCompact');
  if (cardBada) cardBada.classList.toggle('active', cols === 2);
  if (cardNormal) cardNormal.classList.toggle('active', cols === 3);
  if (cardCompact) cardCompact.classList.toggle('active', cols === 4);
}

function renderCustomShelvesView() {
  const container = document.getElementById('customShelvesListContainer');
  if (!container) return;

  if (!state.customShelves || state.customShelves.length === 0) {
    state.customShelves = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_SHELVES));
  }

  container.innerHTML = state.customShelves.map(shelf => {
    const bookTitles = shelf.bookTitles || [];
    const count = bookTitles.length;
    
    // Calculate finished books in this shelf
    let finishedCount = 0;
    bookTitles.forEach(t => {
      const b = (state.books || []).find(book => book.title === t);
      if (b && b.status === 'DONE') finishedCount++;
    });
    const pct = count > 0 ? Math.round((finishedCount / count) * 100) : 0;

    return `
      <div class="custom-shelf-card" onclick="openShelfDetail('${shelf.id}')">
        <div class="shelf-card-top">
          <div class="shelf-icon-badge">${shelf.icon || '📁'}</div>
          <button type="button" class="shelf-delete-btn" onclick="event.stopPropagation(); deleteCustomShelf('${shelf.id}')" title="Delete Shelf">✕</button>
        </div>
        <div>
          <div class="shelf-card-title">${escapeHtml(shelf.name)}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span class="shelf-card-count">${count} ${count === 1 ? 'Book' : 'Books'}</span>
            <span style="font-size:0.7rem; color:var(--accent-emerald); font-weight:700;">${finishedCount}/${count} Done (${pct}%)</span>
          </div>
          <div class="shelf-progress-track">
            <div class="shelf-progress-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openCreateShelfModal() {
  const modal = document.getElementById('createShelfModal');
  const input = document.getElementById('newShelfNameInput');
  if (input) input.value = '';
  selectedShelfEmoji = '📁';
  if (modal) modal.style.display = 'flex';
}

function closeCreateShelfModal() {
  const modal = document.getElementById('createShelfModal');
  if (modal) modal.style.display = 'none';
}

function pickShelfEmoji(emoji, el) {
  selectedShelfEmoji = emoji;
  const picker = document.getElementById('shelfEmojiPicker');
  if (picker) {
    picker.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
  }
}

function saveNewCustomShelf() {
  const input = document.getElementById('newShelfNameInput');
  const name = input ? input.value.trim() : '';
  if (!name) {
    showToast('Please enter a shelf name');
    return;
  }

  const newShelf = {
    id: 'shelf-' + Date.now(),
    name,
    icon: selectedShelfEmoji || '📁',
    color: '#f59e0b',
    bookTitles: []
  };

  state.customShelves.push(newShelf);
  localStorage.setItem(SHELVES_KEY, JSON.stringify(state.customShelves));

  closeCreateShelfModal();
  renderCustomShelvesView();
  openShelfDetail(newShelf.id);
  renderLibraryGrid();
  showToast(`New shelf "${name}" created!`);
}

function deleteCustomShelf(shelfId) {
  const shelf = (state.customShelves || []).find(s => s.id === shelfId);
  if (!shelf) return;

  if (!confirm(`Are you sure you want to delete shelf "${shelf.name}"?`)) return;

  state.customShelves = state.customShelves.filter(s => s.id !== shelfId);
  if (state.activeShelfForDetail === shelfId) state.activeShelfForDetail = null;
  if (state.activeShelfFilter === shelfId) state.activeShelfFilter = null;

  localStorage.setItem(SHELVES_KEY, JSON.stringify(state.customShelves));
  const detailBox = document.getElementById('activeShelfDetailBox');
  if (detailBox) detailBox.style.display = 'none';

  renderCustomShelvesView();
  renderLibraryGrid();
  showToast(`Shelf "${shelf.name}" deleted`);
}

function removeBookFromShelf(shelfId, bookTitle) {
  const shelf = (state.customShelves || []).find(s => s.id === shelfId);
  if (!shelf || !shelf.bookTitles) return;

  shelf.bookTitles = shelf.bookTitles.filter(t => t !== bookTitle);
  localStorage.setItem(SHELVES_KEY, JSON.stringify(state.customShelves));

  renderCustomShelvesView();
  renderLibraryGrid();
  showToast(`Removed from "${shelf.name}"`);
}

// Manage books modal inside shelf
let shelfManageSearchQuery = '';

function openManageShelfBooksModal() {
  const shelf = (state.customShelves || []).find(s => s.id === state.activeShelfForDetail);
  if (!shelf) return;

  const modal = document.getElementById('manageShelfBooksModal');
  const titleEl = document.getElementById('manageShelfModalTitle');
  if (titleEl) titleEl.innerText = `Manage Books: ${shelf.name}`;

  const searchInput = document.getElementById('shelfBookSearchInput');
  if (searchInput) searchInput.value = '';
  shelfManageSearchQuery = '';

  renderManageShelfBooksList();
  if (modal) modal.style.display = 'flex';
}

function closeManageShelfBooksModal() {
  const modal = document.getElementById('manageShelfBooksModal');
  if (modal) modal.style.display = 'none';
  renderCustomShelvesView();
  renderLibraryGrid();
}

function filterShelfManageBooks(query) {
  shelfManageSearchQuery = query || '';
  renderManageShelfBooksList();
}

function renderManageShelfBooksList() {
  const shelf = (state.customShelves || []).find(s => s.id === state.activeShelfForDetail);
  const container = document.getElementById('manageShelfBooksList');
  if (!shelf || !container) return;

  let activeBooks = (state.books || []).filter(b => !b.notInterested);
  const q = shelfManageSearchQuery.toLowerCase().trim();
  if (q) {
    activeBooks = activeBooks.filter(b => 
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q))
    );
  }

  container.innerHTML = activeBooks.map(book => {
    const isChecked = (shelf.bookTitles || []).includes(book.title);
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(255,255,255,0.04); border:1px solid ${isChecked ? 'var(--accent-gold)' : 'var(--border-subtle)'}; border-radius:12px; padding:8px 12px; cursor:pointer;" onclick="toggleBookInShelf('${shelf.id}', '${escapeHtml(book.title)}')">
        <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
          <img src="${getBookCoverUrl(book)}" style="width:36px; height:50px; border-radius:6px; object-fit:cover;" onerror="this.src='cover_placeholder.jpg'">
          <div style="min-width:0; flex:1;">
            <div style="font-size:0.88rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(book.title)}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(book.author || 'Unknown')}</div>
          </div>
        </div>
        <input type="checkbox" ${isChecked ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--accent-gold); cursor:pointer;" onclick="event.stopPropagation(); toggleBookInShelf('${shelf.id}', '${escapeHtml(book.title)}')">
      </div>
    `;
  }).join('');
}

function toggleBookInShelf(shelfId, bookTitle) {
  const shelf = (state.customShelves || []).find(s => s.id === shelfId);
  if (!shelf) return;
  if (!Array.isArray(shelf.bookTitles)) shelf.bookTitles = [];

  const idx = shelf.bookTitles.indexOf(bookTitle);
  if (idx >= 0) {
    shelf.bookTitles.splice(idx, 1);
  } else {
    shelf.bookTitles.push(bookTitle);
  }

  localStorage.setItem(SHELVES_KEY, JSON.stringify(state.customShelves));
  renderManageShelfBooksList();
}

// Quick Shelf filter dropdown on Library screen
function openShelfSelectorDropdown() {
  const modal = document.getElementById('shelfSelectorDropdownModal');
  const container = document.getElementById('shelfSelectorDropdownList');
  if (!modal || !container) return;

  const shelves = state.customShelves || [];
  container.innerHTML = `
    <div style="padding:10px 14px; background:${!state.activeShelfFilter ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${!state.activeShelfFilter ? 'var(--accent-gold)' : 'var(--border-subtle)'}; border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:space-between;" onclick="filterLibraryByShelf(null)">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.2rem;">📚</span>
        <span style="font-weight:700; color:#fff; font-size:0.92rem;">Show All Books (No Shelf Filter)</span>
      </div>
      ${!state.activeShelfFilter ? '<span>✓</span>' : ''}
    </div>
    ${shelves.map(shelf => {
      const isSelected = state.activeShelfFilter === shelf.id;
      return `
        <div style="padding:10px 14px; background:${isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}; border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:space-between;" onclick="filterLibraryByShelf('${shelf.id}')">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.2rem;">${shelf.icon || '📁'}</span>
            <div>
              <div style="font-weight:700; color:#fff; font-size:0.92rem;">${escapeHtml(shelf.name)}</div>
              <div style="font-size:0.75rem; color:var(--text-secondary);">${(shelf.bookTitles || []).length} Books</div>
            </div>
          </div>
          ${isSelected ? '<span>✓</span>' : ''}
        </div>
      `;
    }).join('')}
  `;

  modal.style.display = 'flex';
}

function closeShelfSelectorDropdown() {
  const modal = document.getElementById('shelfSelectorDropdownModal');
  if (modal) modal.style.display = 'none';
}

function filterLibraryByShelf(shelfId) {
  state.activeShelfFilter = shelfId;
  closeShelfSelectorDropdown();
  renderLibraryGrid();
  if (shelfId) {
    const shelf = (state.customShelves || []).find(s => s.id === shelfId);
    showToast(`Filtering by shelf: ${shelf ? shelf.name : ''}`);
  } else {
    showToast('Cleared shelf filter');
  }
}

function clearShelfFilter() {
  filterLibraryByShelf(null);
}

