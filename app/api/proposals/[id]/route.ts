export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: Fetch single proposal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proposal = await prisma.investmentProposal.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            milestones: {
              orderBy: { orderIndex: 'asc' },
            },
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
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check if user is investor or founder
    if (proposal.investorId !== session.user.id && proposal.founderId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Fetch proposal error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposal' },
      { status: 500 }
    );
  }
}

// PATCH: Update proposal (accept, reject, counter)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, counterAmount, counterMessage } = body;

    const proposal = await prisma.investmentProposal.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: { name: true, founderEmail: true },
        },
        investor: {
          select: { email: true, name: true },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Validate action permissions
    const isFounder = proposal.founderId === session.user.id;
    const isInvestor = proposal.investorId === session.user.id;

    if (!isFounder && !isInvestor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let updateData: any = {};

    switch (action) {
      case 'accept':
        if (!isFounder) {
          return NextResponse.json({ error: 'Only founder can accept' }, { status: 403 });
        }
        if (proposal.status !== 'PENDING' && proposal.status !== 'COUNTERED') {
          return NextResponse.json({ error: 'Invalid proposal status' }, { status: 400 });
        }
        updateData = {
          status: 'ACCEPTED',
          agreedAmount: proposal.counterAmount || proposal.proposedAmount,
          agreedAt: new Date(),
        };
        break;

      case 'reject':
        if (!isFounder) {
          return NextResponse.json({ error: 'Only founder can reject' }, { status: 403 });
        }
        updateData = {
          status: 'REJECTED',
        };
        break;

      case 'counter':
        if (!isFounder) {
          return NextResponse.json({ error: 'Only founder can counter' }, { status: 403 });
        }
        if (!counterAmount) {
          return NextResponse.json({ error: 'Counter amount required' }, { status: 400 });
        }
        updateData = {
          status: 'COUNTERED',
          counterAmount: parseFloat(counterAmount),
          counterMessage,
        };
        break;

      case 'accept_counter':
        if (!isInvestor) {
          return NextResponse.json({ error: 'Only investor can accept counter' }, { status: 403 });
        }
        if (proposal.status !== 'COUNTERED') {
          return NextResponse.json({ error: 'No counter offer to accept' }, { status: 400 });
        }
        updateData = {
          status: 'ACCEPTED',
          agreedAmount: proposal.counterAmount,
          agreedAt: new Date(),
        };
        break;

      case 'withdraw':
        if (!isInvestor) {
          return NextResponse.json({ error: 'Only investor can withdraw' }, { status: 403 });
        }
        if (proposal.status === 'ACCEPTED' || proposal.status === 'FUNDED') {
          return NextResponse.json({ error: 'Cannot withdraw accepted proposal' }, { status: 400 });
        }
        updateData = {
          status: 'REJECTED',
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedProposal = await prisma.investmentProposal.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      proposal: {
        id: updatedProposal.id,
        status: updatedProposal.status,
        agreedAmount: updatedProposal.agreedAmount,
      },
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    return NextResponse.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    );
  }
}
