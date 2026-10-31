const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const startIdx = content.indexOf('profileSyncSubText');
const aboutIdx = content.indexOf('navigateToSubView(\'aboutApp\')');

if (startIdx !== -1 && aboutIdx !== -1) {
  // Let's replace the whole region between profileSyncSubText and aboutApp
  const before = content.slice(0, startIdx);
  const after = content.slice(aboutIdx);
  
  const cleanMiddle = `profileSyncSubText">6-Digit Code &amp; QR Sync &bull; Instant Pairing</div>
          </div>
          <div class="pmi-arrow">&rsaquo;</div>
        </div>

        <div class="profile-menu-item" onclick="`;
  
  content = before + cleanMiddle + after;
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('Successfully cleaned menu items around profileSyncSubText!');
} else {
  console.log('Indices not found:', startIdx, aboutIdx);
}
