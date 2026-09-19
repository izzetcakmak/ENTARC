'use client';

// MetricCards Component - Dashboard metric display cards
// Shows TVL, Active Projects, ROI, and streaming stats

import { GlassCard } from '@/components/shared/glass-card';
import { useEntarcStore } from '@/store/use-entarc-store';
import { cn } from '@/lib/utils';
import {
  Wallet,
  FolderKanban,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Unlock,
  Lock,
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

export function MetricCards() {
  const getDashboardMetrics = useEntarcStore((state) => state.getDashboardMetrics);
  const metrics = getDashboardMetrics();

  // Animated values
  const animatedTVL = useAnimatedCounter(metrics?.tvl ?? 0, 1500);
  const animatedROI = useAnimatedCounter(metrics?.averageROI ?? 0, 1200);
  const animatedReleased = useAnimatedCounter(metrics?.totalReleased ?? 0, 1500);
  const animatedLocked = useAnimatedCounter(metrics?.totalLocked ?? 0, 1500);

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Value Locked"
        value={formatCurrency(animatedTVL)}
        subValue="Across all investments"
        icon={Wallet}
        iconColor="bg-cyan-500"
        trend={12.5}
      />

      <MetricCard
        title="Active Projects"
        value={String(metrics?.activeProjects ?? 0)}
        subValue="Currently funded"
        icon={FolderKanban}
        iconColor="bg-violet-500"
        trend={8.3}
      />

      <MetricCard
        title="Average ROI"
        value={`${animatedROI.toFixed(1)}%`}
        subValue="Portfolio performance"
        icon={TrendingUp}
        iconColor="bg-emerald-500"
        trend={animatedROI}
      />

      <MetricCard
        title="Released / Locked"
        value={formatCurrency(animatedReleased)}
        subValue={`${formatCurrency(animatedLocked)} locked`}
        icon={Unlock}
        iconColor="bg-amber-500"
      />
    </div>
  );
}
