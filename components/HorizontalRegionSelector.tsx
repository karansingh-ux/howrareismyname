'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Region } from '@/lib/rarity';

interface RegionOption {
  id: Region;
  name: string;
  shortName: string;
  flag: string;
}

interface HorizontalRegionSelectorProps {
  currentRegionId: Region;
  onSelectRegion: (id: Region) => void;
}

const REGIONS: RegionOption[] = [
  { id: 'IN', name: 'India', shortName: 'India', flag: '🇮🇳' },
  { id: 'US', name: 'United States', shortName: 'US', flag: '🇺🇸' },
  { id: 'EU', name: 'Europe', shortName: 'Europe', flag: '🇪🇺' },
  { id: 'GLOBAL', name: 'Global', shortName: 'Global', flag: '🌐' },
];

export default function HorizontalRegionSelector({
  currentRegionId,
  onSelectRegion,
}: HorizontalRegionSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeRegion = REGIONS.find((r) => r.id === currentRegionId) || REGIONS[0];

  // Click outside to collapse
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    }
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  const handleSelect = (id: Region) => {
    onSelectRegion(id);
    setIsExpanded(false);
  };

  return (
    <div className="flex justify-center mb-6 sm:mb-8 w-full px-2" ref={containerRef}>
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 26,
          mass: 0.8,
        }}
        className="inline-flex items-center h-[34px] sm:h-[36px] max-w-full rounded-full bg-white/95 hover:bg-white backdrop-blur-md shadow-md hover:shadow-lg border-0 select-none overflow-hidden transition-shadow duration-300"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isExpanded ? (
            /* Collapsed Single Pill State */
            <motion.button
              key="collapsed"
              type="button"
              layout
              initial={{ opacity: 0, filter: 'blur(3px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(3px)' }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => setIsExpanded(true)}
              className="group inline-flex items-center gap-2 px-3.5 h-full text-xs text-neutral-900 font-semibold cursor-pointer transition-colors whitespace-nowrap"
              aria-label={`Current region: ${activeRegion.name}. Click to expand options.`}
            >
              <span className="text-sm leading-none transition-transform duration-200 group-hover:scale-110">
                {activeRegion.flag}
              </span>
              <span className="transition-colors duration-150 group-hover:text-black">
                {activeRegion.name}
              </span>
              {/* Right-facing arrow hinting horizontal expansion with subtle hover nudge */}
              <svg
                className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-all duration-200 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ) : (
            /* Expanded Horizontal Pill State */
            <motion.div
              key="expanded"
              layout
              initial={{ opacity: 0, filter: 'blur(3px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(3px)' }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="inline-flex items-center px-1 h-full gap-0.5 sm:gap-1 max-w-full overflow-x-auto"
            >
              {REGIONS.map((r) => {
                const isSelected = r.id === currentRegionId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelect(r.id)}
                    className={`group/btn inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs cursor-pointer whitespace-nowrap shrink-0 transition-all duration-200 ${
                      isSelected
                        ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/90 active:scale-97 font-medium'
                    }`}
                  >
                    <span className="text-xs sm:text-sm leading-none transition-transform duration-150 group-hover/btn:scale-105">
                      {r.flag}
                    </span>
                    <span className="hidden sm:inline">{r.name}</span>
                    <span className="sm:hidden">{r.shortName}</span>
                  </button>
                );
              })}

              {/* Collapse chevron */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/80 transition-all duration-150 cursor-pointer ml-0.5 active:scale-95"
                aria-label="Collapse regions"
                title="Collapse"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
