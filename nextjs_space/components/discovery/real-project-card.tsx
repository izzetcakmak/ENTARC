'use client';

// RealProjectCard - Display real project data from APIs
// Shows crypto projects from CoinMarketCap or GitHub repos

import { GlassCard } from '@/components/shared/glass-card';
import { TrustScoreBadge } from '@/components/shared/trust-score-badge';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Github,
  Star,
  GitFork,
  ExternalLink,
  BarChart3,
  Activity,
} from 'lucide-react';

interface CryptoProject {
  id: string;
  name: string;
  symbol: string;
  tagline: string;
  category: string;
  trustScore: number;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  activityLevel: string;
  metrics: {
    marketCap: number;
    volume24h: number;
    price: number;
    priceChange24h: number;
    priceChange7d: number;
    rank: number;
  };
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

type Project = CryptoProject | GitHubProject;

function isCryptoProject(project: Project): project is CryptoProject {
  return project.source === 'coinmarketcap';
}

function isGitHubProject(project: Project): project is GitHubProject {
  return project.source === 'github';
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
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

  if (isCryptoProject(project)) {
    const priceChangeColor = project.metrics.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400';
    const PriceIcon = project.metrics.priceChange24h >= 0 ? TrendingUp : TrendingDown;

    return (
      <GlassCard hover className="group cursor-pointer transition-all duration-300">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-2xl">
                🪙
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-400">{project.symbol} • Rank #{project.metrics.rank}</p>
              </div>
            </div>
            <TrustScoreBadge score={project.trustScore} size="sm" />
          </div>

          {/* Price & Change */}
          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
            <div>
              <p className="text-xs text-slate-500">Price</p>
              <p className="text-lg font-bold text-white">
                ${project.metrics.price < 0.01 
                  ? project.metrics.price.toFixed(6) 
                  : project.metrics.price.toFixed(2)}
              </p>
            </div>
            <div className={cn('flex items-center gap-1', priceChangeColor)}>
              <PriceIcon className="h-4 w-4" />
              <span className="font-semibold">
                {project.metrics.priceChange24h >= 0 ? '+' : ''}
                {project.metrics.priceChange24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-800/30 p-2">
              <p className="text-xs text-slate-500">Market Cap</p>
              <p className="text-sm font-semibold text-white">
                {formatNumber(project.metrics.marketCap)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-2">
              <p className="text-xs text-slate-500">24h Volume</p>
              <p className="text-sm font-semibold text-white">
                {formatNumber(project.metrics.volume24h)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <span className={cn(
              'px-2 py-1 rounded-md text-xs font-medium',
              categoryColors[project.category] || 'bg-slate-500/20 text-slate-400'
            )}>
              {project.category}
            </span>
            <div className="flex items-center gap-2">
              <span className={cn('text-xs', sentimentColors[project.sentiment as keyof typeof sentimentColors])}>
                {project.sentiment}
              </span>
              <Activity className="h-3 w-3 text-slate-500" />
              <span className="text-xs text-slate-500">{project.activityLevel}</span>
            </div>
          </div>
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
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </GlassCard>
    );
  }

  return null;
}
