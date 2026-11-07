import Database from 'better-sqlite3';
import path from 'path';
import { calculateNameRarity } from '../lib/rarity.ts';
import { sendNameReportEmail } from '../lib/email.ts';

const dbPath = path.resolve(process.cwd(), 'data/subscribers.db');
const db = new Database(dbPath);

const subscribers = db.prepare('SELECT * FROM subscribers ORDER BY id ASC').all();
console.log(`Found ${subscribers.length} subscribers in queue.`);

for (const sub of subscribers) {
  console.log(`Processing email dispatch for: ${sub.email} (${sub.name_entered})`);
  const rarityData = calculateNameRarity(sub.name_entered);

  const result = await sendNameReportEmail({
    to: sub.email,
    name: rarityData.name || sub.name_entered,
    normalizedName: rarityData.normalizedName || sub.normalized_name,
    rarityLabel: rarityData.rarityLabel,
    rank: rarityData.rank ?? sub.result_rank ?? null,
    oneInX: rarityData.oneInX ?? null,
    displayStatistic: rarityData.displayStatistic,
    explanation: rarityData.explanation,
    unsubscribeToken: sub.unsubscribe_token,
    isUltraRare: rarityData.isUltraRare
  });

  console.log(`Dispatched to ${sub.email}: Provider=${result.provider}, Success=${result.success}`);
}

db.close();
console.log('Finished processing pending subscriber emails.');
