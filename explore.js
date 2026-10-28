// ==========================================================================
// MIND & FOCUS BOOKS TRACKER — EXPLORE ENGINE & 3D DOSSIER (explore.js)
// Standalone Modular Architecture for World Discovery & Book Inspection
// ==========================================================================

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

window.escapeHtml = escapeHtml;
window._exploreDefaultBooks = [];
window._exploreAPIResults = null;
window._currentSpotlightBook = null;
window._currentExploreMode = 'trending';
window._currentDossierDoc = null;
let _exploreSearchDebounce = null;

// Comprehensive Curated World Books with verified offline metadata across 8 Categories
const EXPLORE_CURATED_BOOKS = [
  // Productivity
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    year: '2018',
    cover_i: 12539702,
    rating: '4.8 (Global Bestseller)',
    desc: 'An easy & proven way to build good habits and break bad ones. Transform tiny daily actions into remarkable long-term power.',
    pages: 320,
    category: 'Productivity',
    subject: ['Productivity', 'Habits', 'Self Help', 'Psychology']
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    year: '2016',
    cover_i: 8314125,
    rating: '4.7 (Cognitive Focus)',
    desc: 'Rules for focused success in a distracted world. Master hard things quickly and produce elite work without multitasking.',
    pages: 304,
    category: 'Productivity',
    subject: ['Productivity', 'Focus', 'Time Management', 'Business']
  },
  {
    title: 'Essentialism',
    author: 'Greg McKeown',
    year: '2014',
    cover_i: 7412966,
    rating: '4.6 (Disciplined Pursuit)',
    desc: 'The disciplined pursuit of less. Do only what is essential and cut out everything that drains your energy and focus.',
    pages: 272,
    category: 'Productivity',
    subject: ['Productivity', 'Leadership', 'Decision Making']
  },
  {
    title: 'Make It Stick',
    author: 'Peter C. Brown',
    year: '2014',
    cover_i: 8064205,
    rating: '4.7 (Learning Science)',
    desc: 'The science of successful learning. Discover how retrieval practice and spaced repetition supercharge long-term memory.',
    pages: 336,
    category: 'Productivity',
    subject: ['Productivity', 'Learning', 'Neuroscience']
  },

  // Self Help & Mindset
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    year: '2020',
    cover_i: 10423192,
    rating: '4.9 (Financial Wisdom)',
    desc: 'Timeless lessons on wealth, greed, and happiness. Doing well with money is about behavior, patience, and emotions.',
    pages: 256,
    category: 'Self Help',
    subject: ['Finance', 'Psychology', 'Wealth', 'Mindset']
  },
  {
    title: 'Can’t Hurt Me',
    author: 'David Goggins',
    year: '2018',
    cover_i: 8765912,
    rating: '4.8 (Mental Toughness)',
    desc: 'Master your mind and defy the odds. Uncover your true potential through relentless discipline and mental grit.',
    pages: 364,
    category: 'Self Help',
    subject: ['Motivation', 'Discipline', 'Mindset', 'Biography']
  },
  {
    title: 'Mindset: The New Psychology of Success',
    author: 'Carol S. Dweck',
    year: '2006',
    cover_i: 8231988,
    rating: '4.7 (Growth Mindset)',
    desc: 'How we can learn to fulfill our potential. Discover how the growth mindset unlocks achievement in arts, sports, and business.',
    pages: 288,
    category: 'Self Help',
    subject: ['Self Help', 'Psychology', 'Personal Growth']
  },
  {
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    year: '1997',
    cover_i: 8246311,
    rating: '4.7 (Spiritual Awareness)',
    desc: 'A guide to spiritual enlightenment. Learn to live in the present moment free from past regrets and future anxiety.',
    pages: 236,
    category: 'Self Help',
    subject: ['Mindfulness', 'Spirituality', 'Philosophy']
  },

  // Philosophy
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    year: '180 AD',
    cover_i: 8231990,
    rating: '4.8 (Stoic Classic)',
    desc: 'Private reflections of the Roman Emperor on resilience, duty, character, and inner peace in the face of chaos.',
    pages: 254,
    category: 'Philosophy',
    subject: ['Philosophy', 'Stoicism', 'Classics', 'History']
  },
  {
    title: 'Daily Stoic',
    author: 'Ryan Holiday',
    year: '2016',
    cover_i: 8245356,
    rating: '4.8 (Daily Wisdom)',
    desc: '366 meditations on wisdom, perseverance, and the art of living from Seneca, Epictetus, and Marcus Aurelius.',
    pages: 416,
    category: 'Philosophy',
    subject: ['Philosophy', 'Stoicism', 'Self Help']
  },
  {
    title: 'Ego is the Enemy',
    author: 'Ryan Holiday',
    year: '2016',
    cover_i: 8232034,
    rating: '4.6 (Humility & Mastery)',
    desc: 'The fight to master our greatest internal opponent. Learn how to stay humble in success and resilient in failure.',
    pages: 256,
    category: 'Philosophy',
    subject: ['Philosophy', 'Leadership', 'Psychology']
  },

  // Dark Psychology & Strategy
  {
    title: 'The 48 Laws of Power',
    author: 'Robert Greene',
    year: '1998',
    cover_i: 8231933,
    rating: '4.6 (Strategy Classic)',
    desc: 'Amoral, cunning, ruthless, and instructive. A distillation of 3,000 years of the history of power drawing from Machiavelli.',
    pages: 452,
    category: 'Dark Psychology',
    subject: ['Psychology', 'Strategy', 'History', 'Influence']
  },
  {
    title: 'Influence: The Psychology of Persuasion',
    author: 'Robert B. Cialdini',
    year: '1984',
    cover_i: 8087691,
    rating: '4.8 (Persuasion Master)',
    desc: 'The foundational book on why people say yes. Discover the 6 universal principles of persuasion and how to defend against manipulation.',
    pages: 320,
    category: 'Dark Psychology',
    subject: ['Psychology', 'Persuasion', 'Marketing', 'Behavior']
  },
  {
    title: 'The Art of Seduction',
    author: 'Robert Greene',
    year: '2001',
    cover_i: 8028304,
    rating: '4.5 (Charm & Psychology)',
    desc: 'An indispensable primer on persuasion and human nature. Master the subtle psychology of allure and attraction.',
    pages: 468,
    category: 'Dark Psychology',
    subject: ['Dark Psychology', 'Strategy', 'Human Nature']
  },

  // Business & Wealth
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    year: '2014',
    cover_i: 7898682,
    rating: '4.7 (Startup Blueprint)',
    desc: 'Notes on startups, or how to build the future. The great secret of our time is that there are still uncharted frontiers to explore.',
    pages: 224,
    category: 'Business',
    subject: ['Business', 'Startups', 'Technology', 'Innovation']
  },
  {
    title: 'Principles',
    author: 'Ray Dalio',
    year: '2017',
    cover_i: 8314178,
    rating: '4.8 (Life & Work Wisdom)',
    desc: 'Unconventional principles that Ray Dalio developed, refined, and used over 40 years to create unique results in life and business.',
    pages: 592,
    category: 'Business',
    subject: ['Business', 'Leadership', 'Decision Making']
  },
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    year: '1937',
    cover_i: 8281189,
    rating: '4.7 (Timeless Wealth)',
    desc: 'The landmark bestseller on wealth creation and the philosophy of individual achievement based on 500 successful tycoons.',
    pages: 238,
    category: 'Business',
    subject: ['Wealth', 'Finance', 'Success', 'Mindset']
  },

  // Fiction
  {
    title: '1984',
    author: 'George Orwell',
    year: '1949',
    cover_i: 7272162,
    rating: '4.7 (Dystopian Classic)',
    desc: 'The chilling prophecy about the future where Big Brother is always watching. A masterpiece on totalitarianism and freedom of thought.',
    pages: 328,
    category: 'Fiction',
    subject: ['Fiction', 'Classics', 'Dystopia', 'Literature']
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    year: '1988',
    cover_i: 8039542,
    rating: '4.7 (Philosophical Tale)',
    desc: 'A magical story about Santiago, an Andalusian shepherd boy who yearns to travel in search of worldly treasure.',
    pages: 208,
    category: 'Fiction',
    subject: ['Fiction', 'Philosophy', 'Adventure', 'Classics']
  },

  // Technology
  {
    title: 'Algorithms to Live By',
    author: 'Brian Christian & Tom Griffiths',
    year: '2016',
    cover_i: 8305903,
    rating: '4.7 (Computer Science Logic)',
    desc: 'The computer science of human decisions. Simple ways computer algorithms solve everyday problems from sorting socks to time management.',
    pages: 368,
    category: 'Technology',
    subject: ['Technology', 'Computer Science', 'Psychology']
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    year: '2011',
    cover_i: 7279515,
    rating: '4.6 (Nobel Prize Insight)',
    desc: 'Explore the two systems that drive our mind: System 1 is fast and intuitive; System 2 is slow and deliberative.',
    pages: 499,
    category: 'Self Help',
    subject: ['Psychology', 'Science', 'Cognition']
  }
];

