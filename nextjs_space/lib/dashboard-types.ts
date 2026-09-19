// Shape of GET /api/dashboard — real, database-backed dashboard figures.

export interface DashboardMetricsData {
  committed: number;
  fundedProjects: number;
  averageTrustScore: number | null;
  released: number;
  locked: number;
}

export interface DashboardActivityItem {
  id: string;
  type: 'investment' | 'release';
  projectId: string;
  projectName: string;
  description: string;
  amount: number;
  timestamp: string;
  explorerUrl: string | null;
}

export interface DashboardHistoryPoint {
  timestamp: string;
  released: number;
  locked: number;
}

export interface DashboardTopProject {
  id: string;
  name: string;
  category: string;
  logoEmoji: string;
  aiTrustScore: number | null;
  currentFunding: number;
}

export interface DashboardData {
  network: string;
  since: string | null;
  metrics: DashboardMetricsData;
  activity: DashboardActivityItem[];
  history: DashboardHistoryPoint[];
  topProjects: DashboardTopProject[];
}

/** USDC amounts on the dashboard are small and real — never abbreviate cents away. */
export function formatUsdc(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
