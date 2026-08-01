export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { getOrCreateAgentWallet, getUsdcBalance, explorerTxUrl } from '@/lib/circle-client';
import { checkAgentPolicy, getAgentPolicy } from '@/lib/agent-policy';
import { generateAnalysis, hasGemini, geminiModel } from '@/lib/gemini';

/**
 * Agent Console feed — one endpoint that exposes the agent's full decision
 * chain for a single proposal: what Gemini concluded, what the policy gate
 * decided, and what actually settled on-chain. Read-only; the money moves
 * through /api/agent/escrow.
 */

/** Fundable proposals + the agent's live wallet state. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const proposals = await prisma.investmentProposal.findMany({
    where: { status: { in: ['ACCEPTED', 'FUNDED'] } },
    orderBy: { createdAt: 'desc' },
    take: 12,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          tagline: true,
          logoEmoji: true,
          category: true,
          githubUrl: true,
          websiteUrl: true,
          aiTrustScore: true,
          aiAnalysis: true,
          currentFunding: true,
          milestones: { orderBy: { orderIndex: 'asc' } },
        },
      },
      founder: { select: { name: true, walletAddress: true } },
    },
  });

  let wallet: { address: string; id: string } | null = null;
  let usdc = '0';
  try {
    const w = await getOrCreateAgentWallet();
    wallet = { address: w.address, id: w.id };
    usdc = (await getUsdcBalance(w.id))?.amount ?? '0';
  } catch {
    // wallet provisioning issues shouldn't blank the console
  }

  const budget = await checkAgentPolicy({ amountUsdc: 0.01 });

  return NextResponse.json({
    agent: {
      wallet: wallet?.address ?? null,
      usdc,
      engine: hasGemini() ? `Gemini · ${geminiModel()}` : 'fallback LLM',
      network: 'Arc Testnet',
      policy: getAgentPolicy(),
      spentLast24hUsdc: budget.spentLast24hUsdc,
    },
    proposals: proposals.map((p: any) => ({
      id: p.id,
      amount: p.agreedAmount ?? p.proposedAmount,
      status: p.status,
      txHash: p.escrowTxHash,
      explorerUrl: p.escrowTxHash?.startsWith('0x') ? explorerTxUrl(p.escrowTxHash) : null,
      recipient: p.founder?.walletAddress ?? null,
      project: {
        id: p.project.id,
        name: p.project.name,
        tagline: p.project.tagline,
        emoji: p.project.logoEmoji,
        category: p.project.category,
        githubUrl: p.project.githubUrl,
        trustScore: p.project.aiTrustScore,
        analysis: p.project.aiAnalysis,
        funding: p.project.currentFunding,
        milestones: p.project.milestones.map((m: any) => ({
          id: m.id,
          title: m.title,
          percentage: m.percentage,
          status: m.status,
        })),
      },
    })),
  });
}

/**
 * Step 1 of the chain: run the Gemini due-diligence pass for a project and
 * persist the score. Kept separate from the payment call so the console can
 * show reasoning before money is considered.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await req.json();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const prompt = `You are the due-diligence engine of an autonomous venture agent that invests real USDC without human approval. Assess this project.

Name: ${project.name}
Tagline: ${project.tagline}
Category: ${project.category}
Description: ${project.description}
GitHub: ${project.githubUrl || 'n/a'} (${project.githubCommits} commits, ${project.githubStars} stars, ${project.githubContributors} contributors)
Website: ${project.websiteUrl || 'n/a'}
Funding goal: ${project.fundingGoal} USDC
Milestones:
${project.milestones.map((m: any, i: number) => `${i + 1}. ${m.title} (${m.percentage}%) — ${m.description}`).join('\n')}

Respond as raw JSON:
{"trustScore":<0-100>,"sentiment":"BULLISH|NEUTRAL|BEARISH","activityLevel":"HIGH|MODERATE|LOW","riskLevel":"LOW|MEDIUM|HIGH","recommendation":"STRONG_BUY|BUY|HOLD|AVOID","summary":"<2 sentences>","strengths":["..","..",".."],"weaknesses":["..",".."],"risks":["..",".."],"opportunities":["..",".."]}`;

  let analysis: any;
  try {
    analysis = JSON.parse(
      await generateAnalysis(
        'You are a rigorous venture analyst. Score strictly on the verifiable evidence given — shipped code, repo activity, concrete milestones — and treat unverifiable claims as absent evidence rather than as negatives.',
        prompt
      )
    );
  } catch (e: any) {
    return NextResponse.json({ error: `Analysis failed: ${e?.message ?? e}` }, { status: 502 });
  }

  const trustScore = Math.min(100, Math.max(0, Number(analysis.trustScore) || 0));
  await prisma.project.update({
    where: { id: projectId },
    data: {
      aiTrustScore: trustScore,
      aiAnalysis: analysis,
      sentiment: analysis.sentiment ?? 'NEUTRAL',
      activityLevel: analysis.activityLevel ?? 'MODERATE',
      riskLevel: analysis.riskLevel ?? 'MEDIUM',
      reviewedAt: new Date(),
    },
  });

  const policy = getAgentPolicy();
  return NextResponse.json({
    engine: hasGemini() ? `Gemini · ${geminiModel()}` : 'fallback LLM',
    trustScore,
    analysis,
    threshold: policy.minTrustScore,
    clearsThreshold: trustScore >= policy.minTrustScore,
  });
}
