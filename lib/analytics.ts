import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

export type AnalyticsEventName =
  | 'landing_page_view'
  | 'shared_card_view'
  | 'name_submitted'
  | 'result_generated'
  | 'unknown_name'
  | 'share_clicked'
  | 'email_prompt_viewed'
  | 'email_submitted'
  | 'marketing_consent_given'
  | 'methodology_viewed';

export interface AnalyticsSummary {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    totalSearches: number;
    totalShares: number;
    viralityRate: string;
    subscribersCount: number;
    topRegion: string;
  };
  rarityBreakdown: Array<{
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  regionBreakdown: Array<{
    region: string;
    name: string;
    flag: string;
    count: number;
    percentage: number;
  }>;
  topNames: Array<{
    name: string;
    count: number;
    rarityLabel: string;
    rank?: number;
    region: string;
  }>;
  shareChannels: Array<{
    channel: string;
    count: number;
    percentage: number;
  }>;
  dailyTrend: Array<{
    date: string;
    views: number;
    searches: number;
  }>;
  recentActivity: Array<{
    id: number;
    type: 'search' | 'view' | 'share' | 'subscriber';
    title: string;
    subtitle: string;
    tag?: string;
    region?: string;
    timeAgo: string;
    timestamp: string;
  }>;
  storageEngine: 'hybrid-sqlite' | 'memory';
  generatedAt: string;
}

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
        CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(anonymous_session_id);
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

