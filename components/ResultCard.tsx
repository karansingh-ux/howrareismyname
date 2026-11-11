'use client';

import React, { useState } from 'react';
import type { RarityResult } from '@/lib/rarity';
import { downloadRarityCardImage, copyRarityCardImage } from '@/lib/shareCard';
import MethodologyModal from './MethodologyModal';

interface ResultCardProps {
  result: RarityResult;
  onReset?: () => void;
  sessionId?: string;
}

// Fallback copy helper that works across all desktop and mobile browsers
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

export default function ResultCard({ result, onReset, sessionId }: ResultCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);
  const [linkedInCopied, setLinkedInCopied] = useState(false);

  const formattedOneIn = result.oneInX ? result.oneInX.toLocaleString('en-IN') : '';
  const formattedRank = result.rank ? result.rank.toLocaleString('en-IN') : '';
  const formattedCount = result.count ? result.count.toLocaleString('en-IN') : '';
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${encodeURIComponent(result.name)}`
    : `https://howrareismyname.in/r/${encodeURIComponent(result.name)}`;

  const xPostText = result.isUltraRare
    ? `Turns out my name (${result.name}) is literally 1-of-1 (< 1 in 15M rarity)! Zero duplicates found in 772M+ records. Check yours:`
    : `Turns out my name (${result.name}) is 1 in ${formattedOneIn}! (${result.rarityLabel}). Tested against 772M+ official records. Check yours:`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xPostText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const trackShare = (channel: string) => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'share_clicked',
          sessionId,
          metadata: { name: result.normalizedName, rank: result.rank, channel }
        })
      });
    } catch {}
  };

  const handleDownloadCard = async () => {
    trackShare('story_card');
    try {
      await downloadRarityCardImage(result);
      setCardSaved(true);
      setTimeout(() => setCardSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCardImage = async () => {
    trackShare('image_copy');
    try {
      const ok = await copyRarityCardImage(result);
      if (ok) {
        setCardCopied(true);
        setTimeout(() => setCardCopied(false), 3000);
      } else {
        await downloadRarityCardImage(result);
        setCardSaved(true);
        setTimeout(() => setCardSaved(false), 3000);
      }
    } catch {
      await downloadRarityCardImage(result);
      setCardSaved(true);
      setTimeout(() => setCardSaved(false), 3000);
    }
  };

  const handleLinkedInShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    trackShare('linkedin');
    const linkedInPost = result.isUltraRare
      ? `Turns out my name (${result.name}) is literally 1-of-1 (< 1 in 15M rarity)! Zero duplicates found out of 772M+ records. Check your name rarity: ${shareUrl}`
      : `Turns out my name (${result.name}) is 1 in ${formattedOneIn}! (${result.rarityLabel}). Tested against 772M+ official records. Check yours: ${shareUrl}`;

    await copyText(linkedInPost);
    try {
      await copyRarityCardImage(result);
    } catch {}

    setLinkedInCopied(true);
    setTimeout(() => setLinkedInCopied(false), 3000);

    // Open LinkedIn share dialog in a centered popup
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleInstagramShare = async () => {
    trackShare('instagram');
    const igCaption = result.isUltraRare
      ? `🏷️ Name Check: ${result.name} is literally 1-of-1 (< 1 in 15M rarity)! Zero duplicates out of 772M+ verified records. How rare is yours? Check at ${shareUrl}`
      : `🏷️ Name Check: ${result.name} is ${result.rarityLabel} (1 in ${formattedOneIn})! Tested against 772M+ official records. How rare is yours? Check at ${shareUrl}`;

    await copyText(igCaption);
    try {
      await downloadRarityCardImage(result);
    } catch {}

    setInstagramCopied(true);
    setTimeout(() => setInstagramCopied(false), 3500);

    // Open Instagram in a new tab so user can upload story/post
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppShare = () => {
    trackShare('whatsapp');
    const waText = result.isUltraRare
      ? `Turns out my name (${result.name}) is literally 1-of-1 (< 1 in 15M rarity)! Zero duplicates found in 772M+ records. Check yours: ${shareUrl}`
      : `Turns out my name (${result.name}) is 1 in ${formattedOneIn}! (${result.rarityLabel}). Tested against 772M+ official records. Check yours: ${shareUrl}`;
    
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    trackShare('link_copy');

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `How Rare Is ${result.name}?`,
          text: `Turns out my name (${result.name}) is ${result.isUltraRare ? '1-of-1' : `1 in ${formattedOneIn}`}!`,
          url: shareUrl
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    const success = await copyText(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getRarityBadgeStyle = (label?: string) => {
    switch (label) {
      case 'ULTRA-RARE':
        return 'bg-neutral-900 text-white ring-2 ring-neutral-400 font-extrabold';
      case 'VERY COMMON':
        return 'bg-neutral-900 text-white';
      case 'COMMON':
        return 'bg-neutral-800 text-neutral-100';
      case 'MODERATELY COMMON':
        return 'bg-neutral-700 text-neutral-100';
      case 'UNCOMMON':
        return 'bg-neutral-200 text-neutral-800';
      case 'RARE':
        return 'bg-neutral-100 text-neutral-900 border border-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center animate-in fade-in zoom-in-98 duration-300">
      {/* Name and Rarity Badge */}
      <div className="mb-6">
        {/* Hero Title (h1) */}
        <h1 className="type-hero text-white uppercase mb-3 drop-shadow-xs break-words">
          {result.name}
        </h1>

        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          <span className={`type-eyebrow px-3.5 sm:px-4 py-1.5 rounded-full ${getRarityBadgeStyle(result.rarityLabel)}`}>
            {result.rarityLabel}
          </span>
          {result.region && (
            <span className="type-eyebrow px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
              {result.region === 'IN' ? '🇮🇳 India' : result.region === 'US' ? '🇺🇸 United States' : result.region === 'EU' ? '🇪🇺 Europe' : '🌐 Global'}
            </span>
          )}
        </div>

        {result.matchedVariant && result.matchedVariant.toLowerCase() !== result.name.toLowerCase() && (
          <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-xs text-neutral-700">
            <span className="text-neutral-400">Root form:</span>
            <strong className="font-semibold text-neutral-900">{result.matchedVariant}</strong>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">• Custom Drop</span>
          </div>
        )}
      </div>

      {/* Primary Key Statistic */}
      <div className="my-6 sm:my-8 py-5 sm:py-7 px-4 sm:px-5 bg-neutral-50 border border-neutral-200/80 rounded-2xl shadow-sm">
        {/* Eyebrow & Tag: 600, 11px to 12px, +0.08em (wide), uppercase */}
        <p className="type-eyebrow text-neutral-500 mb-2">
          Your Odds
        </p>
        {/* Big Numbers / Stats */}
        <div className="type-stat-number text-neutral-950 mb-2">
          {result.isUltraRare ? '< 1 in 15,000,000' : `1 in ${formattedOneIn}`}
        </div>
        {/* Body & Paragraphs */}
        <p className="type-body text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
          {result.displayStatistic}
        </p>
      </div>

      {/* Top Countries if Global / External Dynamic */}
      {result.topCountries && result.topCountries.length > 0 && (
        <div className="mb-6 p-5 bg-white border border-neutral-200 rounded-2xl text-left">
          <p className="type-eyebrow text-neutral-500 mb-3">
            Where You&apos;re Popular
          </p>
          <div className="flex flex-wrap gap-2">
            {result.topCountries.slice(0, 5).map((c) => (
              <span key={c.countryCode} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200/80 rounded-lg text-xs font-medium text-neutral-800">
                <span className="font-semibold">{c.countryName}</span>
                <span className="text-neutral-500 tabular-nums">{Math.round(c.probability * 100)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Contextual Stats */}
      {(() => {
        const genderInfo = result.genderBreakdown ? (() => {
          const f = result.genderBreakdown.femalePercent;
          const m = result.genderBreakdown.malePercent;
          if (Math.abs(f - m) < 1) {
            return {
              stat: '50% Split',
              tag: 'Equal',
              subtext: '50/50 balanced split'
            };
          }
          const isMale = m >= f;
          const dominantPercent = isMale ? m : f;
          const minorityPercent = isMale ? f : m;
          const dominantGender = isMale ? 'Male' : 'Female';
          const minorityGender = isMale ? 'Female' : 'Male';

          // When sample size is small (< 100), give transparent sample context
          const isSmallSample = typeof result.count === 'number' && result.count > 0 && result.count < 100;
          const subtext = isSmallSample
            ? `Sample: ${result.count} voters (${result.genderBreakdown?.maleCount ?? m}M / ${result.genderBreakdown?.femaleCount ?? f}F)`
            : `${minorityPercent}% ${minorityGender} crowd`;

          return {
            stat: `${dominantPercent}%`,
            tag: dominantGender,
            subtext
          };
        })() : null;

        const totalNamesK = Math.round(result.totalNamesInDataset / 1000);

        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 text-left">
            {/* Rarity Ranking Card */}
            <div className="p-3 sm:p-4 bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="type-eyebrow text-neutral-500">Name Rank</div>
                <div className="type-tile-stat text-neutral-950 mt-1 truncate">
                  {result.rank ? `#${formattedRank}` : 'Top 0.001%'}
                </div>
              </div>
              <div className="type-body text-[11px] sm:text-xs text-neutral-500 mt-1 sm:mt-1.5 truncate">
                {result.rank ? `out of ${totalNamesK}k names` : 'Leaderboard elite'}
              </div>
            </div>

            {/* Sample Share Card */}
            <div className="p-3 sm:p-4 bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="type-eyebrow text-neutral-500">Crowd Share</div>
                <div className="type-tile-stat text-neutral-950 mt-1 truncate">
                  {result.isUltraRare || !result.percentage || result.percentage < 0.0001 ? '< 0.0001%' : `${result.percentage}%`}
                </div>
              </div>
              <div className="type-body text-[11px] sm:text-xs text-neutral-500 mt-1 sm:mt-1.5 truncate">
                {result.isUltraRare ? 'Virtually 1-of-1' : (result.count !== undefined ? `${formattedCount} people share this` : '< 5 people found')}
              </div>
            </div>

            {/* Demographics / Gender Card */}
            {genderInfo ? (
              <div className="p-3 sm:p-4 bg-white border border-neutral-200 rounded-xl overflow-hidden col-span-2 sm:col-span-1 flex flex-col justify-between">
                <div>
                  <div className="type-eyebrow text-neutral-500">Gender Split</div>
                  <div className="type-tile-stat text-neutral-950 mt-1 flex items-baseline gap-1.5">
                    <span>{genderInfo.stat}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {genderInfo.tag}
                    </span>
                  </div>
                </div>
                <div className="type-body text-[11px] sm:text-xs text-neutral-500 mt-1 sm:mt-1.5 truncate">
                  {genderInfo.subtext}
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4 bg-white border border-neutral-200 rounded-xl overflow-hidden col-span-2 sm:col-span-1 flex flex-col justify-between">
                <div>
                  <div className="type-eyebrow text-neutral-500">Demographic Status</div>
                  <div className="type-tile-stat text-neutral-950 mt-1 truncate">
                    {result.isUltraRare ? "Collector's Edition" : (result.originDescription || 'Distinctive')}
                  </div>
                </div>
                <div className="type-body text-[11px] sm:text-xs text-neutral-500 mt-1 sm:mt-1.5 truncate">
                  {result.isUltraRare ? '0 registry duplicates' : 'Verified given name'}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Narrative explanation */}
      {result.explanation && (
        <p className="type-body text-xs sm:text-sm text-white mb-6 sm:mb-7 max-w-lg mx-auto font-medium drop-shadow-xs leading-relaxed px-2">
          {result.explanation}
        </p>
      )}

      {/* Visual Story Card Action Tray */}
      <div className="w-full mb-6 p-4 sm:p-5 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-left">
          <div>
            <p className="type-eyebrow text-neutral-900 font-bold tracking-wider text-xs">
              Visual Rarity Card
            </p>
            <p className="type-body text-[11px] text-neutral-500 mt-0.5">
              High-res visual graphic ready for Instagram, X, WhatsApp & LinkedIn
            </p>
          </div>
          <span className="text-xl">📸</span>
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
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-neutral-100">
          {/* Instagram */}
          <button
            type="button"
            onClick={handleInstagramShare}
            className="py-2 px-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-800 type-eyebrow text-[10px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Saves card & opens Instagram"
          >
            <svg className="w-4 h-4 fill-current text-[#e1306c]" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>{instagramCopied ? 'Saved!' : 'Instagram'}</span>
          </button>

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
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={async () => {
              trackShare('twitter');
              try { await copyRarityCardImage(result); } catch {}
            }}
            className="py-2 px-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-800 type-eyebrow text-[10px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Post on X (Image copied to clipboard)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Post on X</span>
          </a>

          {/* LinkedIn */}
          <button
            type="button"
            onClick={handleLinkedInShare}
            className="py-2 px-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-800 type-eyebrow text-[10px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Share on LinkedIn (Post text & image copied)"
          >
            <svg className="w-4 h-4 fill-current text-[#0a66c2]" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            <span>{linkedInCopied ? 'Copied!' : 'LinkedIn'}</span>
          </button>
        </div>
      </div>

      {/* Primary Action Buttons (Copy Link & Check Friend's Name) */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2.5 mb-6">
        <button
          onClick={handleShare}
          className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-neutral-950 hover:bg-neutral-800 active:scale-98 text-white type-eyebrow text-xs tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Direct Link'}</span>
        </button>

        <button
          onClick={() => {
            if (onReset) {
              onReset();
            } else {
              window.location.href = '/';
            }
          }}
          className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 bg-neutral-100 hover:bg-neutral-200 active:scale-98 text-neutral-800 type-eyebrow text-xs tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          Check a friend&apos;s name
        </button>
      </div>

      {/* Attribution Link */}
      <div className="text-center mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="type-eyebrow text-xs text-contrast-white hover:underline underline-offset-4 tracking-[0.05em] transition-all cursor-pointer"
        >
          Wait, where&apos;s this data from?
        </button>
      </div>

      {/* Methodology Modal */}
      <MethodologyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        region={result.region}
        source={result.source}
      />
    </div>
  );
}
