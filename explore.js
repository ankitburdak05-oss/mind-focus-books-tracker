// ==========================================================================
// MIND & FOCUS BOOKS TRACKER — EXPLORE ENGINE & 3D DOSSIER (explore.js)
// Standalone Modular Architecture for World Discovery & Book Inspection
// ==========================================================================

window._exploreDefaultBooks = [];
window._exploreAPIResults = null;
window._currentSpotlightBook = null;
window._currentExploreMode = 'trending';
window._currentDossierDoc = null;
let _exploreSearchDebounce = null;

// Curated high-resolution spotlights with verified covers & rich metadata
const EXPLORE_CURATED_SPOTLIGHTS = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    year: '2018',
    cover_i: 12539702,
    rating: '4.8 (Global Bestseller)',
    desc: 'An easy & proven way to build good habits and break bad ones. Transform your tiny daily actions into remarkable long-term power.',
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
    subject: ['Productivity', 'Business', 'Focus', 'Technology']
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    year: '2020',
    cover_i: 10423192,
    rating: '4.9 (Financial Wisdom)',
    desc: 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn’t necessarily about what you know. It’s about how you behave.',
    pages: 256,
    subject: ['Finance', 'Psychology', 'Wealth', 'Mindset']
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    year: '2011',
    cover_i: 7279515,
    rating: '4.6 (Nobel Prize Insight)',
    desc: 'Explore the two systems that drive the way we think: System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.',
    pages: 499,
    subject: ['Psychology', 'Science', 'Decision Making', 'Cognition']
  },
  {
    title: 'Can’t Hurt Me',
    author: 'David Goggins',
    year: '2018',
    cover_i: 8765912,
    rating: '4.8 (Mental Toughness)',
    desc: 'Master your mind and defy the odds. Uncover your true potential through relentless discipline, accountability, and mental grit.',
    pages: 364,
    subject: ['Memoir', 'Motivation', 'Discipline', 'Mindset']
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    year: '180 AD',
    cover_i: 8231990,
    rating: '4.8 (Stoic Classic)',
    desc: 'Private reflections and philosophical exercises of the Roman Emperor on resilience, duty, character, and inner peace.',
    pages: 254,
    subject: ['Philosophy', 'Stoicism', 'Classics', 'History']
  },
  {
    title: 'The 48 Laws of Power',
    author: 'Robert Greene',
    year: '1998',
    cover_i: 8231933,
    rating: '4.6 (Strategy Classic)',
    desc: 'Amoral, cunning, ruthless, and instructive. A distillation of 3,000 years of the history of power drawing from Machiavelli and Sun Tzu.',
    pages: 452,
    subject: ['Psychology', 'Strategy', 'History', 'Leadership']
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    year: '2014',
    cover_i: 7898682,
    rating: '4.7 (Startup Blueprint)',
    desc: 'Notes on startups, or how to build the future. The great secret of our time is that there are still uncharted frontiers to explore.',
    pages: 224,
    subject: ['Business', 'Startups', 'Technology', 'Innovation']
  }
];

const EXPLORE_SUBJECT_MAP = {
  'ALL':             ['self_help', 'psychology', 'productivity', 'habits', 'finance', 'philosophy'],
  'Productivity':    ['productivity', 'time_management', 'habits', 'focus'],
  'Self Help':       ['self_help', 'personal_development', 'mindfulness', 'motivation'],
  'Fiction':         ['fiction', 'novel', 'literature', 'classic_literature'],
  'Business':        ['business', 'economics', 'entrepreneurship', 'leadership'],
  'Technology':      ['technology', 'computer_science', 'artificial_intelligence', 'programming'],
  'Dark Psychology': ['psychology', 'influence', 'persuasion', 'human_behavior'],
  'Philosophy':      ['philosophy', 'stoicism', 'ethics', 'ancient_philosophy']
};

// ================= SPOTLIGHT & HERO ENGINE =================

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
  if (typeof showToast === 'function') {
    showToast(`Spotlight: ${next.title} 🌟`);
  }
}

