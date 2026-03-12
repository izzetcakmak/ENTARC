// ENTARC MVP - Mock Data
// Comprehensive mock data for all features

import type {
  Project,
  PortfolioPosition,
  Milestone,
  AIAnalysis,
  StreamingDataPoint,
} from './types';

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateId = (): string => Math.random().toString(36).substring(2, 11);

const randomInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// ============================================
// MOCK MILESTONES
// ============================================

const createMilestones = (projectId: string): Milestone[] => [
  {
    id: `${projectId}-m1`,
    title: 'MVP Development',
    description: 'Complete core functionality and initial testing',
    amount: 25000,
    dueDate: randomDate(-30),
    successCriteria: [
      'Core smart contracts deployed',
      'Basic UI functional',
      'Integration tests passing',
    ],
    status: 'completed',
    completionPercent: 100,
    releasedAmount: 25000,
    lockedAmount: 0,
  },
  {
    id: `${projectId}-m2`,
    title: 'Security Audit',
    description: 'Third-party security audit and fixes',
    amount: 35000,
    dueDate: randomDate(15),
    successCriteria: [
      'Audit report received',
      'Critical issues resolved',
      'Re-audit passed',
    ],
    status: 'active',
    completionPercent: 65,
    releasedAmount: 22750,
    lockedAmount: 12250,
  },
  {
    id: `${projectId}-m3`,
    title: 'Mainnet Launch',
    description: 'Production deployment and liquidity setup',
    amount: 50000,
    dueDate: randomDate(45),
    successCriteria: [
      'Mainnet contracts verified',
      'Initial liquidity provided',
      'Launch marketing complete',
    ],
    status: 'pending',
    completionPercent: 0,
    releasedAmount: 0,
    lockedAmount: 50000,
  },
];

