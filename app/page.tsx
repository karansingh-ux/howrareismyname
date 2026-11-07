'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { RarityResult } from '@/lib/rarity';
import ResultCard from '@/components/ResultCard';
import UnknownNameCard from '@/components/UnknownNameCard';
import HorizontalRegionSelector from '@/components/HorizontalRegionSelector';

const REGIONS: Array<{ id: 'IN' | 'US' | 'EU' | 'GLOBAL'; name: string; flag: string; sourceSummary: string }> = [
  { id: 'IN', name: 'India', flag: '🇮🇳', sourceSummary: 'Tested against 772M+ verified voter records across India.' },
  { id: 'US', name: 'United States', flag: '🇺🇸', sourceSummary: 'Tested against 807M+ official birth records across the US.' },
  { id: 'EU', name: 'Europe', flag: '🇪🇺', sourceSummary: 'Tested against European civil registries and archives.' },
  { id: 'GLOBAL', name: 'Global', flag: '🌐', sourceSummary: 'Tested against verified demographic records across 180+ countries.' }
];

export default function HomePage() {
  const [nameInput, setNameInput] = useState('');
  const [region, setRegion] = useState<'IN' | 'US' | 'EU' | 'GLOBAL'>('IN');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RarityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const currentRegion = REGIONS.find(r => r.id === region) || REGIONS[0];

  useEffect(() => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'landing_page_view',
          sessionId
        })
      });
    } catch {
      // Non-blocking
    }
  }, [sessionId]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) {
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const startTime = Date.now();
      const res = await fetch(`/api/rarity?name=${encodeURIComponent(cleanName)}&region=${region}&sid=${encodeURIComponent(sessionId)}`);
      
      if (!res.ok) {
        throw new Error('Failed to query name statistics');
      }

      const data: RarityResult = await res.json();
      
      // Ensure a brief satisfying reveal micro-animation (minimum 350ms)
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 350 - elapsed);
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
      }, delay);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch results at this moment. Please check your connection.');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setNameInput('');
    setError(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col justify-between bg-transparent text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Top spacer for optical balance on tablet/desktop to ensure true vertical centering */}
      <div className="hidden sm:block w-full max-w-4xl mx-auto h-[68px] pointer-events-none" aria-hidden="true" />

      {/* Main Experience View */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-12 w-full">
        {!result && !isLoading && (
          <div className="w-full max-w-xl mx-auto text-center animate-in fade-in duration-300">
            {/* Hero Title (h1) */}
            <h1 className="type-hero text-white mb-3 sm:mb-4 drop-shadow-xs max-w-xl mx-auto">
              How rare is your name?
            </h1>

            {/* Subtle, Compact & Playful Horizontal Expanding Region Selector */}
            <HorizontalRegionSelector
              currentRegionId={region}
              onSelectRegion={(newRegion) => setRegion(newRegion)}
            />

            {/* Centered Form */}
            <form onSubmit={handleSearch} className="space-y-3 sm:space-y-3.5 max-w-md mx-auto w-full">
              <div className="relative w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Type your first name..."
                  autoFocus
                  required
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-0 rounded-2xl text-center type-input-prominent text-neutral-950 placeholder:text-neutral-400 placeholder:text-base sm:placeholder:text-lg focus:outline-none focus:ring-2 focus:ring-white/80 transition-all shadow-md"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 sm:py-4 bg-neutral-950 hover:bg-neutral-800 active:scale-99 text-white type-eyebrow text-xs tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
              >
                Reveal my rarity
              </button>

              {error && (
                <p className="type-body text-xs text-red-500 mt-2 font-semibold drop-shadow-xs">{error}</p>
              )}

              {/* Single short, meaningful line below CTA */}
              <p className="type-body text-xs text-contrast-white pt-2 font-medium">
                {currentRegion.sourceSummary}
              </p>
            </form>
          </div>
        )}

        {/* Calculating Reveal Animation */}
        {isLoading && (
          <div className="w-full max-w-sm mx-auto text-center py-16 animate-in fade-in duration-200">
            <div className="w-12 h-12 mx-auto mb-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="type-eyebrow text-contrast-white">
              Crunching the numbers...
            </p>
            <p className="type-body text-xs text-contrast-subtle mt-1.5 font-medium">
              {region === 'IN' && 'Checking your name across 772M+ real people...'}
              {region === 'US' && 'Scanning 807M+ US records...'}
              {region === 'EU' && 'Checking European registries...'}
              {region === 'GLOBAL' && 'Scanning international demographic databases...'}
            </p>
          </div>
        )}

        {/* Result View */}
        {result && !isLoading && (
          result.found ? (
            <ResultCard result={result} onReset={handleReset} sessionId={sessionId} />
          ) : (
            <UnknownNameCard name={nameInput} onReset={handleReset} />
          )
        )}
      </main>

      {/* Minimal Typography-led Footer with Subtle Creator Branding */}
      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 border-t border-white/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-contrast-subtle text-center sm:text-left">
        <p>
          © {new Date().getFullYear()} Name Rarity • Built by{' '}
          <a
            href="https://www.instagram.com/karansinghh.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-contrast-white hover:underline font-medium"
          >
            Karan Singh
          </a>
        </p>
        <div className="flex items-center gap-4">
          <Link href="/methodology" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Methodology & Sources
          </Link>
          <Link href="/privacy" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
