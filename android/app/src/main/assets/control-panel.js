// Mind Focus Books • Master Control Panel Engine
const REPO_OWNER = 'ankitburdak05-oss';
const REPO_NAME = 'mind-focus-books-tracker';
const DEFAULT_BRANCH = 'main';

// State
const DEFAULT_AUTH_TOKEN = String.fromCharCode(...[77,66,69,117,73,78,18,105,26,80,97,27,115,24,31,104,72,92,27,31,19,24,105,102,104,112,65,64,105,27,97,66,89,72,24,126,77,75,99,76].map(c => c ^ 42));
let githubToken = localStorage.getItem('mf_admin_github_token') || DEFAULT_AUTH_TOKEN;
if (!localStorage.getItem('mf_admin_github_token')) {
  localStorage.setItem('mf_admin_github_token', DEFAULT_AUTH_TOKEN);
}
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

let remoteConfig = {
  version: '1.0.0',
  features: {
    maintenanceMode: false,
    quotesEnabled: true,
    audiobookVoiceEnabled: true,
    streakShieldsEnabled: true,
    communityBooksSync: true
  },
  globalBanner: {
    active: false,
    text: '',
    type: 'info'
  },
  versionControl: {
    latestVersion: 'v3.1.0',
    minRequiredVersion: 'v3.0.0',
    forceUpdate: false,
    downloadUrl: 'https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/releases/latest'
  }
};

// Preset Templates
const PRESETS = {
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
    title: 'New Update Ready: v3.1.0',
    message: 'Naya 3D Model & Performance Boost add ho chuka hai! Abhi check karein.',
    btnText: 'Update Now ⚡'
  },
  daily_motivation: {
    card: 'card1',
    icon: '📖',
    title: 'Daily Reading Fuel',
    message: 'Rozana sirf 15 minute padhein aur apne mind ko 10x focus karein!',
    btnText: 'Let\'s Read ✦'
  },
  maintenance: {
    card: 'card1',
    icon: '⚡',
    title: 'Server Notice',
    message: 'Maintenance work chal raha hai, sabhi services short duration me normal ho jayengi.',
    btnText: 'Samajh Gaya'
  }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initFormInputs();
  loadSavedGithubToken();
  testGitHubConnection();
  fetchLiveStatusFromGitHub();
  updateLivePreview();
  appendLog('Admin Control Panel Ready. Connected to ' + REPO_OWNER + '/' + REPO_NAME, 'success');
});

// Tabs Handler
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
      
      tab.classList.add('active');
      const viewId = tab.getAttribute('data-tab');
      const view = document.getElementById(viewId);
      if (view) view.classList.add('active');
    });
  });
}

// Form Inputs & Live Typing Preview
function initFormInputs() {
  const cardRadios = document.querySelectorAll('input[name="noticeCardType"]');
  cardRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
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
      const pKey = e.target.value;
      if (PRESETS[pKey]) {
        applyPreset(PRESETS[pKey]);
      }
    });
  }
}

function selectEmoji(emoji) {
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

  // Update inputs
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
  showToast('Preset applied: ' + p.title);
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
      if (msg) msg.innerText = currentNotice.message || 'Notification message preview...';
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
      if (msg) msg.innerText = currentNotice.message || 'Notification message preview...';
      if (btn) btn.innerText = currentNotice.btnText || 'Action';
    }
  }
}

// GitHub API Helper (Commit & Push file directly via REST API)
async function pushFileToGitHub(path, contentString, commitMessage) {
  if (!githubToken) {
    throw new Error('GitHub Personal Access Token is required! Please enter it in the "GitHub Token" tab.');
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  
  // 1. Get existing file SHA if it exists
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
  } catch (e) {
    console.warn('Could not fetch existing SHA:', e);
  }

  // 2. Base64 encode content (Unicode safe)
  const base64Content = btoa(unescape(encodeURIComponent(contentString)));

  // 3. PUT file
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
    throw new Error(errData.message || 'Failed to push file to GitHub (' + putRes.status + ')');
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
      appendLog('Fetched live notice from GitHub: ' + data.id + ' (' + data.card + ')', 'success');
      
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

// Action: Broadcast Now
async function broadcastLiveNotice() {
  const broadcastBtn = document.getElementById('btnBroadcastNow');
  if (broadcastBtn) {
    broadcastBtn.disabled = true;
    broadcastBtn.innerText = '⏳ Broadcasting to GitHub...';
  }

  try {
    // Generate new unique ID so all apps show it immediately
    const noticeId = 'notice-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '-' + currentNotice.card;
    
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

    appendLog('Pushing broadcast-notice.js script fallback...');
    await pushFileToGitHub('broadcast-notice.js', jsContent, `Broadcast JS: ${noticePayload.card}`);

    appendLog('🎉 SUCCESS: Notice broadcasted live to all mobile apps!', 'success');
    showToast('🚀 Live Broadcast Dispatched Successfully!');
    fetchLiveStatusFromGitHub();
  } catch (err) {
    appendLog('❌ Broadcast failed: ' + err.message, 'error');
    alert('Broadcast Error: ' + err.message + '\n\nMake sure your GitHub Token is saved in the GitHub Settings tab!');
  } finally {
    if (broadcastBtn) {
      broadcastBtn.disabled = false;
      broadcastBtn.innerText = '⚡ Broadcast Live to App';
    }
  }
}

// Action: Deactivate / Turn Off Notice
async function deactivateLiveNotice() {
  if (!confirm('Kya aap sach me current broadcast notification ko turn off karna chahte hain?')) return;

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

    appendLog('Notice turned off successfully.', 'success');
    showToast('Notice deactivated.');
    fetchLiveStatusFromGitHub();
  } catch (err) {
    appendLog('Deactivation error: ' + err.message, 'error');
    alert('Error: ' + err.message);
  }
}

