// ================= VIEW 3: EXPLORE (100% WORKING & ZERO-FREEZE ENGINE) =================
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
  // Popular categories removed
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
  const spot = window._currentSpotlightBook;
  open3dBookDossierSheet({
    title: spot.title,
    author_name: [spot.author],
    cover_i: spot.cover_i,
    cover_url: spot.cover_i ? `https://covers.openlibrary.org/b/id/${spot.cover_i}-L.jpg` : 'cover_placeholder.jpg',
    first_publish_year: spot.year,
    number_of_pages_median: spot.pages || 300,
    subject: spot.subject || ['Featured']
  });
}

function addCurrentSpotlightToLibrary() {
  if (!window._currentSpotlightBook) return;
  const spot = window._currentSpotlightBook;
  const doc = {
    title: spot.title,
    author_name: [spot.author],
    cover_i: spot.cover_i,
    cover_url: spot.cover_i ? `https://covers.openlibrary.org/b/id/${spot.cover_i}-L.jpg` : 'cover_placeholder.jpg',
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
  open3dBookDossierSheet({
    title: pick.title,
    author_name: [pick.author],
    cover_i: pick.cover_i,
    cover_url: pick.cover_i ? `https://covers.openlibrary.org/b/id/${pick.cover_i}-L.jpg` : 'cover_placeholder.jpg',
    first_publish_year: pick.year,
    number_of_pages_median: pick.pages,
    subject: pick.subject
  });
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

  // Curated initial books — Instant zero lag
  window._exploreDefaultBooks = EXPLORE_CURATED_SPOTLIGHTS.map(s => ({
    title: s.title,
    author_name: [s.author],
    cover_i: s.cover_i,
    cover_url: s.cover_i ? `https://covers.openlibrary.org/b/id/${s.cover_i}-M.jpg` : 'cover_placeholder.jpg',
    first_publish_year: s.year,
    number_of_pages_median: s.pages,
    subject: s.subject
  }));

  if (titleEl) {
    titleEl.innerHTML = `${genre === 'ALL' ? 'Explore Recommendations' : genre} <span style="font-size:0.72rem;color:var(--text-muted);">&bull; ${window._exploreDefaultBooks.length} books</span>`;
  }
  grid.innerHTML = window._exploreDefaultBooks.map((doc, idx) => renderExploreBookCard(doc, idx)).join('');

  // Try live fetch in background (non-blocking)
  const subjects = EXPLORE_SUBJECT_MAP[genre] || EXPLORE_SUBJECT_MAP['ALL'];
  const subject = customSubject || subjects[Math.floor(Math.random() * subjects.length)];
  const offset = Math.floor(Math.random() * 30);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const url = `https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}&limit=15&offset=${offset}&language=eng`;
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!resp.ok) return;
    const data = await resp.json();
    const docs = (data.docs || []).filter(d => d.title);
    if (docs.length > 0) {
      window._exploreDefaultBooks = docs;
      grid.innerHTML = docs.map((doc, idx) => renderExploreBookCard(doc, idx)).join('');
    }
  } catch(e) {
    // Keep curated list
  }
}

function renderExploreBookCard(doc, idx) {
  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'cover_placeholder.jpg');
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
  open3dBookDossierSheet(docs[idx]);
}

function openExploreSearchBookDetail(idx) {
  const docs = window._exploreAPIResults;
  if (!docs || !docs[idx]) return;
  open3dBookDossierSheet(docs[idx]);
}

