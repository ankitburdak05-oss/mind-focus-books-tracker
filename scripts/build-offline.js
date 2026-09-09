/**
 * Mind Focus Books • Offline Single-File Bundler
 * Automatically generates Mind-Focus-Books-App-Offline.html from index.html,
 * style.css, books-data.js, dictionary-data.js, and app.js.
 * 
 * Usage: node scripts/build-offline.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const STYLE_CSS_PATH = path.join(ROOT_DIR, 'style.css');
const DICT_JS_PATH = path.join(ROOT_DIR, 'dictionary-data.js');
const BOOKS_JS_PATH = path.join(ROOT_DIR, 'books-data.js');
const APP_JS_PATH = path.join(ROOT_DIR, 'app.js');
const OUTPUT_OFFLINE_PATH = path.join(ROOT_DIR, 'Mind-Focus-Books-App-Offline.html');

console.log('📦 Starting Mind Focus Books Offline Bundler...');

try {
  let indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
  const styleCss = fs.readFileSync(STYLE_CSS_PATH, 'utf-8');
  const dictJs = fs.readFileSync(DICT_JS_PATH, 'utf-8');
  const booksJs = fs.readFileSync(BOOKS_JS_PATH, 'utf-8');
  const appJs = fs.readFileSync(APP_JS_PATH, 'utf-8');

  // 1. Inline style.css
  const styleLinkRegex = /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']\s*\/?>/i;
  if (!styleLinkRegex.test(indexHtml)) {
    console.warn('⚠️ Warning: <link rel="stylesheet" href="style.css"> not found, appending to head.');
    indexHtml = indexHtml.replace('</head>', `<style>\n${styleCss}\n</style>\n</head>`);
  } else {
    indexHtml = indexHtml.replace(styleLinkRegex, `<style>\n${styleCss}\n</style>`);
  }

  // 2. Inline dictionary-data.js
  const dictScriptRegex = /<script\s+src=["']dictionary-data\.js["']\s*><\/script>/i;
  if (dictScriptRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(dictScriptRegex, `<script>\n${dictJs}\n</script>`);
  } else {
    console.warn('⚠️ Warning: dictionary-data.js script tag not matched.');
  }

  // 3. Inline books-data.js
  const booksScriptRegex = /<script\s+src=["']books-data\.js["']\s*><\/script>/i;
  if (booksScriptRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(booksScriptRegex, `<script>\n${booksJs}\n</script>`);
  } else {
    console.warn('⚠️ Warning: books-data.js script tag not matched.');
  }

  // 4. Inline app.js
  const appScriptRegex = /<script\s+src=["']app\.js["']\s*><\/script>/i;
  if (appScriptRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(appScriptRegex, `<script>\n${appJs}\n</script>`);
  } else {
    console.warn('⚠️ Warning: app.js script tag not matched.');
  }

  // Write output
  fs.writeFileSync(OUTPUT_OFFLINE_PATH, indexHtml, 'utf-8');
  const stats = fs.statSync(OUTPUT_OFFLINE_PATH);

  console.log(`✅ Success! Generated ${OUTPUT_OFFLINE_PATH}`);
  console.log(`📊 Total Bundle Size: ${(stats.size / 1024).toFixed(2)} KB (${stats.size} bytes)`);
} catch (err) {
  console.error('❌ Build failed:', err);
  process.exit(1);
}
