// Arc Network Ecosystem Discovery API
// Curated list of public projects building on Arc, with live GitHub figures.
// See lib/arc-ecosystem.ts — no invented scores, votes or funding numbers.

import { NextRequest, NextResponse } from 'next/server';
import { getArcEcosystem } from '@/lib/arc-ecosystem';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required for project discovery
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const all = await getArcEcosystem();

    // Analysed projects first (by agent score), then by recent development activity.
    const projects = all
      .sort(
        (a, b) =>
          (b.trustScore ?? -1) - (a.trustScore ?? -1) ||
          (b.metrics.commits30d ?? 0) - (a.metrics.commits30d ?? 0) ||
          (b.metrics.githubStars ?? 0) - (a.metrics.githubStars ?? 0)
      )
      .slice(0, limit);

    return NextResponse.json({
      projects,
      total: projects.length,
      timestamp: new Date().toISOString(),
      source: 'github-live',
    });
  } catch (error) {
    console.error('Arc Ecosystem API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Arc ecosystem projects' },
      { status: 500 }
    );
  }
}
