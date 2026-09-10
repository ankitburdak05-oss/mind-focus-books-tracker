// Mind Focus Books • Master Executive Command Studio v2.0
const REPO_OWNER = 'ankitburdak05-oss';
const REPO_NAME = 'mind-focus-books-tracker';
const DEFAULT_BRANCH = 'main';

// Secure GitHub Authentication Token (Stored strictly in client-side storage, never hardcoded)
let githubToken = sessionStorage.getItem('mf_admin_github_token') || localStorage.getItem('mf_admin_github_token') || '';

// State
let currentNotice = {
  id: 'notice-' + new Date().toISOString().slice(0, 10) + '-01',
  active: true,
  card: 'card2',
  icon: '💎',
  title: 'Card 2 • 3D Model',
  message: 'kesa laga new card',
  btnText: 'Mast Hai 🔥',
  timestamp: new Date().toISOString()
};

let remoteConfigData = null;
let broadcastHistory = JSON.parse(localStorage.getItem('mf_broadcast_history') || '[]');

// Presets
const PRESETS = {
  dictionary_release: {
    card: 'card2',
    icon: '📖',
    title: 'v3.3.0 Dictionary Book Live!',
    message: 'Book 1 se pehle A-Z English-Hindi 3D Dictionary Book add ho chuki hai! Tap karke real pages padhein.',
    btnText: 'Open Dictionary 📖'
  },
  c2_feedback: {
    card: 'card2',
    icon: '💎',
    title: 'Card 2 • 3D Model',
    message: 'kesa laga new card',
    btnText: 'Mast Hai 🔥'
  },
  c1_poll: {
    card: 'card1',
    icon: '📢',
    title: 'Card 1 vs Card 2',
    message: 'ye acha hai ya card2',
    btnText: 'Batao Bhai 🏆'
  },
  new_update: {
    card: 'card2',
    icon: '🚀',
    title: 'New Update Ready: v3.2.0',
    message: 'Naya Executive Control Panel & Instant Staging Pipeline release ho chuka hai! Abhi check karein.',
    btnText: 'Update Now ⚡'
  },
  daily_motivation: {
    card: 'card1',
    icon: '📖',
    title: 'Daily Reading Fuel',
    message: 'Rozana sirf 15 minute padhein aur apne mind ko 10x focus karein!',
    btnText: 'Let\'s Read ✦'
  },
  book_of_day: {
    card: 'card2',
    icon: '🌟',
    title: 'Book of the Day',
    message: 'Aaj ki Featured Book: "Atomic Habits" by James Clear. Read notes now!',
    btnText: 'Open Book 📖'
  },
  maintenance: {
    card: 'card1',
    icon: '⚡',
    title: 'Server Notice',
    message: 'Maintenance work chal raha hai, sabhi services short duration me normal ho jayengi.',
    btnText: 'Samajh Gaya'
  }
};

// Web Audio API Sci-Fi Synthesizer
const audioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playAudioTone(freq, type = 'sine', duration = 0.15, gainVal = 0.08) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playUiClick() {
  playAudioTone(880, 'sine', 0.08, 0.05);
}

function playDeployChime() {
  setTimeout(() => playAudioTone(523.25, 'triangle', 0.2, 0.1), 0);
  setTimeout(() => playAudioTone(659.25, 'triangle', 0.2, 0.1), 100);
  setTimeout(() => playAudioTone(783.99, 'triangle', 0.2, 0.1), 200);
  setTimeout(() => playAudioTone(1046.50, 'triangle', 0.4, 0.15), 300);
}

// Lifecycle Init
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initFormInputs();
  initInteractive3dViewer();
  loadSavedGithubToken();
  testGitHubConnection();
  fetchLiveStatusFromGitHub();
  fetchRemoteConfigPipeline();
  renderBroadcastHistory();
  updateLivePreview();
  if (typeof updateFlashcardPreview === 'function') updateFlashcardPreview();
  if (typeof initAdminHelpDeskListeners === 'function') initAdminHelpDeskListeners();
  if (typeof refreshAdminChatThreads === 'function') {
    refreshAdminChatThreads(false);
    // Polite 60s background check (SSE handles instant live delivery with 0 polling)
    setInterval(() => {
      if (!document.hidden) refreshAdminChatThreads(false);
    }, 60000);
  }
  appendLog('Admin Control Panel Ready.', 'success');
});

// Navigation
function switchTab(viewId) {
  playUiClick();
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(t => {
    if (t.getAttribute('data-tab') === viewId) t.classList.add('active');
    else t.classList.remove('active');
  });
  document.querySelectorAll('.tab-view').forEach(v => {
    if (v.id === viewId) v.classList.add('active');
    else v.classList.remove('active');
  });
  const targetEl = document.getElementById(viewId);
  if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
}
window.switchTab = switchTab;

function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const viewId = tab.getAttribute('data-tab');
      switchTab(viewId);
    });
  });
}

// Form Listeners
function initFormInputs() {
  const cardRadios = document.querySelectorAll('input[name="noticeCardType"]');
  cardRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      playUiClick();
      currentNotice.card = e.target.value;
      updateLivePreview();
    });
  });

  const titleInput = document.getElementById('noticeTitleInput');
  if (titleInput) {
    titleInput.addEventListener('input', (e) => {
      currentNotice.title = e.target.value;
      updateLivePreview();
    });
  }

  const msgInput = document.getElementById('noticeMsgInput');
  if (msgInput) {
    msgInput.addEventListener('input', (e) => {
      currentNotice.message = e.target.value;
      updateLivePreview();
    });
  }

  const iconInput = document.getElementById('noticeIconInput');
  if (iconInput) {
    iconInput.addEventListener('input', (e) => {
      currentNotice.icon = e.target.value;
      updateLivePreview();
    });
  }

  const btnTextInput = document.getElementById('noticeBtnTextInput');
  if (btnTextInput) {
    btnTextInput.addEventListener('input', (e) => {
      currentNotice.btnText = e.target.value;
      updateLivePreview();
    });
  }

  const presetSelect = document.getElementById('noticePresetSelect');
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      playUiClick();
      const pKey = e.target.value;
      if (PRESETS[pKey]) applyPreset(PRESETS[pKey]);
    });
  }
}

// Interactive 3D drag on simulator card
function initInteractive3dViewer() {
  const simViewport = document.getElementById('simViewport');
  if (!simViewport) return;

  let isDragging = false;
  let startX = 0, startY = 0;
  let currentRotX = 0, currentRotY = 0;

  const onPointerDown = (e) => {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX);
    startY = e.clientY || (e.touches && e.touches[0].clientY);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const dx = clientX - startX;
    const dy = clientY - startY;

    currentRotY = Math.max(-35, Math.min(35, dx * 0.2));
    currentRotX = Math.max(-35, Math.min(35, -dy * 0.2));

    const card = document.querySelector('.sim-card1:not([style*="display: none"]), .sim-card2:not([style*="display: none"])');
    if (card) {
      card.style.transform = `perspective(800px) rotateX(${currentRotX.toFixed(1)}deg) rotateY(${currentRotY.toFixed(1)}deg) scale3d(1.03, 1.03, 1.03)`;
    }
  };

  const onPointerUp = () => {
    isDragging = false;
    const card = document.querySelector('.sim-card1, .sim-card2');
    if (card) {
      card.style.transform = '';
    }
  };

  simViewport.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  simViewport.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);
}

function selectEmoji(emoji) {
  playUiClick();
  const iconInput = document.getElementById('noticeIconInput');
  if (iconInput) {
    iconInput.value = emoji;
    currentNotice.icon = emoji;
    updateLivePreview();
  }
}

function applyPreset(p) {
  currentNotice.card = p.card;
  currentNotice.icon = p.icon;
  currentNotice.title = p.title;
  currentNotice.message = p.message;
  currentNotice.btnText = p.btnText;

  const titleInput = document.getElementById('noticeTitleInput');
  if (titleInput) titleInput.value = p.title;

  const msgInput = document.getElementById('noticeMsgInput');
  if (msgInput) msgInput.value = p.message;

  const iconInput = document.getElementById('noticeIconInput');
  if (iconInput) iconInput.value = p.icon;

  const btnTextInput = document.getElementById('noticeBtnTextInput');
  if (btnTextInput) btnTextInput.value = p.btnText;

  const cardRadios = document.querySelectorAll('input[name="noticeCardType"]');
  cardRadios.forEach(r => {
    r.checked = (r.value === p.card);
  });

  updateLivePreview();
  showToast('Preset Loaded: ' + p.title);
}

// Live Preview Renderer
function updateLivePreview() {
  const card1Preview = document.getElementById('simCard1');
  const card2Preview = document.getElementById('simCard2');

  const isCard2 = currentNotice.card === 'card2';

  if (isCard2) {
    if (card1Preview) card1Preview.style.display = 'none';
    if (card2Preview) {
      card2Preview.style.display = 'block';
      const icon = document.getElementById('simCard2Icon');
      const title = document.getElementById('simCard2Title');
      const msg = document.getElementById('simCard2Msg');
      const btn = document.getElementById('simCard2Btn');

      if (icon) icon.innerText = currentNotice.icon || '💎';
      if (title) title.innerText = currentNotice.title || 'Notification Title';
      if (msg) msg.innerText = currentNotice.message || 'Preview message...';
      if (btn) btn.innerText = currentNotice.btnText || 'Action';
    }
  } else {
    if (card2Preview) card2Preview.style.display = 'none';
    if (card1Preview) {
      card1Preview.style.display = 'block';
      const icon = document.getElementById('simCard1Icon');
      const title = document.getElementById('simCard1Title');
      const msg = document.getElementById('simCard1Msg');
      const btn = document.getElementById('simCard1Btn');

      if (icon) icon.innerText = currentNotice.icon || '📢';
      if (title) title.innerText = currentNotice.title || 'Notification Title';
      if (msg) msg.innerText = currentNotice.message || 'Preview message...';
      if (btn) btn.innerText = currentNotice.btnText || 'Action';
    }
  }
}

