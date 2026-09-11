# 🧠 Mind & Focus Books Tracker (150 Books)

An offline, responsive reading companion and tracker featuring 150 curated books on Focus, Mindset, Brain Science, Habits, and Memory.

## ✨ Features
- **100% Offline**: Zero external libraries, fonts, or CDN dependencies. Works completely without internet.
- **Excel VBA Automation**: Automatic start dates, live daily counter, completion dates, and dynamic calculation.
- **Progress Tracking & KPIs**: 5 metric cards matching Excel formulas (Total Books, Books Done, Currently Reading, Total Days Read, Avg Days / Book).
- **Dual View**: Spreadsheet-like Table view & Library Card grid view.
- **Interactive Controls**: Dynamic "Update" indicator on changes, Star Ratings (1-5), and Takeaways notes editor.
- **Desktop Application Launcher**: Native window mode via `run_app.pyw` / `Launch-Mind-Focus-App.bat`.
- **Data Export & Backup**: Export to Excel CSV (UTF-8 BOM), JSON Backup, and Import.

## 🚀 How to Run
1. **Desktop App (Native Window)**: Double-click `Launch-Mind-Focus-App.bat` or the Desktop shortcut.
2. **Web Browser (Offline)**: Double-click `index.html` or `Mind-Focus-Books-App-Offline.html`.
3. **Admin Control Panel**: Double-click `Launch-Control-Panel.bat` (or open `control-panel.html`).
   The legacy `admin.html` now redirects to the new Control Panel.

## 🔧 Recent Fixes
- All 32 missing HTML IDs in `index.html` are now provided via a hidden placeholder block
  so that previously dead features (theme toggle, ambience, toasts, mini capsule, lockdown
  overlay, etc.) work without layout changes.
- All 3 missing IDs in `control-panel.html` (adminToast, pipelineStagedTitle,
  pipelineStagedDesc) are added.
- `run_app.pyw` now creates a timestamped backup of `books-data.js` in
  `books-data-backups/` before every save (keeps last 20). Two new JS-callable
  methods are exposed: `list_backups()` and `restore_backup(filename)`.
- `admin.html` is converted to a friendly redirect page pointing to
  `control-panel.html`.

## 🔐 Admin Panel Password / PIN Lock (NEW)
Control panel ab password ya 4-digit PIN se lock hota hai.

- **First time:** Setup screen open hoga — password (min 6 chars) ya 4-digit PIN choose karein.
- **Saved:** Har reload pe password/PIN maangega.
- **Idle auto-lock:** 30 minute koi activity nahi → automatic re-lock.
- **Manual lock:** Browser me `adminLockRelock()` call kar sakte ho (future me button add hoga).
- **Forgot password?**
  1. Open `https://raw.githubusercontent.com/ankitburdak05-oss/mind-focus-books-tracker/main/admin-reset-token.txt`
  2. Copy the token
  3. Click "Forgot password?" → paste token → set new password
- **Recovery token** is in `admin-reset-token.txt` at the repo root. Keep it private.
  Change it by editing the file and pushing — only holders of the new token can reset.

**Lock data storage:** hashed value is saved in browser `localStorage` under
`mf_admin_lock_v1`. Clear it manually from DevTools if you want to wipe the lock.
