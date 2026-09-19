export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAgentPolicy } from '@/lib/agent-policy';
import { hasGemini, geminiModel } from '@/lib/gemini';
import { NETWORK_LABEL } from '@/lib/arc-network';

/**
 * Public, read-only: the rules the agent operates under.
 * Deliberately touches neither Circle nor the database, so the public
 * "How it works" page can show live limits without any authenticated call.
 */
export async function GET() {
  return NextResponse.json({
    network: NETWORK_LABEL,
    engine: hasGemini() ? `Gemini · ${geminiModel()}` : 'fallback LLM',
    policy: getAgentPolicy(),
  });
}
