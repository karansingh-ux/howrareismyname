'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { LeaderboardEntry } from '@/lib/rarity';

interface HeroNamePillsProps {
  onSelectName?: (name: string) => void;
  isVisible?: boolean;
}

/**
 * Tetris-Style Ground-Up Stacking Matrix:
 * 
 * We build the piles from the BOTTOM UP (row 0 = floor, row 1 = on top of row 0, etc.)
 * Each pill drops one by one, fills horizontal floor space first, then naturally stacks
 * on top of landed pills with organic overlap, varied rotations, and a smooth landing bounce.
 * 
 * Left Pile: 10 Most Common Names (white pills)
 * Right Pile: 10 Rarest Names (dark pills)
 */

interface PillSlot {
  posPx: number;         // horizontal offset in px (left for Common, right for Rarest)
  bottomPx: number;      // vertical position anchored from bottom
  rot: number;           // organic angle (-4deg to +4.5deg)
  delay: number;         // sequential falling time (one by one)
  zIndex: number;
}

/**
 * Cohesive Tetris-Style Pile Packing:
 * 
 * Arranged into 4 distinct physical layers:
 * - Layer 0 (Foundation / Ground): 4 pills resting edge-to-edge with slight overlap
 * - Layer 1: 3 pills nestling directly into the grooves between ground pills
 * - Layer 2: 2 pills resting on Layer 1
 * - Layer 3 (Peak / Crown): 1 pill crowning the top of the pile
 * 
 * Every pill touches and rests on the pills below it (NO floating gaps).
 * Drops fall one by one with a slow, smooth, cushioned landing.
 */

// Left Pile (10 Most Common - White Pills)
const LEFT_TETRIS_SLOTS: PillSlot[] = [
  // Layer 0: Ground row (pills 0, 1, 2, 3) - drop first
  { posPx: 0,   bottomPx: 0,  rot: -3.5, delay: 0.4, zIndex: 1 },
  { posPx: 75,  bottomPx: 3,  rot: 3.0,  delay: 1.0, zIndex: 2 },
  { posPx: 155, bottomPx: 0,  rot: -2.0, delay: 1.6, zIndex: 3 },
  { posPx: 245, bottomPx: 4,  rot: 4.0,  delay: 2.2, zIndex: 4 },
  
  // Layer 1: Nestled on ground pills (pills 4, 5, 6)
  { posPx: 35,  bottomPx: 30, rot: 4.5,  delay: 2.8, zIndex: 5 },
  { posPx: 118, bottomPx: 27, rot: -3.5, delay: 3.4, zIndex: 6 },
  { posPx: 205, bottomPx: 31, rot: 2.5,  delay: 4.0, zIndex: 7 },
  
  // Layer 2: Middle stack (pills 7, 8)
  { posPx: 75,  bottomPx: 58, rot: -4.0, delay: 4.6, zIndex: 8 },
  { posPx: 162, bottomPx: 59, rot: 3.5,  delay: 5.2, zIndex: 9 },
  
  // Layer 3: Crown peak (pill 9)
  { posPx: 118, bottomPx: 88, rot: -2.0, delay: 5.8, zIndex: 10 },
];

// Right Pile (10 Rarest - Dark Pills)
const RIGHT_TETRIS_SLOTS: PillSlot[] = [
  // Layer 0: Ground row (pills 0, 1, 2, 3) - interleaved with left
  { posPx: 0,   bottomPx: 0,  rot: 3.5,  delay: 0.7, zIndex: 1 },
  { posPx: 75,  bottomPx: 3,  rot: -3.0, delay: 1.3, zIndex: 2 },
  { posPx: 155, bottomPx: 1,  rot: 2.5,  delay: 1.9, zIndex: 3 },
  { posPx: 245, bottomPx: 4,  rot: -4.0, delay: 2.5, zIndex: 4 },
  
  // Layer 1: Nestled on ground pills (pills 4, 5, 6)
  { posPx: 35,  bottomPx: 30, rot: -4.2, delay: 3.1, zIndex: 5 },
  { posPx: 118, bottomPx: 27, rot: 3.2,  delay: 3.7, zIndex: 6 },
  { posPx: 205, bottomPx: 31, rot: -2.8, delay: 4.3, zIndex: 7 },
  
  // Layer 2: Middle stack (pills 7, 8)
  { posPx: 75,  bottomPx: 58, rot: 3.8,  delay: 4.9, zIndex: 8 },
  { posPx: 162, bottomPx: 59, rot: -3.5, delay: 5.5, zIndex: 9 },
  
  // Layer 3: Crown peak (pill 9)
  { posPx: 118, bottomPx: 88, rot: 2.0,  delay: 6.1, zIndex: 10 },
];

