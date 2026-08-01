export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createHash } from 'crypto';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import {
  getOrCreateAgentWallet,
  getUsdcBalance,
  transferUsdc,
  AGENT_BLOCKCHAIN,
} from '@/lib/circle-client';
import { checkAgentPolicy, getAgentPolicy } from '@/lib/agent-policy';

/**
 * Circle Escrow — Milestone-Based Investment Escrow (REAL transfers)
 *
 * The agent wallet (Circle developer-controlled, Arc Testnet) is the escrow:
 * USDC sits in it until the agent releases a tranche. Every release is a real
 * on-chain USDC transfer with a block-explorer-verifiable hash. There is no
 * human approval step — the spending policy in lib/agent-policy.ts is the
 * only gate, which is exactly the point.
 *
 * Flow:
 * 1. AI analysis approves a project; a proposal reaches ACCEPTED
 * 2. create-escrow → policy check → real USDC transfer of the first tranche
 *    → proposal FUNDED, tx hash persisted
 * 3. release-milestone → policy check → real transfer of the next tranche
 * 4. pause-funding → risk monitor flips a flag the policy gate enforces
 */

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

/**
 * Deterministic idempotency key per (proposal, milestone, proposal-version):
 * a retry of the same release can never double-send, because Circle dedupes on
 * this key. The version component is the proposal's updatedAt — stable across
 * retries of one release, but rotated whenever the proposal itself changes
 * (e.g. a reset), so a genuinely new funding round gets a new key.
 */
function idempotencyKeyFor(proposalId: string, milestoneKey: string, version: string): string {
  const h = createHash('sha256').update(`entarc:${proposalId}:${milestoneKey}:${version}`).digest();
  const b = Buffer.from(h.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = b.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
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
      return handleFundProposal(body, 'initial');
    } else if (action === 'release-milestone') {
      return handleFundProposal(body, 'milestone');
    } else if (action === 'check-status') {
      return handleCheckStatus();
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

/**
 * Fund a proposal tranche with a real USDC transfer from the agent wallet.
 *
 * Two entry modes:
 * - { proposalId, milestoneId? } — full flow: DB-backed, persists tx hash,
 *   flips proposal/project/milestone states.
 * - { recipient, amountUsdc, projectName?, trustScore? } — direct mode for
 *   dashboard demos: same policy gate, same real transfer, no DB rows.
 */
async function handleFundProposal(body: any, phase: 'initial' | 'milestone') {
  const { proposalId, milestoneId, recipient, amountUsdc, projectName, trustScore } = body;

  // ---------- resolve what to pay, to whom, under which trust score ----------
  let payTo: string;
  let payAmount: number;
  let payTrustScore: number | null = null;
  let fundingPaused = false;
  let proposal: any = null;
  let milestoneRow: any = null;
  let label: string;

  if (proposalId) {
    proposal = await prisma.investmentProposal.findUnique({
      where: { id: proposalId },
      include: {
        project: { include: { milestones: { orderBy: { orderIndex: 'asc' } } } },
        founder: { select: { walletAddress: true, name: true } },
      },
    });
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    const okStates = phase === 'initial' ? ['ACCEPTED'] : ['FUNDED'];
    if (!okStates.includes(proposal.status)) {
      return NextResponse.json(
        { error: `Proposal is ${proposal.status}; expected ${okStates.join('/')}` },
        { status: 409 }
      );
    }
    payTo = proposal.founder?.walletAddress || '';
    if (!EVM_ADDRESS.test(payTo)) {
      return NextResponse.json(
        { error: 'Founder has no valid wallet address on file' },
        { status: 422 }
      );
    }

    const total = proposal.agreedAmount ?? proposal.proposedAmount;
    const milestones = proposal.project?.milestones ?? [];
    if (phase === 'initial') {
      milestoneRow = milestones[0] ?? null;
    } else {
      milestoneRow = milestoneId
        ? milestones.find((m: any) => m.id === milestoneId)
        : milestones.find((m: any) => m.status !== 'RELEASED');
      if (!milestoneRow) {
        return NextResponse.json({ error: 'No releasable milestone found' }, { status: 404 });
      }
      if (milestoneRow.status === 'RELEASED') {
        return NextResponse.json({ error: 'Milestone already released' }, { status: 409 });
      }
    }
    // Tranche = milestone percentage of the agreed total; full amount when the
    // project defined no milestones.
    payAmount = milestoneRow ? (total * milestoneRow.percentage) / 100 : total;
    payAmount = Math.round(payAmount * 100) / 100;
    payTrustScore = proposal.project?.aiTrustScore ?? null;
    fundingPaused = Boolean((proposal.terms as any)?.fundingPaused);
    label = `${proposal.project?.name ?? 'project'}${milestoneRow ? ` · ${milestoneRow.title}` : ''}`;
  } else {
    // Direct mode (dashboard demo): still policy-gated, still a real transfer.
    payTo = String(recipient || '');
    payAmount = Number(amountUsdc);
    payTrustScore = trustScore != null ? Number(trustScore) : null;
    label = projectName || 'direct investment';
    if (!EVM_ADDRESS.test(payTo)) {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 });
    }
  }

  // ---------- the policy gate: the agent's only approval path ----------
  const verdict = await checkAgentPolicy({
    amountUsdc: payAmount,
    trustScore: payTrustScore,
    fundingPaused,
  });
  if (!verdict.allowed) {
    return NextResponse.json(
      { success: false, blocked: true, policy: verdict, message: `Policy denied: ${verdict.reason}` },
      { status: 403 }
    );
  }

  // ---------- real money movement ----------
  const wallet = await getOrCreateAgentWallet();
  const balance = await getUsdcBalance(wallet.id);
  if (!balance || Number(balance.amount) < payAmount) {
    return NextResponse.json(
      {
        error: `Agent wallet ${wallet.address} holds ${balance?.amount ?? 0} USDC — needs ${payAmount}. Fund it via POST /api/circle/faucet.`,
        agentWallet: wallet.address,
      },
      { status: 402 }
    );
  }

  const transfer = await transferUsdc({
    walletId: wallet.id,
    tokenId: balance.tokenId,
    destinationAddress: payTo,
    amountUsdc: payAmount,
    idempotencyKey: idempotencyKeyFor(
      proposalId ?? `direct:${payTo}:${label}`,
      milestoneRow?.id ?? phase,
      proposal ? String(proposal.updatedAt.getTime()) : 'direct'
    ),
  });

  // ---------- persistence (full-flow mode) ----------
  if (proposal) {
    await prisma.$transaction([
      prisma.investmentProposal.update({
        where: { id: proposal.id },
        data: {
          status: 'FUNDED',
          escrowTxHash: transfer.txHash ?? transfer.circleTxId,
          escrowAddress: wallet.address,
          ...(phase === 'initial' ? { agreedAt: proposal.agreedAt ?? new Date() } : {}),
        },
      }),
      prisma.project.update({
        where: { id: proposal.projectId },
        data: {
          status: 'FUNDED',
          currentFunding: { increment: payAmount },
        },
      }),
      ...(milestoneRow
        ? [
            prisma.milestone.update({
              where: { id: milestoneRow.id },
              data: { status: 'RELEASED', releasedAt: new Date() },
            }),
          ]
        : []),
    ]);
  }

  return NextResponse.json({
    success: true,
    release: {
      proposalId: proposal?.id ?? null,
      milestoneId: milestoneRow?.id ?? null,
      status: 'released',
      amountUsdc: payAmount,
      recipient: payTo,
      txHash: transfer.txHash ?? null,
      circleTxId: transfer.circleTxId,
      explorerUrl: transfer.explorerUrl ?? null,
      state: transfer.state,
      releasedAt: new Date().toISOString(),
      network: 'Arc Testnet',
      token: 'USDC',
    },
    policy: verdict,
    agentWallet: wallet.address,
    message: `${payAmount} USDC released for ${label} — settled on Arc, no human in the loop.`,
  });
}