// ============================================
// MOCK PROJECTS
// ============================================

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'ArcSwap Protocol',
    tagline: 'Next-gen AMM with concentrated liquidity',
    category: 'DeFi',
    logoEmoji: '🔄',
    description: 'ArcSwap is a decentralized exchange protocol built on Arc Network, featuring concentrated liquidity positions, dynamic fees, and MEV protection. Our novel approach reduces slippage by 40% compared to traditional AMMs.',
    trustScore: 87,
    github: {
      commitsLast30Days: 156,
      weeklyCommitSeries: [32, 45, 28, 51],
      contributors: 12,
      stars: 847,
      forks: 234,
      openIssues: 23,
      issueVelocity: 8.5,
      testCoverage: 89,
      complexityScore: 7.2,
      lastCommitDate: randomDate(1),
    },
    social: {
      sentimentLabel: 'positive',
      sentimentScore: 72,
      mentionsLast7Days: 1240,
      topKeywords: ['DeFi', 'AMM', 'liquidity', 'Arc'],
    },
    funding: {
      valuation: 12000000,
      totalRaise: 2500000,
      streamingAPR: 8.5,
      escrowBalance: 175000,
    },
    milestones: createMilestones('proj-001'),
    performance: {
      roiPercent: 34.5,
      performanceMultiplier: 1.345,
      riskLevel: 'medium',
    },
    createdAt: randomDate(120),
  },
  {
    id: 'proj-002',
    name: 'NeuraBridge',
    tagline: 'AI-powered cross-chain bridge',
    category: 'Infrastructure',
    logoEmoji: '🧠',
    description: 'NeuraBridge uses machine learning to optimize cross-chain transfers, predicting optimal routes and gas costs. Supports 15+ chains with instant finality on Arc Network.',
    trustScore: 92,
    github: {
      commitsLast30Days: 234,
      weeklyCommitSeries: [55, 62, 48, 69],
      contributors: 18,
      stars: 1523,
      forks: 412,
      openIssues: 15,
      issueVelocity: 12.3,
      testCoverage: 94,
      complexityScore: 8.1,
      lastCommitDate: randomDate(0),
    },
    social: {
      sentimentLabel: 'positive',
      sentimentScore: 85,
      mentionsLast7Days: 2100,
      topKeywords: ['bridge', 'cross-chain', 'AI', 'infrastructure'],
    },
    funding: {
      valuation: 25000000,
      totalRaise: 5000000,
      streamingAPR: 12.0,
      escrowBalance: 320000,
    },
    milestones: createMilestones('proj-002'),
    performance: {
      roiPercent: 67.8,
      performanceMultiplier: 1.678,
      riskLevel: 'low',
    },
    createdAt: randomDate(90),
  },
  {
    id: 'proj-003',
    name: 'MetaRealm',
    tagline: 'Multiplayer gaming metaverse',
    category: 'Gaming',
    logoEmoji: '🎮',
    description: 'MetaRealm is a blockchain-based multiplayer gaming platform featuring play-to-earn mechanics, NFT characters, and decentralized game hosting on Arc Network.',
    trustScore: 71,
    github: {
      commitsLast30Days: 89,
      weeklyCommitSeries: [18, 24, 22, 25],
      contributors: 8,
      stars: 456,
      forks: 87,
      openIssues: 34,
      issueVelocity: 4.2,
      testCoverage: 72,
      complexityScore: 6.5,
      lastCommitDate: randomDate(3),
    },
    social: {
      sentimentLabel: 'neutral',
      sentimentScore: 45,
      mentionsLast7Days: 780,
      topKeywords: ['gaming', 'metaverse', 'NFT', 'P2E'],
    },
    funding: {
      valuation: 8000000,
      totalRaise: 1500000,
      streamingAPR: 6.5,
      escrowBalance: 95000,
    },
    milestones: createMilestones('proj-003'),
    performance: {
      roiPercent: 12.3,
      performanceMultiplier: 1.123,
      riskLevel: 'high',
    },
    createdAt: randomDate(150),
  },
  {
    id: 'proj-004',
    name: 'PrivacyShield',
    tagline: 'Zero-knowledge identity layer',
    category: 'Privacy',
    logoEmoji: '🛡️',
    description: 'PrivacyShield provides ZK-proof based identity verification without revealing personal data. Compliant, private, and decentralized identity for Web3.',
    trustScore: 84,
    github: {
      commitsLast30Days: 178,
      weeklyCommitSeries: [42, 38, 52, 46],
      contributors: 14,
      stars: 923,
      forks: 198,
      openIssues: 18,
      issueVelocity: 9.1,
      testCoverage: 91,
      complexityScore: 8.8,
      lastCommitDate: randomDate(1),
    },
    social: {
      sentimentLabel: 'positive',
      sentimentScore: 68,
      mentionsLast7Days: 950,
      topKeywords: ['privacy', 'ZK', 'identity', 'compliance'],
    },
    funding: {
      valuation: 15000000,
      totalRaise: 3200000,
      streamingAPR: 9.2,
      escrowBalance: 210000,
    },
    milestones: createMilestones('proj-004'),
    performance: {
      roiPercent: 45.2,
      performanceMultiplier: 1.452,
      riskLevel: 'medium',
    },
    createdAt: randomDate(100),
  },
  {
    id: 'proj-005',
    name: 'DAOforge',
    tagline: 'No-code DAO creation toolkit',
    category: 'DAO',
    logoEmoji: '⚒️',
    description: 'DAOforge enables anyone to create and manage DAOs without coding. Features include treasury management, proposal systems, and governance token creation.',
    trustScore: 78,
    github: {
      commitsLast30Days: 112,
      weeklyCommitSeries: [25, 32, 28, 27],
      contributors: 9,
      stars: 634,
      forks: 145,
      openIssues: 21,
      issueVelocity: 6.8,
      testCoverage: 85,
      complexityScore: 5.9,
      lastCommitDate: randomDate(2),
    },
    social: {
      sentimentLabel: 'positive',
      sentimentScore: 58,
      mentionsLast7Days: 620,
      topKeywords: ['DAO', 'governance', 'no-code', 'treasury'],
    },
    funding: {
      valuation: 6500000,
      totalRaise: 1200000,
      streamingAPR: 7.0,
      escrowBalance: 85000,
    },
    milestones: createMilestones('proj-005'),
    performance: {
      roiPercent: 23.7,
      performanceMultiplier: 1.237,
      riskLevel: 'medium',
    },
    createdAt: randomDate(80),
  },
  {
    id: 'proj-006',
    name: 'SocialGraph',
    tagline: 'Decentralized social identity protocol',
    category: 'Social',
    logoEmoji: '🌐',
    description: 'SocialGraph creates portable social graphs for Web3. Your followers, reputation, and content travel with you across any dApp in the ecosystem.',
    trustScore: 65,
    github: {
      commitsLast30Days: 67,
      weeklyCommitSeries: [15, 18, 16, 18],
      contributors: 6,
      stars: 312,
      forks: 67,
      openIssues: 28,
      issueVelocity: 3.5,
      testCoverage: 68,
      complexityScore: 5.2,
      lastCommitDate: randomDate(5),
    },
    social: {
      sentimentLabel: 'neutral',
      sentimentScore: 32,
      mentionsLast7Days: 340,
      topKeywords: ['social', 'identity', 'graph', 'reputation'],
    },
    funding: {
      valuation: 4000000,
      totalRaise: 800000,
      streamingAPR: 5.5,
      escrowBalance: 55000,
    },
    milestones: createMilestones('proj-006'),
    performance: {
      roiPercent: -8.5,
      performanceMultiplier: 0.915,
      riskLevel: 'high',
    },
    createdAt: randomDate(60),
  },
  {
    id: 'proj-007',
    name: 'OracleX',
    tagline: 'Decentralized AI oracle network',
    category: 'AI/ML',
    logoEmoji: '🔮',
    description: 'OracleX provides AI-verified data feeds for smart contracts. Machine learning models validate real-world data before on-chain submission.',
    trustScore: 89,
    github: {
      commitsLast30Days: 198,
      weeklyCommitSeries: [48, 52, 46, 52],
      contributors: 16,
      stars: 1102,
      forks: 287,
      openIssues: 12,
      issueVelocity: 10.5,
      testCoverage: 92,
      complexityScore: 8.5,
      lastCommitDate: randomDate(0),
    },
    social: {
      sentimentLabel: 'positive',
      sentimentScore: 78,
      mentionsLast7Days: 1580,
      topKeywords: ['oracle', 'AI', 'data', 'verification'],
    },
    funding: {
      valuation: 18000000,
      totalRaise: 4000000,
      streamingAPR: 10.5,
      escrowBalance: 280000,
    },
    milestones: createMilestones('proj-007'),
    performance: {
      roiPercent: 52.1,
      performanceMultiplier: 1.521,
      riskLevel: 'low',
    },
    createdAt: randomDate(110),
  },
  {
    id: 'proj-008',
    name: 'NFTVault',
    tagline: 'Fractional NFT ownership platform',
    category: 'NFT',
    logoEmoji: '🖼️',
    description: 'NFTVault enables fractional ownership of high-value NFTs. Pool funds with others to own pieces of blue-chip digital art and collectibles.',
    trustScore: 73,
    github: {
      commitsLast30Days: 95,
      weeklyCommitSeries: [22, 25, 24, 24],
      contributors: 7,
      stars: 478,
      forks: 112,
      openIssues: 19,
      issueVelocity: 5.2,
      testCoverage: 78,
      complexityScore: 6.1,
      lastCommitDate: randomDate(2),
    },
    social: {
      sentimentLabel: 'neutral',
      sentimentScore: 41,
      mentionsLast7Days: 520,
      topKeywords: ['NFT', 'fractional', 'art', 'collectibles'],
    },
    funding: {
      valuation: 7500000,
      totalRaise: 1400000,
      streamingAPR: 6.8,
      escrowBalance: 92000,
    },
    milestones: createMilestones('proj-008'),
    performance: {
      roiPercent: 18.9,
      performanceMultiplier: 1.189,
      riskLevel: 'medium',
    },
    createdAt: randomDate(75),
  },
];

