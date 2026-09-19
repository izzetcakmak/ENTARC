import prisma from '../lib/db';

/**
 * Fixture accuracy: Morsu's GitHub numbers were left at defaults while its
 * description claimed 500+ commits, so the agent (correctly) flagged the
 * contradiction. Real numbers go in; a genuinely weak project is added so the
 * denial path is demonstrated on a deal that deserves denial.
 */
async function main() {
  const morsu = await prisma.project.findFirst({ where: { name: 'Morsu' } });
  if (morsu) {
    await prisma.project.update({
      where: { id: morsu.id },
      data: { githubCommits: 566, githubStars: 8, githubContributors: 1, githubForks: 1 },
    });
    console.log('morsu github stats corrected');
  }

  const founder = await prisma.user.findUnique({ where: { email: 'founder@entarc.io' } });
  const investor = await prisma.user.findUnique({ where: { email: 'test@entarc.io' } });
  if (!founder || !investor) throw new Error('run agent-e2e-prep first');

  let weak = await prisma.project.findFirst({ where: { name: 'MoonVault' } });
  if (!weak) {
    weak = await prisma.project.create({
      data: {
        name: 'MoonVault',
        tagline: 'Guaranteed 100x yields for early believers',
        description:
          'MoonVault is a revolutionary yield protocol. Our proprietary algorithm generates guaranteed returns with zero risk. The team is anonymous for security reasons. No code has been published yet — the smart contracts are complete but kept private to prevent copying. Audit is planned after launch. Join our community of 50,000 believers and secure your allocation before the price moons.',
        category: 'DEFI',
        logoEmoji: '🌙',
        founderId: founder.id,
        founderEmail: founder.email,
        fundingGoal: 6,
        githubUrl: null,
        websiteUrl: null,
        milestones: {
          create: [
            { title: 'Launch', description: 'Deploy and start yields', targetAmount: 4, percentage: 66.7, orderIndex: 0 },
            { title: 'Scale', description: 'Grow TVL', targetAmount: 2, percentage: 33.3, orderIndex: 1 },
          ],
        },
      },
    });
    console.log('weak project created');
  }

  const existing = await prisma.investmentProposal.findFirst({ where: { projectId: weak.id } });
  if (!existing) {
    const p = await prisma.investmentProposal.create({
      data: {
        investorId: investor.id,
        projectId: weak.id,
        founderId: founder.id,
        proposedAmount: 3,
        agreedAmount: 3,
        status: 'ACCEPTED',
        agreedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        message: 'Autonomous agent proposal — milestone-based tranches.',
      },
    });
    console.log('weak proposal:', p.id);
  }
}
main().finally(() => prisma.$disconnect());
