export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Circle Testnet Faucet — Request test USDC + native tokens on ARC-TESTNET
 * API: POST https://api.circle.com/v1/faucet/drips
 * Supports: ARC-TESTNET, ETH-SEPOLIA, AVAX-FUJI, ARB-SEPOLIA, BASE-SEPOLIA, etc.
 * Limit: 20 USDC per address per blockchain every 2 hours
 */

const CIRCLE_FAUCET_URL = 'https://api.circle.com/v1/faucet/drips';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { address, blockchain = 'ARC-TESTNET', usdc = true, native = true } = body;

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Circle API key not configured' }, { status: 500 });
    }

    console.log(`[Circle Faucet] Requesting tokens for ${address} on ${blockchain}`);

    const faucetRes = await fetch(CIRCLE_FAUCET_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        blockchain,
        usdc,
        native,
        eurc: false,
      }),
    });

    // Circle returns 204 No Content on success
    if (faucetRes.status === 204 || faucetRes.ok) {
      console.log(`[Circle Faucet] Success — tokens sent to ${address}`);
      return NextResponse.json({
        success: true,
        message: `Test tokens requested for ${address} on ${blockchain}`,
        details: {
          address,
          blockchain,
          usdc: usdc ? '20 USDC (testnet)' : 'not requested',
          native: native ? 'Native gas tokens' : 'not requested',
          note: 'Tokens arrive within ~30 seconds. Limit: 20 USDC every 2 hours per address.',
        },
      });
    }

    // Handle errors
    let errorData: any = {};
    try {
      errorData = await faucetRes.json();
    } catch {
      errorData = { message: `HTTP ${faucetRes.status}` };
    }

    console.error(`[Circle Faucet] Error:`, errorData);

    // If the API key doesn't support faucet, fall back with helpful message
    if (faucetRes.status === 401 || faucetRes.status === 403) {
      return NextResponse.json({
        success: false,
        error: 'Faucet API requires mainnet API key. Use the web faucet instead.',
        fallbackUrl: `https://faucet.circle.com/`,
        manualInstructions: {
          step1: 'Go to https://faucet.circle.com/',
          step2: `Paste address: ${address}`,
          step3: 'Select ARC-TESTNET',
          step4: 'Click "Request Tokens"',
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: errorData.message || 'Faucet request failed',
      code: errorData.code,
    }, { status: faucetRes.status });

  } catch (error: any) {
    console.error('[Circle Faucet] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Faucet request failed' },
      { status: 500 }
    );
  }
}
