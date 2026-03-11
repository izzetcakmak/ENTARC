'use client';

// RealDiscoveryGrid - Fetches and displays real projects from APIs
// Sources: CoinMarketCap, GitHub, Dune Analytics

import { useState, useEffect } from 'react';
import { RealProjectCard } from './real-project-card';
import { GlassCard } from '@/components/shared/glass-card';
import { StateBlock } from '@/components/shared/state-block';
import { CardSkeleton } from '@/components/shared/app-skeleton';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Sparkles,
  Clock,
  Github,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

type DataSource = 'arc-ecosystem' | 'github';
type ArcType = 'pre-tge' | 'new-builders' | 'rising';

interface RealDiscoveryGridProps {
  initialSource?: DataSource;
}

export function RealDiscoveryGrid({ initialSource = 'arc-ecosystem' }: RealDiscoveryGridProps) {
  const [source, setSource] = useState<DataSource>(initialSource);
  const [arcType, setArcType] = useState<ArcType>('pre-tge');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      
      if (source === 'arc-ecosystem') {
        endpoint = `/api/discovery/arc-ecosystem?type=${arcType}&limit=20`;
      } else if (source === 'github') {
        endpoint = `/api/discovery/github?query=web3+agent&sort=stars&limit=20`;
      }

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [source, arcType]);

  const sourceButtons = [
    { id: 'arc-ecosystem' as DataSource, label: 'Arc Ecosystem', icon: Sparkles },
    { id: 'github' as DataSource, label: 'GitHub Builders', icon: Github },
  ];

  const arcTypeButtons = [
    { id: 'pre-tge' as ArcType, label: 'Pre-TGE', icon: Clock },
    { id: 'new-builders' as ArcType, label: 'New Builders', icon: Sparkles },
    { id: 'rising' as ArcType, label: 'Rising Stars', icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      {/* Source Selector */}
      <GlassCard padding="md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Data Source Tabs */}
          <div className="flex gap-2">
            {sourceButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  onClick={() => setSource(btn.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    source === btn.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* Arc Type Filter (only for arc-ecosystem source) */}
          {source === 'arc-ecosystem' && (
            <div className="flex gap-2">
              {arcTypeButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setArcType(btn.id)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      arcType === btn.id
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-slate-800/30 text-slate-500 hover:text-slate-300'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {btn.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchProjects}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
              'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white',
              'transition-all disabled:opacity-50'
            )}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="mt-2 text-xs text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </GlassCard>

      {/* Error State */}
      {error && (
        <GlassCard padding="md">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Failed to load projects</p>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
            <button
              onClick={fetchProjects}
              className="ml-auto px-3 py-1 rounded bg-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/30"
            >
              Retry
            </button>
          </div>
        </GlassCard>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <RealProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <StateBlock
          type="empty"
          title="No projects found"
          message="Try changing your filters or check back later"
        />
      )}

      {/* Data Source Attribution */}
      <div className="text-center text-xs text-slate-600">
        {source === 'arc-ecosystem' 
          ? 'Pre-TGE projects on Arc Network • Early-stage investment opportunities'
          : 'GitHub builders in Web3 space • Developer activity tracking'
        }
      </div>
    </div>
  );
}