// GitHub REST API Commit Helper (with Cache-Busting SHA & Auto-Conflict 409 Retry)
async function getFreshGitHubSha(path) {
  if (!githubToken) return null;
  const cb = Date.now();
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${DEFAULT_BRANCH}&cb=${cb}`;
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha || null;
    }
  } catch (e) {}
  return null;
}

async function pushFileToGitHub(path, contentString, commitMessage, maxRetries = 2) {
  if (!githubToken) {
    throw new Error('GitHub Token not configured. Check the Settings tab.');
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  const base64Content = btoa(unescape(encodeURIComponent(contentString)));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const sha = await getFreshGitHubSha(path);

    const body = {
      message: commitMessage,
      content: base64Content,
      branch: DEFAULT_BRANCH
    };
    if (sha) body.sha = sha;

    try {
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (putRes.ok) {
        return await putRes.json();
      }

      if (putRes.status === 409 && attempt < maxRetries) {
        // 409 Conflict: Remote was updated, wait with backoff and retry with newly fetched SHA
        console.warn(`409 Conflict pushing ${path}. Retrying with fresh SHA (attempt ${attempt + 1})...`);
        await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }

      const errData = await putRes.json();
      throw new Error(errData.message || 'GitHub API error ' + putRes.status);
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
    }
  }
}

// Fetch Live Status From GitHub
async function fetchLiveStatusFromGitHub() {
  try {
    const cb = Date.now();
    let res = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/broadcast-notice.json?cb=${cb}`, { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/broadcast-notice.json?cb=${cb}`, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' }
      });
    }
    if (res.ok) {
      const data = await res.json();
      appendLog('Live notice: ' + data.id + ' (' + data.card + ') - "' + (data.title || '') + '"', 'success');
      
      const liveStatusBadge = document.getElementById('liveNoticeStatusBadge');
      if (liveStatusBadge) {
        liveStatusBadge.innerText = data.active ? '● LIVE BROADCAST ACTIVE' : '○ NO ACTIVE NOTICE';
        liveStatusBadge.style.color = data.active ? '#34d399' : '#94a3b8';
      }
    }
  } catch (e) {
    appendLog('Notice status check: ' + e.message, 'warn');
  }
}

// -------------------------------------------------------------
// FEATURE: STAGING TO REAL APP DEPLOYMENT PIPELINE
// -------------------------------------------------------------
// -------------------------------------------------------------
async function fetchRemoteConfigPipeline() {
  // 1. INSTANT LOCAL DATA (Zero-delay render for v3.5.8)
  if (typeof window !== 'undefined' && window.__DEFAULT_REMOTE_CONFIG__) {
    remoteConfigData = JSON.parse(JSON.stringify(window.__DEFAULT_REMOTE_CONFIG__));
    updatePipelineCardUI(remoteConfigData);
    populateConfigFormUI(remoteConfigData);
    appendLog('📁 Pipeline config v3.5.8 loaded instantly.', 'success');
  }

  // 2. Try fetching from GitHub if online
  try {
    const cb = Date.now();
    let res = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/remote-config.json?cb=${cb}`, { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/remote-config.json?cb=${cb}`, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' }
      });
    }
    if (res.ok) {
      const ghData = await res.json();
      if (ghData) {
        remoteConfigData = ghData;
        updatePipelineCardUI(remoteConfigData);
        populateConfigFormUI(remoteConfigData);
        appendLog('✅ Pipeline config synced with GitHub cloud.', 'success');
        return;
      }
    }
  } catch (e) {
    // GitHub error or offline, fallback continues to use local config
  }

  // 3. Fallback: Local JSON fetch (when running on localhost)
  if (!remoteConfigData) {
    try {
      const localRes = await fetch('./remote-config.json?cb=' + Date.now());
      if (localRes.ok) {
        remoteConfigData = await localRes.json();
        updatePipelineCardUI(remoteConfigData);
        populateConfigFormUI(remoteConfigData);
      }
    } catch (localErr) {}
  }
}



function updatePipelineCardUI(cfg) {
  if (!cfg) return;

  const staged = cfg.stagedRelease || {};
  const active = cfg.activeRelease || {};

  const stagedTitleEl = document.getElementById('pipelineStagedTitle');
  const stagedDescEl = document.getElementById('pipelineStagedDesc');
  const stagedStatusTag = document.getElementById('pipelineStatusTag');
  const deployBtn = document.getElementById('btnDeployToRealApp');
  const activeVerEl = document.getElementById('pipelineActiveVersionText');
  const activeNameEl = document.getElementById('pipelineActiveNameText');

  if (activeVerEl && active.version) activeVerEl.innerText = active.version;
  if (activeNameEl && active.name) activeNameEl.innerText = active.name;

  if (stagedTitleEl) {
    // Version number prominently dikhao (e.g. "Mind Focus Books v3.5.1")
    stagedTitleEl.innerText = (staged.version ? 'Mind Focus Books ' + staged.version : staged.name) || 'No Staged Release';
  }

  if (stagedDescEl) {
    const featCount = staged.features ? staged.features.length : 0;
    // Features list dikhao agar hai, warna count
    if (staged.features && staged.features.length > 0) {
      stagedDescEl.innerText = staged.features.join(' | ');
    } else {
      stagedDescEl.innerText = `${featCount} Staged Features ready for Real App. (Active in Real App: ${active.version || 'v3.1.0'})`;
    }
  }


  const targetVerInput = document.getElementById('targetVersionTag');
  const targetNameInput = document.getElementById('targetReleaseName');
  const targetApkInput = document.getElementById('targetApkUrl');
  const targetFeatsInput = document.getElementById('targetReleaseFeatures');

  if (targetVerInput && staged.version) targetVerInput.value = staged.version;
  if (targetNameInput && staged.name) targetNameInput.value = staged.name;
  if (targetApkInput && staged.apkDownloadUrl) targetApkInput.value = staged.apkDownloadUrl;
  if (targetFeatsInput && staged.features && staged.features.length > 0) {
    targetFeatsInput.value = staged.features.join('\n');
  }

  if (stagedStatusTag) {
    const deployBtn = document.getElementById('btnDeployToRealApp');
    const deployBtnBanner = document.getElementById('btnDeployToRealAppBanner');
    const badge = document.getElementById('pipelineStagedTagBadge');
    [stagedStatusTag, badge].forEach(tag => {
      if (!tag) return;
      if (staged.isDeployed) {
        tag.innerText = 'DEPLOYED LIVE';
        tag.className = 'pipeline-status-tag tag-deployed';
      } else {
        tag.innerText = 'PENDING REVIEW';
        tag.className = 'pipeline-status-tag tag-staged';
      }
    });

    [deployBtn, deployBtnBanner].forEach(btn => {
      if (!btn) return;
      btn.disabled = false;
      if (btn.id === 'btnDeployToRealApp') {
        btn.innerHTML = staged.isDeployed
          ? '<span>🚀</span> Push Version Update to All Phones (Trigger In-App Update Dialog)'
          : '<span>🚀</span> Push Version Update to All Phones (Trigger In-App Update Dialog)';
      } else {
        btn.innerHTML = staged.isDeployed ? '<span>⚡</span> Re-deploy to Real App' : '<span>⚡</span> Deploy to Real App';
      }
    });
  }
}

function populateConfigFormUI(cfg) {
  if (!cfg) return;
  const feats = cfg.features || {};
  const banner = cfg.globalBanner || {};

  // Emergency App Kill-Switch & Notice
  const appLockdown = document.getElementById('cfgAppEmergencyLockdown');
  if (appLockdown) appLockdown.checked = !!feats.appEmergencyLockdown;

  const lockdownMsg = document.getElementById('cfgLockdownMessage');
  if (lockdownMsg && feats.lockdownMessage) lockdownMsg.value = feats.lockdownMessage;

  // 16 Granular Feature Flags
  const setCheck = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = (val !== false);
  };

  setCheck('cfgChatHelpDesk', feats.chatHelpDeskEnabled);
  setCheck('cfgTelemetry', feats.telemetryEnabled);
  setCheck('cfgMobileDevTools', feats.mobileDevToolsEnabled);
  setCheck('cfgBroadcastNotice', feats.broadcastNoticeEnabled);
  setCheck('cfgAppUpdates', feats.appUpdatesEnabled);
  setCheck('cfgStreakShields', feats.streakShieldsEnabled);
  setCheck('cfgSanctuaryTimer', feats.sanctuaryTimerEnabled);
  setCheck('cfgFlashcards', feats.flashcardsEnabled);
  setCheck('cfgAmbientAudio', feats.ambientAudioEnabled);
  setCheck('cfgVisualPhysics', feats.visualPhysicsEnabled);
  setCheck('cfgBarcodeScanner', feats.barcodeScannerEnabled);
  setCheck('cfgAudioVoice', feats.audiobookVoiceEnabled);
  setCheck('cfgQuotes', feats.quotesEnabled);
  setCheck('cfgCommunitySync', feats.communityBooksSync);
  setCheck('cfgDictionary', feats.dictionaryBookEnabled);
  setCheck('cfgPdfExport', feats.pdfExportEnabled);

  // Scheduled Maintenance Mode
  const mMode = document.getElementById('cfgMaintenanceMode');
  if (mMode) mMode.checked = !!feats.maintenanceMode;

  // Global Top Banner
  const bActive = document.getElementById('cfgBannerActive');
  if (bActive) bActive.checked = !!banner.active;

  const bText = document.getElementById('cfgBannerText');
  if (bText) bText.value = banner.text || '';

  // Book of the Day
  const botd = cfg.bookOfTheDay || {};
  const botdTitle = document.getElementById('botdTitle');
  if (botdTitle) botdTitle.value = botd.title || '';
  const botdAuthor = document.getElementById('botdAuthor');
  if (botdAuthor) botdAuthor.value = botd.author || '';
  const botdQuote = document.getElementById('botdQuote');
  if (botdQuote) botdQuote.value = botd.quote || '';
}

// ACTION: DEPLOY STAGED RELEASE TO REAL APP
async function deployStagedReleaseToRealApp() {
  if (!remoteConfigData) {
    alert('Pipeline data loading... Please try again in a moment.');
    return;
  }

  const staged = remoteConfigData.stagedRelease;
  if (!staged) {
    alert('No staged release found to deploy.');
    return;
  }

  // Read customized values from the form inputs
  const verInput = document.getElementById('targetVersionTag')?.value.trim() || staged.version || 'v3.3.0';
  const nameInput = document.getElementById('targetReleaseName')?.value.trim() || staged.name || `Mind Focus Books ${verInput}`;
  const apkInput = document.getElementById('targetApkUrl')?.value.trim() || staged.apkDownloadUrl || '';
  const featsRaw = document.getElementById('targetReleaseFeatures')?.value || '';
  const featsList = featsRaw.split('\n').map(l => l.replace(/^[✦•\-\*]\s*/, '').trim()).filter(Boolean);

  const confirmMsg = `Kya aap sach me version "${nameInput}" ko Real App me sabhi users ke paas deploy karna chahte hain?`;
  if (!confirm(confirmMsg)) return;

  const deployBtn = document.getElementById('btnDeployToRealApp');
  const deployBtnBanner = document.getElementById('btnDeployToRealAppBanner');
  [deployBtn, deployBtnBanner].forEach(btn => {
    if (!btn) return;
    btn.disabled = true;
    btn.innerText = '⏳ Deploying to Real App...';
  });

  try {
    appendLog(`🚀 Starting deployment for ${verInput} to Real App...`, 'warn');

    const newReleasePayload = {
      version: verInput,
      name: nameInput,
      apkDownloadUrl: apkInput,
      features: featsList.length > 0 ? featsList : (staged.features || []),
      stagedAt: new Date().toISOString(),
      isDeployed: true
    };

    // 1. Shift active release & enable dictionary book feature
    remoteConfigData.previousRelease = Object.assign({}, remoteConfigData.activeRelease);
    remoteConfigData.activeRelease = newReleasePayload;
    remoteConfigData.stagedRelease = Object.assign({}, newReleasePayload);
    if (!remoteConfigData.features) remoteConfigData.features = {};
    remoteConfigData.features.dictionaryBookEnabled = true;
    remoteConfigData.updatedAt = new Date().toISOString();

    // 2. Push updated remote-config.json
    const configStr = JSON.stringify(remoteConfigData, null, 2);
    await pushFileToGitHub('remote-config.json', configStr, `Deploy Release: ${verInput} to Real App`);

    // 3. Automatically broadcast a celebratory announcement notice to all real apps!
    const deployNotice = {
      id: 'deploy-notice-' + Date.now(),
      active: true,
      card: 'card2',
      icon: '🚀',
      title: `Update Live: ${verInput}`,
      message: `Naya update ${verInput} Real App me deploy ho chuka hai! Tap karke turant install karein.`,
      btnText: 'Install Update ⚡',
      timestamp: new Date().toISOString()
    };

    const jsonContent = JSON.stringify(deployNotice, null, 2);
    const jsContent = 'window.__REMOTE_BROADCAST_NOTICE__ = ' + JSON.stringify(deployNotice, null, 2) + ';\n';
    await pushFileToGitHub('broadcast-notice.json', jsonContent, `Deploy Broadcast: ${verInput}`);
    await pushFileToGitHub('broadcast-notice.js', jsContent, `Deploy Broadcast JS: ${verInput}`);

    // Global CDN instant purge
    try {
      fetch(`https://purge.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@main/remote-config.json`, { cache: 'no-store' });
      fetch(`https://purge.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@main/broadcast-notice.json`, { cache: 'no-store' });
      fetch(`https://purge.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@main/broadcast-notice.js`, { cache: 'no-store' });
    } catch (e) {}

    // Instant local trigger
    try {
      localStorage.setItem('mindfocus_local_broadcast_trigger', JSON.stringify(deployNotice));
    } catch (e) {}

    playDeployChime();
    appendLog(`🎉 DEPLOYMENT SUCCESS: ${verInput} is now LIVE in Real App!`, 'success');
    showToast(`🚀 ${verInput} Deployed to Real App Successfully!`);

    updatePipelineCardUI(remoteConfigData);
    populateConfigFormUI(remoteConfigData);
    fetchLiveStatusFromGitHub();
  } catch (err) {
    appendLog('Deployment failed: ' + err.message, 'error');
    alert('Deployment Error: ' + err.message);
    [deployBtn, deployBtnBanner].forEach(btn => {
      if (!btn) return;
      btn.disabled = false;
      btn.innerText = '🚀 Push Version Update to All Phones';
    });
  }
}

// ACTION: ROLLBACK TO PREVIOUS RELEASE
async function rollbackToPreviousRelease() {
  if (!remoteConfigData || !remoteConfigData.previousRelease) {
    alert('No previous release found to rollback to.');
    return;
  }

  const prev = remoteConfigData.previousRelease;
  if (!confirm(`Warning: Kya aap sach me Real App ko previous version "${prev.version}" par rollback karna chahte hain?`)) return;

  try {
    appendLog(`Rolling back to ${prev.version}...`, 'warn');
    remoteConfigData.activeRelease = Object.assign({}, prev);
    if (remoteConfigData.stagedRelease) {
      remoteConfigData.stagedRelease.isDeployed = false;
    }
    remoteConfigData.updatedAt = new Date().toISOString();

    const configStr = JSON.stringify(remoteConfigData, null, 2);
    await pushFileToGitHub('remote-config.json', configStr, `Rollback: Restore ${prev.version}`);

    appendLog(`Rollback complete. Real App reverted to ${prev.version}`, 'success');
    showToast(`↩️ Reverted to ${prev.version}`);
    updatePipelineCardUI(remoteConfigData);
  } catch (err) {
    appendLog('Rollback failed: ' + err.message, 'error');
    alert('Rollback Error: ' + err.message);
  }
}

