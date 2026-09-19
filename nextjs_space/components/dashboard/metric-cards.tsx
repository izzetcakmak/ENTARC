'use client';

// MetricCards Component - Dashboard metric display cards
// Real figures from /api/dashboard: escrowed capital, funded projects, releases

import { GlassCard } from '@/components/shared/glass-card';
import { NETWORK_LABEL } from '@/lib/arc-network';
import { formatUsdc, type DashboardMetricsData } from '@/lib/dashboard-types';
import { cn } from '@/lib/utils';
import {
  Wallet,
  FolderKanban,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Unlock,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: typeof Wallet;
  trend?: number;
  iconColor: string;
}

function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  iconColor,
}: MetricCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <GlassCard hover className="relative overflow-hidden">
      {/* Background glow */}
      <div
        className={cn(
          'absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl',
          iconColor
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {subValue && (
            <p className="mt-1 text-xs text-slate-500">{subValue}</p>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            iconColor.replace('bg-', 'bg-opacity-20 ')
          )}
        >
          <Icon className={cn('h-6 w-6', iconColor.replace('bg-', 'text-').replace('-500', '-400'))} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-400" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              isPositive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {isPositive ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500">vs last month</span>
        </div>
      )}
    </GlassCard>
  );
}

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
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue.current + (targetValue - startValue.current) * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

export function MetricCards({ metrics }: { metrics: DashboardMetricsData | null }) {
  // Animated values
  const animatedCommitted = useAnimatedCounter(metrics?.committed ?? 0, 1500);
  const animatedReleased = useAnimatedCounter(metrics?.released ?? 0, 1500);
  const animatedLocked = useAnimatedCounter(metrics?.locked ?? 0, 1500);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Capital Committed"
        value={formatUsdc(animatedCommitted)}
        subValue={`USDC escrowed by the agent on ${NETWORK_LABEL}`}
        icon={Wallet}
        iconColor="bg-cyan-500"
      />

      <MetricCard
        title="Funded Projects"
        value={String(metrics?.fundedProjects ?? 0)}
        subValue="With an on-chain escrow"
        icon={FolderKanban}
        iconColor="bg-violet-500"
      />

      <MetricCard
        title="Avg Trust Score"
        value={metrics?.averageTrustScore != null ? `${metrics.averageTrustScore}/100` : '—'}
        subValue="AI score of funded projects"
        icon={TrendingUp}
        iconColor="bg-emerald-500"
      />

      <MetricCard
        title="Released / Locked"
        value={formatUsdc(animatedReleased)}
        subValue={`${formatUsdc(animatedLocked)} locked`}
        icon={Unlock}
        iconColor="bg-amber-500"
      />
    </div>
  );
}