window.EXPLORE_CURATED_BOOKS = EXPLORE_CURATED_BOOKS;

// ================= SPOTLIGHT HERO ENGINE =================

function initExploreSpotlight() {
  if (!window._currentSpotlightBook) {
    window._currentSpotlightBook = EXPLORE_CURATED_BOOKS[0];
  }
  updateExploreSpotlightUI(window._currentSpotlightBook);
}

function rotateExploreSpotlight() {
  const current = window._currentSpotlightBook;
  const pool = EXPLORE_CURATED_BOOKS.filter(b => !current || b.title !== current.title);
  const next = pool[Math.floor(Math.random() * pool.length)] || EXPLORE_CURATED_BOOKS[0];
  window._currentSpotlightBook = next;
  updateExploreSpotlightUI(next);
  if (typeof showToast === 'function') {
    showToast(`Spotlight: ${next.title} ✨`);
  }
}

function updateExploreSpotlightUI(book) {
  if (!book) return;
  const coverImg = document.getElementById('featuredCoverImg');
  const titleEl = document.getElementById('featuredTitle');
  const authorEl = document.getElementById('featuredAuthor');
  const descEl = document.getElementById('featuredDesc');
  const badgeEl = document.getElementById('featuredRatingVal');
  const yearEl = document.getElementById('featuredYearVal');
  const addBtn = document.getElementById('featuredAddActionBtn');

  if (coverImg) {
    coverImg.src = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : 'cover_placeholder.jpg';
    coverImg.alt = book.title;
    coverImg.onerror = function() {
      this.onerror = null;
      this.src = 'cover_placeholder.jpg';
    };
  }

  if (titleEl) titleEl.innerText = book.title;
  if (authorEl) authorEl.innerText = book.author;
  if (descEl) descEl.innerText = book.desc || 'Explore timeless wisdom and deep reading focus.';
  if (badgeEl) badgeEl.innerText = book.rating || '4.8 (Global Reader Choice)';
  if (yearEl) yearEl.innerText = book.year || 'Classic';

  if (addBtn && typeof window.state !== 'undefined' && Array.isArray(window.state.books)) {
    const already = window.state.books.some(b => b && b.title && b.title.toLowerCase() === book.title.toLowerCase());
    if (already) {
      addBtn.innerText = '✓ In Library';
      addBtn.style.opacity = '0.7';
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
    subject: spot.subject || ['Featured', 'World Discovery']
  };
  window._currentDossierDoc = doc;
  addDossierBookToLibrary();
  updateExploreSpotlightUI(spot);
}

// ================= EXPLORE MODES & FILTERING =================

function setExploreMode(mode) {
  window._currentExploreMode = mode;
  const pills = ['exploreModeTrending', 'exploreModeBestsellers', 'exploreModeClassics', 'exploreModeMindset'];
  pills.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const activeId = mode === 'bestseller' ? 'exploreModeBestsellers' :
                   mode === 'classics' ? 'exploreModeClassics' :
                   mode === 'mindset' ? 'exploreModeMindset' : 'exploreModeTrending';
  const activeEl = document.getElementById(activeId);
  if (activeEl) activeEl.classList.add('active');

  loadExploreDefaultBooks((typeof window.state !== 'undefined' && window.state.exploreGenre) || 'ALL', null, true);
}

function refreshExploreFeed() {
  const currentGenre = (typeof window.state !== 'undefined' && window.state.exploreGenre) || 'ALL';
  loadExploreDefaultBooks(currentGenre, null, true);
  if (typeof showToast === 'function') {
    showToast('✨ Nayi kitabein load ho gayi!');
  }
}

function triggerSurpriseBook() {
  const pool = EXPLORE_CURATED_BOOKS;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const doc = {
    title: pick.title,
    author_name: [pick.author],
    cover_i: pick.cover_i,
    first_publish_year: pick.year,
    number_of_pages_median: pick.pages,
    subject: pick.subject
  };
  open3dBookDossierSheet(doc);
  if (typeof showToast === 'function') {
    showToast(`Surprise Pick: "${pick.title}" 🎲✨`);
  }
}

function filterExploreCategoryTile(categoryTitle, subjectKey) {
  const chips = document.querySelectorAll('#exploreGenreChips .filter-chip');
  chips.forEach(c => {
    if (c.innerText.toLowerCase() === categoryTitle.toLowerCase()) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  if (typeof window.state !== 'undefined') {
    window.state.exploreGenre = categoryTitle;
  }
  loadExploreDefaultBooks(categoryTitle, null, true);
  const gridEl = document.getElementById('exploreBooksGrid');
  if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterExploreGenre(genre) {
  if (typeof window.state !== 'undefined') {
    window.state.exploreGenre = genre;
  }
  const chips = document.querySelectorAll('#exploreGenreChips .filter-chip');
  chips.forEach(c => {
    if (c.innerText.trim().toUpperCase() === genre.trim().toUpperCase() ||
       (genre === 'ALL' && c.innerText.trim().toUpperCase() === 'ALL')) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
  loadExploreDefaultBooks(genre, null, true);
}

// ================= LIVE FEED LOADING & INSTANT RENDERING =================

function loadExploreDefaultBooks(genre = 'ALL', customSubject = null, forceShuffle = false) {
  const grid = document.getElementById('exploreBooksGrid');
  const titleEl = document.getElementById('exploreGridHeaderTitle');
  if (!grid) return;

  // Filter curated pool by genre
  let pool = EXPLORE_CURATED_BOOKS;
  if (genre && genre !== 'ALL') {
    const gLower = genre.toLowerCase();
    pool = EXPLORE_CURATED_BOOKS.filter(b => {
      if (b.category && b.category.toLowerCase().includes(gLower)) return true;
      if (b.subject && b.subject.some(s => s.toLowerCase().includes(gLower))) return true;
      return false;
    });
    if (pool.length === 0) pool = EXPLORE_CURATED_BOOKS;
  }

  // Shuffle if requested
  let docs = [...pool];
  if (forceShuffle) {
    docs.sort(() => Math.random() - 0.5);
  }

  window._exploreDefaultBooks = docs.map(b => ({
    title: b.title,
    author_name: [b.author],
    cover_i: b.cover_i,
    first_publish_year: b.year,
    number_of_pages_median: b.pages,
    subject: b.subject
  }));

  if (titleEl) {
    titleEl.innerHTML = `${genre === 'ALL' ? 'Explore Recommendations' : genre} <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">(${window._exploreDefaultBooks.length} books)</span>`;
  }

  // INSTANT RENDER — ZERO DELAY, NO SPINNER BLOCKING
  grid.innerHTML = window._exploreDefaultBooks.map((doc, idx) => renderExploreBookCard(doc, idx)).join('');
}

// ================= PIXEL-PERFECT BOOK CARD WITH FALLBACK ART =================

function renderExploreBookCard(doc, idx) {
  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverId = doc.cover_i;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'cover_placeholder.jpg';
  const year = doc.first_publish_year || '';
  const alreadyAdded = (typeof window.state !== 'undefined' && Array.isArray(window.state.books))
    ? window.state.books.some(b => b && b.title && b.title.toLowerCase() === title.toLowerCase())
    : false;

  return `
    <div class="grid-book-card" data-explore-index="${idx}" data-is-search="false" style="cursor:pointer;position:relative;" onclick="openExploreBookDetail(${idx})">
      <div class="grid-cover-wrap" style="position:relative;background:linear-gradient(135deg,#1e293b,#0f172a);display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:12px;aspect-ratio:1/1.45;">
        <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" style="width:100%;height:100%;object-fit:cover;">
        <div class="fallback-cover-art" style="display:none;position:absolute;inset:0;background:linear-gradient(145deg, #1e1b4b, #0f172a);flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center;">
          <span style="font-size:1.8rem;margin-bottom:6px;">📖</span>
          <span style="font-size:0.75rem;font-weight:800;color:#f8fafc;line-height:1.2;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(title)}</span>
          <span style="font-size:0.62rem;color:#94a3b8;margin-top:4px;">${escapeHtml(author)}</span>
        </div>
        ${alreadyAdded ? '<span style="position:absolute;top:6px;right:6px;background:rgba(16,185,129,0.92);color:#ffffff;font-size:0.58rem;padding:2px 6px;border-radius:6px;font-weight:800;letter-spacing:0.5px;box-shadow:0 2px 6px rgba(0,0,0,0.5);z-index:2;">✓ IN LIBRARY</span>' : ''}
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
  const alreadyAdded = (typeof window.state !== 'undefined' && Array.isArray(window.state.books))
    ? window.state.books.some(b => b && b.title && b.title.toLowerCase() === title.toLowerCase())
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
        World-renowned reading discovery. Add to your personal library to log daily reading pages, track habit streaks and take notes.
      </div>

      ${alreadyAdded
        ? `<div class="dossier-btn-added" style="text-align:center;padding:14px;background:rgba(16,185,129,0.18);border:1.5px solid #10b981;border-radius:14px;color:#10b981;font-weight:800;font-size:0.9rem;">✓ Already in Your Library</div>`
        : `<button type="button" class="dossier-btn-add" id="dossierAddBtn" onclick="addDossierBookToLibrary()">+ Add to My Library</button>`
      }

      <div class="dossier-actions-row" style="display:flex;gap:10px;margin-top:12px;">
        <button type="button" class="dossier-btn-sub" onclick="saveQuickNoteFromDossier()" style="flex:1;padding:11px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#e2e8f0;font-size:0.82rem;font-weight:700;cursor:pointer;">
          <span>📝 Save Note</span>
        </button>
        <button type="button" class="dossier-btn-sub" onclick="closeExploreBookDetail()" style="flex:1;padding:11px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#cbd5e1;font-size:0.82rem;font-weight:700;cursor:pointer;">
          <span>✕ Close</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.style.cssText = 'display:flex !important;position:fixed !important;inset:0 !important;z-index:2000000 !important;align-items:flex-end !important;justify-content:center !important;background:rgba(4,7,18,0.88) !important;backdrop-filter:blur(12px) !important;pointer-events:auto !important;';
}

function addDossierBookToLibrary() {
  const doc = window._currentDossierDoc;
  if (!doc) return;

  const title = doc.title || 'Unknown Title';
  const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
  const coverId = doc.cover_i;
  const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '';
  const pages = doc.number_of_pages_median || 280;

  if (typeof window.state !== 'undefined' && Array.isArray(window.state.books)) {
    if (window.state.books.some(b => b && b.title && b.title.toLowerCase() === title.toLowerCase())) {
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
      notInterested: false,
      fromExplore: true
    };

    window.state.books.push(newBook);
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
  if (typeof window.state !== 'undefined' && Array.isArray(window.state.books)) {
    let b = window.state.books.find(x => x && x.title && x.title.toLowerCase() === (doc.title || '').toLowerCase());
    if (!b) {
      addDossierBookToLibrary();
      b = window.state.books.find(x => x && x.title && x.title.toLowerCase() === (doc.title || '').toLowerCase());
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

// ================= LIVE SEARCH =================

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
    executeExploreSearch(val.trim());
  }, 350);
}

function triggerExploreAPISearch() {
  const input = document.getElementById('exploreSearchInput');
  const query = input ? input.value.trim() : '';
  if (query.length > 0) {
    executeExploreSearch(query);
  }
}

function executeExploreSearch(query) {
  const statusEl = document.getElementById('exploreAPIStatus');
  const resultsSec = document.getElementById('exploreAPIResultsSection');
  const resultsGrid = document.getElementById('exploreAPIResultsGrid');
  const resultsTitle = document.getElementById('exploreAPIResultsTitle');

  if (!resultsSec || !resultsGrid) return;
  const qLower = query.toLowerCase();

  // Search local curated pool + DEFAULT_BOOKS
  let matches = EXPLORE_CURATED_BOOKS.filter(b => 
    b.title.toLowerCase().includes(qLower) || b.author.toLowerCase().includes(qLower) || (b.category && b.category.toLowerCase().includes(qLower))
  );

  if (typeof DEFAULT_BOOKS !== 'undefined' && Array.isArray(DEFAULT_BOOKS)) {
    DEFAULT_BOOKS.forEach(db => {
      if (!matches.some(m => m.title.toLowerCase() === db.title.toLowerCase())) {
        if (db.title.toLowerCase().includes(qLower) || (db.author && db.author.toLowerCase().includes(qLower))) {
          matches.push({
            title: db.title,
            author: db.author || 'Unknown',
            year: db.published_year || 'Classic',
            pages: db.total_pages || 250,
            subject: [db.category || 'General']
          });
        }
      }
    });
  }

  window._exploreAPIResults = matches.map(m => ({
    title: m.title,
    author_name: [m.author],
    cover_i: m.cover_i || null,
    first_publish_year: m.year,
    number_of_pages_median: m.pages || 260,
    subject: m.subject || ['General']
  }));

  if (statusEl) statusEl.style.display = 'none';
  resultsSec.style.display = 'block';
  if (resultsTitle) {
    resultsTitle.innerText = `Results for "${query}" (${window._exploreAPIResults.length})`;
  }

  if (window._exploreAPIResults.length === 0) {
    resultsGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-secondary);">Koi kitab nahi mili "${escapeHtml(query)}" ke liye. Doosra naam likhein! 🔍</div>`;
  } else {
    resultsGrid.innerHTML = window._exploreAPIResults.map((doc, idx) => {
      const title = doc.title || 'Unknown Title';
      const author = (doc.author_name && doc.author_name[0]) || 'Unknown Author';
      const coverId = doc.cover_i;
      const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'cover_placeholder.jpg';
      return `
        <div class="grid-book-card" data-explore-index="${idx}" data-is-search="true" style="cursor:pointer;" onclick="openExploreSearchBookDetail(${idx})">
          <div class="grid-cover-wrap" style="aspect-ratio:1/1.45;background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:12px;overflow:hidden;">
            <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='cover_placeholder.jpg';">
          </div>
          <div class="grid-book-meta">
            <div class="grid-book-title">${escapeHtml(title)}</div>
            <div class="grid-book-author">${escapeHtml(author)}</div>
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
  const resultsSec = document.getElementById('exploreAPIResultsSection');
  if (resultsSec) resultsSec.style.display = 'none';
  window._exploreAPIResults = null;
}

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

// Universal click delegation on document for book cards
document.addEventListener('click', function(e) {
  const card = e.target.closest('.grid-book-card');
  if (card && card.dataset && card.dataset.exploreIndex !== undefined) {
    const idx = parseInt(card.dataset.exploreIndex, 10);
    if (!isNaN(idx)) {
      if (card.dataset.isSearch === 'true') {
        openExploreSearchBookDetail(idx);
      } else {
        openExploreBookDetail(idx);
      }
    }
  }
});

// Explicit window bindings
window.escapeHtml = escapeHtml;
window.openExploreBookDetail = openExploreBookDetail;
window.openExploreSearchBookDetail = openExploreSearchBookDetail;
window.open3dBookDossierSheet = open3dBookDossierSheet;
window.closeExploreBookDetail = closeExploreBookDetail;
window.addDossierBookToLibrary = addDossierBookToLibrary;
window.saveQuickNoteFromDossier = saveQuickNoteFromDossier;
window.setExploreMode = setExploreMode;
window.refreshExploreFeed = refreshExploreFeed;
window.triggerSurpriseBook = triggerSurpriseBook;
window.filterExploreCategoryTile = filterExploreCategoryTile;
window.filterExploreGenre = filterExploreGenre;
window.openCurrentSpotlightDetail = openCurrentSpotlightDetail;
window.addCurrentSpotlightToLibrary = addCurrentSpotlightToLibrary;
window.rotateExploreSpotlight = rotateExploreSpotlight;
window.handleExploreSearchLive = handleExploreSearchLive;
window.triggerExploreAPISearch = triggerExploreAPISearch;
window.clearExploreSearch = clearExploreSearch;
window.renderExploreBooksGrid = renderExploreBooksGrid;
window.initExploreSpotlight = initExploreSpotlight;
window.updateExploreSpotlightUI = updateExploreSpotlightUI;

function initExploreView() {
  initExploreSpotlight();
  loadExploreDefaultBooks((typeof window.state !== 'undefined' && window.state.exploreGenre) || 'ALL');
}
window.initExploreView = initExploreView;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initExploreView, 150);
  });
} else {
  setTimeout(initExploreView, 150);
}
