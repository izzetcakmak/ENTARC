export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { NETWORK_LABEL, NETWORK_SINCE, explorerTxUrl } from '@/lib/arc-network';

/**
 * Portfolio — the signed-in investor's real positions.
 *
 * A position is a proposal of theirs that reached ACCEPTED or beyond. Amounts
 * are what the agent actually committed and released; there is no token price,
 * so no invented "current value" or ROI. On mainnet, rows older than
 * NETWORK_SINCE are testnet history and excluded.
 */

const TX_HASH = /^0x[a-fA-F0-9]{64}$/;
const round2 = (n: number) => Math.round(n * 100) / 100;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const since = NETWORK_SINCE ?? new Date(0);

    const proposals = await prisma.investmentProposal.findMany({
      where: {
        investorId: session.user.id,
        status: { in: ['ACCEPTED', 'FUNDED', 'COMPLETED', 'DISPUTED'] },
        updatedAt: { gte: since },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        agreedAmount: true,
        proposedAmount: true,
        agreedAt: true,
        escrowTxHash: true,
        project: {
          select: {
            id: true,
            name: true,
            category: true,
            logoEmoji: true,
            aiTrustScore: true,
            milestones: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, title: true, percentage: true, status: true, releasedAt: true },
            },
          },
        },
      },
    });

    const positions = proposals.map((p) => {
      const committed = p.agreedAmount ?? p.proposedAmount ?? 0;
      const milestones = p.project?.milestones ?? [];
      const funded = p.escrowTxHash != null;

      let released = 0;
      if (funded) {
        released = milestones.length
          ? milestones
              .filter((m) => m.status === 'RELEASED' && m.releasedAt && m.releasedAt >= since)
              .reduce((sum, m) => sum + (committed * m.percentage) / 100, 0)
          : committed;
      }

      const next = milestones.find((m) => m.status !== 'RELEASED');
      const hash = p.escrowTxHash ?? '';

      return {
        id: p.id,
        status: p.status,
        projectId: p.project?.id ?? '',
        projectName: p.project?.name ?? 'Unknown',
        category: p.project?.category ?? '',
        logoEmoji: p.project?.logoEmoji ?? '🚀',
        trustScore: p.project?.aiTrustScore ?? null,
        committed: round2(committed),
        released: round2(released),
        locked: round2(Math.max(committed - released, 0)),
        milestonesReleased: milestones.filter((m) => m.status === 'RELEASED').length,
        milestonesTotal: milestones.length,
        nextMilestone: next ? { title: next.title, amount: round2((committed * next.percentage) / 100) } : null,
        agreedAt: p.agreedAt?.toISOString() ?? null,
        explorerUrl: TX_HASH.test(hash) ? explorerTxUrl(hash) : null,
      };
    });

    const byCategory: Record<string, number> = {};
    for (const pos of positions) {
      byCategory[pos.category] = (byCategory[pos.category] ?? 0) + pos.committed;
    }

    return NextResponse.json({
      network: NETWORK_LABEL,
      totals: {
        committed: round2(positions.reduce((s, p) => s + p.committed, 0)),
        released: round2(positions.reduce((s, p) => s + p.released, 0)),
        locked: round2(positions.reduce((s, p) => s + p.locked, 0)),
        positions: positions.length,
      },
      allocation: Object.entries(byCategory)
        .map(([category, amount]) => ({ category, amount: round2(amount) }))
        .sort((a, b) => b.amount - a.amount),
      positions,
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    return NextResponse.json({ error: 'Failed to load portfolio' }, { status: 500 });
  }
}
