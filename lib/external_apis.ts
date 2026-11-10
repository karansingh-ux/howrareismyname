import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import { transliterateToAscii } from './transliterate.ts';

export interface ExternalNameResult {
  found: boolean;
  name: string;
  normalizedName: string;
  globalCount: number;
  topCountries: Array<{ countryCode: string; countryName: string; probability: number }>;
  gender?: 'male' | 'female' | 'unisex';
  genderProbability?: number;
  originDescription?: string;
  rarityLabel: 'VERY COMMON' | 'COMMON' | 'MODERATELY COMMON' | 'UNCOMMON' | 'RARE';
  oneInX: number;
  source: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  IT: 'Italy',
  ES: 'Spain',
  CA: 'Canada',
  AU: 'Australia',
  BR: 'Brazil',
  RU: 'Russia',
  NL: 'Netherlands',
  BE: 'Belgium',
  CH: 'Switzerland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  IE: 'Ireland',
  NZ: 'New Zealand',
  ZA: 'South Africa',
  SG: 'Singapore',
  AE: 'United Arab Emirates',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  NP: 'Nepal'
};

let cacheDb: Database.Database | null = null;

function getCacheDb(): Database.Database {
  if (!cacheDb) {
    try {
      const dbPath = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
        ? path.join(os.tmpdir(), 'names_dynamic.db')
        : path.resolve(process.cwd(), 'data/names_dynamic.db');
      cacheDb = new Database(dbPath);
      cacheDb.pragma('journal_mode = WAL');
    } catch {
      cacheDb = new Database(':memory:');
    }

    try {
      cacheDb.exec(`
        CREATE TABLE IF NOT EXISTS dynamic_names (
          normalized_name TEXT PRIMARY KEY,
          display_name TEXT NOT NULL,
          global_count INTEGER NOT NULL,
          top_countries TEXT NOT NULL,
          gender TEXT,
          gender_probability REAL,
          origin_description TEXT,
          rarity_label TEXT NOT NULL,
          one_in_x INTEGER NOT NULL,
          source TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_dyn_name ON dynamic_names(normalized_name);
      `);
    } catch (e) {
      console.warn('Cache DB initialization warning:', e);
    }
  }
  return cacheDb;
}

export async function queryDynamicExternalSources(rawName: string): Promise<ExternalNameResult | null> {
  const normalized = transliterateToAscii(rawName);
  if (!normalized || normalized.length < 2) return null;

  const db = getCacheDb();

  // 1. Check local dynamic cache first
  const cached = db.prepare('SELECT * FROM dynamic_names WHERE normalized_name = ?').get(normalized) as {
    normalized_name: string;
    display_name: string;
    global_count: number;
    top_countries: string;
    gender: string | null;
    gender_probability: number | null;
    origin_description: string | null;
    rarity_label: 'VERY COMMON' | 'COMMON' | 'MODERATELY COMMON' | 'UNCOMMON' | 'RARE';
    one_in_x: number;
    source: string;
  } | undefined;

  if (cached) {
    return {
      found: true,
      name: cached.display_name,
      normalizedName: cached.normalized_name,
      globalCount: cached.global_count,
      topCountries: JSON.parse(cached.top_countries),
      gender: (cached.gender as 'male' | 'female' | 'unisex') || undefined,
      genderProbability: cached.gender_probability ?? undefined,
      originDescription: cached.origin_description ?? undefined,
      rarityLabel: cached.rarity_label,
      oneInX: cached.one_in_x,
      source: cached.source
    };
  }

  // 2. Query external APIs in parallel (Nationalize.io + Wikidata + Genderize)
  try {
    const nationalizePromise = fetch(`https://api.nationalize.io?name=${encodeURIComponent(normalized)}`, {
      signal: AbortSignal.timeout(1200)
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    const wikidataPromise = fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(rawName)}&language=en&format=json&type=item&limit=3`, {
      signal: AbortSignal.timeout(1200)
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    const genderizePromise = fetch(`https://api.genderize.io?name=${encodeURIComponent(normalized)}`, {
      signal: AbortSignal.timeout(1200)
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    const [natData, wikiData, genData] = await Promise.all([
      nationalizePromise,
      wikidataPromise,
      genderizePromise
    ]);

    const globalCount = natData?.count || genData?.count || 0;
    if (globalCount === 0 && (!wikiData?.search || wikiData.search.length === 0)) {
      return null;
    }

    // Process top countries
    const topCountries: Array<{ countryCode: string; countryName: string; probability: number }> = [];
    if (natData?.country && Array.isArray(natData.country)) {
      for (const c of natData.country) {
        if (c.country_id) {
          topCountries.push({
            countryCode: c.country_id,
            countryName: COUNTRY_NAMES[c.country_id] || c.country_id,
            probability: Math.round(c.probability * 100) / 100
          });
        }
      }
    }

    // Process Wikidata entity description (origin, gender)
    let originDescription: string | undefined = undefined;
    if (wikiData?.search && Array.isArray(wikiData.search)) {
      const match = wikiData.search.find((item: { description?: string }) => 
        item.description?.toLowerCase().includes('given name') || item.description?.toLowerCase().includes('name')
      );
      if (match?.description) {
        originDescription = match.description;
      }
    }

    // Process Gender
    let gender: 'male' | 'female' | 'unisex' | undefined = undefined;
    let genderProbability: number | undefined = undefined;
    if (genData?.gender && genData.probability) {
      gender = genData.gender === 'male' || genData.gender === 'female' ? genData.gender : 'unisex';
      genderProbability = Math.round(genData.probability * 100);
    }

    // Calculate Rarity Label & One in X based on international sample
    let rarityLabel: 'VERY COMMON' | 'COMMON' | 'MODERATELY COMMON' | 'UNCOMMON' | 'RARE' = 'RARE';
    let oneInX = 1000000;

    if (globalCount >= 100000) {
      rarityLabel = 'VERY COMMON';
      oneInX = Math.max(50, Math.round(50000000 / globalCount));
    } else if (globalCount >= 10000) {
      rarityLabel = 'COMMON';
      oneInX = Math.max(250, Math.round(50000000 / globalCount));
    } else if (globalCount >= 1000) {
      rarityLabel = 'MODERATELY COMMON';
      oneInX = Math.max(1500, Math.round(50000000 / globalCount));
    } else if (globalCount >= 50) {
      rarityLabel = 'UNCOMMON';
      oneInX = Math.max(25000, Math.round(50000000 / globalCount));
    } else {
      rarityLabel = 'RARE';
      oneInX = Math.max(250000, Math.round(50000000 / Math.max(1, globalCount)));
    }

    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
    const sourceName = 'Global Demographic Aggregate (Nationalize & Wikidata)';

    // Cache in SQLite
    db.prepare(`
      INSERT OR REPLACE INTO dynamic_names (
        normalized_name, display_name, global_count, top_countries, gender, gender_probability,
        origin_description, rarity_label, one_in_x, source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      normalized,
      displayName,
      globalCount,
      JSON.stringify(topCountries),
      gender ?? null,
      genderProbability ?? null,
      originDescription ?? null,
      rarityLabel,
      oneInX,
      sourceName,
      new Date().toISOString()
    );

    return {
      found: true,
      name: displayName,
      normalizedName: normalized,
      globalCount,
      topCountries,
      gender,
      genderProbability,
      originDescription,
      rarityLabel,
      oneInX,
      source: sourceName
    };
  } catch (err) {
    console.error('Dynamic external API error:', err);
    return null;
  }
}
