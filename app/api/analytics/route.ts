import { NextRequest, NextResponse } from 'next/server';
import { logAnalyticsEvent, getAnalyticsData, AnalyticsEventName } from '@/lib/analytics';
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, sessionId, metadata } = body;

    const validEvents: AnalyticsEventName[] = [
      'landing_page_view',
      'shared_card_view',
      'name_submitted',
      'result_generated',
      'unknown_name',
      'share_clicked',
      'email_prompt_viewed',
      'email_submitted',
      'marketing_consent_given',
      'methodology_viewed'
    ];

    if (!validEvents.includes(eventName)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    logAnalyticsEvent(eventName, sessionId, metadata);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '7d';
    const format = searchParams.get('format');

    // Handle CSV Export
    if (format === 'csv') {
      try {
        const dbPath = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
          ? path.join(os.tmpdir(), 'analytics.db')
          : path.resolve(process.cwd(), 'data/analytics.db');
        const db = new Database(dbPath, { readonly: true });
        const rows = db.prepare(`
          SELECT id, event_name, anonymous_session_id, metadata_json, created_at 
          FROM analytics_events 
          ORDER BY id DESC LIMIT 5000
        `).all() as Array<{ id: number; event_name: string; anonymous_session_id: string | null; metadata_json: string; created_at: string }>;

        let csv = 'ID,Event Name,Session ID,Metadata,Created At\n';
        for (const r of rows) {
          const cleanMeta = (r.metadata_json || '').replace(/"/g, '""');
          csv += `${r.id},"${r.event_name}","${r.anonymous_session_id || ''}","${cleanMeta}","${r.created_at}"\n`;
        }

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="name-rarity-analytics-${new Date().toISOString().slice(0, 10)}.csv"`
          }
        });
      } catch (err) {
        console.error('CSV export error:', err);
        return NextResponse.json({ error: 'Unable to export CSV' }, { status: 500 });
      }
    }

    const data = getAnalyticsData(range);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