// ================= 3D BOOK DOSSIER SHEET (100% RELIABLE & ZERO FREEZE) =================
function open3dBookDossierSheet(doc) {
  if (!doc) return;
  window._currentActiveDocForModal = doc;

  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : 'cover_placeholder.jpg');
  const pages = doc.number_of_pages_median || 280;
  const year = doc.first_publish_year || 'Classic';
  const subjects = (doc.subject || []).slice(0, 5).join(' &bull; ') || 'World Literature &bull; Self Growth';
  const alreadyAdded = (typeof state !== 'undefined' && Array.isArray(state.books)) ? state.books.some(b => b.title && b.title.toLowerCase() === title.toLowerCase()) : false;

  let modal = document.getElementById('exploreBookDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'exploreBookDetailModal';
    document.body.appendChild(modal);
  }

  modal.onclick = (e) => { if (e.target === modal) closeExploreBookDetail(); };
  modal.className = 'explore-detail-modal-container active show';
  modal.style.cssText = 'display:flex !important;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:9999999;background:rgba(4,7,18,0.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);align-items:flex-end;justify-content:center;pointer-events:auto;';

  modal.innerHTML = `
    <div class="explore-dossier-card" onclick="event.stopPropagation()" style="position:relative;background:linear-gradient(165deg,#131a2b 0%,#0a0d17 100%);border:1px solid rgba(245,158,11,0.3);border-radius:28px 28px 0 0;width:100%;max-width:500px;max-height:88vh;overflow-y:auto;padding:14px 18px 36px 18px;box-shadow:0 -10px 45px rgba(0,0,0,0.9),0 0 35px rgba(245,158,11,0.18);">
      
      <!-- Drag Handle -->
      <div class="dossier-drag-handle" style="width:44px;height:5px;background:rgba(255,255,255,0.25);border-radius:99px;margin:0 auto 12px auto;"></div>

      <!-- Header Row -->
      <div class="dossier-top-bar" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <span class="dossier-badge-pill" style="font-size:0.68rem;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;color:#fbbf24;background:rgba(245,158,11,0.18);padding:3px 10px;border-radius:8px;border:1px solid rgba(245,158,11,0.4);">
          ✨ 3D Book Dossier
        </span>
        <button type="button" class="dossier-close-circle" onclick="closeExploreBookDetail()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;width:32px;height:32px;border-radius:50%;font-size:1.1rem;display:flex;align-items:center;justify-content:center;cursor:pointer;">✕</button>
      </div>

      <!-- Hero Row with 3D Cover -->
      <div class="dossier-hero-row" style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px;">
        <div class="dossier-3d-stage" style="perspective:700px;flex-shrink:0;">
          <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(title)}"
            class="dossier-3d-cover"
            onerror="this.onerror=null;this.src='cover_placeholder.jpg'"
            style="width:110px;height:165px;object-fit:cover;border-radius:12px;box-shadow:-10px 14px 28px rgba(0,0,0,0.75), 0 0 20px rgba(245,158,11,0.25);transform:rotateY(-14deg) rotateX(4deg);border:1px solid rgba(255,255,255,0.2);">
        </div>
        <div class="dossier-meta-col" style="flex:1;min-width:0;">
          <h2 class="dossier-title" style="font-size:1.05rem;font-weight:800;line-height:1.3;color:#ffffff;margin:0 0 4px 0;">${escapeHtml(title)}</h2>
          <div class="dossier-author" style="font-size:0.85rem;font-weight:700;color:#fbbf24;margin-bottom:10px;">by ${escapeHtml(author)}</div>
          
          <div class="dossier-tags-wrap" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
            <span class="dossier-tag" style="font-size:0.7rem;font-weight:600;padding:3px 8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#cbd5e1;">📅 ${year}</span>
            <span class="dossier-tag" style="font-size:0.7rem;font-weight:600;padding:3px 8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#cbd5e1;">📖 ~${pages} Pages</span>
            <span class="dossier-tag dossier-tag-gold" style="font-size:0.7rem;font-weight:600;padding:3px 8px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.35);border-radius:8px;color:#fbbf24;">⭐ 4.8 Rating</span>
          </div>

          <div style="font-size:0.72rem;color:#94a3b8;line-height:1.4;">
            <strong style="color:#e2e8f0;">Genres:</strong> ${escapeHtml(subjects)}
          </div>
        </div>
      </div>

      <!-- Action 1: Open Full Book Page & Read -->
      <button type="button" onclick="openExploreDocInFullPage()" style="width:100%;padding:14px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;font-weight:800;font-size:0.95rem;border-radius:14px;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(16,185,129,0.4);letter-spacing:0.3px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px;">
        <span>📖</span>
        <span>Open Full Book Page & Read</span>
      </button>

      <!-- Action 2: Add to My Library -->
      ${alreadyAdded
        ? `<div class="dossier-btn-added" style="width:100%;padding:13px;background:rgba(16,185,129,0.18);border:1.5px solid #10b981;color:#10b981;font-weight:800;font-size:0.9rem;border-radius:14px;text-align:center;margin-bottom:10px;">✓ Already in Your Library</div>`
        : `<button type="button" class="dossier-btn-add" id="exploreModalAddBtn" onclick="addCurrentActiveDocToLibrary()" style="width:100%;padding:13px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#000000;font-weight:800;font-size:0.9rem;border-radius:14px;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(245,158,11,0.45);letter-spacing:0.3px;margin-bottom:10px;">
            + Add to My Library
          </button>`
      }

      <!-- Action 3: Quick Note & Close -->
      <div class="dossier-actions-row" style="display:flex;gap:10px;">
        <button type="button" class="dossier-btn-sub" onclick="saveQuickNoteFromExplore()" style="flex:1;padding:10px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#e2e8f0;font-size:0.8rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">
          <span>📝</span>
          <span>Save Note</span>
        </button>
        <button type="button" class="dossier-btn-sub" onclick="closeExploreBookDetail()" style="flex:1;padding:10px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#94a3b8;font-size:0.8rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">
          <span>✕</span>
          <span>Close</span>
        </button>
      </div>

    </div>
  `;
}

