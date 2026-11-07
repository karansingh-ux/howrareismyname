import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

export interface Subscriber {
  id: number;
  email: string;
  name_entered: string;
  normalized_name: string;
  result_rank: number | null;
  marketing_consent: number; // 0 or 1
  consent_timestamp: string | null;
  unsubscribe_token: string;
  created_at: string;
}

let subDbInstance: Database.Database | null = null;

function getSubscriberDb(): Database.Database {
  if (!subDbInstance) {
    const dbPath = path.resolve(process.cwd(), 'data/subscribers.db');
    subDbInstance = new Database(dbPath);
    subDbInstance.pragma('journal_mode = WAL');
    
    // Initialize table if it doesn't exist
    subDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS subscribers (
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
      CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
      CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers(unsubscribe_token);
    `);
  }
  return subDbInstance;
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  // Standard RFC 5322 compliant regex for web forms
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed) && trimmed.length <= 254;
}

export function subscribeUser(params: {
  email: string;
  nameEntered: string;
  normalizedName: string;
  resultRank?: number | null;
  marketingConsent: boolean;
}): { success: boolean; message: string; unsubscribeToken?: string } {
  const email = params.email.trim().toLowerCase();
  if (!validateEmail(email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const db = getSubscriberDb();
  const now = new Date().toISOString();
  const consentInt = params.marketingConsent ? 1 : 0;
  const consentTimestamp = params.marketingConsent ? now : null;

  // Check if subscriber already exists
  const existing = db.prepare('SELECT * FROM subscribers WHERE email = ?').get(email) as Subscriber | undefined;

  if (existing) {
    // Update existing record with the latest requested name and consent preferences
    const updateStmt = db.prepare(`
      UPDATE subscribers 
      SET name_entered = ?, normalized_name = ?, result_rank = ?, marketing_consent = ?, consent_timestamp = coalesce(?, consent_timestamp)
      WHERE email = ?
    `);
    updateStmt.run(
      params.nameEntered,
      params.normalizedName,
      params.resultRank ?? null,
      consentInt,
      consentTimestamp,
      email
    );
    return { 
      success: true, 
      message: 'Your report request has been updated. Result will be dispatched.',
      unsubscribeToken: existing.unsubscribe_token 
    };
  }

  const unsubscribeToken = crypto.randomBytes(24).toString('hex');

  const insertStmt = db.prepare(`
    INSERT INTO subscribers (
      email, name_entered, normalized_name, result_rank, marketing_consent, consent_timestamp, unsubscribe_token, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    email,
    params.nameEntered,
    params.normalizedName,
    params.resultRank ?? null,
    consentInt,
    consentTimestamp,
    unsubscribeToken,
    now
  );

  return {
    success: true,
    message: 'Your full name report has been requested successfully!',
    unsubscribeToken
  };
}

export function unsubscribeUser(token: string): { success: boolean; message: string } {
  if (!token || typeof token !== 'string') {
    return { success: false, message: 'Invalid unsubscribe token.' };
  }

  const db = getSubscriberDb();
  const updateStmt = db.prepare(`
    UPDATE subscribers 
    SET marketing_consent = 0 
    WHERE unsubscribe_token = ?
  `);
  const result = updateStmt.run(token.trim());

  if (result.changes === 0) {
    return { success: false, message: 'Subscription not found or already unsubscribed.' };
  }

  return { success: true, message: 'You have been successfully unsubscribed from marketing emails.' };
}
