'use client';

// Agent Console — the agent's decision chain on one screen:
// Gemini due diligence -> spending-policy gate -> real USDC settlement on Arc.
// Every number here is live: the score comes from Gemini, the verdict from
// lib/agent-policy, and the hash from a Circle transaction.

import { useCallback, useEffect, useState } from 'react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import {
  Brain,
  Shield,
  Wallet,
  ExternalLink,
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  Coins,
  ArrowRight,
} from 'lucide-react';

type Step = 'idle' | 'analyzing' | 'analyzed' | 'paying' | 'settled' | 'denied' | 'error';

interface Proposal {
  id: string;
  amount: number;
  status: string;
  txHash: string | null;
  explorerUrl: string | null;
  recipient: string | null;
  project: {
    id: string;
    name: string;
    tagline: string;
    emoji: string;
    category: string;
    githubUrl: string | null;
    trustScore: number | null;
    analysis: any;
    funding: number;
    milestones: Array<{ id: string; title: string; percentage: number; status: string }>;
  };
}

interface AgentState {
  wallet: string | null;
  usdc: string;
  engine: string;
  network: string;
  policy: { maxPerTxUsdc: number; dailyCapUsdc: number; minTrustScore: number };
  spentLast24hUsdc: number;
}

const short = (a?: string | null) => (a && a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a ?? '—');

