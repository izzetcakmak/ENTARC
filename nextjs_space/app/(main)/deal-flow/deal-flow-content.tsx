'use client';

// DealFlowContent - the real investment pipeline
// Projects and proposals come from the database; settlement happens in the Agent Console.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Target,
  RefreshCw,
  Github,
  Globe,
  Shield,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Terminal,
  FileText,
  Inbox,
  Send,
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { InvestmentModal } from '@/components/proposals/investment-modal';
import { cn } from '@/lib/utils';
import { NETWORK_LABEL, explorerTxUrl } from '@/lib/arc-network';
import { formatUsdc } from '@/lib/dashboard-types';

interface DealProject {
  id: string;
  name: string;
  tagline: string;
  category: string;
  logoEmoji: string;
  githubUrl: string | null;
  websiteUrl: string | null;
  fundingGoal: number;
  currentFunding: number;
  aiTrustScore: number | null;
  riskLevel: string;
  status: string;
  founder: { id: string; name: string | null; walletAddress: string | null };
  milestones: { id: string; title: string; percentage: number; status: string }[];
  _count: { proposals: number };
}

interface DealProposal {
  id: string;
  status: string;
  proposedAmount: number;
  counterAmount: number | null;
  agreedAmount: number | null;
  escrowTxHash: string | null;
  createdAt: string;
  project: { id: string; name: string; logoEmoji: string; aiTrustScore: number | null };
  investor: { id: string; name: string | null };
  founder: { id: string; name: string | null };
}

const TX_HASH = /^0x[a-fA-F0-9]{64}$/;

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  COUNTERED: 'bg-violet-500/20 text-violet-400',
  ACCEPTED: 'bg-cyan-500/20 text-cyan-400',
  FUNDED: 'bg-emerald-500/20 text-emerald-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  EXPIRED: 'bg-slate-500/20 text-slate-400',
  DISPUTED: 'bg-red-500/20 text-red-400',
};

async function getJson(url: string) {
  const res = await fetch(url);
  return res.ok ? res.json() : null;
}

