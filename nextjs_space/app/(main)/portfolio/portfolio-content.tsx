'use client';

// PortfolioContent - the investor's real positions
// Accepted and funded proposals from /api/portfolio; no simulated valuations.

import { GlassCard } from '@/components/shared/glass-card';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Wallet, Unlock, Lock, FolderKanban, ExternalLink, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NETWORK_LABEL } from '@/lib/arc-network';
import { formatUsdc } from '@/lib/dashboard-types';

interface Position {
  id: string;
  status: string;
  projectName: string;
  category: string;
  logoEmoji: string;
  trustScore: number | null;
  committed: number;
  released: number;
  locked: number;
  milestonesReleased: number;
  milestonesTotal: number;
  nextMilestone: { title: string; amount: number } | null;
  explorerUrl: string | null;
}

interface PortfolioData {
  totals: { committed: number; released: number; locked: number; positions: number };
  allocation: { category: string; amount: number }[];
  positions: Position[];
}

const statusColors: Record<string, string> = {
  ACCEPTED: 'bg-cyan-500/20 text-cyan-400',
  FUNDED: 'bg-emerald-500/20 text-emerald-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  DISPUTED: 'bg-red-500/20 text-red-400',
};

export function PortfolioContent() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  if (!mounted || (!data && !loadError)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const totals = data?.totals ?? { committed: 0, released: 0, locked: 0, positions: 0 };
  const positions = data?.positions ?? [];
  const allocation = data?.allocation ?? [];

  const cards = [
    { title: 'Capital Committed', value: formatUsdc(totals.committed), icon: Wallet, color: 'text-cyan-400' },
    { title: 'Released to Founders', value: formatUsdc(totals.released), icon: Unlock, color: 'text-emerald-400' },
    { title: 'Locked in Escrow', value: formatUsdc(totals.locked), icon: Lock, color: 'text-amber-400' },
    { title: 'Positions', value: String(totals.positions), icon: FolderKanban, color: 'text-violet-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <GlassCard padding="lg">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
            <Briefcase className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
            <p className="text-slate-400">
              Your accepted and funded deals on {NETWORK_LABEL} — amounts are real USDC, settled by the agent
            </p>
          </div>
        </div>
      </GlassCard>

      {loadError && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-300">
          Could not load your portfolio. Please refresh.
        </p>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <GlassCard key={c.title} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{c.title}</p>
                  <p className="mt-1 text-2xl font-bold text-white">{c.value}</p>
                </div>
                <Icon className={cn('h-6 w-6', c.color)} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Allocation */}
      {allocation.length > 0 && (
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold text-white">Allocation by Category</h3>
          <div className="space-y-3">
            {allocation.map((a) => {
              const pct = totals.committed > 0 ? (a.amount / totals.committed) * 100 : 0;
              return (
                <div key={a.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-300">{a.category}</span>
                    <span className="text-slate-400">
                      {formatUsdc(a.amount)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Positions */}
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold text-white">Your Investments</h3>
        {positions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400">
              No positions on {NETWORK_LABEL} yet. A position appears once a founder accepts your
              proposal.
            </p>
            <Link
              href="/deal-flow"
              className="mt-4 inline-block rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/30"
            >
              Browse Deal Flow
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/30 bg-slate-800/30 p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">{p.logoEmoji}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{p.projectName}</p>
                    <p className="text-xs text-slate-400">
                      {p.category}
                      {p.trustScore != null && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Shield className="h-3 w-3 text-cyan-400" /> {p.trustScore}
                        </span>
                      )}
                      {p.milestonesTotal > 0 && ` · ${p.milestonesReleased}/${p.milestonesTotal} milestones released`}
                    </p>
                    {p.nextMilestone && (
                      <p className="text-xs text-slate-500">
                        Next: {p.nextMilestone.title} ({formatUsdc(p.nextMilestone.amount)})
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-slate-400">
                    <p>
                      Committed <span className="font-medium text-white">{formatUsdc(p.committed)}</span>
                    </p>
                    <p>
                      Released <span className="font-medium text-emerald-400">{formatUsdc(p.released)}</span> · Locked{' '}
                      <span className="font-medium text-amber-400">{formatUsdc(p.locked)}</span>
                    </p>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusColors[p.status] ?? 'bg-slate-500/20 text-slate-400')}>
                    {p.status}
                  </span>
                  {p.explorerUrl && (
                    <a
                      href={p.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400"
                      title="View funding transaction on the Arc explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