function openExploreDocInFullPage() {
  const doc = window._currentActiveDocForModal;
  if (!doc) {
    if (typeof showToast === 'function') showToast('Book details are not available. Please reopen the book.');
    return;
  }

  const title = String(doc.title || 'Untitled Book');
  let book = (typeof window.state !== 'undefined' && Array.isArray(window.state.books))
    ? window.state.books.find(b => b && b.title && String(b.title).toLowerCase() === title.toLowerCase())
    : null;

  // Only add the book if the app exposes a real library state. Avoid losing the
  // selected Explore record when the module is running standalone.
  if (!book && typeof window.state !== 'undefined' && Array.isArray(window.state.books)) {
    book = addDocToLibrary(doc);
  }

  closeExploreBookDetail();

  // In classic-script integrations a global function may exist on window even
  // when a module-local identifier is not visible here.
  const appOpeners = [
    window.openBookDetailView,
    window.openBookDetail,
    window.showBookDetail,
    window.openBookDetails,
    window.showBookDetails
  ];
  const opener = appOpeners.find(fn => typeof fn === 'function');

  if (book && opener) {
    try {
      opener(book);
      return;
    } catch (err) {
      console.error('[MindFocus Explore] App book-detail opener failed:', err);
    }
  }

  // Reliable fallback: show a full-screen in-app detail page instead of silently
  // doing nothing when the host app's detail function is missing/not exported.
  openExploreFallbackFullPage(doc, book);
}

