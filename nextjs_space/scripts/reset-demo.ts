import prisma from '../lib/db';
async function main() {
  const p: any = await prisma.investmentProposal.findFirst({
    where: { project: { name: 'Morsu' } },
    include: { project: { include: { milestones: true } } },
  });
  if (!p) throw new Error('demo proposal not found');
  await prisma.investmentProposal.update({
    where: { id: p.id },
    data: { status: 'ACCEPTED', escrowTxHash: null, escrowAddress: null },
  });
  await prisma.project.update({
    where: { id: p.projectId },
    data: { status: 'APPROVED', currentFunding: 0, aiTrustScore: null, aiAnalysis: undefined },
  });
  await prisma.milestone.updateMany({
    where: { projectId: p.projectId },
    data: { status: 'PENDING', releasedAt: null },
  });
  console.log('demo reset ->', p.id);
}
main().finally(() => prisma.$disconnect());
