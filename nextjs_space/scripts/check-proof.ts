import prisma from '../lib/db';
async function main() {
  const p: any = await prisma.investmentProposal.findUnique({
    where: { id: 'cms9e3omz0007uaz0t5qxh093' },
    include: { project: { include: { milestones: { orderBy: { orderIndex: 'asc' } } } } },
  });
  console.log('status:', p.status);
  console.log('escrowTxHash:', p.escrowTxHash);
  console.log('escrowAddress (agent wallet):', p.escrowAddress);
  console.log('project:', p.project.status, '| currentFunding:', p.project.currentFunding);
  console.log('milestones:', p.project.milestones.map((m: any) => `${m.title}:${m.status}`).join(', '));
}
main().finally(() => prisma.$disconnect());
