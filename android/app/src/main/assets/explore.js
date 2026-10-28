
// ================= VIEW 3: EXPLORE (PROVEN v0.0.45 ULTRA-RELIABLE ENGINE) =================
window._exploreDefaultBooks = [];
window._exploreAPIResults = null;
window._currentSpotlightBook = null;
window._currentActiveDocForModal = null;
window._currentExploreMode = 'trending';
let _exploreSearchDebounce = null;

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

const EXPLORE_CURATED_SPOTLIGHTS = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    year: '2018',
    cover_i: 12539702,
    rating: '4.8 (Global Bestseller)',
    desc: 'An easy & proven way to build good habits and break bad ones. Transform tiny daily actions into remarkable long-term power.',
    pages: 320,
    subject: ['Self-Help', 'Productivity', 'Psychology', 'Personal Growth']
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    year: '2016',
    cover_i: 8314125,
    rating: '4.7 (Cognitive Focus)',
    desc: 'Rules for focused success in a distracted world. Master difficult things quickly and produce elite work without multitasking.',
    pages: 304,
    subject: ['Productivity', 'Mindset', 'Career', 'Focus']
  },
  {
    title: 'The 48 Laws of Power',
    author: 'Robert Greene',
    year: '1998',
    cover_i: 10427845,
    rating: '4.7 (Strategic Mastery)',
    desc: 'Amoral, cunning, ruthless, and instructive. The definitive manual for mastering power and strategy.',
    pages: 452,
    subject: ['Psychology', 'Strategy', 'Power', 'Philosophy']
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    year: '2011',
    cover_i: 7268800,
    rating: '4.6 (Nobel Prize Science)',
    desc: 'A groundbreaking tour of the mind explaining the two systems that drive our decisions.',
    pages: 499,
    subject: ['Brain Science', 'Psychology', 'Economics', 'Decision Making']
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    year: '2020',
    cover_i: 10769396,
    rating: '4.8 (Financial Wisdom)',
    desc: 'Timeless lessons on wealth, greed, and happiness. Doing well with money is about behavior.',
    pages: 256,
    subject: ['Wealth', 'Finance', 'Mindset', 'Behavior']
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    year: '180',
    cover_i: 12836262,
    rating: '4.9 (Stoic Classic)',
    desc: 'Private reflections of the Roman Emperor offering timeless advice on resilience and character.',
    pages: 254,
    subject: ['Philosophy', 'Stoicism', 'Wisdom', 'Mindset']
  }
];

const EXPLORE_SUBJECT_MAP = {
  'ALL':             ['self_help', 'psychology', 'productivity', 'habits', 'philosophy', 'finance', 'fiction', 'science'],
  'Productivity':    ['productivity', 'time_management', 'habits', 'deep_work', 'efficiency', 'goals'],
  'Self Help':       ['self_help', 'personal_development', 'motivation', 'mindset', 'confidence', 'leadership'],
  'Fiction':         ['fiction', 'mystery', 'thriller', 'fantasy', 'adventure', 'novel'],
  'Business':        ['business', 'entrepreneurship', 'economics', 'management', 'investing', 'strategy'],
  'Technology':      ['technology', 'artificial_intelligence', 'computer_science', 'programming', 'future'],
  'Dark Psychology': ['psychology', 'persuasion', 'influence', 'manipulation', 'human_behavior', 'power'],
  'Philosophy':      ['philosophy', 'stoicism', 'ethics', 'wisdom', 'mind', 'meditations']
};

function renderExploreView() {
  renderPopularCategoryCounts();
  initExploreSpotlight();
  loadExploreDefaultBooks((typeof state !== 'undefined' && state.exploreGenre) || 'ALL');
}

function initExploreSpotlight() {
  if (!window._currentSpotlightBook) {
    const randomPick = EXPLORE_CURATED_SPOTLIGHTS[Math.floor(Math.random() * EXPLORE_CURATED_SPOTLIGHTS.length)];
    window._currentSpotlightBook = randomPick;
  }
  updateExploreSpotlightUI(window._currentSpotlightBook);
}

