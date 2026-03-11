'use client';

// InsightsContent - Client component for insights page
// Shows AI-generated insights and market analysis

import { GlassCard } from '@/components/shared/glass-card';
import { useEntarcStore } from '@/store/use-entarc-store';
import { generateAIAnalysis } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Shield,
  Zap,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function InsightsContent() {
  const [mounted, setMounted] = useState(false);
  const projects = useEntarcStore((state) => state.projects);
  const portfolio = useEntarcStore((state) => state.portfolio);

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

  // Generate insights from project data
  const totalProjects = projects?.length ?? 0;
  const avgTrustScore = totalProjects > 0
    ? (projects ?? []).reduce((sum, p) => sum + (p?.trustScore ?? 0), 0) / totalProjects
    : 0;
  const highTrustProjects = (projects ?? []).filter((p) => (p?.trustScore ?? 0) >= 80).length;
  const positiveProjects = (projects ?? []).filter(
    (p) => p?.social?.sentimentLabel === 'positive'
  ).length;

  // Portfolio insights
  const portfolioValue = (portfolio ?? []).reduce(
    (sum, p) => sum + (p?.currentValue ?? 0),
    0
  );
  const profitablePositions = (portfolio ?? []).filter((p) => (p?.pnl ?? 0) > 0).length;

  const insights = [
    {
      icon: Shield,
      title: 'Portfolio Health',
      description: `${profitablePositions} of ${portfolio?.length ?? 0} positions are profitable`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Market Sentiment',
      description: `${positiveProjects} projects showing positive social signals`,
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
      title: 'Average Trust Score',
      description: `${avgTrustScore.toFixed(1)} across all tracked projects`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  // Get recommendations for top projects
  const topRecommendations = (projects ?? [])
    .filter((p) => (p?.trustScore ?? 0) >= 75)
    .slice(0, 3)
    .map((p) => ({
      project: p,
      analysis: generateAIAnalysis(p),
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <GlassCard padding="lg">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20">
            <Brain className="h-7 w-7 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Insights</h1>
            <p className="text-slate-400">
              Intelligent analysis and recommendations powered by machine learning
            </p>
          </div>
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

      {/* AI Recommendations */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Top Recommendations</h2>
        </div>
        <div className="space-y-4">
          {topRecommendations.map(({ project, analysis }, index) => (
            <div
              key={project?.id ?? index}
              className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{project?.logoEmoji ?? '📊'}</span>
                  <div>
                    <p className="font-medium text-white">{project?.name ?? 'Unknown'}</p>
                    <p className="text-sm text-slate-400">{project?.category ?? 'N/A'}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium capitalize',
                    analysis?.recommendation === 'invest'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : analysis?.recommendation === 'watch'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                  )}
                >
                  {analysis?.recommendation ?? 'watch'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm text-slate-300">
                  {analysis?.reasons?.[0] ?? 'No specific reason available'}
                </p>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>Code: {analysis?.codeQualityScore ?? 0}</span>
                <span>Security: {analysis?.securityScore ?? 0}</span>
                <span>Team: {analysis?.teamScore ?? 0}</span>
                <span>Market: {analysis?.marketFitScore ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Market Alerts */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Risk Alerts</h2>
        </div>
        <div className="space-y-3">
          {(projects ?? [])
            .filter((p) => p?.performance?.riskLevel === 'high')
            .slice(0, 3)
            .map((project, index) => (
              <div
                key={project?.id ?? index}
                className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/20 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{project?.logoEmoji ?? '📊'}</span>
                  <div>
                    <p className="font-medium text-white">{project?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-400">High risk classification</p>
                  </div>
                </div>
                <span className="text-sm text-red-400">
                  Trust: {project?.trustScore ?? 0}
                </span>
              </div>
            ))}
          {(projects ?? []).filter((p) => p?.performance?.riskLevel === 'high').length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">
              No high-risk alerts at this time
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
