'use client';

// DashboardContent - Client component for dashboard
// Renders all dashboard components including Treasury wallet

import { MetricCards } from '@/components/dashboard/metric-cards';
import { StreamingChart } from '@/components/dashboard/streaming-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { GlassCard } from '@/components/shared/glass-card';
import { TreasuryDisplay } from '@/components/wallet/treasury-display';
import { AgentWalletDisplay } from '@/components/wallet/agent-wallet-display';
import type { DashboardData } from '@/lib/dashboard-types';
import { useEffect, useState } from 'react';
import { Zap, Target, ShieldCheck, Settings, Play } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export function DashboardContent() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);

    // Real figures from the database — refreshed so new agent transfers show up.
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as DashboardData;
        if (!cancelled) {
          setData(json);
          setLoadError(false);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const topProjects = data?.topProjects ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome to <span className="text-cyan-400">ENTARC</span>
          </h1>
          <p className="mt-1 text-slate-400">
            Autonomous Venture Intelligence Agent on Arc
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:brightness-110"
          >
            <Play className="h-4 w-4" />
            Watch Demo
          </Link>
          <Link
            href="/discovery"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 font-medium text-slate-900 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            <Zap className="h-4 w-4" />
            Discover Projects
          </Link>
        </div>
      </div>

      {/* Wallets Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Treasury Wallet (Personal - MetaMask) */}
        <div>
          {isConnected ? (
            <TreasuryDisplay compact />
          ) : (
            <GlassCard className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Treasury Wallet</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Connect MetaMask for personal investments
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-all hover:bg-cyan-500/20"
                >
                  <Settings className="h-3 w-3" />
                  Connect
                </Link>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Agent Wallet (Autonomous - Circle) */}
        <div>
          <AgentWalletDisplay compact />
        </div>
      </div>

      {loadError && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-300">
          Could not load live dashboard figures. Retrying automatically.
        </p>
      )}

      {/* Metric Cards */}
      <MetricCards metrics={data?.metrics ?? null} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Streaming Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <StreamingChart history={data?.history ?? []} />
        </div>

        {/* Top Projects */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Top Rated Projects</h3>
          </div>
          <div className="space-y-3">
            {topProjects.length === 0 && (
              <p className="text-sm text-slate-400">
                No analyzed projects yet. Run discovery to let the agent score candidates.
              </p>
            )}
            {topProjects.map((project, index) => (
              <Link
                key={project?.id ?? index}
                href="/deal-flow"
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-800/50"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">
                  {index + 1}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 text-xl">
                  {project?.logoEmoji ?? '📊'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {project?.name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-400">{project?.category ?? 'N/A'}</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-400" title="AI trust score">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">{project?.aiTrustScore ?? '—'}/100</span>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={data?.activity ?? []} />
    </div>
  );
}