// -------------------------------------------------------------
// BROADCAST ACTIONS
// -------------------------------------------------------------
async function broadcastLiveNotice() {
  playUiClick();
  const broadcastBtn = document.getElementById('btnBroadcastNow');
  if (broadcastBtn) {
    broadcastBtn.disabled = true;
    broadcastBtn.innerText = '⏳ Broadcasting...';
  }

  try {
    const noticeId = 'notice-' + Date.now() + '-' + currentNotice.card;
    
    const noticePayload = {
      id: noticeId,
      active: true,
      card: currentNotice.card,
      icon: currentNotice.icon || '💎',
      title: currentNotice.title || 'Notice',
      message: currentNotice.message || '',
      btnText: currentNotice.btnText || 'OK',
      timestamp: new Date().toISOString()
    };

    const jsonContent = JSON.stringify(noticePayload, null, 2);
    const jsContent = 'window.__REMOTE_BROADCAST_NOTICE__ = ' + JSON.stringify(noticePayload, null, 2) + ';\n';

    appendLog('Pushing broadcast-notice.json (' + noticePayload.card + ')...');
    await pushFileToGitHub('broadcast-notice.json', jsonContent, `Broadcast: ${noticePayload.card} - ${noticePayload.title}`);

    appendLog('Pushing broadcast-notice.js fallback...');
    await pushFileToGitHub('broadcast-notice.js', jsContent, `Broadcast JS: ${noticePayload.card}`);

    // Global CDN instant purge
    try {
      fetch(`https://purge.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@main/broadcast-notice.json`, { cache: 'no-store' });
      fetch(`https://purge.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@main/broadcast-notice.js`, { cache: 'no-store' });
    } catch (e) {}

    // 0ms instant trigger for laptop tabs
    try {
      localStorage.setItem('mindfocus_local_broadcast_trigger', JSON.stringify(noticePayload));
      localStorage.setItem('mindfocus_current_live_notice', JSON.stringify(noticePayload));
    } catch (e) {}

    // Save to history
    saveToBroadcastHistory(noticePayload);

    playAudioTone(880, 'sine', 0.25, 0.1);
    appendLog('🎉 SUCCESS: Broadcast live to all mobile apps & laptop!', 'success');
    showToast('🚀 Live Broadcast Dispatched!');
    fetchLiveStatusFromGitHub();
  } catch (err) {
    appendLog('❌ Broadcast error: ' + err.message, 'error');
    alert('Broadcast Error: ' + err.message);
  } finally {
    if (broadcastBtn) {
      broadcastBtn.disabled = false;
      broadcastBtn.innerText = '⚡ Broadcast Live to App';
    }
  }
}

async function deactivateLiveNotice() {
  playUiClick();
  if (!confirm('Kya aap current broadcast notification ko turn off karna chahte hain?')) return;

  try {
    const payload = {
      id: 'notice-deactivated-' + Date.now(),
      active: false,
      card: currentNotice.card,
      icon: '💤',
      title: 'Deactivated',
      message: '',
      btnText: 'Close',
      timestamp: new Date().toISOString()
    };

    const jsonContent = JSON.stringify(payload, null, 2);
    const jsContent = 'window.__REMOTE_BROADCAST_NOTICE__ = ' + JSON.stringify(payload, null, 2) + ';\n';

    appendLog('Deactivating broadcast...');
    await pushFileToGitHub('broadcast-notice.json', jsonContent, 'Broadcast: Deactivated');
    await pushFileToGitHub('broadcast-notice.js', jsContent, 'Broadcast JS: Deactivated');

    try {
      localStorage.setItem('mindfocus_local_broadcast_trigger', JSON.stringify(payload));
      localStorage.removeItem('mindfocus_current_live_notice');
    } catch (e) {}

    appendLog('Notice turned off.', 'success');
    showToast('Notice Deactivated.');
    fetchLiveStatusFromGitHub();
  } catch (err) {
    appendLog('Deactivation error: ' + err.message, 'error');
    alert('Error: ' + err.message);
  }
}

// Auto-Sequence Action
async function triggerAutoSequence() {
  playUiClick();
  if (!confirm('Card 2 bhejega, aur 10 seconds baad automatically Card 1 switch karega. Proceed karein?')) return;

  const btn = document.getElementById('btnAutoSequence');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Step 1: Sending Card 2...';
  }

  try {
    applyPreset(PRESETS.c2_feedback);
    await broadcastLiveNotice();
    appendLog('Step 1 complete: Card 2 active.', 'success');

    let secondsLeft = 10;
    appendLog('Starting 10s countdown for Card 1...', 'warn');

    const interval = setInterval(() => {
      secondsLeft--;
      if (btn) btn.innerText = `⏳ Switching to Card 1 in ${secondsLeft}s...`;
      if (secondsLeft <= 0) clearInterval(interval);
    }, 1000);

    await new Promise(r => setTimeout(r, 10000));

    if (btn) btn.innerText = '⏳ Step 2: Sending Card 1...';
    applyPreset(PRESETS.c1_poll);
    await broadcastLiveNotice();
    appendLog('Step 2 complete: Card 1 active!', 'success');
    showToast('🎉 Sequence Finished: Card 2 & Card 1 dispatched!');
  } catch (err) {
    appendLog('Sequence error: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '⏱️ Auto-Sequence (Card 2 → 10s → Card 1)';
    }
  }
}

// Broadcast History Manager
function saveToBroadcastHistory(notice) {
  broadcastHistory.unshift({
    id: notice.id,
    card: notice.card,
    icon: notice.icon,
    title: notice.title,
    message: notice.message,
    btnText: notice.btnText,
    time: new Date().toLocaleTimeString()
  });
  if (broadcastHistory.length > 10) broadcastHistory.pop();
  localStorage.setItem('mf_broadcast_history', JSON.stringify(broadcastHistory));
  renderBroadcastHistory();
}

function renderBroadcastHistory() {
  const container = document.getElementById('broadcastHistoryList');
  if (!container) return;

  if (broadcastHistory.length === 0) {
    container.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:12px;">Koi previous broadcast nahi mila.</div>';
    return;
  }

  container.innerHTML = broadcastHistory.map((item, index) => `
    <div class="history-card">
      <div class="history-card-info">
        <span class="history-card-icon">${item.icon || '📢'}</span>
        <div>
          <div class="history-card-title">${item.title} <small style="color:#38bdf8;">(${item.card})</small></div>
          <div class="history-card-time">${item.time} • "${item.message.slice(0, 32)}..."</div>
        </div>
      </div>
      <button type="button" class="btn-history-resend" onclick="resendHistoryNotice(${index})">
        🔄 Re-Send
      </button>
    </div>
  `).join('');
}

function resendHistoryNotice(idx) {
  playUiClick();
  const item = broadcastHistory[idx];
  if (!item) return;

  applyPreset({
    card: item.card,
    icon: item.icon,
    title: item.title,
    message: item.message,
    btnText: item.btnText
  });
  broadcastLiveNotice();
}

// -------------------------------------------------------------
// REMOTE FEATURE FLAGS & BOOK OF THE DAY
// -------------------------------------------------------------
function freezeAllFeatures() {
  playUiClick();
  const featureIds = [
    'cfgChatHelpDesk', 'cfgTelemetry', 'cfgMobileDevTools', 'cfgBroadcastNotice',
    'cfgAppUpdates', 'cfgStreakShields', 'cfgSanctuaryTimer', 'cfgFlashcards',
    'cfgAmbientAudio', 'cfgVisualPhysics', 'cfgBarcodeScanner', 'cfgAudioVoice',
    'cfgQuotes', 'cfgCommunitySync', 'cfgDictionary', 'cfgPdfExport'
  ];
  featureIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  showToast('🔴 All 16 features set to OFF. Click "Push to Real App" to apply.');
}

function restoreAllFeatures() {
  playUiClick();
  const featureIds = [
    'cfgChatHelpDesk', 'cfgTelemetry', 'cfgMobileDevTools', 'cfgBroadcastNotice',
    'cfgAppUpdates', 'cfgStreakShields', 'cfgSanctuaryTimer', 'cfgFlashcards',
    'cfgAmbientAudio', 'cfgVisualPhysics', 'cfgBarcodeScanner', 'cfgAudioVoice',
    'cfgQuotes', 'cfgCommunitySync', 'cfgDictionary', 'cfgPdfExport'
  ];
  featureIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });
  showToast('🟢 All 16 features restored to ON. Click "Push to Real App" to apply.');
}

window.freezeAllFeatures = freezeAllFeatures;
window.restoreAllFeatures = restoreAllFeatures;

async function saveRemoteConfigToCloud() {
  playUiClick();
  const btn = document.getElementById('btnSaveConfig');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Pushing to Cloud...';
  }

  try {
    if (!remoteConfigData) {
      await fetchRemoteConfigPipeline();
    }

    const appLockdown = document.getElementById('cfgAppEmergencyLockdown')?.checked || false;
    const lockdownMsg = document.getElementById('cfgLockdownMessage')?.value.trim() || '🚨 अभी ऐप को बंद कर दिया गया है। कुछ प्रॉब्लम आ गई है, सभी फीचर के साथ ऐप भी बंद हो गया है। कृपया थोड़ी देर प्रतीक्षा करें।';

    const getCheck = (id) => {
      const el = document.getElementById(id);
      return el ? el.checked : true;
    };

    const chatHelpDesk = getCheck('cfgChatHelpDesk');
    const telemetry = getCheck('cfgTelemetry');
    const mobileDevTools = getCheck('cfgMobileDevTools');
    const broadcastNotice = getCheck('cfgBroadcastNotice');
    const appUpdates = getCheck('cfgAppUpdates');
    const streakShields = getCheck('cfgStreakShields');
    const sanctuaryTimer = getCheck('cfgSanctuaryTimer');
    const flashcards = getCheck('cfgFlashcards');
    const ambientAudio = getCheck('cfgAmbientAudio');
    const visualPhysics = getCheck('cfgVisualPhysics');
    const barcodeScanner = getCheck('cfgBarcodeScanner');
    const audioVoice = getCheck('cfgAudioVoice');
    const quotes = getCheck('cfgQuotes');
    const communitySync = getCheck('cfgCommunitySync');
    const dictionary = getCheck('cfgDictionary');
    const pdfExport = getCheck('cfgPdfExport');
    const maintenance = document.getElementById('cfgMaintenanceMode')?.checked || false;

    const bannerActive = document.getElementById('cfgBannerActive')?.checked || false;
    const bannerText = document.getElementById('cfgBannerText')?.value || '';

    if (!remoteConfigData.features) remoteConfigData.features = {};
    if (!remoteConfigData.globalBanner) remoteConfigData.globalBanner = {};

    remoteConfigData.features = {
      appEmergencyLockdown: appLockdown,
      lockdownMessage: lockdownMsg,
      maintenanceMode: maintenance,
      maintenanceMessage: '🚨 App Under Scheduled Maintenance. We are upgrading server engines and will be back shortly!',
      chatHelpDeskEnabled: chatHelpDesk,
      telemetryEnabled: telemetry,
      mobileDevToolsEnabled: mobileDevTools,
      broadcastNoticeEnabled: broadcastNotice,
      appUpdatesEnabled: appUpdates,
      streakShieldsEnabled: streakShields,
      sanctuaryTimerEnabled: sanctuaryTimer,
      flashcardsEnabled: flashcards,
      ambientAudioEnabled: ambientAudio,
      visualPhysicsEnabled: visualPhysics,
      barcodeScannerEnabled: barcodeScanner,
      audiobookVoiceEnabled: audioVoice,
      quotesEnabled: quotes,
      communityBooksSync: communitySync,
      dictionaryBookEnabled: dictionary,
      pdfExportEnabled: pdfExport
    };

    remoteConfigData.globalBanner.active = bannerActive;
    remoteConfigData.globalBanner.text = bannerText;
    remoteConfigData.updatedAt = new Date().toISOString();

    const jsonStr = JSON.stringify(remoteConfigData, null, 2);
    await pushFileToGitHub('remote-config.json', jsonStr, 'Admin: Update remote switches & emergency kill-switch');

    // ⚡ Instant Real-Time Cloud Relay Broadcast (Delivered to phone in < 500ms via SSE)
    try {
      const relayPayload = {
        type: 'remote_config_sync',
        timestamp: Date.now(),
        features: remoteConfigData.features
      };
      fetch(HELPDESK_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(relayPayload)
      }).catch(() => {});
    } catch (relayErr) {}

    appendLog('Remote feature switches & kill-switch updated.', 'success');
    if (appLockdown) {
      showToast('🚨 EMERGENCY APP LOCKDOWN BROADCASTED! App is now FROZEN on user phones.');
    } else {
      showToast('✅ Feature Switches & Kill-Switch Pushed to Real App!');
    }
  } catch (err) {
    appendLog('Config error: ' + err.message, 'error');
    alert('Error: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '☁️ Push Feature Switches & Kill-Switch to Real App';
    }
  }
}

