/**
 * E2E prep for the autonomous-investment proof:
 *  1. demo rows: founder (with a real wallet), project, milestones, ACCEPTED proposal
 *  2. the agent's Circle wallet on Arc Testnet (created if missing)
 *  3. faucet USDC into the agent wallet, polled until it lands
 *
 * Run: npx tsx --require dotenv/config scripts/agent-e2e-prep.ts
 */

import prisma from '../lib/db';
import { getOrCreateAgentWallet, getUsdcBalance } from '../lib/circle-client';

const FOUNDER_WALLET = '0xD4F1254C803662c46D9c21f80F4F3c15FF57e2c9'; // demo founder payout address

async function main() {
  // ---- demo data ------------------------------------------------------------
  const founder = await prisma.user.upsert({
    where: { email: 'founder@entarc.io' },
    update: { walletAddress: FOUNDER_WALLET },
    create: {
      email: 'founder@entarc.io',
      name: 'Demo Founder',
      walletAddress: FOUNDER_WALLET,
    },
  });
  const investor = await prisma.user.findUnique({ where: { email: 'test@entarc.io' } });
  if (!investor) throw new Error('Run `npx prisma db seed` first (creates test@entarc.io)');

  let project = await prisma.project.findFirst({ where: { name: 'Morsu' } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Morsu',
        tagline: 'Walrus blob explorer',
        description:
          'Open-source explorer for Walrus blob storage on Sui: inspect blobs, track storage nodes, follow epochs. Live at morsu.xyz with 500+ commits.',
        category: 'INFRASTRUCTURE',
        logoEmoji: '🐋',
        founderId: founder.id,
        founderEmail: founder.email,
        githubUrl: 'https://github.com/izzetcakmak/morsu',
        websiteUrl: 'https://morsu.xyz',
        fundingGoal: 10,
        aiTrustScore: 85,
        status: 'APPROVED',
        milestones: {
          create: [
            { title: 'Indexer v2', description: 'Faster blob indexing', targetAmount: 2, percentage: 50, orderIndex: 0 },
            { title: 'Node dashboard', description: 'Storage-node health view', targetAmount: 1.2, percentage: 30, orderIndex: 1 },
            { title: 'Public API', description: 'REST API for blob metadata', targetAmount: 0.8, percentage: 20, orderIndex: 2 },
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
        proposedAmount: 4,
        agreedAmount: 4,
        status: 'ACCEPTED',
        agreedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        message: 'Autonomous agent proposal — milestone-based tranches.',
      },
    });
  }
  console.log(`[data] project=${project.id} proposal=${proposal.id} (${proposal.status})`);

  // ---- agent wallet ---------------------------------------------------------
  const wallet = await getOrCreateAgentWallet();
  console.log(`[wallet] id=${wallet.id} address=${wallet.address}`);

  // ---- faucet + balance poll ------------------------------------------------
  let bal = await getUsdcBalance(wallet.id);
  console.log(`[balance] USDC=${bal?.amount ?? '0'}`);
  if (!bal || Number(bal.amount) < 2) {
    const res = await fetch('https://api.circle.com/v1/faucet/drips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      },
      // On Arc, USDC IS the native token — requesting `native` separately 400s.
      body: JSON.stringify({ address: wallet.address, blockchain: 'ARC-TESTNET', usdc: true }),
    });
    console.log(`[faucet] HTTP ${res.status}`);
    if (res.status === 401 || res.status === 403) {
      console.log('[faucet] key not entitled — use https://faucet.circle.com manually for', wallet.address);
    }
    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      bal = await getUsdcBalance(wallet.id);
      if (bal && Number(bal.amount) >= 2) break;
      process.stdout.write('.');
    }
    console.log(`\n[balance] USDC=${bal?.amount ?? '0'}`);
  }

  if (!bal || Number(bal.amount) < 2) {
    console.log('FUNDING INCOMPLETE — top up via faucet.circle.com then re-run.');
  } else {
    console.log('E2E PREP COMPLETE ✅');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
