const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'app.js');
let code = fs.readFileSync(appPath, 'utf8');

code = code.replace(
  'if (badge) badge.innerText = `${targetVer} Ready`;',
  'if (badge) badge.innerText = `${targetVer} Ready (${isWindows ? "85.6 MB" : "18 MB"})`;'
);

code = code.replace(
  'btn.innerText = isWindows ? `💻 Download Windows .EXE (${targetVer})` : `📱 Download Android APK (${targetVer})`;',
  'btn.innerText = isWindows ? `💻 Download & Install Windows Update (${targetVer})` : `📱 Download Android APK (${targetVer})`;'
);

const oldChecklist = `const featuresToShow = (rel?.features && Array.isArray(rel.features) && rel.features.length > 0)
      ? rel.features
      : [
          isWindows ? '💻 Native Windows Desktop Application (.exe installer & portable)' : '📱 Signed Standalone Android APK',
          '📡 Live Update Radar Scanner in Profile Customization Hub',
          '🎨 12-Color Luxury Theme Palette & 6 Background Ambience Themes',
          '📋 Executive 4-Segmented Luxury Book Edit Studio (Zero Data Loss)',
          '⚡ Pure Local Storage Persistence with 100% Offline Integrity'
        ];`;

const newChecklist = `const featuresToShow = [
      isWindows ? '💻 Native In-App Updater: App ke andar hi download hoga (Koi browser nahi khulega)' : '📱 Signed Standalone Android APK Direct Installer',
      isWindows ? '📊 Real Progress Bar: 0% se 100% tak live MB aur speed dikhegi' : '⚡ 1-Tap APK Reinstall & Auto Package Installer',
      isWindows ? '🔄 Auto Setup Launch: 100% hote hi app close hokar installer apne aap chalega' : '📡 Live Update Radar Scanner in Profile',
      '✨ Dedicated About App & Updates Hub in Profile Menu',
      '🎨 12-Color Luxury Theme Palette & 6 Ambience Wallpapers',
      '🛡️ 100% Offline Integrity & Zero Data Loss'
    ];`;

code = code.replace(oldChecklist, newChecklist);

fs.writeFileSync(appPath, code, 'utf8');
console.log('Successfully updated modal texts in app.js');
