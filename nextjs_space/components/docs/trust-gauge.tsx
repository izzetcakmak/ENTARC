'use client';

// TrustGauge - drag the slider to see what a trust score means
// and whether the agent would be allowed to fund it.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Same bands the agent is instructed to use when it scores a project.
const BANDS = [
  { min: 80, label: 'Exceptional', note: 'Strong fundamentals across the board.', color: '#34d399' },
  { min: 60, label: 'Good', note: 'Solid potential, a few open questions.', color: '#22d3ee' },
  { min: 40, label: 'Average', note: 'Notable concerns — needs a closer look.', color: '#fbbf24' },
  { min: 20, label: 'Below average', note: 'Significant risks.', color: '#fb923c' },
  { min: 0, label: 'High risk', note: 'The agent advises to avoid.', color: '#f87171' },
];

const R = 80;
const ARC_LEN = Math.PI * R; // half circle

export function TrustGauge({ minTrustScore }: { minTrustScore: number }) {
  const [score, setScore] = useState(74);
  const band = BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1];
  const fundable = score >= minTrustScore;

  // Threshold tick position on the arc
  const angle = Math.PI * (1 - minTrustScore / 100);
  const tx = 100 + Math.cos(angle) * R;
  const ty = 100 - Math.sin(angle) * R;
  const tx2 = 100 + Math.cos(angle) * (R + 12);
  const ty2 = 100 - Math.sin(angle) * (R + 12);

  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <div className="mx-auto w-full max-w-xs">
        <svg viewBox="0 0 200 118" className="w-full" role="img" aria-label={`Trust score ${score} out of 100`}>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={band.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            animate={{ strokeDashoffset: ARC_LEN * (1 - score / 100), stroke: band.color }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
          <line x1={tx} y1={ty} x2={tx2} y2={ty2} stroke="#e2e8f0" strokeWidth="2" />
          <text x={tx2} y={ty2 - 4} textAnchor="middle" className="fill-slate-300" fontSize="8">
            min {minTrustScore}
          </text>
          <text x="100" y="92" textAnchor="middle" className="fill-white" fontSize="30" fontWeight="700">
            {score}
          </text>
          <text x="100" y="108" textAnchor="middle" fill={band.color} fontSize="10" fontWeight="600">
            {band.label}
          </text>
        </svg>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="mt-2 w-full accent-cyan-400"
          aria-label="Try a trust score"
        />
        <p className="text-center text-xs text-slate-500">Drag to try a score</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-slate-300">{band.note}</p>
        <div
          className={cn(
            'flex items-start gap-2 rounded-xl border p-3 text-sm',
            fundable
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
              : 'border-red-500/30 bg-red-500/5 text-red-300'
          )}
        >
          {fundable ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
          <span>
            {fundable
              ? `The agent may fund this project — ${score} is at or above its minimum of ${minTrustScore}.`
              : `The agent will refuse to fund this project — ${score} is below its minimum of ${minTrustScore}.`}
          </span>
        </div>
        <ul className="space-y-1 text-xs text-slate-400">
          {BANDS.map((b) => (
            <li key={b.label} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
              <span className="w-14 text-slate-300">{b.min}+</span>
              {b.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
