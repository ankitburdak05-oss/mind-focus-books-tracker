// ==========================================================================
// 📚 MIND & FOCUS BOOKS TRACKER — EXPLORE & 3D BOOK DOSSIER ENGINE
// Bulletproof Click Flow • Verified Schema • Instant Navigation • Fallback Guard
// ==========================================================================

// Global State & Registries for Explore Module
window._exploreDefaultBooks = [];
window._exploreAPIResults = null;
window._currentSpotlightBook = null;
window._currentActiveDocForModal = null;
window._currentExploreMode = 'trending';
window._exploreBooksRegistry = new Map(); // Unique doc key -> book object registry
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

// Curated Masterpiece Books with Full Metadata
const EXPLORE_CURATED_SPOTLIGHTS = [
  {
    key: 'curated_atomic_habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    author_name: ['James Clear'],
    year: '2018',
    first_publish_year: '2018',
    cover_i: 12539702,
    rating: '4.8 (Global Bestseller)',
    desc: 'An easy & proven way to build good habits and break bad ones. Transform tiny daily actions into remarkable long-term power.',
    pages: 320,
    number_of_pages_median: 320,
    publisher: 'Avery / Penguin Random House',
    language: 'English',
    subject: ['Self-Help', 'Productivity', 'Psychology', 'Personal Growth']
  },
  {
    key: 'curated_deep_work',
    title: 'Deep Work',
    author: 'Cal Newport',
    author_name: ['Cal Newport'],
    year: '2016',
    first_publish_year: '2016',
    cover_i: 8314125,
    rating: '4.7 (Cognitive Focus)',
    desc: 'Rules for focused success in a distracted world. Master difficult things quickly and produce elite work without multitasking.',
    pages: 304,
    number_of_pages_median: 304,
    publisher: 'Grand Central Publishing',
    language: 'English',
    subject: ['Productivity', 'Mindset', 'Career', 'Focus']
  },
  {
    key: 'curated_48_laws_power',
    title: 'The 48 Laws of Power',
    author: 'Robert Greene',
    author_name: ['Robert Greene'],
    year: '1998',
    first_publish_year: '1998',
    cover_i: 10427845,
    rating: '4.7 (Strategic Mastery)',
    desc: 'Amoral, cunning, ruthless, and instructive. The definitive manual for mastering power and strategy.',
    pages: 452,
    number_of_pages_median: 452,
    publisher: 'Viking Press / Penguin',
    language: 'English',
    subject: ['Psychology', 'Strategy', 'Power', 'Philosophy']
  },
  {
    key: 'curated_thinking_fast_slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    author_name: ['Daniel Kahneman'],
    year: '2011',
    first_publish_year: '2011',
    cover_i: 7268800,
    rating: '4.6 (Nobel Prize Science)',
    desc: 'A groundbreaking tour of the mind explaining the two cognitive systems that drive all our everyday decisions.',
    pages: 499,
    number_of_pages_median: 499,
    publisher: 'Farrar, Straus and Giroux',
    language: 'English',
    subject: ['Brain Science', 'Psychology', 'Economics', 'Decision Making']
  },
  {
    key: 'curated_psychology_money',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    author_name: ['Morgan Housel'],
    year: '2020',
    first_publish_year: '2020',
    cover_i: 10769396,
    rating: '4.8 (Financial Wisdom)',
    desc: 'Timeless lessons on wealth, greed, and happiness. Doing well with money is much less about math and more about behavior.',
    pages: 256,
    number_of_pages_median: 256,
    publisher: 'Harriman House',
    language: 'English',
    subject: ['Wealth', 'Finance', 'Mindset', 'Behavior']
  },
  {
    key: 'curated_meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    author_name: ['Marcus Aurelius'],
    year: '180',
    first_publish_year: '180',
    cover_i: 12836262,
    rating: '4.9 (Stoic Classic)',
    desc: 'Private reflections of the Roman Emperor offering timeless advice on resilience, character and tranquility in adversity.',
    pages: 254,
    number_of_pages_median: 254,
    publisher: 'Penguin Classics',
    language: 'English / Latin',
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

// ================= VIEW INITIALIZATION =================
function renderExploreView() {
  if (typeof renderPopularCategoryCounts === 'function') {
    renderPopularCategoryCounts();
  }
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
    coverImg.src = book.cover_url || (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : 'cover_placeholder.jpg');
    coverImg.onerror = function() { this.onerror = null; this.src = 'cover_placeholder.jpg'; };
  }
  if (titleEl) titleEl.innerText = book.title;
  if (authorEl) authorEl.innerText = Array.isArray(book.author_name) ? book.author_name[0] : (book.author || 'Author');
  if (ratingEl) ratingEl.innerText = book.rating || '4.8 (Global Reader Choice)';
  if (descEl) descEl.innerText = book.desc || 'World renowned reading pick curated for your daily growth.';
  if (yearEl) yearEl.innerText = book.year || book.first_publish_year || 'Classic';

  if (addBtn && typeof state !== 'undefined' && Array.isArray(state.books)) {
    const alreadyAdded = state.books.some(b => b.title && b.title.trim().toLowerCase() === book.title.trim().toLowerCase());
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
  const doc = {
    key: spot.key || 'spotlight_' + spot.title,
    title: spot.title,
    author: spot.author,
    author_name: Array.isArray(spot.author_name) ? spot.author_name : [spot.author],
    cover_i: spot.cover_i,
    cover_url: spot.cover_url || (spot.cover_i ? `https://covers.openlibrary.org/b/id/${spot.cover_i}-L.jpg` : 'cover_placeholder.jpg'),
    first_publish_year: spot.year || spot.first_publish_year,
    number_of_pages_median: spot.pages || spot.number_of_pages_median || 320,
    publisher: spot.publisher || 'Curated Spotlight',
    subject: spot.subject || ['Featured']
  };
  window._exploreBooksRegistry.set(doc.key, doc);
  open3dBookDossierSheet(doc);
}

function addCurrentSpotlightToLibrary() {
  if (!window._currentSpotlightBook) return;
  const spot = window._currentSpotlightBook;
  const doc = {
    key: spot.key || 'spotlight_' + spot.title,
    title: spot.title,
    author: spot.author,
    author_name: Array.isArray(spot.author_name) ? spot.author_name : [spot.author],
    cover_i: spot.cover_i,
    cover_url: spot.cover_url || (spot.cover_i ? `https://covers.openlibrary.org/b/id/${spot.cover_i}-L.jpg` : 'cover_placeholder.jpg'),
    first_publish_year: spot.year || spot.first_publish_year,
    number_of_pages_median: spot.pages || spot.number_of_pages_median || 320,
    publisher: spot.publisher || 'Curated Spotlight',
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
  const doc = {
    key: 'surprise_' + pick.title,
    title: pick.title,
    author: pick.author,
    author_name: [pick.author],
    cover_i: pick.cover_i,
    cover_url: pick.cover_i ? `https://covers.openlibrary.org/b/id/${pick.cover_i}-L.jpg` : 'cover_placeholder.jpg',
    first_publish_year: pick.year,
    number_of_pages_median: pick.pages,
    publisher: pick.publisher || 'Curated Spotlight',
    subject: pick.subject
  };
  window._exploreBooksRegistry.set(doc.key, doc);
  open3dBookDossierSheet(doc);
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

// ================= LOAD & RENDER EXPLORE CARDS =================
async function loadExploreDefaultBooks(genre, customSubject = null, forceNewOffset = false) {
  const grid = document.getElementById('exploreBooksGrid');
  const titleEl = document.getElementById('exploreGridHeaderTitle');
  if (!grid) return;

  // 1. Initial Instant Curated Render
  window._exploreDefaultBooks = EXPLORE_CURATED_SPOTLIGHTS.map((s, idx) => {
    const doc = {
      key: s.key || `curated_${idx}`,
      title: s.title,
      author: s.author,
      author_name: [s.author],
      cover_i: s.cover_i,
      cover_url: s.cover_i ? `https://covers.openlibrary.org/b/id/${s.cover_i}-M.jpg` : 'cover_placeholder.jpg',
      first_publish_year: s.year,
      number_of_pages_median: s.pages,
      publisher: s.publisher || 'Curated Spotlight',
      subject: s.subject
    };
    window._exploreBooksRegistry.set(doc.key, doc);
    return doc;
  });

  if (titleEl) {
    titleEl.innerHTML = `${genre === 'ALL' ? 'Explore Recommendations' : genre} <span style="font-size:0.72rem;color:var(--text-muted);">&bull; ${window._exploreDefaultBooks.length} books</span>`;
  }
  grid.innerHTML = window._exploreDefaultBooks.map((doc, idx) => renderExploreBookCard(doc, doc.key || idx)).join('');

  // 2. Non-blocking background fetch
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
      window._exploreDefaultBooks = docs.map((d, i) => {
        const itemKey = `api_cat_${i}_${(d.title || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
        const enriched = {
          ...d,
          key: itemKey,
          publisher: (d.publisher && d.publisher[0]) || 'World Open Catalog'
        };
        window._exploreBooksRegistry.set(itemKey, enriched);
        return enriched;
      });
      grid.innerHTML = window._exploreDefaultBooks.map((doc) => renderExploreBookCard(doc, doc.key)).join('');
    }
  } catch(e) {
    // Keep instant curated list
  }
}

function renderExploreBookCard(doc, keyOrIdx) {
  const title = doc.title || 'Unknown Title';
  const author = (Array.isArray(doc.author_name) && doc.author_name[0]) || doc.author || 'Unknown Author';
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'cover_placeholder.jpg');
  const year = doc.first_publish_year || doc.year || '';
  const pages = doc.number_of_pages_median || doc.pages || '';
  const itemKey = doc.key || String(keyOrIdx);
  const alreadyAdded = (typeof state !== 'undefined' && Array.isArray(state.books))
    ? state.books.some(b => b.title && b.title.trim().toLowerCase() === title.trim().toLowerCase())
    : false;

  return `
    <div class="grid-book-card" style="cursor:pointer;position:relative;" onclick="openExploreBookDetail('${escapeHtml(itemKey)}')">
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

// Safe Click Handlers (handles both key string and numeric index)
function openExploreBookDetail(keyOrIdx) {
  let doc = null;
  if (typeof keyOrIdx === 'string' && window._exploreBooksRegistry.has(keyOrIdx)) {
    doc = window._exploreBooksRegistry.get(keyOrIdx);
  } else if (window._exploreDefaultBooks && window._exploreDefaultBooks[keyOrIdx]) {
    doc = window._exploreDefaultBooks[keyOrIdx];
  }
  if (!doc) {
    console.warn('[Explore] Document not found for key/index:', keyOrIdx);
    return;
  }
  open3dBookDossierSheet(doc);
}

function openExploreSearchBookDetail(keyOrIdx) {
  let doc = null;
  if (typeof keyOrIdx === 'string' && window._exploreBooksRegistry.has(keyOrIdx)) {
    doc = window._exploreBooksRegistry.get(keyOrIdx);
  } else if (window._exploreAPIResults && window._exploreAPIResults[keyOrIdx]) {
    doc = window._exploreAPIResults[keyOrIdx];
  }
  if (!doc) {
    console.warn('[Explore Search] Document not found for key/index:', keyOrIdx);
    return;
  }
  open3dBookDossierSheet(doc);
}

// ================= 3D BOOK DOSSIER SHEET MODAL =================
function open3dBookDossierSheet(doc) {
  if (!doc) return;
  window._currentActiveDocForModal = doc;

  const title = (doc.title || 'Unknown Title').trim();
  const author = (Array.isArray(doc.author_name) && doc.author_name[0]) || doc.author || 'Unknown Author';
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : 'cover_placeholder.jpg');
  const pages = doc.number_of_pages_median || doc.pages || doc.total_pages || 280;
  const year = doc.first_publish_year || doc.year || 'Classic';
  const publisher = (Array.isArray(doc.publisher) && doc.publisher[0]) || doc.publisher || 'Curated / Global Catalog';
  const subjects = (Array.isArray(doc.subject) ? doc.subject.slice(0, 5).join(' &bull; ') : (doc.category || 'World Literature &bull; Self Growth'));
  const alreadyAdded = (typeof state !== 'undefined' && Array.isArray(state.books))
    ? state.books.some(b => b.title && b.title.trim().toLowerCase() === title.toLowerCase())
    : false;

  let modal = document.getElementById('exploreBookDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'exploreBookDetailModal';
    document.body.appendChild(modal);
  }

  modal.onclick = (e) => { if (e.target === modal) closeExploreBookDetail(); };
  modal.className = 'explore-detail-modal-container active show';
  modal.classList.add('active');
  modal.classList.add('show');
  modal.style.display = 'flex';
  modal.style.setProperty('display', 'flex', 'important');
  modal.style.cssText = 'display:flex !important;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:9999999;background:rgba(4,7,18,0.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);align-items:flex-end;justify-content:center;pointer-events:auto;';

  modal.innerHTML = `
    <div class="explore-dossier-card" onclick="event.stopPropagation()" style="position:relative;background:linear-gradient(165deg,#131a2b 0%,#0a0d17 100%);border:1px solid rgba(245,158,11,0.3);border-radius:28px 28px 0 0;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;padding:14px 18px 36px 18px;box-shadow:0 -10px 45px rgba(0,0,0,0.9),0 0 35px rgba(245,158,11,0.18);">
      
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
      <div class="dossier-hero-row" style="display:flex;gap:16px;align-items:flex-start;margin-bottom:14px;">
        <div class="dossier-3d-stage" style="perspective:700px;flex-shrink:0;">
          <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(title)}"
            class="dossier-3d-cover"
            onerror="this.onerror=null;this.src='cover_placeholder.jpg'"
            style="width:112px;height:168px;object-fit:cover;border-radius:12px;box-shadow:-10px 14px 28px rgba(0,0,0,0.75), 0 0 20px rgba(245,158,11,0.25);transform:rotateY(-14deg) rotateX(4deg);border:1px solid rgba(255,255,255,0.2);">
        </div>
        <div class="dossier-meta-col" style="flex:1;min-width:0;">
          <h2 class="dossier-title" style="font-size:1.08rem;font-weight:800;line-height:1.3;color:#ffffff;margin:0 0 4px 0;">${escapeHtml(title)}</h2>
          <div class="dossier-author" style="font-size:0.85rem;font-weight:700;color:#fbbf24;margin-bottom:8px;">by ${escapeHtml(author)}</div>
          
          <div class="dossier-tags-wrap" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
            <span class="dossier-tag" style="font-size:0.7rem;font-weight:600;padding:3px 8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#cbd5e1;">📅 ${year}</span>
            <span class="dossier-tag" style="font-size:0.7rem;font-weight:600;padding:3px 8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#cbd5e1;">📖 ~${pages} Pages</span>
            <span class="dossier-tag dossier-tag-gold" style="font-size:0.7rem;font-weight:600;padding:3px 8px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.35);border-radius:8px;color:#fbbf24;">⭐ 4.8 Rating</span>
          </div>

          <div style="font-size:0.72rem;color:#94a3b8;line-height:1.4;margin-bottom:6px;">
            <strong style="color:#e2e8f0;">Genres:</strong> ${escapeHtml(subjects)}
          </div>

          <!-- Edition & Publisher Source Details -->
          <div style="font-size:0.7rem;color:#64748b;line-height:1.35;background:rgba(255,255,255,0.03);padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.05);">
            <span style="color:#94a3b8;font-weight:600;">Edition/Source:</span> ${escapeHtml(publisher)}
          </div>
        </div>
      </div>

      <!-- Action 1: Open Full Book Page & Read (Primary Green Button) -->
      <button type="button" onclick="openExploreDocInFullPage()" style="width:100%;padding:14px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;font-weight:800;font-size:0.95rem;border-radius:14px;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(16,185,129,0.4);letter-spacing:0.3px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px;">
        <span>📖</span>
        <span>Open Full Book Page & Read</span>
      </button>

      <!-- Action 2: Add to My Library (Duplicate Safe) -->
      ${alreadyAdded
        ? `<div class="dossier-btn-added" style="width:100%;padding:13px;background:rgba(16,185,129,0.18);border:1.5px solid #10b981;color:#10b981;font-weight:800;font-size:0.9rem;border-radius:14px;text-align:center;margin-bottom:10px;box-sizing:border-box;">✓ Already in Your Library</div>`
        : `<button type="button" class="dossier-btn-add" id="exploreModalAddBtn" onclick="addCurrentActiveDocToLibrary()" style="width:100%;padding:13px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#000000;font-weight:800;font-size:0.9rem;border-radius:14px;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(245,158,11,0.45);letter-spacing:0.3px;margin-bottom:10px;">
            + Add to My Library
          </button>`
      }

      <!-- Action Row: Copy Details & Save Note & Close -->
      <div class="dossier-actions-row" style="display:flex;gap:8px;">
        <button type="button" class="dossier-btn-sub" onclick="copyCurrentExploreBookDetails()" style="flex:1;padding:10px 8px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#e2e8f0;font-size:0.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;" title="Copy Title, Author & Metadata">
          <span>📋</span>
          <span>Copy</span>
        </button>
        <button type="button" class="dossier-btn-sub" onclick="saveQuickNoteFromExplore()" style="flex:1;padding:10px 8px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#e2e8f0;font-size:0.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">
          <span>📝</span>
          <span>Note</span>
        </button>
        <button type="button" class="dossier-btn-sub" onclick="closeExploreBookDetail()" style="flex:1;padding:10px 8px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#94a3b8;font-size:0.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">
          <span>✕</span>
          <span>Close</span>
        </button>
      </div>

    </div>
  `;
}

// ================= VALIDATED FULL PAGE OPENING & FALLBACK =================
function openExploreDocInFullPage() {
  const doc = window._currentActiveDocForModal;
  if (!doc) {
    if (typeof showToast === 'function') showToast('Kitab ki details uplabdh nahi hain.');
    return;
  }

  // 1. Build and validate a complete main-app compliant book object
  const book = getOrCreateLibraryBookFromDoc(doc);
  if (!book) {
    console.error('[Explore] Failed to construct valid book object from doc:', doc);
    showFallbackBookPage(doc, 'Book object validation failed');
    return;
  }

  // 2. Locate navigation handler
  const openFn = (typeof openBookDetailView === 'function')
    ? openBookDetailView
    : (typeof window !== 'undefined' && typeof window.openBookDetailView === 'function' ? window.openBookDetailView : null);

  if (typeof openFn !== 'function') {
    console.warn('[Explore] openBookDetailView function is not available. Launching full-screen fallback page.');
    showFallbackBookPage(doc, 'openBookDetailView handler not found in runtime');
    return;
  }

  // 3. Handler is validated -> execute navigation safely
  try {
    // Only close explore modal now that validation has succeeded
    closeExploreBookDetail();

    // Ensure book is in state.books so state.currentBookIndex & indexOf work
    if (typeof state !== 'undefined' && Array.isArray(state.books)) {
      if (!state.books.some(b => b.id === book.id || (b.title && b.title.trim().toLowerCase() === book.title.trim().toLowerCase()))) {
        state.books.push(book);
        if (typeof saveBooks === 'function') saveBooks();
      }
    }

    // Call main app reader/detail view
    openFn(book);

    // Verify view switched to detail view; if class not toggled, force activate
    const detailView = document.getElementById('viewBookDetail');
    if (detailView && !detailView.classList.contains('active')) {
      document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
      detailView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (err) {
    console.error('[Explore] Exception while invoking openBookDetailView:', err);
    // Show in-place full-screen fallback page so user is never stranded
    showFallbackBookPage(doc, err.message);
  }
}

// Fallback Book Page (Guarantees user is NEVER left on blank screen)
function showFallbackBookPage(doc, reason = '') {
  let modal = document.getElementById('exploreBookDetailModal');
  if (!modal) return;

  const title = (doc.title || 'Untitled Book').trim();
  const author = (Array.isArray(doc.author_name) && doc.author_name[0]) || doc.author || 'Unknown Author';
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : 'cover_placeholder.jpg');
  const pages = doc.number_of_pages_median || doc.pages || doc.total_pages || 280;
  const year = doc.first_publish_year || doc.year || 'Classic';
  const publisher = doc.publisher || 'Open Library / Curated Source';

  modal.className = 'explore-detail-modal-container active show';
  modal.style.cssText = 'display:flex !important;position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:9999999;background:rgba(4,7,18,0.96);align-items:flex-start;justify-content:center;overflow-y:auto;pointer-events:auto;padding:16px;box-sizing:border-box;';

  modal.innerHTML = `
    <div style="width:100%;max-width:560px;margin:20px auto;background:#0d121f;border:1px solid rgba(245,158,11,0.3);border-radius:24px;padding:24px;box-shadow:0 15px 50px rgba(0,0,0,0.9);color:#ffffff;box-sizing:border-box;">
      <!-- Top Nav -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);">
        <button type="button" onclick="closeExploreBookDetail()" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;padding:6px 14px;border-radius:12px;font-size:0.85rem;cursor:pointer;font-weight:700;">
          &larr; Back to Explore
        </button>
        <span style="font-size:0.75rem;color:#fbbf24;font-weight:800;letter-spacing:1px;text-transform:uppercase;">Book Details (Direct View)</span>
      </div>

      <!-- Hero Header -->
      <div style="display:flex;gap:18px;margin-bottom:22px;">
        <img src="${escapeHtml(coverUrl)}" onerror="this.src='cover_placeholder.jpg'" style="width:115px;height:165px;object-fit:cover;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.7);flex-shrink:0;">
        <div style="flex:1;min-width:0;">
          <h2 style="font-size:1.2rem;font-weight:800;margin:0 0 6px 0;line-height:1.3;">${escapeHtml(title)}</h2>
          <div style="font-size:0.9rem;color:#fbbf24;font-weight:700;margin-bottom:12px;">by ${escapeHtml(author)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            <span style="font-size:0.72rem;background:rgba(255,255,255,0.08);padding:3px 9px;border-radius:8px;color:#cbd5e1;">📅 ${year}</span>
            <span style="font-size:0.72rem;background:rgba(255,255,255,0.08);padding:3px 9px;border-radius:8px;color:#cbd5e1;">📖 ~${pages} Pages</span>
            <span style="font-size:0.72rem;background:rgba(245,158,11,0.15);padding:3px 9px;border-radius:8px;color:#fbbf24;border:1px solid rgba(245,158,11,0.3);">⭐ 4.8 Rating</span>
          </div>
          <div style="margin-top:10px;font-size:0.72rem;color:#94a3b8;">
            <strong>Publisher:</strong> ${escapeHtml(publisher)}
          </div>
        </div>
      </div>

      <!-- Quick Note Box -->
      <div style="margin-bottom:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
        <div style="font-size:0.82rem;font-weight:700;color:#e2e8f0;margin-bottom:8px;">📝 Quick Personal Note for this Book:</div>
        <textarea id="fallbackQuickNoteInput" placeholder="Yahan is kitab ke mukhya points ya thoughts likhein..." style="width:100%;height:80px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;padding:10px;font-size:0.85rem;resize:none;box-sizing:border-box;"></textarea>
        <button type="button" onclick="saveFallbackQuickNote('${escapeHtml(title)}')" style="margin-top:8px;padding:8px 16px;background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#10b981;border-radius:10px;font-weight:700;font-size:0.8rem;cursor:pointer;">
          💾 Save Note
        </button>
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:10px;flex-direction:column;">
        <button type="button" onclick="addCurrentActiveDocToLibrary()" style="width:100%;padding:13px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;border:none;border-radius:14px;font-weight:800;font-size:0.92rem;cursor:pointer;">
          + Add to My Library
        </button>
        <button type="button" onclick="copyCurrentExploreBookDetails()" style="width:100%;padding:11px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;border-radius:14px;font-weight:700;font-size:0.85rem;cursor:pointer;">
          📋 Copy Book Details
        </button>
      </div>
    </div>
  `;
}

function saveFallbackQuickNote(bookTitle) {
  const input = document.getElementById('fallbackQuickNoteInput');
  const text = (input ? input.value : '').trim();
  if (!text) {
    if (typeof showToast === 'function') showToast('Kripya pehle note likhein.');
    return;
  }

  if (typeof userNotesState !== 'undefined' && Array.isArray(userNotesState)) {
    userNotesState.push({
      id: 'note_' + Date.now(),
      book: bookTitle,
      text: text,
      page: 1,
      timeAgo: 'Just now',
      date: new Date().toISOString()
    });
    try {
      localStorage.setItem('mindfocus_user_notes_v1', JSON.stringify(userNotesState));
    } catch(e) {}
    if (typeof showToast === 'function') showToast('Note safaltapoorvak save ho gaya! 📝✨');
    if (input) input.value = '';
  }
}

// ================= DUPLICATE-SAFE LIBRARY ADDITION =================
function addCurrentActiveDocToLibrary() {
  const doc = window._currentActiveDocForModal;
  if (!doc) return;
  const book = getOrCreateLibraryBookFromDoc(doc);
  const btn = document.getElementById('exploreModalAddBtn');
  if (btn && book) {
    btn.outerHTML = `<div class="dossier-btn-added" style="width:100%;padding:13px;background:rgba(16,185,129,0.18);border:1.5px solid #10b981;color:#10b981;font-weight:800;font-size:0.9rem;border-radius:14px;text-align:center;margin-bottom:10px;box-sizing:border-box;">✓ Added to Library!</div>`;
  }
}

function getOrCreateLibraryBookFromDoc(doc) {
  if (!doc) return null;
  const title = (doc.title || 'Untitled Book').trim();
  const author = (Array.isArray(doc.author_name) ? doc.author_name[0] : (doc.author || 'Unknown Author')).trim();
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : 'cover_placeholder.jpg');
  const pages = Number(doc.number_of_pages_median || doc.pages || doc.total_pages) || 280;
  const category = (Array.isArray(doc.subject) && doc.subject.length > 0) ? doc.subject[0] : (doc.category || 'General');
  const year = doc.first_publish_year || doc.year || 'Classic';
  const publisher = (Array.isArray(doc.publisher) && doc.publisher.length > 0) ? doc.publisher[0] : (doc.publisher || 'Open Library / Curated Source');

  if (typeof state !== 'undefined' && Array.isArray(state.books)) {
    // 1. Check if already exists (case-insensitive duplicate guard)
    const existing = state.books.find(b => b.title && b.title.trim().toLowerCase() === title.toLowerCase());
    if (existing) {
      if (!existing.cover_image && coverUrl) existing.cover_image = coverUrl;
      if (!existing.cover_url && coverUrl) existing.cover_url = coverUrl;
      if (!existing.pages && pages) existing.pages = pages;
      if (!existing.total_pages && pages) existing.total_pages = pages;
      if (typeof showToast === 'function') showToast('Ye kitab pehle se hi library me hai! 📚');
      return existing;
    }

    // 2. Construct complete, schema-compliant Book Object for Main App
    const newBook = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      no: `book ${state.books.length + 1}`,
      book_no: `book ${state.books.length + 1}`,
      title: title,
      author: author,
      language: 'ENGLISH',
      cover: coverUrl,
      cover_image: coverUrl,
      cover_url: coverUrl,
      pages: pages,
      total_pages: pages,
      current_page: 0,
      status: 'AVAILABLE',
      availability: 'AVAILABLE',
      category: category,
      rating: 0,
      takeaway: `Master the key insights, habits, and mindset detailed in ${title}.`,
      notes: '',
      quotes: [],
      vocabulary: [],
      start_date: '',
      end_date: '',
      completed_date: '',
      count_days: 0,
      price: 0,
      publisher: publisher,
      first_publish_year: year,
      dateAdded: new Date().toISOString(),
      notInterested: false
    };

    state.books.push(newBook);
    if (typeof saveBooks === 'function') saveBooks();
    if (typeof showToast === 'function') showToast(`"${title}" aapki Library me add ho gayi! 📖✨`);

    renderExploreCardBadges();
    return newBook;
  }
  return null;
}

function renderExploreCardBadges() {
  const grid = document.getElementById('exploreBooksGrid');
  if (grid && window._exploreDefaultBooks) {
    grid.innerHTML = window._exploreDefaultBooks.map((d, i) => renderExploreBookCard(d, d.key || i)).join('');
  }
}

function saveQuickNoteFromExplore() {
  const doc = window._currentActiveDocForModal;
  if (!doc) return;
  // Open full book page where user has the direct note editor
  openExploreDocInFullPage();
}

function copyCurrentExploreBookDetails() {
  const doc = window._currentActiveDocForModal;
  if (!doc) return;

  const title = (doc.title || 'Untitled Book').trim();
  const author = (Array.isArray(doc.author_name) ? doc.author_name[0] : (doc.author || 'Unknown Author')).trim();
  const year = doc.first_publish_year || doc.year || 'Classic';
  const pages = doc.number_of_pages_median || doc.pages || 280;
  const subjects = (Array.isArray(doc.subject) ? doc.subject.slice(0, 3).join(', ') : (doc.category || 'General'));
  const publisher = doc.publisher || 'Open Library / Curated Source';

  const textToCopy = `📖 Title: ${title}\n✍️ Author: ${author}\n📅 Year: ${year}\n📄 Pages: ~${pages}\n🏷️ Category: ${subjects}\n🏢 Publisher: ${publisher}\nSaved via Mind & Focus Books Tracker`;

  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        if (typeof showToast === 'function') showToast('Kitab ki details copy ho gayi! 📋✨');
      })
      .catch(() => fallbackCopy(textToCopy));
  } else {
    fallbackCopy(textToCopy);
  }
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (typeof showToast === 'function') showToast('Kitab ki details copy ho gayi! 📋✨');
  } catch(e) {
    if (typeof showToast === 'function') showToast('Copy nahi ho paya.');
  }
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

// ================= INSTANT LOCAL + LIVE ONLINE SEARCH =================
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
  pool.forEach((b, i) => {
    if ((b.title && b.title.toLowerCase().includes(qLower)) || (b.author && b.author.toLowerCase().includes(qLower))) {
      const docKey = `search_local_${i}_${(b.title || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
      const doc = {
        key: docKey,
        title: b.title,
        author: b.author,
        author_name: [b.author || 'Unknown'],
        cover_i: null,
        cover_url: b.cover || b.cover_image || b.cover_url || 'cover_placeholder.jpg',
        number_of_pages_median: b.pages || b.total_pages || 250,
        first_publish_year: b.published_year || 'Classic',
        publisher: b.publisher || 'Library Collection',
        subject: [b.category || 'General']
      };
      window._exploreBooksRegistry.set(docKey, doc);
      localMatches.push(doc);
    }
  });

  // Also match curated spotlights
  EXPLORE_CURATED_SPOTLIGHTS.forEach((s, i) => {
    if ((s.title.toLowerCase().includes(qLower) || s.author.toLowerCase().includes(qLower)) && !localMatches.some(m => m.title.toLowerCase() === s.title.toLowerCase())) {
      const docKey = `search_curated_${i}`;
      const doc = {
        key: docKey,
        title: s.title,
        author: s.author,
        author_name: [s.author],
        cover_i: s.cover_i,
        cover_url: s.cover_i ? `https://covers.openlibrary.org/b/id/${s.cover_i}-M.jpg` : 'cover_placeholder.jpg',
        number_of_pages_median: s.pages,
        first_publish_year: s.year,
        publisher: s.publisher || 'Curated Spotlight',
        subject: s.subject
      };
      window._exploreBooksRegistry.set(docKey, doc);
      localMatches.push(doc);
    }
  });

  // Render local results immediately with zero lag
  if (localMatches.length > 0) {
    window._exploreAPIResults = localMatches;
    if (resultsSection) resultsSection.style.display = 'block';
    if (resultsTitle) resultsTitle.innerText = `"${query}" • ${localMatches.length} kitabein mili`;
    if (resultsGrid) {
      resultsGrid.innerHTML = localMatches.map((doc) => renderExploreSearchBookCard(doc)).join('');
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
    const url = `https://openlibrary.org/search.json?title=${encoded}&limit=15`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json();
      const onlineDocs = data.docs || [];
      onlineDocs.forEach((d, i) => {
        if (!localMatches.some(m => m.title && m.title.toLowerCase() === (d.title || '').toLowerCase())) {
          const docKey = `search_api_${i}_${(d.title || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
          const enriched = {
            ...d,
            key: docKey,
            publisher: (d.publisher && d.publisher[0]) || 'World Open Catalog'
          };
          window._exploreBooksRegistry.set(docKey, enriched);
          localMatches.push(enriched);
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
    resultsGrid.innerHTML = localMatches.map((doc) => renderExploreSearchBookCard(doc)).join('');
  }
}

function renderExploreSearchBookCard(doc) {
  const title = doc.title || 'Unknown Title';
  const author = (Array.isArray(doc.author_name) && doc.author_name[0]) || doc.author || 'Unknown Author';
  const coverUrl = doc.cover_url || (doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'cover_placeholder.jpg');
  const docKey = doc.key || 'search_key_' + title;

  return `
    <div class="grid-book-card" style="cursor:pointer;" onclick="openExploreSearchBookDetail('${escapeHtml(docKey)}')">
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

// Keyboard Escape Listener for Modal
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('exploreBookDetailModal');
      if (modal && (modal.classList.contains('active') || modal.style.display === 'flex')) {
        closeExploreBookDetail();
      }
    }
  });
}

// Global window bindings
window.open3dBookDossierSheet = open3dBookDossierSheet;
window.renderActiveBookDetailSheet = open3dBookDossierSheet;
window.openExploreBookDetail = openExploreBookDetail;
window.openExploreSearchBookDetail = openExploreSearchBookDetail;
window.openExploreDocInFullPage = openExploreDocInFullPage;
window.addCurrentActiveDocToLibrary = addCurrentActiveDocToLibrary;
window.addDocToLibrary = getOrCreateLibraryBookFromDoc;
window.getOrCreateLibraryBookFromDoc = getOrCreateLibraryBookFromDoc;
window.copyCurrentExploreBookDetails = copyCurrentExploreBookDetails;
window.saveQuickNoteFromExplore = saveQuickNoteFromExplore;
window.closeExploreBookDetail = closeExploreBookDetail;
window.showFallbackBookPage = showFallbackBookPage;
window.saveFallbackQuickNote = saveFallbackQuickNote;
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
