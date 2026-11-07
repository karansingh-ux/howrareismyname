'use client';

import React from 'react';
import type { SourceMetadata, Region } from '@/lib/rarity';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  region?: Region;
  source?: SourceMetadata;
}

export default function MethodologyModal({ isOpen, onClose, region = 'IN', source }: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-xl text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="type-eyebrow text-neutral-500 block mb-1">
              No Secrets • Behind The Math
            </span>
            <h2 id="modal-title" className="type-heading-2 text-neutral-900">
              {region === 'GLOBAL' && 'Where does global data come from?'}
              {region === 'US' && 'Where does US data come from?'}
              {region === 'EU' && 'Where does European data come from?'}
              {region === 'IN' && 'Where does Indian data come from?'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 text-sm text-neutral-600 leading-relaxed">
          {/* Primary Source Attribution */}
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-4 text-xs">
            <span className="font-semibold text-neutral-900">Active Source: </span>
            <span className="text-neutral-700">{source?.name || 'Open Demographic Database'}</span>
            {source?.url && (
              <div className="mt-1">
                <span className="text-neutral-500">Citation: </span>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-900 font-medium underline underline-offset-2 hover:text-neutral-600"
                >
                  {source.doi}
                </a>
              </div>
            )}
            <div className="mt-1 text-neutral-500">
              Coverage: {source?.geography || 'International'} • {source?.sampleDescription || ''}
            </div>
          </div>

          {/* Region-Specific Underlying Methodology */}
          {region === 'GLOBAL' && (
            <>
              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">How does Global Search work?</h3>
                <p>
                  When <strong>Global</strong> mode is selected, your name is evaluated dynamically against an international demographic registry representing over <strong>1 billion population records across 180+ countries</strong>, integrated with lexical entity records from Wikidata.
                </p>
              </div>

              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">What does the Global analysis measure?</h3>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs">
                  <li><strong>Worldwide Prevalence:</strong> Computes the global 1-in-X frequency based on international civil and demographic archives.</li>
                  <li><strong>Country Concentrations:</strong> Identifies which countries have the highest percentage and probability of residents with this name.</li>
                  <li><strong>Linguistic & Cultural Background:</strong> Cross-references verified lexical entities to categorize given-name origins and gender classification.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">Data Independence</h3>
                <p className="text-xs text-neutral-500">
                  Global searches do not assume Indian voter registration defaults. They synthesize cross-border demographic records to provide an accurate international perspective.
                </p>
              </div>
            </>
          )}

          {region === 'US' && (
            <>
              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">US Social Security Administration (SSA) Data</h3>
                <p>
                  Your result is calculated directly from official records of <strong>807,765,563 birth registrations</strong> in the United States spanning every year from <strong>1880 through 2023</strong>, collected by the US Social Security Administration Office of the Chief Actuary.
                </p>
              </div>

              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">US Rarity Calibration</h3>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs">
                  <li><strong>VERY COMMON:</strong> Top 50 names nationwide (Historic names like John, James, Mary, William).</li>
                  <li><strong>COMMON:</strong> Ranks 51 to 250 (Widely recognized names across all US states).</li>
                  <li><strong>MODERATELY COMMON:</strong> Ranks 251 to 1,000 (Consistent representation across generations).</li>
                  <li><strong>UNCOMMON & RARE:</strong> Ranks 1,001+ (Distinctive family traditions or modern novel names).</li>
                </ul>
              </div>
            </>
          )}

          {region === 'EU' && (
            <>
              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">European Civil Registries</h3>
                <p>
                  Calculated from an aggregated European demographic archive of over <strong>450,000,000 records</strong> across EU member states, the United Kingdom, and Switzerland, cross-calibrated with Eurostat historical frequency statistics.
                </p>
              </div>

              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">Geographic Distribution</h3>
                <p className="text-xs text-neutral-500">
                  European name frequencies account for distinct linguistic families (Romance, Germanic, Slavic, Celtic) to show country-specific prevalence across France, Germany, Italy, Spain, the UK, and other nations.
                </p>
              </div>
            </>
          )}

          {region === 'IN' && (
            <>
              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">Underlying Indian Dataset</h3>
                <p>
                  Your result is calculated directly from an empirical dataset of <strong>772,194,503</strong> voter registration records across <strong>31 Indian states and union territories</strong>, covering <strong>267,122 unique verified Indian names</strong> spanning birth years from 1887 through 2017.
                </p>
              </div>

              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">Rarity Classification</h3>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs">
                  <li><strong>VERY COMMON:</strong> Top 1,000 names (Massive household names like Ram, Suresh, Lakshmi).</li>
                  <li><strong>COMMON:</strong> Ranks 1,001 to 15,000 (Widely recognized names like Kunal, Priya, Rahul, Riya).</li>
                  <li><strong>MODERATELY COMMON:</strong> Ranks 15,001 to 60,000 (Solid national prevalence like Ananya, Diya, Ishaan, Tanvi).</li>
                  <li><strong>UNCOMMON:</strong> Ranks 60,001 to 150,000 (Names like Dhwani, Arav, distinctive family traditions).</li>
                  <li><strong>RARE:</strong> Ranks 150,001 to 267,122 (Distinctive names observed in regional communities).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-neutral-900 font-semibold mb-1">Why Sample Frequency, Not Total Population?</h3>
                <p className="text-xs text-neutral-500">
                  Under Section 15 of the Indian Census Act 1948, the decennial Census of India does not release individual first-name counts. The figures presented here reflect frequency within official state electoral rolls. We never invent or extrapolate exact counts for India’s current total population of 1.4 billion.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
