// Mind Focus Books • Master Executive Command Studio v2.0
const REPO_OWNER = 'ankitburdak05-oss';
const REPO_NAME = 'mind-focus-books-tracker';
const DEFAULT_BRANCH = 'main';

// ==========================================================================
// 🔐 ADMIN PASSWORD / PIN LOCK ENGINE
// Iss section pehle DOMContentLoaded se chalta hai aur agar lock set hai
// to page hide karke lock screen dikhata hai.
// ==========================================================================
const ADMIN_LOCK_KEY = 'mf_admin_lock_v1';
const ADMIN_LOCK_ATTEMPTS_KEY = 'mf_admin_lock_attempts_v1';
const ADMIN_LOCK_MAX_ATTEMPTS = 5;
const ADMIN_LOCK_LOCKOUT_MS = 60 * 1000; // 1 minute lockout after max attempts
const ADMIN_LOCK_AUTO_UNLOCK_MS = 30 * 60 * 1000; // 30 min idle auto-lock
const ADMIN_RESET_TOKEN_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/admin-reset-token.txt`;

let adminLockState = {
  mode: 'password',          // 'password' or 'pin'
  unlockMode: 'password',    // active unlock mode (saved at setup)
  setupPinBuffer: '',
  loginPinBuffer: '',
  attempts: 0,
  lockoutUntil: 0,
  lastActivityTs: Date.now(),
  isUnlocked: false
};

function adminLockLoad() {
  try {
    const raw = localStorage.getItem(ADMIN_LOCK_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function adminLockSave(lockObj) {
  try {
    localStorage.setItem(ADMIN_LOCK_KEY, JSON.stringify(lockObj));
  } catch (e) {}
}

function adminLockLoadAttempts() {
  try {
    const raw = localStorage.getItem(ADMIN_LOCK_ATTEMPTS_KEY);
    if (!raw) return { attempts: 0, lockoutUntil: 0 };
    return JSON.parse(raw);
  } catch (e) { return { attempts: 0, lockoutUntil: 0 }; }
}

function adminLockSaveAttempts(attemptsObj) {
  try {
    localStorage.setItem(ADMIN_LOCK_ATTEMPTS_KEY, JSON.stringify(attemptsObj));
  } catch (e) {}
}

function adminLockHash(input) {
  // Lightweight browser-only obfuscated hash (NOT cryptographically strong,
  // but stops casual inspection of devtools localStorage). Server-side
  // bcrypt-like security is unnecessary for a single-user local admin tool.
  let salt = 'mfadmin_2026_salt_$';
  let combined = salt + input + salt.split('').reverse().join('');
  let h1 = 0, h2 = 0x9e3779b9;
  for (let i = 0; i < combined.length; i++) {
    const c = combined.charCodeAt(i);
    h1 = ((h1 << 5) - h1) + c;
    h1 |= 0;
    h2 = ((h2 << 7) ^ h2) ^ c;
  }
  return ('0000000' + (h1 >>> 0).toString(16)).slice(-8) +
         ('0000000' + (h2 >>> 0).toString(16)).slice(-8) +
         ('0000' + combined.length.toString(16)).slice(-4);
}

function adminLockShowError(screen, msg) {
  const el = document.getElementById('adminLockError' + screen);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4500);
}

function adminLockClearError(screen) {
  const el = document.getElementById('adminLockError' + screen);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('show');
}

function adminLockSwitchMode(mode) {
  playUiClick();
  adminLockState.mode = mode;

  document.querySelectorAll('.admin-lock-tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-mode') === mode);
  });

  const isPin = (mode === 'pin');
  const pwdSetup = document.getElementById('adminLockPasswordSetup');
  const pinSetup = document.getElementById('adminLockPinSetup');
  if (pwdSetup) pwdSetup.style.display = isPin ? 'none' : 'block';
  if (pinSetup) pinSetup.style.display = isPin ? 'block' : 'none';

  const lbl = document.getElementById('adminLockModeSwitchLabel');
  if (lbl) lbl.textContent = isPin ? 'Password' : 'PIN';

  adminLockState.setupPinBuffer = '';
  adminLockUpdatePinDots('adminLockPinDots', '');
  adminLockClearError('Setup');
}

function adminLockUpdatePinDots(containerId, buffer) {
  const cont = document.getElementById(containerId);
  if (!cont) return;
  const dots = cont.querySelectorAll('.admin-lock-pin-dot');
  dots.forEach((d, i) => {
    d.classList.remove('filled', 'error');
    if (i < buffer.length) d.classList.add('filled');
  });
}

function adminLockPinPress(digit) {
  playUiClick();
  if (digit === 'C') {
    adminLockState.setupPinBuffer = '';
    adminLockUpdatePinDots('adminLockPinDots', '');
    const st = document.getElementById('adminLockPinStatus');
    if (st) { st.textContent = 'PIN enter karo (4 digits)'; st.style.color = '#94a3b8'; }
    adminLockClearError('Setup');
    return;
  }
  if (digit === 'X') {
    adminLockState.setupPinBuffer = adminLockState.setupPinBuffer.slice(0, -1);
    adminLockUpdatePinDots('adminLockPinDots', adminLockState.setupPinBuffer);
    return;
  }
  if (adminLockState.setupPinBuffer.length >= 4) return;
  adminLockState.setupPinBuffer += digit;
  adminLockUpdatePinDots('adminLockPinDots', adminLockState.setupPinBuffer);

  if (adminLockState.setupPinBuffer.length === 4) {
    // Auto-validate after 4 digits
    setTimeout(() => {
      adminLockCompleteSetup();
    }, 250);
  }
}

function adminLockCompleteSetup() {
  adminLockClearError('Setup');
  let secretValue = '';
  if (adminLockState.mode === 'pin') {
    if (adminLockState.setupPinBuffer.length !== 4) {
      adminLockShowError('Setup', '⚠️ PIN 4 digits ka hona chahiye.');
      const dots = document.querySelectorAll('#adminLockPinDots .admin-lock-pin-dot');
      dots.forEach(d => d.classList.add('error'));
      return;
    }
    secretValue = adminLockState.setupPinBuffer;
  } else {
    const pwd = document.getElementById('adminLockNewPwd')?.value || '';
    const cfm = document.getElementById('adminLockConfirmPwd')?.value || '';
    if (pwd.length < 6) {
      adminLockShowError('Setup', '⚠️ Password minimum 6 characters ka hona chahiye.');
      return;
    }
    if (pwd !== cfm) {
      adminLockShowError('Setup', '⚠️ Password aur confirm password match nahi ho rahe.');
      return;
    }
    secretValue = pwd;
  }

  const lockObj = {
    mode: adminLockState.mode,
    hash: adminLockHash(secretValue),
    createdAt: new Date().toISOString()
  };
  adminLockSave(lockObj);
  adminLockSaveAttempts({ attempts: 0, lockoutUntil: 0 });

  showToast('✅ Lock setup complete! Welcome Admin.');
  adminLockUnlock();
}

function adminLockLoginPinPress(digit) {
  playUiClick();
  if (digit === 'C') {
    adminLockState.loginPinBuffer = '';
    adminLockUpdatePinDots('adminLockLoginPinDots', '');
    adminLockClearError('Login');
    return;
  }
  if (digit === 'X') {
    adminLockState.loginPinBuffer = adminLockState.loginPinBuffer.slice(0, -1);
    adminLockUpdatePinDots('adminLockLoginPinDots', adminLockState.loginPinBuffer);
    return;
  }
  if (adminLockState.loginPinBuffer.length >= 4) return;
  adminLockState.loginPinBuffer += digit;
  adminLockUpdatePinDots('adminLockLoginPinDots', adminLockState.loginPinBuffer);

  if (adminLockState.loginPinBuffer.length === 4) {
    setTimeout(() => adminLockAttemptLogin(), 250);
  }
}

function adminLockAttemptLogin() {
  const stored = adminLockLoad();
  if (!stored) {
    adminLockShowSetup();
    return;
  }
  adminLockClearError('Login');

  const attemptsState = adminLockLoadAttempts();
  if (attemptsState.lockoutUntil && Date.now() < attemptsState.lockoutUntil) {
    const waitSec = Math.ceil((attemptsState.lockoutUntil - Date.now()) / 1000);
    adminLockShowError('Login', `🔒 Bahut zyada galat attempts. ${waitSec} second ruko.`);
    return;
  }

  let provided = '';
  if (adminLockState.unlockMode === 'pin') {
    provided = adminLockState.loginPinBuffer;
    if (provided.length !== 4) {
      adminLockShowError('Login', '⚠️ 4-digit PIN daalna zaroori hai.');
      return;
    }
  } else {
    provided = document.getElementById('adminLockLoginPwd')?.value || '';
    if (provided.length < 6) {
      adminLockShowError('Login', '⚠️ Sahi password daalein.');
      return;
    }
  }

  const hashed = adminLockHash(provided);
  if (hashed === stored.hash) {
    adminLockSaveAttempts({ attempts: 0, lockoutUntil: 0 });
    showToast('🔓 Welcome Admin!');
    adminLockUnlock();
  } else {
    attemptsState.attempts = (attemptsState.attempts || 0) + 1;
    if (attemptsState.attempts >= ADMIN_LOCK_MAX_ATTEMPTS) {
      attemptsState.lockoutUntil = Date.now() + ADMIN_LOCK_LOCKOUT_MS;
      attemptsState.attempts = 0;
      adminLockShowError('Login', '🚫 Galat password! 1 minute ke liye lock ho gaya.');
    } else {
      const remaining = ADMIN_LOCK_MAX_ATTEMPTS - attemptsState.attempts;
      adminLockShowError('Login', `❌ Galat password. ${remaining} attempts baaki.`);
    }
    adminLockSaveAttempts(attemptsState);
    adminLockUpdateAttemptsUI(attemptsState);

    if (adminLockState.unlockMode === 'pin') {
      adminLockState.loginPinBuffer = '';
      adminLockUpdatePinDots('adminLockLoginPinDots', '');
      const dots = document.querySelectorAll('#adminLockLoginPinDots .admin-lock-pin-dot');
      dots.forEach(d => d.classList.add('error'));
      setTimeout(() => dots.forEach(d => d.classList.remove('error')), 400);
    } else {
      const pwdInput = document.getElementById('adminLockLoginPwd');
      if (pwdInput) { pwdInput.value = ''; pwdInput.focus(); }
    }
    playAudioTone(220, 'square', 0.18, 0.12);
  }
}

function adminLockUpdateAttemptsUI(attemptsState) {
  const el = document.getElementById('adminLockAttemptsText');
  if (!el) return;
  el.classList.remove('warning', 'danger');
  const remaining = ADMIN_LOCK_MAX_ATTEMPTS - (attemptsState.attempts || 0);
  if (attemptsState.lockoutUntil && Date.now() < attemptsState.lockoutUntil) {
    const waitSec = Math.ceil((attemptsState.lockoutUntil - Date.now()) / 1000);
    el.textContent = `🔒 Locked. ${waitSec}s wait karo.`;
    el.classList.add('danger');
  } else if (remaining <= 2) {
    el.textContent = `⚠️ Sirf ${remaining} attempts baaki.`;
    el.classList.add('danger');
  } else if (remaining <= 3) {
    el.textContent = `${remaining} attempts baaki.`;
    el.classList.add('warning');
  } else {
    el.textContent = '';
  }
}

function adminLockShowSetup() {
  document.body.classList.add('admin-locked');
  const overlay = document.getElementById('adminLockOverlay');
  const setup = document.getElementById('adminLockSetupScreen');
  const login = document.getElementById('adminLockLoginScreen');
  const forgot = document.getElementById('adminLockForgotScreen');
  if (overlay) { overlay.style.display = 'flex'; overlay.style.opacity = '1'; }
  if (setup) setup.style.display = 'block';
  if (login) login.style.display = 'none';
  if (forgot) forgot.style.display = 'none';

  // Default to password mode
  adminLockSwitchMode('password');
  setTimeout(() => {
    const pwdInput = document.getElementById('adminLockNewPwd');
    if (pwdInput) pwdInput.focus();
  }, 100);
}

function adminLockShowLogin(unlockMode) {
  document.body.classList.add('admin-locked');
  const overlay = document.getElementById('adminLockOverlay');
  const setup = document.getElementById('adminLockSetupScreen');
  const login = document.getElementById('adminLockLoginScreen');
  const forgot = document.getElementById('adminLockForgotScreen');
  if (overlay) { overlay.style.display = 'flex'; overlay.style.opacity = '1'; }
  if (setup) setup.style.display = 'none';
  if (login) login.style.display = 'block';
  if (forgot) forgot.style.display = 'none';

  adminLockState.unlockMode = unlockMode || 'password';

  const pwdLogin = document.getElementById('adminLockPasswordLogin');
  const pinLogin = document.getElementById('adminLockPinLogin');
  if (pwdLogin) pwdLogin.style.display = (adminLockState.unlockMode === 'pin') ? 'none' : 'block';
  if (pinLogin) pinLogin.style.display = (adminLockState.unlockMode === 'pin') ? 'block' : 'none';

  adminLockState.loginPinBuffer = '';
  adminLockUpdatePinDots('adminLockLoginPinDots', '');
  adminLockClearError('Login');

  const subTitle = document.getElementById('adminLockLoginSubtitle');
  if (subTitle) {
    subTitle.textContent = (adminLockState.unlockMode === 'pin')
      ? 'Apna 4-digit PIN daal kar unlock karo.'
      : 'Apna password daal kar unlock karo.';
  }

  adminLockUpdateAttemptsUI(adminLockLoadAttempts());

  setTimeout(() => {
    if (adminLockState.unlockMode === 'pin') return;
    const pwdInput = document.getElementById('adminLockLoginPwd');
    if (pwdInput) pwdInput.focus();
  }, 100);
}

function adminLockShowForgot() {
  document.body.classList.add('admin-locked');
  const overlay = document.getElementById('adminLockOverlay');
  const setup = document.getElementById('adminLockSetupScreen');
  const login = document.getElementById('adminLockLoginScreen');
  const forgot = document.getElementById('adminLockForgotScreen');
  if (overlay) { overlay.style.display = 'flex'; overlay.style.opacity = '1'; }
  if (setup) setup.style.display = 'none';
  if (login) login.style.display = 'none';
  if (forgot) forgot.style.display = 'block';
  adminLockClearError('Forgot');
  setTimeout(() => {
    const tokenInput = document.getElementById('adminLockResetToken');
    if (tokenInput) tokenInput.focus();
  }, 100);
}

async function adminLockResetViaToken() {
  adminLockClearError('Forgot');
  const tokenInput = document.getElementById('adminLockResetToken');
  const token = (tokenInput?.value || '').trim();
  const newPwd = document.getElementById('adminLockResetNewPwd')?.value || '';

  if (!token) {
    adminLockShowError('Forgot', '⚠️ Master reset token daalein. GitHub se copy karein ya neeche "Auto-Fetch Token" button dabayein.');
    return;
  }

  // PIN confusion check — short numeric tokens are NOT the reset token
  if (/^\d{4,6}$/.test(token)) {
    adminLockShowError('Forgot', '❌ Ye PIN hai (4-6 digits), reset token NAHI. Reset token ek LONG STRING hai (jaise mfadmin-reset-2026-...). "Auto-Fetch Token" button use karein.');
    return;
  }

  if (newPwd.length < 6) {
    adminLockShowError('Forgot', '⚠️ New password minimum 6 characters.');
    return;
  }

  try {
    showToast('⏳ Verifying reset token...');

    // Try multiple URLs in order (raw → GitHub API → jsDelivr CDN)
    const candidates = [
      ADMIN_RESET_TOKEN_URL,
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/admin-reset-token.txt?ref=${DEFAULT_BRANCH}`,
      `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${DEFAULT_BRANCH}/admin-reset-token.txt`
    ];

    let remoteToken = null;
    let lastErr = null;
    let fetchSucceeded = false;
    for (const url of candidates) {
      try {
        const sep = url.includes('?') ? '&' : '?';
        const res = await fetch(url + sep + 'cb=' + Date.now(), {
          cache: 'no-store',
          headers: { 'Accept': 'text/plain' }
        });
        if (!res.ok) { lastErr = 'HTTP ' + res.status + ' on ' + url.substring(0, 60); continue; }
        let body = await res.text();

        // GitHub API returns JSON with base64 content
        if (url.includes('api.github.com')) {
          try {
            const json = JSON.parse(body);
            if (json && json.content) body = atob(json.content.replace(/\s/g, ''));
          } catch (e) {}
        }

        const trimmed = body.trim();
        if (trimmed.length > 5) {
          remoteToken = trimmed;
          fetchSucceeded = true;
          console.log('[AdminLock] Token fetched from:', url.substring(0, 80));
          console.log('[AdminLock] Token length:', trimmed.length);
          break;
        }
      } catch (e) { lastErr = e.message; }
    }

    if (!remoteToken) {
      adminLockShowError('Forgot', '⚠️ Token file fetch nahi ho paya. ' + (lastErr || 'Network issue') + '. Browser console (F12) mein check karein ya "Auto-Fetch Token" button try karein.');
      return;
    }

    // Normalize: trim both sides, collapse internal whitespace
    const normProvided = token.replace(/\s+/g, '');
    const normRemote = remoteToken.replace(/\s+/g, '');

    if (normProvided !== normRemote) {
      const prefix = remoteToken.substring(0, 16);
      const providedLen = normProvided.length;
      const remoteLen = normRemote.length;
      let hint = '';
      if (providedLen !== remoteLen) {
        hint = `\n\n📏 Length mismatch: aapne ${providedLen} chars diye, expected ${remoteLen}.`;
      }
      if (providedLen < 20) {
        hint += `\n\n💡 Token ek LONG STRING hai (40+ chars), sirf PIN nahi.`;
      }
      adminLockShowError('Forgot', `❌ Token match nahi hua. Token start hota hai: "${prefix}..." se.${hint}\n\n✅ "Auto-Fetch Token" button dabayein - ek click me sahi token aa jayega.`);
      console.warn('[AdminLock] Expected token:', remoteToken);
      console.warn('[AdminLock] You provided:', normProvided);
      console.warn('[AdminLock] Expected length:', remoteLen);
      console.warn('[AdminLock] Your length:', providedLen);
      return;
    }

    const newLock = {
      mode: 'password',
      hash: adminLockHash(newPwd),
      createdAt: new Date().toISOString(),
      resetAt: new Date().toISOString()
    };
    adminLockSave(newLock);
    adminLockSaveAttempts({ attempts: 0, lockoutUntil: 0 });
    adminLockState.unlockMode = 'password';
    showToast('🔓 Reset successful! Welcome Admin.');
    adminLockUnlock();
  } catch (err) {
    adminLockShowError('Forgot', '⚠️ Token verify nahi ho paya: ' + err.message);
    console.error('[AdminLock] Reset error:', err);
  }
}

