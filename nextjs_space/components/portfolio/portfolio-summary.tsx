'use client';

// PortfolioSummary Component - Portfolio overview cards
// Shows total value, P/L, and allocation breakdown

import { useEntarcStore } from '@/store/use-entarc-store';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

// Animated counter hook
function useAnimatedCounter(targetValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    startValue.current = displayValue;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue.current + (targetValue - startValue.current) * easeOutQuart;
      setDisplayValue(currentValue);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

export function PortfolioSummary() {
  const portfolio = useEntarcStore((state) => state.portfolio);
  const projects = useEntarcStore((state) => state.projects);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate totals
  const totalInvested = (portfolio ?? []).reduce(
    (sum, p) => sum + (p?.investedAmount ?? 0),
    0
  );
  const totalValue = (portfolio ?? []).reduce(
    (sum, p) => sum + (p?.currentValue ?? 0),
    0
  );
  const totalPnL = totalValue - totalInvested;
  const totalROI = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Get allocation by category
  const allocationByCategory = (portfolio ?? []).reduce((acc, pos) => {
    const project = (projects ?? []).find((p) => p?.id === pos?.projectId);
    const category = project?.category ?? 'Unknown';
    acc[category] = (acc[category] ?? 0) + (pos?.currentValue ?? 0);
    return acc;
  }, {} as Record<string, number>);

  // Animated values
  const animatedValue = useAnimatedCounter(mounted ? totalValue : 0, 1500);
  const animatedPnL = useAnimatedCounter(mounted ? totalPnL : 0, 1500);
  const animatedROI = useAnimatedCounter(mounted ? totalROI : 0, 1200);

  const isProfit = totalPnL >= 0;

  const categoryColors: Record<string, string> = {
    DeFi: 'bg-cyan-500',
    Infrastructure: 'bg-violet-500',
    Gaming: 'bg-pink-500',
    NFT: 'bg-amber-500',
    DAO: 'bg-emerald-500',
    'AI/ML': 'bg-blue-500',
    Privacy: 'bg-slate-500',
    Social: 'bg-rose-500',
    Unknown: 'bg-slate-600',
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Value */}
      <GlassCard hover>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Portfolio Value</p>
            <p className="mt-2 text-3xl font-bold text-white">
              ${animatedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Invested: ${totalInvested.toLocaleString()}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
            <Wallet className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
      </GlassCard>

      {/* Total P/L */}
      <GlassCard hover>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Profit/Loss</p>
            <div className="mt-2 flex items-center gap-2">
              {isProfit ? (
                <ArrowUpRight className="h-6 w-6 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-6 w-6 text-red-400" />
              )}
              <p
                className={cn(
                  'text-3xl font-bold',
                  isProfit ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {isProfit ? '+' : ''}
                ${animatedPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                isProfit ? 'text-emerald-400/70' : 'text-red-400/70'
              )}
            >
              {isProfit ? '+' : ''}
              {animatedROI.toFixed(1)}% ROI
            </p>
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              isProfit ? 'bg-emerald-500/10' : 'bg-red-500/10'
            )}
          >
            {isProfit ? (
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-400" />
            )}
          </div>
        </div>
      </GlassCard>

      {/* Allocation */}
      <GlassCard hover>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400">Portfolio Allocation</p>
            <div className="mt-3 space-y-2">
              {Object.entries(allocationByCategory)
                .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
                .slice(0, 4)
                .map(([category, value]) => {
                  const percentage = totalValue > 0 ? ((value ?? 0) / totalValue) * 100 : 0;
                  return (
                    <div key={category} className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          categoryColors[category] ?? 'bg-slate-500'
                        )}
                      />
                      <span className="flex-1 text-xs text-slate-400">{category}</span>
                      <span className="text-xs font-medium text-white">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
            <PieChart className="h-6 w-6 text-violet-400" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
