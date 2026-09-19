export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { NETWORK_LABEL, NETWORK_SINCE, explorerTxUrl } from '@/lib/arc-network';

/**
 * Dashboard — real figures only.
 *
 * Everything here is derived from rows the agent itself wrote when it moved
 * USDC (see /api/agent/escrow): funded proposals, their tx hashes and the
 * milestone tranches it released. Nothing is simulated; an agent that has not
 * funded anything on the active network reports zeros.
 *
 * On mainnet, rows older than NETWORK_SINCE are testnet history and excluded.
 */

const TX_HASH = /^0x[a-fA-F0-9]{64}$/;
const HISTORY_DAYS = 30;

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const since = NETWORK_SINCE ?? new Date(0);

    const [funded, topProjects] = await Promise.all([
      prisma.investmentProposal.findMany({
        where: { escrowTxHash: { not: null }, updatedAt: { gte: since } },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          escrowTxHash: true,
          agreedAmount: true,
          proposedAmount: true,
          agreedAt: true,
          updatedAt: true,
          project: {
            select: {
              id: true,
              name: true,
              aiTrustScore: true,
              milestones: {
                orderBy: { orderIndex: 'asc' },
                select: { id: true, title: true, percentage: true, status: true, releasedAt: true },
              },
            },
          },
        },
      }),
      prisma.project.findMany({
        where: { status: { in: ['APPROVED', 'FUNDED'] }, aiTrustScore: { not: null } },
        orderBy: [{ aiTrustScore: 'desc' }, { createdAt: 'desc' }],
        take: 3,
        select: { id: true, name: true, category: true, logoEmoji: true, aiTrustScore: true, currentFunding: true },
      }),
    ]);

    let committed = 0;
    let released = 0;
    const activity: Array<{
      id: string;
      type: 'investment' | 'release';
      projectId: string;
      projectName: string;
      description: string;
      amount: number;
      timestamp: string;
      explorerUrl: string | null;
    }> = [];
    const releaseEvents: Array<{ at: Date; amount: number }> = [];

    for (const p of funded) {
      const total = p.agreedAmount ?? p.proposedAmount ?? 0;
      committed += total;

      // escrowTxHash holds the Circle transaction id until the chain hash lands.
      const hash = p.escrowTxHash ?? '';
      const explorerUrl = TX_HASH.test(hash) ? explorerTxUrl(hash) : null;
      const milestones = p.project?.milestones ?? [];
      const paid = milestones.filter(
        (m) => m.status === 'RELEASED' && m.releasedAt && m.releasedAt >= since
      );

      if (milestones.length === 0) {
        // No milestone plan: the escrow route pays the full amount at once.
        released += total;
        releaseEvents.push({ at: p.agreedAt ?? p.updatedAt, amount: total });
      }

      for (const m of paid) {
        const tranche = round2((total * m.percentage) / 100);
        released += tranche;
        releaseEvents.push({ at: m.releasedAt as Date, amount: tranche });
        activity.push({
          id: `release-${m.id}`,
          type: 'release',
          projectId: p.project?.id ?? '',
          projectName: p.project?.name ?? 'Unknown',
          description: `Milestone released: ${m.title}`,
          amount: tranche,
          timestamp: (m.releasedAt as Date).toISOString(),
          explorerUrl: null,
        });
      }

      activity.push({
        id: `funded-${p.id}`,
        type: 'investment',
        projectId: p.project?.id ?? '',
        projectName: p.project?.name ?? 'Unknown',
        description: `Escrow funded on ${NETWORK_LABEL}`,
        amount: total,
        timestamp: (p.agreedAt ?? p.updatedAt).toISOString(),
        explorerUrl,
      });
    }

    activity.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    // Cumulative released / still-locked per day, for the funds chart.
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    const history = Array.from({ length: HISTORY_DAYS }, (_, i) => {
      const day = new Date(today);
      day.setUTCDate(day.getUTCDate() - (HISTORY_DAYS - 1 - i));
      const releasedToDate = releaseEvents
        .filter((e) => e.at <= day)
        .reduce((sum, e) => sum + e.amount, 0);
      const committedToDate = funded
        .filter((p) => (p.agreedAt ?? p.updatedAt) <= day)
        .reduce((sum, p) => sum + (p.agreedAmount ?? p.proposedAmount ?? 0), 0);
      return {
        timestamp: day.toISOString(),
        released: round2(releasedToDate),
        locked: round2(Math.max(committedToDate - releasedToDate, 0)),
      };
    });

    const fundedProjectIds = new Set(funded.map((p) => p.project?.id).filter(Boolean));
    const scores = funded
      .map((p) => p.project?.aiTrustScore)
      .filter((s): s is number => typeof s === 'number');

    return NextResponse.json({
      network: NETWORK_LABEL,
      since: NETWORK_SINCE?.toISOString() ?? null,
      metrics: {
        committed: round2(committed),
        fundedProjects: fundedProjectIds.size,
        averageTrustScore: scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
        released: round2(released),
        locked: round2(Math.max(committed - released, 0)),
      },
      activity: activity.slice(0, 8),
      history,
      topProjects,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
