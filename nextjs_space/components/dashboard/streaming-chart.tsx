'use client';

// StreamingChart Component - escrow funds over time
// Cumulative released vs. still-locked USDC, from real agent transfers

import { GlassCard } from '@/components/shared/glass-card';
import { Activity } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { NETWORK_LABEL } from '@/lib/arc-network';
import { formatUsdc, type DashboardHistoryPoint } from '@/lib/dashboard-types';

export function StreamingChart({ history }: { history: DashboardHistoryPoint[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(
    () =>
      history.map((point) => ({
        time: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        released: point.released,
        locked: point.locked,
      })),
    [history]
  );

  if (!mounted) {
    return (
      <GlassCard className="h-96">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="relative">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <Activity className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Escrow Funds</h3>
          <p className="text-sm text-slate-400">
            Released vs. locked USDC on {NETWORK_LABEL}, last 30 days
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="releasedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lockedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(value) => formatUsdc(Number(value))}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number, name: string) => [
                formatUsdc(value),
                name === 'released' ? 'Released' : 'Locked',
              ]}
            />
            <Area
              type="monotone"
              dataKey="released"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#releasedGradient)"
              animationDuration={500}
            />
            <Area
              type="monotone"
              dataKey="locked"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#lockedGradient)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-cyan-400" />
          <span className="text-sm text-slate-400">Released Funds</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="text-sm text-slate-400">Locked in Escrow</span>
        </div>
      </div>
    </GlassCard>
  );
}
