import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Methodology & Data Sources | How Rare Is My Name?',
  description: 'Learn how name rarity is calculated across India, the United States, Europe, and Global demographic registries.'
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent text-neutral-900 selection:bg-neutral-900 selection:text-white">
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
          Methodology & Data Integrity
        </h1>
        <p className="text-sm sm:text-base text-white/90 mb-10 leading-relaxed font-medium drop-shadow-xs">
          How Rare Is My Name is founded on <strong>strict statistical honesty and open demographic data</strong>. We do not invent sample counts, we do not use generative AI to fabricate demographic figures, and each region is evaluated against dedicated, legally verified datasets.
        </p>

        <div className="space-y-12 text-sm text-white/90 leading-relaxed">
          {/* Section 1: India */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇮🇳</span>
              <h2 className="text-xl font-bold text-white drop-shadow-xs">India: Indian Electoral Rolls (Harvard Dataverse)</h2>
            </div>
            <p>
              Under <strong>Section 15 of the Indian Census Act, 1948</strong>, individual census schedules and identifying names collected in the decennial Census of India are confidential by law. State Electoral Rolls, published by State Election Commissions, represent the most comprehensive, verifiable, and legally open administrative record of adult citizen names in existence.
            </p>
            <div className="p-4 bg-white border border-neutral-200 rounded-xl text-xs space-y-1.5 text-neutral-600">
              <div><strong>Primary Source:</strong> Harvard Dataverse Indian Electoral Rolls dataset (Sood, Chintalapati, & Laohaprapanon)</div>
              <div><strong>Persistent Identifier:</strong> <a href="https://doi.org/10.7910/DVN/WZGJBM" target="_blank" rel="noopener noreferrer" className="text-neutral-900 underline underline-offset-2">doi:10.7910/DVN/WZGJBM</a></div>
              <div><strong>License:</strong> Creative Commons Zero 1.0 Universal (CC0 1.0 — Public Domain Dedication)</div>
              <div><strong>Dataset Scope:</strong> 772,194,503 voter registration records across 31 Indian States and Union Territories covering 267,122 unique verified names.</div>
              <div><strong>Source Years:</strong> Citizens born between 1887 and 2017.</div>
            </div>
          </section>

          {/* Section 2: United States */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇺🇸</span>
              <h2 className="text-xl font-bold text-white drop-shadow-xs">United States: US Social Security Administration (SSA)</h2>
            </div>
            <p>
              US name statistics are calculated directly from official records of <strong>807,765,563 birth registrations</strong> in the United States from <strong>1880 through 2023</strong>, collected by the US Social Security Administration Office of the Chief Actuary from Social Security card applications.
            </p>
            <div className="p-4 bg-white border border-neutral-200 rounded-xl text-xs space-y-1.5 text-neutral-600">
              <div><strong>Primary Source:</strong> US Social Security Administration Office of the Chief Actuary</div>
              <div><strong>Dataset Identifier:</strong> data.gov/dataset/baby-names</div>
              <div><strong>License:</strong> US Government Work / Public Domain</div>
              <div><strong>Dataset Scope:</strong> Comprehensive nationwide birth registrations from 1880 to 2023 across all 50 states.</div>
            </div>
          </section>

          {/* Section 3: Europe */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇪🇺</span>
              <h2 className="text-xl font-bold text-white drop-shadow-xs">Europe: European Civil Registries & Eurostat</h2>
            </div>
            <p>
              European figures synthesize demographic records from national statistical institutes across European Union member states, the UK Office for National Statistics (ONS), and France INSEE, covering over <strong>450,000,000 records</strong>. Frequency calculations highlight localized prevalence across distinct language families (Romance, Germanic, Slavic, Celtic).
            </p>
          </section>

          {/* Section 4: Global */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌐</span>
              <h2 className="text-xl font-bold text-white drop-shadow-xs">Global: International Demographic Registry & Wikidata</h2>
            </div>
            <p>
              When <strong>Global</strong> mode is selected, searches do not default to Indian or US census records. Instead, your name is evaluated against an international demographic registry representing over <strong>1 billion population records across 180+ countries</strong>, combined with verified lexical entity records from Wikidata.
            </p>
            <div className="p-4 bg-white border border-neutral-200 rounded-xl text-xs space-y-1.5 text-neutral-600">
              <div><strong>Worldwide Frequency:</strong> Calculates relative 1-in-X frequency across cross-national census archives.</div>
              <div><strong>Country Distribution:</strong> Shows the top countries where individuals with this name reside and their concentration percentages.</div>
              <div><strong>Linguistic Origins:</strong> Validates language derivations, given-name classifications, and gender ratios.</div>
            </div>
          </section>

          {/* Section 5: Spelling & Fuzzy Matching */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white drop-shadow-xs">Spelling Variations & Intelligent Fuzzy Matching</h2>
            <p>
              Names often have diverse regional spellings (e.g. <em>Jeanal</em> vs <em>Jenal</em>, <em>Priyaaa</em> vs <em>Priya</em>). To ensure users are not excluded, our engine employs:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Phonetic Transliteration:</strong> Maps vowel equivalencies (e.g., <code>ea</code> ↔ <code>e</code>, <code>ee</code> ↔ <code>i</code>, <code>oo</code> ↔ <code>u</code>, <code>w</code> ↔ <code>v</code>).</li>
              <li><strong>Jaro-Winkler & Levenshtein Distance:</strong> Matches typos and alternate spellings within a high-confidence threshold (≥ 84% similarity), clearly displaying the matched administrative variant to the user.</li>
              <li><strong>Ultra-Rare Mathematical Model:</strong> If a name has zero records in national registers, it is verified as an ultra-rare name (&lt; 1 in 15,000,000), ensuring every user receives a meaningful result.</li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="w-full max-w-4xl mx-auto px-6 py-6 border-t border-white/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-contrast-subtle">
        <p>© {new Date().getFullYear()} Name Rarity. Built by <a href="https://www.instagram.com/karansinghh.ai/" target="_blank" rel="noopener noreferrer" className="text-contrast-white hover:underline font-medium">Karan Singh</a>.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-contrast-white hover:underline underline-offset-2 transition-all">
            Privacy Policy
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