async function saveBookOfTheDay() {
  playUiClick();
  const title = document.getElementById('botdTitle')?.value.trim();
  const author = document.getElementById('botdAuthor')?.value.trim();
  const quote = document.getElementById('botdQuote')?.value.trim();

  if (!title) {
    alert('Please enter Book Title.');
    return;
  }

  try {
    if (!remoteConfigData) await fetchRemoteConfigPipeline();
    remoteConfigData.bookOfTheDay = {
      title: title,
      author: author,
      quote: quote,
      category: 'Featured',
      updatedAt: new Date().toISOString()
    };
    remoteConfigData.updatedAt = new Date().toISOString();

    await pushFileToGitHub('remote-config.json', JSON.stringify(remoteConfigData, null, 2), `Update Book of the Day: ${title}`);
    appendLog(`Book of the Day set to: "${title}"`, 'success');
    showToast(`🌟 Book of the Day Updated: "${title}"`);
  } catch (e) {
    appendLog('Book of the day error: ' + e.message, 'error');
    alert('Error: ' + e.message);
  }
}

// -------------------------------------------------------------
// GITHUB VAULT & CONNECTION
// -------------------------------------------------------------
function loadSavedGithubToken() {
  const tokenInput = document.getElementById('githubTokenInput');
  if (tokenInput && githubToken) {
    tokenInput.value = githubToken;
  }
}

function saveGithubToken() {
  playUiClick();
  const tokenInput = document.getElementById('githubTokenInput');
  if (tokenInput) {
    const val = tokenInput.value.trim();
    if (!val) {
      alert('Valid Token enter karein.');
      return;
    }
    githubToken = val;
    localStorage.setItem('mf_admin_github_token', val);
    showToast('✅ GitHub Token Saved!');
    testGitHubConnection();
  }
}

function clearGithubToken() {
  playUiClick();
  if (confirm('Kya aap saved GitHub Token remove/logout karna chahte hain?')) {
    githubToken = '';
    localStorage.removeItem('mf_admin_github_token');
    sessionStorage.removeItem('mf_admin_github_token');
    const tokenInput = document.getElementById('githubTokenInput');
    if (tokenInput) tokenInput.value = '';
    const statusEl = document.getElementById('tokenTestResult');
    if (statusEl) statusEl.innerHTML = '<span style="color:#94a3b8;">🔒 Token removed. Enter a new token to connect.</span>';
    const radarStatus = document.getElementById('radarStatusText');
    if (radarStatus) radarStatus.innerText = 'Offline (No Token)';
    appendLog('GitHub Token cleared / Logged out.', 'warn');
    showToast('🔒 GitHub Token Cleared');
  }
}

async function testGitHubConnection() {
  const statusEl = document.getElementById('tokenTestResult');
  const radarStatus = document.getElementById('radarStatusText');
  if (!githubToken) {
    if (statusEl) {
      statusEl.innerHTML = '<span style="color:#f59e0b; font-weight:700;">⚠️ No GitHub Token Configured.</span> Enter a Personal Access Token below to enable push access.';
    }
    if (radarStatus) radarStatus.innerText = 'No Token';
    return;
  }
  if (statusEl) statusEl.innerHTML = '<i>Testing connection...</i>';

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    const user = await res.json();
    
    const rateRes = await fetch('https://api.github.com/rate_limit', {
      headers: { 'Authorization': `token ${githubToken}` }
    });
    const rateData = await rateRes.json();
    const remaining = rateData.rate ? rateData.rate.remaining : 'Unknown';

    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#34d399; font-weight:800;">● Authenticated: @${user.login}</span> | Limit: ${remaining}/5000 left`;
    }
    if (radarStatus) {
      radarStatus.innerText = `@${user.login} (Online)`;
    }
    appendLog(`GitHub Authenticated: @${user.login} (${remaining} calls left)`, 'success');
  } catch (e) {
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#f43f5e; font-weight:800;">✕ Connection Error:</span> ${e.message}`;
    }
    if (radarStatus) radarStatus.innerText = 'Offline';
    appendLog('GitHub Auth Error: ' + e.message, 'error');
  }
}

// Logger & Toast
function appendLog(msg, type = 'info') {
  const consoleEl = document.getElementById('adminConsoleLog');
  if (!consoleEl) return;

  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const time = new Date().toLocaleTimeString();
  let typeClass = '';
  if (type === 'success') typeClass = 'log-success';
  if (type === 'warn') typeClass = 'log-warn';
  if (type === 'error') typeClass = 'log-error';

  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="${typeClass}">${msg}</span>`;
  consoleEl.appendChild(entry);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function showToast(text) {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// Window Bindings
window.broadcastLiveNotice = broadcastLiveNotice;
window.deactivateLiveNotice = deactivateLiveNotice;
window.triggerAutoSequence = triggerAutoSequence;
window.deployStagedReleaseToRealApp = deployStagedReleaseToRealApp;
window.rollbackToPreviousRelease = rollbackToPreviousRelease;
window.saveGithubToken = saveGithubToken;
window.clearGithubToken = clearGithubToken;
window.testGitHubConnection = testGitHubConnection;
window.saveRemoteConfigToCloud = saveRemoteConfigToCloud;
window.saveBookOfTheDay = saveBookOfTheDay;
window.selectEmoji = selectEmoji;
window.applyPreset = applyPreset;
window.resendHistoryNotice = resendHistoryNotice;

/* ==========================================================================
   FEATURE: 3D REAL PAGES DICTIONARY BOOK PREVIEW ENGINE IN CONTROL PANEL
   ========================================================================== */
let dictState = {
  activeSpread: 1,
  currentLetter: 'ALL',
  searchQuery: ''
};

const DICT_WORDS_PER_PAGE = 3;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function playPaperTurnAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
}

function speakDictWord(word) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported in this browser');
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

function getDictActiveList() {
  const allWords = window.DICTIONARY_WORDS || [];
  if (dictState.searchQuery.trim()) {
    const q = dictState.searchQuery.toLowerCase().trim();
    return allWords.filter(w => 
      (w.word && w.word.toLowerCase().includes(q)) ||
      (w.hindi && w.hindi.toLowerCase().includes(q)) ||
      (w.definition && w.definition.toLowerCase().includes(q)) ||
      (w.phonetic && w.phonetic.includes(q)) ||
      (w.syn && w.syn.toLowerCase().includes(q))
    );
  }
  if (dictState.currentLetter !== 'ALL') {
    return allWords.filter(w => 
      (w.word || '').toUpperCase().startsWith(dictState.currentLetter)
    );
  }
  return allWords;
}

function openDictionaryBookReader(startLetter) {
  const overlay = document.getElementById('dictionaryBookModalOverlay');
  if (!overlay) return;

  if (startLetter && typeof startLetter === 'string') {
    dictState.currentLetter = startLetter.toUpperCase();
  } else {
    dictState.currentLetter = 'ALL';
  }
  dictState.searchQuery = '';
  dictState.activeSpread = 1;

  const searchInput = document.getElementById('dictSearchInput');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('dictSearchClearBtn');
  if (clearBtn) clearBtn.style.display = 'none';

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  playPaperTurnAudio();
  renderDictAlphabetStrip();
  renderDictBookSpread();

  window.addEventListener('keydown', handleDictKeyNavigation);
}

function closeDictionaryBookReader() {
  const overlay = document.getElementById('dictionaryBookModalOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  window.removeEventListener('keydown', handleDictKeyNavigation);
}

function handleDictOverlayClick(event) {
  if (event.target.id === 'dictionaryBookModalOverlay') {
    closeDictionaryBookReader();
  }
}

function handleDictKeyNavigation(event) {
  const overlay = document.getElementById('dictionaryBookModalOverlay');
  if (!overlay || !overlay.classList.contains('active')) return;
  if (event.key === 'ArrowLeft') {
    turnDictPage(-1);
  } else if (event.key === 'ArrowRight') {
    turnDictPage(1);
  } else if (event.key === 'Escape') {
    closeDictionaryBookReader();
  }
}

function renderDictAlphabetStrip() {
  const strip = document.getElementById('dictAlphabetStrip');
  if (!strip) return;

  const letters = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  let html = '';
  letters.forEach(lettr => {
    const isActive = dictState.currentLetter === lettr;
    html += '<button type="button" class="dict-letter-tab ' + (isActive ? 'active' : '') + '" onclick="jumpToDictLetter(\'' + lettr + '\')">' + escapeHtml(lettr) + '</button>';
  });
  strip.innerHTML = html;
}

function jumpToDictLetter(letter) {
  dictState.currentLetter = letter;
  dictState.searchQuery = '';
  dictState.activeSpread = 1;

  const searchInput = document.getElementById('dictSearchInput');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('dictSearchClearBtn');
  if (clearBtn) clearBtn.style.display = 'none';

  playPaperTurnAudio();
  renderDictAlphabetStrip();
  renderDictBookSpread();
}

function onDictSearchInput(val) {
  dictState.searchQuery = val || '';
  dictState.activeSpread = 1;
  const clearBtn = document.getElementById('dictSearchClearBtn');
  if (clearBtn) clearBtn.style.display = dictState.searchQuery ? 'block' : 'none';

  if (dictState.searchQuery) {
    dictState.currentLetter = 'ALL';
    renderDictAlphabetStrip();
  }
  renderDictBookSpread();
}

function clearDictSearch() {
  const input = document.getElementById('dictSearchInput');
  if (input) input.value = '';
  onDictSearchInput('');
}

function turnDictPage(delta) {
  const list = getDictActiveList();
  const totalPages = Math.max(1, Math.ceil(list.length / DICT_WORDS_PER_PAGE));
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));

  const targetSpread = dictState.activeSpread + delta;
  if (targetSpread < 1 || targetSpread > totalSpreads) return;

  dictState.activeSpread = targetSpread;
  playPaperTurnAudio();

  const spreadEl = document.getElementById('dictBookSpread');
  if (spreadEl) {
    spreadEl.style.opacity = '0.7';
    spreadEl.style.transform = delta > 0 ? 'perspective(1400px) rotateY(-1.2deg)' : 'perspective(1400px) rotateY(1.2deg)';
    setTimeout(() => {
      spreadEl.style.opacity = '1';
      spreadEl.style.transform = 'none';
    }, 180);
  }

  renderDictBookSpread();
}

function onDictSliderChange(val) {
  dictState.activeSpread = parseInt(val) || 1;
  playPaperTurnAudio();
  renderDictBookSpread();
}

function renderDictBookSpread() {
  const list = getDictActiveList();
  const totalWords = list.length;
  const totalPages = Math.max(1, Math.ceil(totalWords / DICT_WORDS_PER_PAGE));
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));

  if (dictState.activeSpread > totalSpreads) {
    dictState.activeSpread = totalSpreads;
  }
  if (dictState.activeSpread < 1) {
    dictState.activeSpread = 1;
  }

  const leftPageNum = (dictState.activeSpread - 1) * 2 + 1;
  const rightPageNum = leftPageNum + 1;

  const leftStartIdx = (leftPageNum - 1) * DICT_WORDS_PER_PAGE;
  const leftWords = list.slice(leftStartIdx, leftStartIdx + DICT_WORDS_PER_PAGE);

  const rightStartIdx = (rightPageNum - 1) * DICT_WORDS_PER_PAGE;
  const rightWords = list.slice(rightStartIdx, rightStartIdx + DICT_WORDS_PER_PAGE);

  const leftPageEl = document.getElementById('dictPageLeft');
  const rightPageEl = document.getElementById('dictPageRight');

  if (leftPageEl) {
    leftPageEl.innerHTML = buildDictPageHtml(leftWords, leftPageNum, totalPages, false);
  }
  if (rightPageEl) {
    rightPageEl.innerHTML = buildDictPageHtml(rightWords, rightPageNum, totalPages, true);
  }

  const prevBtn = document.getElementById('dictPrevBtn');
  const nextBtn = document.getElementById('dictNextBtn');
  if (prevBtn) prevBtn.disabled = (dictState.activeSpread <= 1);
  if (nextBtn) nextBtn.disabled = (dictState.activeSpread >= totalSpreads);

  const indicator = document.getElementById('dictPageIndicator');
  if (indicator) {
    if (dictState.searchQuery) {
      indicator.innerHTML = '🔍 Found <strong>' + totalWords + '</strong> words • Pages ' + leftPageNum + '-' + Math.min(rightPageNum, totalPages) + ' of ' + totalPages;
    } else {
      indicator.innerHTML = '📖 Pages <strong>' + leftPageNum + '-' + Math.min(rightPageNum, totalPages) + '</strong> of ' + totalPages;
    }
  }

  const slider = document.getElementById('dictPageSlider');
  if (slider) {
    slider.min = 1;
    slider.max = totalSpreads;
    slider.value = dictState.activeSpread;
  }
}

function buildDictPageHtml(words, pageNum, totalPages, isRightPage) {
  if (pageNum > totalPages && words.length === 0) {
    return '<div class="dict-page-header">' +
      '<span class="dict-header-letter">✨</span>' +
      '<span class="dict-header-running-head">NOTES &amp; REFLECTIONS</span>' +
      '<span class="dict-page-num">ENDPAPER</span>' +
      '</div>' +
      '<div class="dict-page-content" style="align-items:center; justify-content:center; text-align:center; color:#94a3b8; padding:30px;">' +
      '<div style="font-size:3rem; margin-bottom:12px;">🌟</div>' +
      '<h3 style="font-family:serif; color:#334155; margin-bottom:6px;">Vocabulary Mastery</h3>' +
      '<p style="font-size:0.85rem; line-height:1.5; color:#64748b;">"Words are the clothing of ideas. Expand your vocabulary, expand your universe."</p>' +
      '<div style="margin-top:20px; font-size:0.8rem; font-style:italic; color:#94a3b8;">Mind &amp; Focus Books • Oxford Lexicon</div>' +
      '</div>' +
      '<div class="dict-page-footer">Daily Mind Expansion • Page ' + pageNum + '</div>';
  }

  if (words.length === 0) {
    return '<div class="dict-page-header">' +
      '<span class="dict-header-letter">⚠️</span>' +
      '<span class="dict-header-running-head">SEARCH RESULTS</span>' +
      '<span class="dict-page-num">PAGE ' + pageNum + '</span>' +
      '</div>' +
      '<div class="dict-page-content" style="align-items:center; justify-content:center; text-align:center; color:#94a3b8; padding:40px 20px;">' +
      '<div style="font-size:3rem; margin-bottom:12px;">🔍</div>' +
      '<h3 style="font-family:serif; color:#334155;">No Words Found</h3>' +
      '<p style="font-size:0.85rem; color:#64748b; margin-top:6px;">Try another English word, Hindi meaning, or reset filter.</p>' +
      '<button type="button" class="dict-nav-btn primary" onclick="clearDictSearch()" style="margin-top:16px; padding:6px 16px; font-size:0.8rem;">Clear Search</button>' +
      '</div>' +
      '<div class="dict-page-footer">Mind &amp; Focus Books • Search Lexicon</div>';
  }

  const firstLetter = (words[0].word || 'A').charAt(0).toUpperCase();

  let cardsHtml = '';
  words.forEach(item => {
    cardsHtml += '<div class="dict-entry-card">' +
      '<div class="dict-entry-top">' +
      '<span class="dict-entry-word">' + escapeHtml(item.word) + '</span>' +
      (item.phonetic ? '<span class="dict-entry-phonetic">[' + escapeHtml(item.phonetic) + ']</span>' : '') +
      (item.type ? '<span class="dict-entry-type">' + escapeHtml(item.type) + '</span>' : '') +
      '<button type="button" class="dict-listen-btn" onclick="speakDictWord(\'' + escapeHtml(item.word).replace(/'/g, "\\'") + '\')" title="Listen to English Pronunciation">' +
      '🔊 Pronounce' +
      '</button>' +
      '</div>' +
      '<div class="dict-hindi-pill">अर्थ: ' + escapeHtml(item.hindi) + '</div>' +
      '<div class="dict-entry-def">' + escapeHtml(item.definition) + '</div>' +
      (item.example ? '<div class="dict-entry-example">"' + escapeHtml(item.example) + '"' +
        (item.exampleHindi ? '<div class="dict-entry-example-hindi">हिन्दी: ' + escapeHtml(item.exampleHindi) + '</div>' : '') +
        '</div>' : '') +
      (item.syn ? '<div class="dict-synonyms-row"><strong>समानार्थक (Synonyms):</strong> ' + escapeHtml(item.syn) + '</div>' : '') +
      '</div>';
  });

  return '<div class="dict-page-header">' +
    '<span class="dict-header-letter">' + escapeHtml(firstLetter) + '</span>' +
    '<span class="dict-header-running-head">FOCUS VOCABULARY</span>' +
    '<span class="dict-page-num">PAGE ' + pageNum + '</span>' +
    '</div>' +
    '<div class="dict-page-content">' +
    cardsHtml +
    '</div>' +
    '<div class="dict-page-footer">Mind &amp; Focus Books • Daily Vocabulary Builder</div>';
}

window.openDictionaryBookReader = openDictionaryBookReader;
window.closeDictionaryBookReader = closeDictionaryBookReader;
window.handleDictOverlayClick = handleDictOverlayClick;
window.jumpToDictLetter = jumpToDictLetter;
window.turnDictPage = turnDictPage;
window.onDictSliderChange = onDictSliderChange;
window.onDictSearchInput = onDictSearchInput;
window.clearDictSearch = clearDictSearch;
window.speakDictWord = speakDictWord;
window.playPaperTurnAudio = playPaperTurnAudio;

// =========================================================================
// 🎁 MYSTERY GOLDEN GIFT BOX CONTROLLER (CONTROL PANEL DISPATCHER)
// =========================================================================

let activeGiftBoxOpen = false;
let currentActiveGiftData = null;
let confettiAnimFrame = null;

function getSelectedGiftRewardType() {
  const selected = document.querySelector('input[name="giftRewardType"]:checked');
  return selected ? selected.value : 'vip_badge';
}

function testGiftDropInPanel() {
  const rType = getSelectedGiftRewardType();
  const title = document.getElementById('giftTitleInput')?.value || '👑 Special VIP Surprise From Mind Focus!';
  const rewardName = document.getElementById('giftRewardNameInput')?.value || 'VIP Golden Reader Badge';
  const message = document.getElementById('giftMessageInput')?.value || 'Aapko Mind Focus Books Tracker ki taraf se exclusive VIP recognition mili hai!';

  const giftPayload = {
    id: 'test-gift-' + Date.now(),
    type: 'mystery_gift',
    isMysteryGift: true,
    active: true,
    rewardType: rType,
    title: title,
    rewardName: rewardName,
    message: message
  };

  appendLog(`🎁 Testing 3D Gift Box Drop in Panel (Reward: ${rType})...`, 'info');
  triggerFallingGoldenGiftBox(giftPayload);
}

async function dispatchGiftDropToAllPhones() {
  const rType = getSelectedGiftRewardType();
  const title = document.getElementById('giftTitleInput')?.value.trim() || '👑 Special VIP Surprise From Mind Focus!';
  const rewardName = document.getElementById('giftRewardNameInput')?.value.trim() || 'VIP Golden Reader Badge';
  const message = document.getElementById('giftMessageInput')?.value.trim() || 'Aapko Mind Focus Books Tracker ki taraf se exclusive VIP recognition mili hai! Tap to open your mystery box.';

  const confirmMsg = `Kya aap sach me sabhi users ke phone par Golden Gift Box "${rewardName}" drop karna chahte hain?`;
  if (!confirm(confirmMsg)) return;

  const btn = document.getElementById('btnDropGiftToAllPhones');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Dropping Gift Box to Cloud...';
  }

  try {
    const giftId = 'gift-drop-' + Date.now();
    const giftPayload = {
      id: giftId,
      type: 'mystery_gift',
      isMysteryGift: true,
      active: true,
      rewardType: rType,
      title: title,
      rewardName: rewardName,
      message: message,
      timestamp: new Date().toISOString()
    };

    const jsonContent = JSON.stringify(giftPayload, null, 2);
    const jsContent = 'window.__REMOTE_BROADCAST_NOTICE__ = ' + JSON.stringify(giftPayload, null, 2) + ';\n';

    appendLog(`🎁 Transmitting Golden Gift Box to all connected phones...`, 'warn');

    await pushFileToGitHub('broadcast-notice.json', jsonContent, `Drop Gift Box: ${rewardName}`);
    await pushFileToGitHub('broadcast-notice.js', jsContent, `Drop Gift Box JS: ${rewardName}`);

    // Instant local broadcast for multi-tab testing
    try {
      localStorage.setItem('mindfocus_local_broadcast_trigger', JSON.stringify(giftPayload));
      localStorage.setItem('mindfocus_current_live_notice', JSON.stringify(giftPayload));
    } catch (e) {}

    playDeployChime();
    appendLog(`🎉 SUCCESS: 3D Golden Gift Box dropped to all active phones! (ID: ${giftId})`, 'success');
    showToast(`🎁 Golden Gift Box Dropped to All Phones!`);
  } catch (err) {
    appendLog(`Failed to drop gift box: ${err.message}`, 'error');
    alert(`Gift Drop Error: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>🎁</span> Drop Golden Gift Box to All Phones';
    }
  }
}

