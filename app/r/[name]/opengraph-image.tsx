import { ImageResponse } from 'next/og';
import { calculateNameRarity, formatDisplayName } from '@/lib/rarity';

export const runtime = 'nodejs';
export const alt = 'Name Rarity Card';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const result = await calculateNameRarity(decodedName);
  const displayName = formatDisplayName(decodedName);

  const formattedOneIn = result.oneInX ? result.oneInX.toLocaleString('en-IN') : '15,000,000';
  const oddsText = result.isUltraRare ? '< 1 in 15,000,000' : `1 in ${formattedOneIn}`;
  const rankText = result.rank ? `#${result.rank.toLocaleString('en-IN')}` : 'Top 0.01%';
  const nameText = result.name || displayName || 'Name Check';
  const nameFontSize = nameText.length > 20 ? 44 : nameText.length > 12 ? 60 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#fafafa',
          padding: '60px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#525252'
            }}
          >
            How Rare Is My Name?
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#171717',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: 9999,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            {result.rarityLabel}
          </div>
        </div>

        {/* Center Focal Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '2px solid #e5e5e5',
            borderRadius: 32,
            padding: '40px 60px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
          }}
        >
          <div
            style={{
              fontSize: nameFontSize,
              fontWeight: 800,
              letterSpacing: '-0.06em',
              textTransform: 'uppercase',
              color: '#0a0a0a',
              lineHeight: 1.05,
              marginBottom: 16,
              textAlign: 'center',
              maxWidth: 900,
              overflow: 'hidden'
            }}
          >
            {nameText}
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#171717',
              marginBottom: 8
            }}
          >
            {oddsText}
          </div>

          <div
            style={{
              fontSize: 20,
              color: '#737373',
              fontWeight: 500
            }}
          >
            {result.rank ? `Ranked ${rankText} nationwide on the leaderboard` : 'Certified ultra-rare on the national leaderboard'}
          </div>
        </div>

        {/* Footer Attribution */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, color: '#737373', fontWeight: 500 }}>
            Tested against 772M+ verified public records
          </div>
          <div style={{ fontSize: 16, color: '#171717', fontWeight: 700 }}>
            howrareismyname.in
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
