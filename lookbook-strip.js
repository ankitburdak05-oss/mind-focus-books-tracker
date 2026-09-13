/**
 * FULL PHOTO AUTO-SCROLLING FASHION REEL
 * "full photo, stry ki tarh nhi, full auto scoll ho"
 */

(function() {
  'use strict';

  // Full length outfits list
  const FULL_LOOKS_DATA = [
    {
      id: 1,
      name: 'Denim Jacket Look',
      tag: 'Street Classic',
      src: 'assets/fashion/full/01_denim_jacket_full.png',
      desc: 'Classic vintage washed blue denim trucker jacket paired with crisp white crewneck tee, black jeans, and fresh white sneakers.'
    },
    {
      id: 2,
      name: 'Beige Layered Outfit',
      tag: 'Autumn Luxe',
      src: 'assets/fashion/full/02_beige_layered_full.png',
      desc: 'Sophisticated relaxed beige overshirt layered over clean white tee with tailored beige trousers and white designer sneakers.'
    },
    {
      id: 3,
      name: 'Black Cargo Streetwear',
      tag: 'Urban Stealth',
      src: 'assets/fashion/full/03_black_monochrome_full.png',
      desc: 'All-black modern silhouette featuring premium black crewneck sweatshirt, black tactical cargo pants, tinted shades, and polished shoes.'
    },
    {
      id: 4,
      name: 'White Kurta Heritage',
      tag: 'Royal Ethnic',
      src: 'assets/fashion/full/04_white_kurta_full.png',
      desc: 'Graceful handcrafted pristine white festive kurta with subtle jacquard self-weave, tailored pajama, and rich brown leather loafers.'
    },
    {
      id: 5,
      name: 'Black T-Shirt Style',
      tag: 'Casual Minimal',
      src: 'assets/fashion/01_black_tshirt.png',
      desc: 'Sleek dark fitted aesthetic. Pure minimalist vibe suitable for high-focus reading sessions and confident everyday wear.'
    },
    {
      id: 6,
      name: 'Crisp White Tee',
      tag: 'Clean Aesthetic',
      src: 'assets/fashion/02_white_tshirt.png',
      desc: 'Organic cotton white t-shirt. Clean, sharp, and universally versatile for any modern smart-casual combination.'
    },
    {
      id: 7,
      name: 'Executive Formal Suit',
      tag: 'Executive Tux',
      src: 'assets/fashion/06_black_formal_suit.png',
      desc: 'Tailored black notch-lapel dinner suit with white dress shirt and black slim tie. Executive power and refined excellence.'
    },
    {
      id: 8,
      name: 'Oversized Black Hoodie',
      tag: 'Street Comfort',
      src: 'assets/fashion/04_black_hoodie.png',
      desc: 'Heavyweight cozy fleece black hoodie with athletic drop shoulders. Ultimate cozy street style comfort.'
    },
    {
      id: 9,
      name: 'Navy Classic Polo',
      tag: 'Smart Casual',
      src: 'assets/fashion/05_navy_polo.png',
      desc: 'Deep navy blue pique polo with ribbed collar. Timeless athletic elegance and breathable comfort.'
    },
    {
      id: 10,
      name: 'Black Button-Down Shirt',
      tag: 'Evening Sharp',
      src: 'assets/fashion/03_black_shirt.png',
      desc: 'Structured slim-cut black button-down shirt. Clean collar lines for formal dinners and nighttime occasions.'
    }
  ];

  let currentModalIdx = 0;
  let isAutoScrollPaused = false;

  function initFullPhotoReel() {
    let target = document.getElementById('topLookbookStoryStrip');
    if (!target) {
      const stageContent = document.getElementById('stageContentScroll');
      if (stageContent) {
        target = document.createElement('div');
        target.id = 'topLookbookStoryStrip';
        stageContent.insertBefore(target, stageContent.firstChild);
      } else {
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
          target = document.createElement('div');
          target.id = 'topLookbookStoryStrip';
          mainContainer.insertBefore(target, mainContainer.firstChild);
        } else {
          return;
        }
      }
    }

    renderFullPhotoReel(target);
    createFullPhotoModal();
  }

  function renderFullPhotoReel(container) {
    // Generate items for continuous marquee (original + clone for seamless infinite loop)
    function generateCards(list, cloneSuffix) {
      return list.map((item, idx) => `
        <div class="fullphoto-card" data-index="${idx}" onclick="window.openFullPhotoModal(${idx})">
          <img src="${item.src}" alt="${item.name}" class="fullphoto-card-img" loading="lazy">
          <div class="fullphoto-card-overlay">
            <div class="fullphoto-card-top-row">
              <span class="fullphoto-card-tag">${item.tag}</span>
              <span class="fullphoto-card-pill-glow">#${item.id}</span>
            </div>
            <div class="fullphoto-card-bottom">
              <span class="fullphoto-card-title">${item.name}</span>
              <span class="fullphoto-card-desc">${item.desc}</span>
              <span class="fullphoto-card-tap">🔍 Tap to expand</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    const cardsHtml = generateCards(FULL_LOOKS_DATA, '') + generateCards(FULL_LOOKS_DATA, '_clone');

    container.innerHTML = `
      <div class="fullphoto-strip-container">
        <!-- Header -->
        <div class="fullphoto-strip-header">
          <div class="fullphoto-header-left">
            <span class="fullphoto-live-badge">
              <span class="fullphoto-live-dot"></span>
              Auto-Scroll Reel
            </span>
            <span class="fullphoto-header-title">🔥 Fashion Lookbook</span>
          </div>
          <div class="fullphoto-header-actions">
            <button type="button" class="fullphoto-action-btn" id="btnToggleAutoScroll" onclick="window.toggleAutoScrollReel()" title="Pause / Resume Auto-Scroll">
              <span id="autoScrollStatusIcon">⏸️</span>
              <span id="autoScrollStatusText">Auto-Scroll ON</span>
            </button>
            <button type="button" class="fullphoto-action-btn fullphoto-nav-arrow" onclick="window.nudgeReel(-280)" title="Scroll Left">‹</button>
            <button type="button" class="fullphoto-action-btn fullphoto-nav-arrow" onclick="window.nudgeReel(280)" title="Scroll Right">›</button>
          </div>
        </div>

        <!-- Auto-Scrolling Marquee Viewport -->
        <div class="fullphoto-marquee-viewport" id="fullPhotoViewport">
          <div class="fullphoto-marquee-track" id="fullPhotoTrack">
            ${cardsHtml}
          </div>
        </div>
      </div>
    `;

    // Interactive Drag / Touch Scroll handling
    const viewport = document.getElementById('fullPhotoViewport');
    const track = document.getElementById('fullPhotoTrack');

    if (viewport && track) {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      viewport.addEventListener('mousedown', (e) => {
        isDown = true;
        viewport.classList.add('paused');
        startX = e.pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
      });

      viewport.addEventListener('mouseleave', () => {
        isDown = false;
        if (!isAutoScrollPaused) viewport.classList.remove('paused');
      });

      viewport.addEventListener('mouseup', () => {
        isDown = false;
        if (!isAutoScrollPaused) viewport.classList.remove('paused');
      });

      viewport.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - viewport.offsetLeft;
        const walk = (x - startX) * 1.5;
        viewport.scrollLeft = scrollLeft - walk;
      });
    }
  }

  window.toggleAutoScrollReel = function() {
    isAutoScrollPaused = !isAutoScrollPaused;
    const viewport = document.getElementById('fullPhotoViewport');
    const icon = document.getElementById('autoScrollStatusIcon');
    const text = document.getElementById('autoScrollStatusText');

    if (viewport) {
      if (isAutoScrollPaused) {
        viewport.classList.add('paused');
        if (icon) icon.textContent = '▶️';
        if (text) text.textContent = 'Auto-Scroll OFF';
      } else {
        viewport.classList.remove('paused');
        if (icon) icon.textContent = '⏸️';
        if (text) text.textContent = 'Auto-Scroll ON';
      }
    }
  };

  window.nudgeReel = function(delta) {
    const viewport = document.getElementById('fullPhotoViewport');
    if (viewport) {
      viewport.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  function createFullPhotoModal() {
    if (document.getElementById('fullPhotoModalOverlay')) return;

    const modal = document.createElement('div');
    modal.id = 'fullPhotoModalOverlay';
    modal.className = 'fullphoto-modal-overlay';
    modal.innerHTML = `
      <div class="fullphoto-modal-box" id="fullPhotoModalBox">
        <div class="fullphoto-modal-top">
          <span id="modalTopBadge" class="fullphoto-modal-badge">Look 1 of 10</span>
          <button type="button" class="fullphoto-modal-close" onclick="window.closeFullPhotoModal()" title="Close (Esc)">✕</button>
        </div>

        <div class="fullphoto-modal-stage">
          <button type="button" class="fullphoto-modal-arrow prev" onclick="window.prevFullPhotoModal()" title="Previous Look">‹</button>
          <img id="modalFullImg" src="" alt="Full Look" class="fullphoto-modal-main-img">
          <button type="button" class="fullphoto-modal-arrow next" onclick="window.nextFullPhotoModal()" title="Next Look">›</button>
        </div>

        <div class="fullphoto-modal-bottom">
          <div class="fullphoto-modal-title-row">
            <span id="modalFullTitle" class="fullphoto-modal-title">Outfit Name</span>
            <span id="modalFullTag" class="fullphoto-modal-tag-pill">Street Classic</span>
          </div>
          <p id="modalFullDesc" class="fullphoto-modal-desc"></p>
          <div class="fullphoto-modal-actions">
            <span id="modalFullCounter" class="fullphoto-modal-counter">1 of 10</span>
            <a id="modalFullDownload" href="#" download class="fullphoto-download-btn">
              <span>⬇</span> Download Photo
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeFullPhotoModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('fullPhotoModalOverlay');
      if (!overlay || !overlay.classList.contains('active')) return;
      if (e.key === 'Escape') {
        window.closeFullPhotoModal();
      } else if (e.key === 'ArrowRight') {
        window.nextFullPhotoModal();
      } else if (e.key === 'ArrowLeft') {
        window.prevFullPhotoModal();
      }
    });
  }

  window.openFullPhotoModal = function(idx) {
    currentModalIdx = idx;
    const modal = document.getElementById('fullPhotoModalOverlay');
    if (!modal) return;

    modal.classList.add('active');
    updateModalContent(idx);
  };

  window.closeFullPhotoModal = function() {
    const modal = document.getElementById('fullPhotoModalOverlay');
    if (modal) {
      modal.classList.remove('active');
    }
  };

  window.nextFullPhotoModal = function() {
    currentModalIdx = (currentModalIdx + 1) % FULL_LOOKS_DATA.length;
    updateModalContent(currentModalIdx);
  };

  window.prevFullPhotoModal = function() {
    currentModalIdx = (currentModalIdx - 1 + FULL_LOOKS_DATA.length) % FULL_LOOKS_DATA.length;
    updateModalContent(currentModalIdx);
  };

  function updateModalContent(idx) {
    const item = FULL_LOOKS_DATA[idx];
    if (!item) return;

    const topBadge = document.getElementById('modalTopBadge');
    const mainImg = document.getElementById('modalFullImg');
    const title = document.getElementById('modalFullTitle');
    const tag = document.getElementById('modalFullTag');
    const desc = document.getElementById('modalFullDesc');
    const counter = document.getElementById('modalFullCounter');
    const download = document.getElementById('modalFullDownload');

    if (topBadge) topBadge.textContent = `Look #${item.id} • ${item.tag}`;
    if (mainImg) {
      mainImg.style.opacity = '0.3';
      mainImg.src = item.src;
      mainImg.onload = () => { mainImg.style.opacity = '1'; };
    }
    if (title) title.textContent = item.name;
    if (tag) tag.textContent = item.tag;
    if (desc) desc.textContent = item.desc;
    if (counter) counter.textContent = `${item.id} of ${FULL_LOOKS_DATA.length}`;
    if (download) {
      download.href = item.src;
      download.download = `look_${item.id}_${item.name.toLowerCase().replace(/\s+/g, '_')}.png`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFullPhotoReel);
  } else {
    initFullPhotoReel();
  }
})();
