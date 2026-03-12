// ENTARC MVP - Type Definitions
// All TypeScript interfaces and types for the application

// ============================================
// PROJECT TYPES
// ============================================

export interface GitHubMetrics {
  commitsLast30Days: number;
  weeklyCommitSeries: number[];
  contributors: number;
  stars: number;
  forks: number;
  openIssues: number;
  issueVelocity: number; // issues resolved per week
  testCoverage: number; // percentage 0-100
  complexityScore: number; // 1-10 scale
  lastCommitDate: string;
}

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface SocialMetrics {
  sentimentLabel: SentimentLabel;
  sentimentScore: number; // -100 to 100
  mentionsLast7Days: number;
  topKeywords: string[];
}

export interface FundingInfo {
  valuation: number;
  totalRaise: number;
  streamingAPR: number; // mock APR for streaming rewards
  escrowBalance: number;
}

export type MilestoneStatus = 'pending' | 'active' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  successCriteria: string[];
  status: MilestoneStatus;
  completionPercent: number;
  releasedAmount: number;
  lockedAmount: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface PerformanceMetrics {
  roiPercent: number;
  performanceMultiplier: number;
  riskLevel: RiskLevel;
}

export type ProjectCategory = 
  | 'DeFi' 
  | 'Infrastructure' 
  | 'Gaming' 
  | 'NFT' 
  | 'DAO' 
  | 'AI/ML' 
  | 'Privacy' 
  | 'Social';

export interface Project {
  id: string;
  name: string;
  tagline: string;
  category: ProjectCategory;
  logoEmoji: string;
  description: string;
  trustScore: number; // 0-100 AI-generated trust score
  github: GitHubMetrics;
  social: SocialMetrics;
  funding: FundingInfo;
  milestones: Milestone[];
  performance: PerformanceMetrics;
  createdAt: string;
}

// ============================================
// PORTFOLIO TYPES
// ============================================

export type ExitStrategy = 'hold' | 'partial_exit' | 'full_exit';
export type PositionStatus = 'active' | 'exited' | 'pending';

export interface PortfolioPosition {
  id: string;
  projectId: string;
  investedAmount: number;
  currentValue: number;
  pnl: number; // profit/loss
  roi: number; // percentage
  exitStrategy: ExitStrategy;
  status: PositionStatus;
  investedAt: string;
}

// ============================================
// STREAMING / CHART TYPES
// ============================================

export interface StreamingDataPoint {
  timestamp: string;
  released: number;
  locked: number;
  total: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  label?: string;
}

// ============================================
// AI ANALYSIS TYPES
// ============================================

export type VCRecommendation = 'invest' | 'watch' | 'reject';

export interface AIAnalysis {
  codeQualityScore: number;
  securityScore: number;
  teamScore: number;
  marketFitScore: number;
  recommendation: VCRecommendation;
  reasons: string[];
  risks: string[];
  opportunities: string[];
}

// ============================================
// FILTER / SORT TYPES
// ============================================

export type ActivityLevel = 'low' | 'medium' | 'high' | 'all';
export type SortOption = 'trustScore' | 'activity' | 'valuation' | 'roi';

export interface ProjectFilters {
  minTrustScore: number;
  sentimentType: SentimentLabel | 'all';
  activityLevel: ActivityLevel;
  category: ProjectCategory | 'all';
}

// ============================================
// UI STATE TYPES
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UIState {
  loadingState: LoadingState;
  errorMessage: string | null;
}

// ============================================
// DASHBOARD METRICS
// ============================================

export interface DashboardMetrics {
  tvl: number;
  activeProjects: number;
  averageROI: number;
  totalReleased: number;
  totalLocked: number;
}
