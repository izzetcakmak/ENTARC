'use client';

// FlowDiagram - animated walkthrough of a deal, from submission to settlement.
// Auto-advances; clicking a step pins it.

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  Brain,
  Send,
  Handshake,
  ShieldCheck,
  Coins,
  LineChart,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: FileText,
    who: 'Founder',
    title: 'Submit',
    short: 'A founder lists a project',
    detail:
      'The founder fills in a short form: what the project does, its GitHub repository, how much USDC it needs, and the milestones it will deliver (for example “30% at audit, 40% at beta, 30% at launch”).',
  },
  {
    icon: Brain,
    who: 'Agent',
    title: 'Analyse',
    short: 'The AI scores it from 0 to 100',
    detail:
      'The agent reads the project like an analyst would — repository activity, team, milestones, category — and writes a trust score from 0 to 100 together with a short summary, strengths and risks. Once scored, the project is listed in Deal Flow.',
  },
  {
    icon: Send,
    who: 'Investor',
    title: 'Propose',
    short: 'An investor offers an amount',
    detail:
      'An investor opens the project in Deal Flow and proposes an amount in USDC. The founder is notified. A proposal stays open for 7 days.',
  },
  {
    icon: Handshake,
    who: 'Founder',
    title: 'Accept',
    short: 'The founder says yes or no',
    detail:
      'The founder accepts or rejects the proposal. Nothing moves yet — accepting only makes the deal eligible for the agent.',
  },
  {
    icon: ShieldCheck,
    who: 'Agent',
    title: 'Policy gate',
    short: 'Three hard rules are checked',
    detail:
      'Before any money moves the agent checks its spending policy: a cap per transfer, a cap per 24 hours and a minimum trust score. There is no “approve anyway” button — if one rule fails, the transfer simply does not happen.',
  },
  {
    icon: Coins,
    who: 'Agent',
    title: 'Settle',
    short: 'Real USDC is sent on Arc',
    detail:
      'The agent sends the first milestone’s share from its own wallet to the founder’s wallet. It is a real transaction on Arc with a public receipt (a transaction hash) anyone can open in the explorer.',
  },
  {
    icon: LineChart,
    who: 'Everyone',
    title: 'Track',
    short: 'Later milestones release over time',
    detail:
      'The rest stays locked. Each further milestone is released by the same policy-checked process. Dashboard and Portfolio update from these real transfers.',
  },
];

const whoColors: Record<string, string> = {
  Founder: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  Investor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Agent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  Everyone: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

export function FlowDiagram() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Respect "reduce motion": start paused, but let the reader press Play.
  useEffect(() => {
    if (reduceMotion) setPlaying(false);
  }, [reduceMotion]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 3200);
    return () => clearInterval(t);
  }, [playing]);

  const step = STEPS[active];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Step {active + 1} of {STEPS.length} — click any step to pin it
        </p>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/50"
          aria-label={playing ? 'Pause animation' : 'Play animation'}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === active;
          const isDone = i < active;
          return (
            <button
              key={s.title}
              onClick={() => {
                setActive(i);
                setPlaying(false);
              }}
              className={cn(
                'relative rounded-xl border p-3 text-left transition-colors',
                isActive
                  ? 'border-cyan-500/60 bg-cyan-500/10'
                  : isDone
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="flow-coin"
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-slate-900 shadow-lg shadow-cyan-500/40"
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                >
                  $
                </motion.span>
              )}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                    isActive ? 'bg-cyan-400 text-slate-900' : isDone ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-700 text-slate-400'
                  )}
                >
                  {i + 1}
                </span>
                <Icon className={cn('h-4 w-4', isActive ? 'text-cyan-400' : 'text-slate-400')} />
              </div>
              <p className="mt-2 text-sm font-semibold text-white">{s.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{s.short}</p>
            </button>
          );
        })}
      </div>

      <motion.div
        key={active}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', whoColors[step.who])}>
            {step.who}
          </span>
          <h4 className="font-semibold text-white">
            {active + 1}. {step.title}
          </h4>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.detail}</p>
      </motion.div>
    </div>
  );
}
