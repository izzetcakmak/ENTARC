export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      tagline,
      description,
      category,
      logoEmoji,
      githubUrl,
      twitterHandle,
      discordUrl,
      websiteUrl,
      fundingGoal,
      milestones,
    } = body;

    // Validate required fields
    if (!name || !tagline || !description || !category || !fundingGoal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        tagline,
        description,
        category,
        logoEmoji: logoEmoji || '🚀',
        founderId: session.user.id,
        founderEmail: user.email,
        githubUrl,
        twitterHandle,
        discordUrl,
        websiteUrl,
        fundingGoal: parseFloat(fundingGoal),
        status: 'PENDING_REVIEW',
      },
    });

    // Create milestones if provided
    if (milestones && Array.isArray(milestones) && milestones.length > 0) {
      const milestoneData = milestones.map((m: any, index: number) => ({
        projectId: project.id,
        title: m.title,
        description: m.description || '',
        targetAmount: parseFloat(m.targetAmount) || (parseFloat(fundingGoal) / milestones.length),
        percentage: m.percentage || (100 / milestones.length),
        orderIndex: index,
        status: 'PENDING' as const,
      }));

      await prisma.milestone.createMany({
        data: milestoneData,
      });
    }

    // Update user role to FOUNDER or BOTH
    if (user.role === 'INVESTOR') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: 'BOTH' },
      });
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
      },
    });
  } catch (error) {
    console.error('Project submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit project' },
      { status: 500 }
    );
  }
}
