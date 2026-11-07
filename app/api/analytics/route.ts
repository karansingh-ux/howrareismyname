import { NextRequest, NextResponse } from 'next/server';
import { logAnalyticsEvent, AnalyticsEventName } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, sessionId, metadata } = body;

    const validEvents: AnalyticsEventName[] = [
      'landing_page_view',
      'name_submitted',
      'result_generated',
      'unknown_name',
      'share_clicked',
      'email_prompt_viewed',
      'email_submitted',
      'marketing_consent_given'
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