function updateExploreSpotlightUI(book) {
  if (!book) return;
  const coverImg = document.getElementById('featuredCoverImg');
  const titleEl = document.getElementById('featuredBookTitle');
  const authorEl = document.getElementById('featuredBookAuthor');
  const descEl = document.getElementById('featuredBookDesc');
  const badgeEl = document.getElementById('featuredBadgeRating');
  const btnEl = document.getElementById('featuredAddBtn');

  if (coverImg) {
    coverImg.src = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : 'cover_placeholder.jpg';
    coverImg.onerror = function() {
      this.onerror = null;
      this.src = 'cover_placeholder.jpg';
    };
  }
  if (titleEl) titleEl.innerText = book.title;
  if (authorEl) authorEl.innerText = `by ${book.author} (${book.year || 'Classic'})`;
  if (descEl) descEl.innerText = book.desc || 'World-renowned discovery from Open Library.';
  if (badgeEl) badgeEl.innerText = book.rating || '⭐ 4.8 Rating';

  if (btnEl && typeof state !== 'undefined' && state.books) {
    const already = state.books.some(b => b.title && b.title.toLowerCase() === book.title.toLowerCase());
    if (already) {
      btnEl.innerText = '✓ In Library';
      btnEl.style.opacity = '0.85';
      btnEl.onclick = function(e) {
        e.stopPropagation();
        if (typeof showToast === 'function') showToast('Ye kitab pehle se hi library me hai! 📚');
      };
    } else {
      btnEl.innerText = '+ Add to Library';
      btnEl.style.opacity = '1';
      btnEl.onclick = function(e) {
        e.stopPropagation();
        addCurrentSpotlightToLibrary();
      };
    }
  }
}

function openCurrentSpotlightDetail() {
  if (!window._currentSpotlightBook) return;
  const spot = window._currentSpotlightBook;
  const doc = {
    title: spot.title,
    author_name: [spot.author],
    cover_i: spot.cover_i,
    first_publish_year: spot.year,
    number_of_pages_median: spot.pages || 300,
    subject: spot.subject || ['Featured', 'World Discovery']
  };
  open3dBookDossierSheet(doc);
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
  window._currentDossierDoc = doc;
  addDossierBookToLibrary();
  updateExploreSpotlightUI(spot);
}

// ================= CONTROLS & SUB-TABS =================

function setExploreMode(mode) {
  window._currentExploreMode = mode;

  const modePills = ['exploreModeTrending', 'exploreModeBestsellers', 'exploreModeClassics', 'exploreModeMindset'];
  modePills.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const activeIdMap = {
    trending: 'exploreModeTrending',
    bestseller: 'exploreModeBestsellers',
    classics: 'exploreModeClassics',
    mindset: 'exploreModeMindset'
  };

  const activeBtn = document.getElementById(activeIdMap[mode]);
  if (activeBtn) activeBtn.classList.add('active');

  const modeSubjectMap = {
    trending: 'bestseller',
    bestseller: 'leadership',
    classics: 'classic_literature',
    mindset: 'habits'
  };

  loadExploreDefaultBooks(state.exploreGenre || 'ALL', modeSubjectMap[mode] || null, true);
}

function refreshExploreFeed() {
  const currentGenre = (typeof state !== 'undefined' && state.exploreGenre) || 'ALL';
  loadExploreDefaultBooks(currentGenre, null, true);
  if (typeof showToast === 'function') {
    showToast('✨ Nayi kitabein khoji jaa rahi hain...');
  }
}

function triggerSurpriseBook() {
  const pool = EXPLORE_CURATED_SPOTLIGHTS;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const doc = {
    title: pick.title,
    author_name: [pick.author],
    cover_i: pick.cover_i,
    first_publish_year: pick.year,
    number_of_pages_median: pick.pages || 300,
    subject: pick.subject || ['Surprise Pick']
  };
  open3dBookDossierSheet(doc);
  if (typeof showToast === 'function') {
    showToast(`🎲 Surprise: "${pick.title}"!`);
  }
}

