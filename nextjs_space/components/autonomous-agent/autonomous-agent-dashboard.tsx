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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface RiskRegime {
  regime: 'risk-on' | 'risk-off' | 'neutral';
  confidence: number;
  reasoning: string;
}

interface RebalanceAction {
  projectId: string;
  projectName: string;
  action: 'increase' | 'decrease' | 'hold' | 'exit';
  currentAllocation: number;
  targetAllocation: number;
  reason: string;
}

interface SignalSource {
  source: string;
  type: string;
  weight: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
  dataPoints: Array<{ label: string; value: number | string }>;
}

interface EscrowRecord {
  id: string;
  projectName: string;
  totalAmount: number;
  releasedAmount: number;
  status: 'active' | 'completed' | 'paused';
  milestones: Array<{
    title: string;
    amount: number;
    status: 'pending' | 'released' | 'verified';
  }>;
}

interface AgentDecision {
  id: string;
  timestamp: string;
  type: 'rebalance' | 'signal' | 'escrow' | 'risk';
  action: string;
  details: string;
  status: 'executed' | 'pending' | 'rejected';
}

// Demo data generators
function generateDemoRiskRegime(): RiskRegime {
  const regimes: RiskRegime[] = [
    { regime: 'risk-on', confidence: 78, reasoning: 'High GitHub activity across portfolio projects. Social sentiment positive. 3/5 milestones on track. Market conditions favorable for Pre-TGE investments.' },
    { regime: 'neutral', confidence: 62, reasoning: 'Mixed signals detected. GitHub activity declining in 2 projects while social momentum increasing. Recommend holding current positions.' },
    { regime: 'risk-off', confidence: 85, reasoning: 'Multiple milestone delays detected. Community engagement dropping. On-chain activity below threshold. Recommend reducing exposure.' },
  ];
  return regimes[0];
}

function generateDemoRebalanceActions(): RebalanceAction[] {
  return [
    { projectId: '1', projectName: 'ArcSwap DEX', action: 'increase', currentAllocation: 25, targetAllocation: 32, reason: 'Strong GitHub commits (+45%), milestone 2 verified, growing TVL signals' },
    { projectId: '2', projectName: 'ArcLend Protocol', action: 'hold', currentAllocation: 20, targetAllocation: 20, reason: 'Stable development activity, community engagement on track' },
    { projectId: '3', projectName: 'ArcBridge', action: 'decrease', currentAllocation: 30, targetAllocation: 22, reason: 'Milestone 3 delayed by 2 weeks, core dev departure detected' },
    { projectId: '4', projectName: 'StableVault', action: 'increase', currentAllocation: 15, targetAllocation: 18, reason: 'New partnerships announced, audit completed successfully' },
    { projectId: '5', projectName: 'ArcNFT Market', action: 'exit', currentAllocation: 10, targetAllocation: 0, reason: 'Team restructuring, missed 3 consecutive milestones' },
  ];
}

function generateDemoSignals(): SignalSource[] {
  return [
    { source: 'GitHub Activity', type: 'github', weight: 0.30, score: 82, trend: 'up', dataPoints: [{ label: 'Commits (30d)', value: 347 }, { label: 'Contributors', value: 28 }, { label: 'PRs Merged', value: 45 }] },
    { source: 'Social Momentum', type: 'social', weight: 0.20, score: 71, trend: 'up', dataPoints: [{ label: 'Mentions', value: '1.2K' }, { label: 'Sentiment', value: '+67%' }, { label: 'Influencer Reach', value: '45K' }] },
    { source: 'Community Growth', type: 'community', weight: 0.20, score: 65, trend: 'stable', dataPoints: [{ label: 'Discord Members', value: '8.5K' }, { label: 'Active Users', value: '1.2K' }, { label: 'Engagement Rate', value: '14%' }] },
    { source: 'On-Chain Signals', type: 'onchain', weight: 0.15, score: 58, trend: 'down', dataPoints: [{ label: 'Testnet TXs', value: '23K' }, { label: 'Unique Wallets', value: '4.1K' }, { label: 'Contract Calls', value: '8.7K' }] },
    { source: 'Milestone Tracking', type: 'milestone', weight: 0.15, score: 74, trend: 'up', dataPoints: [{ label: 'On Track', value: '7/10' }, { label: 'Completed', value: 5 }, { label: 'Avg Delay', value: '3 days' }] },
  ];
}

