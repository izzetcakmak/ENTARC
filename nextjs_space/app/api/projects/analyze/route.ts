export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// AI Trust Score Analysis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Fetch project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: true,
        founder: {
          select: { name: true, email: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Build analysis prompt
    const analysisPrompt = `
You are an AI venture capital analyst for ENTARC, evaluating early-stage blockchain/crypto projects.

Analyze the following project and provide a comprehensive assessment:

**Project Information:**
- Name: ${project.name}
- Tagline: ${project.tagline}
- Category: ${project.category}
- Description: ${project.description}
- Funding Goal: $${project.fundingGoal} USDC
- GitHub URL: ${project.githubUrl || 'Not provided'}
- Twitter: ${project.twitterHandle || 'Not provided'}
- Website: ${project.websiteUrl || 'Not provided'}
- Number of Milestones: ${project.milestones.length}

**Milestones:**
${project.milestones.map((m: any, i: number) => `${i + 1}. ${m.title} (${m.percentage}%): ${m.description}`).join('\n')}

Provide your analysis in the following JSON format:
{
  "trustScore": <number 0-100>,
  "sentiment": "BULLISH" | "NEUTRAL" | "BEARISH",
  "activityLevel": "HIGH" | "MODERATE" | "LOW",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "recommendation": "STRONG_BUY" | "BUY" | "HOLD" | "AVOID",
  "summary": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "risks": ["<risk 1>", "<risk 2>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>"]
}

Scoring Guidelines:
- 80-100: Exceptional project with strong fundamentals
- 60-79: Good project with solid potential
- 40-59: Average project with notable concerns
- 20-39: Below average with significant risks
- 0-19: High risk, avoid

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.
`;

    // Call LLM API
    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI venture capital analyst specializing in blockchain and crypto projects. Provide objective, data-driven analysis.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      console.error('LLM API error:', errorText);
      return NextResponse.json(
        { error: 'AI analysis failed' },
        { status: 500 }
      );
    }

    const llmData = await llmResponse.json();
    const analysisText = llmData.choices?.[0]?.message?.content;

    if (!analysisText) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error('Failed to parse LLM response:', analysisText);
      return NextResponse.json(
        { error: 'Failed to parse AI analysis' },
        { status: 500 }
      );
    }

    // Update project with AI analysis
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        aiTrustScore: Math.min(100, Math.max(0, analysis.trustScore || 50)),
        aiAnalysis: analysis,
        sentiment: analysis.sentiment || 'NEUTRAL',
        activityLevel: analysis.activityLevel || 'MODERATE',
        riskLevel: analysis.riskLevel || 'MEDIUM',
        status: 'APPROVED', // Auto-approve after analysis
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        aiTrustScore: updatedProject.aiTrustScore,
        status: updatedProject.status,
      },
      analysis,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze project' },
      { status: 500 }
    );
  }
}