// ============================================
// MOCK PORTFOLIO POSITIONS
// ============================================

export const mockPortfolioPositions: PortfolioPosition[] = [
  {
    id: 'pos-001',
    projectId: 'proj-001',
    investedAmount: 50000,
    currentValue: 67250,
    pnl: 17250,
    roi: 34.5,
    exitStrategy: 'hold',
    status: 'active',
    investedAt: randomDate(90),
  },
  {
    id: 'pos-002',
    projectId: 'proj-002',
    investedAmount: 75000,
    currentValue: 125850,
    pnl: 50850,
    roi: 67.8,
    exitStrategy: 'partial_exit',
    status: 'active',
    investedAt: randomDate(75),
  },
  {
    id: 'pos-003',
    projectId: 'proj-004',
    investedAmount: 40000,
    currentValue: 58080,
    pnl: 18080,
    roi: 45.2,
    exitStrategy: 'hold',
    status: 'active',
    investedAt: randomDate(85),
  },
  {
    id: 'pos-004',
    projectId: 'proj-007',
    investedAmount: 60000,
    currentValue: 91260,
    pnl: 31260,
    roi: 52.1,
    exitStrategy: 'hold',
    status: 'active',
    investedAt: randomDate(95),
  },
  {
    id: 'pos-005',
    projectId: 'proj-006',
    investedAmount: 25000,
    currentValue: 22875,
    pnl: -2125,
    roi: -8.5,
    exitStrategy: 'full_exit',
    status: 'active',
    investedAt: randomDate(50),
  },
];

