export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Signal Aggregator - Social Trading Intelligence
 * Multi-source signal analysis for Pre-TGE project evaluation
 * Aggregates GitHub, social, community, and on-chain signals
 */

interface SignalSource {
  source: string;
  type: 'github' | 'social' | 'community' | 'onchain' | 'milestone';
  weight: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
  dataPoints: Array<{ label: string; value: number | string }>;
}

function analyzeGitHubSignals(github: any): SignalSource {
  const commits = github?.commits30d || 0;
  const contributors = github?.contributors || 0;
  const stars = github?.stars || 0;

  const score = Math.min(100, (commits * 1.5) + (contributors * 10) + (stars * 0.5));
  const trend = commits > 20 ? 'up' : commits > 5 ? 'stable' : 'down';

  return {
    source: 'GitHub',
    type: 'github',
    weight: 0.30,
    score,
    trend,
    dataPoints: [
      { label: 'Commits (30d)', value: commits },
      { label: 'Contributors', value: contributors },
      { label: 'Stars', value: stars },
      { label: 'Activity Trend', value: trend },
    ],
  };
}

function analyzeSocialSignals(social: any): SignalSource {
  const mentions = social?.mentions || 0;
  const followers = social?.followers || 0;
  const engagement = social?.engagement || 0;

  const score = Math.min(100, (mentions * 2) + (followers * 0.01) + (engagement * 5));
  const trend = mentions > 50 ? 'up' : mentions > 10 ? 'stable' : 'down';

  return {
    source: 'Social Media',
    type: 'social',
    weight: 0.15,
    score,
    trend,
    dataPoints: [
      { label: 'Mentions', value: mentions },
      { label: 'Followers', value: followers },
      { label: 'Engagement Rate', value: `${engagement}%` },
      { label: 'Sentiment', value: trend === 'up' ? 'Positive' : trend === 'stable' ? 'Neutral' : 'Negative' },
    ],
  };
}

function analyzeCommunitySignals(community: any): SignalSource {
  const discord = community?.discord || 0;
  const votes = community?.votes || 0;
  const comments = community?.comments || 0;

  const score = Math.min(100, (discord * 0.01) + (votes * 0.3) + (comments * 1.5));
  const trend = votes > 100 ? 'up' : votes > 30 ? 'stable' : 'down';

  return {
    source: 'Community',
    type: 'community',
    weight: 0.15,
    score,
    trend,
    dataPoints: [
      { label: 'Discord Members', value: discord },
      { label: 'Arc Hub Votes', value: votes },
      { label: 'Comments', value: comments },
      { label: 'Growth', value: trend },
    ],
  };
}

function analyzeMilestoneSignals(milestones: any): SignalSource {
  const total = milestones?.total || 0;
  const completed = milestones?.completed || 0;
  const onTime = milestones?.onTime || 0;

  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  const onTimeRate = completed > 0 ? (onTime / completed) * 100 : 0;
  const score = Math.min(100, completionRate * 0.6 + onTimeRate * 0.4);
  const trend = completionRate > 60 ? 'up' : completionRate > 30 ? 'stable' : 'down';

  return {
    source: 'Milestone Delivery',
    type: 'milestone',
    weight: 0.25,
    score,
    trend,
    dataPoints: [
      { label: 'Total Milestones', value: total },
      { label: 'Completed', value: completed },
      { label: 'Completion Rate', value: `${completionRate.toFixed(0)}%` },
      { label: 'On-Time Rate', value: `${onTimeRate.toFixed(0)}%` },
    ],
  };
}

function analyzeOnChainSignals(onchain: any): SignalSource {
  const transactions = onchain?.transactions || 0;
  const uniqueUsers = onchain?.uniqueUsers || 0;
  const tvl = onchain?.tvl || 0;

  const score = Math.min(100, (transactions * 0.5) + (uniqueUsers * 2) + (tvl * 0.001));
  const trend = transactions > 100 ? 'up' : transactions > 20 ? 'stable' : 'down';

  return {
    source: 'On-Chain',
    type: 'onchain',
    weight: 0.15,
    score,
    trend,
    dataPoints: [
      { label: 'Transactions', value: transactions },
      { label: 'Unique Users', value: uniqueUsers },
      { label: 'TVL (USDC)', value: `$${tvl.toLocaleString()}` },
      { label: 'Activity', value: trend },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project } = await req.json();

    if (!project) {
      return NextResponse.json({ error: 'Project data required' }, { status: 400 });
    }

    // Aggregate all signals
    const signals: SignalSource[] = [
      analyzeGitHubSignals(project.github),
      analyzeSocialSignals(project.social),
      analyzeCommunitySignals(project.community),
      analyzeMilestoneSignals(project.milestones),
      analyzeOnChainSignals(project.onchain),
    ];

    // Calculate weighted composite score
    const compositeScore = signals.reduce(
      (sum, s) => sum + s.score * s.weight,
      0
    );

    // Determine overall signal strength
    const upTrends = signals.filter(s => s.trend === 'up').length;
    const downTrends = signals.filter(s => s.trend === 'down').length;
    const overallTrend = upTrends > downTrends ? 'bullish' : upTrends < downTrends ? 'bearish' : 'neutral';

    // Generate AI recommendation
    let recommendation: string;
    let action: 'invest' | 'hold' | 'monitor' | 'exit';

    if (compositeScore >= 75) {
      recommendation = 'Strong buy signal. Multiple sources confirm positive momentum. Recommend initiating or increasing position via Circle Agent Wallet.';
      action = 'invest';
    } else if (compositeScore >= 55) {
      recommendation = 'Moderate signal strength. Core metrics healthy but some signals mixed. Hold current position and monitor milestone delivery.';
      action = 'hold';
    } else if (compositeScore >= 35) {
      recommendation = 'Weakening signals detected. GitHub activity declining or milestones delayed. Pause new funding and closely monitor.';
      action = 'monitor';
    } else {
      recommendation = 'Critical signal degradation. Multiple sources show negative trends. Recommend pausing milestone payments and reviewing investment thesis.';
      action = 'exit';
    }

    return NextResponse.json({
      success: true,
      analysis: {
        projectName: project.name,
        compositeScore: Math.round(compositeScore),
        overallTrend,
        recommendation,
        action,
        signals,
        signalStrength: {
          strong: signals.filter(s => s.score >= 70).length,
          moderate: signals.filter(s => s.score >= 40 && s.score < 70).length,
          weak: signals.filter(s => s.score < 40).length,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Signal aggregator error:', error);
    return NextResponse.json(
      { error: error.message || 'Signal analysis failed' },
      { status: 500 }
    );
  }
}
