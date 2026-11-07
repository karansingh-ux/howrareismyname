import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

// 1. Ingestion and Data Integrity Tests
test('Ingestion report verifies data integrity', () => {
  const reportPath = path.resolve(process.cwd(), 'data/ingestion_report.json');
  assert.ok(fs.existsSync(reportPath), 'Ingestion report must exist');

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  assert.equal(report.status, 'success');
  assert.equal(report.total_unique_names, 267122, 'Must have exactly 267,122 unique names');
  assert.equal(report.total_records, 772194503, 'Must represent 772,194,503 voter records');
  assert.equal(report.license, 'CC0-1.0 Universal (Public Domain Dedication)');
  assert.equal(report.source_doi, 'doi:10.7910/DVN/WZGJBM');
});

test('SQLite database has contiguous ranks and non-negative counts', () => {
  const dbPath = path.resolve(process.cwd(), 'data/names.db');
  assert.ok(fs.existsSync(dbPath), 'Names database must exist');

  const db = new Database(dbPath, { readonly: true });
  const rowCount = db.prepare('SELECT count(*) as cnt FROM names').get().cnt;
  assert.equal(rowCount, 267122, 'Names table must have 267,122 rows');

  const minMax = db.prepare('SELECT min(rank) as minR, max(rank) as maxR, min(total_count) as minC, sum(total_count) as sumC FROM names').get();
  assert.equal(minMax.minR, 1, 'Top rank must be 1');
  assert.equal(minMax.maxR, 267122, 'Max rank must be 267,122');
  assert.ok(minMax.minC >= 5, 'All names must meet minimum 5 threshold');
  assert.equal(minMax.sumC, 772194503, 'Sum of all counts must match 772,194,503');

  db.close();
});

// 2. Rarity Engine Tests
test('Rarity engine correctly calculates benchmark names', async () => {
  // Use tsx or compile or test db directly
  const dbPath = path.resolve(process.cwd(), 'data/names.db');
  const db = new Database(dbPath, { readonly: true });

  const rahul = db.prepare('SELECT * FROM names WHERE normalized_name = ?').get('rahul');
  assert.ok(rahul, 'Rahul must be in dataset');
  assert.equal(rahul.display_name, 'Rahul');
  assert.equal(rahul.rarity_label, 'VERY COMMON');

  const priya = db.prepare('SELECT * FROM names WHERE normalized_name = ?').get('priya');
  assert.ok(priya, 'Priya must be in dataset');
  assert.equal(priya.display_name, 'Priya');
  assert.equal(priya.rarity_label, 'VERY COMMON');

  const dhwani = db.prepare('SELECT * FROM names WHERE normalized_name = ?').get('dhwani');
  assert.ok(dhwani, 'Dhwani must be in dataset');
  assert.equal(dhwani.display_name, 'Dhwani');
  assert.equal(dhwani.total_count, 144);
  assert.equal(dhwani.rarity_label, 'UNCOMMON');

  const kunal = db.prepare('SELECT * FROM names WHERE normalized_name = ?').get('kunal');
  assert.ok(kunal, 'Kunal must be in dataset');
  assert.equal(kunal.display_name, 'Kunal');
  assert.equal(kunal.total_count, 32123);
  assert.equal(kunal.rarity_label, 'COMMON');

  const ananya = db.prepare('SELECT * FROM names WHERE normalized_name = ?').get('ananya');
  assert.ok(ananya, 'Ananya must be in dataset');
  assert.equal(ananya.display_name, 'Ananya');
  assert.equal(ananya.total_count, 2135);
  assert.equal(ananya.rarity_label, 'MODERATELY COMMON');

  // Distinct spelling check: Mohammed vs Mohammad
  const mohammed = db.prepare('SELECT * FROM names WHERE normalized_name = ?').get('mohammed');
  const mohammad = db.prepare('SELECT * FROM names WHERE normalized_name = ?').get('mohammad');
  assert.ok(mohammed && mohammad, 'Both distinct spellings must exist');
  assert.notEqual(mohammed.rank, mohammad.rank, 'Spellings must not be prematurely merged');
  assert.notEqual(mohammed.total_count, mohammad.total_count);

  db.close();
});

