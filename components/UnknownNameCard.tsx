'use client';

import React, { useState } from 'react';
import type { RarityResult } from '@/lib/rarity';
import { downloadRarityCardImage, copyRarityCardImage } from '@/lib/shareCard';
import MethodologyModal from './MethodologyModal';

interface UnknownNameCardProps {
  name: string;
  onReset?: () => void;
}

// Fallback copy helper
async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);
    return success;
  } catch {
    return false;
  }
}

export default function UnknownNameCard({ name, onReset }: UnknownNameCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);

  const cleanName = name || 'Your Name';
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${encodeURIComponent(cleanName)}`
    : `https://howrareismyname.in/r/${encodeURIComponent(cleanName)}`;

  const ultraRareResult: RarityResult = {
    found: true,
    name: cleanName,
    normalizedName: cleanName.toLowerCase(),
    region: 'IN',
    rarityLabel: 'ULTRA-RARE',
    isUltraRare: true,
    rank: 1,
    totalNamesInDataset: 267122,
    count: 0,
    totalDatasetRecords: 772194503,
    frequency: 0,
    percentage: 0,
    oneInX: 15000000,
    displayStatistic: 'Out of 772M+ verified official records, zero duplicates found. Literally 1-of-1.',
    rankStatement: 'Top 0.001% (Certified 1-of-1 Ultra Rare)',
    explanation: 'Certified shiny Pokémon. If someone else ever pops up with your exact name, you are either related or they copied your homework. You own this name outright.',
    confidenceLevel: 'high',
    source: {
      name: 'Indian Electoral Rolls (Harvard Dataverse)',
      doi: 'doi:10.7910/DVN/WZGJBM',
      url: 'https://doi.org/10.7910/DVN/WZGJBM',
      authors: 'Gaurav Sood, Rajashekar Chintalapati, Suriyan Laohaprapanon',
      yearRange: '1887 to 2017 (voter birth years)',
      geography: '31 Indian States and Union Territories',
      license: 'CC0-1.0 Universal',
      methodology: 'Empirical aggregation of verified voter registration records.',
      sampleDescription: '772,194,503 registered adult voter records across 31 Indian states and union territories.',
      totalVoters: 772194503,
      totalUniqueNames: 267122
    }
  };

  const shareText = `My name (${cleanName}) broke the dataset (< 1 in 15M rarity)! Zero duplicates found in 772M+ records. Check yours:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const handleDownloadCard = async () => {
    try {
      await downloadRarityCardImage(ultraRareResult);
      setCardSaved(true);
      setTimeout(() => setCardSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCardImage = async () => {
    try {
      const ok = await copyRarityCardImage(ultraRareResult);
      if (ok) {
        setCardCopied(true);
        setTimeout(() => setCardCopied(false), 3000);
      } else {
        await downloadRarityCardImage(ultraRareResult);
        setCardSaved(true);
        setTimeout(() => setCardSaved(false), 3000);
      }
    } catch {
      await downloadRarityCardImage(ultraRareResult);
      setCardSaved(true);
      setTimeout(() => setCardSaved(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    const waText = `My name (${cleanName}) broke the dataset (< 1 in 15M rarity)! Zero duplicates found in 772M+ records. Check yours: ${shareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    const success = await copyText(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center animate-in fade-in zoom-in-98 duration-300">
      <div className="mb-6">
        <h1 className="type-hero text-contrast-white uppercase mb-3 break-words">
          {cleanName}
        </h1>
        <div className="inline-flex flex-wrap items-center justify-center gap-2">
          <span className="type-eyebrow px-3.5 sm:px-4 py-1.5 rounded-full bg-neutral-950 text-white font-bold tracking-wider shadow-sm">
            ✨ 1-OF-1 ULTRA RARE
          </span>
          <span className="type-eyebrow px-3 py-1.5 rounded-full bg-white/90 text-neutral-800 border border-white/60 shadow-xs">
            Collector&apos;s Edition
          </span>
        </div>
      </div>

      {/* Main Stat Card */}
      <div className="my-6 sm:my-8 py-5 sm:py-7 px-4 sm:px-5 bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm">
        <p className="type-eyebrow text-neutral-500 mb-2">
          Your Odds
        </p>
        <div className="type-stat-number text-neutral-950 mb-2">
          &lt; 1 in 15,000,000
        </div>
        <p className="type-body text-xs sm:text-sm text-neutral-600 max-w-md mx-auto font-medium leading-relaxed">
          You broke our dataset in the best way possible. Out of 772M+ verified official records, not a single person shares this exact name.
        </p>
      </div>

      {/* 3 Quick Reality Tiles */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 text-center sm:text-left">
        <div className="p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border border-white/40 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="type-eyebrow text-neutral-500 text-[10px] sm:text-xs truncate">Leaderboard</div>
          <div className="type-tile-stat text-neutral-950 mt-1 text-sm sm:text-base md:text-lg truncate">Top 0.001%</div>
          <div className="type-body text-[10.5px] sm:text-xs text-neutral-500 mt-1 truncate">God-tier rarity</div>
        </div>
        <div className="p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border border-white/40 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="type-eyebrow text-neutral-500 text-[10px] sm:text-xs truncate">Crowd Share</div>
          <div className="type-tile-stat text-neutral-950 mt-1 text-sm sm:text-base md:text-lg truncate">&lt; 0.0001%</div>
          <div className="type-body text-[10.5px] sm:text-xs text-neutral-500 mt-1 truncate">Zero duplicates</div>
        </div>
        <div className="p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border border-white/40 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="type-eyebrow text-neutral-500 text-[10px] sm:text-xs truncate">Flex Level</div>
          <div className="type-tile-stat text-neutral-950 mt-1 text-sm sm:text-base md:text-lg truncate">1-of-1</div>
          <div className="type-body text-[10.5px] sm:text-xs text-neutral-500 mt-1 truncate">Only you</div>
        </div>
      </div>

      <p className="type-body text-xs sm:text-sm text-contrast-white mb-6 sm:mb-7 max-w-md mx-auto font-medium leading-relaxed px-2">
        Certified shiny Pokémon. If someone else ever pops up with your exact name, you&apos;re either related or they copied your homework. You own this name outright.
      </p>

      {/* Visual Story Card Action Tray */}
      <div className="w-full mb-6 p-4 sm:p-5 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-left">
          <div>
            <p className="type-eyebrow text-neutral-900 font-bold tracking-wider text-xs">
              1-of-1 Ultra Rare Story Card
            </p>
            <p className="type-body text-[11px] text-neutral-500 mt-0.5">
              High-res graphic card ready for Instagram Stories, X, WhatsApp & LinkedIn
            </p>
          </div>
          <span className="text-xl">✨</span>
        </div>

        {/* Story Card Download & Copy Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={handleDownloadCard}
            className="py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl type-eyebrow text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{cardSaved ? '✓ Card Saved!' : 'Save Story Card'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCardImage}
            className="py-2.5 px-3 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200/90 rounded-xl type-eyebrow text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{cardCopied ? '✓ Image Copied!' : 'Copy Card Image'}</span>
          </button>
        </div>

        {/* Direct Social Channels Row */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-100">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="py-2 px-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-800 type-eyebrow text-[10px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Share to WhatsApp"
          >
            <svg className="w-4 h-4 fill-current text-[#25D366]" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span>WhatsApp</span>
          </button>

          {/* X / Twitter */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={async () => {
              try { await copyRarityCardImage(ultraRareResult); } catch {}
            }}
            className="py-2 px-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-800 type-eyebrow text-[10px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Flex on X (Image copied to clipboard)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Flex on X</span>
          </a>

          {/* Copy Direct Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2 px-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-800 type-eyebrow text-[10px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Copy Direct Link"
          >
            <svg className="w-4 h-4 shrink-0 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2.5 mb-6">
        <button
          onClick={() => {
            if (onReset) {
              onReset();
            } else {
              window.location.href = '/';
            }
          }}
          className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 active:scale-98 text-neutral-800 type-eyebrow text-xs tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          Check another name
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="type-eyebrow text-xs text-contrast-white hover:underline underline-offset-4 tracking-[0.05em] transition-all cursor-pointer"
        >
          Wait, where&apos;s this data from?
        </button>
      </div>

      <MethodologyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