function filterExploreCategoryTile(categoryName, query) {
  const input = document.getElementById('exploreSearchInput');
  if (input) input.value = categoryName;

  const clearBtn = document.getElementById('exploreSearchClearBtn');
  if (clearBtn) clearBtn.style.display = 'block';

  searchOpenLibrary(query || categoryName);

  const resultsSection = document.getElementById('exploreAPIResultsSection');
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function filterExploreGenre(genre) {
  if (typeof state !== 'undefined') {
    state.exploreGenre = genre;
  }
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

// ================= LIVE FEED LOADING & FALLBACK =================

async function loadExploreDefaultBooks(genre, customSubject = null, forceNewOffset = false) {
  const grid = document.getElementById('exploreBooksGrid');
  const titleEl = document.getElementById('exploreGridHeaderTitle');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:36px 16px;color:var(--text-secondary);">
      <div style="font-size:1.8rem;margin-bottom:8px;animation:spin 1s linear infinite;">⏳</div>
      <div style="font-weight:700;color:var(--text-primary);font-size:0.92rem;">Open Library se kitabein load ho rahi hain...</div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">World-renowned reading feed</div>
    </div>
  `;

  const subjects = EXPLORE_SUBJECT_MAP[genre] || EXPLORE_SUBJECT_MAP['ALL'];
  const subject = customSubject || subjects[Math.floor(Math.random() * subjects.length)];
  const offset = forceNewOffset ? Math.floor(Math.random() * 25) : 0;
  const url = `https://openlibrary.org/subjects/${subject}.json?limit=15&offset=${offset}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.works || data.works.length === 0) throw new Error('No works returned');

    window._exploreDefaultBooks = data.works.map(w => ({
      key: w.key,
      title: w.title,
      author_name: w.authors ? w.authors.map(a => a.name) : ['Unknown Author'],
      cover_i: w.cover_id || (w.cover_edition_key ? null : null),
      first_publish_year: w.first_publish_year || 'Classic',
      number_of_pages_median: 280,
      subject: w.subject || [genre || 'General']
    }));

    if (titleEl) {
      titleEl.innerHTML = `${genre === 'ALL' ? 'Explore Recommendations' : genre} <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">(${window._exploreDefaultBooks.length} books)</span>`;
    }

    grid.innerHTML = window._exploreDefaultBooks.map((doc, idx) => renderExploreBookCard(doc, idx)).join('');

  } catch (err) {
    console.warn('Explore live feed fetch failed, switching to curated offline catalog:', err);
    window._exploreDefaultBooks = EXPLORE_CURATED_SPOTLIGHTS.map(s => ({
      title: s.title,
      author_name: [s.author],
      cover_i: s.cover_i,
      first_publish_year: s.year,
      number_of_pages_median: s.pages,
      subject: s.subject
    }));

    if (titleEl) {
      titleEl.innerHTML = `Curated Masterpieces <span style="font-size:0.72rem;color:var(--text-muted);">&bull; Offline Ready</span>`;
    }

    grid.innerHTML = window._exploreDefaultBooks.map((doc, idx) => renderExploreBookCard(doc, idx)).join('');
  }
}

// ================= PIXEL-PERFECT BOOK CARD =================

function renderExploreBookCard(doc, idx) {
  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverId = doc.cover_i;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'cover_placeholder.jpg';
  const year = doc.first_publish_year || '';
  const alreadyAdded = (typeof state !== 'undefined' && state.books)
    ? state.books.some(b => b.title && b.title.toLowerCase() === title.toLowerCase())
    : false;

  return `
    <div class="grid-book-card" style="cursor:pointer;position:relative;" onclick="openExploreBookDetail(${idx})">
      <div class="grid-cover-wrap">
        <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(title)}" onerror="this.onerror=null;this.src='cover_placeholder.jpg';">
        ${alreadyAdded ? '<span style="position:absolute;top:6px;right:6px;background:rgba(16,185,129,0.92);color:#ffffff;font-size:0.58rem;padding:2px 6px;border-radius:6px;font-weight:800;letter-spacing:0.5px;box-shadow:0 2px 6px rgba(0,0,0,0.5);">✓ IN LIBRARY</span>' : ''}
      </div>
      <div class="grid-book-meta">
        <div class="grid-book-title">${escapeHtml(title)}</div>
        <div class="grid-book-author">${escapeHtml(author)}${year ? ' · ' + year : ''}</div>
      </div>
    </div>`;
}

// ================= 3D BOOK DOSSIER SHEET (TAP HANDLER) =================

function openExploreBookDetail(idx) {
  try {
    const docs = window._exploreDefaultBooks;
    if (!docs || !docs[idx]) return;
    open3dBookDossierSheet(docs[idx]);
  } catch(e) {
    console.error('Error opening 3D Book Dossier:', e);
  }
}

function openExploreSearchBookDetail(idx) {
  try {
    const docs = window._exploreAPIResults;
    if (!docs || !docs[idx]) return;
    open3dBookDossierSheet(docs[idx]);
  } catch(e) {
    console.error('Error opening 3D search Book Dossier:', e);
  }
}

function open3dBookDossierSheet(doc) {
  if (!doc) return;
  window._currentDossierDoc = doc;

  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverId = doc.cover_i;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : 'cover_placeholder.jpg';
  const pages = doc.number_of_pages_median || 280;
  const year = doc.first_publish_year || 'Classic';
  const subjects = (doc.subject || []).slice(0, 5).join(' • ') || 'Personal Growth • Literature';
  const alreadyAdded = (typeof state !== 'undefined' && state.books)
    ? state.books.some(b => b.title && b.title.toLowerCase() === title.toLowerCase())
    : false;

  let modal = document.getElementById('exploreBookDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'exploreBookDetailModal';
    document.body.appendChild(modal);
  }

  modal.onclick = function(e) {
    if (e.target.id === 'exploreBookDetailModal') {
      closeExploreBookDetail();
    }
  };

  modal.innerHTML = `
    <div class="explore-dossier-card" onclick="event.stopPropagation()">
      <div class="dossier-drag-handle"></div>

      <div class="dossier-top-bar">
        <span class="dossier-badge-pill">📖 3D Book Dossier</span>
        <button type="button" class="dossier-close-circle" onclick="closeExploreBookDetail()">✕</button>
      </div>

      <div class="dossier-hero-row">
        <div class="dossier-3d-stage">
          <img src="${escapeHtml(coverUrl)}" onerror="this.onerror=null;this.src='cover_placeholder.jpg';" class="dossier-3d-cover" alt="Book Cover">
        </div>
        <div class="dossier-meta-col">
          <h2 class="dossier-title">${escapeHtml(title)}</h2>
          <div class="dossier-author">by ${escapeHtml(author)}</div>

          <div class="dossier-tags-wrap">
            <span class="dossier-tag">📅 ${escapeHtml(String(year))}</span>
            <span class="dossier-tag">📖 ~${pages} Pages</span>
            <span class="dossier-tag dossier-tag-gold">⭐ 4.8 Rating</span>
          </div>

          <div style="font-size:0.72rem; color:#94a3b8; line-height:1.4;">
            <strong style="color:#cbd5e1;">Genres:</strong> ${escapeHtml(subjects)}
          </div>
        </div>
      </div>

      <div class="dossier-desc-box">
        World-renowned reading discovery from Open Library. Add to your personal library to log daily reading pages, track habit streaks and take notes.
      </div>

      ${alreadyAdded
        ? `<div class="dossier-btn-added" style="text-align:center;padding:14px;background:rgba(16,185,129,0.18);border:1.5px solid #10b981;border-radius:14px;color:#10b981;font-weight:800;font-size:0.9rem;">✓ Already in Your Library</div>`
        : `<button type="button" class="dossier-btn-add" id="dossierAddBtn" onclick="addDossierBookToLibrary()">+ Add to My Library</button>`
      }

      <div class="dossier-actions-row" style="display:flex;gap:10px;margin-top:12px;">
        <button type="button" class="dossier-btn-sub" onclick="saveQuickNoteFromDossier()" style="flex:1;padding:11px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#e2e8f0;font-size:0.82rem;font-weight:700;cursor:pointer;">
          <span>📝 Save Note</span>
        </button>
        <a href="https://openlibrary.org${doc.key || ''}" target="_blank" class="dossier-btn-sub" style="flex:1;padding:11px;text-align:center;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#a78bfa;font-size:0.82rem;font-weight:700;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:4px;">
          <span>🌐 Open Library ↗</span>
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.style.display = 'flex';
}

function addDossierBookToLibrary() {
  const doc = window._currentDossierDoc;
  if (!doc) return;

  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverId = doc.cover_i;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '';
  const pages = doc.number_of_pages_median || 280;

  if (typeof state !== 'undefined' && state.books) {
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
      dateAdded: new Date().toISOString(),
      notInterested: false,
      fromExplore: true
    };

    state.books.push(newBook);
    if (typeof saveBooks === 'function') saveBooks();
    if (typeof saveState === 'function') saveState();

    const addBtn = document.getElementById('dossierAddBtn');
    if (addBtn) {
      addBtn.outerHTML = `<div class="dossier-btn-added" style="text-align:center;padding:14px;background:rgba(16,185,129,0.18);border:1.5px solid #10b981;border-radius:14px;color:#10b981;font-weight:800;font-size:0.9rem;">✓ Added to Library!</div>`;
    }

    renderExploreBooksGrid();
    if (typeof showToast === 'function') {
      showToast(`"${title}" aapki Library me add ho gayi! 📖✨`);
    }
  }
}

function saveQuickNoteFromDossier() {
  const doc = window._currentDossierDoc;
  if (!doc) return;
  closeExploreBookDetail();
  if (typeof state !== 'undefined' && state.books) {
    let b = state.books.find(x => x.title && x.title.toLowerCase() === (doc.title || '').toLowerCase());
    if (!b) {
      addDossierBookToLibrary();
      b = state.books.find(x => x.title && x.title.toLowerCase() === (doc.title || '').toLowerCase());
    }
    if (b && typeof openBookDetailView === 'function') {
      openBookDetailView(b);
    }
  }
}

function closeExploreBookDetail() {
  const modal = document.getElementById('exploreBookDetailModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.innerHTML = '';
  }
}

// ================= LIVE & API SEARCH =================

function handleExploreSearchLive(val) {
  clearTimeout(_exploreSearchDebounce);
  const clearBtn = document.getElementById('exploreSearchClearBtn');
  if (clearBtn) {
    clearBtn.style.display = val && val.trim().length > 0 ? 'block' : 'none';
  }

  if (!val || val.trim().length === 0) {
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
  const query = input ? input.value.trim() : '';
  if (query.length > 0) {
    searchOpenLibrary(query);
  }
}

async function searchOpenLibrary(query) {
  const statusEl = document.getElementById('exploreAPIStatus');
  const resultsSection = document.getElementById('exploreAPIResultsSection');
  const resultsGrid = document.getElementById('exploreAPIResultsGrid');
  const resultsTitle = document.getElementById('exploreAPIResultsTitle');

  if (!resultsSection || !resultsGrid) return;

  resultsSection.style.display = 'block';
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = `🔍 <strong>"${escapeHtml(query)}"</strong> khoja jaa raha hai...`;
  }
  if (resultsTitle) {
    resultsTitle.innerText = `Search: "${query}"`;
  }

  resultsGrid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-secondary);">
      <div style="font-size:1.6rem;margin-bottom:6px;">🔎</div>
      <div>Kitabein dhoondi jaa rahi hain...</div>
    </div>
  `;

  try {
    const encoded = encodeURIComponent(query);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7500);

    const res = await fetch(`https://openlibrary.org/search.json?q=${encoded}&limit=12`, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.docs || data.docs.length === 0) {
      if (statusEl) statusEl.innerHTML = `⚠️ "${escapeHtml(query)}" ke liye koi kitab nahi mili. Kripya doosra naam try karein.`;
      resultsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-muted);font-size:0.85rem;">
          Koi result nahi mila. Kripya author ya book ka sahi naam likhein.
        </div>
      `;
      return;
    }

    window._exploreAPIResults = data.docs.map(d => ({
      key: d.key,
      title: d.title,
      author_name: d.author_name || ['Unknown Author'],
      cover_i: d.cover_i,
      first_publish_year: d.first_publish_year || 'Classic',
      number_of_pages_median: d.number_of_pages_median || 280,
      subject: d.subject || ['Literature']
    }));

    if (statusEl) {
      statusEl.innerHTML = `✅ "${escapeHtml(query)}" ke liye <strong>${data.docs.length}</strong> kitabein mili!`;
    }

    resultsGrid.innerHTML = window._exploreAPIResults.map((doc, idx) => `
      <div class="grid-book-card" style="cursor:pointer;position:relative;" onclick="openExploreSearchBookDetail(${idx})">
        <div class="grid-cover-wrap">
          <img src="${doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'cover_placeholder.jpg'}" alt="${escapeHtml(doc.title)}" onerror="this.onerror=null;this.src='cover_placeholder.jpg';">
          ${(typeof state !== 'undefined' && state.books && state.books.some(b => b.title && b.title.toLowerCase() === (doc.title || '').toLowerCase()))
            ? '<span style="position:absolute;top:6px;right:6px;background:rgba(16,185,129,0.92);color:#ffffff;font-size:0.58rem;padding:2px 6px;border-radius:6px;font-weight:800;letter-spacing:0.5px;box-shadow:0 2px 6px rgba(0,0,0,0.5);">✓ IN LIBRARY</span>'
            : ''}
        </div>
        <div class="grid-book-meta">
          <div class="grid-book-title">${escapeHtml(doc.title || 'Unknown Title')}</div>
          <div class="grid-book-author">${escapeHtml((doc.author_name && doc.author_name[0]) || 'Unknown')}${doc.first_publish_year ? ' · ' + doc.first_publish_year : ''}</div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.warn('API search failed, filtering curated offline catalog:', err);
    // Offline / connection reset fallback: search locally in curated books!
    const qLower = query.toLowerCase();
    const localMatches = EXPLORE_CURATED_SPOTLIGHTS.filter(b =>
      b.title.toLowerCase().includes(qLower) ||
      b.author.toLowerCase().includes(qLower) ||
      (b.subject && b.subject.some(s => s.toLowerCase().includes(qLower)))
    );

    if (localMatches.length > 0) {
      window._exploreAPIResults = localMatches.map(m => ({
        title: m.title,
        author_name: [m.author],
        cover_i: m.cover_i,
        first_publish_year: m.year,
        number_of_pages_median: m.pages || 300,
        subject: m.subject
      }));

      if (statusEl) statusEl.innerHTML = `✨ Curated match: <strong>${localMatches.length}</strong> kitabein mili!`;
      resultsGrid.innerHTML = window._exploreAPIResults.map((doc, idx) => `
        <div class="grid-book-card" style="cursor:pointer;position:relative;" onclick="openExploreSearchBookDetail(${idx})">
          <div class="grid-cover-wrap">
            <img src="${doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'cover_placeholder.jpg'}" alt="${escapeHtml(doc.title)}" onerror="this.onerror=null;this.src='cover_placeholder.jpg';">
          </div>
          <div class="grid-book-meta">
            <div class="grid-book-title">${escapeHtml(doc.title)}</div>
            <div class="grid-book-author">${escapeHtml(doc.author_name[0])} · ${doc.first_publish_year}</div>
          </div>
        </div>
      `).join('');
    } else {
      if (statusEl) statusEl.innerHTML = `⚠️ Search request timeout. Offline feed available below.`;
      resultsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:0.82rem;">
          Internet connection slow ya reset ho gaya. Neeche recommendations explore karein.
        </div>
      `;
    }
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

// ================= GLOBAL HELPERS & RE-RENDER =================

function renderExploreBooksGrid() {
  if (window._exploreDefaultBooks && window._exploreDefaultBooks.length > 0) {
    const grid = document.getElementById('exploreBooksGrid');
    if (grid) {
      grid.innerHTML = window._exploreDefaultBooks.map((d, i) => renderExploreBookCard(d, i)).join('');
    }
  }
  if (window._currentSpotlightBook) {
    updateExploreSpotlightUI(window._currentSpotlightBook);
  }
}

// Auto-initialize Explore view when ready
function initExploreView() {
  initExploreSpotlight();
  loadExploreDefaultBooks((typeof state !== 'undefined' && state.exploreGenre) || 'ALL');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initExploreView, 200);
  });
} else {
  setTimeout(initExploreView, 200);
}
