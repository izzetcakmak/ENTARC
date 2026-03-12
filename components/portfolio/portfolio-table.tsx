'use client';

// PortfolioTable Component - Investment portfolio display
// Shows all positions with P/L, ROI, and exit strategy controls

import { useEntarcStore } from '@/store/use-entarc-store';
import { GlassCard } from '@/components/shared/glass-card';
import { StateBlock } from '@/components/shared/state-block';
import { TableRowSkeleton } from '@/components/shared/app-skeleton';
import type { PortfolioPosition, ExitStrategy } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const exitStrategyConfig: Record<ExitStrategy, { label: string; color: string }> = {
  hold: { label: 'Hold', color: 'bg-cyan-500/10 text-cyan-400' },
  partial_exit: { label: 'Partial Exit', color: 'bg-amber-500/10 text-amber-400' },
  full_exit: { label: 'Full Exit', color: 'bg-red-500/10 text-red-400' },
};

export function PortfolioTable() {
  const portfolio = useEntarcStore((state) => state.portfolio);
  const projects = useEntarcStore((state) => state.projects);
  const updateExitStrategy = useEntarcStore((state) => state.updateExitStrategy);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getProject = (projectId: string) => {
    return (projects ?? []).find((p) => p?.id === projectId);
  };

  if (!mounted || isLoading) {
    return (
      <GlassCard>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Your Investments</h3>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </GlassCard>
    );
  }

  if ((portfolio?.length ?? 0) === 0) {
    return (
      <GlassCard>
        <StateBlock
          type="empty"
          title="No Investments Yet"
          message="Start exploring projects to build your portfolio"
          action={{
            label: 'Discover Projects',
            onClick: () => window.location.href = '/discovery',
          }}
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Your Investments</h3>
              <p className="text-sm text-slate-400">
                {portfolio?.length ?? 0} active positions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30 bg-slate-900/30">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Project
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                Invested
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                Current Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                P/L
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                ROI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Exit Strategy
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {(portfolio ?? []).map((position) => {
              const project = getProject(position?.projectId ?? '');
              const isProfit = (position?.pnl ?? 0) >= 0;
              const strategyConfig = exitStrategyConfig[position?.exitStrategy ?? 'hold'];

              return (
                <tr
                  key={position?.id}
                  className="transition-colors hover:bg-slate-800/30"
                >
                  {/* Project */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 text-xl">
                        {project?.logoEmoji ?? '📊'}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {project?.name ?? 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-400">
                          {project?.category ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Invested */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <p className="font-medium text-white">
                      ${(position?.investedAmount ?? 0).toLocaleString()}
                    </p>
                  </td>

                  {/* Current Value */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <p className="font-medium text-white">
                      ${(position?.currentValue ?? 0).toLocaleString()}
                    </p>
                  </td>

                  {/* P/L */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isProfit ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <p
                        className={cn(
                          'font-medium',
                          isProfit ? 'text-emerald-400' : 'text-red-400'
                        )}
                      >
                        {isProfit ? '+' : ''}
                        ${(position?.pnl ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </td>

                  {/* ROI */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-sm font-medium',
                        isProfit
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      )}
                    >
                      {isProfit ? '+' : ''}
                      {(position?.roi ?? 0).toFixed(1)}%
                    </span>
                  </td>

                  {/* Exit Strategy */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      value={position?.exitStrategy ?? 'hold'}
                      onChange={(e) =>
                        updateExitStrategy(
                          position?.id ?? '',
                          e.target.value as ExitStrategy
                        )
                      }
                      className={cn(
                        'rounded-lg border border-slate-700/50 px-3 py-1.5',
                        'text-sm font-medium',
                        'focus:border-cyan-500/50 focus:outline-none',
                        strategyConfig.color
                      )}
                    >
                      <option value="hold">Hold</option>
                      <option value="partial_exit">Partial Exit</option>
                      <option value="full_exit">Full Exit</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/projects/${position?.projectId ?? ''}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                    >
                      View
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