export function DealFlowContent() {
  const { data: session } = useSession() || {};
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<DealProject[]>([]);
  const [sent, setSent] = useState<DealProposal[]>([]);
  const [received, setReceived] = useState<DealProposal[]>([]);
  const [investIn, setInvestIn] = useState<DealProject | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [approved, funded, asInvestor, asFounder] = await Promise.all([
      getJson('/api/projects?status=APPROVED'),
      getJson('/api/projects?status=FUNDED'),
      getJson('/api/proposals?role=investor'),
      getJson('/api/proposals?role=founder'),
    ]);
    setProjects([...(approved?.projects ?? []), ...(funded?.projects ?? [])]);
    setSent(asInvestor?.proposals ?? []);
    setReceived(asFounder?.proposals ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  const respond = async (proposalId: string, action: 'accept' | 'reject' | 'accept_counter') => {
    setBusyId(proposalId);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const open = projects.filter((p) => p.status === 'APPROVED');
  const awaitingMe = received.filter((p) => p.status === 'PENDING');
  const fundedCount = [...sent, ...received].filter((p) => p.status === 'FUNDED' || p.status === 'COMPLETED').length;

  const stats = [
    { label: 'Open Projects', value: open.length, icon: Target, color: 'text-cyan-400' },
    { label: 'My Proposals', value: sent.length, icon: Send, color: 'text-violet-400' },
    { label: 'Awaiting My Response', value: awaitingMe.length, icon: Inbox, color: 'text-amber-400' },
    { label: 'Funded Deals', value: fundedCount, icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  const ProposalRow = ({ p, mine }: { p: DealProposal; mine: boolean }) => {
    const amount = p.agreedAmount ?? p.counterAmount ?? p.proposedAmount;
    const hash = p.escrowTxHash ?? '';
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/30 bg-slate-800/30 p-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl">{p.project.logoEmoji}</span>
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{p.project.name}</p>
            <p className="text-xs text-slate-400">
              {formatUsdc(amount)} USDC · {mine ? `to ${p.founder.name ?? 'founder'}` : `from ${p.investor.name ?? 'investor'}`} ·{' '}
              {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {p.status === 'COUNTERED' && p.counterAmount != null && ` · counter ${formatUsdc(p.counterAmount)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusColors[p.status] ?? 'bg-slate-500/20 text-slate-400')}>
            {p.status}
          </span>
          {TX_HASH.test(hash) && (
            <a
              href={explorerTxUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              tx <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {!mine && p.status === 'PENDING' && (
            <>
              <button
                onClick={() => respond(p.id, 'accept')}
                disabled={busyId === p.id}
                className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Accept
              </button>
              <button
                onClick={() => respond(p.id, 'reject')}
                disabled={busyId === p.id}
                className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
            </>
          )}
          {mine && p.status === 'COUNTERED' && (
            <button
              onClick={() => respond(p.id, 'accept_counter')}
              disabled={busyId === p.id}
              className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
            >
              Accept counter
            </button>
          )}
          {p.status === 'ACCEPTED' && (
            <Link
              href="/agent-console"
              className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/30"
            >
              <Terminal className="h-3.5 w-3.5" /> Settle in Agent Console
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <GlassCard padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
              <Target className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Deal Flow</h1>
              <p className="text-slate-400">
                Submitted projects, proposals and funded deals on {NETWORK_LABEL}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/submit-project"
              className="flex items-center gap-2 rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/30"
            >
              <FileText className="h-4 w-4" /> Submit Project
            </Link>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label}>
              <div className="flex items-center gap-3">
                <Icon className={cn('h-5 w-5', s.color)} />
                <div>
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">{error}</p>
      )}

      {/* Proposals on my projects */}
      {received.length > 0 && (
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-white">Proposals on My Projects</h2>
          <div className="space-y-3">
            {received.map((p) => (
              <ProposalRow key={p.id} p={p} mine={false} />
            ))}
          </div>
        </GlassCard>
      )}

      {/* My proposals */}
      {sent.length > 0 && (
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold text-white">My Proposals</h2>
          <div className="space-y-3">
            {sent.map((p) => (
              <ProposalRow key={p.id} p={p} mine />
            ))}
          </div>
        </GlassCard>
      )}

      {/* Projects */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Projects</h2>
        {!loading && projects.length === 0 ? (
          <GlassCard>
            <div className="p-10 text-center">
              <Target className="mx-auto mb-4 h-12 w-12 text-slate-500" />
              <h3 className="mb-2 text-lg font-bold text-white">No analysed projects yet</h3>
              <p className="text-sm text-slate-400">
                Projects appear here once they are submitted and scored by the agent.
              </p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {projects.map((project) => {
              const isFounder = project.founder?.id === userId;
              const pct = project.fundingGoal > 0
                ? Math.min((project.currentFunding / project.fundingGoal) * 100, 100)
                : 0;
              return (
                <GlassCard key={project.id} hover>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800/50 text-2xl">
                          {project.logoEmoji}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white truncate">{project.name}</h3>
                          <p className="text-sm text-slate-400 line-clamp-2">{project.tagline}</p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1 text-emerald-400" title="Agent trust score">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-bold">{project.aiTrustScore ?? '—'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md bg-slate-700/50 px-2 py-1 text-slate-300">{project.category}</span>
                      <span className="rounded-md bg-slate-700/50 px-2 py-1 text-slate-300">Risk: {project.riskLevel}</span>
                      <span className={cn('rounded-md px-2 py-1', statusColors[project.status] ?? 'bg-slate-700/50 text-slate-300')}>
                        {project.status}
                      </span>
                      <span className="text-slate-500">
                        {project.milestones.length} milestone{project.milestones.length === 1 ? '' : 's'} · {project._count.proposals} proposal{project._count.proposals === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div>
                      <div className="mb-1 flex justify-between text-xs text-slate-400">
                        <span>{formatUsdc(project.currentFunding)} released</span>
                        <span>goal {formatUsdc(project.fundingGoal)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                      <div className="flex items-center gap-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-700/50 p-2 text-slate-400 hover:text-white">
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {project.websiteUrl && (
                          <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-700/50 p-2 text-slate-400 hover:text-white">
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {isFounder ? (
                        <span className="text-xs text-slate-500">Your project</span>
                      ) : project.status === 'APPROVED' ? (
                        <button
                          onClick={() => setInvestIn(project)}
                          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400"
                        >
                          Propose Investment
                        </button>
                      ) : null}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {investIn && (
        <InvestmentModal
          isOpen
          onClose={() => {
            setInvestIn(null);
            load();
          }}
          project={investIn}
        />
      )}
    </div>
  );
}