async function deactivateGiftDrop() {
  if (!confirm('Kya aap sabhi phones se active gift drop hatana chahte hain?')) return;
  try {
    const offPayload = {
      id: 'gift-off-' + Date.now(),
      active: false,
      message: ''
    };
    const jsonContent = JSON.stringify(offPayload, null, 2);
    const jsContent = 'window.__REMOTE_BROADCAST_NOTICE__ = ' + JSON.stringify(offPayload, null, 2) + ';\n';

    await pushFileToGitHub('broadcast-notice.json', jsonContent, 'Deactivate Gift Box Drop');
    await pushFileToGitHub('broadcast-notice.js', jsContent, 'Deactivate Gift Box Drop JS');

    try {
      localStorage.setItem('mindfocus_local_broadcast_trigger', JSON.stringify(offPayload));
      localStorage.removeItem('mindfocus_current_live_notice');
    } catch (e) {}

    appendLog('🛑 Golden Gift Box Drop deactivated.', 'info');
    showToast('🛑 Gift Drop Turned Off');
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// In-Panel Audio Synthesizers for 3D Gift Box
function playGiftFallSound() {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.85);

    gain.setValueAtTime(0.12, now);
    gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.85);
  } catch (e) {}
}

function playGiftCrackersFanfare() {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;

    // Pop sounds
    for (let i = 0; i < 7; i++) {
      const burstDelay = now + (i * 0.07) + (Math.random() * 0.04);
      const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.08, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let j = 0; j < noiseBuffer.length; j++) {
        output[j] = (Math.random() * 2 - 1) * Math.exp(-j / (audioCtx.sampleRate * 0.02));
      }
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200 + Math.random() * 800;

      const popGain = audioCtx.createGain();
      popGain.gain.setValueAtTime(0.25, burstDelay);
      popGain.gain.exponentialRampToValueAtTime(0.001, burstDelay + 0.08);

      whiteNoise.connect(filter);
      filter.connect(popGain);
      popGain.connect(audioCtx.destination);

      whiteNoise.start(burstDelay);
      whiteNoise.stop(burstDelay + 0.09);
    }

    // Victory fanfare arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const noteTime = now + 0.15 + (idx * 0.12);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.setValueAtTime(0.18, noteTime);
      gain.exponentialRampToValueAtTime(0.001, noteTime + 0.55);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.55);
    });
  } catch (e) {}
}

function playGiftClaimChime() {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    [659.25, 830.61, 987.77, 1318.51].forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const t = now + (i * 0.09);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.setValueAtTime(0.14, t);
      gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  } catch (e) {}
}

function triggerFallingGoldenGiftBox(giftData = {}) {
  currentActiveGiftData = Object.assign({
    id: 'gift-' + Date.now(),
    rewardType: 'vip_badge',
    title: 'Surprise Golden Gift Box',
    message: 'Aapko Mind Focus Books Tracker ki taraf se exclusive VIP recognition mili hai!',
    rewardName: 'VIP Golden Reader Badge',
    rewardEmblem: '👑'
  }, giftData);

  activeGiftBoxOpen = false;

  const overlay = document.getElementById('mysteryGiftOverlay');
  const stage = document.getElementById('giftBoxStage');
  const rewardModal = document.getElementById('giftRewardModal');
  const tapPrompt = document.getElementById('giftTapPrompt');

  if (!overlay || !stage) return;

  stage.classList.remove('opened');
  if (rewardModal) rewardModal.classList.remove('active');
  if (tapPrompt) tapPrompt.style.display = 'flex';

  const rType = currentActiveGiftData.rewardType;
  const crownIcon = document.getElementById('rewardCrownIcon');
  const pillText = document.getElementById('rewardPillText');
  const titleText = document.getElementById('rewardTitleText');
  const emblem = document.getElementById('rewardEmblem');
  const descText = document.getElementById('rewardDescText');
  const perkBox = document.getElementById('rewardPerkBox');

  if (rType === 'secret_book') {
    if (crownIcon) crownIcon.innerText = '📖';
    if (pillText) pillText.innerText = 'SECRET BOOK UNLOCKED';
    if (titleText) titleText.innerText = currentActiveGiftData.rewardName || 'Secret Focus Masterclass Book';
    if (emblem) emblem.innerText = '🔮';
    if (descText) descText.innerText = currentActiveGiftData.message || 'You unlocked an exclusive secret masterclass book in your bookshelf!';
    if (perkBox) {
      perkBox.innerHTML = `
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>Permanent access to Secret Bonus Book in library</span></div>
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>Full summary, Hindi notes &amp; key insights included</span></div>
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>Read anytime offline with zero limits</span></div>
      `;
    }
  } else if (rType === 'golden_notes') {
    if (crownIcon) crownIcon.innerText = '📜';
    if (pillText) pillText.innerText = 'EXCLUSIVE WISDOM SCROLL';
    if (titleText) titleText.innerText = currentActiveGiftData.rewardName || '10 Billionaire Mental Models';
    if (emblem) emblem.innerText = '⚡';
    if (descText) descText.innerText = currentActiveGiftData.message || 'Exclusive mental models of Elon Musk, Warren Buffett & Marcus Aurelius unlocked!';
    if (perkBox) {
      perkBox.innerHTML = `
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>First-Principles Thinking &amp; Inversion Framework</span></div>
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>Unlocked in your Book Notes Vault</span></div>
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>Daily actionable mental models guide</span></div>
      `;
    }
  } else {
    if (crownIcon) crownIcon.innerText = '👑';
    if (pillText) pillText.innerText = 'VIP MASTER READER AWARD';
    if (titleText) titleText.innerText = currentActiveGiftData.rewardName || 'VIP Golden Reader Badge';
    if (emblem) emblem.innerText = currentActiveGiftData.rewardEmblem || '👑';
    if (descText) descText.innerText = currentActiveGiftData.message || 'Aapko Mind Focus Books Tracker ki taraf se permanent VIP Master Reader recognition mili hai!';
    if (perkBox) {
      perkBox.innerHTML = `
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>Permanent glowing Golden Crown Badge in App Header</span></div>
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>VIP Priority on all new book releases &amp; updates</span></div>
        <div class="reward-perk-item"><span class="reward-perk-icon">✦</span> <span>Reading Streak Protection &amp; Golden Shield</span></div>
      `;
    }
  }

  overlay.classList.add('active');
  playGiftFallSound();
}

