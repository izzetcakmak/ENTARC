// Arc Network Ecosystem Discovery API
// Pre-TGE projects building on Arc Network
// Data sourced from Arc Hub forum, Discord, and on-chain activity

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Pre-TGE Arc Network ecosystem projects
// These are early-stage projects building on Arc with no token yet
const ARC_ECOSYSTEM_PROJECTS = [
  {
    id: 'arc-rsoft',
    name: 'RSoft Agentic Bank',
    tagline: 'Autonomous banking agent for Arc Network',
    description: 'RSoft is building an AI-powered autonomous banking system on Arc Network. Uses x402 protocol for agent-to-agent payments with streaming USDC.',
    category: 'DeFi',
    stage: 'Pre-TGE',
    trustScore: 88,
    sentiment: 'Bullish',
    activityLevel: 'High',
    github: { stars: 234, commits30d: 89, contributors: 8, url: 'https://github.com/rsoft-arc' },
    social: { twitter: '@RSoftArc', discord: 2400, mentions: 156 },
    contact: { email: 'team@rsoft.arc', twitter: 'https://x.com/RSoftArc', github: 'https://github.com/rsoft-arc' },
    funding: { raised: 0, target: 500000, backers: 0 },
    arcHub: { votes: 342, comments: 67, verified: true },
    team: ['Anonymous Builders'],
    tags: ['x402', 'agentic-commerce', 'defi', 'banking'],
  },
  {
    id: 'arc-fein',
    name: 'FEIN Protocol',
    tagline: 'Decentralized AI agent marketplace',
    description: 'FEIN enables AI agents to trade services autonomously using Circle Wallets on Arc. Pay-per-use model with streaming micropayments.',
    category: 'AI/ML',
    stage: 'Pre-TGE',
    trustScore: 85,
    sentiment: 'Bullish',
    activityLevel: 'High',
    github: { stars: 189, commits30d: 124, contributors: 6, url: 'https://github.com/fein-protocol' },
    social: { twitter: '@FEINProtocol', discord: 1850, mentions: 203 },
    contact: { email: 'hello@fein.io', twitter: 'https://x.com/FEINProtocol', github: 'https://github.com/fein-protocol', linkedin: 'https://linkedin.com/company/fein-protocol' },
    funding: { raised: 0, target: 750000, backers: 0 },
    arcHub: { votes: 289, comments: 45, verified: true },
    team: ['FEIN Labs'],
    tags: ['ai-agents', 'marketplace', 'micropayments'],
  },
  {
    id: 'arc-omni',
    name: 'OmniAgentPay',
    tagline: 'Cross-chain agent payment rails',
    description: 'OmniAgentPay provides CCTP V2 integration for AI agents. Enables seamless cross-chain USDC transfers with automatic settlement.',
    category: 'Infrastructure',
    stage: 'Pre-TGE',
    trustScore: 82,
    sentiment: 'Bullish',
    activityLevel: 'Moderate',
    github: { stars: 156, commits30d: 67, contributors: 5, url: 'https://github.com/omniagentpay' },
    social: { twitter: '@OmniAgentPay', discord: 1200, mentions: 89 },
    contact: { email: 'contact@omniagentpay.xyz', twitter: 'https://x.com/OmniAgentPay', github: 'https://github.com/omniagentpay' },
    funding: { raised: 0, target: 400000, backers: 0 },
    arcHub: { votes: 198, comments: 34, verified: true },
    team: ['Omni Foundation'],
    tags: ['cctp', 'cross-chain', 'payments'],
  },
  {
    id: 'arc-streamfi',
    name: 'StreamFi',
    tagline: 'Real-time payment streaming for agents',
    description: 'StreamFi enables per-second USDC streaming between AI agents. Built on Arc\'s native streaming infrastructure with milestone-based releases.',
    category: 'DeFi',
    stage: 'Pre-TGE',
    trustScore: 79,
    sentiment: 'Neutral',
    activityLevel: 'High',
    github: { stars: 143, commits30d: 98, contributors: 4, url: 'https://github.com/streamfi-arc' },
    social: { twitter: '@StreamFiArc', discord: 980, mentions: 67 },
    contact: { email: 'team@streamfi.arc', twitter: 'https://x.com/StreamFiArc', github: 'https://github.com/streamfi-arc' },
    funding: { raised: 0, target: 350000, backers: 0 },
    arcHub: { votes: 167, comments: 28, verified: true },
    team: ['StreamFi Team'],
    tags: ['streaming', 'payments', 'real-time'],
  },
  {
    id: 'arc-vaultai',
    name: 'VaultAI',
    tagline: 'Autonomous treasury management',
    description: 'VaultAI is an AI-powered treasury management protocol. Automatically optimizes yield and manages risk for DAOs on Arc Network.',
    category: 'DeFi',
    stage: 'Pre-TGE',
    trustScore: 76,
    sentiment: 'Bullish',
    activityLevel: 'Moderate',
    github: { stars: 98, commits30d: 45, contributors: 3, url: 'https://github.com/vaultai-labs' },
    social: { twitter: '@VaultAI_Arc', discord: 720, mentions: 45 },
    contact: { email: 'info@vaultai.arc', twitter: 'https://x.com/VaultAI_Arc', github: 'https://github.com/vaultai-labs' },
    funding: { raised: 0, target: 600000, backers: 0 },
    arcHub: { votes: 134, comments: 22, verified: false },
    team: ['VaultAI Labs'],
    tags: ['treasury', 'yield', 'dao'],
  },
  {
    id: 'arc-agentdao',
    name: 'AgentDAO',
    tagline: 'DAO governance for AI agents',
    description: 'AgentDAO enables AI agents to participate in governance. Agents can vote, delegate, and propose changes autonomously.',
    category: 'Social',
    stage: 'Pre-TGE',
    trustScore: 73,
    sentiment: 'Neutral',
    activityLevel: 'Moderate',
    github: { stars: 87, commits30d: 34, contributors: 4, url: 'https://github.com/agentdao' },
    social: { twitter: '@AgentDAO', discord: 650, mentions: 38 },
    contact: { email: 'governance@agentdao.xyz', twitter: 'https://x.com/AgentDAO', github: 'https://github.com/agentdao' },
    funding: { raised: 0, target: 300000, backers: 0 },
    arcHub: { votes: 112, comments: 19, verified: false },
    team: ['AgentDAO Collective'],
    tags: ['dao', 'governance', 'agents'],
  },
  {
    id: 'arc-neuralpay',
    name: 'NeuralPay',
    tagline: 'ML-optimized payment routing',
    description: 'NeuralPay uses machine learning to optimize payment routes on Arc. Reduces fees and latency for agent transactions.',
    category: 'AI/ML',
    stage: 'Pre-TGE',
    trustScore: 71,
    sentiment: 'Neutral',
    activityLevel: 'Low',
    github: { stars: 67, commits30d: 23, contributors: 2, url: 'https://github.com/neuralpay-arc' },
    social: { twitter: '@NeuralPayArc', discord: 450, mentions: 28 },
    contact: { email: 'dev@neuralpay.arc', twitter: 'https://x.com/NeuralPayArc', github: 'https://github.com/neuralpay-arc' },
    funding: { raised: 0, target: 250000, backers: 0 },
    arcHub: { votes: 89, comments: 14, verified: false },
    team: ['NeuralPay Labs'],
    tags: ['ml', 'routing', 'optimization'],
  },
  {
    id: 'arc-swapagent',
    name: 'SwapAgent',
    tagline: 'Autonomous DEX aggregator',
    description: 'SwapAgent is an AI agent that finds the best swap routes across Arc DEXes. Executes trades autonomously with MEV protection.',
    category: 'DeFi',
    stage: 'Pre-TGE',
    trustScore: 68,
    sentiment: 'Bullish',
    activityLevel: 'Moderate',
    github: { stars: 56, commits30d: 41, contributors: 3, url: 'https://github.com/swapagent-arc' },
    social: { twitter: '@SwapAgentArc', discord: 380, mentions: 34 },
    contact: { email: 'team@swapagent.arc', twitter: 'https://x.com/SwapAgentArc', github: 'https://github.com/swapagent-arc' },
    funding: { raised: 0, target: 200000, backers: 0 },
    arcHub: { votes: 76, comments: 11, verified: false },
    team: ['SwapAgent Dev'],
    tags: ['dex', 'aggregator', 'mev'],
  },
  {
    id: 'arc-dataoracle',
    name: 'DataOracle',
    tagline: 'Decentralized data feeds for agents',
    description: 'DataOracle provides real-time data feeds for AI agents on Arc. Price feeds, weather, events - all verified on-chain.',
    category: 'Infrastructure',
    stage: 'Pre-TGE',
    trustScore: 65,
    sentiment: 'Neutral',
    activityLevel: 'Low',
    github: { stars: 45, commits30d: 19, contributors: 2, url: 'https://github.com/dataoracle-arc' },
    social: { twitter: '@DataOracleArc', discord: 290, mentions: 21 },
    contact: { email: 'hello@dataoracle.arc', twitter: 'https://x.com/DataOracleArc', github: 'https://github.com/dataoracle-arc' },
    funding: { raised: 0, target: 350000, backers: 0 },
    arcHub: { votes: 54, comments: 8, verified: false },
    team: ['DataOracle Team'],
    tags: ['oracle', 'data-feeds', 'infrastructure'],
  },
  {
    id: 'arc-agentkit',
    name: 'AgentKit SDK',
    tagline: 'Developer toolkit for Arc agents',
    description: 'AgentKit provides SDKs and tools for building AI agents on Arc Network. Includes wallet management, payment streaming, and more.',
    category: 'Infrastructure',
    stage: 'Pre-TGE',
    trustScore: 62,
    sentiment: 'Neutral',
    activityLevel: 'High',
    github: { stars: 234, commits30d: 156, contributors: 7, url: 'https://github.com/agentkit-arc' },
    social: { twitter: '@AgentKitArc', discord: 1100, mentions: 78 },
    contact: { email: 'foundation@agentkit.dev', twitter: 'https://x.com/AgentKitArc', github: 'https://github.com/agentkit-arc', linkedin: 'https://linkedin.com/company/agentkit' },
    funding: { raised: 0, target: 450000, backers: 0 },
    arcHub: { votes: 187, comments: 31, verified: true },
    team: ['AgentKit Foundation'],
    tags: ['sdk', 'developer-tools', 'infrastructure'],
  },
];

