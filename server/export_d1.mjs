import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new DatabaseSync(path.join(__dirname, 'buy4achange.db'));

const esc = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
};

let out = `-- Buy4AChange Production D1 Seed (Generated ${new Date().toISOString()})\n\n`;

for (const table of ['admin_users', 'causes', 'products', 'gateway_settings']) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  out += `-- Table: ${table} (${rows.length} rows)\n`;
  for (const r of rows) {
    const cols = Object.keys(r);
    out += `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((c) => esc(r[c])).join(', ')});\n`;
  }
  out += '\n';
}

const outPath = path.join(__dirname, 'seed_d1.sql');
fs.writeFileSync(outPath, out, 'utf8');
console.log(`Exported ${outPath} (${out.length} bytes)`);
