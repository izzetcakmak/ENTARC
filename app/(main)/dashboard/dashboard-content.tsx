'use client';

// DashboardContent - Client component for dashboard
// Renders all dashboard components including Treasury wallet

import { MetricCards } from '@/components/dashboard/metric-cards';
import { StreamingChart } from '@/components/dashboard/streaming-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { GlassCard } from '@/components/shared/glass-card';
import { TreasuryDisplay } from '@/components/wallet/treasury-display';
import { useEntarcStore } from '@/store/use-entarc-store';
import { useEffect, useState } from 'react';
import { Zap, Target, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export function DashboardContent() {
  const [mounted, setMounted] = useState(false);
  const projects = useEntarcStore((state) => state.projects);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  // Top performing projects
  const topProjects = [...(projects ?? [])]
    .sort((a, b) => (b?.performance?.roiPercent ?? 0) - (a?.performance?.roiPercent ?? 0))
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome to <span className="text-cyan-400">ENTARC</span>
          </h1>
          <p className="mt-1 text-slate-400">
            Autonomous VC Agent on Arc Network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/discovery"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 font-medium text-slate-900 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            <Zap className="h-4 w-4" />
            Discover Projects
          </Link>
        </div>
      </div>

      {/* Treasury Wallet Section */}
      {isConnected ? (
        <TreasuryDisplay />
      ) : (
        <GlassCard className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Treasury Wallet</h3>
              <p className="mt-1 text-sm text-slate-400">
                Connect your wallet to manage investments on Arc Testnet
              </p>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/20"
            >
              <Settings className="h-4 w-4" />
              Connect Wallet
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Metric Cards */}
      <MetricCards />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Streaming Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <StreamingChart />
        </div>

        {/* Top Projects */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Top Performers</h3>
          </div>
          <div className="space-y-3">
            {topProjects.map((project, index) => (
              <Link
                key={project?.id ?? index}
                href={`/projects/${project?.id ?? ''}`}
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
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    +{(project?.performance?.roiPercent ?? 0).toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
