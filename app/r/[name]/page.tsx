import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { calculateNameRarity, formatDisplayName } from '@/lib/rarity';
import ResultCard from '@/components/ResultCard';
import UnknownNameCard from '@/components/UnknownNameCard';

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const result = await calculateNameRarity(decodedName);
  const displayName = formatDisplayName(decodedName);

  const regionLabel = result.region === 'US' ? 'in the US' : result.region === 'EU' ? 'in Europe' : result.region === 'GLOBAL' ? 'Worldwide' : 'in India';

  if (!result.found) {
    return {
      title: `${displayName} - Name Rarity Check`,
      description: `Check how common or rare the name ${displayName} is across official demographic and census records.`
    };
  }

  const oneInStr = result.isUltraRare ? '< 1 in 15,000,000' : `1 in ${result.oneInX?.toLocaleString('en-IN')}`;
  const rankStr = result.rank ? `#${result.rank.toLocaleString('en-IN')}` : 'Top 0.01%';

  return {
    title: `${result.name} - ${result.rarityLabel} (${oneInStr}) | How Rare Is My Name?`,
    description: `${result.name} ranks ${rankStr} (${regionLabel}). ${result.displayStatistic}`,
    openGraph: {
      title: `${result.name}: ${result.rarityLabel} (${oneInStr})`,
      description: `${result.displayStatistic} (Rank ${rankStr}). Find out how rare your name is:`,
      siteName: 'How Rare Is My Name?',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${result.name}: ${result.rarityLabel} (${oneInStr})`,
      description: `${result.displayStatistic} Check yours:`
    }
  };
}

export default async function SharedResultPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const result = await calculateNameRarity(decodedName);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="type-eyebrow text-white hover:text-white/80 transition-colors font-bold tracking-wider drop-shadow-xs"
        >
          Name Rarity
        </Link>
        <Link 
          href="/" 
          className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white type-eyebrow text-xs tracking-wider rounded-xl transition-colors shadow-xs"
        >
          Check your name
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {result.found ? (
          <ResultCard result={result} />
        ) : (
          <UnknownNameCard name={decodedName} onReset={() => {}} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 border-t border-white/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-contrast-subtle">
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
