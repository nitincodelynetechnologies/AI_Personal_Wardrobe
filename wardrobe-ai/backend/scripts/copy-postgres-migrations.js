const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../../database/postgres/migrations');
const target = path.resolve(__dirname, '../database/postgres/migrations');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(from, to);
      continue;
    }

    fs.copyFileSync(from, to);
  }
}

if (!fs.existsSync(source)) {
  console.warn(`[copy-postgres-migrations] Source not found (skipped): ${source}`);
  process.exit(0);
}

copyDir(source, target);
console.log(`[copy-postgres-migrations] Copied SQL migrations to ${target}`);
