import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

export type AnalyticsEventName =
  | 'landing_page_view'
  | 'name_submitted'
  | 'result_generated'
  | 'unknown_name'
  | 'share_clicked'
  | 'email_prompt_viewed'
  | 'email_submitted'
  | 'marketing_consent_given';

let analyticsDbInstance: Database.Database | null = null;

function getAnalyticsDb(): Database.Database {
  if (!analyticsDbInstance) {
    try {
      const dbPath = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
        ? path.join(os.tmpdir(), 'analytics.db')
        : path.resolve(process.cwd(), 'data/analytics.db');
      analyticsDbInstance = new Database(dbPath);
      analyticsDbInstance.pragma('journal_mode = WAL');
    } catch {
      analyticsDbInstance = new Database(':memory:');
    }

    try {
      analyticsDbInstance.exec(`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_name TEXT NOT NULL,
          anonymous_session_id TEXT,
          metadata_json TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name);
        CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);
      `);
    } catch (e) {
      console.warn('Analytics DB initialization warning:', e);
    }
  }
  return analyticsDbInstance;
}

export function logAnalyticsEvent(
  eventName: AnalyticsEventName,
  sessionId?: string,
  metadata?: Record<string, unknown>
): void {
  try {
    // Strictly sanitize metadata to ensure NO raw emails or PII are logged
    const sanitizedMeta: Record<string, unknown> = {};
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        if (key.toLowerCase().includes('email') || key.toLowerCase().includes('phone') || key.toLowerCase().includes('ip')) {
          continue; // Strip PII
        }
        sanitizedMeta[key] = value;
      }
    }

    const db = getAnalyticsDb();
    const stmt = db.prepare(`
      INSERT INTO analytics_events (event_name, anonymous_session_id, metadata_json, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      eventName,
      sessionId ? String(sessionId).slice(0, 64) : null,
      JSON.stringify(sanitizedMeta),
      new Date().toISOString()
    );
  } catch (err) {
    // Non-blocking logging
    console.error('Analytics log error:', err);
  }
}
