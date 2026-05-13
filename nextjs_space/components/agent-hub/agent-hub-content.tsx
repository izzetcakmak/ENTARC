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
  Smartphone,
  Globe,
  Key,
  Fingerprint,
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

// ===== APP KIT DEMO COMPONENT =====
function AppKitDemo() {
  const [onboardingMethod, setOnboardingMethod] = useState<'email' | 'social' | 'passkey'>('email');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoStep, setDemoStep] = useState<'idle' | 'processing' | 'creating-wallet' | 'complete'>('idle');
  const [demoWallet, setDemoWallet] = useState<{ address: string; method: string } | null>(null);

  const runAppKitDemo = async () => {
    if (onboardingMethod === 'email' && !demoEmail) return;
    setDemoStep('processing');

    // Simulate App Kit authentication flow
    await new Promise(r => setTimeout(r, 1200));
    setDemoStep('creating-wallet');

    // Simulate wallet creation
    await new Promise(r => setTimeout(r, 1500));

    const walletAddr = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setDemoWallet({
      address: walletAddr,
      method: onboardingMethod === 'email' ? `Email: ${demoEmail}` : onboardingMethod === 'social' ? 'Google OAuth' : 'Passkey (Biometric)',
    });
    setDemoStep('complete');
  };

  const resetDemo = () => {
    setDemoStep('idle');
    setDemoWallet(null);
    setDemoEmail('');
  };

  return (
    <div className="rounded-xl bg-gray-900/50 border border-violet-500/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Circle App Kit</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">
            Wallet Onboarding
          </span>
        </div>
        {demoStep === 'complete' && (
          <button onClick={resetDemo} className="text-xs text-slate-400 hover:text-white transition-colors">
            Reset Demo
          </button>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-5">
        Zero-friction wallet creation for users. No seed phrases, no extensions — just email, social login, or passkey. Powered by Circle&apos;s programmable wallets.
      </p>

      {demoStep === 'idle' && (
        <div className="space-y-4">
          {/* Method Selector */}
          <div className="flex gap-2">
            {[
              { key: 'email' as const, label: 'Email', icon: Mail },
              { key: 'social' as const, label: 'Google SSO', icon: User },
              { key: 'passkey' as const, label: 'Passkey', icon: Fingerprint },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setOnboardingMethod(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-all ${
                  onboardingMethod === key
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Input based on method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {onboardingMethod === 'email' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">User Email</label>
                  <input
                    type="email"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="investor@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              )}
              {onboardingMethod === 'social' && (
                <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">Google OAuth 2.0</p>
                      <p className="text-xs text-gray-400">One-click wallet via Google account</p>
                    </div>
                  </div>
                </div>
              )}
              {onboardingMethod === 'passkey' && (
                <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Fingerprint className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">WebAuthn / Passkey</p>
                      <p className="text-xs text-gray-400">Face ID, Touch ID, or hardware key</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={runAppKitDemo}
                disabled={onboardingMethod === 'email' && !demoEmail}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Key className="h-4 w-4" />
                Create Wallet via App Kit
              </button>
            </div>

            <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-4">
              <h4 className="text-xs text-gray-500 mb-3 uppercase tracking-wider">App Kit Features</h4>
              <div className="space-y-2">
                {[
                  { label: 'No seed phrase needed', active: true },
                  { label: 'Social login support', active: true },
                  { label: 'Passkey / biometric auth', active: true },
                  { label: 'Embedded wallet (no extension)', active: true },
                  { label: 'Cross-platform (Web + Mobile)', active: true },
                  { label: 'Circle programmable wallet', active: true },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-gray-300">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(demoStep === 'processing' || demoStep === 'creating-wallet') && (
        <div className="flex flex-col items-center py-8">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-4" />
          <p className="text-white font-medium">
            {demoStep === 'processing' ? 'Authenticating via App Kit...' : 'Creating Circle Programmable Wallet...'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {demoStep === 'processing'
              ? `Method: ${onboardingMethod === 'email' ? demoEmail : onboardingMethod === 'social' ? 'Google OAuth' : 'Passkey'}`
              : 'Provisioning wallet on Arc Testnet'}
          </p>
          <div className="flex gap-3 mt-4">
            {['Authenticate', 'Create Wallet', 'Fund USDC'].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${
                  (demoStep === 'processing' && i === 0) || (demoStep === 'creating-wallet' && i === 1)
                    ? 'bg-violet-400 animate-pulse'
                    : i < (demoStep === 'creating-wallet' ? 1 : 0)
                    ? 'bg-emerald-400'
                    : 'bg-gray-600'
                }`} />
                <span className="text-xs text-gray-400">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {demoStep === 'complete' && demoWallet && (
        <div className="space-y-4">
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Wallet Created via App Kit</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                <code className="text-cyan-400 text-xs font-mono break-all">{demoWallet.address}</code>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Auth Method</p>
                <p className="text-white text-sm">{demoWallet.method}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Network</p>
                <p className="text-white text-sm">Arc Testnet</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Wallet Type</p>
                <p className="text-white text-sm">Circle Programmable Wallet</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-gray-800/30 border border-gray-700 p-3">
            <p className="text-xs text-gray-400">
              <span className="text-violet-400 font-medium">App Kit Flow:</span> User authenticates ({demoWallet.method}) → Circle creates embedded wallet → Wallet funded with USDC on Arc → User can invest without MetaMask or seed phrases
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
