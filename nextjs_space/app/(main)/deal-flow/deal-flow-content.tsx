'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Flame,
  TrendingUp,
  Star,
  Clock,
  Filter,
  ExternalLink,
  Github,
  Globe,
  Zap,
  Shield,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Users,
  GitCommit,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  ArrowRight,
  Activity,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface Deal {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  stage: string;
  trustScore: number;
  matchScore: number;
  matchReasons: string[];
  sentiment: string;
  activityLevel: string;
  trendingScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  github: { stars: number; commits30d: number; contributors: number; url: string };
  social: { mentions: number; sentiment: number; growth7d: number };
  funding: { raised: number; target: number; backers: number };
  tags: string[];
  signals: { github: number; social: number; onchain: number; market: number; sentiment: number };
  highlights: string[];
  contact: { github?: string; website?: string };
  addedAt: string;
  hotDeal: boolean;
}

interface Summary {
  totalDeals: number;
  hotDeals: number;
  avgTrustScore: number;
  topCategory: string;
  lastUpdated: string;
}

const SECTORS = ['AI/ML', 'Infrastructure', 'DeFi', 'Payments', 'Governance', 'Security', 'NFT', 'Social'];
const SORT_OPTIONS = [
  { value: 'match', label: 'Best Match', icon: Target },
  { value: 'trust', label: 'Trust Score', icon: ShieldCheck },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'newest', label: 'Newest', icon: Clock },
];

function SignalBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-8 text-right">{value}</span>
    </div>
  );
}

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const riskColor = deal.riskLevel === 'Low' ? 'text-emerald-400' : deal.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400';
  const riskBg = deal.riskLevel === 'Low' ? 'bg-emerald-400/10' : deal.riskLevel === 'Medium' ? 'bg-amber-400/10' : 'bg-red-400/10';
  const trustColor = deal.trustScore >= 85 ? 'text-emerald-400' : deal.trustScore >= 75 ? 'text-cyan-400' : 'text-amber-400';
  const trustBg = deal.trustScore >= 85 ? 'bg-emerald-400/10 border-emerald-400/20' : deal.trustScore >= 75 ? 'bg-cyan-400/10 border-cyan-400/20' : 'bg-amber-400/10 border-amber-400/20';

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <GlassCard hover className="relative overflow-hidden">
        {/* Hot Deal Badge */}
        {deal.hotDeal && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
            <Flame className="h-3 w-3 text-orange-400" />
            <span className="text-xs font-bold text-orange-400">HOT</span>
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Match Score Circle */}
            <div className="relative flex-shrink-0">
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center border',
                trustBg
              )}>
                <span className={cn('text-lg font-bold', trustColor)}>{deal.trustScore}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-violet-500/20 border border-violet-500/30">
                <span className="text-[10px] font-bold text-violet-400">{deal.matchScore}%</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate">{deal.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-xs font-medium text-cyan-400 shrink-0">
                  {deal.stage}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{deal.tagline}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-xs text-slate-300">
                  {deal.category}
                </span>
                <span className={cn('px-2 py-0.5 rounded-md text-xs', riskBg, riskColor)}>
                  {deal.riskLevel} Risk
                </span>
                {deal.activityLevel === 'High' && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-400/10 text-xs text-emerald-400 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match Reasons */}
          {deal.matchReasons.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {deal.matchReasons.slice(0, 3).map((reason, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  {reason}
                </span>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <GitCommit className="h-3 w-3" />
              </div>
              <span className="text-sm font-bold text-white">{deal.github.commits30d}</span>
              <p className="text-[10px] text-slate-500">Commits/30d</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <Star className="h-3 w-3" />
              </div>
              <span className="text-sm font-bold text-white">{deal.github.stars}</span>
              <p className="text-[10px] text-slate-500">Stars</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <MessageCircle className="h-3 w-3" />
              </div>
              <span className="text-sm font-bold text-white">{deal.social.mentions}</span>
              <p className="text-[10px] text-slate-500">Mentions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                <TrendingUp className="h-3 w-3" />
              </div>
              <span className="text-sm font-bold text-white">+{deal.social.growth7d}%</span>
              <p className="text-[10px] text-slate-500">7d Growth</p>
            </div>
          </div>

          {/* Signal Bars */}
          <div className="space-y-1.5 mb-4">
            <SignalBar label="GitHub" value={deal.signals.github} color="bg-emerald-400" />
            <SignalBar label="Social" value={deal.signals.social} color="bg-cyan-400" />
            <SignalBar label="On-chain" value={deal.signals.onchain} color="bg-violet-400" />
            <SignalBar label="Market" value={deal.signals.market} color="bg-amber-400" />
            <SignalBar label="Sentiment" value={deal.signals.sentiment} color="bg-pink-400" />
          </div>

          {/* Expandable Details */}
          {expanded && (
            <div className="space-y-3 mb-4 animate-fade-in">
              <p className="text-sm text-slate-300 leading-relaxed">{deal.description}</p>

              {/* Highlights */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Key Highlights</h4>
                <div className="space-y-1">
                  {deal.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <Zap className="h-3 w-3 text-cyan-400 shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Funding */}
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-slate-500">Target Raise</span>
                  <p className="text-sm font-bold text-white">${(deal.funding.target / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Contributors</span>
                  <p className="text-sm font-bold text-white">{deal.github.contributors}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Sentiment</span>
                  <p className="text-sm font-bold text-white">{(deal.social.sentiment * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Less' : 'Details'}
            </button>

            <div className="flex items-center gap-2">
              {deal.contact.github && (
                <a
                  href={deal.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {deal.contact.website && (
                <a
                  href={deal.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              <Link
                href={`/autonomous-agent`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-xs font-medium"
              >
                Analyze <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default function DealFlowContent() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['AI/ML', 'Infrastructure', 'DeFi', 'Payments']);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sectors: selectedSectors.join(','),
        risk: riskTolerance,
        sort: sortBy,
        minScore: '70',
      });
      const res = await fetch(`/api/deal-flow?${params}`);
      const data = await res.json();
      if (data.success) {
        setDeals(data.deals);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSectors, riskTolerance, sortBy]);

  useEffect(() => {
    if (mounted) fetchDeals();
  }, [mounted, fetchDeals]);

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Deal Flow Engine</h1>
            <p className="text-sm text-slate-400">AI-powered recommendation pipeline for high-potential Web3 startups</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard padding="sm">
            <div className="flex items-center gap-3 p-2">
              <div className="p-2 rounded-lg bg-cyan-400/10">
                <Layers className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Deals</p>
                <p className="text-xl font-bold text-white">{summary.totalDeals}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard padding="sm">
            <div className="flex items-center gap-3 p-2">
              <div className="p-2 rounded-lg bg-orange-400/10">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Hot Deals</p>
                <p className="text-xl font-bold text-orange-400">{summary.hotDeals}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard padding="sm">
            <div className="flex items-center gap-3 p-2">
              <div className="p-2 rounded-lg bg-emerald-400/10">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Avg Trust</p>
                <p className="text-xl font-bold text-emerald-400">{summary.avgTrustScore}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard padding="sm">
            <div className="flex items-center gap-3 p-2">
              <div className="p-2 rounded-lg bg-violet-400/10">
                <BarChart3 className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Top Sector</p>
                <p className="text-lg font-bold text-white">{summary.topCategory}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Investor Preferences Panel */}
      <GlassCard>
        <div className="p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-white">Investor Preferences</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-xs text-violet-400">
                {selectedSectors.length} sectors
              </span>
            </div>
            {showFilters ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {showFilters && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {/* Sectors */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Preferred Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map(sector => (
                    <button
                      key={sector}
                      onClick={() => toggleSector(sector)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        selectedSectors.includes(sector)
                          ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                          : 'bg-slate-700/50 border border-slate-600/30 text-slate-400 hover:text-white'
                      )}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Risk Tolerance</label>
                <div className="flex gap-2">
                  {(['conservative', 'moderate', 'aggressive'] as const).map(risk => (
                    <button
                      key={risk}
                      onClick={() => setRiskTolerance(risk)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize',
                        riskTolerance === risk
                          ? risk === 'conservative' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                            : risk === 'moderate' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                            : 'bg-red-500/20 border border-red-500/40 text-red-300'
                          : 'bg-slate-700/50 border border-slate-600/30 text-slate-400 hover:text-white'
                      )}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchDeals}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Apply & Refresh
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Sort Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                sortBy === opt.value
                  ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                  : 'bg-slate-800/50 border border-slate-700/30 text-slate-400 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Deal Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <GlassCard key={i}>
              <div className="p-5 space-y-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-700/50 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-700/50 rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-12 bg-slate-700/50 rounded animate-pulse" />
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(j => (
                    <div key={j} className="h-2 bg-slate-700/50 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <GlassCard>
          <div className="p-12 text-center">
            <Target className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Deals Found</h3>
            <p className="text-sm text-slate-400 mb-4">Try adjusting your preferences or lowering the minimum trust score.</p>
            <button
              onClick={() => {
                setSelectedSectors(SECTORS);
                setRiskTolerance('aggressive');
              }}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {deals.map((deal, index) => (
            <DealCard key={deal.id} deal={deal} index={index} />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center py-4">
        <p className="text-xs text-slate-500">
          Deal Flow Engine analyzes {deals.length} projects across 5 signal sources.
          Recommendations are AI-generated and updated in real-time.
        </p>
      </div>
    </div>
  );
}
