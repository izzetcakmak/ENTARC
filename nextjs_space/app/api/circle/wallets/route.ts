export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List wallets or wallet status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getCircleClient } = await import('@/lib/circle-client');
    const client = getCircleClient();

    // List wallet sets first
    const walletSetsRes = await client.listWalletSets({});
    const walletSets = walletSetsRes.data?.walletSets || [];

    // List all wallets
    let allWallets: any[] = [];
    for (const ws of walletSets) {
      try {
        const walletsRes = await client.listWallets({ walletSetId: ws.id });
        const wallets = walletsRes.data?.wallets || [];
        allWallets = [...allWallets, ...wallets.map((w: any) => ({ ...w, walletSetName: (ws as any).name }))];
      } catch {
        // Skip failed wallet set queries
      }
    }

    return NextResponse.json({
      success: true,
      walletSets,
      wallets: allWallets,
      totalWallets: allWallets.length,
      totalWalletSets: walletSets.length,
    });
  } catch (error: any) {
    console.error('Circle wallets error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallets', success: false },
      { status: 500 }
    );
  }
}

// POST - Create a new wallet
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, walletSetName, walletSetId, blockchain } = body;

    const { getCircleClient } = await import('@/lib/circle-client');
    const client = getCircleClient();

    if (action === 'create-wallet-set') {
      const res = await client.createWalletSet({
        name: walletSetName || 'ENTARC Agent Wallet Set',
      });

      return NextResponse.json({
        success: true,
        walletSet: res.data?.walletSet,
      });
    }

    if (action === 'create-wallet') {
      if (!walletSetId) {
        return NextResponse.json({ error: 'walletSetId required' }, { status: 400 });
      }

      const res = await client.createWallets({
        walletSetId,
        blockchains: [blockchain || 'ARC-TESTNET'],
        count: 1,
        accountType: 'EOA',
      });

      return NextResponse.json({
        success: true,
        wallets: res.data?.wallets,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Circle wallet create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet', success: false },
      { status: 500 }
    );
  }
}