function rotateExploreSpotlight() {
  const current = window._currentSpotlightBook;
  const pool = EXPLORE_CURATED_SPOTLIGHTS.filter(b => !current || b.title !== current.title);
  const next = pool[Math.floor(Math.random() * pool.length)] || EXPLORE_CURATED_SPOTLIGHTS[0];
  window._currentSpotlightBook = next;
  updateExploreSpotlightUI(next);
  if (typeof showToast === 'function') showToast(`Spotlight: ${next.title} ✨`);
}

function updateExploreSpotlightUI(book) {
  if (!book) return;
  const coverImg = document.getElementById('featuredCoverImg');
  const titleEl = document.getElementById('featuredTitle');
  const authorEl = document.getElementById('featuredAuthor');
  const ratingEl = document.getElementById('featuredRatingVal');
  const descEl = document.getElementById('featuredDesc');
  const yearEl = document.getElementById('featuredYearVal');
  const addBtn = document.getElementById('featuredAddActionBtn');

  if (coverImg) {
    coverImg.src = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : 'cover_placeholder.jpg';
    coverImg.onerror = function() { this.onerror = null; this.src = 'cover_placeholder.jpg'; };
  }
  if (titleEl) titleEl.innerText = book.title;
  if (authorEl) authorEl.innerText = book.author;
  if (ratingEl) ratingEl.innerText = book.rating || '4.8 (Global Reader Choice)';
  if (descEl) descEl.innerText = book.desc || 'World renowned reading pick curated for your daily growth.';
  if (yearEl) yearEl.innerText = book.year || 'Classic';

  if (addBtn && typeof state !== 'undefined' && Array.isArray(state.books)) {
    const alreadyAdded = state.books.some(b => b.title && b.title.toLowerCase() === book.title.toLowerCase());
    if (alreadyAdded) {
      addBtn.innerText = '✓ In Library';
      addBtn.style.opacity = '0.75';
    } else {
      addBtn.innerText = '+ Add to Library';
      addBtn.style.opacity = '1';
    }
  }
}

function openCurrentSpotlightDetail() {
  if (!window._currentSpotlightBook) return;
  window._currentActiveDocForModal = {
    title: window._currentSpotlightBook.title,
    author_name: [window._currentSpotlightBook.author],
    cover_i: window._currentSpotlightBook.cover_i,
    first_publish_year: window._currentSpotlightBook.year,
    number_of_pages_median: window._currentSpotlightBook.pages || 300,
    subject: window._currentSpotlightBook.subject || ['Featured']
  };
  renderActiveBookDetailSheet();
}

function addCurrentSpotlightToLibrary() {
  if (!window._currentSpotlightBook) return;
  const spot = window._currentSpotlightBook;
  const doc = {
    title: spot.title,
    author_name: [spot.author],
    cover_i: spot.cover_i,
    first_publish_year: spot.year,
    number_of_pages_median: spot.pages || 300,
    subject: spot.subject || ['Featured']
  };
  addDocToLibrary(doc);
  updateExploreSpotlightUI(spot);
}

function setExploreMode(mode) {
  window._currentExploreMode = mode;
  const pillIds = {
    trending: 'exploreModeTrending',
    bestseller: 'exploreModeBestsellers',
    classics: 'exploreModeClassics',
    mindset: 'exploreModeMindset'
  };
  Object.keys(pillIds).forEach(k => {
    const el = document.getElementById(pillIds[k]);
    if (el) {
      if (k === mode) el.classList.add('active');
      else el.classList.remove('active');
    }
  });

  let keyword = 'trending';
  if (mode === 'bestseller') keyword = 'bestseller';
  else if (mode === 'classics') keyword = 'classic_literature';
  else if (mode === 'mindset') keyword = 'mindset';

  loadExploreDefaultBooks((typeof state !== 'undefined' && state.exploreGenre) || 'ALL', keyword);
}

function refreshExploreFeed() {
  rotateExploreSpotlight();
  loadExploreDefaultBooks((typeof state !== 'undefined' && state.exploreGenre) || 'ALL', null, true);
  if (typeof showToast === 'function') showToast('Explore Feed Refresh Ho Raha Hai... ✨');
}

