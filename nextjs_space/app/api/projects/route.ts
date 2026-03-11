export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: Fetch all approved projects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'APPROVED';
    const category = searchParams.get('category');
    const minScore = searchParams.get('minScore');

    const where: any = {
      status: status as any,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (minScore) {
      where.aiTrustScore = {
        gte: parseInt(minScore),
      };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            email: true,
            walletAddress: true,
          },
        },
        milestones: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { proposals: true },
        },
      },
      orderBy: [
        { aiTrustScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
