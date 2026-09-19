// ENTARC Deal Flow Engine API
// AI-powered recommendation pipeline for discovering high-potential Web3 startups
// Personalized deal feed based on investor preferences

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Investor preference profiles
interface InvestorPreferences {
  sectors: string[];
  stagePreference: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  minTrustScore: number;
  prioritySignals: string[];
}

// Deal recommendation with AI scoring
interface DealRecommendation {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  stage: string;
  trustScore: number;
  matchScore: number; // How well it matches investor preferences
  matchReasons: string[];
  sentiment: string;
  activityLevel: string;
  trendingScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  github: { stars: number; commits30d: number; contributors: number; url: string };
  social: { mentions: number; sentiment: number; growth7d: number };
  funding: { raised: number; target: number; backers: number };
  tags: string[];
  signals: {
    github: number;
    social: number;
    onchain: number;
    market: number;
    sentiment: number;
  };
  highlights: string[];
  contact: { github?: string; website?: string };
  addedAt: string;
  hotDeal: boolean;
}

// Full deal catalog — Arc ecosystem projects with enriched data
const DEAL_CATALOG: DealRecommendation[] = [
  {
    id: 'arcent-x402',
    name: 'Arcent',
    tagline: 'x402 Payment Gateway for Agentic Commerce',
    description: 'Arcent is an x402 Payment Gateway enabling AI agents to pay for API access autonomously. Features Pay-on-Success, gasless transactions, and multi-provider routing.',
    category: 'Infrastructure',
    stage: 'Pre-TGE',
    trustScore: 92,
    matchScore: 0,
    matchReasons: [],
    sentiment: 'Bullish',
    activityLevel: 'High',
    trendingScore: 94,
    riskLevel: 'Low',
    github: { stars: 12, commits30d: 45, contributors: 2, url: 'https://github.com/cutepawss/arcent' },
    social: { mentions: 89, sentiment: 0.85, growth7d: 23 },
    funding: { raised: 0, target: 250000, backers: 0 },
    tags: ['x402', 'agentic-commerce', 'payments', 'ai-agents', 'circle'],
    signals: { github: 88, social: 82, onchain: 75, market: 90, sentiment: 87 },
    highlights: ['Gemini Honorable Mention at Arc Hackathon', 'Pay-on-Success model', 'Multi-provider routing'],
    contact: { github: 'https://github.com/cutepawss/arcent', website: 'https://arcent.vercel.app' },
    addedAt: '2026-05-12',
    hotDeal: true,
  },
  {
    id: 'voice-vault',
    name: 'VoiceVault',
    tagline: 'AI-powered voice-controlled crypto wallet',
    description: 'VoiceVault is an AI-powered voice-controlled crypto wallet platform. Manage USDC transactions via natural language voice commands with Circle integration.',
    category: 'AI/ML',
    stage: 'Pre-TGE',
    trustScore: 88,
    matchScore: 0,
    matchReasons: [],
    sentiment: 'Bullish',
    activityLevel: 'High',
    trendingScore: 86,
    riskLevel: 'Low',
    github: { stars: 2, commits30d: 67, contributors: 1, url: 'https://github.com/Abdulbasit110/voice-vault' },
    social: { mentions: 45, sentiment: 0.78, growth7d: 15 },
    funding: { raised: 0, target: 300000, backers: 0 },
    tags: ['voice-ai', 'wallet', 'openai', 'circle', 'stablecoin'],
    signals: { github: 91, social: 72, onchain: 65, market: 80, sentiment: 82 },
    highlights: ['Voice-controlled USDC transactions', 'OpenAI Agents + Circle Stack', 'ElevenLabs TTS integration'],
    contact: { github: 'https://github.com/Abdulbasit110/voice-vault', website: 'https://ai-voice-vault.vercel.app' },
    addedAt: '2026-05-11',
    hotDeal: true,
  },
  {
    id: 'arcvote',
    name: 'ArcVote',
    tagline: 'Decentralized Voting dApp on Arc',
    description: 'ArcVote is a decentralized voting dApp built on Arc Network Testnet using Solidity and Ethers.js. Transparent, immutable voting with USDC-based governance.',
    category: 'Governance',
    stage: 'Pre-TGE',
    trustScore: 82,
    matchScore: 0,
    matchReasons: [],
    sentiment: 'Bullish',
    activityLevel: 'Moderate',
    trendingScore: 72,
    riskLevel: 'Medium',
    github: { stars: 1, commits30d: 28, contributors: 2, url: 'https://github.com/Apollo-stack/ArcVote-Project' },
    social: { mentions: 34, sentiment: 0.71, growth7d: 8 },
    funding: { raised: 0, target: 200000, backers: 0 },
    tags: ['voting', 'dao', 'governance', 'solidity', 'arc-network'],
    signals: { github: 70, social: 65, onchain: 60, market: 68, sentiment: 74 },
    highlights: ['On-chain governance', 'USDC-based voting power', 'Transparent ballot system'],
    contact: { github: 'https://github.com/Apollo-stack/ArcVote-Project', website: 'https://apollo-stack.github.io/ArcVote-Project/' },
    addedAt: '2026-05-10',
    hotDeal: false,
  },
  {
    id: 'unified-pay',
    name: 'UnifiedPay',
    tagline: 'Circle + ENS + USDC unified payments',
    description: 'UnifiedPay combines Circle Programmable Wallets with ENS for human-readable addresses and gasless USDC payments. One-tap payment experience for Web3.',
    category: 'Payments',
    stage: 'Pre-TGE',
    trustScore: 85,
    matchScore: 0,
    matchReasons: [],
    sentiment: 'Bullish',
    activityLevel: 'High',
    trendingScore: 81,
    riskLevel: 'Low',
    github: { stars: 5, commits30d: 52, contributors: 3, url: '' },
    social: { mentions: 56, sentiment: 0.80, growth7d: 18 },
    funding: { raised: 0, target: 350000, backers: 0 },
    tags: ['payments', 'ens', 'circle', 'stablecoin', 'usdc'],
    signals: { github: 85, social: 76, onchain: 72, market: 83, sentiment: 80 },
    highlights: ['ENS + Circle integration', 'Gasless USDC payments', 'Human-readable addresses'],
    contact: {},
    addedAt: '2026-05-09',
    hotDeal: false,
  },
  {
    id: 'arc-shield',
    name: 'ArcShield',
    tagline: 'AI-powered DeFi security auditor on Arc',
    description: 'ArcShield uses AI agents to autonomously audit smart contracts on Arc Network, detecting vulnerabilities before deployment. Integrates with Circle for bounty payments.',
    category: 'Security',
    stage: 'Pre-TGE',
    trustScore: 87,
    matchScore: 0,
    matchReasons: [],
    sentiment: 'Bullish',
    activityLevel: 'Moderate',
    trendingScore: 79,
    riskLevel: 'Low',
    github: { stars: 8, commits30d: 38, contributors: 2, url: '' },
    social: { mentions: 67, sentiment: 0.82, growth7d: 12 },
    funding: { raised: 0, target: 400000, backers: 0 },
    tags: ['security', 'audit', 'ai-agents', 'smart-contracts', 'arc-network'],
    signals: { github: 82, social: 78, onchain: 68, market: 77, sentiment: 85 },
    highlights: ['Autonomous smart contract auditing', 'AI vulnerability detection', 'Circle bounty integration'],
    contact: {},
    addedAt: '2026-05-08',
    hotDeal: false,
  },
  {
    id: 'stream-fi',
    name: 'StreamFi',
    tagline: 'Real-time USDC streaming for creator economy',
    description: 'StreamFi enables real-time USDC micropayment streaming for creators, freelancers, and subscription services on Arc. Pay-per-second model with Circle Programmable Wallets.',
    category: 'DeFi',
    stage: 'Pre-TGE',
    trustScore: 84,
    matchScore: 0,
    matchReasons: [],
    sentiment: 'Bullish',
    activityLevel: 'High',
    trendingScore: 88,
    riskLevel: 'Medium',
    github: { stars: 15, commits30d: 72, contributors: 4, url: '' },
    social: { mentions: 112, sentiment: 0.88, growth7d: 32 },
    funding: { raised: 0, target: 500000, backers: 0 },
    tags: ['streaming', 'micropayments', 'creator-economy', 'circle', 'defi'],
    signals: { github: 90, social: 88, onchain: 70, market: 85, sentiment: 90 },
    highlights: ['Pay-per-second USDC streaming', '4 active contributors', 'Creator economy focus'],
    contact: {},
    addedAt: '2026-05-13',
    hotDeal: true,
  },
  {
    id: 'arc-lend',
    name: 'ArcLend',
    tagline: 'Decentralized lending protocol on Arc Network',
    description: 'ArcLend brings decentralized lending/borrowing to Arc Network with USDC as the primary collateral. AI-powered risk assessment for loan origination.',
    category: 'DeFi',
    stage: 'Pre-TGE',
    trustScore: 79,
    matchScore: 0,
    matchReasons: [],
    sentiment: 'Neutral',
    activityLevel: 'Moderate',
    trendingScore: 70,
    riskLevel: 'High',
    github: { stars: 3, commits30d: 22, contributors: 2, url: '' },
    social: { mentions: 28, sentiment: 0.65, growth7d: 5 },
    funding: { raised: 0, target: 600000, backers: 0 },
    tags: ['lending', 'defi', 'usdc', 'arc-network', 'collateral'],
    signals: { github: 68, social: 60, onchain: 55, market: 72, sentiment: 65 },
    highlights: ['USDC-first lending', 'AI risk assessment', 'Arc-native protocol'],
    contact: {},
    addedAt: '2026-05-07',
    hotDeal: false,
  },
  {
    id: 'nft-arc',
    name: 'ArcNFT Studio',
    tagline: 'AI-generated NFT marketplace on Arc',
    description: 'ArcNFT Studio is an AI-powered NFT creation and marketplace platform on Arc Network. Generate, mint, and trade NFTs with USDC. Features AI art generation and royalty streaming.',
    category: 'NFT',
    stage: 'Pre-TGE',
    trustScore: 76,
    matchScore: 0,
    matchReasons: [],
    sentiment: 'Neutral',
    activityLevel: 'Moderate',
    trendingScore: 73,
    riskLevel: 'Medium',
    github: { stars: 6, commits30d: 35, contributors: 3, url: '' },
    social: { mentions: 42, sentiment: 0.70, growth7d: 10 },
    funding: { raised: 0, target: 350000, backers: 0 },
    tags: ['nft', 'ai-art', 'marketplace', 'royalty-streaming', 'arc-network'],
    signals: { github: 75, social: 70, onchain: 62, market: 70, sentiment: 72 },
    highlights: ['AI-powered NFT generation', 'USDC royalty streaming', 'Arc-native marketplace'],
    contact: {},
    addedAt: '2026-05-06',
    hotDeal: false,
  },
];

