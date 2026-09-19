'use client';

// RecentActivity Component - the agent's real on-chain activity
// Escrow fundings and milestone releases, straight from /api/dashboard

import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import { NETWORK_LABEL } from '@/lib/arc-network';
import { formatUsdc, type DashboardActivityItem } from '@/lib/dashboard-types';
import { Clock, ArrowUpRight, ExternalLink, TrendingUp, Milestone } from 'lucide-react';
import Link from 'next/link';

const activityIcons = {
  investment: TrendingUp,
  release: Milestone,
};

const activityColors = {
  investment: 'text-emerald-400 bg-emerald-500/10',
  release: 'text-cyan-400 bg-cyan-500/10',
};

export function RecentActivity({ activities }: { activities: DashboardActivityItem[] }) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <GlassCard>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Clock className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <p className="text-sm text-slate-400">Agent transfers settled on {NETWORK_LABEL}</p>
          </div>
        </div>
        <Link
          href="/deal-flow"
          className="flex items-center gap-1 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
        >
          View All
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.length === 0 && (
          <p className="rounded-xl bg-slate-800/30 p-4 text-sm text-slate-400">
            No on-chain activity on {NETWORK_LABEL} yet. Fundings and milestone releases appear
            here as soon as the agent settles them.
          </p>
        )}

        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className={cn(
                'flex items-center gap-4 rounded-xl p-3',
                'transition-all duration-200',
                'hover:bg-slate-800/50'
              )}
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClass)}>
                <Icon className="h-5 w-5" />
              </div>

              <Link href="/deal-flow" className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{activity.projectName}</p>
                <p className="text-xs text-slate-400 truncate">{activity.description}</p>
              </Link>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-emerald-400">{formatUsdc(activity.amount)}</p>
                <p className="text-xs text-slate-500">{formatTime(activity.timestamp)}</p>
              </div>

              {activity.explorerUrl && (
                <a
                  href={activity.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-slate-400 transition-colors hover:text-cyan-400"
                  title="View transaction on the Arc explorer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