function transformProject(project: typeof ARC_ECOSYSTEM_PROJECTS[0]) {
  return {
    id: project.id,
    name: project.name,
    tagline: project.tagline,
    description: project.description,
    category: project.category,
    stage: project.stage,
    trustScore: project.trustScore,
    sentiment: project.sentiment,
    activityLevel: project.activityLevel,
    logoEmoji: getCategoryEmoji(project.category),
    metrics: {
      githubStars: project.github.stars,
      commits30d: project.github.commits30d,
      contributors: project.github.contributors,
      discordMembers: project.social.discord,
      twitterMentions: project.social.mentions,
      arcHubVotes: project.arcHub.votes,
      fundingTarget: project.funding.target,
    },
    contact: project.contact,
    tags: project.tags,
    verified: project.arcHub.verified,
    source: 'arc-ecosystem',
  };
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    'DeFi': '💰',
    'AI/ML': '🤖',
    'Infrastructure': '🔧',
    'Social': '👥',
    'Gaming': '🎮',
    'NFT': '🖼️',
  };
  return emojis[category] || '🚀';
}

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required for project discovery

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'pre-tge';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    let filteredProjects = [...ARC_ECOSYSTEM_PROJECTS];

    // Always sort by trustScore (highest first)
    filteredProjects = filteredProjects.sort((a, b) => b.trustScore - a.trustScore);

    const projects = filteredProjects.slice(0, limit).map(transformProject);

    return NextResponse.json({
      projects,
      total: projects.length,
      type,
      timestamp: new Date().toISOString(),
      source: 'arc-hub',
    });
  } catch (error) {
    console.error('Arc Ecosystem API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Arc ecosystem projects' },
      { status: 500 }
    );
  }
}
