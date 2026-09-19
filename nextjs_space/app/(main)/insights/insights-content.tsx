'use client';

// InsightsContent - what the agent actually knows
// Agent analyses come from the database; watchlist activity is live GitHub data.

import { GlassCard } from '@/components/shared/glass-card';
import { useEffect, useState, useCallback } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Shield,
  Zap,
  Target,
  Globe,
  Github,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface WatchlistProject {
  id: string;
  name: string;
  tagline: string;
  logoEmoji: string;
  trustScore: number | null;
  activityLevel: string;
  metrics: {
    githubStars: number | null;
    commits30d: number | null;
    lastPush: string | null;
  };
  contact?: { github?: string; website?: string };
}

interface AnalysedProject {
  id: string;
  name: string;
  tagline: string;
  logoEmoji: string;
  aiTrustScore: number | null;
  riskLevel: string;
  status: string;
  aiAnalysis: { recommendation?: string; summary?: string } | null;
}

const DORMANT_DAYS = 90;

const recommendationColors: Record<string, string> = {
  STRONG_BUY: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  BUY: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  HOLD: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  AVOID: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function InsightsContent() {
  const [mounted, setMounted] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistProject[]>([]);
  const [analysed, setAnalysed] = useState<AnalysedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [eco, approved, funded] = await Promise.all([
        fetch('/api/discovery/arc-ecosystem?limit=20').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/projects?status=APPROVED').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/projects?status=FUNDED').then((r) => (r.ok ? r.json() : null)),
      ]);
      setWatchlist(eco?.projects ?? []);
      setAnalysed(
        [...(approved?.projects ?? []), ...(funded?.projects ?? [])]
          .filter((p: AnalysedProject) => p.aiTrustScore != null)
          .sort((a: AnalysedProject, b: AnalysedProject) => (b.aiTrustScore ?? 0) - (a.aiTrustScore ?? 0))
      );
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <span className="text-slate-400">Loading insights...</span>
        </div>
      </div>
    );
  }

  const activeRepos = watchlist.filter((p) => (p.metrics.commits30d ?? 0) > 0).length;
  const dormant = watchlist.filter((p) => (daysSince(p.metrics.lastPush) ?? 0) > DORMANT_DAYS);
  const highTrust = analysed.filter((p) => (p.aiTrustScore ?? 0) >= 70).length;
  const avgTrust = analysed.length
    ? analysed.reduce((sum, p) => sum + (p.aiTrustScore ?? 0), 0) / analysed.length
    : null;
  const totalStars = watchlist.reduce((sum, p) => sum + (p.metrics.githubStars ?? 0), 0);
  const totalCommits = watchlist.reduce((sum, p) => sum + (p.metrics.commits30d ?? 0), 0);

  const insights = [
    {
      icon: Shield,
      title: 'Analysed by the Agent',
      description: `${analysed.length} project${analysed.length === 1 ? '' : 's'} with a due-diligence score`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Target,
      title: 'Fundable',
      description: `${highTrust} clear the agent's trust threshold (≥ 70)`,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
    {
      icon: Zap,
      title: 'Active Repositories',
      description: `${activeRepos} of ${watchlist.length} watchlist repos had commits in the last 30 days`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: AlertTriangle,
      title: 'Dormant',
      description: `${dormant.length} watchlist repos with no push in ${DORMANT_DAYS}+ days`,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <GlassCard padding="lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20">
              <Brain className="h-7 w-7 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Insights</h1>
              <p className="text-slate-400">
                The agent&apos;s own analyses, plus live GitHub activity of the Arc watchlist
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </GlassCard>

      {/* Quick Insights Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <GlassCard key={index} hover>
              <div className="flex items-start gap-3">
                <div className={cn('rounded-xl p-2.5', insight.bgColor)}>
                  <Icon className={cn('h-5 w-5', insight.color)} />
                </div>
                <div>
                  <p className="font-medium text-white">{insight.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{insight.description}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Agent analyses */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Agent Analyses</h2>
          <span className="text-xs text-slate-500 ml-2">Scores and recommendations written by the agent</span>
        </div>
        <div className="space-y-4">
          {analysed.length === 0 && (
            <p className="rounded-xl bg-slate-800/30 p-4 text-sm text-slate-400">
              The agent has not analysed any project yet.{' '}
              <Link href="/submit-project" className="text-cyan-400 hover:text-cyan-300">
                Submit a project
              </Link>{' '}
              and it will be scored here.
            </p>
          )}
          {analysed.map((project) => {
            const rec = project.aiAnalysis?.recommendation;
            return (
              <div key={project.id} className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{project.logoEmoji}</span>
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-sm text-slate-400">{project.tagline}</p>
                    </div>
                  </div>
                  {rec && (
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium border',
                        recommendationColors[rec] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      )}
                    >
                      {rec.replace('_', ' ')}
                    </span>
                  )}
                </div>
                {project.aiAnalysis?.summary && (
                  <p className="mt-3 text-sm text-slate-300">{project.aiAnalysis.summary}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-cyan-400" />
                    Trust: {project.aiTrustScore}/100
                  </span>
                  <span>Risk: {project.riskLevel}</span>
                  <span>Status: {project.status.replace('_', ' ')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Watchlist activity */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Github className="h-5 w-5 text-slate-300" />
          <h2 className="text-lg font-semibold text-white">Watchlist Activity</h2>
          <span className="text-xs text-slate-500 ml-2">Live from GitHub</span>
        </div>
        <div className="space-y-3">
          {watchlist.map((project) => {
            const idle = daysSince(project.metrics.lastPush);
            const isDormant = (idle ?? 0) > DORMANT_DAYS;
            return (
              <div
                key={project.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3',
                  isDormant ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-800/30 border-slate-700/30'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{project.logoEmoji}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{project.name}</p>
                    <p className="text-xs text-slate-400">
                      ⭐ {project.metrics.githubStars ?? '—'} · {project.metrics.commits30d ?? '—'} commits (30d)
                      {idle != null && ` · last push ${idle}d ago`}
                      {isDormant && ' · dormant'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {project.contact?.website && (
                    <a href={project.contact.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {project.contact?.github && (
                    <a href={project.contact.github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-slate-800/50 text-slate-400 hover:text-cyan-400">
                      <Github className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <span className="text-xs px-2 py-1 rounded text-slate-400">
                    {project.trustScore != null ? `Trust ${project.trustScore}` : 'Not analysed'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Overview */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Overview</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-2xl font-bold text-white">{avgTrust != null ? avgTrust.toFixed(1) : '—'}</p>
            <p className="text-sm text-slate-400">Avg Trust Score (analysed projects)</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-2xl font-bold text-white">{totalCommits.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Watchlist Commits (30d)</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-2xl font-bold text-white">{totalStars.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Watchlist GitHub Stars</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