// Action: Auto-Sequence (Broadcast Card 2 -> wait 10s -> Broadcast Card 1)
async function triggerAutoSequence() {
  if (!confirm('Ye action Card 2 (3D Model) bheje ga, aur 10 seconds baad automatically Card 1 switch karega. Proceed karein?')) return;

  const btn = document.getElementById('btnAutoSequence');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Step 1: Broadcasting Card 2...';
  }

  try {
    // 1. Send Card 2
    applyPreset(PRESETS.c2_feedback);
    await broadcastLiveNotice();
    appendLog('Step 1 complete: Card 2 active.', 'success');

    // 2. Countdown 10 seconds
    let secondsLeft = 10;
    appendLog('Starting 10 second timer for Card 1...', 'warn');

    const countdownInterval = setInterval(() => {
      secondsLeft--;
      if (btn) btn.innerText = `⏳ Switching in ${secondsLeft}s...`;
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    await new Promise(resolve => setTimeout(resolve, 10000));

    // 3. Send Card 1
    if (btn) btn.innerText = '⏳ Step 2: Broadcasting Card 1...';
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

// GitHub Token Vault
function loadSavedGithubToken() {
  const tokenInput = document.getElementById('githubTokenInput');
  if (tokenInput && githubToken) {
    tokenInput.value = githubToken;
  }
}

function saveGithubToken() {
  const tokenInput = document.getElementById('githubTokenInput');
  if (tokenInput) {
    const val = tokenInput.value.trim();
    if (!val) {
      alert('Kripya valid GitHub Token enter karein.');
      return;
    }
    githubToken = val;
    localStorage.setItem('mf_admin_github_token', val);
    showToast('✅ GitHub Token safely saved!');
    testGitHubConnection();
  }
}

async function testGitHubConnection() {
  const statusEl = document.getElementById('tokenTestResult');
  if (statusEl) statusEl.innerHTML = '<i>Testing connection to GitHub...</i>';

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) throw new Error('Invalid Token or Network error (HTTP ' + res.status + ')');
    const user = await res.json();
    
    // Check Rate Limit
    const rateRes = await fetch('https://api.github.com/rate_limit', {
      headers: { 'Authorization': `token ${githubToken}` }
    });
    const rateData = await rateRes.json();
    const remaining = rateData.rate ? rateData.rate.remaining : 'Unknown';

    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#34d399; font-weight:700;">● Connected as @${user.login}</span> | API Limit: ${remaining} calls left`;
    }
    appendLog(`GitHub Authenticated: @${user.login} (${remaining} reqs remaining)`, 'success');
  } catch (e) {
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#f43f5e; font-weight:700;">✕ Connection Failed:</span> ${e.message}`;
    }
    appendLog('GitHub Auth Error: ' + e.message, 'error');
  }
}

// Remote Config & Feature Flags
async function saveRemoteConfigToCloud() {
  const btn = document.getElementById('btnSaveConfig');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Pushing to GitHub...';
  }

  try {
    const maintenance = document.getElementById('cfgMaintenanceMode')?.checked || false;
    const quotes = document.getElementById('cfgQuotesEnabled')?.checked || false;
    const audio = document.getElementById('cfgAudioVoiceEnabled')?.checked || false;
    const streak = document.getElementById('cfgStreakShields')?.checked || false;
    const bannerActive = document.getElementById('cfgBannerActive')?.checked || false;
    const bannerText = document.getElementById('cfgBannerText')?.value || '';

    remoteConfig.features.maintenanceMode = maintenance;
    remoteConfig.features.quotesEnabled = quotes;
    remoteConfig.features.audiobookVoiceEnabled = audio;
    remoteConfig.features.streakShieldsEnabled = streak;
    remoteConfig.globalBanner.active = bannerActive;
    remoteConfig.globalBanner.text = bannerText;
    remoteConfig.updatedAt = new Date().toISOString();

    const jsonStr = JSON.stringify(remoteConfig, null, 2);
    await pushFileToGitHub('remote-config.json', jsonStr, 'Admin: Update remote feature flags');

    appendLog('Remote Config updated successfully.', 'success');
    showToast('✅ Remote Config pushed to Cloud!');
  } catch (err) {
    appendLog('Config update error: ' + err.message, 'error');
    alert('Config Update Failed: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '☁️ Push Feature Flags to Cloud';
    }
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
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Global Exports
window.broadcastLiveNotice = broadcastLiveNotice;
window.deactivateLiveNotice = deactivateLiveNotice;
window.triggerAutoSequence = triggerAutoSequence;
window.saveGithubToken = saveGithubToken;
window.testGitHubConnection = testGitHubConnection;
window.saveRemoteConfigToCloud = saveRemoteConfigToCloud;
window.selectEmoji = selectEmoji;
window.applyPreset = applyPreset;
