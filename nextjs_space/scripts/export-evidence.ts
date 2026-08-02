import prisma from '../lib/db';
import fs from 'fs';

/** Export the agent's real decision + payment record as JSON evidence. */
async function main() {
  const projects: any[] = await prisma.project.findMany({
    where: { aiTrustScore: { not: null } },
    orderBy: { reviewedAt: 'asc' },
    select: { name: true, aiTrustScore: true, aiAnalysis: true, reviewedAt: true, currentFunding: true, status: true },
  });
  const proposals: any[] = await prisma.investmentProposal.findMany({
    where: { escrowTxHash: { not: null } },
    orderBy: { updatedAt: 'asc' },
    include: { project: { select: { name: true, aiTrustScore: true } } },
  });

  const out = {
    exportedAt: new Date().toISOString(),
    engine: 'gemini-3-flash-preview (temperature 0, JSON-forced)',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
    agentWallet: '0xd8d42a355fe806545490758cf76e9c4b6ff535ad',
    network: 'Arc Testnet (chain 5042002)',
    geminiCalls: projects.map((p) => ({
      at: p.reviewedAt,
      project: p.name,
      trustScore: p.aiTrustScore,
      recommendation: p.aiAnalysis?.recommendation ?? null,
      riskLevel: p.aiAnalysis?.riskLevel ?? null,
      summary: p.aiAnalysis?.summary ?? null,
      policyOutcome: (p.aiTrustScore ?? 0) >= 70 ? 'cleared threshold (70)' : 'below threshold (70) — payment denied',
    })),
    payments: proposals.map((p) => ({
      at: p.updatedAt,
      project: p.project.name,
      trustScore: p.project.aiTrustScore,
      amountUsdc: p.agreedAmount ?? p.proposedAmount,
      fundedTotalUsdc: undefined,
      txHash: p.escrowTxHash,
      explorer: `https://testnet.arcscan.app/tx/${p.escrowTxHash}`,
      fromWallet: p.escrowAddress,
    })),
  };
  fs.writeFileSync('../demo/forms/agent-execution-log.json', JSON.stringify(out, null, 2));
  console.log('gemini calls:', out.geminiCalls.length, '| payments:', out.payments.length);
  for (const c of out.geminiCalls) console.log(` ${c.project}: ${c.trustScore} → ${c.policyOutcome}`);
}
main().finally(() => prisma.$disconnect());
