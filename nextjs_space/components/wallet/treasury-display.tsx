'use client';

// TreasuryDisplay - Shows connected wallet as Treasury
// Displays wallet address and USDC balance on Arc Testnet

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { arcTestnet } from '@/lib/wagmi-config';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import {
  Wallet,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface TreasuryDisplayProps {
  className?: string;
  compact?: boolean;
}

export function TreasuryDisplay({ className, compact = false }: TreasuryDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  const { address, isConnected } = useAccount();

  // Get native USDC balance
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
    chainId: arcTestnet.id,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (value: bigint | undefined, decimals: number = 18) => {
    if (!value) return '0.00';
    const formatted = Number(value) / Math.pow(10, decimals);
    return formatted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  if (!mounted) {
    return (
      <div className={cn('h-32 animate-pulse rounded-xl bg-slate-700/50', className)} />
    );
  }

  if (!isConnected || !address) {
    return (
      <GlassCard className={cn('p-4', className)}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/50">
            <Wallet className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-400">Treasury Wallet</div>
            <div className="text-xs text-slate-500">Not connected</div>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-2', className)}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
          <Shield className="h-3 w-3 text-emerald-400" />
        </div>
        <span className="text-sm font-medium text-white">{formatAddress(address)}</span>
        <span className="text-xs text-slate-500">|</span>
        <span className="text-sm font-medium text-cyan-400">
          {formatBalance(balance?.value)} USDC
        </span>
      </div>
    );
  }

  return (
    <GlassCard className={cn('p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <Shield className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Treasury Wallet
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-lg font-medium text-white">
                {formatAddress(address)}
              </span>
              <button
                onClick={copyAddress}
                className="text-slate-400 transition-colors hover:text-white"
                title="Copy full address"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <a
                href={`https://testnet.arcscan.app/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 transition-colors hover:text-cyan-400"
                title="View on ArcScan"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Connected to Arc Testnet
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="text-xs text-slate-500">USDC Balance</div>
          <div className="mt-1 flex items-baseline gap-1">
            {isBalanceLoading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-slate-700" />
            ) : (
              <>
                <span className="text-xl font-bold text-white">
                  {formatBalance(balance?.value)}
                </span>
                <span className="text-sm text-cyan-400">USDC</span>
              </>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="text-xs text-slate-500">Network</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-white">Arc</span>
            <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-xs text-cyan-400">
              Testnet
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Full address: <span className="font-mono text-slate-400">{address}</span>
      </div>
    </GlassCard>
  );
}