function openGoldenGiftBox(event) {
  if (activeGiftBoxOpen) return;
  activeGiftBoxOpen = true;
  if (event) event.stopPropagation();

  const stage = document.getElementById('giftBoxStage');
  const rewardModal = document.getElementById('giftRewardModal');

  if (stage) stage.classList.add('opened');

  playGiftCrackersFanfare();
  startConfettiCrackersBurst();

  setTimeout(() => {
    if (rewardModal) rewardModal.classList.add('active');
  }, 650);
}

function startConfettiCrackersBurst() {
  const canvas = document.getElementById('giftConfettiCanvas');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (confettiAnimFrame) {
    cancelAnimationFrame(confettiAnimFrame);
    confettiAnimFrame = null;
  }

  const particles = [];
  const colors = ['#fbbf24', '#f59e0b', '#d97706', '#ef4444', '#dc2626', '#10b981', '#34d399', '#38bdf8', '#f8fafc'];
  const originX = canvas.width / 2;
  const originY = canvas.height / 2;

  for (let i = 0; i < 180; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const speed = 6 + Math.random() * 16;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 6 + 4),
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 14,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      opacity: 1,
      decay: Math.random() * 0.008 + 0.005
    });
  }

  const startTime = Date.now();

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeCount = 0;
    particles.forEach(p => {
      if (p.opacity <= 0) return;
      activeCount++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28;
      p.vx *= 0.985;
      p.rotation += p.rotSpeed;
      p.opacity -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    if (activeCount > 0 && (Date.now() - startTime) < 4500) {
      confettiAnimFrame = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiAnimFrame = null;
    }
  }

  confettiAnimFrame = requestAnimationFrame(renderConfetti);
}

function claimSurpriseReward() {
  playGiftClaimChime();
  const overlay = document.getElementById('mysteryGiftOverlay');
  const rewardModal = document.getElementById('giftRewardModal');

  showToast('🎉 Reward Claimed in Simulation Preview!');

  if (rewardModal) rewardModal.classList.remove('active');
  setTimeout(() => {
    if (overlay) overlay.classList.remove('active');
    activeGiftBoxOpen = false;
  }, 400);
}

// Window bindings for control panel
window.testGiftDropInPanel = testGiftDropInPanel;
window.dispatchGiftDropToAllPhones = dispatchGiftDropToAllPhones;
window.deactivateGiftDrop = deactivateGiftDrop;
window.openGoldenGiftBox = openGoldenGiftBox;
window.claimSurpriseReward = claimSurpriseReward;

// ==========================================
// 3D SMART FLASHCARDS STUDIO ENGINE
// ==========================================
function updateFlashcardPreview() {
  const dict = window.DICTIONARY_WORDS || [];
  for (let i = 1; i <= 5; i++) {
    const input = document.getElementById(`fcTargetWord${i}`);
    const preview = document.getElementById(`fcSlotPreview${i}`);
    if (!input || !preview) continue;
    const val = input.value.trim().toLowerCase();
    if (!val) {
      preview.textContent = 'Empty slot';
      preview.style.color = 'var(--text-muted)';
      continue;
    }
    const found = dict.find(w => w.word.toLowerCase() === val);
    if (found) {
      preview.textContent = `${found.type || 'word'} • ${found.hindi || 'अर्थ'}`;
      preview.style.color = '#34d399';
    } else {
      preview.textContent = `custom word (manual)`;
      preview.style.color = '#fbbf24';
    }
  }
}

function shuffle5TargetWords() {
  playUiClick();
  const dict = window.DICTIONARY_WORDS || [];
  if (dict.length < 5) {
    showToast('⚠️ Dictionary words not loaded');
    return;
  }
  const shuffled = [...dict].sort(() => Math.random() - 0.5);
  for (let i = 1; i <= 5; i++) {
    const input = document.getElementById(`fcTargetWord${i}`);
    if (input && shuffled[i - 1]) {
      input.value = shuffled[i - 1].word;
    }
  }
  updateFlashcardPreview();
  showToast('🎲 5 Target Words Shuffled from Dictionary!');
}

