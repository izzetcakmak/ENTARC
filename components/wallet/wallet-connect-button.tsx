'use client';

// WalletConnectButton - Connect wallet to Arc Testnet
// Handles MetaMask and other injected wallets

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { arcTestnet, USDC_CONTRACT_ADDRESS } from '@/lib/wagmi-config';
import { cn } from '@/lib/utils';
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface WalletConnectButtonProps {
  onWalletConnected?: (address: string) => void;
  showBalance?: boolean;
  className?: string;
}

export function WalletConnectButton({
  onWalletConnected,
  showBalance = true,
  className,
}: WalletConnectButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  // Get native USDC balance (18 decimals)
  const { data: nativeBalance } = useBalance({
    address: address,
    chainId: arcTestnet.id,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Save wallet to database when connected
  useEffect(() => {
    if (isConnected && address && onWalletConnected) {
      onWalletConnected(address);
    }
  }, [isConnected, address, onWalletConnected]);

  // Auto-save wallet to database
  useEffect(() => {
    const saveWallet = async () => {
      if (isConnected && address && saveStatus === 'idle') {
        setSaveStatus('saving');
        try {
          const res = await fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          });
          if (res.ok) {
            setSaveStatus('saved');
          } else {
            setSaveStatus('error');
          }
        } catch {
          setSaveStatus('error');
        }
      }
    };
    saveWallet();
  }, [isConnected, address, saveStatus]);

  const handleConnect = async () => {
    try {
      connect({ connector: injected(), chainId: arcTestnet.id });
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSaveStatus('idle');
  };

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
      <div className={cn('h-12 w-40 animate-pulse rounded-xl bg-slate-700/50', className)} />
    );
  }

  // Connected state
  if (isConnected && address) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Connected wallet card */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{formatAddress(address)}</span>
                  <button
                    onClick={copyAddress}
                    className="text-slate-400 transition-colors hover:text-white"
                    title="Copy address"
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
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-400">Arc Testnet</span>
                  {saveStatus === 'saved' && (
                    <span className="text-slate-500">• Saved</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="rounded-lg bg-slate-700/50 p-2 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
              title="Disconnect"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Balance display */}
        {showBalance && (
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="text-sm text-slate-400">Treasury Balance</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {formatBalance(nativeBalance?.value)}
              </span>
              <span className="text-cyan-400">USDC</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Native gas token on Arc Testnet
            </div>
          </div>
        )}
      </div>
    );
  }

  // Disconnected state
  return (
    <div className={cn('space-y-3', className)}>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-3 font-medium text-cyan-400 transition-all hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {connectError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Failed to connect. Make sure MetaMask is installed.</span>
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        Connect your wallet to link it as Treasury Owner on Arc Testnet
      </p>
    </div>
  );
}