// One-click auto-fetch from GitHub + copy to clipboard
async function adminLockAutoFetchToken() {
  const input = document.getElementById('adminLockResetToken');
  const btn = document.getElementById('adminLockAutoFetchBtn');
  if (!input) return;
  if (btn) { btn.disabled = true; btn.innerText = '⏳ Fetching token...'; }
  try {
    const candidates = [
      ADMIN_RESET_TOKEN_URL,
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/admin-reset-token.txt?ref=${DEFAULT_BRANCH}`,
      `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${DEFAULT_BRANCH}/admin-reset-token.txt`
    ];

    let fetched = null;
    for (const url of candidates) {
      try {
        const sep = url.includes('?') ? '&' : '?';
        const res = await fetch(url + sep + 'cb=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) continue;
        let body = await res.text();
        if (url.includes('api.github.com')) {
          try {
            const json = JSON.parse(body);
            if (json && json.content) body = atob(json.content.replace(/\s/g, ''));
          } catch (e) {}
        }
        const t = body.trim();
        if (t.length > 5) { fetched = t; break; }
      } catch (e) {}
    }

    if (fetched) {
      input.value = fetched;
      input.style.borderColor = 'rgba(16, 185, 129, 0.8)';
      input.style.background = 'rgba(16, 185, 129, 0.1)';
      showToast('✅ Token fetched! Ab "🔓 Reset" button dabayein.');
      try { await navigator.clipboard.writeText(fetched); } catch (e) {}
      // Auto-submit after short delay
      setTimeout(() => {
        const newPwd = document.getElementById('adminLockResetNewPwd');
        if (newPwd && newPwd.value.length >= 6) {
          adminLockResetViaToken();
        }
      }, 500);
    } else {
      showToast('❌ Fetch failed. Manually URL kholke copy karein.');
    }
  } catch (err) {
    showToast('❌ Network error: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '📋 Auto-Fetch Token from GitHub (1-Click)'; }
  }
}
window.adminLockAutoFetchToken = adminLockAutoFetchToken;

function adminLockUnlock() {
  adminLockState.isUnlocked = true;
  adminLockState.lastActivityTs = Date.now();
  document.body.classList.remove('admin-locked');
  const overlay = document.getElementById('adminLockOverlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.style.opacity = '1';
      // Reset all sub-screens to be safe
      const setup = document.getElementById('adminLockSetupScreen');
      const login = document.getElementById('adminLockLoginScreen');
      const forgot = document.getElementById('adminLockForgotScreen');
      if (setup) setup.style.display = 'none';
      if (login) login.style.display = 'none';
      if (forgot) forgot.style.display = 'none';
    }, 250);
  }
  // Clear sensitive fields
  const pwdInput = document.getElementById('adminLockLoginPwd');
  if (pwdInput) pwdInput.value = '';
  const newPwd = document.getElementById('adminLockNewPwd');
  if (newPwd) newPwd.value = '';
  const cfmPwd = document.getElementById('adminLockConfirmPwd');
  if (cfmPwd) cfmPwd.value = '';
  const tokenInput = document.getElementById('adminLockResetToken');
  if (tokenInput) tokenInput.value = '';
  const resetPwd = document.getElementById('adminLockResetNewPwd');
  if (resetPwd) resetPwd.value = '';
}

function adminLockRelock() {
  if (!adminLockState.isUnlocked) return;
  const stored = adminLockLoad();
  if (!stored) return; // no lock set
  adminLockState.isUnlocked = false;
  adminLockShowLogin(stored.mode);
  showToast('🔒 Admin panel re-locked for security.');
}

function adminLockCheckIdle() {
  if (!adminLockState.isUnlocked) return;
  if (Date.now() - adminLockState.lastActivityTs > ADMIN_LOCK_AUTO_UNLOCK_MS) {
    adminLockRelock();
  }
}

['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
  window.addEventListener(evt, () => {
    adminLockState.lastActivityTs = Date.now();
  }, { passive: true });
});

setInterval(adminLockCheckIdle, 60 * 1000);

function adminLockInit() {
  // Pehle body ko locked class de do — CSS se overlay dikhega
  document.body.classList.add('admin-locked');

  const stored = adminLockLoad();
  const overlay = document.getElementById('adminLockOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
  if (!stored) {
    adminLockShowSetup();
  } else {
    adminLockShowLogin(stored.mode || 'password');
  }
}

// Expose to window so HTML inline handlers can call them
window.adminLockSwitchMode = adminLockSwitchMode;
window.adminLockCompleteSetup = adminLockCompleteSetup;
window.adminLockPinPress = adminLockPinPress;
window.adminLockLoginPinPress = adminLockLoginPinPress;
window.adminLockAttemptLogin = adminLockAttemptLogin;
window.adminLockShowForgot = adminLockShowForgot;
window.adminLockShowLogin = adminLockShowLogin;
window.adminLockResetViaToken = adminLockResetViaToken;
window.adminLockRelock = adminLockRelock;

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
  console.log('[AdminLock] DOMContentLoaded - initializing lock screen');
  try {
    // 1. Lock screen first - baaki sab hide rahega jab tak unlock na ho
    adminLockInit();

    // 2. Wrap adminLockUnlock so that after unlock the rest of the panel boots
    const origUnlock = window.adminLockUnlock || adminLockUnlock;
    window.adminLockUnlock = function() {
      origUnlock();
      document.body.classList.remove('admin-locked');
      // Now boot the rest of the app
      bootRestOfAdminPanel();
    };

    // 3. Failsafe: If for any reason lock didn't show, force show after 1s
    setTimeout(() => {
      const overlay = document.getElementById('adminLockOverlay');
      if (overlay && !adminLockState.isUnlocked) {
        if (overlay.style.display === 'none' || getComputedStyle(overlay).display === 'none') {
          console.warn('[AdminLock] Failsafe: re-initializing lock screen');
          adminLockInit();
        }
      }
    }, 1000);
  } catch (err) {
    console.error('[AdminLock] Init error:', err);
    // If anything breaks, at least show setup screen
    const overlay = document.getElementById('adminLockOverlay');
    const setup = document.getElementById('adminLockSetupScreen');
    if (overlay) overlay.style.display = 'flex';
    if (setup) setup.style.display = 'block';
    document.body.classList.add('admin-locked');
  }
});

function bootRestOfAdminPanel() {
  if (window.__adminPanelBooted) return;
  window.__adminPanelBooted = true;
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
    setInterval(() => {
      if (!document.hidden) refreshAdminChatThreads(false);
    }, 60000);
  }
  appendLog('Admin Control Panel Ready.', 'success');
}

// Mobile Sidebar Drawer Toggle
function toggleMobileSidebar(force) {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar) return;
  const isOpening = (typeof force === 'boolean') ? force : !sidebar.classList.contains('open');
  if (isOpening) {
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  } else {
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }
}
window.toggleMobileSidebar = toggleMobileSidebar;

const TAB_TITLES = {
  tabFeatures: { title: 'Features & Remote Switches', breadcrumb: 'Features' },
  tabBroadcast: { title: 'Broadcast Studio & Alerts', breadcrumb: 'Broadcast' },
  tabPipeline: { title: 'App Release & OTA Pipeline', breadcrumb: 'Releases' },
  tabLiveChat: { title: 'Reader Live Help Desk & Chat', breadcrumb: 'Help Desk' },
  tabFlashcards: { title: '3D Flashcards & Leitner Studio', breadcrumb: 'Flashcards' },
  tabMysteryGift: { title: 'Mystery Gift Box & Rewards', breadcrumb: 'Mystery Gift' },
  tabBooks: { title: 'Book Spotlight & Recommendations', breadcrumb: 'Spotlight' },
  tabDiagnostics: { title: 'Phone Diagnostics & Crash Radar', breadcrumb: 'Diagnostics' },
  tabGithub: { title: 'GitHub Sync & Cloud PAT', breadcrumb: 'GitHub' },
  tabMore: { title: 'System Utilities & Data Backup', breadcrumb: 'Utilities' }
};

// Navigation
function switchTab(viewId) {
  playUiClick();

  // Update tabs & sidebar items
  const navItems = document.querySelectorAll('.tab-btn, .sidebar-nav-item');
  navItems.forEach(t => {
    if (t.getAttribute('data-tab') === viewId) t.classList.add('active');
    else t.classList.remove('active');
  });

  // Update mobile dock items
  const dockItems = document.querySelectorAll('.app-dock-item');
  const isUnderMore = ['tabDiagnostics', 'tabMysteryGift', 'tabFlashcards', 'tabBooks', 'tabGithub', 'tabMore'].includes(viewId);
  dockItems.forEach(item => {
    const dockTab = item.getAttribute('data-tab');
    if (dockTab === viewId || (dockTab === 'tabMore' && isUnderMore)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update views
  document.querySelectorAll('.tab-view').forEach(v => {
    if (v.id === viewId) v.classList.add('active');
    else v.classList.remove('active');
  });

  // Update Topbar Title & Breadcrumb
  const meta = TAB_TITLES[viewId];
  if (meta) {
    const titleEl = document.getElementById('currentViewTitle');
    const bcEl = document.getElementById('currentViewBreadcrumb');
    if (titleEl) titleEl.textContent = meta.title;
    if (bcEl) bcEl.textContent = meta.breadcrumb;
  }

  // Close mobile sidebar drawer if open
  toggleMobileSidebar(false);

  // Smooth scroll content to top
  const stage = document.getElementById('stageContentScroll');
  if (stage) {
    stage.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
window.switchTab = switchTab;

function initTabs() {
  const navElements = document.querySelectorAll('.tab-btn, .sidebar-nav-item');
  navElements.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.getAttribute('data-tab');
      if (viewId) switchTab(viewId);
    });
  });

  const dockItems = document.querySelectorAll('.app-dock-item');
  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.getAttribute('data-tab');
      if (viewId) switchTab(viewId);
    });
  });
}

function refreshAdminData() {
  playUiClick();
  if (typeof loadRemoteConfigFromCloud === 'function') loadRemoteConfigFromCloud();
  if (typeof refreshAdminChatThreads === 'function') refreshAdminChatThreads(true);
  if (typeof refreshPhoneCrashLogs === 'function') refreshPhoneCrashLogs(false);
  showToast('🔄 एडमिन डेटा रिफ्रेश हो गया!');
}
window.refreshAdminData = refreshAdminData;

// Fullscreen Browser Mode Toggle
function toggleBrowserFullscreen() {
  playUiClick();
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {});
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    }
    const btn = document.getElementById('btnFullscreenToggle');
    if (btn) btn.innerHTML = '<span>🗗</span> <span class="action-btn-text">Exit Full</span>';
    showToast('⛶ Fullscreen Browser Mode Enabled');
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    const btn = document.getElementById('btnFullscreenToggle');
    if (btn) btn.innerHTML = '<span>⛶</span> <span class="action-btn-text">Full Screen</span>';
    showToast('🗗 Fullscreen Exited');
  }
}
window.toggleBrowserFullscreen = toggleBrowserFullscreen;

// Feature Tiles Interactive Grid Controllers
function toggleFeatureTile(id) {
  playUiClick();
  const el = document.getElementById(id);
  if (!el) return;
  el.checked = !el.checked;
  onFeatureTileChanged(id);
}
window.toggleFeatureTile = toggleFeatureTile;

function onFeatureTileChanged(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const card = document.getElementById('card_' + id);
  const statusEl = document.getElementById('status_' + id);
  if (el.checked) {
    if (card) card.classList.remove('is-off');
    if (statusEl) statusEl.innerHTML = '<span class="status-dot-mini dot-on"></span>';
  } else {
    if (card) card.classList.add('is-off');
    if (statusEl) statusEl.innerHTML = '<span class="status-dot-mini dot-off"></span>';
  }
}
window.onFeatureTileChanged = onFeatureTileChanged;

// Quick Panel Modal — iOS-style sheet for feature details
const FEATURE_DESCRIPTIONS = {
  cfgChatHelpDesk: 'In-app floating chat pill & real-time help desk messaging for users.',
  cfgTelemetry: 'Real-time crash detection & automatic error report dispatch to your dashboard.',
  cfgMobileDevTools: 'Floating in-app developer console & diagnostic inspector pill on user phone.',
  cfgBroadcastNotice: 'Push admin flash announcements & alert banners on every user screen instantly.',
  cfgAppUpdates: 'OTA APK auto-update prompts & header update badge for new versions.',
  cfgStreakShields: 'Duolingo-style daily reading streaks & streak freeze shields gamification.',
  cfgFlashcards: 'Interactive 3D book summary flashcards with target words & spaced repetition.',
  cfgAmbientAudio: 'Binaural rain, cafe, and forest white noise generator for focus mode.',
  cfgVisualPhysics: 'Gyroscope card tilt & GPU aurora waves — turn OFF to save battery.',
  cfgBarcodeScanner: 'Live camera barcode scanner to instantly find book ISBN & metadata.',
  cfgAudioVoice: 'Synthetic text-to-speech audio voice reader for book notes & summaries.',
  cfgQuotes: 'Inspirational daily reading quotes & wisdom shown on home feed.',
  cfgCommunitySync: 'Sync community curated books and reviews across all user devices.',
  cfgDictionary: 'A-Z English-Hindi 3D Dictionary book in user phone library.',
  cfgPdfExport: 'Reading time stats, graphs & printable PDF reading certificate generator.'
};

function openFeatureQuickPanel(id) {
  playUiClick();
  const card = document.getElementById('card_' + id);
  const cb = document.getElementById(id);
  if (!card || !cb) return;
  
  // Extract glyph (emoji + bg color) from existing card
  const glyph = card.querySelector('.icon-tile-glyph');
  const name = card.dataset.featureName || id;
  const desc = FEATURE_DESCRIPTIONS[id] || 'Toggle this feature on/off for all users.';
  const bgStyle = glyph ? glyph.getAttribute('style') : '';
  
  // Remove existing panel if any
  const existing = document.getElementById('featureQuickPanel');
  if (existing) existing.remove();
  
  // Build panel
  const panel = document.createElement('div');
  panel.id = 'featureQuickPanel';
  panel.className = 'feature-quick-panel-backdrop';
  panel.innerHTML = `
    <div class="feature-quick-panel" onclick="event.stopPropagation()">
      <div class="fqp-icon" style="${bgStyle}">${glyph ? glyph.innerHTML : '⚙️'}</div>
      <div class="fqp-title">${name}</div>
      <div class="fqp-desc">${desc}</div>
      <div class="fqp-toggle-row">
        <span style="font-weight:600;font-size:14px;">Status</span>
        <label class="switch" onclick="event.stopPropagation()">
          <input type="checkbox" id="fqp_${id}" ${cb.checked ? 'checked' : ''} onchange="onFeatureTileChanged('${id}'); document.getElementById('${id}').checked = this.checked;">
          <span class="slider"></span>
        </label>
      </div>
      <button type="button" class="fqp-close-btn" onclick="closeFeatureQuickPanel()">Done</button>
    </div>
  `;
  
  panel.addEventListener('click', () => closeFeatureQuickPanel());
  document.body.appendChild(panel);
  setTimeout(() => panel.classList.add('is-open'), 10);
}

function closeFeatureQuickPanel() {
  const panel = document.getElementById('featureQuickPanel');
  if (panel) {
    panel.classList.remove('is-open');
    setTimeout(() => panel.remove(), 200);
  }
}

window.openFeatureQuickPanel = openFeatureQuickPanel;
window.closeFeatureQuickPanel = closeFeatureQuickPanel;

function syncAllFeatureTilesVisual() {
  const featureIds = [
    'cfgChatHelpDesk', 'cfgTelemetry', 'cfgMobileDevTools', 'cfgBroadcastNotice',
    'cfgAppUpdates', 'cfgStreakShields', 'cfgFlashcards',
    'cfgAmbientAudio', 'cfgVisualPhysics', 'cfgBarcodeScanner', 'cfgAudioVoice',
    'cfgQuotes', 'cfgCommunitySync', 'cfgDictionary', 'cfgPdfExport'
  ];
  featureIds.forEach(id => onFeatureTileChanged(id));
  if (typeof onLockdownToggleChanged === 'function') onLockdownToggleChanged(false);
}
window.syncAllFeatureTilesVisual = syncAllFeatureTilesVisual;

function onLockdownToggleChanged(playAudio = true) {
  if (playAudio) playUiClick();
  const el = document.getElementById('cfgAppEmergencyLockdown');
  const beacon = document.getElementById('statusBeaconRing');
  const headline = document.getElementById('statusHeadlineText');
  const subheadline = document.getElementById('statusSubheadlineText');
  const heroCard = document.getElementById('emergencyStatusHeroCard');

  if (el && el.checked) {
    if (beacon) beacon.className = 'status-beacon beacon-lockdown';
    if (headline) {
      headline.innerText = '🚨 ऐप को अस्थायी रूप से रोका गया है (App Paused)';
      headline.style.color = '#f87171';
    }
    if (subheadline) {
      subheadline.innerText = 'आपातकालीन स्थिति के लिए फोन ऐप में सभी फीचर्स को अस्थायी रूप से रोक दिया गया है। दोबारा चालू करने के लिए स्विच बंद करें।';
    }
    if (heroCard) heroCard.classList.add('in-lockdown');
    if (playAudio) showToast('🚨 ऐप पॉज स्विच चालू किया गया! "Push Changes" दबाकर फोन में भेजें।');
  } else {
    if (beacon) beacon.className = 'status-beacon beacon-normal';
    if (headline) {
      headline.innerText = '✨ ऐप स्टेटस: सामान्य • सभी 16 फीचर्स एक्टिव';
      headline.style.color = '#34d399';
    }
    if (subheadline) {
      subheadline.innerText = 'सभी यूजर्स के फोन में ऐप बहुत स्मूथ और बिना किसी लैग के चल रहा है। सभी 16 फीचर्स एक्टिव हैं।';
    }
    if (heroCard) heroCard.classList.remove('in-lockdown');
    if (playAudio) showToast('🟢 ऐप स्टेटस सामान्य है (सभी फीचर्स एक्टिव)');
  }
}
window.onLockdownToggleChanged = onLockdownToggleChanged;



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
  // 1. INSTANT LOCAL DATA (Zero-delay render for v3.8.0)
  if (typeof window !== 'undefined' && window.__DEFAULT_REMOTE_CONFIG__) {
    remoteConfigData = JSON.parse(JSON.stringify(window.__DEFAULT_REMOTE_CONFIG__));
    updatePipelineCardUI(remoteConfigData);
    populateConfigFormUI(remoteConfigData);
    appendLog('📁 Pipeline config v3.8.0 loaded instantly.', 'success');
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

  syncAllFeatureTilesVisual();
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
    'cfgAppUpdates', 'cfgStreakShields', 'cfgFlashcards',
    'cfgAmbientAudio', 'cfgVisualPhysics', 'cfgBarcodeScanner', 'cfgAudioVoice',
    'cfgQuotes', 'cfgCommunitySync', 'cfgDictionary', 'cfgPdfExport'
  ];
  featureIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  syncAllFeatureTilesVisual();
  showToast('🔴 All features set to OFF. Click "Push Changes" to apply.');
}

function restoreAllFeatures() {
  playUiClick();
  const featureIds = [
    'cfgChatHelpDesk', 'cfgTelemetry', 'cfgMobileDevTools', 'cfgBroadcastNotice',
    'cfgAppUpdates', 'cfgStreakShields', 'cfgFlashcards',
    'cfgAmbientAudio', 'cfgVisualPhysics', 'cfgBarcodeScanner', 'cfgAudioVoice',
    'cfgQuotes', 'cfgCommunitySync', 'cfgDictionary', 'cfgPdfExport'
  ];
  featureIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });
  syncAllFeatureTilesVisual();
  showToast('🟢 All 16 features restored to ON. Click "Push Changes" to apply.');
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

    if (!remoteConfigData.activeRelease || remoteConfigData.activeRelease.version === 'v3.7.0' || remoteConfigData.activeRelease.version === 'v3.7.1') {
      remoteConfigData.activeRelease = {
        version: "v3.8.0",
        name: "Mind Focus Books v3.8.0 — Super Clean Streamlined Edition",
        apkDownloadUrl: "https://raw.githubusercontent.com/ankitburdak05-oss/mind-focus-books-tracker/main/MindFocusBooks-Native.apk?v=3.8.0",
        features: [
          "⚡ Super Clean & Lightweight: Streamlined reading experience with zero bloat",
          "🚀 Ultra-Smooth Update Center: Rock-solid, zero shaking/jitter on mobile",
          "📦 Reliable 1-Tap APK Updater: Direct native download and package installer",
          "📖 3D Real Book Reader with realistic page curl animations",
          "🎨 Premium iOS Glassmorphism UI and fluid navigation",
          "🛡️ Remote Feature Switches & Instant Emergency Pause Control"
        ],
        stagedAt: "2026-09-15T04:00:00.000Z",
        isDeployed: true
      };
    }

    if (!remoteConfigData.stagedRelease || remoteConfigData.stagedRelease.version === 'v3.7.0' || remoteConfigData.stagedRelease.version === 'v3.7.1') {
      remoteConfigData.stagedRelease = Object.assign({}, remoteConfigData.activeRelease);
    }

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
// REMOVED LEGACY FEATURES (Mystery Gift, Flashcards, Live Help Desk)
// Clean no-op stubs preserved for backwards compatibility
// =========================================================================
function previewMysteryGiftBox() {}
function sendMysteryGiftToUsers() {}
function deactivateGiftDrop() {}
function selectMysteryBox() {}
function openGoldenGiftBox() {}
function claimSurpriseReward() {}
function updateFlashcardPreview() {}
function dispatchFlashcardsDropToAllPhones() {}
function deactivateFlashcardsDrop() {}
function previewFlashcardInModal() {}
function loadFlashcardPreset() {}
function initAdminHelpDeskListeners() {}
function refreshAdminChatThreads() {}
function toggleAdminChatSound() {}
function sendAdminChatReply() {}
function insertQuickReply() {}
function handleAdminChatKeydown() {}
function simulateIncomingUserMessage() {}
function clearCurrentChatThread() {}
function filterChatThreads() {}
function selectChatThread() {}
function jumpToHelpDeskUser() {}

window.previewMysteryGiftBox = previewMysteryGiftBox;
window.sendMysteryGiftToUsers = sendMysteryGiftToUsers;
window.deactivateGiftDrop = deactivateGiftDrop;
window.selectMysteryBox = selectMysteryBox;
window.openGoldenGiftBox = openGoldenGiftBox;
window.claimSurpriseReward = claimSurpriseReward;
window.updateFlashcardPreview = updateFlashcardPreview;
window.dispatchFlashcardsDropToAllPhones = dispatchFlashcardsDropToAllPhones;
window.deactivateFlashcardsDrop = deactivateFlashcardsDrop;
window.previewFlashcardInModal = previewFlashcardInModal;
window.loadFlashcardPreset = loadFlashcardPreset;
window.initAdminHelpDeskListeners = initAdminHelpDeskListeners;
window.refreshAdminChatThreads = refreshAdminChatThreads;
window.toggleAdminChatSound = toggleAdminChatSound;
window.sendAdminChatReply = sendAdminChatReply;
window.insertQuickReply = insertQuickReply;
window.handleAdminChatKeydown = handleAdminChatKeydown;
window.simulateIncomingUserMessage = simulateIncomingUserMessage;
window.clearCurrentChatThread = clearCurrentChatThread;
window.filterChatThreads = filterChatThreads;
window.selectChatThread = selectChatThread;
window.jumpToHelpDeskUser = jumpToHelpDeskUser;

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
      appVersion: 'v3.8.0',
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
  const dockBadge = document.getElementById('dockCrashBadge');
  const moreBadge = document.getElementById('phoneCrashBadgeMore');
  const kpiTotal = document.getElementById('kpiTotalCrashes');
  const kpiDevices = document.getElementById('kpiAffectedDevices');

  const total = phoneCrashRadarLogs.length;
  if (kpiTotal) kpiTotal.innerText = total;

  // Count unique affected devices
  const uniqueDevices = new Set(phoneCrashRadarLogs.map(c => c.device && c.device.userId ? c.device.userId : 'unknown'));
  if (kpiDevices) kpiDevices.innerText = uniqueDevices.size;

  [badge, dockBadge, moreBadge].forEach(b => {
    if (b) {
      if (total > 0) {
        b.innerText = total;
        b.style.display = 'inline-block';
      } else {
        b.style.display = 'none';
      }
    }
  });
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
            <span style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(dev.appVersion || 'v3.8.0')}</span>
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
      appVersion: 'v3.8.0',
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

// Interactive Real App Theme & Mode Engine (Light, Dark & Vibrant Color Modes)
const THEME_NAMES = {
  light: 'Snow White Light Mode ☀️',
  ocean: 'Sapphire Ocean Blue 🔵',
  emerald: 'Emerald Forest Green 🟢',
  ruby: 'Crimson Ruby Red 🔴',
  gold: 'Sunset Amber Gold 🟠',
  amethyst: 'Cyber Royal Purple 🟣',
  dark: 'Midnight Obsidian Dark 🌙',
  aurora: 'Midnight Obsidian Dark 🌙'
};

function setPanelTheme(themeName) {
  playUiClick();
  document.body.setAttribute('data-theme', themeName);
  try {
    localStorage.setItem('mf_panel_theme_v2', themeName);
  } catch (e) {}

  // Sync all theme pills & swatches
  document.querySelectorAll('.theme-swatch, .theme-pill-btn').forEach(el => {
    if (el.getAttribute('data-theme-name') === themeName) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Sync master mode buttons (btnModeLight vs btnModeDark)
  const isLight = (themeName === 'light');
  const btnLight = document.getElementById('btnModeLight');
  const btnDark = document.getElementById('btnModeDark');
  if (btnLight) btnLight.classList.toggle('active', isLight);
  if (btnDark) btnDark.classList.toggle('active', !isLight);

  // Sync Topbar Mode Toggle text & icon
  const topbarModeIcon = document.getElementById('topbarModeIcon');
  const topbarModeText = document.getElementById('topbarModeText');
  if (topbarModeIcon && topbarModeText) {
    if (isLight) {
      topbarModeIcon.textContent = '🌙';
      topbarModeText.textContent = 'Dark Mode';
    } else {
      topbarModeIcon.textContent = '☀️';
      topbarModeText.textContent = 'Light Mode';
    }
  }

  const currentLabelEl = document.getElementById('currentThemeLabel');
  if (currentLabelEl) {
    currentLabelEl.textContent = THEME_NAMES[themeName] || themeName;
  }

  showToast(`🎨 Mode: ${THEME_NAMES[themeName] || themeName} Active!`);
}
window.setPanelTheme = setPanelTheme;

function toggleLightDarkMode() {
  const current = document.body.getAttribute('data-theme') || 'light';
  if (current === 'light') {
    setPanelTheme('dark');
  } else {
    setPanelTheme('light');
  }
}
window.toggleLightDarkMode = toggleLightDarkMode;

function initPanelTheme() {
  let saved = 'light';
  try {
    saved = localStorage.getItem('mf_panel_theme_v2') || 'light';
  } catch (e) {}
  document.body.setAttribute('data-theme', saved);

  document.querySelectorAll('.theme-swatch, .theme-pill-btn').forEach(el => {
    if (el.getAttribute('data-theme-name') === saved) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  const isLight = (saved === 'light');
  const btnLight = document.getElementById('btnModeLight');
  const btnDark = document.getElementById('btnModeDark');
  if (btnLight) btnLight.classList.toggle('active', isLight);
  if (btnDark) btnDark.classList.toggle('active', !isLight);

  const topbarModeIcon = document.getElementById('topbarModeIcon');
  const topbarModeText = document.getElementById('topbarModeText');
  if (topbarModeIcon && topbarModeText) {
    if (isLight) {
      topbarModeIcon.textContent = '🌙';
      topbarModeText.textContent = 'Dark Mode';
    } else {
      topbarModeIcon.textContent = '☀️';
      topbarModeText.textContent = 'Light Mode';
    }
  }

  const currentLabelEl = document.getElementById('currentThemeLabel');
  if (currentLabelEl) {
    currentLabelEl.textContent = THEME_NAMES[saved] || saved;
  }
}
window.addEventListener('DOMContentLoaded', initPanelTheme);






// ===== BOX 1 vs BOX 2 SELECTOR =====
let selectedMysteryBox = 1;
window.selectMysteryBox = function(boxNum) {
  selectedMysteryBox = boxNum;
  document.querySelectorAll('.box-select-card').forEach(c => c.classList.remove('box-select-active'));
  document.getElementById('boxCard' + boxNum).classList.add('box-select-active');
  document.querySelector(`input[name="mysteryBoxType"][value="box${boxNum}"]`).checked = true;
};

// ===== WARRIOR SWORD BOX ANIMATION =====
let warriorAnimState = { running: false, timeouts: [], rafId: null };

window.skipWarriorAnimation = function() {
  warriorAnimState.timeouts.forEach(t => clearTimeout(t));
  if (warriorAnimState.rafId) cancelAnimationFrame(warriorAnimState.rafId);
  cleanupWarriorAnim();
};

function cleanupWarriorAnim() {
  warriorAnimState.running = false;
  const overlay = document.getElementById('warriorBoxOverlay');
  // Pause and reset video
  const warriorVid = document.getElementById('wbWarriorVideo');
  if (warriorVid) {
    warriorVid.pause();
    warriorVid.currentTime = 0;
  }
  if (overlay) {
    overlay.classList.remove('is-active');
    const warriorEl = document.getElementById('wbWarrior');
    if (warriorEl) warriorEl.classList.remove('no-video');
    // reset all child states
    ['wbBoxFalling','wbWarrior','wbSword','wbScreenCrack','wbSkyBeam','wbBlast','wbCar','wbCarTrunk','wbCarPrize','wbPhaseLabel','wbSkipBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('is-falling','is-enter','is-walk-2','is-raise','is-windup','is-swing-start','is-swing-mid','is-swing-end','is-sword-up','is-shown','is-fire','is-blast','is-drive','is-open','is-show');
      }
    });
  }
}

window.testGiftDropInPanel = function() {
  console.log('[Mystery] testGiftDropInPanel called, box=' + selectedMysteryBox + ', running=' + warriorAnimState.running);
  if (warriorAnimState.running) return;
  // Box 1 = existing behavior, Box 2 = warrior
  if (selectedMysteryBox === 1) {
    runBox1Animation();
  } else {
    // Pre-load images before animation
    preloadWarriorImages().then(() => {
      console.log('[Mystery] warrior images preloaded, starting animation');
      runWarriorSwordAnimation();
    }).catch(err => {
      console.error('[Mystery] image preload failed:', err);
      runWarriorSwordAnimation(); // Try anyway
    });
  }
};

// Pre-load warrior images so they show instantly during animation
function preloadWarriorImages() {
  return new Promise((resolve) => {
    const imgs = ['assets/warrior/hero.png', 'assets/warrior/swing.png', 'assets/warrior/sword_up.png'];
    let loaded = 0;
    imgs.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        console.log(`[Mystery] preloaded ${src}: ${loaded}/${imgs.length}`);
        if (loaded >= imgs.length) resolve();
      };
      img.src = src;
    });
    // Failsafe: resolve after 2s even if images not loaded
    setTimeout(resolve, 2000);
  });
}
window.preloadWarriorImages = preloadWarriorImages;

function runBox1Animation() {
  showToast('🎁 Box 1 (Classic) drop test — see phone for animation');
  // Reuse existing overlay if present
  const overlay = document.getElementById('mysteryGiftOverlay');
  if (overlay && typeof overlay.classList !== 'undefined') {
    overlay.classList.add('is-active');
    setTimeout(() => overlay.classList.remove('is-active'), 4500);
  }
}

function runWarriorSwordAnimation() {
  warriorAnimState.running = true;
  const overlay = document.getElementById('warriorBoxOverlay');
  if (!overlay) { console.error('[Mystery] warriorBoxOverlay not found'); return; }
  overlay.classList.add('is-active');
  console.log('[Mystery] overlay activated');

  const box = document.getElementById('wbBoxFalling');
  const warrior = document.getElementById('wbWarrior');
  const sword = document.getElementById('wbSword');
  const warriorVid = document.getElementById('wbWarriorVideo');

  // Try to play real video; if fails, use frame fallback
  if (warriorVid) {
    warriorVid.currentTime = 0;
    warriorVid.play().then(() => {
      console.log('[Mystery] warrior video playing');
    }).catch(err => {
      console.warn('[Mystery] video play failed, using frame fallback:', err.message);
      warrior.classList.add('no-video');
    });
  } else {
    warrior.classList.add('no-video');
  }
  const crack = document.getElementById('wbScreenCrack');
  const beam = document.getElementById('wbSkyBeam');
  const blast = document.getElementById('wbBlast');
  const car = document.getElementById('wbCar');
  const trunk = document.getElementById('wbCarTrunk');
  const prize = document.getElementById('wbCarPrize');
  const title = document.getElementById('giftTitleInput').value || 'CONGRATULATIONS!';
  const reward = document.getElementById('giftRewardNameInput').value || '🎁 VIP REWARD';
  if (prize) prize.textContent = reward.toUpperCase();

  // Phase 1: Box falls (0-2s)
  warriorAnimState.timeouts.push(setTimeout(() => box.classList.add('is-falling'), 100));

  // Phase 2: Warrior enters (2.5s)
  warriorAnimState.timeouts.push(setTimeout(() => {
    warrior.classList.add('is-enter');
  }, 2500));

  // Phase 2b: Walking animation (cycle through walk frames)
  warriorAnimState.timeouts.push(setTimeout(() => warrior.classList.add('is-walk-2'), 2900));
  warriorAnimState.timeouts.push(setTimeout(() => warrior.classList.remove('is-walk-2'), 3300));
  warriorAnimState.timeouts.push(setTimeout(() => warrior.classList.add('is-walk-2'), 3700));

  // Phase 3a: Raise sword (4.1s)
  warriorAnimState.timeouts.push(setTimeout(() => {
    warrior.classList.remove('is-walk-2');
    warrior.classList.add('is-raise');
  }, 4100));

  // Phase 3b: Windup (4.5s)
  warriorAnimState.timeouts.push(setTimeout(() => {
    warrior.classList.remove('is-raise');
    warrior.classList.add('is-windup');
  }, 4500));

  // Phase 3c: Swing start (4.9s)
  warriorAnimState.timeouts.push(setTimeout(() => {
    warrior.classList.remove('is-windup');
    warrior.classList.add('is-swing-start');
  }, 4900));

  // Phase 3d: Swing mid (5.2s) — peak with crack
  warriorAnimState.timeouts.push(setTimeout(() => {
    warrior.classList.remove('is-swing-start');
    warrior.classList.add('is-swing-mid');
    crack.classList.add('is-shown');
  }, 5200));

  // Phase 3e: Swing end (5.5s)
  warriorAnimState.timeouts.push(setTimeout(() => {
    warrior.classList.remove('is-swing-mid');
    warrior.classList.add('is-swing-end');
  }, 5500));

  // Phase 4: Sky beam + sword up (5.9s)
  warriorAnimState.timeouts.push(setTimeout(() => {
    warrior.classList.remove('is-swing-end');
    warrior.classList.add('is-sword-up');
    crack.classList.remove('is-shown');
    beam.classList.add('is-fire');
  }, 5900));

  // Phase 5: Blast (6.5s)
  warriorAnimState.timeouts.push(setTimeout(() => {
    blast.classList.add('is-blast');
  }, 6500));

  // Phase 6: Car arrives (7.1s)
  warriorAnimState.timeouts.push(setTimeout(() => {
    warrior.classList.remove('is-sword-up');
    beam.classList.remove('is-fire');
    blast.classList.remove('is-blast');
    car.classList.add('is-drive');
  }, 7100));

  // Phase 7: Car trunk opens (8.4s) + prize reveal
  warriorAnimState.timeouts.push(setTimeout(() => {
    trunk.classList.add('is-open');
    setTimeout(() => prize.classList.add('is-show'), 500);
  }, 7000));

  // Cleanup after 13s
  warriorAnimState.timeouts.push(setTimeout(() => {
    cleanupWarriorAnim();
  }, 13000));
}
