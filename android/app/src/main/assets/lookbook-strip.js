/**
 * MindFocus Top Fashion Lookbook Stories Strip
 * Horizontal sliding stories carousel with Instagram-style modal story viewer.
 */

(function() {
  'use strict';

  const LOOKBOOK_DATA = [
    {
      id: 1,
      name: 'Black T-Shirt',
      tag: 'Casual Cool',
      src: 'assets/fashion/01_black_tshirt.png',
      desc: 'Classic fitted black t-shirt. Clean, versatile, and effortlessly stylish for modern everyday wear.'
    },
    {
      id: 2,
      name: 'White T-Shirt',
      tag: 'Minimal Crisp',
      src: 'assets/fashion/02_white_tshirt.png',
      desc: 'Pristine pure white crewneck tee. Essential minimalism that complements any smart layered look.'
    },
    {
      id: 3,
      name: 'Black Shirt',
      tag: 'Sharp Elegance',
      src: 'assets/fashion/03_black_shirt.png',
      desc: 'Tailored black button-down shirt with structured collar. Perfect for semi-formal events and nights out.'
    },
    {
      id: 4,
      name: 'Black Hoodie',
      tag: 'Urban Street',
      src: 'assets/fashion/04_black_hoodie.png',
      desc: 'Heavyweight premium black hoodie. Cozy streetwear comfort with sleek athletic silhouette.'
    },
    {
      id: 5,
      name: 'Navy Polo',
      tag: 'Smart Casual',
      src: 'assets/fashion/05_navy_polo.png',
      desc: 'Refined deep navy blue polo shirt. Breathable pique knit with timeless athletic heritage.'
    },
    {
      id: 6,
      name: 'Formal Suit',
      tag: 'Executive Power',
      src: 'assets/fashion/06_black_formal_suit.png',
      desc: 'Signature black tailored blazer suit with crisp white shirt & black tie. The pinnacle of confidence.'
    },
    {
      id: 7,
      name: 'Denim Jacket',
      tag: 'Vintage Rugged',
      src: 'assets/fashion/07_denim_jacket.png',
      desc: 'Classic washed indigo denim trucker jacket over white tee. Rugged vintage Americana style.'
    },
    {
      id: 8,
      name: 'Monochrome',
      tag: 'Stealth Modern',
      src: 'assets/fashion/08_black_monochrome.png',
      desc: 'All-black monochromatic layered ensemble with high-neck knit. Understated high-fashion aesthetics.'
    },
    {
      id: 9,
      name: 'White Kurta',
      tag: 'Royal Heritage',
      src: 'assets/fashion/09_white_kurta.png',
      desc: 'Pristine handcrafted white ethnic kurta. Graceful, airy, and rich with cultural elegance.'
    },
    {
      id: 10,
      name: 'Beige Layered',
      tag: 'Autumn Luxe',
      src: 'assets/fashion/10_beige_layered.png',
      desc: 'Sophisticated beige trench overcoat with neutral knit layers. Warm, distinguished, and luxurious.'
    }
  ];

  let currentIndex = 0;
  let storyTimer = null;
  let storyProgress = 0;
  let isPaused = false;
  const STORY_DURATION = 5000; // 5 seconds per story

  function initLookbookStrip() {
    let target = document.getElementById('topLookbookStoryStrip');
    if (!target) {
      // In control panel, insert at top of stage-content-scroll
      const stageContent = document.getElementById('stageContentScroll');
      if (stageContent) {
        target = document.createElement('div');
        target.id = 'topLookbookStoryStrip';
        stageContent.insertBefore(target, stageContent.firstChild);
      } else {
        // In reader app, insert at top of mainContainer
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

    renderStrip(target);
    createStoryModal();
  }

  function renderStrip(container) {
    const itemsHtml = LOOKBOOK_DATA.map((item, idx) => `
      <button type="button" class="lookbook-item" data-index="${idx}" onclick="window.openLookbookStory(${idx})">
        <div class="lookbook-avatar-ring">
          <div class="lookbook-avatar-img-wrap">
            <img src="${item.src}" alt="${item.name}" class="lookbook-avatar-img" loading="lazy">
          </div>
          <span class="lookbook-index-tag">${item.id}</span>
        </div>
        <span class="lookbook-item-title">${item.name}</span>
        <span class="lookbook-item-tag">${item.tag}</span>
      </button>
    `).join('');

    container.innerHTML = `
      <div class="lookbook-strip-wrapper">
        <div class="lookbook-strip-header">
          <div class="lookbook-strip-badge">
            <span class="lookbook-badge-icon">✨</span>
            <span>Style Lookbook</span>
            <span class="lookbook-badge-count">10 Looks</span>
          </div>
          <div class="lookbook-strip-actions">
            <button type="button" class="lookbook-nav-btn" onclick="window.scrollLookbookTrack(-200)" title="Scroll Left">‹</button>
            <button type="button" class="lookbook-nav-btn" onclick="window.scrollLookbookTrack(200)" title="Scroll Right">›</button>
          </div>
        </div>
        <div class="lookbook-scroll-track" id="lookbookScrollTrack">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  function createStoryModal() {
    if (document.getElementById('lookbookStoryModal')) return;

    const modal = document.createElement('div');
    modal.id = 'lookbookStoryModal';
    modal.className = 'lookbook-modal-overlay';
    modal.innerHTML = `
      <div class="lookbook-modal-container" id="lookbookModalContainer">
        <!-- Top Story Segments -->
        <div class="lookbook-modal-bars" id="lookbookModalBars">
          ${LOOKBOOK_DATA.map((_, i) => `
            <div class="lookbook-bar-seg" id="lookbookBarSeg_${i}">
              <div class="lookbook-bar-seg-fill" id="lookbookBarFill_${i}"></div>
            </div>
          `).join('')}
        </div>

        <!-- Top Header Info -->
        <div class="lookbook-modal-top">
          <div class="lookbook-modal-author">
            <img id="modalAuthorImg" src="assets/fashion/01_black_tshirt.png" alt="Look" class="lookbook-modal-author-img">
            <div class="lookbook-modal-author-info">
              <span id="modalAuthorName" class="lookbook-modal-author-name">Look 1</span>
              <span id="modalAuthorSub" class="lookbook-modal-author-sub">Fashion Collection</span>
            </div>
          </div>
          <button type="button" class="lookbook-modal-close-btn" onclick="window.closeLookbookStory()" title="Close (Esc)">✕</button>
        </div>

        <!-- Main Photo Stage -->
        <div class="lookbook-modal-stage" id="modalStage">
          <div class="lookbook-tap-zone left" onclick="window.prevLookbookStory()"></div>
          <div class="lookbook-tap-zone right" onclick="window.nextLookbookStory()"></div>
          <button type="button" class="lookbook-modal-arrow prev" onclick="window.prevLookbookStory()" title="Previous Look">‹</button>
          <img id="modalMainImg" src="assets/fashion/01_black_tshirt.png" alt="Fashion Look" class="lookbook-modal-img">
          <button type="button" class="lookbook-modal-arrow next" onclick="window.nextLookbookStory()" title="Next Look">›</button>
        </div>

        <!-- Bottom Drawer -->
        <div class="lookbook-modal-bottom">
          <div class="lookbook-modal-title-row">
            <span id="modalTitle" class="lookbook-modal-title">Black T-Shirt</span>
            <span id="modalTag" class="lookbook-modal-tag-pill">Casual Cool</span>
          </div>
          <p id="modalDesc" class="lookbook-modal-desc"></p>
          <div class="lookbook-modal-footer-actions">
            <span id="modalCounter" class="lookbook-modal-counter">1 of 10</span>
            <a id="modalDownloadBtn" href="#" download class="lookbook-download-btn">
              <span>⬇</span> Download Photo
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeLookbookStory();
      }
    });

    const stage = document.getElementById('modalStage');
    if (stage) {
      stage.addEventListener('mousedown', () => { isPaused = true; });
      stage.addEventListener('mouseup', () => { isPaused = false; });
      stage.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
      stage.addEventListener('touchend', () => { isPaused = false; });
    }

    document.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('lookbookStoryModal');
      if (!overlay || !overlay.classList.contains('active')) return;
      if (e.key === 'Escape') {
        window.closeLookbookStory();
      } else if (e.key === 'ArrowRight') {
        window.nextLookbookStory();
      } else if (e.key === 'ArrowLeft') {
        window.prevLookbookStory();
      }
    });
  }

  window.scrollLookbookTrack = function(delta) {
    const track = document.getElementById('lookbookScrollTrack');
    if (track) {
      track.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  window.openLookbookStory = function(index) {
    currentIndex = index;
    const modal = document.getElementById('lookbookStoryModal');
    if (!modal) return;

    modal.classList.add('active');
    updateStorySlide(index);
    startStoryTimer();
  };

  window.closeLookbookStory = function() {
    const modal = document.getElementById('lookbookStoryModal');
    if (modal) {
      modal.classList.remove('active');
    }
    stopStoryTimer();
  };

  window.nextLookbookStory = function() {
    if (currentIndex < LOOKBOOK_DATA.length - 1) {
      currentIndex++;
      updateStorySlide(currentIndex);
      startStoryTimer();
    } else {
      window.closeLookbookStory();
    }
  };

  window.prevLookbookStory = function() {
    if (currentIndex > 0) {
      currentIndex--;
      updateStorySlide(currentIndex);
      startStoryTimer();
    }
  };

  function updateStorySlide(idx) {
    const item = LOOKBOOK_DATA[idx];
    if (!item) return;

    const mainImg = document.getElementById('modalMainImg');
    const authorImg = document.getElementById('modalAuthorImg');
    const authorName = document.getElementById('modalAuthorName');
    const authorSub = document.getElementById('modalAuthorSub');
    const title = document.getElementById('modalTitle');
    const tag = document.getElementById('modalTag');
    const desc = document.getElementById('modalDesc');
    const counter = document.getElementById('modalCounter');
    const downloadBtn = document.getElementById('modalDownloadBtn');

    if (mainImg) {
      mainImg.style.opacity = '0.3';
      mainImg.src = item.src;
      mainImg.onload = () => { mainImg.style.opacity = '1'; };
    }
    if (authorImg) authorImg.src = item.src;
    if (authorName) authorName.textContent = item.name;
    if (authorSub) authorSub.textContent = `Look ${item.id} • ${item.tag}`;
    if (title) title.textContent = item.name;
    if (tag) tag.textContent = item.tag;
    if (desc) desc.textContent = item.desc;
    if (counter) counter.textContent = `${item.id} of ${LOOKBOOK_DATA.length}`;
    if (downloadBtn) {
      downloadBtn.href = item.src;
      downloadBtn.download = `look_${item.id}_${item.name.toLowerCase().replace(/\s+/g, '_')}.png`;
    }

    for (let i = 0; i < LOOKBOOK_DATA.length; i++) {
      const seg = document.getElementById(`lookbookBarSeg_${i}`);
      const fill = document.getElementById(`lookbookBarFill_${i}`);
      if (!seg || !fill) continue;

      if (i < idx) {
        seg.className = 'lookbook-bar-seg completed';
        fill.style.width = '100%';
      } else if (i === idx) {
        seg.className = 'lookbook-bar-seg';
        fill.style.width = '0%';
      } else {
        seg.className = 'lookbook-bar-seg';
        fill.style.width = '0%';
      }
    }
  }

  function startStoryTimer() {
    stopStoryTimer();
    storyProgress = 0;
    const interval = 50;
    const step = (interval / STORY_DURATION) * 100;

    storyTimer = setInterval(() => {
      if (isPaused) return;

      storyProgress += step;
      const fill = document.getElementById(`lookbookBarFill_${currentIndex}`);
      if (fill) {
        fill.style.width = Math.min(storyProgress, 100) + '%';
      }

      if (storyProgress >= 100) {
        window.nextLookbookStory();
      }
    }, interval);
  }

  function stopStoryTimer() {
    if (storyTimer) {
      clearInterval(storyTimer);
      storyTimer = null;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLookbookStrip);
  } else {
    initLookbookStrip();
  }
})();