function triggerSurpriseBook() {
  const pool = EXPLORE_CURATED_SPOTLIGHTS;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  window._currentActiveDocForModal = {
    title: pick.title,
    author_name: [pick.author],
    cover_i: pick.cover_i,
    first_publish_year: pick.year,
    number_of_pages_median: pick.pages,
    subject: pick.subject
  };
  renderActiveBookDetailSheet();
  if (typeof showToast === 'function') showToast(`Surprise Pick: ${pick.title}! 🎲`);
}

function filterExploreCategoryTile(displayName, subjectKey) {
  const titleEl = document.getElementById('exploreGridHeaderTitle');
  if (titleEl) {
    titleEl.innerHTML = `${displayName} <span style="font-size:0.72rem;font-weight:400;color:var(--text-muted);">(Live World Picks)</span>`;
  }
  loadExploreDefaultBooks('ALL', subjectKey, true);
  const grid = document.getElementById('exploreBooksGrid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterExploreGenre(genre) {
  if (typeof state !== 'undefined') state.exploreGenre = genre;
  const chips = document.querySelectorAll('#exploreGenreChips .filter-chip');
  chips.forEach(c => {
    if (c.innerText.trim() === genre || (genre === 'ALL' && c.innerText.trim() === 'All')) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
  loadExploreDefaultBooks(genre, null, true);
}

async function loadExploreDefaultBooks(genre, customSubject = null, forceNewOffset = false) {
  const grid = document.getElementById('exploreBooksGrid');
  const titleEl = document.getElementById('exploreGridHeaderTitle');
  if (!grid) return;

  // Immediate initial curated render — ZERO lag
  window._exploreDefaultBooks = EXPLORE_CURATED_SPOTLIGHTS.map(s => ({
    title: s.title,
    author_name: [s.author],
    cover_i: s.cover_i,
    first_publish_year: s.year,
    number_of_pages_median: s.pages,
    subject: s.subject
  }));

  if (titleEl) {
    titleEl.innerHTML = `${genre === 'ALL' ? 'Explore Recommendations' : genre} <span style="font-size:0.72rem;color:var(--text-muted);">&bull; ${window._exploreDefaultBooks.length} books</span>`;
  }
  grid.innerHTML = window._exploreDefaultBooks.map((doc, idx) => renderExploreBookCard(doc, idx)).join('');

  // Try live fetch in background
  const subjects = EXPLORE_SUBJECT_MAP[genre] || EXPLORE_SUBJECT_MAP['ALL'];
  const subject = customSubject || subjects[Math.floor(Math.random() * subjects.length)];
  const offset = Math.floor(Math.random() * 40);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const url = `https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}&limit=15&offset=${offset}&fields=key,title,author_name,cover_i,number_of_pages_median,subject,first_publish_year&language=eng`;
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!resp.ok) throw new Error('API failed');
    const data = await resp.json();
    const docs = (data.docs || []).filter(d => d.title);
    if (docs.length > 0) {
      window._exploreDefaultBooks = docs;
      grid.innerHTML = docs.map((doc, idx) => renderExploreBookCard(doc, idx)).join('');
    }
  } catch(e) {
    // Fallback stays rendered, zero blank screens
  }
}

function renderExploreBookCard(doc, idx) {
  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverId = doc.cover_i;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'cover_placeholder.jpg';
  const year = doc.first_publish_year || '';
  const pages = doc.number_of_pages_median || '';
  const alreadyAdded = (typeof state !== 'undefined' && Array.isArray(state.books)) ? state.books.some(b => b.title && b.title.toLowerCase() === title.toLowerCase()) : false;

  return `
    <div class="grid-book-card" style="cursor:pointer;position:relative;" onclick="openExploreBookDetail(${idx})">
      <div class="grid-cover-wrap explore-cover-3d-wrap" style="height:148px;overflow:hidden;border-radius:10px 10px 0 0;position:relative;background:#1e293b;">
        <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(title)}" loading="lazy"
          onerror="this.onerror=null;this.src='cover_placeholder.jpg'"
          style="width:100%;height:148px;object-fit:cover;">
        ${alreadyAdded ? `<div style="position:absolute;top:6px;right:6px;background:linear-gradient(135deg, #10b981, #059669);color:#fff;font-size:0.62rem;font-weight:800;padding:3px 7px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.5);">✓ Added</div>` : ''}
        ${pages ? `<div style="position:absolute;bottom:6px;left:6px;background:rgba(0,0,0,0.65);color:#e2e8f0;font-size:0.6rem;padding:2px 6px;border-radius:6px;">📖 ${pages}p</div>` : ''}
      </div>
      <div class="grid-book-meta" style="padding:8px 9px 10px;">
        <div class="grid-book-title" style="font-size:0.82rem;font-weight:700;line-height:1.25;margin-bottom:3px;color:var(--text-primary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(title)}</div>
        <div class="grid-book-author" style="font-size:0.72rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(author)}${year ? ' · ' + year : ''}</div>
      </div>
    </div>`;
}

function openExploreBookDetail(idx) {
  const docs = window._exploreDefaultBooks;
  if (!docs || !docs[idx]) return;
  window._currentActiveDocForModal = docs[idx];
  renderActiveBookDetailSheet();
}

function openExploreSearchBookDetail(idx) {
  const docs = window._exploreAPIResults;
  if (!docs || !docs[idx]) return;
  window._currentActiveDocForModal = docs[idx];
  renderActiveBookDetailSheet();
}

function renderActiveBookDetailSheet() {
  const doc = window._currentActiveDocForModal;
  if (!doc) return;

  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverId = doc.cover_i;
  const coverLarge = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : 'cover_placeholder.jpg';
  const pages = doc.number_of_pages_median || 280;
  const year = doc.first_publish_year || 'Classic';
  const subjects = (doc.subject || []).slice(0, 6).join(' &bull; ') || 'World Literature &bull; Self Growth';
  const alreadyAdded = (typeof state !== 'undefined' && Array.isArray(state.books)) ? state.books.some(b => b.title && b.title.toLowerCase() === title.toLowerCase()) : false;

  let modal = document.getElementById('exploreBookDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'exploreBookDetailModal';
    document.body.appendChild(modal);
  }

  modal.onclick = (e) => { if (e.target === modal) closeExploreBookDetail(); };
  modal.className = 'explore-detail-modal-container';
  modal.style.cssText = 'display:flex !important;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:999999;background:rgba(0,0,0,0.85);align-items:flex-end;justify-content:center;';

  modal.innerHTML = `
    <div class="explore-detail-sheet" onclick="event.stopPropagation()" style="background:linear-gradient(170deg,#131722 0%,#0a0d16 100%);border:1px solid rgba(255,255,255,0.12);border-radius:26px 26px 0 0;max-height:90vh;width:100%;max-width:540px;overflow-y:auto;padding:0 0 35px 0;box-shadow:0 -15px 50px rgba(0,0,0,0.8);">
      
      <!-- Handle bar -->
      <div style="display:flex;justify-content:center;padding:12px 0 6px;">
        <div style="width:42px;height:5px;background:rgba(255,255,255,0.2);border-radius:3px;"></div>
      </div>

      <!-- Close row -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 20px 10px;">
        <span style="font-size:0.68rem;letter-spacing:1px;font-weight:800;color:#fbbf24;text-transform:uppercase;">Book Dossier &bull; World Discovery</span>
        <button onclick="closeExploreBookDetail()" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
      </div>

      <!-- Cover + Hero Meta -->
      <div style="display:flex;gap:18px;padding:8px 20px 16px;">
        <div style="flex-shrink:0;">
          <img src="${escapeHtml(coverLarge)}" onerror="this.onerror=null;this.src='cover_placeholder.jpg'" style="width:115px;height:165px;object-fit:cover;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.6);">
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;">
          <h2 style="font-size:1.1rem;font-weight:800;line-height:1.3;margin:0 0 6px 0;color:#ffffff;">${escapeHtml(title)}</h2>
          <div style="font-size:0.86rem;color:#fbbf24;font-weight:700;margin-bottom:10px;">by ${escapeHtml(author)}</div>
          
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
            <span style="font-size:0.72rem;padding:3px 9px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#cbd5e1;">📅 ${year}</span>
            <span style="font-size:0.72rem;padding:3px 9px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#cbd5e1;">📖 ~${pages} Pages</span>
            <span style="font-size:0.72rem;padding:3px 9px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.35);border-radius:12px;color:#fbbf24;">⭐ 4.8 Rating</span>
          </div>

          <div style="font-size:0.72rem;color:#94a3b8;line-height:1.45;">
            <strong style="color:#e2e8f0;">Genres:</strong> ${escapeHtml(subjects)}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="padding:10px 20px 10px;display:flex;flex-direction:column;gap:10px;">
        <button onclick="openExploreDocInFullPage()" style="width:100%;padding:14px;background:linear-gradient(135deg, #10b981, #059669);color:#ffffff;border:none;border-radius:14px;font-size:0.92rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(16,185,129,0.35);letter-spacing:0.3px;">
          📖 Open Full Book Page & Read
        </button>

        ${alreadyAdded
          ? `<div style="text-align:center;padding:12px;background:rgba(16,185,129,0.15);border:1px solid #10b981;border-radius:12px;color:#10b981;font-weight:700;font-size:0.88rem;">✓ Already in Your Library</div>`
          : `<button onclick="addCurrentActiveDocToLibrary()" id="exploreModalAddBtn"
              style="width:100%;padding:12px;background:rgba(245,158,11,0.18);border:1.5px solid #f59e0b;color:#fbbf24;border-radius:14px;font-size:0.88rem;font-weight:800;cursor:pointer;">
              + Add to My Library
            </button>`
        }
      </div>

      <!-- Quick Actions: Notes & Close -->
      <div style="padding:0 20px;display:flex;gap:10px;">
        <button onclick="saveQuickNoteFromExplore()"
          style="flex:1;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#e2e8f0;font-size:0.82rem;font-weight:700;cursor:pointer;">
          <span>📝 Quick Note</span>
        </button>
        <button onclick="closeExploreBookDetail()"
          style="flex:1;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#94a3b8;font-size:0.82rem;font-weight:700;cursor:pointer;">
          <span>✕ Close</span>
        </button>
      </div>

    </div>
  `;
}

function openExploreDocInFullPage() {
  const doc = window._currentActiveDocForModal;
  if (!doc) return;
  closeExploreBookDetail();

  const title = doc.title || 'Untitled Book';
  let book = (typeof state !== 'undefined' && Array.isArray(state.books)) ? state.books.find(b => b.title && b.title.toLowerCase() === title.toLowerCase()) : null;

  if (!book) {
    addDocToLibrary(doc);
    book = state.books.find(b => b.title && b.title.toLowerCase() === title.toLowerCase());
  }

  if (book && typeof openBookDetailView === 'function') {
    openBookDetailView(book);
  }
}

function addCurrentActiveDocToLibrary() {
  const doc = window._currentActiveDocForModal;
  if (!doc) return;
  addDocToLibrary(doc);
  const btn = document.getElementById('exploreModalAddBtn');
  if (btn) {
    btn.outerHTML = `<div style="text-align:center;padding:12px;background:rgba(16,185,129,0.15);border:1px solid #10b981;border-radius:12px;color:#10b981;font-weight:700;font-size:0.88rem;">✓ Added to Library!</div>`;
  }
}

function addDocToLibrary(doc) {
  if (!doc) return;
  const title = doc.title || 'Untitled Book';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown';
  const coverId = doc.cover_i;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '';
  const pages = doc.number_of_pages_median || 280;

  if (typeof state !== 'undefined' && Array.isArray(state.books)) {
    if (state.books.some(b => b.title && b.title.toLowerCase() === title.toLowerCase())) {
      if (typeof showToast === 'function') showToast('Ye kitab pehle se hi library me hai! 📚');
      return;
    }

    const newBook = {
      id: Date.now(),
      title: title,
      author: author,
      cover: coverUrl,
      cover_image: coverUrl,
      pages: pages,
      total_pages: pages,
      current_page: 0,
      status: 'WANT_TO_READ',
      category: (doc.subject && doc.subject[0]) || 'General',
      rating: 0,
      notes: '',
      quotes: [],
      vocabulary: [],
      dateAdded: new Date().toISOString(),
      notInterested: false
    };

    state.books.push(newBook);
    if (typeof saveBooks === 'function') saveBooks();
    if (typeof showToast === 'function') showToast(`"${title}" aapki Library me add ho gayi! 📖✨`);
    
    // Refresh card badge
    const grid = document.getElementById('exploreBooksGrid');
    if (grid && window._exploreDefaultBooks) {
      grid.innerHTML = window._exploreDefaultBooks.map((d, i) => renderExploreBookCard(d, i)).join('');
    }
  }
}

function saveQuickNoteFromExplore() {
  const doc = window._currentActiveDocForModal;
  if (!doc) return;
  closeExploreBookDetail();
  openExploreDocInFullPage();
}

function closeExploreBookDetail() {
  const modal = document.getElementById('exploreBookDetailModal');
  if (modal) {
    modal.style.display = 'none';
    modal.innerHTML = '';
  }
}

// ================= LIVE GLOBAL SEARCH =================

function handleExploreSearch(val) {
  if (typeof state !== 'undefined') state.exploreSearchQuery = val.trim().toLowerCase();
}

function handleExploreSearchLive(val) {
  const clearBtn = document.getElementById('exploreSearchClearBtn');
  if (clearBtn) clearBtn.style.display = val.length > 0 ? 'block' : 'none';
  clearTimeout(_exploreSearchDebounce);
  if (val.trim().length === 0) {
    clearExploreSearch();
    return;
  }
  _exploreSearchDebounce = setTimeout(() => {
    if (val.trim().length >= 2) {
      searchOpenLibrary(val.trim());
    }
  }, 400);
}

function triggerExploreAPISearch() {
  const input = document.getElementById('exploreSearchInput');
  const query = (input ? input.value : '').trim();
  if (!query) {
    if (typeof showToast === 'function') showToast('Dhundhne ke liye kisi kitab ya lekhak ka naam likhein!');
    return;
  }
  searchOpenLibrary(query);
}

async function searchOpenLibrary(query) {
  const statusEl = document.getElementById('exploreAPIStatus');
  const resultsSection = document.getElementById('exploreAPIResultsSection');
  const resultsGrid = document.getElementById('exploreAPIResultsGrid');
  const resultsTitle = document.getElementById('exploreAPIResultsTitle');

  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = '🔍 <em>World Books Search Engine se results fetch ho rahe hain...</em>';
  }
  if (resultsSection) resultsSection.style.display = 'none';

  // 1. Local Search First
  let localMatches = [];
  const qLower = query.toLowerCase();
  if (typeof DEFAULT_BOOKS !== 'undefined' && Array.isArray(DEFAULT_BOOKS)) {
    DEFAULT_BOOKS.forEach(b => {
      if ((b.title && b.title.toLowerCase().includes(qLower)) || (b.author && b.author.toLowerCase().includes(qLower))) {
        localMatches.push({
          title: b.title,
          author_name: [b.author || 'Unknown'],
          cover_i: null,
          number_of_pages_median: b.pages || b.total_pages || 250,
          first_publish_year: b.published_year || 'Classic'
        });
      }
    });
  }

  try {
    const encoded = encodeURIComponent(query);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const url = `https://openlibrary.org/search.json?q=${encoded}&limit=20&fields=key,title,author_name,cover_i,number_of_pages_median,subject,first_publish_year`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json();
      const onlineDocs = data.docs || [];
      onlineDocs.forEach(d => {
        if (!localMatches.some(m => m.title.toLowerCase() === (d.title || '').toLowerCase())) {
          localMatches.push(d);
        }
      });
    }
  } catch (err) {}

  if (statusEl) statusEl.style.display = 'none';

  if (localMatches.length === 0) {
    if (resultsSection) resultsSection.style.display = 'block';
    if (resultsTitle) resultsTitle.innerText = `"${query}" ke liye koi book nahi mili`;
    if (resultsGrid) resultsGrid.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-secondary);grid-column:1/-1;">Koi book nahi mili. Dusra naam try karein.</div>';
    return;
  }

  window._exploreAPIResults = localMatches;
  if (resultsSection) resultsSection.style.display = 'block';
  if (resultsTitle) resultsTitle.innerText = `"${query}" &bull; ${localMatches.length} kitabein mili`;

  if (resultsGrid) {
    resultsGrid.innerHTML = localMatches.map((doc, idx) => {
      const title = doc.title || 'Unknown Title';
      const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
      const coverId = doc.cover_i;
      const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'cover_placeholder.jpg';
      return `
        <div class="grid-book-card" style="cursor:pointer;" onclick="openExploreSearchBookDetail(${idx})">
          <div class="grid-cover-wrap explore-cover-3d-wrap" style="height:148px;overflow:hidden;border-radius:10px 10px 0 0;background:#1e293b;">
            <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(title)}" loading="lazy"
              onerror="this.onerror=null;this.src='cover_placeholder.jpg'"
              style="width:100%;height:148px;object-fit:cover;">
          </div>
          <div class="grid-book-meta" style="padding:8px 9px 10px;">
            <div class="grid-book-title" style="font-size:0.82rem;font-weight:700;line-height:1.25;margin-bottom:3px;color:var(--text-primary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(title)}</div>
            <div class="grid-book-author" style="font-size:0.72rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(author)}</div>
          </div>
        </div>`;
    }).join('');
  }
}

