const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', '@vladmandic', 'face-api', 'model');
const targetDir = path.join(__dirname, '..', 'public', 'models');

if (!fs.existsSync(sourceDir)) {
  console.warn('[copy-face-models] @vladmandic/face-api models not found — skipping');
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

for (const entry of fs.readdirSync(sourceDir)) {
  fs.copyFileSync(path.join(sourceDir, entry), path.join(targetDir, entry));
}

console.log('[copy-face-models] Tiny face detector models copied to public/models');