export default function HeroNamePills({ onSelectName, isVisible = true }: HeroNamePillsProps) {
  const [commonNames, setCommonNames] = useState<LeaderboardEntry[]>([]);
  const [rarestNames, setRarestNames] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchNames() {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          if (Array.isArray(data.common) && data.common.length > 0) {
            setCommonNames(data.common.slice(0, 10));
          }
          if (Array.isArray(data.rarest) && data.rarest.length > 0) {
            setRarestNames(data.rarest.slice(0, 10));
          }
        }
      } catch {
        // Non-blocking
      }
    }
    fetchNames();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isVisible || commonNames.length === 0 || rarestNames.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="relative w-full h-full max-w-[1720px] mx-auto">
        {/* =========================================================================
            LEFT FLANK: 10 Most Common Names (Cohesive Stacked Pile)
            ========================================================================= */}
        <div className="absolute left-3 sm:left-6 md:left-8 lg:left-12 bottom-12 sm:bottom-16 md:bottom-20 w-[340px] h-[140px] origin-bottom-left scale-[0.62] sm:scale-[0.74] md:scale-[0.86] lg:scale-100">
          {commonNames.map((item, idx) => {
            const slot = LEFT_TETRIS_SLOTS[idx % LEFT_TETRIS_SLOTS.length];
            return (
              <motion.button
                key={`tetris-common-${item.name}`}
                type="button"
                initial={{ 
                  y: -650 - idx * 25, 
                  opacity: 0, 
                  rotate: slot.rot * 2.2 
                }}
                animate={{ 
                  y: 0, 
                  opacity: 1, 
                  rotate: slot.rot 
                }}
                transition={{
                  type: 'spring',
                  stiffness: 65,
                  damping: 13,
                  mass: 1.1,
                  delay: slot.delay
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: 0,
                  zIndex: 40,
                  transition: { duration: 0.15 }
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelectName && onSelectName(item.name)}
                style={{
                  left: `${slot.posPx}px`,
                  bottom: `${slot.bottomPx}px`,
                  zIndex: slot.zIndex
                }}
                className="absolute pointer-events-auto group inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/95 hover:bg-white text-neutral-900 border border-neutral-200/70 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all cursor-pointer whitespace-nowrap select-none"
                title={`Common: ${item.name} (Rank #${item.rank}). Click to test.`}
              >
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-950">
                  {item.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* =========================================================================
            RIGHT FLANK: 10 Rarest Names on Record (Cohesive Stacked Pile)
            ========================================================================= */}
        <div className="absolute right-3 sm:right-6 md:right-8 lg:right-12 bottom-12 sm:bottom-16 md:bottom-20 w-[340px] h-[140px] origin-bottom-right scale-[0.62] sm:scale-[0.74] md:scale-[0.86] lg:scale-100">
          {rarestNames.map((item, idx) => {
            const slot = RIGHT_TETRIS_SLOTS[idx % RIGHT_TETRIS_SLOTS.length];
            return (
              <motion.button
                key={`tetris-rare-${item.name}`}
                type="button"
                initial={{ 
                  y: -650 - idx * 25, 
                  opacity: 0, 
                  rotate: slot.rot * 2.2 
                }}
                animate={{ 
                  y: 0, 
                  opacity: 1, 
                  rotate: slot.rot 
                }}
                transition={{
                  type: 'spring',
                  stiffness: 65,
                  damping: 13,
                  mass: 1.1,
                  delay: slot.delay
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: 0,
                  zIndex: 40,
                  transition: { duration: 0.15 }
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelectName && onSelectName(item.name)}
                style={{
                  right: `${slot.posPx}px`,
                  bottom: `${slot.bottomPx}px`,
                  zIndex: slot.zIndex
                }}
                className="absolute pointer-events-auto group inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-neutral-900/90 hover:bg-neutral-950 text-white border border-neutral-700/60 shadow-[0_4px_14px_rgba(0,0,0,0.3)] hover:shadow-xl transition-all cursor-pointer whitespace-nowrap select-none"
                title={`Rare: ${item.name} (Rank #${item.rank.toLocaleString('en-IN')}). Click to test.`}
              >
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-white">
                  {item.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
