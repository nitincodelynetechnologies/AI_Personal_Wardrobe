const fs = require('fs');
const path = require('path');

const cacheDirs = [
  path.join(__dirname, '..', '.next'),
  path.join(__dirname, '..', 'node_modules', '.cache', 'wardrobe-next'),
];
const attempts = 5;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
}

for (let i = 0; i < attempts; i += 1) {
  try {
    cacheDirs.forEach(removeDir);
    console.log('Removed Next.js caches');
    process.exit(0);
  } catch (error) {
    if (i === attempts - 1) {
      console.error(
        'Could not remove cache. Stop the dev server (Ctrl+C), then run: npm run clean && npm run dev',
      );
      console.error(error.message);
      process.exit(1);
    }
    sleep(1000);
  }
}