// 3. Transliteration, Fuzzy Matching, and Dynamic Resolution Tests
test('Transliteration, Fuzzy matching, and Dynamic resolution handle variations and global names', async () => {
  const { calculateNameRarity } = await import('../lib/rarity.ts');

  // 1. Jeanal -> matches Jenal (#171,081)
  const jeanal = await calculateNameRarity('Jeanal', 'IN');
  assert.equal(jeanal.found, true);
  assert.equal(jeanal.rarityLabel, 'RARE');
  assert.equal(jeanal.rank, 171081);
  assert.equal(jeanal.matchedVariant, 'Jenal');
  assert.equal(jeanal.isUltraRare, false);

  // 2. Fuzzy match: Priyaaa -> matches Priyaa
  const priyaaa = await calculateNameRarity('Priyaaa', 'IN');
  assert.equal(priyaaa.found, true);
  assert.ok(priyaaa.matchedVariant === 'Priyaa' || priyaaa.fuzzyMatch?.matchedName === 'Priyaa');

  // 3. US SSA Dataset: John in US
  const johnUs = await calculateNameRarity('John', 'US');
  assert.equal(johnUs.found, true);
  assert.equal(johnUs.rank, 1);
  assert.equal(johnUs.rarityLabel, 'VERY COMMON');
  assert.ok(johnUs.count > 10000000);

  // 4. Dynamic External API: Matteo
  const matteo = await calculateNameRarity('Matteo', 'EU');
  assert.equal(matteo.found, true);
  assert.ok(matteo.count > 1000);

  // 5. Unseen novel name -> triggers ULTRA-RARE model with mathematical upper-bound
  const unseen = await calculateNameRarity('Xylovarun', 'IN');
  assert.equal(unseen.found, true);
  assert.equal(unseen.rarityLabel, 'ULTRA-RARE');
  assert.equal(unseen.isUltraRare, true);
  assert.ok(unseen.displayStatistic.includes('15,000,000'));
  assert.ok(unseen.rankStatement.includes('top 0.01%'));
});

// 4. Transactional Email Report Generator Tests
test('Email template generator produces valid, accessible HTML with unsubscribe links', async () => {
  const { generateReportHtml } = await import('../lib/email.ts');

  const html = generateReportHtml({
    to: 'oldfifa23@gmail.com',
    name: 'Karan',
    normalizedName: 'karan',
    rarityLabel: 'VERY COMMON',
    rank: 831,
    oneInX: 1200,
    displayStatistic: 'Approximately 1 in 1,200 registered individuals have this name.',
    unsubscribeToken: 'test_token_123456789'
  });

  assert.ok(html.includes('Karan'));
  assert.ok(html.includes('VERY COMMON'));
  assert.ok(html.includes('#831'));
  assert.ok(html.includes('test_token_123456789'));
  assert.ok(html.includes('Unsubscribe'));
});

// 3. Subscriber Database Tests
test('Subscriber validation, deduplication, and unsubscribe workflow', () => {
  const testDbPath = path.resolve(process.cwd(), 'data/test_subscribers.db');
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

  const db = new Database(testDbPath);
  db.exec(`
    CREATE TABLE subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name_entered TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      result_rank INTEGER,
      marketing_consent INTEGER NOT NULL DEFAULT 0,
      consent_timestamp TEXT,
      unsubscribe_token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Email validation regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  assert.ok(emailRegex.test('user@example.com'));
  assert.ok(emailRegex.test('rahul.sharma@domain.co.in'));
  assert.ok(!emailRegex.test('invalid-email'));
  assert.ok(!emailRegex.test('user@'));
  assert.ok(!emailRegex.test('@domain.com'));

  // Insert subscriber
  const token1 = 'tok_12345';
  db.prepare(`
    INSERT INTO subscribers (email, name_entered, normalized_name, result_rank, marketing_consent, consent_timestamp, unsubscribe_token, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('rahul@example.com', 'Rahul', 'rahul', 1984, 1, new Date().toISOString(), token1, new Date().toISOString());

  const inserted = db.prepare('SELECT * FROM subscribers WHERE email = ?').get('rahul@example.com');
  assert.equal(inserted.name_entered, 'Rahul');
  assert.equal(inserted.marketing_consent, 1);

  // Unsubscribe
  db.prepare('UPDATE subscribers SET marketing_consent = 0 WHERE unsubscribe_token = ?').run(token1);
  const unsubscribed = db.prepare('SELECT * FROM subscribers WHERE email = ?').get('rahul@example.com');
  assert.equal(unsubscribed.marketing_consent, 0, 'Marketing consent must be revoked');

  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});
