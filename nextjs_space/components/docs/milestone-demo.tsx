'use client';

// MilestoneDemo - illustration of milestone-based release.
// Uses a made-up 10 USDC deal purely to show the mechanics; clearly labelled.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOTAL = 10;
const MILESTONES = [
  { title: 'Security audit', pct: 30 },
  { title: 'Public beta', pct: 40 },
  { title: 'Full launch', pct: 30 },
];

export function MilestoneDemo() {
  const [released, setReleased] = useState(0); // number of milestones released

  const releasedAmount = MILESTONES.slice(0, released).reduce((s, m) => s + (TOTAL * m.pct) / 100, 0);
  const lockedAmount = TOTAL - releasedAmount;
  const done = released >= MILESTONES.length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300">
          Illustration — example deal of {TOTAL} USDC, no real funds
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setReleased((r) => Math.min(r + 1, MILESTONES.length))}
            disabled={done}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-cyan-400 disabled:opacity-40"
          >
            Release next milestone <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setReleased(0)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Bar */}
      <div className="flex h-10 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40">
        {MILESTONES.map((m, i) => {
          const isReleased = i < released;
          return (
            <motion.div
              key={m.title}
              style={{ width: `${m.pct}%` }}
              animate={{ backgroundColor: isReleased ? 'rgba(52,211,153,0.35)' : 'rgba(251,191,36,0.12)' }}
              transition={{ duration: 0.5 }}
              className={cn(
                'flex items-center justify-center gap-1 border-r border-slate-900/60 text-xs font-medium last:border-r-0',
                isReleased ? 'text-emerald-200' : 'text-amber-200/80'
              )}
            >
              {isReleased ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {m.pct}%
            </motion.div>
          );
        })}
      </div>

      {/* Milestone list */}
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {MILESTONES.map((m, i) => {
          const isReleased = i < released;
          const isNext = i === released;
          return (
            <div
              key={m.title}
              className={cn(
                'rounded-lg border p-3',
                isReleased
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : isNext
                    ? 'border-cyan-500/40 bg-cyan-500/5'
                    : 'border-slate-700/50 bg-slate-800/30'
              )}
            >
              <p className="text-sm font-medium text-white">{m.title}</p>
              <p className="text-xs text-slate-400">
                {(TOTAL * m.pct) / 100} USDC · {isReleased ? 'sent to founder' : isNext ? 'next to release' : 'locked'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between text-sm">
        <span className="text-emerald-400">Released: {releasedAmount} USDC</span>
        <span className="text-amber-400">Still locked: {lockedAmount} USDC</span>
      </div>
    </div>
  );
}
