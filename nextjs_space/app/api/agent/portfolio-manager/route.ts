export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Adaptive Portfolio Manager
 * AI-driven risk regime detection, rebalancing, and risk management
 * for Pre-TGE venture investments on Arc Network
 */

interface PortfolioProject {
  id: string;
  name: string;
  allocation: number;
  trustScore: number;
  riskLevel: string;
  signals: {
    githubActivity: number;
    socialMomentum: number;
    milestoneProgress: number;
    communityGrowth: number;
  };
}

function detectRiskRegime(projects: PortfolioProject[]): {
  regime: 'risk-on' | 'risk-off' | 'neutral';
  confidence: number;
  reasoning: string;
} {
  const avgTrustScore = projects.reduce((sum, p) => sum + p.trustScore, 0) / (projects.length || 1);
  const highRiskCount = projects.filter(p => p.riskLevel === 'HIGH').length;
  const lowActivityCount = projects.filter(p => p.signals.githubActivity < 30).length;

  if (avgTrustScore >= 70 && highRiskCount === 0) {
    return {
      regime: 'risk-on',
      confidence: Math.min(95, avgTrustScore),
      reasoning: `Strong portfolio health: avg trust score ${avgTrustScore.toFixed(0)}, no high-risk positions. Safe to increase allocation to promising Pre-TGE projects.`,
    };
  } else if (avgTrustScore < 50 || highRiskCount > projects.length / 2) {
    return {
      regime: 'risk-off',
      confidence: Math.min(90, 100 - avgTrustScore),
      reasoning: `Portfolio stress detected: avg trust score ${avgTrustScore.toFixed(0)}, ${highRiskCount} high-risk positions. Recommend pausing new investments and reviewing milestone deliveries.`,
    };
  }

  return {
    regime: 'neutral',
    confidence: 65,
    reasoning: `Mixed signals: avg trust score ${avgTrustScore.toFixed(0)}, ${lowActivityCount} projects with declining activity. Selective investment recommended.`,
  };
}

function generateRebalancingPlan(projects: PortfolioProject[]): {
  actions: Array<{
    projectId: string;
    projectName: string;
    action: 'increase' | 'decrease' | 'hold' | 'exit' | 'pause_funding';
    currentAllocation: number;
    suggestedAllocation: number;
    reason: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
  totalReallocation: number;
} {
  const actions = projects.map(p => {
    const compositeScore = (
      p.trustScore * 0.3 +
      p.signals.githubActivity * 0.25 +
      p.signals.milestoneProgress * 0.25 +
      p.signals.socialMomentum * 0.1 +
      p.signals.communityGrowth * 0.1
    );

    if (compositeScore >= 75) {
      return {
        projectId: p.id,
        projectName: p.name,
        action: 'increase' as const,
        currentAllocation: p.allocation,
        suggestedAllocation: Math.min(p.allocation * 1.2, 30),
        reason: `Strong composite score (${compositeScore.toFixed(0)}). Active development and growing community justify increased allocation.`,
        urgency: 'medium' as const,
      };
    } else if (compositeScore >= 50) {
      return {
        projectId: p.id,
        projectName: p.name,
        action: 'hold' as const,
        currentAllocation: p.allocation,
        suggestedAllocation: p.allocation,
        reason: `Moderate composite score (${compositeScore.toFixed(0)}). Maintain current position, monitor milestone delivery.`,
        urgency: 'low' as const,
      };
    } else if (compositeScore >= 30) {
      return {
        projectId: p.id,
        projectName: p.name,
        action: 'pause_funding' as const,
        currentAllocation: p.allocation,
        suggestedAllocation: p.allocation * 0.5,
        reason: `Declining composite score (${compositeScore.toFixed(0)}). Pause milestone funding until activity resumes.`,
        urgency: 'high' as const,
      };
    } else {
      return {
        projectId: p.id,
        projectName: p.name,
        action: 'exit' as const,
        currentAllocation: p.allocation,
        suggestedAllocation: 0,
        reason: `Critical composite score (${compositeScore.toFixed(0)}). Development stalled, community declining. Recommend full exit.`,
        urgency: 'high' as const,
      };
    }
  });

  const totalReallocation = actions.reduce(
    (sum, a) => sum + Math.abs(a.suggestedAllocation - a.currentAllocation),
    0
  );

  return { actions, totalReallocation };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projects } = await req.json();

    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json({ error: 'Projects array required' }, { status: 400 });
    }

    const riskRegime = detectRiskRegime(projects);
    const rebalancingPlan = generateRebalancingPlan(projects);

    // Risk metrics
    const diversificationScore = Math.min(100, projects.length * 15);
    const concentrationRisk = projects.length > 0
      ? Math.max(...projects.map(p => p.allocation)) / projects.reduce((s, p) => s + p.allocation, 0) * 100
      : 0;

    return NextResponse.json({
      success: true,
      analysis: {
        riskRegime,
        rebalancingPlan,
        riskMetrics: {
          diversificationScore,
          concentrationRisk: concentrationRisk.toFixed(1),
          portfolioHealthScore: Math.round(
            (riskRegime.confidence + diversificationScore) / 2
          ),
          activeMilestones: projects.filter(p => p.signals.milestoneProgress > 0 && p.signals.milestoneProgress < 100).length,
          totalProjects: projects.length,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Portfolio manager error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
