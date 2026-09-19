'use client';

// ProjectDetailContent - Client component for project detail page
// Renders project header and tabbed content

import { useEntarcStore } from '@/store/use-entarc-store';
import { GlassCard } from '@/components/shared/glass-card';
import { TrustScoreBadge } from '@/components/shared/trust-score-badge';
import { ProjectTabs } from '@/components/projects/project-tabs';
import { StateBlock } from '@/components/shared/state-block';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  MessageCircle,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectDetailContentProps {
  projectId: string;
}

export function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const [mounted, setMounted] = useState(false);
  const getProjectById = useEntarcStore((state) => state.getProjectById);
  const getPortfolioForProject = useEntarcStore((state) => state.getPortfolioForProject);

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

  const project = getProjectById(projectId);
  const portfolio = getPortfolioForProject(projectId);

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <StateBlock
          type="error"
          title="Project Not Found"
          message="The project you're looking for doesn't exist or has been removed."
          action={{
            label: 'Back to Discovery',
            onClick: () => window.location.href = '/discovery',
          }}
        />
      </div>
    );
  }

  const riskColors = {
    low: 'text-emerald-400 bg-emerald-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    high: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Link
        href="/discovery"
        className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discovery
      </Link>

      {/* Project Header */}
      <GlassCard glow padding="lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Project Info */}
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 text-4xl">
              {project?.logoEmoji ?? '📊'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {project?.name ?? 'Unknown'}
                </h1>
                <TrustScoreBadge score={project?.trustScore ?? 0} size="lg" />
              </div>
              <p className="mt-1 text-lg text-slate-400">
                {project?.tagline ?? 'No tagline'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-400">
                  {project?.category ?? 'N/A'}
                </span>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium capitalize',
                    riskColors[project?.performance?.riskLevel ?? 'medium']
                  )}
                >
                  {project?.performance?.riskLevel ?? 'medium'} risk
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <QuickStat
              icon={TrendingUp}
              label="ROI"
              value={`${(project?.performance?.roiPercent ?? 0) >= 0 ? '+' : ''}${(project?.performance?.roiPercent ?? 0).toFixed(1)}%`}
              color={(project?.performance?.roiPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
            <QuickStat
              icon={GitBranch}
              label="Commits"
              value={String(project?.github?.commitsLast30Days ?? 0)}
              color="text-cyan-400"
            />
            <QuickStat
              icon={MessageCircle}
              label="Mentions"
              value={(project?.social?.mentionsLast7Days ?? 0).toLocaleString()}
              color="text-violet-400"
            />
            <QuickStat
              icon={Wallet}
              label="Escrow"
              value={`$${((project?.funding?.escrowBalance ?? 0) / 1000).toFixed(0)}K`}
              color="text-amber-400"
            />
          </div>
        </div>

        {/* Investment Status */}
        {portfolio && (
          <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-slate-400">Your Investment</p>
                  <p className="text-lg font-bold text-white">
                    ${(portfolio?.investedAmount ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Current Value</p>
                <p className="text-lg font-bold text-emerald-400">
                  ${(portfolio?.currentValue ?? 0).toLocaleString()}
                  <span className="ml-2 text-sm">
                    ({(portfolio?.pnl ?? 0) >= 0 ? '+' : ''}
                    {(portfolio?.pnl ?? 0).toLocaleString()})
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Tabbed Content */}
      <ProjectTabs project={project} />
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800/30 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn('mt-1 text-lg font-bold', color)}>{value}</p>
    </div>
  );
}