// ============================================
// MOCK AI ANALYSIS
// ============================================

export const generateAIAnalysis = (project: Project): AIAnalysis => {
  const trustScore = project?.trustScore ?? 50;
  const testCoverage = project?.github?.testCoverage ?? 70;
  const sentimentScore = project?.social?.sentimentScore ?? 0;
  
  const codeQualityScore = Math.min(100, Math.round((testCoverage * 0.7) + (10 - (project?.github?.complexityScore ?? 5)) * 3));
  const securityScore = Math.min(100, Math.round(testCoverage * 0.8 + randomInRange(10, 20)));
  const teamScore = Math.min(100, Math.round((project?.github?.contributors ?? 5) * 5 + (project?.github?.issueVelocity ?? 5) * 3));
  const marketFitScore = Math.min(100, Math.round((sentimentScore + 100) / 2 * 0.6 + (project?.social?.mentionsLast7Days ?? 500) / 50));

  let recommendation: 'invest' | 'watch' | 'reject';
  if (trustScore >= 80) recommendation = 'invest';
  else if (trustScore >= 60) recommendation = 'watch';
  else recommendation = 'reject';

  const reasons: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];

  // Generate reasons based on metrics
  if (testCoverage > 85) reasons.push('Excellent test coverage indicates mature codebase');
  if ((project?.github?.contributors ?? 0) > 10) reasons.push('Strong development team with active contributors');
  if (sentimentScore > 60) reasons.push('Positive community sentiment and growing adoption');
  if ((project?.github?.stars ?? 0) > 500) reasons.push('High GitHub engagement shows developer interest');

  // Generate risks
  if ((project?.github?.openIssues ?? 0) > 25) risks.push('High number of open issues may indicate technical debt');
  if (testCoverage < 75) risks.push('Test coverage below industry standards');
  if ((project?.github?.complexityScore ?? 5) > 7) risks.push('High code complexity may slow development');
  if (sentimentScore < 30) risks.push('Mixed or negative community sentiment');

  // Generate opportunities
  opportunities.push(`Arc Network integration offers ${(project?.funding?.streamingAPR ?? 7).toFixed(1)}% streaming APR`);
  if ((project?.funding?.valuation ?? 0) < 10000000) opportunities.push('Early-stage valuation presents growth potential');
  if ((project?.social?.mentionsLast7Days ?? 0) > 1000) opportunities.push('High social activity indicates growing mindshare');

  return {
    codeQualityScore,
    securityScore,
    teamScore,
    marketFitScore,
    recommendation,
    reasons: reasons.length > 0 ? reasons : ['Project shows standard metrics'],
    risks: risks.length > 0 ? risks : ['Normal market and technical risks apply'],
    opportunities,
  };
};

// ============================================
// STREAMING DATA GENERATOR
// ============================================

export const generateStreamingHistory = (days: number = 30): StreamingDataPoint[] => {
  const data: StreamingDataPoint[] = [];
  let released = 0;
  const totalLocked = 500000;
  const dailyRelease = totalLocked / days * 0.7;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    released += dailyRelease + randomInRange(-500, 1000);
    released = Math.min(released, totalLocked * 0.8);
    
    data.push({
      timestamp: date.toISOString().split('T')[0] ?? '',
      released: Math.round(released),
      locked: Math.round(totalLocked - released),
      total: totalLocked,
    });
  }

  return data;
};
