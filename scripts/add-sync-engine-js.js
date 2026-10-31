const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(appPath, 'utf8');

const syncEngineJs = `
// ============================================================================
// 🔄 PHONE ↔ LAPTOP REAL-TIME SYNC ENGINE (v0.0.98)
// Wireless 5-6 Character Code Pairing, QR Code, Photo / File Import & Smart Merge
// ============================================================================

window._generatedSyncCode = '';
window._incomingSyncPackage = null;

function renderSyncDevicesView() {
  playTactileClick();
  const isWindows = isRunningOnWindowsLaptop();
  const iconEl = document.getElementById('syncDeviceTypeIcon');
  const nameEl = document.getElementById('syncDeviceTypeName');
  const briefEl = document.getElementById('syncDeviceStatsBrief');

  if (iconEl) iconEl.innerText = isWindows ? '💻' : '📱';
  if (nameEl) nameEl.innerText = isWindows ? 'This Device: Laptop / PC Edition' : 'This Device: Android Phone Edition';

  const totalBooks = (state.books || []).length;
  const streak = state.stats?.readingStreak || 0;
  const spent = typeof calculateTotalSpentAmount === 'function' ? calculateTotalSpentAmount() : 0;

  if (briefEl) {
    briefEl.innerText = \`Ready to sync \${totalBooks} Books • ₹\${spent} Spent • \${streak}-day streak\`;
  }
}
window.renderSyncDevicesView = renderSyncDevicesView;

function switchSyncMode(mode) {
  playTactileClick();
  const tabSend = document.getElementById('syncTabSend');
  const tabReceive = document.getElementById('syncTabReceive');
  const panelSend = document.getElementById('syncPanelSend');
  const panelReceive = document.getElementById('syncPanelReceive');

  if (mode === 'SEND') {
    if (tabSend) tabSend.classList.add('active');
    if (tabReceive) tabReceive.classList.remove('active');
    if (panelSend) panelSend.style.display = 'block';
    if (panelReceive) panelReceive.style.display = 'none';
  } else {
    if (tabSend) tabSend.classList.remove('active');
    if (tabReceive) tabReceive.classList.add('active');
    if (panelSend) panelSend.style.display = 'none';
    if (panelReceive) panelReceive.style.display = 'block';
  }
}
window.switchSyncMode = switchSyncMode;

async function generateDeviceSyncCode() {
  playTactileClick();
  const btn = document.getElementById('btnGenerateSyncCode');
  const resultBox = document.getElementById('syncCodeResultBox');
  const displayEl = document.getElementById('syncCodeDisplay');
  const qrImg = document.getElementById('syncQrCodeImg');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span><span>Packaging &amp; Uploading Sync Session...</span>';
  }

  try {
    const isWindows = isRunningOnWindowsLaptop();
    const payload = {
      app: 'MindFocusBooks',
      version: CURRENT_APP_VERSION,
      exportedAt: new Date().toISOString(),
      sourceDevice: isWindows ? 'Windows Laptop' : 'Android Phone',
      books: state.books || [],
      stats: state.stats || {},
      prices: JSON.parse(localStorage.getItem('mf_book_prices') || '{}'),
      budget: JSON.parse(localStorage.getItem('mf_reading_budget') || '{}'),
      lending: (typeof lendingRecords !== 'undefined' ? lendingRecords : []),
      shelves: JSON.parse(localStorage.getItem('mf_custom_shelves') || '[]')
    };

    const res = await fetch('https://dpaste.org/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'content=' + encodeURIComponent(JSON.stringify(payload)) + '&expiry_days=1&format=json'
    });

    const data = await res.json();
    const code = (data.url || '').replace('https://dpaste.org/', '').replace(/\\//g, '').trim();

    if (!code) throw new Error('Could not generate sync session code');

    window._generatedSyncCode = code;
    window._lastGeneratedPayload = payload;

    if (displayEl) displayEl.innerText = code;
    if (qrImg) {
      // Free HTTPS QuickChart QR endpoint with raw data link
      const qrDataUrl = \`https://quickchart.io/qr?text=\${encodeURIComponent('https://dpaste.org/' + code + '/raw')}&size=220&margin=1\`;
      qrImg.src = qrDataUrl;
    }

    if (resultBox) resultBox.style.display = 'block';
    localStorage.setItem('mf_last_sync_time', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    if (typeof showToast === 'function') {
      showToast(\`⚡ Sync Code \${code} generated! Enter it on your other device.\`);
    }
  } catch (err) {
    console.error('Sync generation error:', err);
    if (typeof showToast === 'function') {
      showToast('⚠️ Could not connect to sync relay. Check internet connection.');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>⚡</span><span>Regenerate Sync Code &amp; QR</span>';
    }
  }
}
window.generateDeviceSyncCode = generateDeviceSyncCode;

function copyGeneratedSyncCode() {
  playTactileClick();
  const code = window._generatedSyncCode;
  if (!code) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      if (typeof showToast === 'function') showToast(\`✓ Code \${code} copied to clipboard!\`);
    });
  } else {
    prompt('Copy your sync code:', code);
  }
}
window.copyGeneratedSyncCode = copyGeneratedSyncCode;

function downloadSyncPackageFile() {
  playTactileClick();
  const payload = window._lastGeneratedPayload || {
    app: 'MindFocusBooks',
    version: CURRENT_APP_VERSION,
    exportedAt: new Date().toISOString(),
    books: state.books || [],
    stats: state.stats || {}
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = \`MindFocus-Library-Sync-\${new Date().toISOString().slice(0, 10)}.json\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof showToast === 'function') showToast('✓ Sync file downloaded to your device!');
}
window.downloadSyncPackageFile = downloadSyncPackageFile;

async function connectAndFetchSyncData() {
  playTactileClick();
  const inputEl = document.getElementById('syncInputCode');
  let rawCode = (inputEl?.value || '').trim();

  // If user pasted full dpaste link, extract code
  if (rawCode.includes('dpaste.org/')) {
    rawCode = rawCode.replace('https://dpaste.org/', '').replace('http://dpaste.org/', '').replace('/raw', '').replace(/\\//g, '').trim();
  }

  if (!rawCode) {
    if (typeof showToast === 'function') showToast('⚠️ Kripya 5-character Sync Code enter karein!');
    return;
  }

  const btn = document.getElementById('btnConnectSync');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Connecting...';
  }

  try {
    const res = await fetch(\`https://dpaste.org/\${rawCode}/raw\`);
    if (!res.ok) throw new Error(\`Code not found or expired (HTTP \${res.status})\`);

    const text = await res.text();
    const data = JSON.parse(text);

    if (!data || !Array.isArray(data.books)) {
      throw new Error('Invalid sync package data received');
    }

    displayIncomingSyncPreview(data);
  } catch (err) {
    console.error('Fetch sync error:', err);
    if (typeof showToast === 'function') {
      showToast('❌ Code invalid ya expire ho chuka hai. Check karein aur dubara dalein.');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '🚀 Connect';
    }
  }
}
window.connectAndFetchSyncData = connectAndFetchSyncData;

function displayIncomingSyncPreview(data) {
  window._incomingSyncPackage = data;
  const box = document.getElementById('syncIncomingPreviewBox');
  const statsEl = document.getElementById('syncIncomingStats');

  const count = (data.books || []).length;
  const streak = data.stats?.readingStreak || 0;
  const device = data.sourceDevice || 'Other Device';

  if (statsEl) {
    statsEl.innerText = \`From \${device} • \${count} Books • \${streak}-day Reading Streak\`;
  }
  if (box) box.style.display = 'block';

  if (typeof showToast === 'function') {
    showToast(\`✓ Found \${count} books from \${device}! Select merge option below.\`);
  }
}

function handleSyncFileUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  if (file.name.endsWith('.json') || file.type === 'application/json') {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data && Array.isArray(data.books)) {
          displayIncomingSyncPreview(data);
        } else {
          showToast('⚠️ JSON file me valid books data nahi mila.');
        }
      } catch (err) {
        showToast('❌ JSON file parse karne me error aayi.');
      }
    };
    reader.readAsText(file);
    return;
  }

  // If user uploaded an image / screenshot
  if (file.type.startsWith('image/')) {
    if (typeof showToast === 'function') {
      showToast('📷 Image loaded! Decoding QR code from screenshot...');
    }
    // Attempt BarcodeDetector if available in browser
    if (typeof window.BarcodeDetector !== 'undefined') {
      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      createImageBitmap(file).then(bitmap => {
        barcodeDetector.detect(bitmap).then(barcodes => {
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            console.log('Decoded QR rawValue:', rawValue);
            document.getElementById('syncInputCode').value = rawValue;
            connectAndFetchSyncData();
          } else {
            showToast('⚠️ Photo me QR code detect nahi ho paya. Kripya 5-letter code dalein.');
          }
        }).catch(() => {
          showToast('⚠️ Photo me QR code detect nahi ho paya. Kripya 5-letter code dalein.');
        });
      });
    } else {
      showToast('💡 Photo loaded! Kripya QR ke niche likha 5-letter code type karein.');
    }
  }
}
window.handleSyncFileUpload = handleSyncFileUpload;

function applyIncomingSyncData(mergeMode) {
  playTactileClick();
  const incoming = window._incomingSyncPackage;
  if (!incoming || !Array.isArray(incoming.books)) {
    if (typeof showToast === 'function') showToast('⚠️ Koi sync package select nahi hai.');
    return;
  }

  const localBooks = state.books || [];
  let finalBooks = [];

  if (mergeMode === 'REPLACE') {
    finalBooks = incoming.books;
  } else {
    // SMART MERGE (Merge without duplicates, keep highest pages & completed status)
    finalBooks = [...localBooks];
    incoming.books.forEach(inBook => {
      const idx = finalBooks.findIndex(b => (b.id && b.id === inBook.id) || (b.title && b.title.toLowerCase().trim() === inBook.title.toLowerCase().trim()));
      if (idx >= 0) {
        const exist = finalBooks[idx];
        const maxPage = Math.max(exist.current_page || 0, inBook.current_page || 0);
        const isDone = (exist.status === 'DONE' || inBook.status === 'DONE');
        finalBooks[idx] = Object.assign({}, exist, inBook, {
          current_page: maxPage,
          status: isDone ? 'DONE' : (maxPage > 0 ? 'READING' : exist.status)
        });
      } else {
        finalBooks.push(inBook);
      }
    });
  }

  // Update state
  state.books = finalBooks;
  saveBooks();

  // Merge stats & reading streak (take higher streak)
  if (incoming.stats) {
    state.stats.readingStreak = Math.max(state.stats?.readingStreak || 0, incoming.stats?.readingStreak || 0);
    if (typeof saveStateToStorage === 'function') saveStateToStorage();
  }

  // Merge prices & budget
  if (incoming.prices && typeof incoming.prices === 'object') {
    const curPrices = JSON.parse(localStorage.getItem('mf_book_prices') || '{}');
    const mergedPrices = Object.assign({}, curPrices, incoming.prices);
    localStorage.setItem('mf_book_prices', JSON.stringify(mergedPrices));
  }

  // Update UI and record audit log
  if (typeof window.addAuditLog === 'function') {
    window.addAuditLog(
      \`Synced with \${incoming.sourceDevice || 'Other Device'}\`,
      'Sync',
      \`Total \${finalBooks.length} books merged (\${mergeMode} mode)\`,
      '🔄',
      0
    );
  }

  const box = document.getElementById('syncIncomingPreviewBox');
  if (box) box.style.display = 'none';

  if (typeof renderReadingBudget === 'function') renderReadingBudget();
  if (typeof renderProgressView === 'function') renderProgressView();
  if (typeof renderHome === 'function') renderHome();
  renderSyncDevicesView();

  if (typeof showToast === 'function') {
    showToast(\`🎉 Success! \${finalBooks.length} Books synced & merged perfectly!\`);
  }
}
window.applyIncomingSyncData = applyIncomingSyncData;
`;

// Replace old renderSyncDevicesView with the full engine
const oldRender = /function renderSyncDevicesView\(\)\s*\{[\s\S]*?\}\s*\n/;
if (oldRender.test(code)) {
  code = code.replace(oldRender, syncEngineJs);
} else {
  code += '\n' + syncEngineJs;
}

fs.writeFileSync(appPath, code, 'utf8');
console.log('app.js updated with full Phone <-> Laptop Sync Engine');
