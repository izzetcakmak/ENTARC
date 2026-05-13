'use client';

import { useState, useEffect, useCallback } from 'react';
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

// Sample projects for demo
const DEMO_PROJECTS = [
  {
    id: 'arcswap', name: 'ArcSwap Protocol', category: 'DeFi', allocation: 25, trustScore: 87,
    github: { commits30d: 45, contributors: 12, stars: 340 },
    social: { mentions: 850, sentiment: 72, influencerReach: 25000 },
    community: { discordMembers: 5200, activeUsers: 780, engagementRate: 15 },
    milestones: { total: 5, completed: 3, onTimeDelivery: 80 },
    onchain: { transactions: 1200, uniqueUsers: 450, tvl: 180000 },
    signals: { githubActivity: 85, socialMomentum: 72, milestoneProgress: 60, communityGrowth: 75 },
  },
  {
    id: 'neurabridge', name: 'NeuraBridge', category: 'Infrastructure', allocation: 20, trustScore: 92,
    github: { commits30d: 78, contributors: 18, stars: 520 },
    social: { mentions: 1200, sentiment: 85, influencerReach: 40000 },
    community: { discordMembers: 8500, activeUsers: 1200, engagementRate: 14 },
    milestones: { total: 6, completed: 4, onTimeDelivery: 90 },
    onchain: { transactions: 2300, uniqueUsers: 890, tvl: 350000 },
    signals: { githubActivity: 92, socialMomentum: 85, milestoneProgress: 67, communityGrowth: 80 },
  },
  {
    id: 'metarealm', name: 'MetaRealm', category: 'Gaming', allocation: 15, trustScore: 71,
    github: { commits30d: 12, contributors: 5, stars: 120 },
    social: { mentions: 400, sentiment: 45, influencerReach: 8000 },
    community: { discordMembers: 2100, activeUsers: 280, engagementRate: 8 },
    milestones: { total: 4, completed: 1, onTimeDelivery: 50 },
    onchain: { transactions: 150, uniqueUsers: 60, tvl: 15000 },
    signals: { githubActivity: 35, socialMomentum: 45, milestoneProgress: 25, communityGrowth: 40 },
  },
  {
    id: 'privacyshield', name: 'PrivacyShield', category: 'Privacy', allocation: 20, trustScore: 84,
    github: { commits30d: 55, contributors: 9, stars: 280 },
    social: { mentions: 600, sentiment: 68, influencerReach: 18000 },
    community: { discordMembers: 4100, activeUsers: 620, engagementRate: 12 },
    milestones: { total: 5, completed: 3, onTimeDelivery: 85 },
    onchain: { transactions: 800, uniqueUsers: 320, tvl: 95000 },
    signals: { githubActivity: 78, socialMomentum: 68, milestoneProgress: 60, communityGrowth: 65 },
  },
  {
    id: 'daoforge', name: 'DAOforge', category: 'DAO', allocation: 20, trustScore: 78,
    github: { commits30d: 8, contributors: 3, stars: 90 },
    social: { mentions: 200, sentiment: 30, influencerReach: 3000 },
    community: { discordMembers: 1100, activeUsers: 120, engagementRate: 5 },
    milestones: { total: 4, completed: 0, onTimeDelivery: 0 },
    onchain: { transactions: 50, uniqueUsers: 20, tvl: 5000 },
    signals: { githubActivity: 20, socialMomentum: 30, milestoneProgress: 0, communityGrowth: 25 },
  },
];

