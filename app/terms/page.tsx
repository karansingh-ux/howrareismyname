import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | How Rare Is My Name?',
  description: 'Terms of service and fair use guidelines for How Rare Is My Name.'
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent text-neutral-900">
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="type-eyebrow text-contrast-white hover:opacity-85 transition-opacity font-bold tracking-wider"
        >
          Name Rarity
        </Link>
        <Link 
          href="/" 
          className="px-3.5 py-1.5 bg-white/90 hover:bg-white text-neutral-900 rounded-full text-xs font-semibold shadow-xs transition-all"
        >
          Check a name
        </Link>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4 drop-shadow-xs">
          Terms of Use
        </h1>
        <p className="text-xs text-white/80 mb-8 font-medium">
          Last updated: September 2026
        </p>

        <div className="space-y-8 text-sm text-white/90 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white drop-shadow-xs">1. Statistical & Educational Purpose</h2>
            <p>
              How Rare Is My Name is a statistical exploration and demographic data tool. The frequencies provided reflect empirical observations from open electoral registries and census datasets. They are provided strictly for informational and entertainment purposes and do not constitute official identity documents or legal determinations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white drop-shadow-xs">2. Dataset Limitations</h2>
            <p>
              Calculations are based on verified open administrative records (including 772M+ Indian voter records and 807M+ US SSA records). Counts reflect the scope of the underlying datasets and do not extrapolate speculative counts for unreachable populations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white drop-shadow-xs">3. Fair & Personal Use</h2>
            <p>
              You are welcome to check names, share your results, and enjoy the statistics. Automated scraping, aggressive query spamming, or interference with service operations is prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white drop-shadow-xs">4. Questions & Creator Attribution</h2>
            <p>
              Developed and maintained by <strong>Karan Singh</strong>. For questions, feedback, or data partnerships, contact <a href="mailto:karansingh.aix@gmail.com" className="text-white underline underline-offset-2 font-medium">karansingh.aix@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="w-full max-w-4xl mx-auto px-6 py-6 border-t border-white/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-contrast-subtle">
        <p>© {new Date().getFullYear()} Name Rarity. Built by <a href="https://www.instagram.com/karansinghh.ai/" target="_blank" rel="noopener noreferrer" className="text-contrast-white hover:underline font-medium">Karan Singh</a>.</p>
        <div className="flex items-center gap-4">
          <Link href="/methodology" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Methodology
          </Link>
          <Link href="/privacy" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Privacy Policy
          </Link>
          <Link href="/" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
