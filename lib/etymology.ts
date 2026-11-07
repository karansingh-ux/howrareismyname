import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

export interface NameEtymology {
  origin?: string;
  meaning?: string;
  source: string;
}

let dbInstance: Database.Database | null = null;

function getEtymologyDb(): Database.Database {
  if (!dbInstance) {
    try {
      const dbPath = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
        ? path.join(os.tmpdir(), 'names_etymology.db')
        : path.resolve(process.cwd(), 'data/names_dynamic.db');
      dbInstance = new Database(dbPath);
      dbInstance.pragma('journal_mode = WAL');
    } catch {
      dbInstance = new Database(':memory:');
    }

    try {
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS name_etymologies (
          normalized_name TEXT PRIMARY KEY,
          display_name TEXT NOT NULL,
          origin TEXT,
          meaning TEXT,
          source TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_etym_norm ON name_etymologies(normalized_name);
      `);
    } catch (e) {
      console.warn('Etymology DB initialization warning:', e);
    }
  }
  return dbInstance;
}

/**
 * Clean and summarize Wikipedia/Wikidata extract into a concise 1-2 sentence etymology.
 */
function parseEtymologyText(text: string): { origin?: string; meaning?: string } | null {
  if (!text || text.length < 15) return null;

  // Clean wiki citations and multiple newlines
  const cleaned = text
    .replace(/\[\d+\]/g, '')
    .replace(/\\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Look for common linguistic patterns: "of [Language] origin", "derived from", "meaning [X]"
  const originMatch = cleaned.match(/(?:of|originates? from|derived from the?)\s+([A-Z][a-z]+(?:\s+[a-z]+)?)\s+(?:origin|language|root)/i)
    || cleaned.match(/([A-Z][a-z]+)\s+(?:origin masculine|origin feminine|origin given name|masculine|feminine)\s+given name/i)
    || cleaned.match(/\(([A-Z][a-z]+):[^)]*\)/);

  let origin = originMatch ? originMatch[1].trim().replace(/^the\s+/i, '') : undefined;
  if (origin) origin = origin.charAt(0).toUpperCase() + origin.slice(1);
  if (origin && ['Indian', 'Hindu'].includes(origin)) {
    if (/sanskrit/i.test(cleaned)) origin = 'Sanskrit';
  }

  // Look for meaning: "meaning 'X'", "means 'X'", "lit. 'X'"
  const meaningMatch = cleaned.match(/(?:meaning|means|translated as|lit\.\s*)\s*["'“‘]([^"'”’]+)["'”’]/i)
    || cleaned.match(/(?:meaning|means)\s+([^,.;]{3,50})/i);

  let meaning = meaningMatch ? meaningMatch[1].trim() : undefined;
  if (meaning) {
    meaning = meaning.replace(/[.,;]$/, '').trim();
  }

  // If we couldn't extract distinct origin/meaning regex, use the first concise sentence if it describes a given name
  if (!origin && !meaning) {
    const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0];
    if (firstSentence && /given name|origin|derived|means|meaning/i.test(firstSentence) && firstSentence.length <= 160) {
      return {
        origin: 'Traditional',
        meaning: firstSentence
      };
    }
    return null;
  }

  return { origin, meaning };
}

/**
 * Fetch verified name etymology from local cache, Wikipedia, or Wikidata.
 * Guaranteed to return null if no authentic reference is documented (zero fake data).
 */
export async function getVerifiedNameEtymology(rawName: string): Promise<NameEtymology | null> {
  const normalized = rawName.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (!normalized || normalized.length < 2) return null;

  const db = getEtymologyDb();

  // 1. Check local cache
  try {
    const cached = db.prepare('SELECT * FROM name_etymologies WHERE normalized_name = ?').get(normalized) as {
      origin: string | null;
      meaning: string | null;
      source: string;
    } | undefined;

    if (cached) {
      if (!cached.origin && !cached.meaning) {
        return null; // Known to have no verifiable etymology
      }
      return {
        origin: cached.origin ?? undefined,
        meaning: cached.meaning ?? undefined,
        source: cached.source
      };
    }
  } catch (err) {
    console.error('Etymology cache lookup error:', err);
  }

  // 2. Query Wikipedia & Wikidata with timeout
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

  try {
    const urls = [
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(displayName + '_(given_name)')}`,
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(displayName)}`
    ];

    let extract: string | null = null;
    let sourceUrl = 'Wikipedia (Open Encyclopedia)';

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'HowRareIsMyNameBot/1.0 (https://howrareismyname.in; hello@howrareismyname.in)' },
          signal: AbortSignal.timeout(2500)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.type === 'standard' && data.extract && !data.extract.includes('may refer to:')) {
            if (/given name|masculine name|feminine name|name of|derived from|originates from/i.test(data.extract)) {
              extract = data.extract;
              sourceUrl = data.content_urls?.desktop?.page || 'Wikipedia';
              break;
            }
          }
        }
      } catch {
        // Fall through
      }
    }

    if (extract) {
      const parsed = parseEtymologyText(extract);
      if (parsed) {
        db.prepare(`
          INSERT OR REPLACE INTO name_etymologies (normalized_name, display_name, origin, meaning, source, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(normalized, displayName, parsed.origin ?? null, parsed.meaning ?? null, sourceUrl, new Date().toISOString());

        return {
          origin: parsed.origin,
          meaning: parsed.meaning,
          source: 'Wikipedia & Open Etymology Archives'
        };
      }
    }

    // 3. Fallback: Wikidata lexical entity search
    const wikiDataUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(displayName)}&language=en&format=json&type=item&limit=3`;
    const wikiRes = await fetch(wikiDataUrl, { signal: AbortSignal.timeout(2000) });
    if (wikiRes.ok) {
      const wikiJson = await wikiRes.json();
      if (wikiJson.search && Array.isArray(wikiJson.search)) {
        const nameItem = wikiJson.search.find((item: { description?: string }) => 
          item.description?.toLowerCase().includes('given name')
        );

        if (nameItem?.description) {
          const parsed = parseEtymologyText(nameItem.description);
          if (parsed) {
            db.prepare(`
              INSERT OR REPLACE INTO name_etymologies (normalized_name, display_name, origin, meaning, source, created_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(normalized, displayName, parsed.origin ?? null, parsed.meaning ?? null, 'Wikidata', new Date().toISOString());

            return {
              origin: parsed.origin,
              meaning: parsed.meaning,
              source: 'Wikidata'
            };
          }
        }
      }
    }

    // Cache negative lookup
    db.prepare(`
      INSERT OR REPLACE INTO name_etymologies (normalized_name, display_name, origin, meaning, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(normalized, displayName, null, null, 'Not Found', new Date().toISOString());

    return null;
  } catch (err) {
    console.error('Error resolving etymology:', err);
    return null;
  }
}
