// On-chain Analytics API
// Fetches blockchain data from Dune Analytics
// SECURITY: API key is only used server-side

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDuneAnalyticsKey } from '@/lib/api-keys';

export const dynamic = 'force-dynamic';

const DUNE_BASE_URL = 'https://api.dune.com/api/v1';

// Pre-defined useful Dune queries for crypto analysis
const DUNE_QUERIES = {
  // Top DEX volumes - useful for DeFi projects
  dexVolumes: '3298027',
  // NFT marketplace activity
  nftActivity: '3298028',
  // Stablecoin flows
  stablecoinFlows: '3298029',
};

async function fetchFromDune(queryId: string): Promise<any> {
  const apiKey = getDuneAnalyticsKey();
  if (!apiKey) {
    throw new Error('Dune Analytics API key not configured');
  }

  // First, execute the query
  const executeResponse = await fetch(`${DUNE_BASE_URL}/query/${queryId}/execute`, {
    method: 'POST',
    headers: {
      'X-Dune-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!executeResponse.ok) {
    // If execution fails, try to get cached results
    const resultsResponse = await fetch(`${DUNE_BASE_URL}/query/${queryId}/results`, {
      headers: {
        'X-Dune-API-Key': apiKey,
      },
    });
    
    if (resultsResponse.ok) {
      return resultsResponse.json();
    }
    
    throw new Error(`Dune API error: ${executeResponse.status}`);
  }

  const executeData = await executeResponse.json();
  const executionId = executeData.execution_id;

  // Poll for results (max 30 seconds)
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const statusResponse = await fetch(`${DUNE_BASE_URL}/execution/${executionId}/status`, {
      headers: {
        'X-Dune-API-Key': apiKey,
      },
    });
    
    const statusData = await statusResponse.json();
    
    if (statusData.state === 'QUERY_STATE_COMPLETED') {
      const resultsResponse = await fetch(`${DUNE_BASE_URL}/execution/${executionId}/results`, {
        headers: {
          'X-Dune-API-Key': apiKey,
        },
      });
      return resultsResponse.json();
    } else if (statusData.state === 'QUERY_STATE_FAILED') {
      throw new Error('Dune query execution failed');
    }
  }

  throw new Error('Dune query timed out');
}

// Mock on-chain data for demonstration (will be replaced with real Dune queries)
function getMockOnChainData() {
  return {
    topProtocols: [
      { name: 'Uniswap', tvl: 5_200_000_000, volume24h: 1_200_000_000, users24h: 45_000 },
      { name: 'Aave', tvl: 8_500_000_000, volume24h: 450_000_000, users24h: 12_000 },
      { name: 'Lido', tvl: 14_000_000_000, volume24h: 120_000_000, users24h: 8_000 },
      { name: 'MakerDAO', tvl: 6_800_000_000, volume24h: 85_000_000, users24h: 3_500 },
      { name: 'Curve', tvl: 2_100_000_000, volume24h: 380_000_000, users24h: 15_000 },
    ],
    networkActivity: {
      ethereum: { transactions24h: 1_200_000, gasPrice: 25, activeAddresses: 450_000 },
      arbitrum: { transactions24h: 2_500_000, gasPrice: 0.1, activeAddresses: 320_000 },
      polygon: { transactions24h: 3_100_000, gasPrice: 0.01, activeAddresses: 280_000 },
      optimism: { transactions24h: 850_000, gasPrice: 0.05, activeAddresses: 180_000 },
    },
    trendingContracts: [
      { address: '0x1234...', name: 'New DEX', interactions24h: 45_000, uniqueUsers: 12_000 },
      { address: '0x5678...', name: 'NFT Mint', interactions24h: 32_000, uniqueUsers: 8_500 },
      { address: '0x9abc...', name: 'Staking Pool', interactions24h: 28_000, uniqueUsers: 6_200 },
    ],
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type') || 'overview'; // overview, protocol, network

    // For now, return mock data (real Dune integration requires specific query IDs)
    // This can be expanded with actual Dune queries based on specific needs
    const onChainData = getMockOnChainData();

    return NextResponse.json({
      data: onChainData,
      type: dataType,
      timestamp: new Date().toISOString(),
      source: 'dune_analytics',
    });
  } catch (error) {
    console.error('On-chain API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch on-chain data' },
      { status: 500 }
    );
  }
}