// Default investor preferences
const DEFAULT_PREFERENCES: InvestorPreferences = {
  sectors: ['AI/ML', 'Infrastructure', 'DeFi', 'Payments'],
  stagePreference: ['Pre-TGE'],
  riskTolerance: 'moderate',
  minTrustScore: 70,
  prioritySignals: ['github', 'social', 'sentiment'],
};

// AI-powered matching algorithm
function computeMatchScore(deal: DealRecommendation, prefs: InvestorPreferences): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Category match (0-25 points)
  if (prefs.sectors.some(s => deal.category.toLowerCase().includes(s.toLowerCase()) || deal.tags.some(t => t.toLowerCase().includes(s.toLowerCase())))) {
    score += 25;
    reasons.push(`Matches your ${deal.category} sector interest`);
  }

  // Trust score bonus (0-20 points)
  if (deal.trustScore >= 85) {
    score += 20;
    reasons.push('High trust score (85+)');
  } else if (deal.trustScore >= 75) {
    score += 12;
    reasons.push('Good trust score (75+)');
  }

  // Activity level (0-15 points)
  if (deal.activityLevel === 'High') {
    score += 15;
    reasons.push('High development activity');
  } else if (deal.activityLevel === 'Moderate') {
    score += 8;
  }

  // Trending (0-15 points)
  if (deal.trendingScore >= 85) {
    score += 15;
    reasons.push('Trending in the ecosystem');
  } else if (deal.trendingScore >= 70) {
    score += 8;
  }

  // GitHub signal (0-10 points)
  if (prefs.prioritySignals.includes('github') && deal.signals.github >= 80) {
    score += 10;
    reasons.push('Strong GitHub signal');
  }

  // Social signal (0-10 points)
  if (prefs.prioritySignals.includes('social') && deal.signals.social >= 75) {
    score += 10;
    reasons.push('Growing social presence');
  }

  // Risk alignment (0-5 points)
  if (prefs.riskTolerance === 'conservative' && deal.riskLevel === 'Low') {
    score += 5;
    reasons.push('Matches your risk profile');
  } else if (prefs.riskTolerance === 'moderate' && deal.riskLevel !== 'High') {
    score += 5;
    reasons.push('Within your risk tolerance');
  } else if (prefs.riskTolerance === 'aggressive') {
    score += 5;
  }

  return { score: Math.min(score, 100), reasons };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectors = searchParams.get('sectors')?.split(',') || DEFAULT_PREFERENCES.sectors;
    const riskTolerance = (searchParams.get('risk') as InvestorPreferences['riskTolerance']) || DEFAULT_PREFERENCES.riskTolerance;
    const minScore = parseInt(searchParams.get('minScore') || '70');
    const sortBy = searchParams.get('sort') || 'match'; // match, trust, trending, newest

    const prefs: InvestorPreferences = {
      ...DEFAULT_PREFERENCES,
      sectors,
      riskTolerance,
      minTrustScore: minScore,
    };

    // Compute match scores
    const scoredDeals = DEAL_CATALOG
      .filter(d => d.trustScore >= prefs.minTrustScore)
      .map(deal => {
        const { score, reasons } = computeMatchScore(deal, prefs);
        return { ...deal, matchScore: score, matchReasons: reasons };
      });

    // Sort
    switch (sortBy) {
      case 'trust':
        scoredDeals.sort((a, b) => b.trustScore - a.trustScore);
        break;
      case 'trending':
        scoredDeals.sort((a, b) => b.trendingScore - a.trendingScore);
        break;
      case 'newest':
        scoredDeals.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      default: // match
        scoredDeals.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    // Summary stats
    const summary = {
      totalDeals: scoredDeals.length,
      hotDeals: scoredDeals.filter(d => d.hotDeal).length,
      avgTrustScore: Math.round(scoredDeals.reduce((sum, d) => sum + d.trustScore, 0) / scoredDeals.length),
      topCategory: getMostCommonCategory(scoredDeals),
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      deals: scoredDeals,
      preferences: prefs,
      summary,
    });
  } catch (error) {
    console.error('Deal Flow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getMostCommonCategory(deals: DealRecommendation[]): string {
  const counts: Record<string, number> = {};
  deals.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}
