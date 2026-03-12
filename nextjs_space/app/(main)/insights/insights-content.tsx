'use client';

// InsightsContent - Real Arc Ecosystem AI Insights
// Fetches real projects and generates AI analysis

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
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export function InsightsContent() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<ArcProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjects = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await fetch('/api/discovery/arc-ecosystem?type=pre-tge&limit=20');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchProjects();
  }, [fetchProjects]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <span className="text-slate-400">Loading Arc Ecosystem insights...</span>
        </div>
      </div>
    );
  }

  // Generate insights from real Arc Ecosystem data
  const totalProjects = projects.length;
  const avgTrustScore = totalProjects > 0
    ? projects.reduce((sum, p) => sum + p.trustScore, 0) / totalProjects
    : 0;
  const highTrustProjects = projects.filter((p) => p.trustScore >= 80).length;
  const bullishProjects = projects.filter((p) => p.sentiment === 'Bullish').length;
  const verifiedProjects = projects.filter((p) => p.verified).length;
  const highActivityProjects = projects.filter((p) => p.activityLevel === 'High').length;

  const insights = [
    {
      icon: Shield,
      title: 'Verified Projects',
      description: `${verifiedProjects} of ${totalProjects} projects verified on Arc Hub`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Bullish Sentiment',
      description: `${bullishProjects} projects with bullish market sentiment`,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Target,
      title: 'High Trust Projects',
      description: `${highTrustProjects} projects with trust score above 80`,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
    {
      icon: Zap,
      title: 'High Activity',
      description: `${highActivityProjects} projects with high development activity`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  // Top recommendations - sorted by trust score
  const topRecommendations = projects
    .filter((p) => p.trustScore >= 70)
    .slice(0, 5);

  // Risk alerts - lower score or neutral/bearish sentiment
  const riskAlerts = projects
    .filter((p) => p.trustScore < 70 || p.sentiment !== 'Bullish')
    .slice(0, 3);

  const getRecommendation = (project: ArcProject) => {
    if (project.trustScore >= 85 && project.sentiment === 'Bullish') return 'STRONG_BUY';
    if (project.trustScore >= 75 && project.sentiment === 'Bullish') return 'BUY';
    if (project.trustScore >= 65) return 'HOLD';
    return 'WATCH';
  };

  const recommendationColors: Record<string, string> = {
    'STRONG_BUY': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'BUY': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'HOLD': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'WATCH': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">AI Insights</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-slate-400">
                Real-time analysis of Arc Ecosystem Pre-TGE projects
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchProjects(true)}
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

      {/* Top Recommendations */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Top Recommendations</h2>
          <span className="text-xs text-slate-500 ml-2">Based on Trust Score & Sentiment</span>
        </div>
        <div className="space-y-4">
          {topRecommendations.map((project) => {
            const rec = getRecommendation(project);
            return (
              <div
                key={project.id}
                className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{project.logoEmoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{project.name}</p>
                        {project.verified && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{project.tagline}</p>
                    </div>
                  </div>
                  <span className={cn('rounded-full px-3 py-1 text-xs font-medium border', recommendationColors[rec])}>
                    {rec.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Metrics */}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-cyan-400" />
                    Trust: {project.trustScore}
                  </span>
                  <span>⭐ {project.metrics.githubStars} stars</span>
                  <span>💬 {project.metrics.discordMembers.toLocaleString()} Discord</span>
                  <span>🗳️ {project.metrics.arcHubVotes} votes</span>
                </div>

                {/* Contact Links */}
                {project.contact && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                    <span className="text-xs text-slate-500 mr-2">Contact:</span>
                    {project.contact.website && (
                      <a
                        href={project.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all text-xs"
                      >
                        <Globe className="h-3 w-3" />
                        Website
                      </a>
                    )}
                    {project.contact.github && (
                      <a
                        href={project.contact.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 transition-all text-xs"
                      >
                        <Github className="h-3 w-3" />
                        GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Risk Alerts */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Projects to Watch</h2>
        </div>
        <div className="space-y-3">
          {riskAlerts.length > 0 ? riskAlerts.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-lg bg-amber-500/5 border border-amber-500/20 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{project.logoEmoji}</span>
                <div>
                  <p className="font-medium text-white">{project.name}</p>
                  <p className="text-xs text-slate-400">
                    {project.sentiment !== 'Bullish' ? `${project.sentiment} sentiment` : `Trust score: ${project.trustScore}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                <span className={cn(
                  'text-xs px-2 py-1 rounded',
                  project.sentiment === 'Bullish' ? 'text-emerald-400' : project.sentiment === 'Neutral' ? 'text-amber-400' : 'text-red-400'
                )}>
                  {project.trustScore}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-center text-sm text-slate-500 py-4">
              All projects are performing well
            </p>
          )}
        </div>
      </GlassCard>

      {/* Market Overview */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Market Overview</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-2xl font-bold text-white">{avgTrustScore.toFixed(1)}</p>
            <p className="text-sm text-slate-400">Avg Trust Score</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-2xl font-bold text-white">${(projects.reduce((sum, p) => sum + p.metrics.fundingTarget, 0) / 1000000).toFixed(1)}M</p>
            <p className="text-sm text-slate-400">Total Funding Target</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-2xl font-bold text-white">{projects.reduce((sum, p) => sum + p.metrics.githubStars, 0).toLocaleString()}</p>
            <p className="text-sm text-slate-400">Total GitHub Stars</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
