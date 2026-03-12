'use client';

// RecentActivity Component - Shows recent portfolio activity
// Displays recent transactions and milestone completions

import { GlassCard } from '@/components/shared/glass-card';
import { useEntarcStore } from '@/store/use-entarc-store';
import { cn } from '@/lib/utils';
import {
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Milestone,
} from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'milestone' | 'investment' | 'release' | 'alert';
  projectName: string;
  projectId: string;
  description: string;
  amount?: number;
  timestamp: string;
}

// Generate mock activity data
function generateActivityData(projects: any[]): ActivityItem[] {
  const activities: ActivityItem[] = [];
  
  (projects ?? []).slice(0, 4).forEach((project, index) => {
    const milestone = project?.milestones?.[1]; // Active milestone
    if (milestone) {
      activities.push({
        id: `act-${project?.id ?? index}-ms`,
        type: 'milestone',
        projectName: project?.name ?? 'Unknown',
        projectId: project?.id ?? '',
        description: `Milestone "${milestone?.title ?? 'Unknown'}" progress: ${milestone?.completionPercent?.toFixed(0) ?? 0}%`,
        timestamp: new Date(Date.now() - index * 3600000).toISOString(),
      });
    }

    if (index % 2 === 0) {
      activities.push({
        id: `act-${project?.id ?? index}-rel`,
        type: 'release',
        projectName: project?.name ?? 'Unknown',
        projectId: project?.id ?? '',
        description: 'Funds released from escrow',
        amount: Math.round((milestone?.releasedAmount ?? 1000) / 10),
        timestamp: new Date(Date.now() - (index + 0.5) * 3600000).toISOString(),
      });
    }
  });

  return activities.sort((a, b) => 
    new Date(b?.timestamp ?? 0).getTime() - new Date(a?.timestamp ?? 0).getTime()
  ).slice(0, 6);
}

const activityIcons = {
  milestone: Milestone,
  investment: TrendingUp,
  release: CheckCircle2,
  alert: AlertCircle,
};

const activityColors = {
  milestone: 'text-violet-400 bg-violet-500/10',
  investment: 'text-emerald-400 bg-emerald-500/10',
  release: 'text-cyan-400 bg-cyan-500/10',
  alert: 'text-amber-400 bg-amber-500/10',
};

export function RecentActivity() {
  const projects = useEntarcStore((state) => state.projects);
  const activities = generateActivityData(projects);

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
            <p className="text-sm text-slate-400">Latest updates from your portfolio</p>
          </div>
        </div>
        <Link
          href="/portfolio"
          className="flex items-center gap-1 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
        >
          View All
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activityIcons[activity?.type ?? 'milestone'];
          const colorClass = activityColors[activity?.type ?? 'milestone'];

          return (
            <Link
              key={activity?.id}
              href={`/projects/${activity?.projectId ?? ''}`}
              className={cn(
                'flex items-center gap-4 rounded-xl p-3',
                'transition-all duration-200',
                'hover:bg-slate-800/50'
              )}
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClass)}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {activity?.projectName ?? 'Unknown'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {activity?.description ?? ''}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                {activity?.amount && (
                  <p className="text-sm font-medium text-emerald-400">
                    +${activity.amount.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {formatTime(activity?.timestamp ?? '')}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}
