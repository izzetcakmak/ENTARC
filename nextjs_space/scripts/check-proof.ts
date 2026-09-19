import prisma from '../lib/db';
async function main() {
  const rows: any[] = await prisma.investmentProposal.findMany({
    where: { escrowTxHash: { not: null } },
    include: { project: { include: { milestones: { orderBy: { orderIndex: 'asc' } } } } },
    orderBy: { updatedAt: 'desc' },
  });
  for (const p of rows) {
    console.log(`\n${p.project.name}: ${p.status} | trust ${p.project.aiTrustScore} | funded ${p.project.currentFunding} USDC`);
    console.log(`  tx: ${p.escrowTxHash}`);
    console.log(`  milestones: ${p.project.milestones.map((m: any) => m.title + ':' + m.status).join(', ')}`);
  }
}
main().finally(() => prisma.$disconnect());
