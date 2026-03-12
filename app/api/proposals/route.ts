export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: Fetch proposals for investor or founder
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'investor'; // investor or founder
    const status = searchParams.get('status');

    const where: any = {};

    if (role === 'investor') {
      where.investorId = session.user.id;
    } else {
      where.founderId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    const proposals = await prisma.investmentProposal.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            tagline: true,
            logoEmoji: true,
            category: true,
            aiTrustScore: true,
          },
        },
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
            walletAddress: true,
          },
        },
        founder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Fetch proposals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

// POST: Create new investment proposal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      proposedAmount,
      proposedROI,
      message,
      milestones,
    } = body;

    if (!projectId || !proposedAmount) {
      return NextResponse.json(
        { error: 'Project ID and proposed amount are required' },
        { status: 400 }
      );
    }

    // Fetch project to get founder info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        founderId: true,
        founderEmail: true,
        status: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Project is not accepting proposals' },
        { status: 400 }
      );
    }

    if (project.founderId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot invest in your own project' },
        { status: 400 }
      );
    }

    // Get investor wallet address
    const investor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletAddress: true },
    });

    // Create proposal with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const proposal = await prisma.investmentProposal.create({
      data: {
        investorId: session.user.id,
        investorWallet: investor?.walletAddress,
        projectId,
        founderId: project.founderId,
        proposedAmount: parseFloat(proposedAmount),
        proposedROI: proposedROI ? parseFloat(proposedROI) : null,
        message,
        milestones,
        expiresAt,
        status: 'PENDING',
      },
      include: {
        project: {
          select: {
            name: true,
            tagline: true,
          },
        },
        investor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email notification to founder
    try {
      const appUrl = process.env.NEXTAUTH_URL || '';
      const appName = 'ENTARC';
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 20px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #22d3ee; margin: 0;">💰 New Investment Proposal</h1>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Project:</strong> ${proposal.project.name}</p>
            <p style="margin: 10px 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Investor:</strong> ${proposal.investor.name || proposal.investor.email}</p>
            <p style="margin: 10px 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Proposed Amount:</strong> <span style="color: #22d3ee; font-size: 1.2em;">$${parseFloat(proposedAmount).toLocaleString()} USDC</span></p>
            ${proposedROI ? `<p style="margin: 10px 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Expected ROI:</strong> ${proposedROI}%</p>` : ''}
            ${message ? `<p style="margin: 10px 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Message:</strong></p><div style="background: #0f172a; padding: 15px; border-radius: 4px; border-left: 4px solid #22d3ee;">${message}</div>` : ''}
          </div>
          <p style="text-align: center; color: #64748b; font-size: 12px;">
            This proposal expires in 7 days. Log in to ENTARC to respond.
          </p>
        </div>
      `;

      await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_NEW_INVESTMENT_PROPOSAL,
          subject: `💰 New Investment Proposal: $${parseFloat(proposedAmount).toLocaleString()} for ${proposal.project.name}`,
          body: htmlBody,
          is_html: true,
          recipient_email: project.founderEmail,
          sender_email: appUrl ? `noreply@${new URL(appUrl).hostname}` : 'noreply@mail.abacusai.app',
          sender_alias: appName,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      proposal: {
        id: proposal.id,
        projectName: proposal.project.name,
        proposedAmount: proposal.proposedAmount,
        status: proposal.status,
        expiresAt: proposal.expiresAt,
      },
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}
