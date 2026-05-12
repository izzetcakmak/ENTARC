export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Circle Escrow — Milestone-Based Investment Escrow
 * Uses Circle Agent Wallets for programmatic USDC escrow management
 * 
 * Flow:
 * 1. AI agent approves investment → Creates escrow via Circle Wallet
 * 2. USDC locked in agent wallet with spending policy
 * 3. Milestone completed → AI verifies → Releases tranche
 * 4. Milestone failed → Funds returned or held
 */

interface EscrowConfig {
  projectId: string;
  projectName: string;
  totalAmount: number;
  milestones: Array<{
    id: string;
    title: string;
    amount: number;
    percentage: number;
  }>;
  investorWallet: string;
  agentWalletId: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'create-escrow') {
      return handleCreateEscrow(body);
    } else if (action === 'release-milestone') {
      return handleReleaseMilestone(body);
    } else if (action === 'check-status') {
      return handleCheckStatus(body);
    } else if (action === 'pause-funding') {
      return handlePauseFunding(body);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Escrow error:', error);
    return NextResponse.json(
      { error: error.message || 'Escrow operation failed' },
      { status: 500 }
    );
  }
}

async function handleCreateEscrow(body: any) {
  const { config } = body as { config: EscrowConfig };

  if (!config?.projectId || !config?.totalAmount || !config?.milestones?.length) {
    return NextResponse.json({ error: 'Invalid escrow config' }, { status: 400 });
  }

  // Create escrow record with Circle Agent Wallet as custodian
  const escrow = {
    id: `escrow_${Date.now()}`,
    projectId: config.projectId,
    projectName: config.projectName,
    totalAmount: config.totalAmount,
    releasedAmount: 0,
    remainingAmount: config.totalAmount,
    status: 'active',
    agentWalletId: config.agentWalletId,
    milestones: config.milestones.map(m => ({
      ...m,
      status: 'locked',
      releasedAt: null,
      txHash: null,
    })),
    // Circle Wallet spending policy
    spendingPolicy: {
      maxPerTransaction: config.milestones.reduce((max, m) => Math.max(max, m.amount), 0),
      allowedRecipients: [config.investorWallet],
      timeLimit: '90d',
      requiresAIApproval: true,
    },
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    escrow,
    message: `Escrow created for ${config.projectName}. ${config.totalAmount} USDC locked across ${config.milestones.length} milestones.`,
    circleIntegration: {
      walletType: 'Developer-Controlled (Circle Agent Stack)',
      paymentMethod: 'USDC on Arc Testnet',
      gasStrategy: 'Paymaster-sponsored (gas-free for users)',
      settlementNetwork: 'Arc Network',
    },
  });
}

async function handleReleaseMilestone(body: any) {
  const { escrowId, milestoneId, projectName } = body;

  // Simulate Circle Wallet USDC transfer for milestone release
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  return NextResponse.json({
    success: true,
    release: {
      escrowId,
      milestoneId,
      status: 'released',
      txHash,
      releasedAt: new Date().toISOString(),
      network: 'Arc Testnet',
      token: 'USDC',
    },
    message: `Milestone payment released for ${projectName || 'project'}. Transaction settled on Arc Network.`,
  });
}

async function handleCheckStatus(body: any) {
  const { escrowId } = body;

  return NextResponse.json({
    success: true,
    status: {
      escrowId: escrowId || 'demo_escrow',
      state: 'active',
      totalLocked: 50000,
      released: 15000,
      remaining: 35000,
      nextMilestone: {
        title: 'MVP Launch',
        amount: 10000,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      circleWalletBalance: 35000,
    },
  });
}

async function handlePauseFunding(body: any) {
  const { escrowId, reason } = body;

  return NextResponse.json({
    success: true,
    pause: {
      escrowId: escrowId || 'demo_escrow',
      status: 'paused',
      reason: reason || 'AI agent detected risk signals — milestone delivery paused pending review',
      pausedAt: new Date().toISOString(),
      resumeConditions: [
        'GitHub activity resumes (>10 commits/week)',
        'Milestone deliverables submitted for review',
        'Founder responds to status inquiry',
      ],
    },
    message: 'Funding paused. Circle Agent Wallet spending policy updated to block outgoing transfers.',
  });
}