function generateDemoEscrows(): EscrowRecord[] {
  return [
    {
      id: 'esc-001', projectName: 'ArcSwap DEX', totalAmount: 50000, releasedAmount: 30000, status: 'active',
      milestones: [
        { title: 'Smart Contract Audit', amount: 15000, status: 'released' },
        { title: 'Testnet Launch', amount: 15000, status: 'released' },
        { title: 'Mainnet Beta', amount: 10000, status: 'verified' },
        { title: 'Full Launch', amount: 10000, status: 'pending' },
      ],
    },
    {
      id: 'esc-002', projectName: 'ArcBridge', totalAmount: 35000, releasedAmount: 10000, status: 'paused',
      milestones: [
        { title: 'Architecture Design', amount: 10000, status: 'released' },
        { title: 'Bridge Contracts', amount: 12500, status: 'pending' },
        { title: 'Security Audit', amount: 12500, status: 'pending' },
      ],
    },
  ];
}

function generateDemoDecisions(): AgentDecision[] {
  return [
    { id: 'd1', timestamp: '2 min ago', type: 'signal', action: 'Signal Update', details: 'ArcSwap GitHub activity spike detected: 23 commits in 24h from 5 contributors', status: 'executed' },
    { id: 'd2', timestamp: '15 min ago', type: 'rebalance', action: 'Portfolio Rebalance', details: 'Increased ArcSwap allocation 25% → 32% based on multi-signal analysis', status: 'executed' },
    { id: 'd3', timestamp: '1 hour ago', type: 'escrow', action: 'Milestone Verified', details: 'ArcSwap Mainnet Beta milestone verified via on-chain deployment check', status: 'executed' },
    { id: 'd4', timestamp: '2 hours ago', type: 'risk', action: 'Risk Alert', details: 'ArcBridge funding paused — core developer departure detected via GitHub signal', status: 'executed' },
    { id: 'd5', timestamp: '4 hours ago', type: 'rebalance', action: 'Exit Recommendation', details: 'ArcNFT Market flagged for exit: 3 consecutive missed milestones', status: 'pending' },
  ];
}

