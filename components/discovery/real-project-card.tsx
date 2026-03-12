'use client';

// RealProjectCard - Display real project data from APIs
// Shows crypto projects from CoinMarketCap or GitHub repos

import { GlassCard } from '@/components/shared/glass-card';
import { TrustScoreBadge } from '@/components/shared/trust-score-badge';
import { cn } from '@/lib/utils';
import {
  Github,
  Star,
  GitFork,
  Activity,
  Globe,
} from 'lucide-react';

interface ArcProject {
  id: string;
  name: string;
  tagline: string;
  category: string;
  stage: string;
  trustScore: number;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  activityLevel: string;
  logoEmoji: string;
  metrics: {
    githubStars: number;
    commits30d: number;
    contributors: number;
    discordMembers: number;
    arcHubVotes: number;
    fundingTarget: number;
  };
  contact?: {
    github?: string;
    website?: string;
  };
  tags: string[];
  verified: boolean;
  source: string;
}

interface GitHubProject {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  category: string;
  trustScore: number;
  sentiment: string;
  activityLevel: string;
  github: {
    url: string;
    stars: number;
    forks: number;
    language: string | null;
    lastPush: string;
  };
  owner: {
    name: string;
    avatar: string;
  };
  source: string;
}

type Project = ArcProject | GitHubProject;

function isArcProject(project: Project): project is ArcProject {
  return project.source === 'arc-ecosystem';
}

function isGitHubProject(project: Project): project is GitHubProject {
  return project.source === 'github';
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function RealProjectCard({ project }: { project: Project }) {
  const sentimentColors = {
    Bullish: 'text-emerald-400',
    Neutral: 'text-amber-400',
    Bearish: 'text-red-400',
  };

  const categoryColors: Record<string, string> = {
    DeFi: 'bg-violet-500/20 text-violet-400',
    Infrastructure: 'bg-blue-500/20 text-blue-400',
    Gaming: 'bg-pink-500/20 text-pink-400',
    'AI/ML': 'bg-cyan-500/20 text-cyan-400',
    NFT: 'bg-orange-500/20 text-orange-400',
    Social: 'bg-green-500/20 text-green-400',
  };

  if (isArcProject(project)) {
    return (
      <GlassCard hover className="group cursor-pointer transition-all duration-300">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-2xl">
                {project.logoEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {project.name}
                  </h3>
                  {project.verified && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{project.tagline}</p>
              </div>
            </div>
            <TrustScoreBadge score={project.trustScore} size="sm" />
          </div>

          {/* Stage Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              🚀 {project.stage}
            </span>
            <span className={cn('text-xs', sentimentColors[project.sentiment])}>
              {project.sentiment}
            </span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-slate-800/30 p-2 text-center">
              <p className="text-xs text-slate-500">GitHub</p>
              <p className="text-sm font-semibold text-white flex items-center justify-center gap-1">
                <Star className="h-3 w-3 text-amber-400" />
                {formatCompact(project.metrics.githubStars)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-2 text-center">
              <p className="text-xs text-slate-500">Discord</p>
              <p className="text-sm font-semibold text-white">
                {formatCompact(project.metrics.discordMembers)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-2 text-center">
              <p className="text-xs text-slate-500">Arc Votes</p>
              <p className="text-sm font-semibold text-cyan-400">
                {project.metrics.arcHubVotes}
              </p>
            </div>
          </div>

          {/* Activity */}
          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-2">
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">
                {project.metrics.commits30d} commits (30d)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-slate-500" />
              <span className="text-xs text-slate-500">{project.activityLevel}</span>
            </div>
          </div>

          {/* Contact Links - Only Globe (website) + GitHub */}
          {project.contact && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
              {project.contact.website && (
                <a
                  href={project.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                  title="Website"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {project.contact.github && (
                <a
                  href={project.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-800/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 transition-all"
                  title="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              <div className="flex-1" />
              <span className={cn(
                'px-2 py-1 rounded-md text-xs font-medium',
                categoryColors[project.category] || 'bg-slate-500/20 text-slate-400'
              )}>
                {project.category}
              </span>
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  if (isGitHubProject(project)) {
    return (
      <GlassCard hover className="group cursor-pointer transition-all duration-300">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={project.owner.avatar}
                alt={project.owner.name}
                className="h-12 w-12 rounded-xl"
              />
              <div>
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-400">{project.owner.name}</p>
              </div>
            </div>
            <TrustScoreBadge score={project.trustScore} size="sm" />
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 line-clamp-2">
            {project.tagline}
          </p>

          {/* GitHub Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">{formatCompact(project.github.stars)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <GitFork className="h-4 w-4" />
              <span className="text-sm">{formatCompact(project.github.forks)}</span>
            </div>
            {project.github.language && (
              <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
                {project.github.language}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <span className={cn(
              'px-2 py-1 rounded-md text-xs font-medium',
              categoryColors[project.category] || 'bg-slate-500/20 text-slate-400'
            )}>
              {project.category}
            </span>
            <a
              href={project.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="h-3 w-3" />
              View on GitHub
            </a>
          </div>
        </div>
      </GlassCard>
    );
  }

  return null;
}
