'use client';

// ProjectTabs Component - Tabbed interface for project details
// Contains Overview, AI Analysis, and Streaming & Milestones tabs

import { useState } from 'react';
import type { Project, AIAnalysis } from '@/lib/types';
import { GlassCard } from '@/components/shared/glass-card';
import { TrustScoreBadge } from '@/components/shared/trust-score-badge';
import { useEntarcStore } from '@/store/use-entarc-store';
import { generateAIAnalysis } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  Info,
  Brain,
  Milestone,
  GitBranch,
  Star,
  GitFork,
  Users,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Target,
  ShieldCheck,
  Code,
  Zap,
} from 'lucide-react';

interface ProjectTabsProps {
  project: Project;
}

type TabId = 'overview' | 'analysis' | 'milestones';

const tabs: { id: TabId; label: string; icon: typeof Info }[] = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'analysis', label: 'AI Analysis', icon: Brain },
  { id: 'milestones', label: 'Streaming & Milestones', icon: Milestone },
];

export function ProjectTabs({ project }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5',
                'text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'analysis' && <AnalysisTab project={project} />}
        {activeTab === 'milestones' && <MilestonesTab project={project} />}
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW TAB
// ============================================

function OverviewTab({ project }: { project: Project }) {
  const safeDescription = project?.description ?? 'No description available';
  const safeGithub = project?.github ?? {};
  const safeSocial = project?.social ?? {};
  const safeFunding = project?.funding ?? {};

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Description */}
      <GlassCard className="lg:col-span-2">
        <h3 className="mb-3 text-lg font-semibold text-white">About</h3>
        <p className="leading-relaxed text-slate-300">{safeDescription}</p>
      </GlassCard>

      {/* GitHub Metrics */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">GitHub Activity</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MetricItem
            icon={GitBranch}
            label="Commits (30d)"
            value={String(safeGithub?.commitsLast30Days ?? 0)}
          />
          <MetricItem
            icon={Star}
            label="Stars"
            value={String(safeGithub?.stars ?? 0)}
          />
          <MetricItem
            icon={GitFork}
            label="Forks"
            value={String(safeGithub?.forks ?? 0)}
          />
          <MetricItem
            icon={Users}
            label="Contributors"
            value={String(safeGithub?.contributors ?? 0)}
          />
          <MetricItem
            icon={ShieldCheck}
            label="Test Coverage"
            value={`${safeGithub?.testCoverage ?? 0}%`}
          />
          <MetricItem
            icon={Code}
            label="Complexity"
            value={String(safeGithub?.complexityScore ?? 0)}
          />
        </div>
      </GlassCard>

      {/* Social Metrics */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">Social Signals</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Sentiment</span>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-sm font-medium capitalize',
                safeSocial?.sentimentLabel === 'positive'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : safeSocial?.sentimentLabel === 'negative'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-amber-500/10 text-amber-400'
              )}
            >
              {safeSocial?.sentimentLabel ?? 'neutral'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Sentiment Score</span>
            <span className="text-lg font-semibold text-white">
              {safeSocial?.sentimentScore ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Mentions (7d)</span>
            <span className="text-lg font-semibold text-white">
              {(safeSocial?.mentionsLast7Days ?? 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-sm text-slate-400">Top Keywords</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(safeSocial?.topKeywords ?? []).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-slate-800/50 px-2 py-1 text-xs text-slate-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Funding Info */}
      <GlassCard className="lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Funding & Performance</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-800/30 p-4">
            <p className="text-sm text-slate-400">Valuation</p>
            <p className="mt-1 text-xl font-bold text-white">
              ${((safeFunding?.valuation ?? 0) / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/30 p-4">
            <p className="text-sm text-slate-400">Total Raised</p>
            <p className="mt-1 text-xl font-bold text-white">
              ${((safeFunding?.totalRaise ?? 0) / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/30 p-4">
            <p className="text-sm text-slate-400">Streaming APR</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">
              {safeFunding?.streamingAPR ?? 0}%
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/30 p-4">
            <p className="text-sm text-slate-400">Escrow Balance</p>
            <p className="mt-1 text-xl font-bold text-cyan-400">
              ${((safeFunding?.escrowBalance ?? 0) / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function MetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GitBranch;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-800/30 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

// ============================================
// AI ANALYSIS TAB
// ============================================

function AnalysisTab({ project }: { project: Project }) {
  const analysis = generateAIAnalysis(project);
  const safeAnalysis = analysis ?? {};

  const recommendationConfig = {
    invest: {
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: CheckCircle2,
      label: 'Recommended to Invest',
    },
    watch: {
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Clock,
      label: 'Add to Watchlist',
    },
    reject: {
      color: 'text-red-400 bg-red-500/10 border-red-500/30',
      icon: AlertCircle,
      label: 'Not Recommended',
    },
  };

  const config = recommendationConfig[safeAnalysis?.recommendation ?? 'watch'];
  const RecIcon = config.icon;

  return (
    <div className="space-y-4">
      {/* VC Recommendation */}
      <GlassCard glow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={cn('rounded-xl p-3', config.color)}>
              <RecIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">VC Recommendation</h3>
              <p className={cn('text-sm font-medium', config.color.split(' ')[0])}>
                {config.label}
              </p>
            </div>
          </div>
          <TrustScoreBadge score={project?.trustScore ?? 0} size="lg" />
        </div>
      </GlassCard>

      {/* Score Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          label="Code Quality"
          score={safeAnalysis?.codeQualityScore ?? 0}
          icon={Code}
        />
        <ScoreCard
          label="Security"
          score={safeAnalysis?.securityScore ?? 0}
          icon={ShieldCheck}
        />
        <ScoreCard
          label="Team"
          score={safeAnalysis?.teamScore ?? 0}
          icon={Users}
        />
        <ScoreCard
          label="Market Fit"
          score={safeAnalysis?.marketFitScore ?? 0}
          icon={Target}
        />
      </div>

      {/* Reasons, Risks, Opportunities */}
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h4 className="font-semibold text-white">Reasons to Invest</h4>
          </div>
          <ul className="space-y-2">
            {(safeAnalysis?.reasons ?? []).map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                {reason}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h4 className="font-semibold text-white">Risk Factors</h4>
          </div>
          <ul className="space-y-2">
            {(safeAnalysis?.risks ?? []).map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                {risk}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <h4 className="font-semibold text-white">Opportunities</h4>
          </div>
          <ul className="space-y-2">
            {(safeAnalysis?.opportunities ?? []).map((opp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                {opp}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  icon: Icon,
}: {
  label: string;
  score: number;
  icon: typeof Code;
}) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <GlassCard hover padding="sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">{label}</span>
        </div>
        <span className={cn('text-2xl font-bold', getScoreColor(score))}>
          {score}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            score >= 80
              ? 'bg-emerald-500'
              : score >= 60
                ? 'bg-amber-500'
                : 'bg-red-500'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </GlassCard>
  );
}

// ============================================
// MILESTONES TAB
// ============================================

function MilestonesTab({ project }: { project: Project }) {
  const completeMilestone = useEntarcStore((state) => state.completeMilestone);
  const milestones = project?.milestones ?? [];

  const totalAmount = milestones.reduce((sum, m) => sum + (m?.amount ?? 0), 0);
  const totalReleased = milestones.reduce((sum, m) => sum + (m?.releasedAmount ?? 0), 0);
  const overallProgress = totalAmount > 0 ? (totalReleased / totalAmount) * 100 : 0;

  const statusConfig = {
    completed: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
    },
    active: {
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      icon: Zap,
    },
    pending: {
      color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      icon: Clock,
    },
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <GlassCard glow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Streaming Progress</h3>
            <p className="text-sm text-slate-400">
              ${totalReleased.toLocaleString()} of ${totalAmount.toLocaleString()} released
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-cyan-400" />
              <span className="text-lg font-bold text-cyan-400">
                ${totalReleased.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-400" />
              <span className="text-lg font-bold text-amber-400">
                ${(totalAmount - totalReleased).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">Overall Progress</span>
            <span className="font-medium text-white">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Milestone List */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const config = statusConfig[milestone?.status ?? 'pending'];
          const StatusIcon = config.icon;
          const progress = milestone?.amount ? ((milestone?.releasedAmount ?? 0) / milestone.amount) * 100 : 0;

          return (
            <GlassCard key={milestone?.id ?? index} hover>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={cn('rounded-lg border p-2', config.color)}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {milestone?.title ?? 'Unknown Milestone'}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {milestone?.description ?? 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Success Criteria */}
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-slate-400">Success Criteria:</p>
                    <ul className="space-y-1">
                      {(milestone?.successCriteria ?? []).map((criteria, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-300"
                        >
                          <CheckCircle2
                            className={cn(
                              'h-4 w-4 flex-shrink-0',
                              milestone?.status === 'completed'
                                ? 'text-emerald-400'
                                : 'text-slate-600'
                            )}
                          />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col items-end gap-3 lg:min-w-[200px]">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      ${(milestone?.amount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-400">
                      Due: {milestone?.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="w-full">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-cyan-400">
                        ${(milestone?.releasedAmount ?? 0).toLocaleString()} released
                      </span>
                      <span className="text-slate-400">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          milestone?.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-cyan-500'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  {milestone?.status === 'active' && (
                    <button
                      onClick={() => completeMilestone(project?.id ?? '', milestone?.id ?? '')}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2',
                        'bg-emerald-500/20 text-emerald-400',
                        'text-sm font-medium transition-colors',
                        'hover:bg-emerald-500/30'
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