function openExploreFallbackFullPage(doc, book) {
  const title = doc.title || 'Untitled Book';
  const author = (doc.author_name && doc.author_name[0]) || (book && book.author) || 'Unknown Author';
  const cover = doc.cover_url || (doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : (book && (book.cover_image || book.cover)) || 'cover_placeholder.jpg');
  const pages = doc.number_of_pages_median || (book && (book.total_pages || book.pages)) || 'Not listed';
  const year = doc.first_publish_year || 'Not listed';
  const subjects = Array.isArray(doc.subject) ? doc.subject.slice(0, 8) : [];
  let page = document.getElementById('exploreFallbackFullPage');
  if (!page) {
    page = document.createElement('section');
    page.id = 'exploreFallbackFullPage';
    document.body.appendChild(page);
  }
  page.style.cssText = 'position:fixed;inset:0;z-index:10000000;overflow:auto;background:#080d16;color:#edf2f7;padding:22px;box-sizing:border-box;';
  page.innerHTML = `
    <div style="max-width:1000px;margin:0 auto;">
      <button type="button" onclick="closeExploreFallbackFullPage()" style="border:1px solid #39465a;background:#111a29;color:#f5c76a;padding:10px 15px;border-radius:10px;cursor:pointer;margin-bottom:22px;">← Back to Explore</button>
      <div style="display:grid;grid-template-columns:minmax(140px,260px) minmax(0,1fr);gap:28px;align-items:start;">
        <div><img src="${escapeHtml(cover)}" alt="${escapeHtml(title)}" style="display:block;width:100%;max-width:260px;max-height:390px;object-fit:contain;border-radius:12px;background:#111827;" onerror="this.onerror=null;this.src='cover_placeholder.jpg'"></div>
        <div>
          <div style="color:#f5c76a;font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;">Book details</div>
          <h1 style="font-size:clamp(1.7rem,4vw,2.7rem);line-height:1.15;margin:0 0 10px;">${escapeHtml(title)}</h1>
          <p style="color:#aebbd0;font-size:1.05rem;margin:0 0 22px;">by ${escapeHtml(author)}</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:20px;">
            <div style="padding:14px;background:#111a29;border:1px solid #263449;border-radius:12px;"><small style="color:#9aa9bf;">Published</small><div style="margin-top:5px;">${escapeHtml(String(year))}</div></div>
            <div style="padding:14px;background:#111a29;border:1px solid #263449;border-radius:12px;"><small style="color:#9aa9bf;">Pages</small><div style="margin-top:5px;">${escapeHtml(String(pages))}</div></div>
            <div style="padding:14px;background:#111a29;border:1px solid #263449;border-radius:12px;"><small style="color:#9aa9bf;">Library status</small><div style="margin-top:5px;">${book ? 'In your library' : 'Explore only'}</div></div>
          </div>
          ${subjects.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 22px;">${subjects.map(s=>`<span style="padding:6px 10px;border-radius:999px;background:#182337;border:1px solid #34435a;color:#cbd5e1;font-size:.8rem;">${escapeHtml(String(s))}</span>`).join('')}</div>` : ''}
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" onclick="addCurrentActiveDocToLibrary();closeExploreFallbackFullPage();" style="background:linear-gradient(135deg,#f7d487,#d99a2b);color:#17120a;border:0;padding:12px 18px;border-radius:10px;font-weight:800;cursor:pointer;">＋ Add to My Library</button>
            <button type="button" onclick="copyExploreBookDetails()" style="background:#111a29;color:#edf2f7;border:1px solid #39465a;padding:12px 18px;border-radius:10px;cursor:pointer;">Copy book details</button>
          </div>
          <p style="color:#8493a9;font-size:.82rem;margin-top:22px;">This fallback page is shown because the host app's full book-detail function was not available to the Explore module.</p>
        </div>
      </div>
    </div>`;
  document.body.style.overflow = 'hidden';
  window._exploreFallbackDoc = doc;
}

function closeExploreFallbackFullPage() {
  const page = document.getElementById('exploreFallbackFullPage');
  if (page) page.remove();
  document.body.style.overflow = '';
}

function copyExploreBookDetails() {
  const doc = window._exploreFallbackDoc || window._currentActiveDocForModal;
  if (!doc) return;
  const text = [
    doc.title || 'Untitled Book',
    (doc.author_name && doc.author_name[0]) || 'Unknown Author',
    doc.first_publish_year ? 'Published: ' + doc.first_publish_year : '',
    doc.number_of_pages_median ? 'Pages: ' + doc.number_of_pages_median : ''
  ].filter(Boolean).join('\\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => { if (typeof showToast === 'function') showToast('Book details copied.'); },
      () => { window.prompt('Copy book details:', text); }
    );
  } else {
    window.prompt('Copy book details:', text);
  }
}

function addCurrentActiveDocToLibrary() {
  const doc = window._currentActiveDocForModal;
  if (!doc) return;
  addDocToLibrary(doc);
  const btn = document.getElementById('exploreModalAddBtn');
  if (btn) {
    btn.outerHTML = `<div class="dossier-btn-added" style="width:100%;padding:13px;background:rgba(16,185,129,0.18);border:1.5px solid #10b981;color:#10b981;font-weight:800;font-size:0.9rem;border-radius:14px;text-align:center;margin-bottom:10px;">✓ Added to Library!</div>`;
  }
}

function addDocToLibrary(doc) {
  if (!doc) return null;
  const title = doc.title || 'Untitled Book';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : 'cover_placeholder.jpg');
  const pages = doc.number_of_pages_median || 280;

  if (typeof state !== 'undefined' && Array.isArray(state.books)) {
    let existing = state.books.find(b => b.title && b.title.toLowerCase() === title.toLowerCase());
    if (existing) {
      if (typeof showToast === 'function') showToast('Ye kitab pehle se hi library me hai! 📚');
      return existing;
    }

    const newBook = {
      id: "book_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      book_no: `book ${state.books.length + 1}`,
      no: `book ${state.books.length + 1}`,
      title: title,
      author: author,
      language: 'ENG',
      cover: coverUrl,
      cover_image: coverUrl,
      pages: pages,
      total_pages: pages,
      current_page: 0,
      status: 'AVAILABLE',
      category: (doc.subject && doc.subject[0]) || 'General',
      rating: 0,
      takeaway: `Master the key insights and principles detailed in ${title}.`,
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
    return newBook;
  }
  return null;
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
    modal.classList.remove('active');
    modal.classList.remove('show');
    modal.style.setProperty('display', 'none', 'important');
    modal.innerHTML = '';
  }
}

// ================= INSTANT + ONLINE EXPLORE SEARCH =================
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
  }, 350);
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

  const qLower = query.toLowerCase().trim();
  if (qLower.length < 2) return;

  // 1. Instant local search across DEFAULT_BOOKS & EXPLORE_CURATED_SPOTLIGHTS
  let localMatches = [];
  const pool = (typeof DEFAULT_BOOKS !== 'undefined' && Array.isArray(DEFAULT_BOOKS)) ? DEFAULT_BOOKS : [];
  pool.forEach(b => {
    if ((b.title && b.title.toLowerCase().includes(qLower)) || (b.author && b.author.toLowerCase().includes(qLower))) {
      localMatches.push({
        title: b.title,
        author_name: [b.author || 'Unknown'],
        cover_i: null,
        cover_url: b.cover || b.cover_image || 'cover_placeholder.jpg',
        number_of_pages_median: b.pages || b.total_pages || 250,
        first_publish_year: b.published_year || 'Classic',
        subject: [b.category || 'General']
      });
    }
  });

  // Also search EXPLORE_CURATED_SPOTLIGHTS
  EXPLORE_CURATED_SPOTLIGHTS.forEach(s => {
    if ((s.title.toLowerCase().includes(qLower) || s.author.toLowerCase().includes(qLower)) && !localMatches.some(m => m.title.toLowerCase() === s.title.toLowerCase())) {
      localMatches.push({
        title: s.title,
        author_name: [s.author],
        cover_i: s.cover_i,
        cover_url: s.cover_i ? `https://covers.openlibrary.org/b/id/${s.cover_i}-M.jpg` : 'cover_placeholder.jpg',
        number_of_pages_median: s.pages,
        first_publish_year: s.year,
        subject: s.subject
      });
    }
  });

  // Render local results instantly
  if (localMatches.length > 0) {
    window._exploreAPIResults = localMatches;
    if (resultsSection) resultsSection.style.display = 'block';
    if (resultsTitle) resultsTitle.innerText = `"${query}" • ${localMatches.length} kitabein mili`;
    if (resultsGrid) {
      resultsGrid.innerHTML = localMatches.map((doc, idx) => renderExploreSearchBookCard(doc, idx)).join('');
    }
  }

  // Common stopwords that cause Open Library 422
  const stopwords = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'book', 'books'];
  if (stopwords.includes(qLower)) {
    if (statusEl) statusEl.style.display = 'none';
    return;
  }

  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = '🔍 <em>World Books Search Engine se results fetch ho rahe hain...</em>';
  }

  try {
    const encoded = encodeURIComponent(query);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    // Use title search without unsupported fields param that triggers 422
    const url = `https://openlibrary.org/search.json?title=${encoded}&limit=15`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json();
      const onlineDocs = data.docs || [];
      onlineDocs.forEach(d => {
        if (!localMatches.some(m => m.title && m.title.toLowerCase() === (d.title || '').toLowerCase())) {
          localMatches.push(d);
        }
      });
    }
  } catch (err) {
    // Graceful offline fallback
  }

  if (statusEl) statusEl.style.display = 'none';

  if (localMatches.length === 0) {
    if (resultsSection) resultsSection.style.display = 'block';
    if (resultsTitle) resultsTitle.innerText = `"${query}" ke liye koi book nahi mili`;
    if (resultsGrid) resultsGrid.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-secondary);grid-column:1/-1;">Koi book nahi mili. Dusra naam try karein.</div>';
    return;
  }

  window._exploreAPIResults = localMatches;
  if (resultsSection) resultsSection.style.display = 'block';
  if (resultsTitle) resultsTitle.innerText = `"${query}" • ${localMatches.length} kitabein mili`;

  if (resultsGrid) {
    resultsGrid.innerHTML = localMatches.map((doc, idx) => renderExploreSearchBookCard(doc, idx)).join('');
  }
}

function renderExploreSearchBookCard(doc, idx) {
  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'cover_placeholder.jpg');
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
window.open3dBookDossierSheet = open3dBookDossierSheet;
window.renderActiveBookDetailSheet = open3dBookDossierSheet;
window.openExploreBookDetail = openExploreBookDetail;
window.openExploreSearchBookDetail = openExploreSearchBookDetail;
window.openExploreDocInFullPage = openExploreDocInFullPage;
window.openExploreFallbackFullPage = openExploreFallbackFullPage;
window.closeExploreFallbackFullPage = closeExploreFallbackFullPage;
window.copyExploreBookDetails = copyExploreBookDetails;
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