function formatRelativeTime(dateString: string): string {
  try {
    const past = new Date(dateString).getTime();
    const now = Date.now();
    const diffSec = Math.max(1, Math.floor((now - past) / 1000));

    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function getAnalyticsData(range: string = '7d'): AnalyticsSummary {
  const db = getAnalyticsDb();
  const now = new Date();
  let cutoffDate = new Date(0); // all time

  if (range === 'today') {
    cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === '24h') {
    cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (range === '7d') {
    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === '30d') {
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const cutoffIso = cutoffDate.toISOString();

  // 1. Overview counts
  const pageViewCount = (db.prepare(`
    SELECT count(*) as c FROM analytics_events 
    WHERE event_name IN ('landing_page_view', 'shared_card_view') 
    AND created_at >= ?
  `).get(cutoffIso) as { c: number })?.c || 0;

  const uniqueVisitorsCount = (db.prepare(`
    SELECT count(DISTINCT anonymous_session_id) as c FROM analytics_events 
    WHERE anonymous_session_id IS NOT NULL 
    AND created_at >= ?
  `).get(cutoffIso) as { c: number })?.c || 0;

  const searchesCount = (db.prepare(`
    SELECT count(*) as c FROM analytics_events 
    WHERE event_name IN ('result_generated', 'unknown_name') 
    AND created_at >= ?
  `).get(cutoffIso) as { c: number })?.c || 0;

  const sharesCount = (db.prepare(`
    SELECT count(*) as c FROM analytics_events 
    WHERE event_name = 'share_clicked' 
    AND created_at >= ?
  `).get(cutoffIso) as { c: number })?.c || 0;

  const subscribersCount = (db.prepare(`
    SELECT count(*) as c FROM analytics_events 
    WHERE event_name = 'email_submitted' 
    AND created_at >= ?
  `).get(cutoffIso) as { c: number })?.c || 0;

  const viralityPercent = searchesCount > 0
    ? ((sharesCount / searchesCount) * 100).toFixed(1) + '%'
    : '0.0%';

  // 2. Rarity Distribution
  const rarityRows = db.prepare(`
    SELECT metadata_json FROM analytics_events 
    WHERE event_name = 'result_generated' 
    AND created_at >= ?
    ORDER BY id DESC LIMIT 5000
  `).all(cutoffIso) as Array<{ metadata_json: string }>;

  const rarityMap: Record<string, number> = {
    'ULTRA-RARE': 0,
    'RARE': 0,
    'UNCOMMON': 0,
    'MODERATELY COMMON': 0,
    'COMMON': 0,
    'VERY COMMON': 0
  };

  const nameFreqMap: Record<string, { name: string; count: number; rarityLabel: string; rank?: number; region: string }> = {};
  const regionCountMap: Record<string, number> = { IN: 0, US: 0, EU: 0, GLOBAL: 0 };
  let totalClassified = 0;

  for (const row of rarityRows) {
    try {
      const meta = JSON.parse(row.metadata_json);
      if (meta.rarity_label && rarityMap[meta.rarity_label] !== undefined) {
        rarityMap[meta.rarity_label]++;
        totalClassified++;
      }
      if (meta.region && regionCountMap[meta.region] !== undefined) {
        regionCountMap[meta.region]++;
      }
      if (meta.normalized_name) {
        const key = meta.normalized_name.toLowerCase();
        if (!nameFreqMap[key]) {
          const capName = key.charAt(0).toUpperCase() + key.slice(1);
          nameFreqMap[key] = {
            name: capName,
            count: 0,
            rarityLabel: meta.rarity_label || 'COMMON',
            rank: meta.rank,
            region: meta.region || 'IN'
          };
        }
        nameFreqMap[key].count++;
      }
    } catch {}
  }

  const rarityColors: Record<string, string> = {
    'ULTRA-RARE': '#0a0a0a',
    'RARE': '#525252',
    'UNCOMMON': '#737373',
    'MODERATELY COMMON': '#a3a3a3',
    'COMMON': '#d4d4d4',
    'VERY COMMON': '#2563eb'
  };

  const rarityBreakdown = Object.entries(rarityMap).map(([label, count]) => ({
    label,
    count,
    percentage: totalClassified > 0 ? Math.round((count / totalClassified) * 100) : 0,
    color: rarityColors[label] || '#737373'
  }));

  // 3. Region Breakdown
  const totalRegions = Object.values(regionCountMap).reduce((a, b) => a + b, 0) || 1;
  const regionBreakdown = [
    { region: 'IN', name: 'India', flag: '🇮🇳', count: regionCountMap.IN, percentage: Math.round((regionCountMap.IN / totalRegions) * 100) },
    { region: 'US', name: 'United States', flag: '🇺🇸', count: regionCountMap.US, percentage: Math.round((regionCountMap.US / totalRegions) * 100) },
    { region: 'EU', name: 'Europe', flag: '🇪🇺', count: regionCountMap.EU, percentage: Math.round((regionCountMap.EU / totalRegions) * 100) },
    { region: 'GLOBAL', name: 'Global', flag: '🌐', count: regionCountMap.GLOBAL, percentage: Math.round((regionCountMap.GLOBAL / totalRegions) * 100) }
  ];

  const topRegionObj = [...regionBreakdown].sort((a, b) => b.count - a.count)[0];
  const topRegion = topRegionObj && topRegionObj.count > 0 ? `${topRegionObj.flag} ${topRegionObj.name}` : '🇮🇳 India';

  // 4. Top Searched Names Leaderboard
  const topNames = Object.values(nameFreqMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 5. Recent Activity Feed (Latest 25 events)
  const recentRows = db.prepare(`
    SELECT id, event_name, metadata_json, created_at 
    FROM analytics_events 
    ORDER BY id DESC LIMIT 25
  `).all() as Array<{ id: number; event_name: string; metadata_json: string; created_at: string }>;

  const recentActivity = recentRows.map(row => {
    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(row.metadata_json) || {};
    } catch {}

    const name = meta.normalized_name ? String(meta.normalized_name).charAt(0).toUpperCase() + String(meta.normalized_name).slice(1) : undefined;
    const region = meta.region ? String(meta.region) : undefined;
    const rarity = meta.rarity_label ? String(meta.rarity_label) : undefined;

    let type: 'search' | 'view' | 'share' | 'subscriber' = 'view';
    let title = 'Page Visited';
    let subtitle = 'Visitor explored the rarity calculator';
    let tag = region ? `${region}` : undefined;

    switch (row.event_name) {
      case 'landing_page_view':
        type = 'view';
        title = 'Homepage View';
        subtitle = 'New visitor arrived on site';
        break;
      case 'shared_card_view':
        type = 'view';
        title = name ? `Viewed Shared Card: ${name}` : 'Shared Card Viewed';
        subtitle = 'Arrived via social card link';
        tag = 'Social Click';
        break;
      case 'result_generated':
        type = 'search';
        title = name ? `Calculated: ${name}` : 'Name Evaluated';
        subtitle = rarity ? `${rarity} • ${region || 'IN'}` : 'Rarity calculated';
        tag = rarity;
        break;
      case 'unknown_name':
        type = 'search';
        title = name ? `Ultra-Rare Name: ${name}` : 'Ultra-Rare Lookup';
        subtitle = '0 national records found (1-of-1)';
        tag = '1-of-1';
        break;
      case 'share_clicked':
        type = 'share';
        title = name ? `Shared Card: ${name}` : 'Card Shared';
        subtitle = 'User clicked share to friends or social media';
        tag = 'Shared';
        break;
      case 'email_submitted':
        type = 'subscriber';
        title = 'New Subscriber';
        subtitle = 'Requested demographic updates and ranking shifts';
        tag = 'Subscriber';
        break;
    }

    return {
      id: row.id,
      type,
      title,
      subtitle,
      tag,
      region,
      timeAgo: formatRelativeTime(row.created_at),
      timestamp: row.created_at
    };
  });

  // 6. 7-Day Trend
  const dailyTrend: Array<{ date: string; views: number; searches: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    const views = (db.prepare(`
      SELECT count(*) as c FROM analytics_events 
      WHERE event_name IN ('landing_page_view', 'shared_card_view') 
      AND created_at LIKE ?
    `).get(`${dayStr}%`) as { c: number })?.c || 0;

    const searches = (db.prepare(`
      SELECT count(*) as c FROM analytics_events 
      WHERE event_name IN ('result_generated', 'unknown_name') 
      AND created_at LIKE ?
    `).get(`${dayStr}%`) as { c: number })?.c || 0;

    dailyTrend.push({
      date: dayLabel,
      views,
      searches
    });
  }

  // 7. Real Share Channel Breakdown from database
  const shareRows = db.prepare(`
    SELECT metadata_json FROM analytics_events 
    WHERE event_name = 'share_clicked' 
    AND created_at >= ?
  `).all(cutoffIso) as Array<{ metadata_json: string }>;

  const channelMap: Record<string, number> = {
    'Direct Link Copy': 0,
    'WhatsApp Share': 0,
    'Post on X (Twitter)': 0,
    'Instagram Story Card': 0,
    'LinkedIn Share': 0
  };

  let totalLoggedShares = 0;
  for (const sr of shareRows) {
    try {
      const meta = JSON.parse(sr.metadata_json);
      const ch = meta.channel;
      if (ch === 'whatsapp') {
        channelMap['WhatsApp Share']++;
        totalLoggedShares++;
      } else if (ch === 'twitter') {
        channelMap['Post on X (Twitter)']++;
        totalLoggedShares++;
      } else if (ch === 'instagram' || ch === 'story_card' || ch === 'image_copy') {
        channelMap['Instagram Story Card']++;
        totalLoggedShares++;
      } else if (ch === 'linkedin') {
        channelMap['LinkedIn Share']++;
        totalLoggedShares++;
      } else {
        channelMap['Direct Link Copy']++;
        totalLoggedShares++;
      }
    } catch {
      channelMap['Direct Link Copy']++;
      totalLoggedShares++;
    }
  }

  const shareChannels = Object.entries(channelMap)
    .filter(([_, count]) => count > 0)
    .map(([channel, count]) => ({
      channel,
      count,
      percentage: totalLoggedShares > 0 ? Math.round((count / totalLoggedShares) * 100) : 0
    }));

  return {
    overview: {
      totalPageViews: pageViewCount,
      uniqueVisitors: uniqueVisitorsCount,
      totalSearches: searchesCount,
      totalShares: sharesCount,
      viralityRate: viralityPercent,
      subscribersCount,
      topRegion
    },
    rarityBreakdown,
    regionBreakdown,
    topNames,
    shareChannels,
    dailyTrend,
    recentActivity,
    storageEngine: 'hybrid-sqlite',
    generatedAt: new Date().toISOString()
  };
}
