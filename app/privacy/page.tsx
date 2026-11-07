import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | How Rare Is My Name?',
  description: 'Our privacy policy explains what data we collect, why we collect it, and how your information is protected.'
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-xs text-white/80 mb-8 font-medium">
          Last updated: September 2026
        </p>

        <div className="space-y-8 text-sm text-white/90 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white drop-shadow-xs">1. Strict Data Minimization</h2>
            <p>
              We believe in total privacy. We do not collect emails, we do not require account sign-ups, and we do not store personal identification profiles. All name rarity calculations are executed on the fly against public administrative census registers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white drop-shadow-xs">2. What We Process</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-white/85 font-medium">
              <li><strong>Submitted First Names:</strong> The text you input is matched against demographic databases to return statistical frequencies. We do not link searches to your real-world identity.</li>
              <li><strong>No Email Collection:</strong> We do not require or collect your email address. All demographic results and rarity insights are displayed directly on the screen.</li>
              <li><strong>Anonymous Telemetry:</strong> Aggregated, privacy-friendly event counters (e.g., total searches performed) help us monitor server capacity without collecting personal identifiers or tracking you across the web.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white drop-shadow-xs">3. Third-Party Sharing</h2>
            <p>
              We do not sell, rent, or monetize your search queries. We have no advertising trackers, behavioral cookies, or data brokers integrated into this site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white drop-shadow-xs">4. Contact & Creator Information</h2>
            <p>
              This project is built and maintained by <strong>Karan Singh</strong>. If you have any inquiries regarding data protection or methodology, you can reach out directly via email at <a href="mailto:karansingh.aix@gmail.com" className="text-white underline underline-offset-2 font-medium">karansingh.aix@gmail.com</a> or via Instagram at <a href="https://www.instagram.com/karansinghh.ai/" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 font-medium">@karansinghh.ai</a>.
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
          <Link href="/terms" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Terms
          </Link>
          <Link href="/" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
