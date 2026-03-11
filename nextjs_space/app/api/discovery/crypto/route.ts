// Real Crypto Project Discovery API
// Fetches trending and new crypto projects from CoinMarketCap
// SECURITY: API key is only used server-side

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoinMarketCapKey } from '@/lib/api-keys';

export const dynamic = 'force-dynamic';

const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com';

interface CMCProject {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  date_added: string;
  tags: string[];
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  } | null;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
    };
  };
}

async function fetchFromCMC(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const apiKey = getCoinMarketCapKey();
  if (!apiKey) {
    throw new Error('CoinMarketCap API key not configured');
  }

  const url = new URL(`${CMC_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
      'Accept': 'application/json',
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`CMC API error: ${response.status}`);
  }

  return response.json();
}

function transformToProject(cmcData: CMCProject) {
  const quote = cmcData.quote.USD;
  const daysSinceAdded = Math.floor(
    (Date.now() - new Date(cmcData.date_added).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate trust score based on various factors
  let trustScore = 50; // Base score
  
  // Market cap factor (higher = more established)
  if (quote.market_cap > 1_000_000_000) trustScore += 20;
  else if (quote.market_cap > 100_000_000) trustScore += 15;
  else if (quote.market_cap > 10_000_000) trustScore += 10;
  else if (quote.market_cap > 1_000_000) trustScore += 5;
  
  // Volume factor (higher = more active)
  if (quote.volume_24h > 100_000_000) trustScore += 10;
  else if (quote.volume_24h > 10_000_000) trustScore += 5;
  
  // Age factor (older = more established)
  if (daysSinceAdded > 365) trustScore += 10;
  else if (daysSinceAdded > 180) trustScore += 5;
  else if (daysSinceAdded < 30) trustScore -= 10; // New projects are riskier
  
  // Performance factor
  if (quote.percent_change_7d > 0) trustScore += 5;
  if (quote.percent_change_30d > 0) trustScore += 5;
  
  // Clamp score between 0 and 100
  trustScore = Math.max(0, Math.min(100, trustScore));
  
  // Determine category based on tags
  let category: 'DeFi' | 'Infrastructure' | 'Gaming' | 'AI/ML' | 'NFT' | 'Social' = 'Infrastructure';
  const tags = cmcData.tags.map(t => t.toLowerCase());
  
  if (tags.some(t => t.includes('defi') || t.includes('decentralized-finance'))) category = 'DeFi';
  else if (tags.some(t => t.includes('gaming') || t.includes('play-to-earn'))) category = 'Gaming';
  else if (tags.some(t => t.includes('ai') || t.includes('artificial-intelligence'))) category = 'AI/ML';
  else if (tags.some(t => t.includes('nft') || t.includes('collectibles'))) category = 'NFT';
  else if (tags.some(t => t.includes('social') || t.includes('metaverse'))) category = 'Social';
  
  // Determine sentiment based on price changes
  let sentiment: 'Bullish' | 'Neutral' | 'Bearish' = 'Neutral';
  if (quote.percent_change_7d > 10) sentiment = 'Bullish';
  else if (quote.percent_change_7d < -10) sentiment = 'Bearish';
  
  return {
    id: `cmc-${cmcData.id}`,
    name: cmcData.name,
    symbol: cmcData.symbol,
    slug: cmcData.slug,
    tagline: `${cmcData.symbol} - Rank #${cmcData.cmc_rank}`,
    description: `${cmcData.name} is a cryptocurrency ranked #${cmcData.cmc_rank} by market cap.`,
    logoEmoji: '🪙',
    category,
    trustScore,
    sentiment,
    activityLevel: quote.volume_24h > 10_000_000 ? 'High' : quote.volume_24h > 1_000_000 ? 'Moderate' : 'Low',
    metrics: {
      marketCap: quote.market_cap,
      volume24h: quote.volume_24h,
      price: quote.price,
      priceChange24h: quote.percent_change_24h,
      priceChange7d: quote.percent_change_7d,
      priceChange30d: quote.percent_change_30d,
      circulatingSupply: cmcData.circulating_supply,
      totalSupply: cmcData.total_supply,
      rank: cmcData.cmc_rank,
    },
    platform: cmcData.platform ? {
      name: cmcData.platform.name,
      symbol: cmcData.platform.symbol,
      tokenAddress: cmcData.platform.token_address,
    } : null,
    tags: cmcData.tags,
    dateAdded: cmcData.date_added,
    source: 'coinmarketcap',
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
    const type = searchParams.get('type') || 'trending'; // trending, new, gainers
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let data;
    
    // Note: Free tier CMC API only supports 'market_cap' sort
    // We fetch by market_cap and then sort/filter client-side
    switch (type) {
      case 'new':
        // Get latest listings and sort by date_added
        data = await fetchFromCMC('/v1/cryptocurrency/listings/latest', {
          start: '1',
          limit: '100',
          sort: 'market_cap',
          sort_dir: 'desc',
          convert: 'USD',
        });
        // Sort by date_added (newest first)
        if (data.data) {
          data.data = data.data
            .sort((a: CMCProject, b: CMCProject) => 
              new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
            )
            .slice(0, limit);
        }
        break;
        
      case 'gainers':
        // Get top coins and filter for gainers
        data = await fetchFromCMC('/v1/cryptocurrency/listings/latest', {
          start: '1',
          limit: '100',
          sort: 'market_cap',
          sort_dir: 'desc',
          convert: 'USD',
        });
        // Filter to gainers with significant volume
        if (data.data) {
          data.data = data.data
            .filter((p: CMCProject) => 
              p.quote.USD.percent_change_24h > 0 && 
              p.quote.USD.volume_24h > 100_000
            )
            .sort((a: CMCProject, b: CMCProject) => 
              b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h
            )
            .slice(0, limit);
        }
        break;
        
      case 'trending':
      default:
        // Get top by market cap (most reliable for free tier)
        data = await fetchFromCMC('/v1/cryptocurrency/listings/latest', {
          start: '1',
          limit: limit.toString(),
          sort: 'market_cap',
          sort_dir: 'desc',
          convert: 'USD',
        });
        break;
    }

    if (!data.data) {
      return NextResponse.json({ projects: [], total: 0 });
    }

    const projects = data.data.map(transformToProject);

    return NextResponse.json({
      projects,
      total: projects.length,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Discovery API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
