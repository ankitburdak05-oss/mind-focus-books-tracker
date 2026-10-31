const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Update Profile Menu Item
const oldMenuItem = `<div class="profile-menu-item" onclick="navigateToSubView('syncDevices')">
          <div class="pmi-icon grad-blue">☁️</div>
          <div class="pmi-text">
            <div class="pmi-title">Sync Across Devices</div>
            <div class="pmi-sub">Cloud sync &bull; Phone, Mac, Tablet</div>
          </div>
          <div class="pmi-arrow">&rsaquo;</div>
        </div>`;

const newMenuItem = `<div class="profile-menu-item" style="border-left: 3px solid #3b82f6; background: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0.02) 100%);" onclick="navigateToSubView('syncDevices')">
          <div class="pmi-icon grad-blue">🔄</div>
          <div class="pmi-text">
            <div class="pmi-title">Phone ↔ Laptop Sync</div>
            <div class="pmi-sub" id="profileSyncSubText">6-Digit Code &amp; QR Sync &bull; Instant Pairing</div>
          </div>
          <div class="pmi-arrow">&rsaquo;</div>
        </div>`;

// 2. Full interactive viewSyncDevices
const newSyncSection = `    <!-- ================= SUB-SCREEN: PHONE ↔ LAPTOP SYNC HUB ================= -->
    <section id="viewSyncDevices" class="app-view">

      <div class="sub-screen-header">
        <button type="button" class="sub-screen-back-btn" onclick="navigateBack()">&larr;</button>
        <div class="sub-screen-title-wrap">
          <h2 class="sub-screen-main-title">Phone ↔ Laptop Sync</h2>
          <p class="sub-screen-sub-title">Instant Wireless 6-Digit Code &amp; QR Library Pairing</p>
        </div>
        <button type="button" class="sub-screen-action-btn" onclick="renderSyncDevicesView()" title="Refresh">&#x21bb;</button>
      </div>

      <!-- Current Device Indicator Card -->
      <div class="custom-section-block" style="padding:16px 20px; background:linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(15,23,42,0.85) 100%); border-color:rgba(59,130,246,0.3); margin-bottom:16px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div id="syncDeviceTypeIcon" style="width:44px; height:44px; border-radius:12px; background:rgba(59,130,246,0.2); color:#60a5fa; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">
              💻
            </div>
            <div>
              <div style="font-size:0.95rem; font-weight:800; color:#fff;" id="syncDeviceTypeName">This Device: Laptop Edition</div>
              <div style="font-size:0.75rem; color:#94a3b8;" id="syncDeviceStatsBrief">Loading library state...</div>
            </div>
          </div>
          <span class="custom-section-badge" style="background:rgba(16,185,129,0.15); color:#10b981; border-color:rgba(16,185,129,0.3); font-size:0.75rem;">READY</span>
        </div>
      </div>

      <!-- Dual Action Tabs: SEND vs RECEIVE -->
      <div class="book-status-tabs-bar" style="margin-bottom:16px;">
        <button type="button" class="book-status-tab-btn active" id="syncTabSend" onclick="switchSyncMode('SEND')">
          <span class="bstat-tab-icon">📤</span>
          <span class="bstat-tab-label">Send Data to Other Device</span>
        </button>
        <button type="button" class="book-status-tab-btn" id="syncTabReceive" onclick="switchSyncMode('RECEIVE')">
          <span class="bstat-tab-icon">📥</span>
          <span class="bstat-tab-label">Receive Data on This Device</span>
        </button>
      </div>

      <!-- PANEL 1: SEND / SHARE DATA -->
      <div id="syncPanelSend" class="custom-section-block" style="padding:20px 18px;">
        <div style="text-align:center; margin-bottom:16px;">
          <h3 style="color:#fff; font-size:1.1rem; font-weight:800; margin:0 0 6px;">Share Library &amp; Progress</h3>
          <p style="color:#94a3b8; font-size:0.8rem; margin:0 auto; max-width:440px;">
            Generate an instant 5-character sync code or QR code to wirelessly send all your books, reading streak, notes, and prices to your other device.
          </p>
        </div>

        <button type="button" class="btn-save-gold" id="btnGenerateSyncCode" onclick="generateDeviceSyncCode()" style="width:100%; padding:14px; font-size:0.95rem; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px;">
          <span>⚡</span>
          <span>Generate 5-Character Sync Code &amp; QR</span>
        </button>

        <!-- Sync Code Generated Result Box -->
        <div id="syncCodeResultBox" style="display:none; margin-top:20px; text-align:center; padding:18px; background:rgba(0,0,0,0.4); border:1px solid rgba(245,158,11,0.4); border-radius:18px;">
          <div style="font-size:0.75rem; color:#f59e0b; text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:8px;">
            Your Direct Sync Code (Valid for 24h)
          </div>
          <div id="syncCodeDisplay" style="font-size:2.2rem; font-weight:900; letter-spacing:6px; color:#ffffff; font-family:monospace; background:rgba(255,255,255,0.06); padding:10px 18px; border-radius:12px; display:inline-block; margin-bottom:12px; border:1px dashed rgba(245,158,11,0.6);">
            ------
          </div>

          <!-- QR Code Image -->
          <div style="margin:12px 0;">
            <img id="syncQrCodeImg" src="" alt="Sync QR Code" style="width:180px; height:180px; border-radius:12px; background:#fff; padding:8px; box-shadow:0 8px 24px rgba(0,0,0,0.5); display:inline-block;">
          </div>
          <div style="font-size:0.78rem; color:#cbd5e1; margin-bottom:14px;">
            📱 Phone se scan karein, ya doosre device me upar wala 5-letter code type karein!
          </div>

          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button type="button" class="btn-cancel" onclick="copyGeneratedSyncCode()" style="padding:10px 18px; font-size:0.82rem; font-weight:700;">
              📋 Copy Code
            </button>
            <button type="button" class="btn-cancel" onclick="downloadSyncPackageFile()" style="padding:10px 18px; font-size:0.82rem; font-weight:700;">
              💾 Save File (.json)
            </button>
          </div>
        </div>
      </div>

      <!-- PANEL 2: RECEIVE / IMPORT DATA -->
      <div id="syncPanelReceive" class="custom-section-block" style="display:none; padding:20px 18px;">
        <div style="text-align:center; margin-bottom:18px;">
          <h3 style="color:#fff; font-size:1.1rem; font-weight:800; margin:0 0 6px;">Connect &amp; Receive Library</h3>
          <p style="color:#94a3b8; font-size:0.8rem; margin:0;">
            Enter the 5-character code from your other device, or upload a photo / screenshot of the QR code.
          </p>
        </div>

        <!-- Method 1: Enter Code -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; margin-bottom:16px;">
          <label style="display:block; font-size:0.82rem; color:#e2e8f0; font-weight:700; margin-bottom:8px;">
            🔑 Enter 5-Character Sync Code:
          </label>
          <div style="display:flex; gap:8px;">
            <input type="text" id="syncInputCode" placeholder="e.g. ZFACf" maxlength="10" style="flex:1; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.2); color:#fff; font-family:monospace; font-size:1.2rem; font-weight:800; letter-spacing:2px; text-transform:none; padding:10px 14px; border-radius:10px; outline:none;">
            <button type="button" class="btn-save-gold" id="btnConnectSync" onclick="connectAndFetchSyncData()" style="padding:10px 18px; font-size:0.88rem; font-weight:800; flex-shrink:0;">
              🚀 Connect
            </button>
          </div>
        </div>

        <!-- Method 2: Photo / Screenshot / File Upload -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; margin-bottom:16px; text-align:center;">
          <div style="font-size:0.85rem; color:#e2e8f0; font-weight:700; margin-bottom:6px;">
            📁 Or Upload QR Photo / Screenshot / Backup File:
          </div>
          <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:12px;">
            Laptop me live camera ki zaroorat nahi — phone se photo khinch kar ya QR screenshot upload karein!
          </div>

          <label class="btn-cancel" style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; padding:10px 20px; font-weight:700; font-size:0.85rem; border:1px dashed rgba(245,158,11,0.5);">
            <span>📷 Choose Photo or Sync File</span>
            <input type="file" id="syncFileInput" accept="image/*,.json" style="display:none;" onchange="handleSyncFileUpload(event)">
          </label>
        </div>

        <!-- Incoming Data Preview Box -->
        <div id="syncIncomingPreviewBox" style="display:none; padding:16px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.4); border-radius:16px; margin-top:16px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <span style="font-size:1.4rem;">📦</span>
            <div>
              <div style="font-size:0.95rem; font-weight:800; color:#10b981;">Sync Package Ready to Merge!</div>
              <div style="font-size:0.75rem; color:#94a3b8;" id="syncIncomingStats">Loading details...</div>
            </div>
          </div>

          <div style="display:flex; gap:10px; margin-top:14px;">
            <button type="button" class="btn-save-gold" onclick="applyIncomingSyncData('MERGE')" style="flex:2; padding:12px; font-size:0.9rem; font-weight:800;">
              ✅ Smart Merge (Recommended)
            </button>
            <button type="button" class="btn-cancel" onclick="applyIncomingSyncData('REPLACE')" style="flex:1; padding:12px; font-size:0.82rem; font-weight:700;">
              ⚡ Replace All
            </button>
          </div>
        </div>
      </div>
    </section>`;

// Replace menu item
html = html.replace(/<div class="profile-menu-item" onclick="navigateToSubView\('syncDevices'\)">[\s\S]*?<\/div>\s*<\/div>/, newMenuItem);

// Replace viewSyncDevices section
html = html.replace(/<section id="viewSyncDevices" class="app-view">[\s\S]*?<\/section>/, newSyncSection);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html updated with Phone <-> Laptop Sync Hub');
