'use client';

import { useState, useEffect, useCallback } from 'react';
import { IS_MAINNET, NETWORK_LABEL, explorerTxUrl } from '@/lib/arc-network';
import { GlassCard } from '@/components/shared/glass-card';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  DollarSign,
  Activity,
  BarChart3,
  Zap,
  Globe,
  GitBranch,
  Users,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  ChevronRight,
  Layers,
  Fuel,
  Coins,
  Play,
  Loader2,
  Search,
  ArrowRight,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ================= TYPES =================
interface SignalResult {
  source: string;
  type: string;
  weight: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
  dataPoints: Array<{ label: string; value: number | string }>;
}

interface SignalAnalysis {
  projectName: string;
  compositeScore: number;
  overallTrend: string;
  recommendation: string;
  action: string;
  signals: SignalResult[];
  signalStrength: { strong: number; moderate: number; weak: number };
  timestamp: string;
}

interface PortfolioAnalysis {
  riskRegime: { regime: string; confidence: number; reasoning: string };
  rebalancingPlan: {
    actions: Array<{
      projectId: string;
      projectName: string;
      action: string;
      currentAllocation: number;
      suggestedAllocation: number;
      reason: string;
      urgency: string;
    }>;
    totalReallocation: number;
  };
  riskMetrics: {
    diversificationScore: number;
    concentrationRisk: string;
    portfolioHealthScore: number;
    activeMilestones: number;
    totalProjects: number;
  };
  timestamp: string;
}

interface EscrowResult {
  escrow?: any;
  release?: any;
  pause?: any;
  status?: any;
  message: string;
  circleIntegration?: any;
}

interface NanopaymentStream {
  streamId: string;
  recipientProject: string;
  amountPerSecond: number;
  totalBudget: number;
  durationSeconds: number;
  status: string;
  txHash: string;
  network: string;
}

interface DecisionLogEntry {
  id: string;
  timestamp: string;
  type: 'signal' | 'rebalance' | 'escrow' | 'risk' | 'nanopay';
  action: string;
  details: string;
  status: 'success' | 'pending' | 'error';
}

// Projects come from the database (submitted + analysed). Signals are derived
// only from fields we really have; sources with no data feed stay at zero.
interface AgentProject {
  id: string;
  name: string;
  category: string;
  allocation: number;
  trustScore: number;
  github: { commits30d: number; contributors: number; stars: number };
  social: { mentions: number; followers: number; engagement: number };
  community: { discord: number; votes: number; comments: number };
  milestones: { total: number; completed: number; onTime: number };
  onchain: { transactions: number; uniqueUsers: number; tvl: number };
  signals: { githubActivity: number; socialMomentum: number; milestoneProgress: number; communityGrowth: number };
}

const EMPTY_PROJECT: AgentProject = {
  id: '', name: '', category: '', allocation: 0, trustScore: 0,
  github: { commits30d: 0, contributors: 0, stars: 0 },
  social: { mentions: 0, followers: 0, engagement: 0 },
  community: { discord: 0, votes: 0, comments: 0 },
  milestones: { total: 0, completed: 0, onTime: 0 },
  onchain: { transactions: 0, uniqueUsers: 0, tvl: 0 },
  signals: { githubActivity: 0, socialMomentum: 0, milestoneProgress: 0, communityGrowth: 0 },
};

function toAgentProjects(rows: any[]): AgentProject[] {
  const totalFunding = rows.reduce((sum, r) => sum + (r.currentFunding ?? 0), 0);
  return rows.map((r) => {
    const milestones: any[] = r.milestones ?? [];
    const completed = milestones.filter((m) => m.status === 'RELEASED' || m.status === 'COMPLETED').length;
    const commits = r.githubCommits ?? 0;
    const contributors = r.githubContributors ?? 0;
    const stars = r.githubStars ?? 0;
    const followers = r.twitterFollowers ?? 0;
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      // Real capital share when anything is funded, otherwise an equal-weight watchlist.
      allocation: Math.round(
        totalFunding > 0 ? ((r.currentFunding ?? 0) / totalFunding) * 100 : 100 / rows.length
      ),
      trustScore: r.aiTrustScore ?? 0,
      github: { commits30d: commits, contributors, stars },
      social: { mentions: 0, followers, engagement: 0 },
      community: { discord: 0, votes: 0, comments: 0 },
      milestones: { total: milestones.length, completed, onTime: completed },
      onchain: { transactions: completed, uniqueUsers: 0, tvl: r.currentFunding ?? 0 },
      signals: {
        githubActivity: Math.min(100, commits * 1.5 + contributors * 10 + stars * 0.5),
        socialMomentum: Math.min(100, followers * 0.01),
        milestoneProgress: milestones.length ? (completed / milestones.length) * 100 : 0,
        communityGrowth: 0,
      },
    };
  });
}

