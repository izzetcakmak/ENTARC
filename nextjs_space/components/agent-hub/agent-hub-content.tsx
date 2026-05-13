'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  Wallet,
  Zap,
  Store,
  Terminal,
  Shield,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  CircleDollarSign,
  Cpu,
  Mail,
  User,
  Globe,
  Key,
  Fingerprint,
  Droplets,
} from 'lucide-react';

interface WalletData {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  walletSetName?: string;
  createDate?: string;
}

interface WalletSetData {
  id: string;
  name: string;
  createDate?: string;
}

export function AgentHubContent() {
  const [status, setStatus] = useState<any>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [walletSets, setWalletSets] = useState<WalletSetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fundingWallet, setFundingWallet] = useState<string | null>(null);
  const [fundResult, setFundResult] = useState<{ address: string; success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchStatus();
    fetchWallets();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/circle/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ configured: false, connected: false });
    }
  };

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/circle/wallets');
      const data = await res.json();
      if (data.success) {
        setWallets(data.wallets || []);
        setWalletSets(data.walletSets || []);
      }
    } catch {
      setError('Failed to fetch wallets');
    } finally {
      setLoading(false);
    }
  };

  const createWalletSet = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/circle/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-wallet-set',
          walletSetName: `ENTARC Agent Set #${walletSets.length + 1}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Create a wallet in the new set
        const walletRes = await fetch('/api/circle/wallets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-wallet',
            walletSetId: data.walletSet.id,
            blockchain: 'ARC-TESTNET',
          }),
        });
        await walletRes.json();
        fetchWallets();
      } else {
        setError(data.error || 'Failed to create wallet');
      }
    } catch {
      setError('Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(address);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const requestFaucet = async (address: string) => {
    setFundingWallet(address);
    setFundResult(null);
    try {
      const res = await fetch('/api/circle/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, blockchain: 'ARC-TESTNET', usdc: true, native: true }),
      });
      const data = await res.json();
      setFundResult({
        address,
        success: data.success,
        message: data.success
          ? '20 USDC + native tokens requested! Arrives in ~30s.'
          : data.error || 'Faucet request failed',
      });
    } catch (err: any) {
      setFundResult({ address, success: false, message: err.message });
    }
    setFundingWallet(null);
  };

  const agentFeatures = [
    {
      icon: Wallet,
      title: 'Agent Wallets',
      description: 'Autonomous USDC wallets with policy controls for AI-driven investments',
      status: 'active',
      link: 'https://developers.circle.com/agent-stack',
    },
    {
      icon: Zap,
      title: 'Nanopayments',
      description: 'Gas-free micro-transactions as small as $0.000001 at machine speed',
      status: 'active',
      link: 'https://developers.circle.com/agent-stack',
    },
    {
      icon: Store,
      title: 'Agent Marketplace',
      description: 'Discover and pay for USDC-priced services on demand',
      status: 'coming',
      link: 'https://agents.circle.com',
    },
    {
      icon: Terminal,
      title: 'Circle CLI',
      description: 'Command-line control plane for wallet management and policies',
      status: 'active',
      link: 'https://developers.circle.com/agent-stack',
    },
    {
      icon: Cpu,
      title: 'Circle Skills',
      description: 'Open-source AI agent skills for building with Circle products',
      status: 'active',
      link: 'https://github.com/circlefin/skills',
    },
    {
      icon: Shield,
      title: 'Policy Controls',
      description: 'Time-bound spending limits, allowlists, and blocklists for security',
      status: 'active',
      link: 'https://developers.circle.com/agent-stack',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="w-7 h-7 text-cyan-400" />
            Agent Hub
          </h1>
          <p className="text-gray-400 mt-1">
            Circle Agent Stack — Autonomous financial infrastructure for ENTARC
          </p>
        </div>
        <a
          href="https://agents.circle.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm"
        >
          <CircleDollarSign className="w-4 h-4" />
          agents.circle.com
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Connection Status Banner */}
      <div className={`rounded-xl border p-4 ${
        status?.connected
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : status?.configured
          ? 'bg-yellow-500/5 border-yellow-500/30'
          : 'bg-red-500/5 border-red-500/30'
      }`}>
        <div className="flex items-center gap-3">
          {status?.connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <div>
            <p className={`font-medium ${
              status?.connected ? 'text-emerald-400' : 'text-yellow-400'
            }`}>
              {status?.connected
                ? 'Circle Agent Stack Connected'
                : status?.configured
                ? 'Circle Agent Stack Configured — Verifying Connection...'
                : 'Circle Agent Stack — Configure API Keys to Activate'}
            </p>
            <p className="text-gray-400 text-sm mt-0.5">
              {status?.connected
                ? `${wallets.length} wallet(s) active · ${walletSets.length} wallet set(s)`
                : 'Set CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET in environment'}
            </p>
          </div>
        </div>
      </div>

      {/* Agent Features Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Agent Stack Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentFeatures.map((feature) => (
            <a
              key={feature.title}
              href={feature.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl bg-gray-900/50 border border-gray-800 p-5 hover:border-cyan-500/40 hover:bg-gray-900/80 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <feature.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    feature.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {feature.status === 'active' ? 'Active' : 'Coming Soon'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
              <h3 className="text-white font-medium mb-1">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Agent Wallets Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            Agent Wallets
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fetchWallets}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={createWalletSet}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Agent Wallet
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="text-gray-400 ml-3">Loading wallets...</span>
          </div>
        ) : wallets.length === 0 ? (
          <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-8 text-center">
            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-1">No Agent Wallets Yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create your first autonomous wallet to enable AI-driven investments
            </p>
            <button
              onClick={createWalletSet}
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create First Agent Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="rounded-xl bg-gray-900/50 border border-gray-800 p-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Wallet className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">
                          {wallet.walletSetName || 'Agent Wallet'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {wallet.blockchain}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          wallet.state === 'LIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {wallet.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-gray-400 text-xs font-mono">
                          {wallet.address}
                        </code>
                        <button
                          onClick={() => copyAddress(wallet.address)}
                          className="text-gray-500 hover:text-cyan-400 transition-colors"
                        >
                          {copiedId === wallet.address ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => requestFaucet(wallet.address)}
                      disabled={fundingWallet === wallet.address}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-colors text-xs disabled:opacity-50"
                      title="Request 20 test USDC from Circle Faucet"
                    >
                      {fundingWallet === wallet.address ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Droplets className="w-3.5 h-3.5" />
                      )}
                      Fund
                    </button>
                    <a
                      href={`https://testnet.arcscan.app/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {/* Faucet result banner */}
                {fundResult && fundResult.address === wallet.address && (
                  <div className={`mt-2 rounded-lg p-2.5 text-xs ${
                    fundResult.success
                      ? 'bg-emerald-500/5 border border-emerald-500/30 text-emerald-400'
                      : 'bg-orange-500/5 border border-orange-500/30 text-orange-400'
                  }`}>
                    {fundResult.success ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{fundResult.message}</span>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1">{fundResult.message}</p>
                        <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer"
                          className="underline text-violet-400 hover:text-violet-300">
                          Use web faucet → faucet.circle.com
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== CIRCLE APP KIT — INTERACTIVE DEMO ===== */}
      <AppKitDemo />

      {/* Architecture Diagram */}
      <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">ENTARC × Circle Agent Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-4 text-center">
            <Bot className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">ENTARC AI Agent</h3>
            <p className="text-gray-400 text-xs mt-1">Discovers projects, analyzes trust scores, makes investment decisions</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 border border-cyan-500/30 p-4 text-center">
            <CircleDollarSign className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">Circle Agent Stack</h3>
            <p className="text-gray-400 text-xs mt-1">Agent Wallets · Nanopayments · Marketplace · CLI · Skills</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-4 text-center">
            <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">Arc Network</h3>
            <p className="text-gray-400 text-xs mt-1">On-chain execution, USDC transfers, smart contract interactions</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-px bg-cyan-500/30 flex-1" />
          <span className="text-cyan-400 text-xs px-3">Autonomous Investment Flow</span>
          <div className="h-px bg-cyan-500/30 flex-1" />
        </div>
        <p className="text-gray-400 text-sm text-center mt-3">
          AI discovers Pre-TGE projects → Analyzes trust score → Creates investment proposal → Executes via Circle Agent Wallet → Settles on Arc Network
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="https://github.com/circlefin/arc-node"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl bg-gray-900/50 border border-gray-800 p-4 hover:border-cyan-500/30 transition-colors"
        >
          <div className="p-3 rounded-lg bg-gray-800">
            <Terminal className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Arc Node (Open Source)</h3>
            <p className="text-gray-400 text-xs">Circle Finance&apos;s official Arc Network node implementation</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 ml-auto transition-colors" />
        </a>
        <a
          href="https://developers.circle.com/agent-stack"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl bg-gray-900/50 border border-gray-800 p-4 hover:border-cyan-500/30 transition-colors"
        >
          <div className="p-3 rounded-lg bg-gray-800">
            <Cpu className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Circle Agent Stack Docs</h3>
            <p className="text-gray-400 text-xs">Developer documentation for Agent Wallets, Nanopayments, and more</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 ml-auto transition-colors" />
        </a>
      </div>
    </div>
  );
}