// ================= MAIN COMPONENT =================
export function AutonomousAgentDashboard() {
  const [selectedProject, setSelectedProject] = useState(DEMO_PROJECTS[0]);
  const [signalAnalysis, setSignalAnalysis] = useState<SignalAnalysis | null>(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [escrowResult, setEscrowResult] = useState<EscrowResult | null>(null);
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>([]);
  const [loadingSignal, setLoadingSignal] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingEscrow, setLoadingEscrow] = useState(false);
  const [escrowAction, setEscrowAction] = useState<'create' | 'release' | 'check' | 'pause'>('create');
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
    addLog({ type: 'rebalance', action: 'Portfolio Analysis', details: `Analyzing ${DEMO_PROJECTS.length} projects for risk regime...`, status: 'pending' });
    try {
      const res = await fetch('/api/agent/portfolio-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: DEMO_PROJECTS }),
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

  // ===== 3) ESCROW OPERATIONS =====
  const runEscrowOperation = async () => {
    setLoadingEscrow(true);
    const actionLabels: Record<string, string> = {
      'create': 'Create Escrow', 'release': 'Release Milestone',
      'check': 'Check Status', 'pause': 'Pause Funding',
    };
    addLog({ type: 'escrow', action: actionLabels[escrowAction], details: `${selectedProject.name} — via Circle Agent Wallet`, status: 'pending' });
    try {
      const bodyMap: Record<string, any> = {
        create: {
          action: 'create-escrow',
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          totalAmount: 50000,
          milestones: [
            { id: 'm1', title: 'Smart Contract Audit', amount: 15000, percentage: 30 },
            { id: 'm2', title: 'Testnet Launch', amount: 15000, percentage: 30 },
            { id: 'm3', title: 'Mainnet Beta', amount: 10000, percentage: 20 },
            { id: 'm4', title: 'Full Launch', amount: 10000, percentage: 20 },
          ],
          investorWallet: '0x72f5adfabc8670bc873963018133d0b1729a92fd',
          agentWalletId: 'entarc-agent-wallet-001',
        },
        release: { action: 'release-milestone', escrowId: `esc-${selectedProject.id}`, milestoneId: 'm1', projectName: selectedProject.name },
        check: { action: 'check-status', escrowId: `esc-${selectedProject.id}` },
        pause: { action: 'pause-funding', escrowId: `esc-${selectedProject.id}`, reason: 'AI agent detected declining GitHub activity and missed milestone' },
      };

      const res = await fetch('/api/agent/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyMap[escrowAction]),
      });
      const data = await res.json();
      if (data.success) {
        setEscrowResult(data);
        addLog({ type: 'escrow', action: `${actionLabels[escrowAction]} — Success`, details: data.message, status: 'success' });
      } else {
        addLog({ type: 'escrow', action: 'Escrow Operation Failed', details: data.error, status: 'error' });
      }
    } catch (err: any) {
      addLog({ type: 'escrow', action: 'Escrow Error', details: err.message, status: 'error' });
    }
    setLoadingEscrow(false);
  };

  // ===== 4) NANOPAYMENT STREAMING =====
  useEffect(() => {
    if (!streamActive || !nanopayStream) return;
    const interval = setInterval(() => {
      setStreamingTick(prev => {
        const next = prev + 1;
        if (next >= (nanopayStream.durationSeconds || 60)) {
          setStreamActive(false);
          addLog({ type: 'nanopay', action: 'Stream Completed', details: `${nanopayStream.recipientProject} — $${(nanopayStream.amountPerSecond * next).toFixed(6)} USDC total`, status: 'success' });
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [streamActive, nanopayStream, addLog]);

  const startNanopayStream = async () => {
    setLoadingNanopay(true);
    addLog({ type: 'nanopay', action: `Start Nanopayment: ${selectedProject.name}`, details: '$0.001/sec USDC stream via Circle', status: 'pending' });
    try {
      const res = await fetch('/api/agent/nanopayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-stream',
          recipientProject: selectedProject.name,
          amountPerSecond: 0.001,
          durationSeconds: 30,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNanopayStream(data.stream);
        setStreamingTick(0);
        setStreamActive(true);
        addLog({ type: 'nanopay', action: `Stream Active: $0.001/sec`, details: `${selectedProject.name} — TX: ${data.stream.txHash.slice(0, 16)}...`, status: 'success' });
      } else {
        addLog({ type: 'nanopay', action: 'Stream Failed', details: data.error, status: 'error' });
      }
    } catch (err: any) {
      addLog({ type: 'nanopay', action: 'Stream Error', details: err.message, status: 'error' });
    }
    setLoadingNanopay(false);
  };

  const stopNanopayStream = async () => {
    if (!nanopayStream) return;
    setStreamActive(false);
    addLog({ type: 'nanopay', action: 'Stop Stream', details: `${nanopayStream.recipientProject} — Stopping after ${streamingTick}s`, status: 'pending' });
    try {
      const res = await fetch('/api/agent/nanopayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop-stream', streamId: nanopayStream.streamId }),
      });
      const data = await res.json();
      if (data.success) {
        addLog({ type: 'nanopay', action: 'Stream Stopped', details: data.message, status: 'success' });
      }
    } catch (err: any) {
      addLog({ type: 'nanopay', action: 'Stop Error', details: err.message, status: 'error' });
    }
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
            <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">RFB 04 — Adaptive Portfolio</span>
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">RFB 06 — Signal Intelligence</span>
          </div>
        </div>
      </div>

      {/* ===== PROJECT SELECTOR ===== */}
      <GlassCard className="border-slate-700/80">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Select Target Project</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {DEMO_PROJECTS.map((p) => (
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">RFB 06</span>
          </div>
          <button
            onClick={runSignalAnalysis}
            disabled={loadingSignal}
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">RFB 04</span>
          </div>
          <button
            onClick={runPortfolioAnalysis}
            disabled={loadingPortfolio}
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
            <p className="text-sm text-violet-400">Analyzing {DEMO_PROJECTS.length} projects for risk regime detection...</p>
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
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Circle Milestone Escrow</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">USDC</span>
          </div>
        </div>

        {/* Escrow Action Selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'create' as const, label: 'Create Escrow', icon: Lock },
            { key: 'release' as const, label: 'Release Milestone', icon: Unlock },
            { key: 'check' as const, label: 'Check Status', icon: Search },
            { key: 'pause' as const, label: 'Pause Funding', icon: Pause },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setEscrowAction(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all',
                escrowAction === key
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Execute Button */}
        <button
          onClick={runEscrowOperation}
          disabled={loadingEscrow}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm disabled:opacity-50 mb-4"
        >
          {loadingEscrow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Execute: {escrowAction.replace('_', ' ')} for {selectedProject.name}
        </button>

        {/* Escrow Result */}
        {escrowResult && (
          <div className="rounded-lg bg-slate-800/40 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-400 font-medium mb-2">{escrowResult.message}</p>
            {escrowResult.circleIntegration && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {Object.entries(escrowResult.circleIntegration).map(([k, v]) => (
                  <div key={k} className="text-xs">
                    <span className="text-slate-500">{k}: </span>
                    <span className="text-slate-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
            {escrowResult.escrow && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-400">Escrow ID: <span className="text-white">{escrowResult.escrow.id}</span></p>
                <p className="text-xs text-slate-400">Total Locked: <span className="text-white">${escrowResult.escrow.totalAmount?.toLocaleString()} USDC</span></p>
                <p className="text-xs text-slate-400">Milestones: <span className="text-white">{escrowResult.escrow.milestones?.length}</span></p>
              </div>
            )}
            {escrowResult.release && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-400">TX Hash: <a href={`https://testnet.arcscan.app/tx/${escrowResult.release.txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono text-xs hover:text-cyan-300 underline decoration-cyan-500/30 hover:decoration-cyan-400 transition-colors">{escrowResult.release.txHash?.slice(0, 20)}... ↗</a></p>
                <p className="text-xs text-slate-400">Network: <span className="text-white">{escrowResult.release.network}</span></p>
              </div>
            )}
            {escrowResult.status && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-400">State: <span className="text-emerald-400">{escrowResult.status.state}</span></p>
                <p className="text-xs text-slate-400">Released: <span className="text-white">${escrowResult.status.released?.toLocaleString()}</span> / ${escrowResult.status.totalLocked?.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Circle Wallet Balance: <span className="text-white">${escrowResult.status.circleWalletBalance?.toLocaleString()} USDC</span></p>
              </div>
            )}
            {escrowResult.pause && (
              <div className="mt-3">
                <p className="text-xs text-orange-400 mb-1">Reason: {escrowResult.pause.reason}</p>
                <p className="text-xs text-slate-400">Resume Conditions:</p>
                <ul className="text-xs text-slate-300 list-disc list-inside">
                  {escrowResult.pause.resumeConditions?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* ===== 4) NANOPAYMENT STREAMING ===== */}
      <GlassCard className="border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Nanopayment Streaming</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">$0.000001 min</span>
          </div>
          {streamActive && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs text-purple-400">LIVE</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-4">Sub-cent USDC micro-payments at machine speed via Circle Agent Wallet on Arc Network. Gas-free, instant settlement.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Controls */}
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
              <p className="text-xs text-slate-500 mb-1">Recipient</p>
              <p className="text-sm text-white font-medium">{selectedProject.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
                <p className="text-xs text-slate-500 mb-1">Rate</p>
                <p className="text-sm text-cyan-400 font-mono">$0.001/sec</p>
              </div>
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className="text-sm text-white font-mono">30 seconds</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!streamActive ? (
                <button
                  onClick={startNanopayStream}
                  disabled={loadingNanopay}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all disabled:opacity-50"
                >
                  {loadingNanopay ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Start Stream
                </button>
              ) : (
                <button
                  onClick={stopNanopayStream}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all"
                >
                  <Pause className="h-4 w-4" />
                  Stop Stream
                </button>
              )}
            </div>
          </div>

          {/* Live Stream Visualization */}
          <div className="rounded-lg bg-slate-800/30 border border-slate-700/50 p-4">
            {nanopayStream && (streamActive || streamingTick > 0) ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Stream Progress</span>
                  <span className="text-xs text-purple-400">{streamingTick}/{nanopayStream.durationSeconds}s</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${(streamingTick / nanopayStream.durationSeconds) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-500">Streamed</p>
                    <p className="text-lg font-mono text-emerald-400">${(nanopayStream.amountPerSecond * streamingTick).toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Rate</p>
                    <p className="text-lg font-mono text-cyan-400">${nanopayStream.amountPerSecond}/s</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">TX: <a href={`https://testnet.arcscan.app/tx/${nanopayStream.txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:text-cyan-300 underline decoration-cyan-500/30 hover:decoration-cyan-400 transition-colors">{nanopayStream.txHash.slice(0, 24)}... ↗</a></p>
                  <p className="text-xs text-slate-500">Network: <span className="text-white">{nanopayStream.network}</span></p>
                  <p className="text-xs text-slate-500">Status: <span className={streamActive ? 'text-purple-400' : 'text-emerald-400'}>{streamActive ? 'Streaming' : 'Completed'}</span></p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                <Zap className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">Click &quot;Start Stream&quot; to begin<br />real-time USDC nanopayment</p>
                <p className="text-xs text-slate-600 mt-2">Min: $0.000001 · Max: 1000 tx/sec</p>
              </div>
            )}
          </div>
        </div>
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
              { name: 'Milestone Escrow', desc: 'AI-verified milestone release', where: '#escrow', status: 'live', color: 'text-emerald-400', dot: 'bg-emerald-400' },
              { name: 'Nanopayments', desc: 'Sub-cent streaming USDC micro-payments', where: '#nanopay', status: 'live', color: 'text-emerald-400', dot: 'bg-emerald-400' },
              { name: 'Paymaster', desc: 'Gas-free USDC (Arc Testnet native)', where: '#', status: 'native', color: 'text-cyan-400', dot: 'bg-cyan-400' },
              { name: 'CCTP / Gateway', desc: 'Cross-chain USDC bridge (Burn→Attest→Mint)', where: '/agent-hub', status: 'live', color: 'text-emerald-400', dot: 'bg-emerald-400' },
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
