'use client';

// StreamingChart Component - Live streaming funds visualization
// Shows real-time fund release with Recharts

import { GlassCard } from '@/components/shared/glass-card';
import { useEntarcStore } from '@/store/use-entarc-store';
import { cn } from '@/lib/utils';
import { Activity, Play, Pause } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { generateStreamingHistory } from '@/lib/mock-data';

interface ChartDataPoint {
  time: string;
  released: number;
  locked: number;
}

export function StreamingChart() {
  const {
    isStreamingActive,
    startStreaming,
    stopStreaming,
    getDashboardMetrics,
  } = useEntarcStore();

  const metrics = getDashboardMetrics();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize chart data
  useEffect(() => {
    setMounted(true);
    const history = generateStreamingHistory(30);
    const formattedData = history.map((point) => ({
      time: new Date(point?.timestamp ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      released: point?.released ?? 0,
      locked: point?.locked ?? 0,
    }));
    setChartData(formattedData);

    // Auto-start streaming simulation
    startStreaming();

    return () => {
      stopStreaming();
    };
  }, []);

  // Update chart with real-time data
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...(prev ?? [])];
        const lastPoint = newData[newData.length - 1];
        
        if (lastPoint) {
          // Update last point with current metrics
          newData[newData.length - 1] = {
            ...lastPoint,
            released: metrics?.totalReleased ?? lastPoint.released,
            locked: metrics?.totalLocked ?? lastPoint.locked,
          };
        }
        
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, metrics]);

  const toggleStreaming = () => {
    if (isStreamingActive) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Streaming</h3>
            <p className="text-sm text-slate-400">Real-time fund release tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-1.5">
            <div className="relative">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isStreamingActive ? 'bg-emerald-400' : 'bg-slate-500'
                )}
              />
              {isStreamingActive && (
                <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-400" />
              )}
            </div>
            <span className="text-xs text-slate-400">
              {isStreamingActive ? 'Live' : 'Paused'}
            </span>
          </div>

          {/* Toggle button */}
          <button
            onClick={toggleStreaming}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2',
              'text-sm font-medium transition-all duration-200',
              isStreamingActive
                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            )}
          >
            {isStreamingActive ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            )}
          </button>
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
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
                formatCurrency(value),
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