// ================= MAIN COMPONENT =================
export function AutonomousAgentDashboard() {
  const [projects, setProjects] = useState<AgentProject[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<AgentProject>(EMPTY_PROJECT);

  useEffect(() => {
    (async () => {
      try {
        const [approved, funded] = await Promise.all(
          ['APPROVED', 'FUNDED'].map((st) =>
            fetch(`/api/projects?status=${st}`).then((r) => (r.ok ? r.json() : null))
          )
        );
        const list = toAgentProjects([...(approved?.projects ?? []), ...(funded?.projects ?? [])]);
        setProjects(list);
        if (list.length) setSelectedProject(list[0]);
      } finally {
        setProjectsLoaded(true);
      }
    })();
  }, []);

  const hasProject = selectedProject.id !== '';
  const [signalAnalysis, setSignalAnalysis] = useState<SignalAnalysis | null>(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [escrowResult, setEscrowResult] = useState<EscrowResult | null>(null);
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>([]);
  const [loadingSignal, setLoadingSignal] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingEscrow, setLoadingEscrow] = useState(false);
  const [nanopayStream, setNanopayStream] = useState<NanopaymentStream | null>(null);
  const [loadingNanopay, setLoadingNanopay] = useState(false);
  const [streamingTick, setStreamingTick] = useState(0);
  const [streamActive, setStreamActive] = useState(false);

  const addLog = useCallback((entry: Omit<DecisionLogEntry, 'id' | 'timestamp'>) => {
    setDecisionLog(prev => [{
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      ...entry,
    }, ...prev].slice(0, 20));
  }, []);

  // ===== 1) SIGNAL ANALYSIS =====
  const runSignalAnalysis = async () => {
    setLoadingSignal(true);
    addLog({ type: 'signal', action: `Signal Analysis: ${selectedProject.name}`, details: 'Analyzing 5 signal sources...', status: 'pending' });
    try {
      const res = await fetch('/api/agent/signal-aggregator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: { ...selectedProject } }),
      });
      const data = await res.json();
      if (data.success) {
        setSignalAnalysis(data.analysis);
        addLog({ type: 'signal', action: `Signal Result: ${data.analysis.action.toUpperCase()}`, details: `${selectedProject.name} — Composite: ${data.analysis.compositeScore}/100, Trend: ${data.analysis.overallTrend}`, status: 'success' });
      } else {
        addLog({ type: 'signal', action: 'Signal Analysis Failed', details: data.error, status: 'error' });
      }
    } catch (err: any) {
      addLog({ type: 'signal', action: 'Signal Analysis Error', details: err.message, status: 'error' });
    }
    setLoadingSignal(false);
  };

  // ===== 2) PORTFOLIO ANALYSIS =====
  const runPortfolioAnalysis = async () => {
    setLoadingPortfolio(true);
    addLog({ type: 'rebalance', action: 'Portfolio Analysis', details: `Analyzing ${projects.length} projects for risk regime...`, status: 'pending' });
    try {
      const res = await fetch('/api/agent/portfolio-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects }),
      });
      const data = await res.json();
      if (data.success) {
        setPortfolioAnalysis(data.analysis);
        addLog({ type: 'risk', action: `Risk Regime: ${data.analysis.riskRegime.regime.toUpperCase()}`, details: `Confidence: ${data.analysis.riskRegime.confidence}% — Health Score: ${data.analysis.riskMetrics.portfolioHealthScore}`, status: 'success' });
      } else {
        addLog({ type: 'rebalance', action: 'Portfolio Analysis Failed', details: data.error, status: 'error' });
      }
    } catch (err: any) {
      addLog({ type: 'rebalance', action: 'Portfolio Analysis Error', details: err.message, status: 'error' });
    }
    setLoadingPortfolio(false);
  };

  // ===== 3) ESCROW STATUS =====
  // Read-only here: funding and milestone releases run from the Agent Console,
  // against a real accepted proposal and behind the spending policy.
  const runEscrowOperation = async () => {
    setLoadingEscrow(true);
    addLog({ type: 'escrow', action: 'Check Escrow Status', details: 'Reading agent wallet, policy budget and funded deals', status: 'pending' });
    try {
      const res = await fetch('/api/agent/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-status' }),
      });
      const data = await res.json();
      if (data.success) {
        setEscrowResult({ ...data, message: `Agent wallet holds ${data.status.usdcBalance} USDC on ${NETWORK_LABEL}` });
        addLog({ type: 'escrow', action: 'Escrow Status — OK', details: `${data.status.usdcBalance} USDC · ${data.status.fundedProposals.length} funded deal(s)`, status: 'success' });
      } else {
        addLog({ type: 'escrow', action: 'Escrow Status Failed', details: data.error, status: 'error' });
      }
    } catch (err: any) {
      addLog({ type: 'escrow', action: 'Escrow Error', details: err.message, status: 'error' });
    }
    setLoadingEscrow(false);
  };

  // ================= RENDER =================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-cyan-400" />
            Autonomous Agent
          </h1>
          <p className="text-slate-400 mt-1">AI-driven portfolio management & social signal intelligence on Arc Network</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">Agentic Track — Adaptive Portfolio</span>
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Agentic Track — Signal Intelligence</span>
          </div>
        </div>
      </div>

      {/* ===== PROJECT SELECTOR ===== */}
      <GlassCard className="border-slate-700/80">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Select Target Project</h3>
        </div>
        {projectsLoaded && projects.length === 0 && (
          <p className="rounded-lg bg-slate-800/30 p-3 text-sm text-slate-400">
            No analysed projects yet.{' '}
            <Link href="/submit-project" className="text-cyan-400 hover:text-cyan-300">Submit a project</Link>{' '}
            — once the agent has scored it, it can be analysed here.
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedProject(p); setSignalAnalysis(null); setEscrowResult(null); }}
              className={cn(
                'rounded-lg border p-3 text-left transition-all',
                selectedProject.id === p.id
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
              )}
            >
              <p className="text-sm font-medium text-white truncate">{p.name}</p>
              <p className="text-xs text-slate-400">{p.category} • Trust: {p.trustScore}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* ===== 1) SIGNAL ANALYSIS ===== */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Signal Aggregation</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Agentic Track</span>
          </div>
          <button
            onClick={runSignalAnalysis}
            disabled={loadingSignal || !hasProject}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm disabled:opacity-50"
          >
            {loadingSignal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Analyze {selectedProject.name}
          </button>
        </div>

        {!signalAnalysis && !loadingSignal && (
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a project and click &quot;Analyze&quot; to run multi-source signal aggregation</p>
          </div>
        )}

        {loadingSignal && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto text-cyan-400 animate-spin mb-2" />
            <p className="text-sm text-cyan-400">Analyzing GitHub, Social, Community, On-Chain, Milestone signals...</p>
          </div>
        )}

        {signalAnalysis && !loadingSignal && (
          <div>
            {/* Composite Score + Recommendation */}
            <div className={cn('rounded-lg p-4 mb-4 border',
              signalAnalysis.action === 'invest' ? 'bg-emerald-500/5 border-emerald-500/30' :
              signalAnalysis.action === 'hold' ? 'bg-blue-500/5 border-blue-500/30' :
              signalAnalysis.action === 'monitor' ? 'bg-yellow-500/5 border-yellow-500/30' :
              'bg-red-500/5 border-red-500/30'
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-white">{signalAnalysis.compositeScore}<span className="text-sm text-slate-400">/100</span></span>
                  <div>
                    <span className={cn('text-sm font-bold uppercase',
                      signalAnalysis.action === 'invest' ? 'text-emerald-400' :
                      signalAnalysis.action === 'hold' ? 'text-blue-400' :
                      signalAnalysis.action === 'monitor' ? 'text-yellow-400' : 'text-red-400'
                    )}>{signalAnalysis.action}</span>
                    <span className="text-xs text-slate-400 ml-2">Trend: {signalAnalysis.overallTrend}</span>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">{signalAnalysis.signalStrength.strong} strong</span>
                  <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-400">{signalAnalysis.signalStrength.moderate} moderate</span>
                  <span className="px-2 py-1 rounded bg-red-500/10 text-red-400">{signalAnalysis.signalStrength.weak} weak</span>
                </div>
              </div>
              <p className="text-sm text-slate-300">{signalAnalysis.recommendation}</p>
            </div>

            {/* Individual Signals */}
            <div className="space-y-2">
              {signalAnalysis.signals.map((s) => {
                const icons: Record<string, typeof GitBranch> = { github: GitBranch, social: Globe, community: Users, onchain: Activity, milestone: Target };
                const Icon = icons[s.type] || Activity;
                return (
                  <div key={s.source} className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium text-white">{s.source}</span>
                        <span className="text-xs text-slate-500">weight: {(s.weight * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.trend === 'up' ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : s.trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-400" /> : <Minus className="h-4 w-4 text-yellow-400" />}
                        <span className={cn('text-sm font-bold', s.score >= 70 ? 'text-emerald-400' : s.score >= 40 ? 'text-yellow-400' : 'text-red-400')}>{s.score}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {s.dataPoints.map((dp) => (
                        <span key={dp.label} className="text-xs"><span className="text-slate-500">{dp.label}: </span><span className="text-slate-300">{dp.value}</span></span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </GlassCard>

      {/* ===== 2) PORTFOLIO ANALYSIS ===== */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Adaptive Portfolio Manager</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">Agentic Track</span>
          </div>
          <button
            onClick={runPortfolioAnalysis}
            disabled={loadingPortfolio || projects.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-colors text-sm disabled:opacity-50"
          >
            {loadingPortfolio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Portfolio Analysis
          </button>
        </div>

        {!portfolioAnalysis && !loadingPortfolio && (
          <div className="text-center py-8 text-slate-500">
            <Target className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Click &quot;Run Portfolio Analysis&quot; to detect risk regime and generate rebalancing plan</p>
          </div>
        )}

        {loadingPortfolio && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto text-violet-400 animate-spin mb-2" />
            <p className="text-sm text-violet-400">Analyzing {projects.length} projects for risk regime detection...</p>
          </div>
        )}

        {portfolioAnalysis && !loadingPortfolio && (
          <div className="space-y-4">
            {/* Risk Regime */}
            <div className={cn('rounded-lg p-4 border',
              portfolioAnalysis.riskRegime.regime === 'risk-on' ? 'bg-emerald-500/5 border-emerald-500/30' :
              portfolioAnalysis.riskRegime.regime === 'risk-off' ? 'bg-red-500/5 border-red-500/30' :
              'bg-yellow-500/5 border-yellow-500/30'
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {portfolioAnalysis.riskRegime.regime === 'risk-on' ? <TrendingUp className="h-6 w-6 text-emerald-400" /> : portfolioAnalysis.riskRegime.regime === 'risk-off' ? <TrendingDown className="h-6 w-6 text-red-400" /> : <Minus className="h-6 w-6 text-yellow-400" />}
                  <span className={cn('text-xl font-bold uppercase',
                    portfolioAnalysis.riskRegime.regime === 'risk-on' ? 'text-emerald-400' :
                    portfolioAnalysis.riskRegime.regime === 'risk-off' ? 'text-red-400' : 'text-yellow-400'
                  )}>{portfolioAnalysis.riskRegime.regime}</span>
                </div>
                <span className="text-lg font-bold text-white">{portfolioAnalysis.riskRegime.confidence}% confidence</span>
              </div>
              <p className="text-sm text-slate-300">{portfolioAnalysis.riskRegime.reasoning}</p>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3 text-center">
                <p className="text-xs text-slate-400">Health Score</p>
                <p className="text-xl font-bold text-white">{portfolioAnalysis.riskMetrics.portfolioHealthScore}</p>
              </div>
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3 text-center">
                <p className="text-xs text-slate-400">Diversification</p>
                <p className="text-xl font-bold text-white">{portfolioAnalysis.riskMetrics.diversificationScore}</p>
              </div>
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3 text-center">
                <p className="text-xs text-slate-400">Concentration Risk</p>
                <p className="text-xl font-bold text-white">{portfolioAnalysis.riskMetrics.concentrationRisk}%</p>
              </div>
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3 text-center">
                <p className="text-xs text-slate-400">Active Milestones</p>
                <p className="text-xl font-bold text-white">{portfolioAnalysis.riskMetrics.activeMilestones}/{portfolioAnalysis.riskMetrics.totalProjects}</p>
              </div>
            </div>

            {/* Rebalancing Actions */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Rebalancing Recommendations</h4>
              <div className="space-y-2">
                {portfolioAnalysis.rebalancingPlan.actions.map((a) => {
                  const actionStyles: Record<string, { text: string; bg: string; icon: typeof TrendingUp }> = {
                    increase: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: TrendingUp },
                    hold: { text: 'text-blue-400', bg: 'bg-blue-500/10', icon: Minus },
                    pause_funding: { text: 'text-orange-400', bg: 'bg-orange-500/10', icon: Pause },
                    exit: { text: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
                  };
                  const style = actionStyles[a.action] || actionStyles.hold;
                  const Icon = style.icon;
                  return (
                    <div key={a.projectId} className="flex items-center gap-3 rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
                      <Icon className={cn('h-4 w-4 flex-shrink-0', style.text)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{a.projectName}</span>
                          <span className={cn('text-xs px-1.5 py-0.5 rounded uppercase font-bold', style.text, style.bg)}>{a.action.replace('_', ' ')}</span>
                          {a.urgency === 'high' && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">URGENT</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{a.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-500">{a.currentAllocation}%</span>
                          <ArrowRight className="h-3 w-3 text-slate-600" />
                          <span className={cn('font-bold', style.text)}>{a.suggestedAllocation.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ===== 3) CIRCLE ESCROW ===== */}
      <GlassCard className="border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Circle Milestone Escrow</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">USDC · {NETWORK_LABEL}</span>
          </div>
        </div>

        <p className="mb-4 text-xs text-slate-400">
          Live state of the agent wallet. Funding a deal and releasing milestones move real USDC, so they run from the{' '}
          <Link href="/agent-console" className="text-cyan-400 hover:text-cyan-300">Agent Console</Link>, against an accepted proposal and behind the spending policy.
        </p>

        <button
          onClick={runEscrowOperation}
          disabled={loadingEscrow}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm disabled:opacity-50 mb-4"
        >
          {loadingEscrow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Check escrow status
        </button>

        {escrowResult?.status && (
          <div className="rounded-lg bg-slate-800/40 border border-amber-500/20 p-4 space-y-1">
            <p className="text-sm text-amber-400 font-medium mb-2">{escrowResult.message}</p>
            <p className="text-xs text-slate-400">Agent wallet: <span className="text-white font-mono">{escrowResult.status.agentWallet?.address}</span></p>
            <p className="text-xs text-slate-400">Balance: <span className="text-white">{escrowResult.status.usdcBalance} USDC</span></p>
            <p className="text-xs text-slate-400">
              Policy: <span className="text-white">≤ {escrowResult.status.policy?.maxPerTxUsdc} USDC/tx · {escrowResult.status.policy?.dailyCapUsdc} USDC/24h · trust ≥ {escrowResult.status.policy?.minTrustScore}</span>
            </p>
            <p className="text-xs text-slate-400">Spent in the last 24h: <span className="text-white">{escrowResult.status.spentLast24hUsdc} USDC</span></p>
            <div className="pt-2">
              <p className="text-xs text-slate-400 mb-1">Funded deals:</p>
              {(escrowResult.status.fundedProposals ?? []).length === 0 ? (
                <p className="text-xs text-slate-500">None yet.</p>
              ) : (
                <ul className="space-y-1">
                  {escrowResult.status.fundedProposals.map((f: any) => (
                    <li key={f.id} className="text-xs text-slate-300">
                      {f.project} — {f.amount} USDC ·{' '}
                      {String(f.txHash).startsWith('0x') ? (
                        <a href={explorerTxUrl(f.txHash)} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:text-cyan-300">{String(f.txHash).slice(0, 18)}… ↗</a>
                      ) : (
                        <span className="font-mono text-slate-500">{String(f.txHash).slice(0, 18)}…</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      {/* ===== CIRCLE TOOLING + AGENT HUB LINK ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="border-cyan-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Circle Tooling Integration</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Agent Wallets', desc: 'Programmable USDC custody via Circle', where: '/agent-hub', status: 'live', color: 'text-emerald-400', dot: 'bg-emerald-400' },
              { name: 'Milestone Escrow', desc: 'Real USDC tranches, policy-gated', where: '/agent-console', status: 'live', color: 'text-emerald-400', dot: 'bg-emerald-400' },
              { name: 'Nanopayments', desc: 'Sub-cent streaming USDC micro-payments', where: '#', status: 'planned', color: 'text-amber-400', dot: 'bg-amber-400' },
              { name: 'Paymaster', desc: `Gas-free USDC (${NETWORK_LABEL} native)`, where: '#', status: 'native', color: 'text-cyan-400', dot: 'bg-cyan-400' },
              { name: 'CCTP / Gateway', desc: 'Cross-chain USDC bridge (Burn→Attest→Mint)', where: '#', status: 'planned', color: 'text-amber-400', dot: 'bg-amber-400' },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
                <div>
                  <p className="text-sm text-white font-medium">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', t.dot)} />
                  <span className={cn('text-xs', t.color)}>{t.status}</span>
                  {t.where.startsWith('/') && (
                    <Link href={t.where} className="text-xs text-cyan-400 hover:text-cyan-300">
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Decision Log */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Agent Decision Log</h3>
            <span className="text-xs text-slate-500 ml-auto">{decisionLog.length} entries</span>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {decisionLog.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Run an analysis to see agent decisions here</p>
            ) : (
              decisionLog.map((d) => {
                const typeIcons: Record<string, typeof Brain> = { signal: BarChart3, rebalance: Target, escrow: DollarSign, risk: Shield, nanopay: Zap };
                const typeColors: Record<string, string> = { signal: 'text-cyan-400', rebalance: 'text-violet-400', escrow: 'text-amber-400', risk: 'text-red-400', nanopay: 'text-purple-400' };
                const Icon = typeIcons[d.type] || Activity;
                return (
                  <div key={d.id} className="flex items-start gap-2 rounded bg-slate-800/30 p-2">
                    <Icon className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', typeColors[d.type])} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-white">{d.action}</span>
                        <span className={cn('text-xs px-1 py-0.5 rounded',
                          d.status === 'success' ? 'text-emerald-400 bg-emerald-500/10' :
                          d.status === 'pending' ? 'text-yellow-400 bg-yellow-500/10' :
                          'text-red-400 bg-red-500/10'
                        )}>{d.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{d.details}</p>
                    </div>
                    <span className="text-xs text-slate-600 flex-shrink-0">{d.timestamp}</span>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>

      {/* Quick Links */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/agent-hub" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-colors text-sm">
          <Coins className="h-4 w-4" /> Agent Hub — Manage Circle Wallets
        </Link>
        <Link href="/discovery" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm">
          <Globe className="h-4 w-4" /> Discovery — Arc Ecosystem
        </Link>
        <Link href="/portfolio" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm">
          <TrendingUp className="h-4 w-4" /> Portfolio — Investments
        </Link>
      </div>
    </div>
  );
}
