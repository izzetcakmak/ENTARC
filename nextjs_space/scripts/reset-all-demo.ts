import prisma from '../lib/db';
async function main() {
  const props: any[] = await prisma.investmentProposal.findMany({ include: { project: true } });
  for (const p of props) {
    await prisma.investmentProposal.update({
      where: { id: p.id },
      data: { status: 'ACCEPTED', escrowTxHash: null, escrowAddress: null },
    });
    await prisma.project.update({
      where: { id: p.projectId },
      data: { status: 'APPROVED', currentFunding: 0 },
    });
    await prisma.milestone.updateMany({
      where: { projectId: p.projectId },
      data: { status: 'PENDING', releasedAt: null },
    });
  }
  console.log('reset proposals:', props.length);
}
main().finally(() => prisma.$disconnect());
