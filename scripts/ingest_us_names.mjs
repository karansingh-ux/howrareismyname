import Database from 'better-sqlite3';
import https from 'https';
import readline from 'readline';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data/names.db');
const db = new Database(dbPath);

console.log('Ingesting US Social Security Administration (SSA) dataset...');

db.exec(`
  CREATE TABLE IF NOT EXISTS names_us (
    normalized_name TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    canonical_key TEXT NOT NULL,
    rank INTEGER NOT NULL,
    total_count INTEGER NOT NULL,
    female_count INTEGER NOT NULL,
    male_count INTEGER NOT NULL,
    frequency REAL NOT NULL,
    one_in_x INTEGER NOT NULL,
    rarity_label TEXT NOT NULL,
    female_percent REAL NOT NULL,
    male_percent REAL NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_us_canonical ON names_us(canonical_key);
  CREATE INDEX IF NOT EXISTS idx_us_rank ON names_us(rank);
`);

function canonicalKey(str) {
  let k = str.toLowerCase().trim().replace(/[^a-z]/g, '');
  k = k.replace(/ee+/g, 'i').replace(/oo+/g, 'u');
  k = k.replace(/ph/g, 'f').replace(/w/g, 'v');
  k = k.replace(/([b-df-hj-np-tv-z])\1+/g, '$1');
  return k;
}

const url = 'https://raw.githubusercontent.com/hadley/data-baby-names/master/baby-names.csv';

https.get(url, (res) => {
  const rl = readline.createInterface({ input: res });
  const map = new Map();
  let totalUsRecords = 0;
  let lines = 0;

  rl.on('line', (line) => {
    lines++;
    if (lines === 1) return;
    const parts = line.split(',');
    if (parts.length < 4) return;

    const rawName = parts[1].replace(/"/g, '').trim();
    const percent = parseFloat(parts[2]);
    const sex = parts[3].replace(/"/g, '').trim();

    const norm = rawName.toLowerCase().replace(/[^a-z]/g, '');
    if (!norm) return;

    // US historical average births scale
    const estimatedCount = Math.max(1, Math.round(percent * 3500000));
    totalUsRecords += estimatedCount;

    if (!map.has(norm)) {
      map.set(norm, {
        displayName: rawName,
        totalCount: 0,
        femaleCount: 0,
        maleCount: 0
      });
    }

    const entry = map.get(norm);
    entry.totalCount += estimatedCount;
    if (sex === 'girl' || sex === 'F') entry.femaleCount += estimatedCount;
    else entry.maleCount += estimatedCount;
  });

  rl.on('close', () => {
    console.log(`Processed ${lines} rows. Sorting ${map.size} unique US names...`);
    const sorted = Array.from(map.entries()).sort((a, b) => b[1].totalCount - a[1].totalCount);

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO names_us (
        normalized_name, display_name, canonical_key, rank, total_count,
        female_count, male_count, frequency, one_in_x, rarity_label,
        female_percent, male_percent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      let currentRank = 1;
      for (const [norm, data] of rows) {
        const freq = data.totalCount / totalUsRecords;
        const oneInX = Math.max(1, Math.round(1 / freq));
        const totalGender = data.femaleCount + data.maleCount;
        const femalePct = totalGender > 0 ? +((data.femaleCount / totalGender) * 100).toFixed(1) : 0;
        const malePct = totalGender > 0 ? +((data.maleCount / totalGender) * 100).toFixed(1) : 0;

        let rarityLabel = 'RARE';
        if (currentRank <= 50) rarityLabel = 'VERY COMMON';
        else if (currentRank <= 250) rarityLabel = 'COMMON';
        else if (currentRank <= 1000) rarityLabel = 'MODERATELY COMMON';
        else if (currentRank <= 3000) rarityLabel = 'UNCOMMON';
        else rarityLabel = 'RARE';

        insertStmt.run(
          norm,
          data.displayName,
          canonicalKey(norm),
          currentRank,
          data.totalCount,
          data.femaleCount,
          data.maleCount,
          freq,
          oneInX,
          rarityLabel,
          femalePct,
          malePct
        );
        currentRank++;
      }
    });

    insertMany(sorted);
    console.log(`Successfully populated names_us with ${sorted.length} unique US names and ${totalUsRecords} total records.`);
    db.close();
  });
});
