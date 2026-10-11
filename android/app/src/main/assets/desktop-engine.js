// =========================================================================
// MIND & FOCUS - LUXURY DESKTOP WORKSPACE DASHBOARD ENGINE
// High-Resolution Laptop & Desktop Workstation Experience
// Full Feature Parity with 313 Books, 3D Reader, Lending Desk, & Modals
// =========================================================================

(function() {
  'use strict';

  // Desktop State
  window.deskState = {
    currentTab: 'reservation',
    previousTab: 'reservation',
    librarySearch: '',
    libraryCategory: 'ALL',
    libraryStatus: 'ALL',
    libraryPage: 1,
    libraryPageSize: 20,
    filterStatus: 'ALL'
  };

  // Reservation Storage
  const RESERVATIONS_STORAGE_KEY = 'mf_desk_reservations_v1';
  const DEFAULT_RESERVATIONS = [
    {
      id: 'res-1',
      bookNo: '01',
      bookTitle: 'Atomic Habits',
      bookAuthor: 'James Clear',
      bookCover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&q=80',
      holderName: 'Kunal Sharma',
      holderInit: 'K',
      holderRole: 'Top Reader',
      queue: '#1 of 1 in queue',
      expectedDate: 'Today, 05:30 PM',
      status: 'AVAILABLE_SOON'
    },
    {
      id: 'res-2',
      bookNo: '04',
      bookTitle: 'The Psychology of Money',
      bookAuthor: 'Morgan Housel',
      bookCover: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=200&q=80',
      holderName: 'Rahul Verma',
      holderInit: 'R',
      holderRole: 'Reading Club',
      queue: '#2 in line',
      expectedDate: 'Tomorrow Morning',
      status: 'WAITING'
    },
    {
      id: 'res-3',
      bookNo: '07',
      bookTitle: 'Deep Work',
      bookAuthor: 'Cal Newport',
      bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80',
      holderName: 'Amit Patel',
      holderInit: 'A',
      holderRole: 'Focus Cohort',
      queue: '#1 in line',
      expectedDate: 'Oct 14, 2026',
      status: 'WAITING'
    },
    {
      id: 'res-4',
      bookNo: '12',
      bookTitle: 'Show Your Work!',
      bookAuthor: 'Austin Kleon',
      bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80',
      holderName: 'Priya Singh',
      holderInit: 'P',
      holderRole: 'Designer',
      queue: '#1 in line',
      expectedDate: 'Oct 16, 2026',
      status: 'WAITING'
    }
  ];

  const DEFAULT_FULFILLED = [
    {
      title: 'Hyperfocus',
      author: 'Chris Bailey',
      cover: 'hyperfocus_cover.jpg',
      date: 'Picked up Yesterday'
    },
    {
      title: 'Ikigai',
      author: 'Héctor García',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80',
      date: 'Picked up Oct 08'
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&q=80',
      date: 'Picked up Oct 04'
    }
  ];

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ================= TAB SWITCHER =================
  window.switchDeskTab = function(tabName) {
    if (tabName !== 'bookDetail') {
      window.deskState.previousTab = window.deskState.currentTab;
      window.deskState.currentTab = tabName;
    }

    // Update Sidebar Active Class
    document.querySelectorAll('.desk-sidebar .nav-item').forEach(btn => {
      const t = btn.getAttribute('data-tab');
      btn.classList.toggle('active', t === tabName);
    });

    // Hide all desktop view sections
    document.querySelectorAll('.desk-view-section').forEach(sec => {
      sec.style.display = 'none';
      sec.classList.remove('active');
    });

    const tabMap = {
      'reservation': 'deskViewReservation',
      'home': 'deskViewHome',
      'library': 'deskViewLibrary',
      'explore': 'deskViewExplore',
      'lending': 'deskViewLending',
      'notes': 'deskViewNotes',
      'stats': 'deskViewStats',
      'profile': 'deskViewProfile',
      'settings': 'deskViewSettings',
      'bookDetail': 'deskViewBookDetailWrap'
    };

    const targetId = tabMap[tabName] || 'deskViewReservation';
    const targetSec = document.getElementById(targetId);
    if (targetSec) {
      targetSec.style.display = 'block';
      targetSec.classList.add('active');
    }

    // Render tab content
    if (tabName === 'reservation') renderDeskReservations();
    else if (tabName === 'home') renderDeskHome();
    else if (tabName === 'library') renderDeskLibrary();
    else if (tabName === 'explore') renderDeskExplore();
    else if (tabName === 'lending') renderDeskLending();
    else if (tabName === 'notes') renderDeskNotes();
    else if (tabName === 'stats') renderDeskStats();
    else if (tabName === 'profile') renderDeskProfile();
    else if (tabName === 'settings') renderDeskSettings();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= BOOK DETAIL INTEGRATION =================
  window.openDeskBookDetail = function(bookOrIndex) {
    let book = null;
    let idx = -1;

    const allBooks = (window.state && window.state.books && window.state.books.length > 0)
      ? window.state.books
      : (typeof DEFAULT_BOOKS !== 'undefined' ? DEFAULT_BOOKS : []);

    if (typeof bookOrIndex === 'number') {
      idx = bookOrIndex;
      book = allBooks[idx];
    } else if (typeof bookOrIndex === 'object' && bookOrIndex !== null) {
      book = bookOrIndex;
      idx = allBooks.indexOf(book);
    }

    if (!book) return;

    if (window.state) {
      window.state.currentBook = book;
      window.state.currentBookIndex = idx;
    }

    // Call app.js openBookDetailView logic
    if (typeof window.openBookDetailView === 'function') {
      try {
        window.openBookDetailView(book);
      } catch (err) {
        console.warn('Desktop detail open error:', err);
      }
    }

    // Switch to detail view inside desktop layout
    window.switchDeskTab('bookDetail');
  };

  // Override closeBookDetailView to stay on desktop
  window.closeBookDetailView = function() {
    const returnTab = (window.deskState.previousTab && window.deskState.previousTab !== 'bookDetail')
      ? window.deskState.previousTab
      : 'library';
    window.switchDeskTab(returnTab);
  };

  // ================= 1. RESERVATIONS DESK =================
  function loadReservationsData() {
    try {
      const saved = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_RESERVATIONS));
    return DEFAULT_RESERVATIONS;
  }

  function saveReservationsData(data) {
    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  window.renderDeskReservations = function() {
    const reservations = loadReservationsData();
    const filter = window.deskState.filterStatus || 'ALL';

    const countAvailable = reservations.filter(r => r.status === 'AVAILABLE_SOON').length;
    const countWaiting = reservations.filter(r => r.status === 'WAITING').length;
    const countTotal = reservations.length;

    const elAvail = document.getElementById('deskMetricAvailable');
    const elWait = document.getElementById('deskMetricWaiting');
    const elTotal = document.getElementById('deskMetricTotalQueue');
    if (elAvail) elAvail.innerText = countAvailable;
    if (elWait) elWait.innerText = countWaiting;
    if (elTotal) elTotal.innerText = countTotal;

    const filtered = reservations.filter(item => {
      if (filter === 'ALL') return true;
      if (filter === 'AVAILABLE_SOON') return item.status === 'AVAILABLE_SOON';
      if (filter === 'WAITING') return item.status === 'WAITING';
      return true;
    });

    const tbody = document.getElementById('deskWaitlistTableBody');
    if (tbody) {
      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 48px; color: var(--text-muted);">
              No reservations found under this filter. Click "+ Reserve A Book" to create one.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = filtered.map(item => `
          <tr>
            <td class="table-index-col">${escapeHtml(item.bookNo || '01')}</td>
            <td>
              <div class="table-book-cell">
                <img src="${item.bookCover || 'cover_placeholder.jpg'}" class="table-book-cover" onerror="this.src='cover_placeholder.jpg'">
                <div class="table-book-meta">
                  <span class="table-book-title">${escapeHtml(item.bookTitle)}</span>
                  <span class="table-book-author">${escapeHtml(item.bookAuthor)}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="table-holder-cell">
                <div class="holder-avatar">${escapeHtml(item.holderInit || item.holderName[0] || 'U')}</div>
                <div class="holder-info">
                  <span class="holder-name">${escapeHtml(item.holderName)}</span>
                  <span class="holder-role">${escapeHtml(item.holderRole || 'Friend')}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="queue-pill ${item.queue.startsWith('#1 of 1') ? 'first' : ''}">${escapeHtml(item.queue)}</span>
            </td>
            <td>
              <div class="date-meta-text">
                <span>📅</span>
                <span>${escapeHtml(item.expectedDate)}</span>
              </div>
            </td>
            <td>
              <span class="status-badge ${item.status === 'AVAILABLE_SOON' ? 'available' : 'waiting'}">
                ${item.status === 'AVAILABLE_SOON' ? '● Available Soon' : '🕒 Waiting'}
              </span>
            </td>
            <td style="text-align: right;">
              <div class="table-actions-cell" style="justify-content: flex-end;">
                ${item.status === 'AVAILABLE_SOON' ? `
                  <button type="button" class="btn-action-confirm" onclick="confirmReservation('${item.id}')">Confirm</button>
                ` : `
                  <button type="button" class="btn-action-remind" onclick="remindHolder('${item.id}')">🔔 Remind</button>
                `}
                <button type="button" class="btn-action-more" onclick="deleteReservation('${item.id}')" title="Delete">✕</button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    // Fulfilled Grid
    const fulfilledGrid = document.getElementById('deskFulfilledGrid');
    if (fulfilledGrid) {
      fulfilledGrid.innerHTML = DEFAULT_FULFILLED.map(item => `
        <div class="fulfilled-card">
          <img src="${item.cover}" class="fulfilled-thumb" onerror="this.src='cover_placeholder.jpg'">
          <div class="fulfilled-info">
            <div class="fulfilled-title">${escapeHtml(item.title)}</div>
            <div class="fulfilled-author">${escapeHtml(item.author)}</div>
            <div class="fulfilled-date">${escapeHtml(item.date)}</div>
          </div>
          <div class="fulfilled-pill">Fulfilled &check;</div>
        </div>
      `).join('');
    }
  };

  window.setDeskFilter = function(filterVal) {
    window.deskState.filterStatus = filterVal;
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filterVal);
    });
    renderDeskReservations();
  };

  window.remindHolder = function(id) {
    const list = loadReservationsData();
    const item = list.find(r => r.id === id);
    if (!item) return;
    if (typeof showToast === 'function') {
      showToast(`🔔 Reminder notice prepared for ${item.holderName}`);
    } else {
      alert(`Reminder sent to ${item.holderName} for "${item.bookTitle}"`);
    }
  };

  window.confirmReservation = function(id) {
    let list = loadReservationsData();
    const item = list.find(r => r.id === id);
    if (!item) return;
    if (confirm(`Confirm and fulfill reservation for "${item.bookTitle}"?`)) {
      list = list.filter(r => r.id !== id);
      saveReservationsData(list);
      renderDeskReservations();
      if (typeof showToast === 'function') showToast(`✓ Reservation for "${item.bookTitle}" confirmed!`);
    }
  };

  window.deleteReservation = function(id) {
    let list = loadReservationsData();
    const item = list.find(r => r.id === id);
    if (!item) return;
    if (confirm(`Remove "${item.bookTitle}" from waitlist?`)) {
      list = list.filter(r => r.id !== id);
      saveReservationsData(list);
      renderDeskReservations();
      if (typeof showToast === 'function') showToast('Reservation removed');
    }
  };

  window.openReserveModal = function() {
    const overlay = document.getElementById('reserveBookModalOverlay');
    if (overlay) overlay.style.display = 'flex';
  };

  window.closeReserveModal = function() {
    const overlay = document.getElementById('reserveBookModalOverlay');
    if (overlay) overlay.style.display = 'none';
  };

  window.saveNewReservation = function() {
    const title = (document.getElementById('resInputTitle')?.value || '').trim();
    const author = (document.getElementById('resInputAuthor')?.value || '').trim();
    const holder = (document.getElementById('resInputHolder')?.value || '').trim();
    const phone = (document.getElementById('resInputPhone')?.value || '').trim();
    const date = (document.getElementById('resInputDate')?.value || '').trim();

    if (!title || !holder) {
      alert('Please enter Book Title and Holder Name');
      return;
    }

    const list = loadReservationsData();
    const newItem = {
      id: 'res-' + Date.now(),
      bookNo: String(list.length + 1).padStart(2, '0'),
      bookTitle: title,
      bookAuthor: author || 'Unknown',
      bookCover: 'cover_placeholder.jpg',
      holderName: holder,
      holderInit: holder[0].toUpperCase(),
      holderRole: phone ? `Ph: ${phone}` : 'Reader',
      queue: `#${list.length + 1} in queue`,
      expectedDate: date ? date : 'Next Week',
      status: 'WAITING'
    };

    list.push(newItem);
    saveReservationsData(list);
    closeReserveModal();
    renderDeskReservations();
    if (typeof showToast === 'function') showToast(`✓ Added "${title}" to reservation desk!`);
  };

  // ================= 2. MY LIBRARY (ALL 313 BOOKS) =================
  window.renderDeskLibrary = function() {
    const tbody = document.getElementById('deskLibraryTableBody');
    const badge = document.getElementById('deskLibraryTotalBadge');
    if (!tbody) return;

    const allBooks = (window.state && window.state.books && window.state.books.length > 0)
      ? window.state.books
      : (typeof DEFAULT_BOOKS !== 'undefined' ? DEFAULT_BOOKS : []);

    if (badge) badge.innerText = allBooks.length;

    // Filter books by search, category, status
    const search = (window.deskState.librarySearch || '').toLowerCase().trim();
    const cat = window.deskState.libraryCategory || 'ALL';
    const stat = window.deskState.libraryStatus || 'ALL';

    const filtered = allBooks.map((b, originalIdx) => ({ book: b, idx: originalIdx })).filter(item => {
      const b = item.book;
      if (b.notInterested) return false;
      if (cat !== 'ALL' && (b.category || '') !== cat) return false;
      if (stat !== 'ALL' && (b.status || 'PENDING') !== stat) return false;
      if (search) {
        const titleMatch = (b.title || '').toLowerCase().includes(search);
        const authorMatch = (b.author || '').toLowerCase().includes(search);
        const catMatch = (b.category || '').toLowerCase().includes(search);
        const langMatch = (b.language || '').toLowerCase().includes(search);
        if (!titleMatch && !authorMatch && !catMatch && !langMatch) return false;
      }
      return true;
    });

    const pageSize = window.deskState.libraryPageSize || 20;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (window.deskState.libraryPage > totalPages) window.deskState.libraryPage = totalPages;
    const currentPage = window.deskState.libraryPage || 1;

    const startIdx = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 48px; color: var(--text-muted);">
            No books found matching "${escapeHtml(search)}".
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pageItems.map((item, rowIdx) => {
        const b = item.book;
        const realIdx = item.idx;
        const displayNo = b.no || b.book_no || (startIdx + rowIdx + 1);

        let statusHtml = '<span class="status-badge" style="background:rgba(255,255,255,0.06); color:#94a3b8;">⏳ Want to Read</span>';
        if (b.status === 'READING') {
          statusHtml = '<span class="status-badge waiting">📖 Reading</span>';
        } else if (b.status === 'DONE') {
          statusHtml = '<span class="status-badge available">✓ Completed</span>';
        } else if (b.status === 'LENT') {
          statusHtml = '<span class="status-badge" style="background:rgba(59,130,246,0.15); color:#60a5fa;">🤝 Lent Out</span>';
        }

        return `
          <tr style="cursor: pointer;" onclick="openDeskBookDetail(${realIdx})">
            <td class="table-index-col">${displayNo}</td>
            <td>
              <div class="table-book-cell">
                <img src="${b.cover_image || b.cover_url || 'cover_placeholder.jpg'}" class="table-book-cover" onerror="this.src='cover_placeholder.jpg'">
                <div class="table-book-meta">
                  <span class="table-book-title">${escapeHtml(b.title)}</span>
                  <span class="table-book-author">${escapeHtml(b.author || 'Unknown Author')}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="queue-pill">${escapeHtml(b.category || 'General')}</span>
            </td>
            <td>${statusHtml}</td>
            <td style="color:var(--text-secondary); font-size:0.82rem;">${escapeHtml(b.language || 'HINDI')}</td>
            <td style="text-align:right;" onclick="event.stopPropagation()">
              <button type="button" class="btn-action-remind" onclick="openRealBookReader(${realIdx})">📖 Read Preview</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Render / Update Pagination Controls
    let pagEl = document.getElementById('deskLibraryPagination');
    if (!pagEl) {
      const container = tbody.closest('.desk-table-container');
      if (container) {
        pagEl = document.createElement('div');
        pagEl.id = 'deskLibraryPagination';
        pagEl.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-top:1px solid var(--border-card); background:rgba(255,255,255,0.01);';
        container.appendChild(pagEl);
      }
    }

    if (pagEl) {
      pagEl.innerHTML = `
        <span style="font-size:0.84rem; color:var(--text-secondary);">
          Showing <strong>${filtered.length > 0 ? startIdx + 1 : 0} - ${Math.min(filtered.length, startIdx + pageSize)}</strong> of <strong>${filtered.length}</strong> books
        </span>
        <div style="display:flex; gap:10px; align-items:center;">
          <button type="button" class="btn-action-more" style="width:auto; padding:6px 14px; font-size:0.82rem;" ${currentPage <= 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : 'onclick="deskLibraryPrevPage()"'} >&larr; Prev</button>
          <span style="font-size:0.84rem; color:var(--text-primary); font-weight:600;">Page ${currentPage} of ${totalPages}</span>
          <button type="button" class="btn-action-more" style="width:auto; padding:6px 14px; font-size:0.82rem;" ${currentPage >= totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : 'onclick="deskLibraryNextPage()"'} >Next &rarr;</button>
        </div>
      `;
    }
  };

  window.deskLibraryPrevPage = function() {
    if (window.deskState.libraryPage > 1) {
      window.deskState.libraryPage--;
      renderDeskLibrary();
    }
  };

  window.deskLibraryNextPage = function() {
    window.deskState.libraryPage++;
    renderDeskLibrary();
  };

  // Wire Desktop Global Search Input
  const deskSearch = document.getElementById('deskSearchInput');
  if (deskSearch) {
    deskSearch.addEventListener('input', function(e) {
      const q = e.target.value;
      window.deskState.librarySearch = q;
      window.deskState.libraryPage = 1;
      if (window.deskState.currentTab !== 'library') {
        window.switchDeskTab('library');
      } else {
        renderDeskLibrary();
      }
    });
  }

  // ================= 3. HOME VIEW =================
  window.renderDeskHome = function() {
    const allBooks = (window.state && window.state.books && window.state.books.length > 0)
      ? window.state.books
      : (typeof DEFAULT_BOOKS !== 'undefined' ? DEFAULT_BOOKS : []);

    // 1. Featured Grid
    const featuredGrid = document.getElementById('deskHomeFeaturedGrid');
    if (featuredGrid) {
      const featured = allBooks.slice(0, 6);
      featuredGrid.innerHTML = featured.map((b, idx) => `
        <div class="fulfilled-card" style="cursor:pointer;" onclick="openDeskBookDetail(${idx})">
          <img src="${b.cover_image || b.cover_url || 'cover_placeholder.jpg'}" class="fulfilled-thumb" onerror="this.src='cover_placeholder.jpg'">
          <div class="fulfilled-info">
            <div class="fulfilled-title">${escapeHtml(b.title)}</div>
            <div class="fulfilled-author">${escapeHtml(b.author || 'Author')}</div>
            <div class="fulfilled-date">${escapeHtml(b.category || 'General')} &bull; ${b.pages || 250}p</div>
          </div>
          <div class="fulfilled-pill" onclick="event.stopPropagation(); openRealBookReader(${idx})">📖 Read</div>
        </div>
      `).join('');
    }

    // 2. Currently Reading Hero Card inside Home
    let heroWrap = document.getElementById('deskHomeCurrentHero');
    const homeSec = document.getElementById('deskViewHome');
    if (!heroWrap && homeSec) {
      heroWrap = document.createElement('div');
      heroWrap.id = 'deskHomeCurrentHero';
      heroWrap.style.marginBottom = '24px';
      const firstHeader = homeSec.querySelector('.desk-section-header');
      if (firstHeader) homeSec.insertBefore(heroWrap, firstHeader);
      else homeSec.prepend(heroWrap);
    }

    if (heroWrap) {
      const activeBook = (window.state && window.state.currentBook) || allBooks.find(b => b.status === 'READING') || allBooks[0];
      const curIdx = allBooks.indexOf(activeBook);
      const totalP = activeBook ? (activeBook.pages || activeBook.total_pages || 200) : 200;
      const curP = activeBook ? (activeBook.current_page || 0) : 0;
      const pct = Math.min(100, Math.round((curP / totalP) * 100));

      if (activeBook) {
        heroWrap.innerHTML = `
          <div class="hero-banner-card" style="background: linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(18,24,38,0.95) 100%);">
            <div style="display:flex; align-items:center; gap:24px; width:100%; flex-wrap:wrap;">
              <img src="${activeBook.cover_image || activeBook.cover_url || 'cover_placeholder.jpg'}" style="width:72px; height:104px; border-radius:8px; object-fit:cover; box-shadow:0 8px 24px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.12);" onerror="this.src='cover_placeholder.jpg'">
              <div style="flex:1; min-width:240px;">
                <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--accent-gold); font-weight:700;">Currently Reading</span>
                <h3 style="font-size:1.35rem; color:#fff; font-weight:800; margin:4px 0 2px;">${escapeHtml(activeBook.title)}</h3>
                <div style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:10px;">${escapeHtml(activeBook.author || 'Author')} &bull; ${escapeHtml(activeBook.category || 'General')}</div>
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="flex:1; max-width:280px; height:6px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, #f59e0b, #10b981); border-radius:10px;"></div>
                  </div>
                  <span style="font-size:0.78rem; color:var(--text-primary); font-weight:700;">${pct}% (${curP}/${totalP}p)</span>
                </div>
              </div>
              <div style="display:flex; gap:12px;">
                <button type="button" class="btn-action-confirm" style="padding:10px 20px; font-size:0.88rem;" onclick="openRealBookReader(${curIdx})">📖 Continue Reading</button>
                <button type="button" class="btn-action-more" style="width:auto; padding:10px 18px; font-size:0.88rem;" onclick="openDeskBookDetail(${curIdx})">View Details</button>
              </div>
            </div>
          </div>
        `;
      }
    }
  };

  // ================= 4. EXPLORE VIEW =================
  window.renderDeskExplore = function() {
    const container = document.getElementById('deskExploreGrid');
    if (!container) return;
    const cats = [
      { name: 'Self-Help & Habits', count: '48 Books', icon: '⚡' },
      { name: 'Wealth & Money Psychology', count: '36 Books', icon: '💰' },
      { name: 'Focus & Productivity', count: '29 Books', icon: '🎯' },
      { name: 'Philosophy & Wisdom', count: '42 Books', icon: '🏛️' },
      { name: 'Hindi Classic Literature', count: '65 Books', icon: '📜' },
      { name: 'Biographies & Titans', count: '34 Books', icon: '👑' }
    ];
    container.innerHTML = cats.map(c => `
      <div class="fulfilled-card" style="cursor:pointer;" onclick="filterLibraryByGenre('${escapeHtml(c.name)}')">
        <div class="metric-icon-circle gold" style="width:44px; height:44px; font-size:1.3rem;">${c.icon}</div>
        <div class="fulfilled-info">
          <div class="fulfilled-title">${c.name}</div>
          <div class="fulfilled-author">${c.count}</div>
        </div>
        <div class="fulfilled-pill">Explore &rarr;</div>
      </div>
    `).join('');
  };

  window.filterLibraryByGenre = function(catName) {
    window.deskState.libraryCategory = catName;
    window.deskState.librarySearch = '';
    window.deskState.libraryPage = 1;
    window.switchDeskTab('library');
  };

  // ================= 5. LENDING DESK =================
  window.renderDeskLending = function() {
    const tbody = document.getElementById('deskLendingTableBody');
    if (!tbody) return;

    const records = (typeof lendingRecords !== 'undefined' && Array.isArray(lendingRecords))
      ? lendingRecords.filter(r => !r.returned)
      : [];

    if (records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 48px; color: var(--text-muted);">
            No active lent books right now. All books are safe on your personal bookshelf!
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = records.map((r, idx) => `
        <tr>
          <td class="table-index-col">${idx + 1}</td>
          <td>
            <span style="font-weight:700; color:#fff;">${escapeHtml(r.bookTitle)}</span>
          </td>
          <td>
            <div class="table-holder-cell">
              <div class="holder-avatar">${escapeHtml(r.borrower ? r.borrower[0].toUpperCase() : 'F')}</div>
              <div class="holder-info">
                <span class="holder-name">${escapeHtml(r.borrower)}</span>
                <span class="holder-role">${escapeHtml(r.phone || 'Friend')}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="date-meta-text">
              <span>📅</span>
              <span>${escapeHtml(r.lendDate || 'Recent')}</span>
            </div>
          </td>
          <td>
            <span class="status-badge waiting">With Friend</span>
          </td>
          <td style="text-align:right;">
            <button type="button" class="btn-action-confirm" onclick="returnLentBook('${r.id}')">✓ Return Book</button>
          </td>
        </tr>
      `).join('');
    }
  };

  window.returnLentBook = function(recordId) {
    if (typeof markBookReturned === 'function') {
      markBookReturned(recordId);
      renderDeskLending();
    } else if (confirm('Mark this book as returned back to your shelf?')) {
      if (typeof lendingRecords !== 'undefined') {
        const rec = lendingRecords.find(r => r.id === recordId);
        if (rec) rec.returned = true;
        try { localStorage.setItem('mf_lending_records', JSON.stringify(lendingRecords)); } catch(e){}
      }
      renderDeskLending();
      if (typeof showToast === 'function') showToast('Book returned back to shelf');
    }
  };

  // ================= 6. NOTES & HIGHLIGHTS =================
  window.renderDeskNotes = function() {
    const container = document.getElementById('deskNotesGrid');
    if (!container) return;

    const allBooks = (window.state && window.state.books && window.state.books.length > 0)
      ? window.state.books
      : (typeof DEFAULT_BOOKS !== 'undefined' ? DEFAULT_BOOKS : []);

    const booksWithNotes = allBooks.filter(b => b.takeaway && b.takeaway.trim().length > 0);

    const defaultNotes = [
      { title: 'Deep Work Takeaway', book: 'Deep Work by Cal Newport', date: 'Oct 08, 2026', text: 'High-Quality Work Produced = (Time Spent) x (Intensity of Focus)' },
      { title: 'Habit Loop Insight', book: 'Atomic Habits by James Clear', date: 'Oct 02, 2026', text: 'You do not rise to the level of your goals. You fall to the level of your systems.' },
      { title: 'Focus Productivity', book: 'Hyperfocus by Chris Bailey', date: 'Sep 24, 2026', text: 'Scatterfocus unlocks creative connections by letting the mind wander purposefully.' }
    ];

    const displayNotes = booksWithNotes.length > 0
      ? booksWithNotes.slice(0, 12).map(b => ({
          title: 'Key Reflection',
          book: `${b.title} by ${b.author || 'Author'}`,
          date: b.end_date || b.start_date || 'Saved',
          text: b.takeaway,
          idx: allBooks.indexOf(b)
        }))
      : defaultNotes;

    container.innerHTML = displayNotes.map(n => `
      <div class="fulfilled-card" style="flex-direction:column; align-items:flex-start; gap:8px; cursor:pointer;" ${n.idx !== undefined ? `onclick="openDeskBookDetail(${n.idx})"` : ''}>
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <div class="fulfilled-title">${escapeHtml(n.title)}</div>
          <span style="font-size:0.72rem; color:var(--text-muted);">${escapeHtml(n.date)}</span>
        </div>
        <div style="font-size:0.78rem; color:var(--accent-gold); font-weight:600;">${escapeHtml(n.book)}</div>
        <div style="font-size:0.84rem; color:var(--text-secondary); line-height:1.4;">"${escapeHtml(n.text)}"</div>
      </div>
    `).join('');
  };

  // ================= 7. STATS & ANALYTICS =================
  window.renderDeskStats = function() {
    const allBooks = (window.state && window.state.books && window.state.books.length > 0)
      ? window.state.books
      : (typeof DEFAULT_BOOKS !== 'undefined' ? DEFAULT_BOOKS : []);

    const finished = allBooks.filter(b => b.status === 'DONE').length;
    const reading = allBooks.filter(b => b.status === 'READING').length;
    const totalPages = allBooks.reduce((acc, b) => acc + (Number(b.current_page) || 0), 0);
    const totalBudget = allBooks.reduce((acc, b) => acc + (Number(b.price) || 0), 0);

    const statsSec = document.getElementById('deskViewStats');
    if (statsSec) {
      const grid = statsSec.querySelector('.desk-action-grid');
      if (grid) {
        grid.innerHTML = `
          <div class="metric-pill-card">
            <div class="metric-icon-circle gold">📖</div>
            <div class="metric-meta-block">
              <span class="metric-lbl">Books Finished</span>
              <span class="metric-val">${finished} Books</span>
              <span class="metric-sub">${reading} currently in progress</span>
            </div>
          </div>
          <div class="metric-pill-card">
            <div class="metric-icon-circle blue">📄</div>
            <div class="metric-meta-block">
              <span class="metric-lbl">Pages Read</span>
              <span class="metric-val">${totalPages.toLocaleString()} Pages</span>
              <span class="metric-sub">Across all titles</span>
            </div>
          </div>
          <div class="metric-pill-card">
            <div class="metric-icon-circle" style="background: rgba(16,185,129,0.15); color:#10b981;">💰</div>
            <div class="metric-meta-block">
              <span class="metric-lbl">Library Investment</span>
              <span class="metric-val">₹${totalBudget.toLocaleString()}</span>
              <span class="metric-sub">313 Masterpieces</span>
            </div>
          </div>
        `;
      }
    }
  };

  // ================= 8. PROFILE VIEW =================
  window.renderDeskProfile = function() {
    const profile = (window.state && window.state.profile) || {};
    const name = profile.name || 'Ankit';
    const goal = profile.yearly_goal || 25;
    const bio = profile.bio || 'Book Lover • Dreamer • Lifelong Learner • Mind & Focus Collector';

    const avatar = document.querySelector('#deskViewProfile .profile-avatar-circle');
    if (avatar) avatar.innerText = name[0] ? name[0].toUpperCase() : 'A';

    const titleH2 = document.querySelector('#deskViewProfile .hero-text-block h2');
    if (titleH2) titleH2.innerText = name;

    const bioP = document.querySelector('#deskViewProfile .hero-text-block p');
    if (bioP) bioP.innerText = bio;
  };

  // ================= 9. SETTINGS VIEW =================
  window.renderDeskSettings = function() {
    const settingsSec = document.getElementById('deskViewSettings');
    if (!settingsSec) return;
    const grid = settingsSec.querySelector('.bottom-cards-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="fulfilled-card" style="cursor:pointer;" onclick="exportDesktopBackup()">
          <div class="metric-icon-circle gold" style="width:40px; height:40px; font-size:1.1rem;">💾</div>
          <div class="fulfilled-info">
            <div class="fulfilled-title">Download JSON Backup</div>
            <div class="fulfilled-author">Export all 313 books, reading notes, and progress to disk</div>
          </div>
          <div class="fulfilled-pill">Export &darr;</div>
        </div>
        <div class="fulfilled-card" style="cursor:pointer;" onclick="toggleAppFullscreen()">
          <div class="metric-icon-circle blue" style="width:40px; height:40px; font-size:1.1rem;">💻</div>
          <div class="fulfilled-info">
            <div class="fulfilled-title">Toggle Fullscreen Display</div>
            <div class="fulfilled-author">Distraction-free luxury widescreen workstation</div>
          </div>
          <div class="fulfilled-pill">Toggle &harr;</div>
        </div>
      `;
    }
  };

  window.exportDesktopBackup = function() {
    if (typeof exportLibraryBackup === 'function') {
      exportLibraryBackup();
    } else {
      const backupData = {
        books: window.state ? window.state.books : [],
        profile: window.state ? window.state.profile : {},
        reservations: loadReservationsData(),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mind-focus-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (typeof showToast === 'function') showToast('✓ Backup downloaded successfully');
    }
  };

  // ================= HOOK REAL-TIME UPDATES =================
  const originalRenderApp = window.renderApp;
  window.renderApp = function() {
    if (typeof originalRenderApp === 'function') {
      try { originalRenderApp(); } catch(e){}
    }
    // Update active desktop view
    if (window.deskState.currentTab === 'library') renderDeskLibrary();
    else if (window.deskState.currentTab === 'home') renderDeskHome();
    else if (window.deskState.currentTab === 'stats') renderDeskStats();
    else if (window.deskState.currentTab === 'lending') renderDeskLending();
    else if (window.deskState.currentTab === 'notes') renderDeskNotes();
    else if (window.deskState.currentTab === 'profile') renderDeskProfile();
  };

  // Initialize Desktop Dashboard
  function initDesktop() {
    renderDeskReservations();
    renderDeskHome();
    renderDeskLibrary();
    renderDeskExplore();
    renderDeskLending();
    renderDeskNotes();
    renderDeskStats();
    renderDeskProfile();
    renderDeskSettings();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => setTimeout(initDesktop, 100));
  } else {
    setTimeout(initDesktop, 100);
  }

})();