function clearExploreSearch() {
  const input = document.getElementById('exploreSearchInput');
  if (input) input.value = '';
  const clearBtn = document.getElementById('exploreSearchClearBtn');
  if (clearBtn) clearBtn.style.display = 'none';
  const statusEl = document.getElementById('exploreAPIStatus');
  if (statusEl) statusEl.style.display = 'none';
  const resultsSection = document.getElementById('exploreAPIResultsSection');
  if (resultsSection) resultsSection.style.display = 'none';
  window._exploreAPIResults = null;
}

// Global window bindings
window.openExploreBookDetail = openExploreBookDetail;
window.openExploreSearchBookDetail = openExploreSearchBookDetail;
window.renderActiveBookDetailSheet = renderActiveBookDetailSheet;
window.openExploreDocInFullPage = openExploreDocInFullPage;
window.addCurrentActiveDocToLibrary = addCurrentActiveDocToLibrary;
window.addDocToLibrary = addDocToLibrary;
window.saveQuickNoteFromExplore = saveQuickNoteFromExplore;
window.closeExploreBookDetail = closeExploreBookDetail;
window.setExploreMode = setExploreMode;
window.refreshExploreFeed = refreshExploreFeed;
window.triggerSurpriseBook = triggerSurpriseBook;
window.filterExploreCategoryTile = filterExploreCategoryTile;
window.filterExploreGenre = filterExploreGenre;
window.openCurrentSpotlightDetail = openCurrentSpotlightDetail;
window.addCurrentSpotlightToLibrary = addCurrentSpotlightToLibrary;
window.rotateExploreSpotlight = rotateExploreSpotlight;
window.handleExploreSearch = handleExploreSearch;
window.handleExploreSearchLive = handleExploreSearchLive;
window.triggerExploreAPISearch = triggerExploreAPISearch;
window.clearExploreSearch = clearExploreSearch;
window.renderExploreBooksGrid = function() { loadExploreDefaultBooks((typeof state !== 'undefined' && state.exploreGenre) || 'ALL'); };
window.initExploreSpotlight = initExploreSpotlight;
window.updateExploreSpotlightUI = updateExploreSpotlightUI;
window.renderExploreView = renderExploreView;
window.initExploreView = renderExploreView;
