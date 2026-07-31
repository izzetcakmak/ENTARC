/**
 * ENTARC Agent Spending Policy
 *
 * The autonomous agent moves real USDC with no human in the approval path —
 * these rules ARE the approval path. Every transfer must pass this gate first;
 * there is deliberately no override flag. Limits are env-tunable so the demo,
 * testnet and production can run different budgets without code changes.
 */

import prisma from '@/lib/db';

export interface AgentPolicy {
  /** Hard cap for a single investment transfer, in USDC. */
  maxPerTxUsdc: number;
  /** Rolling 24h spend ceiling across all transfers, in USDC. */
  dailyCapUsdc: number;
  /** Agent only funds projects at or above this AI trust score (0-100). */
  minTrustScore: number;
}

export function getAgentPolicy(): AgentPolicy {
  return {
    maxPerTxUsdc: Number(process.env.AGENT_MAX_PER_TX_USDC || 5),
    dailyCapUsdc: Number(process.env.AGENT_DAILY_CAP_USDC || 20),
    minTrustScore: Number(process.env.AGENT_MIN_TRUST_SCORE || 70),
  };
}

export interface PolicyCheckInput {
  /** Requested transfer amount in USDC. */
  amountUsdc: number;
  /** Trust score of the target project, when the transfer funds a project. */
  trustScore?: number | null;
  /** Set when the proposal's funding has been paused by the risk monitor. */
  fundingPaused?: boolean;
}

export interface PolicyCheckResult {
  allowed: boolean;
  /** Human-readable reason, always set (audit trail + UI). */
  reason: string;
  policy: AgentPolicy;
  /** USDC already spent by the agent in the last 24h (from the DB audit trail). */
  spentLast24hUsdc: number;
}

/**
 * Sum of agent transfers in the last 24h, from the proposals audit trail.
 * Only rows with a real on-chain tx hash count — simulations never made it
 * into this column, so the cap can't be gamed by drafts.
 */
async function spentLast24h(): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const funded = await prisma.investmentProposal.findMany({
    where: {
      escrowTxHash: { not: null },
      updatedAt: { gte: since },
    },
    select: { agreedAmount: true, proposedAmount: true },
  });
  return funded.reduce(
    (sum: number, p: { agreedAmount: number | null; proposedAmount: number }) =>
      sum + (p.agreedAmount ?? p.proposedAmount ?? 0),
    0
  );
}

/** The single decision gate every agent transfer must pass. */
export async function checkAgentPolicy(input: PolicyCheckInput): Promise<PolicyCheckResult> {
  const policy = getAgentPolicy();
  const spent = await spentLast24h().catch(() => 0);

  const deny = (reason: string): PolicyCheckResult => ({
    allowed: false,
    reason,
    policy,
    spentLast24hUsdc: spent,
  });

  if (!Number.isFinite(input.amountUsdc) || input.amountUsdc <= 0) {
    return deny(`Invalid amount: ${input.amountUsdc}`);
  }
  if (input.fundingPaused) {
    return deny('Funding for this proposal is paused by the risk monitor.');
  }
  if (input.amountUsdc > policy.maxPerTxUsdc) {
    return deny(
      `Amount ${input.amountUsdc} USDC exceeds the per-transaction cap of ${policy.maxPerTxUsdc} USDC.`
    );
  }
  if (spent + input.amountUsdc > policy.dailyCapUsdc) {
    return deny(
      `Transfer would push 24h spend to ${(spent + input.amountUsdc).toFixed(2)} USDC, over the ${policy.dailyCapUsdc} USDC daily cap (already spent: ${spent.toFixed(2)}).`
    );
  }
  if (input.trustScore != null && input.trustScore < policy.minTrustScore) {
    return deny(
      `Project trust score ${input.trustScore} is below the agent's minimum of ${policy.minTrustScore}.`
    );
  }

  return {
    allowed: true,
    reason: `Within policy: ≤${policy.maxPerTxUsdc} USDC/tx, 24h spend ${spent.toFixed(2)} + ${input.amountUsdc} ≤ ${policy.dailyCapUsdc} USDC${input.trustScore != null ? `, trust ${input.trustScore} ≥ ${policy.minTrustScore}` : ''}.`,
    policy,
    spentLast24hUsdc: spent,
  };
}
