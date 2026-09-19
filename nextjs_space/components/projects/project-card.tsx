'use client';

// ProjectCard Component - Individual project card for discovery grid
// Displays project summary with trust score, activity, and sentiment

import { GlassCard } from '@/components/shared/glass-card';
import { TrustScoreBadge } from '@/components/shared/trust-score-badge';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  GitBranch,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
}

const sentimentColors = {
  positive: 'text-emerald-400 bg-emerald-500/10',
  neutral: 'text-amber-400 bg-amber-500/10',
  negative: 'text-red-400 bg-red-500/10',
};

const categoryColors: Record<string, string> = {
  DeFi: 'bg-cyan-500/10 text-cyan-400',
  Infrastructure: 'bg-violet-500/10 text-violet-400',
  Gaming: 'bg-pink-500/10 text-pink-400',
  NFT: 'bg-amber-500/10 text-amber-400',
  DAO: 'bg-emerald-500/10 text-emerald-400',
  'AI/ML': 'bg-blue-500/10 text-blue-400',
  Privacy: 'bg-slate-500/10 text-slate-400',
  Social: 'bg-rose-500/10 text-rose-400',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const safeName = project?.name ?? 'Unknown Project';
  const safeTagline = project?.tagline ?? 'No description';
  const safeCategory = project?.category ?? 'DeFi';
  const safeEmoji = project?.logoEmoji ?? '📊';
  const safeTrustScore = project?.trustScore ?? 0;
  const safeCommits = project?.github?.commitsLast30Days ?? 0;
  const safeSentiment = project?.social?.sentimentLabel ?? 'neutral';
  const safeSentimentScore = project?.social?.sentimentScore ?? 0;
  const safeValuation = project?.funding?.valuation ?? 0;
  const safeRoi = project?.performance?.roiPercent ?? 0;
  const safeStars = project?.github?.stars ?? 0;
  const safeContributors = project?.github?.contributors ?? 0;

  return (
    <Link href={`/projects/${project?.id ?? ''}`}>
      <GlassCard hover className="h-full transition-transform duration-300 hover:scale-[1.02]">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/50 text-2xl">
            {safeEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{safeName}</h3>
            <p className="text-sm text-slate-400 truncate">{safeTagline}</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-slate-500 flex-shrink-0" />
        </div>

        {/* Trust Score */}
        <div className="mt-4">
          <TrustScoreBadge score={safeTrustScore} />
        </div>

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* GitHub Activity */}
          <div className="rounded-lg bg-slate-800/30 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <GitBranch className="h-4 w-4" />
              <span className="text-xs">Commits (30d)</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-white">{safeCommits}</p>
          </div>

          {/* Social Sentiment */}
          <div className="rounded-lg bg-slate-800/30 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Sentiment</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                  sentimentColors[safeSentiment]
                )}
              >
                {safeSentiment}
              </span>
              <span className="text-sm text-slate-400">+{safeSentimentScore}</span>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-700/30 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400">
              <Star className="h-3.5 w-3.5" />
              <span className="text-xs">{safeStars}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">{safeContributors}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                categoryColors[safeCategory] ?? 'bg-slate-500/10 text-slate-400'
              )}
            >
              {safeCategory}
            </span>
            {safeRoi > 0 && (
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">+{safeRoi.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
