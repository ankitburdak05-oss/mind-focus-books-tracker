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
  appendLog('Executive Command Studio v2.0 Ready.', 'success');
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

// GitHub REST API Commit Helper
async function pushFileToGitHub(path, contentString, commitMessage) {
  if (!githubToken) {
    throw new Error('GitHub Token not configured. Check the GitHub Settings tab.');
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  
  let sha = null;
  try {
    const getRes = await fetch(url + '?ref=' + DEFAULT_BRANCH, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }
  } catch (e) {}

  const base64Content = btoa(unescape(encodeURIComponent(contentString)));

  const body = {
    message: commitMessage,
    content: base64Content,
    branch: DEFAULT_BRANCH
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!putRes.ok) {
    const errData = await putRes.json();
    throw new Error(errData.message || 'GitHub API error ' + putRes.status);
  }

  return await putRes.json();
}

// Fetch Live Status From GitHub
async function fetchLiveStatusFromGitHub() {
  try {
    const cb = Date.now();
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/broadcast-notice.json?cb=${cb}`, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });
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
  // 1. INSTANT LOCAL DATA (Zero-delay render for v3.5.1)
  if (typeof window !== 'undefined' && window.__DEFAULT_REMOTE_CONFIG__) {
    remoteConfigData = JSON.parse(JSON.stringify(window.__DEFAULT_REMOTE_CONFIG__));
    updatePipelineCardUI(remoteConfigData);
    populateConfigFormUI(remoteConfigData);
    appendLog('📁 Pipeline config v3.5.1 loaded instantly.', 'success');
  }

  // 2. Try fetching from GitHub if online
  try {
    const cb = Date.now();
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/remote-config.json?cb=${cb}`, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });
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

  const dEnabled = document.getElementById('cfgDictionaryEnabled');
  if (dEnabled) dEnabled.checked = !!feats.dictionaryBookEnabled;

  const mMode = document.getElementById('cfgMaintenanceMode');
  if (mMode) mMode.checked = !!feats.maintenanceMode;

  const qEnabled = document.getElementById('cfgQuotesEnabled');
  if (qEnabled) qEnabled.checked = feats.quotesEnabled !== false;

  const aEnabled = document.getElementById('cfgAudioVoiceEnabled');
  if (aEnabled) aEnabled.checked = feats.audiobookVoiceEnabled !== false;

  const sEnabled = document.getElementById('cfgStreakShields');
  if (sEnabled) sEnabled.checked = feats.streakShieldsEnabled !== false;

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
async function saveRemoteConfigToCloud() {
  playUiClick();
  const btn = document.getElementById('btnSaveConfig');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Pushing to GitHub...';
  }

  try {
    if (!remoteConfigData) {
      await fetchRemoteConfigPipeline();
    }

    const dict = document.getElementById('cfgDictionaryEnabled')?.checked || false;
    const maintenance = document.getElementById('cfgMaintenanceMode')?.checked || false;
    const quotes = document.getElementById('cfgQuotesEnabled')?.checked || false;
    const audio = document.getElementById('cfgAudioVoiceEnabled')?.checked || false;
    const streak = document.getElementById('cfgStreakShields')?.checked || false;
    const bannerActive = document.getElementById('cfgBannerActive')?.checked || false;
    const bannerText = document.getElementById('cfgBannerText')?.value || '';

    if (!remoteConfigData.features) remoteConfigData.features = {};
    if (!remoteConfigData.globalBanner) remoteConfigData.globalBanner = {};

    remoteConfigData.features.dictionaryBookEnabled = dict;
    remoteConfigData.features.maintenanceMode = maintenance;
    remoteConfigData.features.quotesEnabled = quotes;
    remoteConfigData.features.audiobookVoiceEnabled = audio;
    remoteConfigData.features.streakShieldsEnabled = streak;
    remoteConfigData.globalBanner.active = bannerActive;
    remoteConfigData.globalBanner.text = bannerText;
    remoteConfigData.updatedAt = new Date().toISOString();

    const jsonStr = JSON.stringify(remoteConfigData, null, 2);
    await pushFileToGitHub('remote-config.json', jsonStr, 'Admin: Update remote switches');

    appendLog('Remote feature switches updated.', 'success');
    showToast('✅ Feature Switches Pushed to Cloud!');
  } catch (err) {
    appendLog('Config error: ' + err.message, 'error');
    alert('Error: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '☁️ Push Feature Switches to Real App';
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


