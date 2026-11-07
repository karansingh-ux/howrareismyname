import { NextResponse } from 'next/server';
import { getDatasetLeaderboard } from '@/lib/rarity';

export async function GET() {
  try {
    const data = getDatasetLeaderboard();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
      }
    });
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
