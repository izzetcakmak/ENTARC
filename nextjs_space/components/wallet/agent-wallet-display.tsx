'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/shared/glass-card';
import {
  Bot,
  Copy,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Loader2,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

interface AgentWallet {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  walletSetName?: string;
}

export function AgentWalletDisplay({ compact = false }: { compact?: boolean }) {
  const [wallets, setWallets] = useState<AgentWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/circle/wallets');
      const data = await res.json();
      if (data.success) {
        setWallets(data.wallets || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(address);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (loading) {
    return (
      <GlassCard className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
          <span className="text-sm text-slate-400">Loading Agent Wallet...</span>
        </div>
      </GlassCard>
    );
  }

  if (wallets.length === 0) {
    return (
      <GlassCard className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <Bot className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Agent Wallet</h3>
              <p className="text-xs text-slate-400">No agent wallet created yet</p>
            </div>
          </div>
          <Link
            href="/agent-hub"
            className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400 hover:bg-violet-500/20 transition-colors"
          >
            <Bot className="h-3 w-3" />
            Create in Agent Hub
          </Link>
        </div>
      </GlassCard>
    );
  }

  const primaryWallet = wallets[0];

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
          <Bot className="h-4 w-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400">Agent Wallet</p>
          <div className="flex items-center gap-1.5">
            <code className="text-xs font-mono text-white">
              {formatAddress(primaryWallet.address)}
            </code>
            <button
              onClick={() => copyAddress(primaryWallet.address)}
              className="text-slate-500 hover:text-violet-400 transition-colors"
            >
              {copiedId === primaryWallet.address ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {primaryWallet.state}
        </span>
      </div>
    );
  }

  return (
    <GlassCard className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">Agent Wallet</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">
            Circle Agent Stack
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWallets}
            className="text-slate-500 hover:text-violet-400 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            href="/agent-hub"
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Agent Hub →
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="flex items-center justify-between rounded-lg bg-slate-800/30 border border-slate-700/30 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Wallet className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {wallet.walletSetName || 'Agent Wallet'}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {wallet.blockchain}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    wallet.state === 'LIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {wallet.state}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <code className="text-xs font-mono text-slate-400">
                    {wallet.address}
                  </code>
                  <button
                    onClick={() => copyAddress(wallet.address)}
                    className="text-slate-500 hover:text-violet-400 transition-colors"
                  >
                    {copiedId === wallet.address ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <a
              href={`https://testnet.arcscan.app/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-violet-400 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Autonomous wallet powered by Circle Agent Stack · Used for AI-driven investments
      </p>
    </GlassCard>
  );
}
