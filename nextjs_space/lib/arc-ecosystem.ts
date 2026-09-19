/**
 * Arc ecosystem watchlist — real repositories, real numbers.
 *
 * The list itself is curated (public projects building on Arc). Everything
 * numeric is fetched live from the GitHub API and cached; nothing is invented.
 * A trust score only exists once the agent has actually analysed the project
 * (a Project row with the same GitHub URL) — otherwise it is null.
 */

import prisma from '@/lib/db';

export interface EcosystemEntry {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  repo: string; // owner/name
  website?: string;
  tags: string[];
}

export const ARC_ECOSYSTEM: EcosystemEntry[] = [
  {
    id: 'arcent',
    name: 'Arcent',
    tagline: 'x402 Payment Gateway for Agentic Commerce',
    description:
      'x402 payment gateway that lets AI agents pay for API access autonomously: pay-on-success, gasless transactions and multi-provider routing.',
    category: 'Infrastructure',
    repo: 'cutepawss/arcent',
    website: 'https://arcent.vercel.app',
    tags: ['x402', 'agentic-commerce', 'payments', 'ai-agents'],
  },
  {
    id: 'voice-vault',
    name: 'VoiceVault',
    tagline: 'AI-powered voice-controlled crypto wallet',
    description:
      'Voice-controlled crypto wallet built with Next.js, FastAPI, OpenAI Agents, Circle and ElevenLabs. USDC transactions through natural-language voice commands.',
    category: 'AI/ML',
    repo: 'Abdulbasit110/voice-vault',
    website: 'https://ai-voice-vault.vercel.app',
    tags: ['voice-ai', 'wallet', 'openai', 'circle'],
  },
  {
    id: 'arcvote',
    name: 'ArcVote',
    tagline: 'Decentralized Voting dApp on Arc',
    description:
      'Decentralized voting dApp built on Arc with Solidity and Ethers.js. Transparent, immutable voting with USDC-based governance.',
    category: 'Social',
    repo: 'Apollo-stack/ArcVote-Project',
    website: 'https://apollo-stack.github.io/ArcVote-Project/',
    tags: ['voting', 'governance', 'solidity'],
  },
  {
    id: 'unified-pay',
    name: 'UnifiedPay',
    tagline: 'Circle + ENS + USDC unified payments',
    description: 'Unified payments layer combining Circle, ENS names and USDC settlement.',
    category: 'Infrastructure',
    repo: 'AdityaBirangal/UnifiedPay',
    website: 'https://unifiedpay.birangal.com',
    tags: ['payments', 'ens', 'usdc'],
  },
  {
    id: 'arc-feed',
    name: 'Arc Feed',
    tagline: 'Real-time wallet tracking on Arc',
    description: 'Real-time wallet activity feed and tracking for Arc Network.',
    category: 'Infrastructure',
    repo: 'Devancore/arc-feed',
    website: 'https://devancore.com',
    tags: ['analytics', 'wallet-tracking'],
  },
  {
    id: 'arc-stripe-hybrid',
    name: 'Arc-Stripe Hybrid',
    tagline: 'Fiat-to-Arc payments playbook with Stripe',
    description: 'Playbook for bridging Stripe fiat payments into USDC settlement on Arc.',
    category: 'Infrastructure',
    repo: 'Glencorse033/arc-stripe-hybrid-playbook',
    tags: ['stripe', 'fiat', 'bridge', 'payments'],
  },
];

export interface EcosystemProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  logoEmoji: string;
  /** Agent-assigned score, or null when the agent has not analysed the project. */
  trustScore: number | null;
  activityLevel: 'High' | 'Moderate' | 'Low' | 'Unknown';
  metrics: {
    githubStars: number | null;
    forks: number | null;
    commits30d: number | null;
    contributors: number | null;
    lastPush: string | null;
  };
  contact: { github: string; website?: string };
  tags: string[];
  source: 'arc-ecosystem';
}

const CATEGORY_EMOJI: Record<string, string> = {
  DeFi: '💰',
  'AI/ML': '🤖',
  Infrastructure: '🔧',
  Social: '👥',
  Gaming: '🎮',
  NFT: '🖼️',
};

const GITHUB_API = 'https://api.github.com';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // unauthenticated GitHub allows 60 req/h

type RepoStats = EcosystemProject['metrics'];
let cache: { at: number; stats: Record<string, RepoStats> } | null = null;

async function gh(path: string): Promise<any | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'entarc',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`${GITHUB_API}${path}`, { headers, cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchRepoStats(repo: string): Promise<RepoStats> {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const [info, commits, contributors] = await Promise.all([
    gh(`/repos/${repo}`),
    gh(`/repos/${repo}/commits?since=${since}&per_page=100`),
    gh(`/repos/${repo}/contributors?per_page=100`),
  ]);
  return {
    githubStars: info?.stargazers_count ?? null,
    forks: info?.forks_count ?? null,
    commits30d: Array.isArray(commits) ? commits.length : null,
    contributors: Array.isArray(contributors) ? contributors.length : null,
    lastPush: info?.pushed_at ?? null,
  };
}

function activityFrom(stats: RepoStats): EcosystemProject['activityLevel'] {
  if (stats.commits30d == null) return 'Unknown';
  if (stats.commits30d >= 20) return 'High';
  if (stats.commits30d >= 1) return 'Moderate';
  return 'Low';
}

export async function getArcEcosystem(): Promise<EcosystemProject[]> {
  if (!cache || Date.now() - cache.at > CACHE_TTL_MS) {
    const entries = await Promise.all(
      ARC_ECOSYSTEM.map(async (e) => [e.repo, await fetchRepoStats(e.repo)] as const)
    );
    const stats = Object.fromEntries(entries);
    // Do not pin a fully failed fetch (rate limit) for the whole TTL.
    const anyLive = entries.some(([, s]) => s.githubStars != null);
    if (anyLive || !cache) cache = { at: anyLive ? Date.now() : 0, stats };
  }

  // Scores come only from the agent's own analyses.
  const analysed = await prisma.project.findMany({
    where: { aiTrustScore: { not: null }, githubUrl: { not: null } },
    select: { githubUrl: true, aiTrustScore: true },
  });
  const scoreByRepo = new Map(
    analysed.map((p) => [
      (p.githubUrl ?? '').toLowerCase().replace(/\/+$/, '').replace(/\.git$/, ''),
      p.aiTrustScore,
    ])
  );

  return ARC_ECOSYSTEM.map((e) => {
    const metrics = cache?.stats[e.repo] ?? {
      githubStars: null,
      forks: null,
      commits30d: null,
      contributors: null,
      lastPush: null,
    };
    const url = `https://github.com/${e.repo}`;
    return {
      id: e.id,
      name: e.name,
      tagline: e.tagline,
      description: e.description,
      category: e.category,
      logoEmoji: CATEGORY_EMOJI[e.category] ?? '🚀',
      trustScore: scoreByRepo.get(url.toLowerCase()) ?? null,
      activityLevel: activityFrom(metrics),
      metrics,
      contact: { github: url, website: e.website },
      tags: e.tags,
      source: 'arc-ecosystem' as const,
    };
  });
}
