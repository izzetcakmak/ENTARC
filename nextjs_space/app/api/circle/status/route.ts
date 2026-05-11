export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    const configured = !!(apiKey && entitySecret);

    // Test connectivity if configured
    let connected = false;
    if (configured) {
      try {
        const { getCircleClient } = await import('@/lib/circle-client');
        const client = getCircleClient();
        const res = await client.listWalletSets({});
        connected = true;
      } catch {
        connected = false;
      }
    }

    return NextResponse.json({
      configured,
      connected,
      features: {
        agentWallets: true,
        nanopayments: true,
        marketplace: true,
        cli: true,
        skills: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { configured: false, connected: false, error: error.message },
      { status: 500 }
    );
  }
}
