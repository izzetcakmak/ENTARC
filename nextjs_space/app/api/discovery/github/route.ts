// GitHub Project Discovery API
// Fetches trending crypto/blockchain repos from GitHub
// Note: Uses public API (no key needed for basic requests, but rate limited)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const GITHUB_API_URL = 'https://api.github.com';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: {
    login: string;
    avatar_url: string;
    type: string;
  };
  license: {
    key: string;
    name: string;
  } | null;
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

async function fetchFromGitHub(endpoint: string): Promise<any> {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ENTARC-Discovery',
    },
    next: { revalidate: 600 }, // Cache for 10 minutes
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

function calculateActivityScore(repo: GitHubRepo): number {
  const now = new Date();
  const lastPush = new Date(repo.pushed_at);
  const daysSinceUpdate = Math.floor((now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24));
  
  let score = 50; // Base score
  
  // Stars factor
  if (repo.stargazers_count > 10000) score += 25;
  else if (repo.stargazers_count > 1000) score += 20;
  else if (repo.stargazers_count > 100) score += 10;
  else if (repo.stargazers_count > 10) score += 5;
  
  // Forks factor (indicates community involvement)
  if (repo.forks_count > 1000) score += 15;
  else if (repo.forks_count > 100) score += 10;
  else if (repo.forks_count > 10) score += 5;
  
  // Recent activity factor
  if (daysSinceUpdate < 7) score += 15;
  else if (daysSinceUpdate < 30) score += 10;
  else if (daysSinceUpdate < 90) score += 5;
  else if (daysSinceUpdate > 365) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}

function transformToProject(repo: GitHubRepo) {
  const activityScore = calculateActivityScore(repo);
  const now = new Date();
  const lastPush = new Date(repo.pushed_at);
  const daysSinceUpdate = Math.floor((now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine category based on topics and language
  let category: 'DeFi' | 'Infrastructure' | 'Gaming' | 'AI/ML' | 'NFT' | 'Social' = 'Infrastructure';
  const topics = repo.topics.map(t => t.toLowerCase());
  
  if (topics.some(t => t.includes('defi') || t.includes('swap') || t.includes('amm'))) {
    category = 'DeFi';
  } else if (topics.some(t => t.includes('game') || t.includes('gaming'))) {
    category = 'Gaming';
  } else if (topics.some(t => t.includes('ai') || t.includes('ml') || t.includes('machine-learning'))) {
    category = 'AI/ML';
  } else if (topics.some(t => t.includes('nft'))) {
    category = 'NFT';
  } else if (topics.some(t => t.includes('social') || t.includes('dao'))) {
    category = 'Social';
  }
  
  // Determine activity level
  let activityLevel: 'High' | 'Moderate' | 'Low' = 'Low';
  if (daysSinceUpdate < 7 && repo.stargazers_count > 100) activityLevel = 'High';
  else if (daysSinceUpdate < 30) activityLevel = 'Moderate';
  
  return {
    id: `gh-${repo.id}`,
    name: repo.name,
    fullName: repo.full_name,
    tagline: repo.description || `${repo.owner.login}/${repo.name}`,
    description: repo.description || 'No description available',
    logoEmoji: '💻',
    category,
    trustScore: activityScore,
    sentiment: activityScore > 70 ? 'Bullish' : activityScore > 40 ? 'Neutral' : 'Bearish',
    activityLevel,
    github: {
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count,
      language: repo.language,
      topics: repo.topics,
      lastPush: repo.pushed_at,
      createdAt: repo.created_at,
      license: repo.license?.name || 'Unknown',
    },
    owner: {
      name: repo.owner.login,
      avatar: repo.owner.avatar_url,
      type: repo.owner.type,
    },
    source: 'github',
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    // Public endpoint - no auth required for GitHub discovery

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'blockchain';
    const sort = searchParams.get('sort') || 'stars'; // stars, forks, updated
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 30);

    // Search for blockchain/crypto related repos
    const searchQueries = [
      `${query} cryptocurrency`,
      `${query} blockchain`,
      `${query} defi`,
      `${query} web3`,
    ];
    
    // Pick one query to avoid rate limiting
    const selectedQuery = searchQueries[0];
    
    const data: GitHubSearchResponse = await fetchFromGitHub(
      `/search/repositories?q=${encodeURIComponent(selectedQuery)}&sort=${sort}&order=desc&per_page=${limit}`
    );

    // Sort by trustScore (highest first)
    const projects = data.items
      .map(transformToProject)
      .sort((a: any, b: any) => b.trustScore - a.trustScore);

    return NextResponse.json({
      projects,
      total: data.total_count,
      query: selectedQuery,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub projects' },
      { status: 500 }
    );
  }
}