export function AgentConsole() {
  const [agent, setAgent] = useState<AgentState | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [analysis, setAnalysis] = useState<any>(null);
  const [policyVerdict, setPolicyVerdict] = useState<any>(null);
  const [settlement, setSettlement] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const say = (line: string) =>
    setLog((l) => [...l, `${new Date().toLocaleTimeString('en-GB', { hour12: false })}  ${line}`]);

  const load = useCallback(async () => {
    const res = await fetch('/api/agent/run');
    if (!res.ok) return;
    const data = await res.json();
    setAgent(data.agent);
    setProposals(data.proposals);
    setSelected((cur) => cur ?? data.proposals.find((p: Proposal) => p.status === 'ACCEPTED')?.id ?? data.proposals[0]?.id ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = proposals.find((p) => p.id === selected) ?? null;

  const pick = (id: string) => {
    setSelected(id);
    setStep('idle');
    setAnalysis(null);
    setPolicyVerdict(null);
    setSettlement(null);
    setError(null);
    setLog([]);
  };

  /** Runs the full chain: analyse, then attempt settlement. */
  const run = async () => {
    if (!current) return;
    setError(null);
    setSettlement(null);
    setPolicyVerdict(null);

    // ---- step 1: due diligence
    setStep('analyzing');
    say(`Running due diligence on ${current.project.name}…`);
    let dd: any;
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: current.project.id }),
      });
      dd = await res.json();
      if (!res.ok) throw new Error(dd.error || 'analysis failed');
    } catch (e: any) {
      setStep('error');
      setError(e.message);
      say(`ERROR ${e.message}`);
      return;
    }
    setAnalysis(dd);
    setStep('analyzed');
    say(`${dd.engine} → trust score ${dd.trustScore}/100 (${dd.analysis?.recommendation})`);

    // ---- step 2 + 3: policy gate, then settlement if it passes
    setStep('paying');
    say(`Requesting release of ${(current.amount * (current.project.milestones[0]?.percentage ?? 100)) / 100} USDC…`);
    try {
      const res = await fetch('/api/agent/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-escrow', proposalId: current.id }),
      });
      const data = await res.json();
      setPolicyVerdict(data.policy ?? null);

      if (res.status === 403 || data.blocked) {
        setStep('denied');
        say(`POLICY DENIED — ${data.policy?.reason ?? data.message}`);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'settlement failed');

      setSettlement(data.release);
      setStep('settled');
      say(`Policy cleared → ${data.release.amountUsdc} USDC sent to ${short(data.release.recipient)}`);
      say(`Settled on Arc · tx ${short(data.release.txHash)}`);
      load();
    } catch (e: any) {
      setStep('error');
      setError(e.message);
      say(`ERROR ${e.message}`);
    }
  };

  const busy = step === 'analyzing' || step === 'paying';

  return (
    <div className="space-y-6">
      {/* header ------------------------------------------------------------ */}
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <Brain className="h-8 w-8 text-cyan-400" />
          Agent Console
        </h1>
        <p className="mt-1 text-slate-400">
          Due diligence, spending policy and settlement — the agent decides and pays on its own.
          No human approves a transfer.
        </p>
      </div>

      {/* agent identity ---------------------------------------------------- */}
      <GlassCard className="border-cyan-500/20">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={<Wallet className="h-4 w-4" />} label="Agent wallet (Circle)" value={short(agent?.wallet)} mono />
          <Stat icon={<Coins className="h-4 w-4" />} label="USDC balance" value={`$${agent?.usdc ?? '—'}`} />
          <Stat icon={<Brain className="h-4 w-4" />} label="Reasoning engine" value={agent?.engine ?? '—'} />
          <Stat icon={<Shield className="h-4 w-4" />} label="Spending policy" value={agent ? `≤$${agent.policy.maxPerTxUsdc}/tx · $${agent.policy.dailyCapUsdc}/24h · trust ≥${agent.policy.minTrustScore}` : '—'} />
        </div>
      </GlassCard>

      {/* pipeline ---------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* deal list */}
        <GlassCard padding="sm">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Accepted deals
          </p>
          <div className="space-y-1">
            {proposals.map((p) => (
              <button
                key={p.id}
                onClick={() => pick(p.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition',
                  selected === p.id ? 'bg-cyan-500/10 ring-1 ring-cyan-500/40' : 'hover:bg-slate-800/60'
                )}
              >
                <span className="text-xl">{p.project.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{p.project.name}</span>
                  <span className="block text-xs text-slate-400">
                    ${p.amount} · {p.status === 'FUNDED' ? 'funded' : 'awaiting agent'}
                  </span>
                </span>
                {p.status === 'FUNDED' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              </button>
            ))}
            {proposals.length === 0 && (
              <p className="px-3 py-6 text-sm text-slate-500">No accepted deals yet.</p>
            )}
          </div>
        </GlassCard>

        {/* run panel */}
        <div className="space-y-4">
          <GlassCard>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="text-2xl">{current?.project.emoji}</span>
                  {current?.project.name ?? 'Select a deal'}
                </p>
                <p className="mt-1 max-w-xl text-sm text-slate-400">{current?.project.tagline}</p>
                {current && (
                  <p className="mt-2 font-mono text-xs text-slate-500">
                    payout → {short(current.recipient)} · tranche {current.project.milestones[0]?.percentage ?? 100}% of ${current.amount}
                  </p>
                )}
              </div>
              <button
                onClick={run}
                disabled={!current || busy}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition',
                  busy
                    ? 'cursor-wait bg-slate-700 text-slate-300'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40'
                )}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {busy ? 'Agent working…' : 'Run agent'}
              </button>
            </div>
          </GlassCard>

          {/* the three stages */}
          <div className="grid gap-4 md:grid-cols-3">
            <Stage
              n={1}
              title="Due diligence"
              subtitle={analysis?.engine ?? agent?.engine ?? 'Gemini'}
              state={step === 'analyzing' ? 'active' : analysis ? 'done' : 'idle'}
            >
              {analysis ? (
                <>
                  <ScoreRing score={analysis.trustScore} threshold={analysis.threshold} />
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">{analysis.analysis?.summary}</p>
                  <p className="mt-2 text-xs font-semibold text-cyan-300">
                    {analysis.analysis?.recommendation} · risk {analysis.analysis?.riskLevel}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500">
                  The agent reads the repo activity, milestones and category, then scores the deal.
                </p>
              )}
            </Stage>

            <Stage
              n={2}
              title="Spending policy"
              subtitle="the only approval path"
              state={step === 'paying' ? 'active' : policyVerdict ? (policyVerdict.allowed ? 'done' : 'blocked') : 'idle'}
            >
              {policyVerdict ? (
                <>
                  <p className={cn('flex items-center gap-2 text-sm font-semibold', policyVerdict.allowed ? 'text-emerald-400' : 'text-red-400')}>
                    {policyVerdict.allowed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {policyVerdict.allowed ? 'Cleared' : 'Denied'}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{policyVerdict.reason}</p>
                </>
              ) : (
                <ul className="space-y-1 text-xs text-slate-500">
                  <li>· max ${agent?.policy.maxPerTxUsdc} per transaction</li>
                  <li>· ${agent?.policy.dailyCapUsdc} rolling 24h budget</li>
                  <li>· trust score ≥ {agent?.policy.minTrustScore}</li>
                </ul>
              )}
            </Stage>

            <Stage
              n={3}
              title="Settlement"
              subtitle="USDC on Arc"
              state={step === 'settled' ? 'done' : step === 'denied' ? 'blocked' : step === 'paying' ? 'active' : 'idle'}
            >
              {settlement ? (
                <>
                  <p className="text-2xl font-bold text-emerald-400">${settlement.amountUsdc}</p>
                  <p className="mt-1 text-xs text-slate-400">sent to {short(settlement.recipient)}</p>
                  <a
                    href={settlement.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 break-all font-mono text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    {short(settlement.txHash)}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </>
              ) : step === 'denied' ? (
                <p className="text-xs text-slate-400">
                  No transfer was made. The policy gate stopped the agent before any money moved.
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  A real Circle transaction, signed by the agent wallet and verifiable on the Arc explorer.
                </p>
              )}
            </Stage>
          </div>

          {/* live log */}
          <GlassCard padding="sm" className="bg-slate-950/60">
            <div className="max-h-44 space-y-1 overflow-y-auto px-2 py-2 font-mono text-xs">
              {log.length === 0 ? (
                <p className="text-slate-600">agent idle — press “Run agent”.</p>
              ) : (
                log.map((line, i) => (
                  <p key={i} className={cn('text-slate-400', line.includes('DENIED') && 'text-red-400', line.includes('Settled') && 'text-emerald-400')}>
                    {line}
                  </p>
                ))
              )}
              {error && <p className="text-red-400">{error}</p>}
            </div>
          </GlassCard>

          {/* funded history */}
          {proposals.some((p) => p.txHash) && (
            <GlassCard>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Autonomous payments made
              </p>
              <div className="space-y-2">
                {proposals
                  .filter((p) => p.txHash)
                  .map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-900/50 px-3 py-2 text-sm">
                      <span>{p.project.emoji}</span>
                      <span className="text-white">{p.project.name}</span>
                      <span className="text-slate-400">trust {p.project.trustScore}</span>
                      <ArrowRight className="h-3 w-3 text-slate-600" />
                      <span className="font-semibold text-emerald-400">${p.project.funding}</span>
                      {p.explorerUrl && (
                        <a
                          href={p.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          {short(p.txHash)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </p>
      <p className={cn('mt-1 text-sm font-medium text-white', mono && 'font-mono')}>{value}</p>
    </div>
  );
}

function Stage({
  n,
  title,
  subtitle,
  state,
  children,
}: {
  n: number;
  title: string;
  subtitle: string;
  state: 'idle' | 'active' | 'done' | 'blocked';
  children: React.ReactNode;
}) {
  return (
    <GlassCard
      className={cn(
        'transition',
        state === 'active' && 'ring-1 ring-cyan-500/50',
        state === 'done' && 'ring-1 ring-emerald-500/30',
        state === 'blocked' && 'ring-1 ring-red-500/40'
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
            state === 'done' && 'bg-emerald-500/20 text-emerald-400',
            state === 'blocked' && 'bg-red-500/20 text-red-400',
            state === 'active' && 'bg-cyan-500/20 text-cyan-300',
            state === 'idle' && 'bg-slate-700/50 text-slate-400'
          )}
        >
          {state === 'active' ? <Loader2 className="h-3 w-3 animate-spin" /> : n}
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </GlassCard>
  );
}

function ScoreRing({ score, threshold }: { score: number; threshold: number }) {
  const ok = score >= threshold;
  return (
    <div className="flex items-baseline gap-2">
      <span className={cn('text-3xl font-bold', ok ? 'text-emerald-400' : 'text-red-400')}>{score}</span>
      <span className="text-sm text-slate-500">/100</span>
      <span className={cn('ml-auto text-xs font-medium', ok ? 'text-emerald-400/80' : 'text-red-400/80')}>
        threshold {threshold}
      </span>
    </div>
  );
}
