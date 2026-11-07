import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'How Rare Is My Name? — Global & Regional Name Rarity';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0f1d',
          backgroundImage: 'radial-gradient(circle at 50% 20%, #1e3a8a 0%, #0a0f1d 75%)',
          padding: '56px 64px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 9999,
              padding: '8px 20px',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#38bdf8">
              <path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/>
            </svg>
            <span>Official Demographic Rarity Engine</span>
          </div>

          <div
            style={{
              color: '#93c5fd',
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}
          >
            1 Billion+ Records
          </div>
        </div>

        {/* Center Main Stage */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px 0'
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              marginBottom: 16,
              textTransform: 'uppercase'
            }}
          >
            How Rare Is Your Name?
          </div>

          <div
            style={{
              fontSize: 24,
              color: '#cbd5e1',
              maxWidth: 820,
              lineHeight: 1.4,
              marginBottom: 32
            }}
          >
            Calculate your exact odds and demographic percentile across India, the United States, Europe, and 180+ countries.
          </div>

          {/* Region Chips */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '10px 18px',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              <span>🇮🇳</span>
              <span>India (772M+)</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '10px 18px',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              <span>🇺🇸</span>
              <span>USA (807M+)</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '10px 18px',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              <span>🇪🇺</span>
              <span>Europe</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '10px 18px',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              <span>🌐</span>
              <span>180+ Countries</span>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: 20
          }}
        >
          <div
            style={{
              color: '#38bdf8',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.02em'
            }}
          >
            checknamerarity.vercel.app
          </div>

          <div
            style={{
              color: '#94a3b8',
              fontSize: 15,
              fontWeight: 500
            }}
          >
            Built by Karan Singh
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
