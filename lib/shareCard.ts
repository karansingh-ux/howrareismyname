import type { RarityResult } from '@/lib/rarity';

/**
 * Generates a high-resolution, viral 4:5 visual share card (1080x1350)
 * designed for Instagram Stories, Twitter, LinkedIn, and WhatsApp.
 */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bgColor: string,
  textColor: string,
  text: string
) {
  ctx.save();
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        // Truncate remaining
        const remaining = words.slice(n).join(' ');
        ctx.fillText(remaining.length > 40 ? remaining.substring(0, 37) + '...' : remaining, x, currentY);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

export function renderRarityCardCanvas(result: RarityResult): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Sky blue gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, 1350);
  grad.addColorStop(0, '#2b6cb0');
  grad.addColorStop(0.35, '#4a90e2');
  grad.addColorStop(0.7, '#7eb6ff');
  grad.addColorStop(1, '#c2d9ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1350);

  // 2. Soft atmospheric glow circles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(220, 260, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(860, 480, 300, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(320, 1120, 320, 0, Math.PI * 2);
  ctx.fill();

  // 3. Central Focal Card
  const cardX = 80;
  const cardY = 140;
  const cardW = 920;
  const cardH = 1050;
  const cardR = 44;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fill();
  ctx.restore();

  // Card Border
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 3;
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.stroke();
  ctx.restore();

  // 4. Card Header
  ctx.save();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NAME RARITY ARCHIVE', cardX + 60, cardY + 75);

  const regionLabel = result.region === 'US' ? '🇺🇸 UNITED STATES' : result.region === 'EU' ? '🇪🇺 EUROPE' : result.region === 'GLOBAL' ? '🌐 GLOBAL' : '🇮🇳 INDIA';
  drawPill(ctx, cardX + cardW - 240, cardY + 48, 180, 42, '#f1f5f9', '#1e293b', regionLabel);
  ctx.restore();

  // 5. Name Heading
  ctx.save();
  ctx.fillStyle = '#0f172a';
  // Scale font if name is very long
  const nameLen = result.name.length;
  const nameFontSize = nameLen > 12 ? 64 : nameLen > 9 ? 74 : 88;
  ctx.font = `900 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(result.name.toUpperCase(), 540, cardY + 210);
  ctx.restore();

  // 6. Rarity Tier Pill
  const tierBg = result.isUltraRare ? '#0f172a' : '#1e293b';
  drawPill(ctx, 540 - 150, cardY + 250, 300, 52, tierBg, '#ffffff', `✨ ${result.rarityLabel || 'VERIFIED'}`);

  // 7. Divider
  ctx.save();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 80, cardY + 345);
  ctx.lineTo(cardX + cardW - 80, cardY + 345);
  ctx.stroke();
  ctx.restore();

  // 8. Primary Odds Block
  ctx.save();
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR RARITY ODDS', 540, cardY + 400);

  const formattedOneIn = result.oneInX ? result.oneInX.toLocaleString('en-IN') : '15,000,000';
  const oddsString = result.isUltraRare ? '< 1 in 15,000,000' : `1 in ${formattedOneIn}`;
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 68px system-ui, -apple-system, sans-serif';
  ctx.fillText(oddsString, 540, cardY + 480);
  ctx.restore();

  // 9. Two Stats Tiles
  const formattedRank = result.rank ? result.rank.toLocaleString('en-IN') : 'Elite';
  const tileY = cardY + 540;
  const tileW = 360;
  const tileH = 145;

  // Left Tile: Rank
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, cardX + 60, tileY, tileW, tileH, 20);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX + 60, tileY, tileW, tileH, 20);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DATASET RANK', cardX + 90, tileY + 45);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 36px system-ui, -apple-system, sans-serif';
  ctx.fillText(result.rank ? `#${formattedRank}` : 'Top 0.001%', cardX + 90, tileY + 92);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('National Leaderboard', cardX + 90, tileY + 122);
  ctx.restore();

  // Right Tile: Crowd Share
  ctx.save();
  const rightTileX = cardX + cardW - 60 - tileW;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, rightTileX, tileY, tileW, tileH, 20);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  roundRect(ctx, rightTileX, tileY, tileW, tileH, 20);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CROWD SHARE', rightTileX + 30, tileY + 45);

  const crowdShareText = result.isUltraRare ? '< 0.0001%' : (result.percentage !== undefined ? `${result.percentage}%` : '< 0.0001%');
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 36px system-ui, -apple-system, sans-serif';
  ctx.fillText(crowdShareText, rightTileX + 30, tileY + 92);

  const crowdSubtext = result.isUltraRare ? 'Zero duplicates' : (result.count ? `${result.count.toLocaleString('en-IN')} people share this` : '1-of-1 name');
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 16px system-ui, -apple-system, sans-serif';
  ctx.fillText(crowdSubtext, rightTileX + 30, tileY + 122);
  ctx.restore();

  // 10. Fun Narrative Callout
  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.font = 'italic 500 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  const explanation = result.explanation || result.displayStatistic || 'Tested against verified voter and civil demographic registries.';
  wrapText(ctx, `“${explanation}”`, 540, cardY + 755, 760, 36, 3);
  ctx.restore();

  // 11. Attribution footer in card
  ctx.save();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Tested against 772M+ verified official records', 540, cardY + 975);
  ctx.restore();

  // 12. Bottom Out-of-card branding
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillText('HOWRAREISMYNAME.IN • BUILT BY KARAN SINGH', 540, 1265);
  ctx.restore();

  return canvas;
}

/**
 * Downloads the card as a high-resolution PNG image.
 */
export async function downloadRarityCardImage(result: RarityResult): Promise<void> {
  const canvas = renderRarityCardCanvas(result);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${result.name.toLowerCase()}-rarity-card.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies the card PNG image directly to the clipboard so it can be pasted
 * immediately into X (Twitter), LinkedIn, WhatsApp Web, or Discord.
 */
export async function copyRarityCardImage(result: RarityResult): Promise<boolean> {
  const canvas = renderRarityCardCanvas(result);
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          resolve(true);
          return;
        }
      } catch {
        // Fallback to downloading
      }
      resolve(false);
    }, 'image/png');
  });
}

/**
 * Shares the card directly with image file attached on mobile devices
 * (supporting Instagram Stories, WhatsApp, Messages, Twitter, etc.).
 */
export async function shareRarityCardNative(result: RarityResult, shareUrl: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  const canvas = renderRarityCardCanvas(result);
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      const file = new File([blob], `${result.name.toLowerCase()}-rarity.png`, {
        type: 'image/png'
      });

      const formattedOneIn = result.oneInX ? result.oneInX.toLocaleString('en-IN') : '15,000,000';
      const shareText = `Turns out my name (${result.name}) is ${result.isUltraRare ? 'literally 1-of-1' : `1 in ${formattedOneIn}`}! Check yours: ${shareUrl}`;

      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `How Rare Is ${result.name}?`,
            text: shareText
          });
          resolve(true);
          return;
        }

        // Fallback share without file
        await navigator.share({
          title: `How Rare Is ${result.name}?`,
          text: shareText,
          url: shareUrl
        });
        resolve(true);
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          resolve(true);
          return;
        }
        resolve(false);
      }
    }, 'image/png');
  });
}
