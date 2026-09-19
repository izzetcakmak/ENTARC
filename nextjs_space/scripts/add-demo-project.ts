import prisma from '../lib/db';

async function main() {
  const founder = await prisma.user.findUnique({ where: { email: 'founder@entarc.io' } });
  const investor = await prisma.user.findUnique({ where: { email: 'test@entarc.io' } });
  if (!founder || !investor) throw new Error('run agent-e2e-prep first');

  let project = await prisma.project.findFirst({ where: { name: 'A NEW ONE' } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'A NEW ONE',
        tagline: 'Memecoin launchpad on Arc — rug-proof by architecture',
        description:
          'A pump.fun-style launchpad built on Arc (Circle stablecoin L1, gas = USDC). Bonding curves priced in USDC; reserves are locked in the contract forever with no LP and no migration step, so there is nothing to pull. Anti-snipe caps buys at 2% per wallet for the first 20 blocks. Half of every 1% trade fee is paid to the token creator. 28/28 Foundry tests passing, fully open source, live on Arc testnet with automated mainnet deployment. Launch gas was cut ~10x (20M to 2M) after real user feedback by moving token images from storage into event logs.',
        category: 'DEFI',
        logoEmoji: '🕹',
        founderId: founder.id,
        founderEmail: founder.email,
        githubUrl: 'https://github.com/izzetcakmak/anewone',
        websiteUrl: 'https://www.anewone.xyz',
        githubStars: 12,
        githubCommits: 340,
        githubContributors: 2,
        twitterHandle: 'izzetcakmak35',
        fundingGoal: 8,
        milestones: {
          create: [
            { title: 'Mainnet launch', description: 'Auto-deploy platform + first memecoin the minute Arc mainnet is detected', targetAmount: 4, percentage: 50, orderIndex: 0 },
            { title: 'Fiat onboarding', description: 'Google sign-in embedded wallet + on-ramp for non-crypto users', targetAmount: 2.4, percentage: 30, orderIndex: 1 },
            { title: 'Creator analytics', description: 'Per-creator revenue dashboard and token performance metrics', targetAmount: 1.6, percentage: 20, orderIndex: 2 },
          ],
        },
      },
    });
  }

  let proposal = await prisma.investmentProposal.findFirst({
    where: { projectId: project.id, status: { in: ['ACCEPTED', 'PENDING'] } },
  });
  if (!proposal) {
    proposal = await prisma.investmentProposal.create({
      data: {
        investorId: investor.id,
        projectId: project.id,
        founderId: founder.id,
        proposedAmount: 3,
        agreedAmount: 3,
        status: 'ACCEPTED',
        agreedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        message: 'Autonomous agent proposal — milestone-based tranches.',
      },
    });
  }
  console.log('projectId=' + project.id);
  console.log('proposalId=' + proposal.id);
}
main().finally(() => prisma.$disconnect());