async function dispatchFlashcardsDropToAllPhones() {
  const words = [];
  for (let i = 1; i <= 5; i++) {
    const input = document.getElementById(`fcTargetWord${i}`);
    const val = input ? input.value.trim() : '';
    if (val) words.push(val);
  }

  if (words.length === 0) {
    alert('Kripya kam se kam 1 word target select karein!');
    return;
  }

  const title = document.getElementById('fcChallengeTitle')?.value.trim() || "🎴 Today's 5 Target Words Challenge!";
  const btnText = document.getElementById('fcChallengeBtnText')?.value.trim() || "🎴 Practice Flashcards Now";
  const message = document.getElementById('fcChallengeMessage')?.value.trim() || "Aapke liye 5 naye 3D smart flashcards unlock ho chuke hain! Tap karke test karein.";

  const confirmMsg = `Kya aap sach me ye 5 target words sabhi users ke phone par push karna chahte hain?\n\nWords: ${words.join(', ')}`;
  if (!confirm(confirmMsg)) return;

  const btn = document.getElementById('btnPushDailyFlashcards');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Transmitting Flashcards to Cloud...';
  }

  try {
    const dropId = 'fc-drop-' + Date.now();
    const payload = {
      id: dropId,
      type: 'flashcard_drop',
      isFlashcardDrop: true,
      card: 'card2',
      active: true,
      icon: '🎴',
      title: title,
      btnText: btnText,
      message: message,
      words: words,
      timestamp: new Date().toISOString()
    };

    const jsonContent = JSON.stringify(payload, null, 2);
    const jsContent = 'window.__REMOTE_BROADCAST_NOTICE__ = ' + JSON.stringify(payload, null, 2) + ';\n';

    appendLog(`🎴 Transmitting 5 Target Words to all active phones... (${words.join(', ')})`, 'warn');

    await pushFileToGitHub('broadcast-notice.json', jsonContent, `Push Flashcards Challenge: ${words.slice(0, 3).join(', ')}`);
    await pushFileToGitHub('broadcast-notice.js', jsContent, `Push Flashcards Challenge JS: ${words.slice(0, 3).join(', ')}`);

    try {
      localStorage.setItem('mindfocus_local_broadcast_trigger', JSON.stringify(payload));
      localStorage.setItem('mindfocus_current_live_notice', JSON.stringify(payload));
    } catch (e) {}

    playDeployChime();
    appendLog(`🎉 SUCCESS: Today's 5 Target Words pushed to all connected phones! (ID: ${dropId})`, 'success');
    showToast(`🎴 5 Flashcards Challenge Pushed to All Phones!`);
  } catch (err) {
    appendLog(`Failed to push flashcards: ${err.message}`, 'error');
    alert(`Flashcards Push Error: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "<span>🎴</span> Push Today's 5 Target Words to All Phones";
    }
  }
}

async function deactivateFlashcardsDrop() {
  if (!confirm('Kya aap active flashcard challenge ko sabhi phones se hatana chahte hain?')) return;
  try {
    const offPayload = {
      id: 'fc-off-' + Date.now(),
      active: false,
      message: ''
    };
    const jsonContent = JSON.stringify(offPayload, null, 2);
    const jsContent = 'window.__REMOTE_BROADCAST_NOTICE__ = ' + JSON.stringify(offPayload, null, 2) + ';\n';

    await pushFileToGitHub('broadcast-notice.json', jsonContent, 'Deactivate Flashcards Challenge');
    await pushFileToGitHub('broadcast-notice.js', jsContent, 'Deactivate Flashcards Challenge JS');

    try {
      localStorage.setItem('mindfocus_local_broadcast_trigger', JSON.stringify(offPayload));
      localStorage.removeItem('mindfocus_current_live_notice');
    } catch (e) {}

    appendLog('🛑 Flashcard Challenge deactivated.', 'info');
    showToast('🛑 Flashcard Challenge Stopped');
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

window.updateFlashcardPreview = updateFlashcardPreview;
window.shuffle5TargetWords = shuffle5TargetWords;
window.dispatchFlashcardsDropToAllPhones = dispatchFlashcardsDropToAllPhones;
window.deactivateFlashcardsDrop = deactivateFlashcardsDrop;

// ==========================================================================
// 💬 LIVE IN-APP HELP DESK & USER CHAT STUDIO
// ==========================================================================

const HELPDESK_CLOUD_TOPIC = 'mf_helpdesk_ankitburdak05';
const HELPDESK_RELAY_URL = 'https://ntfy.sh/' + HELPDESK_CLOUD_TOPIC;

let adminChatThreads = {};
let activeChatUserId = null;
let adminChatSoundEnabled = true;
let lastKnownUserMsgCount = 0;
let adminChatBroadcastChannel = null;
let adminChatEventSource = null;

function initAdminHelpDeskListeners() {
  // 1. Zero-latency BroadcastChannel (0ms sync for same browser/origin)
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      adminChatBroadcastChannel = new BroadcastChannel('mindfocus_helpdesk_channel');
      adminChatBroadcastChannel.onmessage = (e) => {
        if (e.data && e.data.type === 'helpdesk_chat_msg') {
          handleAdminIncomingHelpDeskDirectMessage(e.data);
        } else if (e.data && e.data.type === 'helpdesk_phone_crash_telemetry') {
          handleIncomingPhoneCrashTelemetry(e.data);
        }
      };
    }
  } catch (e) {}

  // 2. Storage event listener (cross-tab sync)
  window.addEventListener('storage', (e) => {
    if (e.key === 'mindfocus_chat_last_event' && e.newValue) {
      try {
        const item = JSON.parse(e.newValue);
        if (item && item.payload && item.payload.type === 'helpdesk_chat_msg') {
          handleAdminIncomingHelpDeskDirectMessage(item.payload);
        } else if (item && item.payload && item.payload.type === 'helpdesk_phone_crash_telemetry') {
          handleIncomingPhoneCrashTelemetry(item.payload);
        }
      } catch (err) {}
    }
  });

  // 3. Connect to Cloud Relay via SSE (Instant live delivery from Remote Phone Apps)
  connectAdminCloudRelaySSE();
}

function connectAdminCloudRelaySSE() {
  if (typeof EventSource === 'undefined') return;
  try {
    if (adminChatEventSource) adminChatEventSource.close();
    adminChatEventSource = new EventSource(HELPDESK_RELAY_URL + '/sse');
    adminChatEventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed && parsed.message) {
          const payload = typeof parsed.message === 'string' ? JSON.parse(parsed.message) : parsed.message;
          if (payload && payload.type === 'helpdesk_chat_msg') {
            handleAdminIncomingHelpDeskDirectMessage(payload);
          } else if (payload && payload.type === 'helpdesk_phone_crash_telemetry') {
            handleIncomingPhoneCrashTelemetry(payload);
          }
        }
      } catch (err) {}
    };
    adminChatEventSource.onerror = () => {};
  } catch (e) {}
}

function handleAdminIncomingHelpDeskDirectMessage(payload) {
  if (!payload || !payload.threadId || !payload.message) return;
  const tid = payload.threadId;
  const msg = payload.message;

  if (!adminChatThreads) adminChatThreads = {};
  if (!adminChatThreads[tid]) {
    adminChatThreads[tid] = {
      userId: tid,
      userName: payload.userName || ('Reader #' + tid.slice(-4).toUpperCase()),
      userDevice: payload.userDevice || 'Reader App',
      unreadByAdmin: 0,
      unreadByUser: 0,
      lastMessage: '',
      lastTimestamp: new Date().toISOString(),
      messages: []
    };
  }

  const thread = adminChatThreads[tid];
  if (!Array.isArray(thread.messages)) thread.messages = [];

  const exists = thread.messages.some(m => m.id === msg.id || (m.timestamp === msg.timestamp && m.text === msg.text));
  if (exists) return;

  thread.messages.push(msg);
  thread.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  thread.lastMessage = msg.text;
  thread.lastTimestamp = msg.timestamp;

  if (msg.sender === 'user') {
    if (activeChatUserId !== tid) {
      thread.unreadByAdmin = (thread.unreadByAdmin || 0) + 1;
    }
    playChatAudioChime('receive');
    showToast(`💬 ${thread.userName}: "${msg.text.length > 25 ? msg.text.substring(0, 22) + '...' : msg.text}"`);
    appendLog(`💬 Incoming message from ${thread.userName} (${thread.userDevice}): "${msg.text}"`, 'info');
  }

  saveChatDataLocallyAndRemote();
  renderChatThreadsList();
  if (activeChatUserId === tid) {
    renderActiveConversation(tid);
  }
}

function playChatAudioChime(type = 'receive') {
  if (!adminChatSoundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'receive') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

function toggleAdminChatSound() {
  adminChatSoundEnabled = !adminChatSoundEnabled;
  const btn = document.getElementById('btnToggleChatAudio');
  if (btn) {
    btn.innerHTML = adminChatSoundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
    btn.style.color = adminChatSoundEnabled ? '#34d399' : '#94a3b8';
  }
  showToast(adminChatSoundEnabled ? '🔔 Chat Sound Enabled' : '🔕 Chat Sound Muted');
}

async function fetchChatMessagesData() {
  // 1. First ensure we retain local threads so NOTHING is ever lost
  let localData = null;
  try {
    const local = localStorage.getItem('mindfocus_chat_data');
    if (local) localData = JSON.parse(local);
  } catch (e) {}

  if (localData && localData.threads) {
    for (const tid in localData.threads) {
      if (!adminChatThreads[tid]) {
        adminChatThreads[tid] = localData.threads[tid];
      } else {
        const myThread = adminChatThreads[tid];
        const locThread = localData.threads[tid];
        const existingIds = new Set((myThread.messages || []).map(m => m.id));
        (locThread.messages || []).forEach(m => {
          if (!existingIds.has(m.id)) {
            myThread.messages.push(m);
            existingIds.add(m.id);
          }
        });
        myThread.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }
    }
  }

  // 2. Poll Cloud Relay for any missed incoming events (with rate limit backoff protection)
  if (!window.__ntfyBackoffUntil || Date.now() > window.__ntfyBackoffUntil) {
    try {
      const pollRes = await fetch(HELPDESK_RELAY_URL + '/json?poll=1&since=5m');
      if (pollRes.status === 429) {
        // Rate limited: Back off for 3 minutes and rely on local storage & git
        window.__ntfyBackoffUntil = Date.now() + 180000;
        console.warn('ntfy.sh rate-limited. Backing off for 3 minutes.');
      } else if (pollRes.ok) {
        const text = await pollRes.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const item = JSON.parse(line);
            if (item && item.message) {
              const payload = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
              if (payload && payload.type === 'helpdesk_chat_msg') {
                handleAdminIncomingHelpDeskDirectMessage(payload);
              } else if (payload && payload.type === 'helpdesk_phone_crash_telemetry') {
                handleIncomingPhoneCrashTelemetry(payload);
              }
            }
          } catch (e) {}
        }
      }
    } catch (err) {}
  }

  // 3. Non-destructive merge from chat-messages.json
  const cb = Date.now();
  try {
    let chatUrl = `chat-messages.json?cb=${cb}`;
    if (typeof window !== 'undefined' && (window.location.protocol === 'file:' || !window.location.host)) {
      chatUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/chat-messages.json?cb=${cb}`;
    }
    let res = await fetch(chatUrl, { cache: 'no-store' });
    if (!res.ok && chatUrl.startsWith('chat-messages.json')) {
      res = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/chat-messages.json?cb=${cb}`, { cache: 'no-store' });
    }
    if (res && res.ok) {
      const remoteData = await res.json();
      if (remoteData && remoteData.threads) {
        for (const tid in remoteData.threads) {
          if (!adminChatThreads[tid]) {
            adminChatThreads[tid] = remoteData.threads[tid];
          } else {
            const myThread = adminChatThreads[tid];
            const remThread = remoteData.threads[tid];
            const existingIds = new Set((myThread.messages || []).map(m => m.id));
            (remThread.messages || []).forEach(m => {
              if (!existingIds.has(m.id)) {
                myThread.messages.push(m);
                existingIds.add(m.id);
              }
            });
            myThread.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          }
        }
      }
    }
  } catch (err) {}

  return { threads: adminChatThreads };
}

async function refreshAdminChatThreads(manual = false) {
  try {
    const data = await fetchChatMessagesData();
    if (!data || !data.threads) return;

    adminChatThreads = data.threads;

    let totalUnread = 0;
    let totalUserMsgs = 0;
    Object.values(adminChatThreads).forEach(t => {
      totalUnread += (t.unreadByAdmin || 0);
      if (Array.isArray(t.messages)) {
        t.messages.forEach(m => {
          if (m.sender === 'user') totalUserMsgs++;
        });
      }
    });

    const badge = document.getElementById('adminChatUnreadBadge');
    if (badge) {
      if (totalUnread > 0) {
        badge.innerText = totalUnread;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    if (totalUserMsgs > lastKnownUserMsgCount && lastKnownUserMsgCount > 0) {
      playChatAudioChime('receive');
      showToast('💬 Naya User Message Aaya Hai!');
    }
    lastKnownUserMsgCount = totalUserMsgs;

    renderChatThreadsList();

    if (activeChatUserId && adminChatThreads[activeChatUserId]) {
      renderActiveConversation(activeChatUserId);
    }

    if (manual) {
      showToast('🔄 Chat Threads Updated');
    }
  } catch (e) {
    console.error('refreshAdminChatThreads error:', e);
  }
}

function renderChatThreadsList(filteredList = null) {
  const container = document.getElementById('chatThreadsList');
  if (!container) return;

  const threads = filteredList || Object.values(adminChatThreads);

  if (threads.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 14px; color:var(--text-muted); font-size:0.82rem;">
        Koi active conversation nahi hai.<br>
        <button type="button" class="btn-chat-action" onclick="simulateIncomingUserMessage()" style="margin-top:10px;">
          🧪 Test Message Bhejo
        </button>
      </div>`;
    return;
  }

  threads.sort((a, b) => new Date(b.lastTimestamp || 0) - new Date(a.lastTimestamp || 0));

  let html = '';
  threads.forEach(t => {
    const isActive = t.userId === activeChatUserId;
    const initial = (t.userName || 'R').charAt(0).toUpperCase();
    const timeStr = formatChatTime(t.lastTimestamp);
    const unread = t.unreadByAdmin || 0;

    html += `
      <div class="chat-thread-card ${isActive ? 'active' : ''}" onclick="selectChatThread('${t.userId}')">
        <div class="chat-avatar-wrap">
          <span>${initial}</span>
          <div class="chat-avatar-dot"></div>
        </div>
        <div class="chat-thread-info">
          <div class="chat-thread-name-row">
            <span class="chat-thread-name">${escapeHtml(t.userName || 'Reader')}</span>
            <span class="chat-thread-time">${timeStr}</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span class="chat-thread-snippet">${escapeHtml(t.lastMessage || 'No messages')}</span>
            ${unread > 0 ? `<span class="chat-thread-unread-pill">${unread}</span>` : ''}
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

function selectChatThread(userId) {
  playUiClick();
  activeChatUserId = userId;
  const thread = adminChatThreads[userId];
  if (!thread) return;

  if (thread.unreadByAdmin > 0) {
    thread.unreadByAdmin = 0;
    saveChatDataLocallyAndRemote();
  }

  renderChatThreadsList();
  renderActiveConversation(userId);
}

function renderActiveConversation(userId) {
  const thread = adminChatThreads[userId];
  if (!thread) return;

  const avatar = document.getElementById('chatActiveUserAvatar');
  const nameEl = document.getElementById('chatActiveUserName');
  const deviceEl = document.getElementById('chatActiveUserDevice');
  const statusEl = document.getElementById('chatActiveUserStatus');
  const streamEl = document.getElementById('chatMessagesStream');

  if (avatar) avatar.innerText = (thread.userName || 'R').charAt(0).toUpperCase();
  if (nameEl) nameEl.innerText = thread.userName || 'Reader';
  if (deviceEl) deviceEl.innerText = thread.userDevice || 'Android';
  if (statusEl) statusEl.innerHTML = '🟢 Reader Online &bull; Direct Session Active';

  if (!streamEl) return;

  const messages = thread.messages || [];
  if (messages.length === 0) {
    streamEl.innerHTML = `
      <div class="chat-empty-state">
        <div style="font-size:32px; margin-bottom:6px;">💬</div>
        <div style="font-weight:700;">No messages yet</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">Reply below to start chatting with this reader!</div>
      </div>`;
    return;
  }

  let html = `
    <div class="chat-date-divider">
      <span class="chat-date-pill">Today &bull; Direct Help Desk Session</span>
    </div>`;

  messages.forEach(m => {
    const isUser = m.sender === 'user';
    const timeStr = formatChatTime(m.timestamp);

    html += `
      <div class="chat-msg-row ${isUser ? 'from-user' : 'from-admin'}">
        <div class="chat-bubble">
          ${escapeHtml(m.text)}
          <div class="chat-bubble-meta">
            <span>${timeStr}</span>
            ${!isUser ? '<span style="color:#6ee7b7;">✓✓</span>' : ''}
          </div>
        </div>
      </div>`;
  });

  streamEl.innerHTML = html;
  streamEl.scrollTop = streamEl.scrollHeight;
}

function handleAdminChatKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendAdminChatReply();
  }
}

function insertQuickReply(text) {
  playUiClick();
  const input = document.getElementById('adminChatInputText');
  if (input) {
    input.value = text;
    input.focus();
  }
}

async function sendAdminChatReply() {
  const input = document.getElementById('adminChatInputText');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  if (!activeChatUserId) {
    alert('Pehle left side se kisi reader ki conversation par click karein!');
    return;
  }

  const thread = adminChatThreads[activeChatUserId];
  if (!thread) return;

  playChatAudioChime('send');

  const newMsg = {
    id: 'msg_admin_' + Date.now(),
    sender: 'admin',
    text: text,
    timestamp: new Date().toISOString()
  };

  if (!Array.isArray(thread.messages)) thread.messages = [];
  thread.messages.push(newMsg);
  thread.lastMessage = text;
  thread.lastTimestamp = newMsg.timestamp;
  thread.unreadByUser = (thread.unreadByUser || 0) + 1;

  input.value = '';
  renderActiveConversation(activeChatUserId);
  renderChatThreadsList();

  appendLog(`💬 Reply sent to ${thread.userName}: "${text.slice(0, 30)}..."`, 'success');

  const payload = {
    type: 'helpdesk_chat_msg',
    threadId: activeChatUserId,
    userName: thread.userName,
    userDevice: thread.userDevice,
    message: newMsg
  };

  // 1. Zero-latency BroadcastChannel (0ms sync for same device/browser)
  try {
    if (adminChatBroadcastChannel) {
      adminChatBroadcastChannel.postMessage(payload);
    }
  } catch (e) {}

  // 2. Storage event cross-tab trigger
  try {
    localStorage.setItem('mindfocus_chat_last_event', JSON.stringify({
      t: Date.now(),
      payload: payload
    }));
  } catch (e) {}

  // 3. Post to Cloud Relay (ntfy.sh) so user phone receives it anywhere in real-time
  try {
    fetch(HELPDESK_RELAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}

  await saveChatDataLocallyAndRemote();
}

async function saveChatDataLocallyAndRemote() {
  const payload = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    threads: adminChatThreads
  };

  try {
    localStorage.setItem('mindfocus_chat_data', JSON.stringify(payload));
  } catch (e) {}

  if (githubToken) {
    try {
      const jsonContent = JSON.stringify(payload, null, 2);
      await pushFileToGitHub('chat-messages.json', jsonContent, 'Update Help Desk Chat Messages');
      appendLog('☁️ Chat sync saved to Cloud Repository.', 'info');
    } catch (err) {
      console.warn('GitHub push chat error:', err.message);
    }
  }
}

function filterChatThreads(keyword) {
  const q = (keyword || '').toLowerCase().trim();
  if (!q) {
    renderChatThreadsList();
    return;
  }

  const filtered = Object.values(adminChatThreads).filter(t => {
    return (t.userName && t.userName.toLowerCase().includes(q)) ||
           (t.lastMessage && t.lastMessage.toLowerCase().includes(q)) ||
           (t.userDevice && t.userDevice.toLowerCase().includes(q));
  });

  renderChatThreadsList(filtered);
}

function simulateIncomingUserMessage() {
  playUiClick();
  const sampleUsers = [
    { id: 'user_rohit_24', name: 'Rohit Sharma', device: 'Android 14 • Galaxy S23', text: 'Bhai naya update kab release hoga? 3D Lexicon bohot mast laga!' },
    { id: 'user_priya_09', name: 'Priya Verma', device: 'Android 13 • OnePlus 11R', text: 'Atomic Habits ki audio reader bohot smooth chal rahi hai, thank you sir!' },
    { id: 'user_amit_88', name: 'Amit Kumar', device: 'Android 14 • Pixel 8', text: 'Bhai psychology of money book add kar do please next update me 🙏' }
  ];

  const randomChoice = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];

  if (!adminChatThreads[randomChoice.id]) {
    adminChatThreads[randomChoice.id] = {
      userId: randomChoice.id,
      userName: randomChoice.name,
      userDevice: randomChoice.device,
      unreadByAdmin: 0,
      unreadByUser: 0,
      lastMessage: '',
      lastTimestamp: new Date().toISOString(),
      messages: []
    };
  }

  const thread = adminChatThreads[randomChoice.id];
  const newMsg = {
    id: 'msg_user_' + Date.now(),
    sender: 'user',
    text: randomChoice.text,
    timestamp: new Date().toISOString()
  };

  thread.messages.push(newMsg);
  thread.lastMessage = randomChoice.text;
  thread.lastTimestamp = newMsg.timestamp;
  thread.unreadByAdmin = (thread.unreadByAdmin || 0) + 1;

  activeChatUserId = randomChoice.id;

  playChatAudioChime('receive');
  showToast(`💬 Message from ${randomChoice.name}: "${randomChoice.text.slice(0, 25)}..."`);

  renderChatThreadsList();
  renderActiveConversation(activeChatUserId);
  saveChatDataLocallyAndRemote();
}

function clearCurrentChatThread() {
  if (!activeChatUserId) return;
  if (!confirm('Kya aap is conversation ko clear karna chahte hain?')) return;

  const thread = adminChatThreads[activeChatUserId];
  if (thread) {
    thread.messages = [];
    thread.lastMessage = 'Chat history cleared';
    thread.unreadByAdmin = 0;
    renderActiveConversation(activeChatUserId);
    renderChatThreadsList();
    saveChatDataLocallyAndRemote();
    showToast('🗑️ Conversation cleared');
  }
}

function formatChatTime(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    let hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    if (isToday) return `${hours}:${mins} ${ampm}`;
    return `${d.getDate()}/${d.getMonth()+1} ${hours}:${mins} ${ampm}`;
  } catch (e) {
    return '';
  }
}

window.toggleAdminChatSound = toggleAdminChatSound;
window.refreshAdminChatThreads = refreshAdminChatThreads;
window.selectChatThread = selectChatThread;
window.handleAdminChatKeydown = handleAdminChatKeydown;
window.insertQuickReply = insertQuickReply;
window.sendAdminChatReply = sendAdminChatReply;
window.filterChatThreads = filterChatThreads;
window.simulateIncomingUserMessage = simulateIncomingUserMessage;
window.clearCurrentChatThread = clearCurrentChatThread;

// ==========================================================================
// 🩺 REAL-TIME PHONE CRASH RADAR & REMOTE TELEMETRY ENGINE
// ==========================================================================
let phoneCrashRadarLogs = [];
let crashAlertSoundEnabled = true;
let currentCrashFilter = 'all';

try {
  const savedCrashes = localStorage.getItem('mindfocus_admin_phone_crashes');
  if (savedCrashes) phoneCrashRadarLogs = JSON.parse(savedCrashes);
  if (!Array.isArray(phoneCrashRadarLogs)) phoneCrashRadarLogs = [];
} catch (e) {
  phoneCrashRadarLogs = [];
}

// Handle incoming crash telemetry from remote phone
function handleIncomingPhoneCrashTelemetry(payload) {
  if (!payload || !payload.error) return;

  const eventItem = {
    id: 'crash_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    receivedAt: new Date().toISOString(),
    error: payload.error,
    device: payload.device || {
      userId: 'unknown_reader',
      userName: 'Phone User',
      deviceType: 'Android Phone',
      userAgent: 'Unknown UA',
      appVersion: 'v3.5.8',
      screen: 'Unknown Screen',
      online: true
    }
  };

  // Prevent duplicate spam (Both by original error timestamp and within 60s window)
  const isDuplicate = phoneCrashRadarLogs.some(c => 
    c.error && (
      (c.error.timestamp && eventItem.error.timestamp && c.error.timestamp === eventItem.error.timestamp) ||
      (c.error.message === eventItem.error.message && 
       c.error.lineno === eventItem.error.lineno &&
       Math.abs(Date.now() - new Date(c.receivedAt).getTime()) < 60000)
    )
  );
  if (isDuplicate) return;

  phoneCrashRadarLogs.unshift(eventItem);
  if (phoneCrashRadarLogs.length > 100) phoneCrashRadarLogs.pop();

  try {
    localStorage.setItem('mindfocus_admin_phone_crashes', JSON.stringify(phoneCrashRadarLogs));
  } catch (e) {}

  // Play audio alarm
  playCrashAudioAlert();

  // Show visual alerts
  showToast(`🚨 Phone Crash: ${eventItem.error.message.substring(0, 32)}...`);
  appendLog(`🚨 [Phone Crash] ${eventItem.error.message} (${eventItem.error.source}:${eventItem.error.lineno}) from ${eventItem.device.userName} [${eventItem.device.deviceType}]`, 'error');

  updateCrashRadarKPIs();
  renderPhoneCrashRadarStream();
}

function updateCrashRadarKPIs() {
  const badge = document.getElementById('phoneCrashBadge');
  const kpiTotal = document.getElementById('kpiTotalCrashes');
  const kpiDevices = document.getElementById('kpiAffectedDevices');

  const total = phoneCrashRadarLogs.length;
  if (kpiTotal) kpiTotal.innerText = total;

  // Count unique affected devices
  const uniqueDevices = new Set(phoneCrashRadarLogs.map(c => c.device && c.device.userId ? c.device.userId : 'unknown'));
  if (kpiDevices) kpiDevices.innerText = uniqueDevices.size;

  if (badge) {
    if (total > 0) {
      badge.innerText = total;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function renderPhoneCrashRadarStream() {
  const container = document.getElementById('phoneCrashStreamList');
  if (!container) return;

  let filtered = phoneCrashRadarLogs;
  if (currentCrashFilter === 'error') {
    filtered = phoneCrashRadarLogs.filter(c => c.error && c.error.type !== 'user_triggered_test');
  } else if (currentCrashFilter === 'test') {
    filtered = phoneCrashRadarLogs.filter(c => c.error && c.error.type === 'user_triggered_test');
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:36px 20px; background:rgba(255,255,255,0.02); border:1px dashed rgba(16,185,129,0.3); border-radius:14px; color:var(--text-muted);">
        <div style="font-size:2rem; margin-bottom:8px;">🟢</div>
        <div style="font-weight:700; color:#34d399; font-size:1rem;">All Systems Nominal — Zero Phone Crashes Detected!</div>
        <div style="font-size:0.8rem; margin-top:4px;">Jab bhi kisi phone par koi crash ya JavaScript error aayega, yahan real-time line number aur device specs ke saath live alert aayega.</div>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const err = item.error || {};
    const dev = item.device || {};
    const isTest = err.type === 'user_triggered_test';
    const timeStr = formatChatTime(item.receivedAt);

    html += `
      <div style="background:rgba(18, 26, 48, 0.95); border:1.5px solid ${isTest ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.5)'}; border-radius:12px; padding:12px 16px; box-shadow:0 6px 18px rgba(0,0,0,0.4);">
        <!-- Top Meta Row -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:999px; background:${isTest ? 'rgba(56,189,248,0.2); color:#38bdf8;' : 'rgba(239,68,68,0.2); color:#f87171;'}">
              ${isTest ? '🧪 TEST EVENT' : '🔴 RUNTIME CRASH'}
            </span>
            <span style="font-size:0.78rem; font-weight:700; color:#e2e8f0;">${escapeHtml(dev.userName || 'Reader')} (${escapeHtml(dev.deviceType || 'Phone')})</span>
            <span style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(dev.appVersion || 'v3.5.8')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${timeStr}</span>
            <button type="button" class="btn-admin btn-secondary" onclick="jumpToHelpDeskUser('${escapeHtml(dev.userId || '')}')" style="padding:2px 10px; font-size:0.72rem; min-width:0 !important; width:auto !important; color:#38bdf8;">
              💬 Chat
            </button>
          </div>
        </div>

        <!-- Error Title & Location -->
        <div style="font-weight:800; font-size:0.92rem; color:${isTest ? '#38bdf8' : '#fca5a5'}; margin-bottom:4px; word-break:break-all;">
          ${escapeHtml(err.message || 'Unknown Exception')}
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; margin-bottom:6px;">
          File: <span style="color:#fbbf24;">${escapeHtml(err.source || 'unknown')}</span> : Line <span style="color:#fbbf24;">${err.lineno || 0}</span> (Col ${err.colno || 0})
        </div>

        <!-- Collapsible Stack Trace -->
        ${err.stack ? `
          <details style="margin-top:6px;">
            <summary style="font-size:0.72rem; color:var(--text-muted); cursor:pointer;">View Stack Trace</summary>
            <pre style="margin:6px 0 0; background:rgba(3,7,18,0.8); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:8px 10px; font-size:0.7rem; color:#cbd5e1; font-family:monospace; white-space:pre-wrap; overflow-x:auto;">${escapeHtml(err.stack)}</pre>
          </details>
        ` : ''}

        <!-- Device Footprint -->
        <div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); display:flex; gap:12px; font-size:0.68rem; color:var(--text-muted); flex-wrap:wrap;">
          <span>Screen: ${escapeHtml(dev.screen || 'N/A')}</span>
          <span>Online: ${dev.online ? '🟢 Yes' : '🔴 No'}</span>
          <span>UA: ${escapeHtml((dev.userAgent || '').substring(0, 60))}...</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function refreshPhoneCrashLogs(notify = false) {
  updateCrashRadarKPIs();
  renderPhoneCrashRadarStream();
  if (notify) showToast('🔄 Phone Crash Radar refreshed!');
}

function filterPhoneCrashStream(type) {
  currentCrashFilter = type;
  renderPhoneCrashRadarStream();
}

function clearPhoneCrashRadar() {
  if (confirm('Clear all Phone Crash logs from Radar?')) {
    phoneCrashRadarLogs = [];
    try { localStorage.removeItem('mindfocus_admin_phone_crashes'); } catch (e) {}
    updateCrashRadarKPIs();
    renderPhoneCrashRadarStream();
    showToast('🗑️ Phone Crash Radar cleared');
  }
}

function toggleCrashAlertSound() {
  crashAlertSoundEnabled = !crashAlertSoundEnabled;
  const btn = document.getElementById('btnToggleCrashSound');
  if (btn) {
    btn.innerHTML = crashAlertSoundEnabled ? '🔔 Crash Alert: ON' : '🔕 Crash Alert: OFF';
    btn.style.color = crashAlertSoundEnabled ? '#34d399' : 'var(--text-muted)';
  }
  showToast(crashAlertSoundEnabled ? '🔔 Crash sound alert ON' : '🔕 Crash sound alert OFF');
}

function playCrashAudioAlert() {
  if (!crashAlertSoundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Urgent two-tone buzzer
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

function exportPhoneCrashLogsJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(phoneCrashRadarLogs, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `phone-crashes-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('📋 Exported crash logs JSON!');
}

function simulateTestCrashTelemetry() {
  handleIncomingPhoneCrashTelemetry({
    error: {
      level: 'error',
      type: 'user_triggered_test',
      message: 'Simulated Crash: ReferenceError: testVariable is not defined at app.js:1234',
      source: 'app.js',
      lineno: 1234,
      colno: 42,
      stack: 'ReferenceError: testVariable is not defined\n    at simulateTestCrashTelemetry (control-panel.js:2850:10)\n    at HTMLButtonElement.onclick',
      timestamp: new Date().toISOString()
    },
    device: {
      userId: 'reader_simulated',
      userName: 'Test Reader (Simulation)',
      deviceType: 'Android Phone (Redmi Note 13)',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; 2312DRA50G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
      appVersion: 'v3.5.8',
      screen: '412x915 px',
      online: true
    }
  });
}

function jumpToHelpDeskUser(userId) {
  if (!userId) return;
  switchTab('tabLiveChat');
  if (typeof selectChatThread === 'function') {
    selectChatThread(userId);
  }
}

// Initialize Crash Radar when page loads
window.addEventListener('DOMContentLoaded', () => {
  updateCrashRadarKPIs();
  renderPhoneCrashRadarStream();
});

// Window exports
window.handleIncomingPhoneCrashTelemetry = handleIncomingPhoneCrashTelemetry;
window.refreshPhoneCrashLogs = refreshPhoneCrashLogs;
window.filterPhoneCrashStream = filterPhoneCrashStream;
window.clearPhoneCrashRadar = clearPhoneCrashRadar;
window.toggleCrashAlertSound = toggleCrashAlertSound;
window.exportPhoneCrashLogsJson = exportPhoneCrashLogsJson;
window.simulateTestCrashTelemetry = simulateTestCrashTelemetry;
window.jumpToHelpDeskUser = jumpToHelpDeskUser;
window.playCrashAudioAlert = playCrashAudioAlert;