// Sub-components
function RiskRegimePanel({ regime }: { regime: RiskRegime }) {
  const config = {
    'risk-on': { icon: TrendingUp, label: 'RISK-ON', bg: 'from-emerald-500/10 to-green-500/5', border: 'border-emerald-500/30', textColor: 'text-emerald-400', bgIcon: 'bg-emerald-500/20', barColor: 'bg-emerald-500' },
    'risk-off': { icon: TrendingDown, label: 'RISK-OFF', bg: 'from-red-500/10 to-orange-500/5', border: 'border-red-500/30', textColor: 'text-red-400', bgIcon: 'bg-red-500/20', barColor: 'bg-red-500' },
    'neutral': { icon: Minus, label: 'NEUTRAL', bg: 'from-yellow-500/10 to-amber-500/5', border: 'border-yellow-500/30', textColor: 'text-yellow-400', bgIcon: 'bg-yellow-500/20', barColor: 'bg-yellow-500' },
  };
  const c = config[regime.regime];
  const Icon = c.icon;

  return (
    <GlassCard className={cn('bg-gradient-to-br', c.bg, c.border)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', c.bgIcon)}>
            <Icon className={cn('h-6 w-6', c.textColor)} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Risk Regime</p>
            <h3 className={cn('text-xl font-bold', c.textColor)}>{c.label}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Confidence</p>
          <p className={cn('text-2xl font-bold', c.textColor)}>{regime.confidence}%</p>
        </div>
      </div>
      <div className="w-full bg-slate-800/50 rounded-full h-2 mb-3">
        <div className={cn('h-2 rounded-full', c.barColor)} style={{ width: `${regime.confidence}%` }} />
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{regime.reasoning}</p>
    </GlassCard>
  );
}

function SignalPanel({ signals }: { signals: SignalSource[] }) {
  const trendIcon = (t: string) => {
    if (t === 'up') return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (t === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-yellow-400" />;
  };

  const typeIcon = (t: string) => {
    const icons: Record<string, typeof Brain> = { github: GitBranch, social: Globe, community: Users, onchain: Activity, milestone: Target };
    const I = icons[t] || Activity;
    return <I className="h-4 w-4" />;
  };

  const compositeScore = Math.round(signals.reduce((acc, s) => acc + s.score * s.weight, 0));

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Signal Aggregation</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">RFB 06</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Composite</p>
          <p className="text-xl font-bold text-cyan-400">{compositeScore}/100</p>
        </div>
      </div>
      <div className="space-y-3">
        {signals.map((signal) => (
          <div key={signal.source} className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">{typeIcon(signal.type)}</span>
                <span className="text-sm font-medium text-white">{signal.source}</span>
                <span className="text-xs text-slate-500">w:{(signal.weight * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                {trendIcon(signal.trend)}
                <span className={cn('text-sm font-bold',
                  signal.score >= 70 ? 'text-emerald-400' : signal.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                )}>{signal.score}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {signal.dataPoints.map((dp) => (
                <div key={dp.label} className="text-xs">
                  <span className="text-slate-500">{dp.label}: </span>
                  <span className="text-slate-300 font-medium">{dp.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function RebalancePanel({ actions }: { actions: RebalanceAction[] }) {
  const actionConfig: Record<string, { textColor: string; bgColor: string; icon: typeof TrendingUp }> = {
    increase: { textColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10', icon: TrendingUp },
    decrease: { textColor: 'text-orange-400', bgColor: 'bg-orange-500/10', icon: TrendingDown },
    hold: { textColor: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: Minus },
    exit: { textColor: 'text-red-400', bgColor: 'bg-red-500/10', icon: AlertTriangle },
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Rebalancing Plan</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">RFB 04</span>
      </div>
      <div className="space-y-2">
        {actions.map((a) => {
          const conf = actionConfig[a.action];
          const Icon = conf.icon;
          return (
            <div key={a.projectId} className="flex items-center gap-3 rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
              <Icon className={cn('h-4 w-4 flex-shrink-0', conf.textColor)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">{a.projectName}</span>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded uppercase font-bold', conf.textColor, conf.bgColor)}>{a.action}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{a.reason}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500">{a.currentAllocation}%</span>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className={cn('font-bold', conf.textColor)}>{a.targetAllocation}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function EscrowPanel({ escrows }: { escrows: EscrowRecord[] }) {
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Circle Escrow</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">USDC</span>
      </div>
      <div className="space-y-3">
        {escrows.map((e) => (
          <div key={e.id} className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{e.projectName}</span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full border',
                  e.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                  e.status === 'paused' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
                  'text-blue-400 bg-blue-500/10 border-blue-500/30'
                )}>{e.status}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white">${e.releasedAmount.toLocaleString()}</span>
                <span className="text-xs text-slate-500"> / ${e.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-3">
              <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${(e.releasedAmount / e.totalAmount) * 100}%` }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {e.milestones.map((m, i) => (
                <div key={i} className={cn('text-xs px-2 py-1 rounded-md border flex items-center gap-1',
                  m.status === 'released' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' :
                  m.status === 'verified' ? 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20' :
                  'text-slate-400 bg-slate-800/50 border-slate-700'
                )}>
                  {m.status === 'released' ? <Unlock className="h-3 w-3" /> : m.status === 'verified' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {m.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function DecisionLog({ decisions }: { decisions: AgentDecision[] }) {
  const typeConfig: Record<string, { textColor: string; icon: typeof Brain }> = {
    rebalance: { textColor: 'text-violet-400', icon: Target },
    signal: { textColor: 'text-cyan-400', icon: BarChart3 },
    escrow: { textColor: 'text-amber-400', icon: DollarSign },
    risk: { textColor: 'text-red-400', icon: Shield },
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Agent Decision Log</h3>
      </div>
      <div className="space-y-2">
        {decisions.map((d) => {
          const conf = typeConfig[d.type] || typeConfig.signal;
          const Icon = conf.icon;
          return (
            <div key={d.id} className="flex items-start gap-3 rounded-lg bg-slate-800/30 p-3">
              <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', conf.textColor)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{d.action}</span>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded',
                    d.status === 'executed' ? 'text-emerald-400 bg-emerald-500/10' :
                    d.status === 'pending' ? 'text-yellow-400 bg-yellow-500/10' :
                    'text-red-400 bg-red-500/10'
                  )}>{d.status}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{d.details}</p>
              </div>
              <span className="text-xs text-slate-500 flex-shrink-0">{d.timestamp}</span>
            </div>
          );
        })}  
      </div>
    </GlassCard>
  );
}

function CircleToolingPanel() {
  const tools = [
    { name: 'Agent Wallets', desc: 'Programmable USDC custody', icon: Coins, status: 'live', textColor: 'text-emerald-400', dotColor: 'bg-emerald-400' },
    { name: 'Milestone Escrow', desc: 'Smart contract-based release', icon: Lock, status: 'live', textColor: 'text-emerald-400', dotColor: 'bg-emerald-400' },
    { name: 'Paymaster', desc: 'Gas-free USDC transactions', icon: Fuel, status: 'integrated', textColor: 'text-cyan-400', dotColor: 'bg-cyan-400' },
    { name: 'CCTP / Gateway', desc: 'Cross-chain USDC settlement', icon: Layers, status: 'integrated', textColor: 'text-cyan-400', dotColor: 'bg-cyan-400' },
  ];

  return (
    <GlassCard className="border-cyan-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Circle Tooling Stack</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">20% Score</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.name} className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('h-4 w-4', t.textColor)} />
                <span className="text-sm font-medium text-white">{t.name}</span>
              </div>
              <p className="text-xs text-slate-400">{t.desc}</p>
              <div className="flex items-center gap-1 mt-2">
                <div className={cn('h-1.5 w-1.5 rounded-full', t.dotColor)} />
                <span className={cn('text-xs', t.textColor)}>{t.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// Main Dashboard Component
export function AutonomousAgentDashboard() {
  const [riskRegime, setRiskRegime] = useState<RiskRegime | null>(null);
  const [rebalanceActions, setRebalanceActions] = useState<RebalanceAction[]>([]);
  const [signals, setSignals] = useState<SignalSource[]>([]);
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState('');

  const loadData = useCallback(() => {
    setIsLoading(true);
    // Simulate AI agent processing
    setTimeout(() => {
      setRiskRegime(generateDemoRiskRegime());
      setRebalanceActions(generateDemoRebalanceActions());
      setSignals(generateDemoSignals());
      setEscrows(generateDemoEscrows());
      setDecisions(generateDemoDecisions());
      setLastRefresh('Just now');
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7 text-cyan-400 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold text-white">Autonomous Agent</h1>
            <p className="text-slate-400">AI agent analyzing portfolio signals...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-800/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-cyan-400" />
            Autonomous Agent
          </h1>
          <p className="text-slate-400 mt-1">
            AI-driven portfolio management & social signal intelligence on Arc Network
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">RFB 04 — Adaptive Portfolio</span>
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">RFB 06 — Signal Intelligence</span>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Risk Regime + Circle Tooling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {riskRegime && <RiskRegimePanel regime={riskRegime} />}
        <CircleToolingPanel />
      </div>

      {/* Signal Aggregation */}
      <SignalPanel signals={signals} />

      {/* Rebalance + Escrow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RebalancePanel actions={rebalanceActions} />
        <EscrowPanel escrows={escrows} />
      </div>

      {/* Decision Log */}
      <DecisionLog decisions={decisions} />

      {/* Hackathon Info */}
      <GlassCard className="border-cyan-500/10 bg-gradient-to-r from-cyan-500/5 to-violet-500/5">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Agora Agents Hackathon — Active</h3>
            <p className="text-xs text-slate-400">May 11-25, 2026 • $50K Prize Pool • Settlement on Arc + USDC</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
