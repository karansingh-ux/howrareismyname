import { NextRequest, NextResponse } from 'next/server';
import { calculateNameRarity } from '@/lib/rarity';
import { logAnalyticsEvent } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name') || '';
    const rawRegion = (searchParams.get('region') || 'IN').toUpperCase();
    const region = (['IN', 'US', 'EU', 'GLOBAL'].includes(rawRegion) ? rawRegion : 'IN') as 'IN' | 'US' | 'EU' | 'GLOBAL';
    const sessionId = searchParams.get('sid') || undefined;

    if (!name.trim()) {
      return NextResponse.json(
        { error: 'Name parameter is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 80) {
      return NextResponse.json(
        { error: 'Name cannot exceed 80 characters' },
        { status: 400 }
      );
    }

    // Clean control characters or null bytes
    const sanitizedName = name.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Invalid name provided' },
        { status: 400 }
      );
    }

    logAnalyticsEvent('name_submitted', sessionId, {
      name_length: name.trim().length,
      has_whitespace: name.includes(' '),
      region
    });

    const result = await calculateNameRarity(sanitizedName, region);

    if (result.found) {
      logAnalyticsEvent('result_generated', sessionId, {
        normalized_name: result.normalizedName,
        rarity_label: result.rarityLabel,
        rank: result.rank,
        region
      });
    } else {
      logAnalyticsEvent('unknown_name', sessionId, {
        normalized_name: result.normalizedName,
        region
      });
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('API /api/rarity error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing name rarity' },
      { status: 500 }
    );
  }
}