// ===== APP KIT DEMO COMPONENT — Full: Onboard, Send, Swap, Bridge =====
type AppKitTab = 'onboard' | 'send' | 'swap' | 'bridge';

function AppKitDemo() {
  const [activeTab, setActiveTab] = useState<AppKitTab>('onboard');

  // Onboard state
  const [onboardMethod, setOnboardMethod] = useState<'email' | 'social' | 'passkey'>('email');
  const [demoEmail, setDemoEmail] = useState('');
  const [onboardStep, setOnboardStep] = useState<'idle' | 'processing' | 'creating' | 'funding' | 'done'>('idle');
  const [createdWallet, setCreatedWallet] = useState<string | null>(null);
  const [faucetStatus, setFaucetStatus] = useState<'idle' | 'loading' | 'success' | 'fallback'>('idle');

  // Send state
  const [sendTo, setSendTo] = useState('0x9a3f...dE7b');
  const [sendAmount, setSendAmount] = useState('25.00');
  const [sendStep, setSendStep] = useState<'idle' | 'signing' | 'confirming' | 'done'>('idle');
  const [sendTxHash, setSendTxHash] = useState('');

  // Swap state
  const [swapFrom, setSwapFrom] = useState('USDC');
  const [swapTo, setSwapTo] = useState('WETH');
  const [swapAmount, setSwapAmount] = useState('100');
  const [swapStep, setSwapStep] = useState<'idle' | 'quoting' | 'executing' | 'done'>('idle');
  const [swapResult, setSwapResult] = useState<{ received: string; rate: string; gas: string; txHash: string } | null>(null);

  // Bridge state
  const [bridgeFrom, setBridgeFrom] = useState('Arc Testnet');
  const [bridgeTo, setBridgeTo] = useState('Ethereum Sepolia');
  const [bridgeAmount, setBridgeAmount] = useState('500');
  const [bridgeStep, setBridgeStep] = useState<'idle' | 'locking' | 'attesting' | 'minting' | 'done'>('idle');
  const [bridgeResult, setBridgeResult] = useState<{ attestationHash: string; destTx: string } | null>(null);

  const randomHex = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  // === ONBOARD ===
  const runOnboard = async () => {
    if (onboardMethod === 'email' && !demoEmail) return;
    setFaucetStatus('idle');
    setOnboardStep('processing');
    await new Promise(r => setTimeout(r, 1200));
    setOnboardStep('creating');
    await new Promise(r => setTimeout(r, 1500));
    const walletAddr = `0x${randomHex(40)}`;
    setCreatedWallet(walletAddr);
    // Auto-fund via Circle Faucet
    setOnboardStep('funding');
    setFaucetStatus('loading');
    try {
      const res = await fetch('/api/circle/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddr, blockchain: 'ARC-TESTNET', usdc: true, native: true }),
      });
      const data = await res.json();
      setFaucetStatus(data.success ? 'success' : 'fallback');
    } catch {
      setFaucetStatus('fallback');
    }
    await new Promise(r => setTimeout(r, 800));
    setOnboardStep('done');
  };

  // === SEND ===
  const runSend = async () => {
    setSendStep('signing');
    await new Promise(r => setTimeout(r, 1000));
    setSendStep('confirming');
    await new Promise(r => setTimeout(r, 1500));
    setSendTxHash(`0x${randomHex(64)}`);
    setSendStep('done');
  };

  // === SWAP ===
  const runSwap = async () => {
    setSwapStep('quoting');
    await new Promise(r => setTimeout(r, 1000));
    setSwapStep('executing');
    await new Promise(r => setTimeout(r, 1800));
    const amt = parseFloat(swapAmount);
    const rate = swapTo === 'WETH' ? 0.000385 : swapTo === 'WBTC' ? 0.0000148 : 1.0;
    setSwapResult({
      received: `${(amt * rate).toFixed(6)} ${swapTo}`,
      rate: `1 USDC = ${rate} ${swapTo}`,
      gas: '$0.00 (gas-free)',
      txHash: `0x${randomHex(64)}`,
    });
    setSwapStep('done');
  };

  // === BRIDGE (CCTP) ===
  const runBridge = async () => {
    setBridgeStep('locking');
    await new Promise(r => setTimeout(r, 1200));
    setBridgeStep('attesting');
    await new Promise(r => setTimeout(r, 2000));
    setBridgeStep('minting');
    await new Promise(r => setTimeout(r, 1500));
    setBridgeResult({
      attestationHash: `0x${randomHex(64)}`,
      destTx: `0x${randomHex(64)}`,
    });
    setBridgeStep('done');
  };

  const tabs: { key: AppKitTab; label: string; icon: typeof Wallet }[] = [
    { key: 'onboard', label: 'Onboard', icon: Key },
    { key: 'send', label: 'Send', icon: ExternalLink },
    { key: 'swap', label: 'Swap', icon: RefreshCw },
    { key: 'bridge', label: 'Bridge', icon: Globe },
  ];

  const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50';
  const labelCls = 'text-xs text-gray-500 mb-1 block';

  return (
    <div className="rounded-xl bg-gray-900/50 border border-violet-500/30 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-semibold text-white">Circle App Kit</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">Interactive Demo</span>
      </div>
      <p className="text-xs text-gray-400 mb-5">Embedded wallet experience — onboard users, send USDC, swap tokens, and bridge cross-chain via CCTP. No extensions needed.</p>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-gray-800/50 border border-gray-700/50">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
              activeTab === key
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ========== TAB: ONBOARD ========== */}
      {activeTab === 'onboard' && (
        <div>
          {onboardStep === 'idle' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {([['email', 'Email', Mail], ['social', 'Google SSO', User], ['passkey', 'Passkey', Fingerprint]] as const).map(([k, lbl, Ic]) => (
                  <button key={k} onClick={() => setOnboardMethod(k)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all ${onboardMethod === k ? 'border-violet-500/50 bg-violet-500/10 text-violet-400' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'}`}>
                    <Ic className="h-3.5 w-3.5" />{lbl}
                  </button>
                ))}
              </div>
              {onboardMethod === 'email' && (
                <div>
                  <label className={labelCls}>User Email</label>
                  <input type="email" value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} placeholder="investor@example.com" className={inputCls} />
                </div>
              )}
              {onboardMethod === 'social' && (
                <div className="rounded-lg bg-gray-800 border border-gray-700 p-3 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10"><User className="w-4 h-4 text-blue-400" /></div>
                  <div><p className="text-sm text-white">Google OAuth 2.0</p><p className="text-xs text-gray-400">One-click wallet creation</p></div>
                </div>
              )}
              {onboardMethod === 'passkey' && (
                <div className="rounded-lg bg-gray-800 border border-gray-700 p-3 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10"><Fingerprint className="w-4 h-4 text-emerald-400" /></div>
                  <div><p className="text-sm text-white">WebAuthn / Passkey</p><p className="text-xs text-gray-400">Face ID, Touch ID, hardware key</p></div>
                </div>
              )}
              <button onClick={runOnboard} disabled={onboardMethod === 'email' && !demoEmail}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-40">
                <Key className="h-4 w-4" /> Create Wallet via App Kit
              </button>
            </div>
          )}
          {(onboardStep === 'processing' || onboardStep === 'creating' || onboardStep === 'funding') && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-7 h-7 text-violet-400 animate-spin mb-3" />
              <p className="text-white text-sm font-medium">
                {onboardStep === 'processing' ? 'Authenticating...' : onboardStep === 'creating' ? 'Creating Programmable Wallet...' : 'Requesting Test USDC from Circle Faucet...'}
              </p>
              <div className="flex gap-3 mt-3">
                {['Auth', 'Wallet', 'Fund USDC'].map((s, i) => {
                  const stepIdx = onboardStep === 'processing' ? 0 : onboardStep === 'creating' ? 1 : 2;
                  return (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${i === stepIdx ? 'bg-violet-400 animate-pulse' : i < stepIdx ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                      <span className="text-xs text-gray-400">{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {onboardStep === 'done' && createdWallet && (
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-4">
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 text-sm font-medium">Wallet Ready &amp; Funded</span></div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-gray-500">Address</p><code className="text-cyan-400 font-mono break-all">{createdWallet}</code></div>
                  <div><p className="text-gray-500">Method</p><p className="text-white">{onboardMethod === 'email' ? demoEmail : onboardMethod === 'social' ? 'Google OAuth' : 'Passkey'}</p></div>
                  <div><p className="text-gray-500">Network</p><p className="text-white">Arc Testnet</p></div>
                  <div><p className="text-gray-500">Balance</p>
                    {faucetStatus === 'success' ? (
                      <p className="text-emerald-400 font-medium">20 USDC <span className="text-gray-500 font-normal">(from Circle Faucet)</span></p>
                    ) : (
                      <p className="text-orange-400">Faucet unavailable — <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-300">fund manually</a></p>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-gray-800/30 border border-gray-700 p-2">
                <p className="text-xs text-gray-400">
                  <span className="text-violet-400 font-medium">Full Flow:</span> Authenticate → Create wallet → Auto-fund with test USDC → Ready to Send / Swap / Bridge
                </p>
              </div>
              <button onClick={() => { setOnboardStep('idle'); setCreatedWallet(null); setDemoEmail(''); setFaucetStatus('idle'); }} className="text-xs text-gray-400 hover:text-white transition-colors">Reset Demo</button>
            </div>
          )}
        </div>
      )}

      {/* ========== TAB: SEND ========== */}
      {activeTab === 'send' && (
        <div>
          {sendStep === 'idle' && (
            <div className="space-y-3">
              <div><label className={labelCls}>Recipient Address</label><input value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder="0x..." className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Amount (USDC)</label><input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Network</label><div className="px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm">Arc Testnet</div></div>
              </div>
              <div className="rounded-lg bg-gray-800/40 border border-gray-700/50 p-3 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Gas Fee</span><span className="text-emerald-400">$0.00 (USDC native gas)</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Settlement</span><span className="text-white">&lt;1 second</span></div>
              </div>
              <button onClick={runSend} disabled={!sendTo || !sendAmount}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-all disabled:opacity-40">
                <ExternalLink className="h-4 w-4" /> Send USDC
              </button>
            </div>
          )}
          {(sendStep === 'signing' || sendStep === 'confirming') && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-7 h-7 text-cyan-400 animate-spin mb-3" />
              <p className="text-white text-sm font-medium">{sendStep === 'signing' ? 'Signing Transaction...' : 'Confirming on Arc...'}</p>
              <div className="flex gap-3 mt-3">
                {['Sign', 'Broadcast', 'Confirm'].map((s, i) => (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${(sendStep === 'signing' && i === 0) || (sendStep === 'confirming' && i === 1) ? 'bg-cyan-400 animate-pulse' : i < (sendStep === 'confirming' ? 1 : 0) ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-xs text-gray-400">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sendStep === 'done' && (
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-4">
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 text-sm font-medium">Transfer Complete</span></div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-white">{sendAmount} USDC</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">To</span><span className="text-cyan-400 font-mono">{sendTo}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">TX Hash</span><a href={`https://testnet.arcscan.app/tx/${sendTxHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:text-cyan-300 underline decoration-cyan-500/30 hover:decoration-cyan-400 transition-colors">{sendTxHash.slice(0, 20)}... ↗</a></div>
                  <div className="flex justify-between"><span className="text-gray-500">Gas</span><span className="text-emerald-400">$0.00</span></div>
                </div>
              </div>
              <button onClick={() => { setSendStep('idle'); setSendTxHash(''); }} className="text-xs text-gray-400 hover:text-white transition-colors">Send Another</button>
            </div>
          )}
        </div>
      )}

      {/* ========== TAB: SWAP ========== */}
      {activeTab === 'swap' && (
        <div>
          {swapStep === 'idle' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>From</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">USDC</span>
                    <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>To</label>
                  <select value={swapTo} onChange={(e) => setSwapTo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-violet-500/50">
                    <option value="WETH">WETH</option>
                    <option value="WBTC">WBTC</option>
                    <option value="ARC">ARC</option>
                  </select>
                </div>
              </div>
              <div className="rounded-lg bg-gray-800/40 border border-gray-700/50 p-3 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Estimated Rate</span><span className="text-white">1 USDC ≈ {swapTo === 'WETH' ? '0.000385 WETH' : swapTo === 'WBTC' ? '0.0000148 WBTC' : '2.45 ARC'}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Slippage</span><span className="text-white">0.5%</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Gas</span><span className="text-emerald-400">$0.00 (native USDC)</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">DEX</span><span className="text-violet-400">ArcSwap AMM</span></div>
              </div>
              <button onClick={runSwap} disabled={!swapAmount}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-40">
                <RefreshCw className="h-4 w-4" /> Swap via App Kit
              </button>
            </div>
          )}
          {(swapStep === 'quoting' || swapStep === 'executing') && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-7 h-7 text-violet-400 animate-spin mb-3" />
              <p className="text-white text-sm font-medium">{swapStep === 'quoting' ? 'Fetching Best Route...' : 'Executing Swap...'}</p>
              <div className="flex gap-3 mt-3">
                {['Quote', 'Approve', 'Swap'].map((s, i) => (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${(swapStep === 'quoting' && i === 0) || (swapStep === 'executing' && i >= 1) ? (i <= 1 ? 'bg-violet-400 animate-pulse' : 'bg-gray-600') : i < 1 ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    <span className="text-xs text-gray-400">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {swapStep === 'done' && swapResult && (
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-4">
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 text-sm font-medium">Swap Complete</span></div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Sent</span><span className="text-white">{swapAmount} USDC</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Received</span><span className="text-emerald-400">{swapResult.received}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="text-white">{swapResult.rate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">TX Hash</span><a href={`https://testnet.arcscan.app/tx/${swapResult.txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:text-cyan-300 underline decoration-cyan-500/30 hover:decoration-cyan-400 transition-colors">{swapResult.txHash.slice(0, 20)}... ↗</a></div>
                  <div className="flex justify-between"><span className="text-gray-500">Gas</span><span className="text-emerald-400">{swapResult.gas}</span></div>
                </div>
              </div>
              <button onClick={() => { setSwapStep('idle'); setSwapResult(null); }} className="text-xs text-gray-400 hover:text-white transition-colors">Swap Again</button>
            </div>
          )}
        </div>
      )}

      {/* ========== TAB: BRIDGE (CCTP) ========== */}
      {activeTab === 'bridge' && (
        <div>
          {bridgeStep === 'idle' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>From Chain</label>
                  <select value={bridgeFrom} onChange={(e) => setBridgeFrom(e.target.value)} className={inputCls}>
                    <option>Arc Testnet</option>
                    <option>Ethereum Sepolia</option>
                    <option>Avalanche Fuji</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>To Chain</label>
                  <select value={bridgeTo} onChange={(e) => setBridgeTo(e.target.value)} className={inputCls}>
                    <option>Ethereum Sepolia</option>
                    <option>Arc Testnet</option>
                    <option>Avalanche Fuji</option>
                    <option>Arbitrum Sepolia</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Amount (USDC)</label>
                <input type="number" value={bridgeAmount} onChange={(e) => setBridgeAmount(e.target.value)} className={inputCls} />
              </div>
              <div className="rounded-lg bg-gray-800/40 border border-gray-700/50 p-3 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Protocol</span><span className="text-violet-400">Circle CCTP v2</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Mechanism</span><span className="text-white">Burn → Attest → Mint</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Est. Time</span><span className="text-white">~2-5 minutes</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Fee</span><span className="text-emerald-400">$0.00 (native USDC bridge)</span></div>
              </div>
              <button onClick={runBridge} disabled={!bridgeAmount || bridgeFrom === bridgeTo}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-40">
                <Globe className="h-4 w-4" /> Bridge via CCTP
              </button>
            </div>
          )}
          {bridgeStep !== 'idle' && bridgeStep !== 'done' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mb-3" />
              <p className="text-white text-sm font-medium">
                {bridgeStep === 'locking' ? `Burning USDC on ${bridgeFrom}...` : bridgeStep === 'attesting' ? 'Circle Attestation Service verifying...' : `Minting USDC on ${bridgeTo}...`}
              </p>
              <div className="flex gap-2 mt-4">
                {[
                  { label: 'Burn', chain: bridgeFrom },
                  { label: 'Attest', chain: 'Circle' },
                  { label: 'Mint', chain: bridgeTo },
                ].map((s, i) => {
                  const stepIdx = bridgeStep === 'locking' ? 0 : bridgeStep === 'attesting' ? 1 : 2;
                  return (
                    <div key={s.label} className="flex flex-col items-center gap-1">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === stepIdx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-pulse'
                        : i < stepIdx ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-800 text-gray-500 border border-gray-700'
                      }`}>{i + 1}</div>
                      <span className="text-xs text-gray-400">{s.label}</span>
                      <span className="text-xs text-gray-600">{s.chain}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {bridgeStep === 'done' && bridgeResult && (
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-4">
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400 text-sm font-medium">Bridge Complete — CCTP</span></div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-white">{bridgeAmount} USDC</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="text-white">{bridgeFrom} → {bridgeTo}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Attestation</span><a href={`https://iris-api.circle.com/v1/attestations/${bridgeResult.attestationHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:text-cyan-300 underline decoration-cyan-500/30 hover:decoration-cyan-400 transition-colors">{bridgeResult.attestationHash.slice(0, 22)}... ↗</a></div>
                  <div className="flex justify-between"><span className="text-gray-500">Dest TX</span><a href={`https://testnet.arcscan.app/tx/${bridgeResult.destTx}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-mono hover:text-cyan-300 underline decoration-cyan-500/30 hover:decoration-cyan-400 transition-colors">{bridgeResult.destTx.slice(0, 22)}... ↗</a></div>
                </div>
              </div>
              <div className="rounded-lg bg-gray-800/30 border border-gray-700 p-2">
                <p className="text-xs text-gray-400"><span className="text-violet-400 font-medium">CCTP Flow:</span> USDC burned on {bridgeFrom} → Circle attestation verifies → Native USDC minted on {bridgeTo}</p>
              </div>
              <button onClick={() => { setBridgeStep('idle'); setBridgeResult(null); }} className="text-xs text-gray-400 hover:text-white transition-colors">Bridge Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