/** Real status: live wallet balance + policy budget + funded rows from the DB. */
async function handleCheckStatus() {
  const wallet = await getOrCreateAgentWallet();
  const balance = await getUsdcBalance(wallet.id);
  const policyState = await checkAgentPolicy({ amountUsdc: 0.01 });

  const recent = await prisma.investmentProposal.findMany({
    where: { escrowTxHash: { not: null } },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      escrowTxHash: true,
      agreedAmount: true,
      proposedAmount: true,
      updatedAt: true,
      project: { select: { name: true } },
    },
  });

  return NextResponse.json({
    success: true,
    status: {
      agentWallet: { id: wallet.id, address: wallet.address, blockchain: AGENT_BLOCKCHAIN },
      usdcBalance: balance?.amount ?? '0',
      policy: getAgentPolicy(),
      spentLast24hUsdc: policyState.spentLast24hUsdc,
      fundedProposals: recent.map((p: any) => ({
        id: p.id,
        project: p.project?.name,
        amount: p.agreedAmount ?? p.proposedAmount,
        txHash: p.escrowTxHash,
        at: p.updatedAt,
      })),
    },
  });
}

/**
 * Risk monitor pause: flips a flag on the proposal's terms that the policy
 * gate enforces — after this, release attempts are denied in code, not in
 * prose.
 */
async function handlePauseFunding(body: any) {
  const { proposalId, reason } = body;
  if (!proposalId) {
    return NextResponse.json({ error: 'proposalId required' }, { status: 400 });
  }
  const proposal = await prisma.investmentProposal.findUnique({ where: { id: proposalId } });
  if (!proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  }

  const terms = { ...((proposal.terms as any) ?? {}), fundingPaused: true, pauseReason: reason ?? 'Risk signals detected' };
  await prisma.investmentProposal.update({
    where: { id: proposalId },
    data: { terms },
  });

  return NextResponse.json({
    success: true,
    pause: {
      proposalId,
      status: 'paused',
      reason: terms.pauseReason,
      pausedAt: new Date().toISOString(),
    },
    message: 'Funding paused: the spending-policy gate now denies releases for this proposal.',
  });
}
