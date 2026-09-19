'use client';

// DiscoveryContent - Client component for discovery page
// Now supports both mock data and real API data

import { ProjectGrid } from '@/components/projects/project-grid';
import { ProjectFilters } from '@/components/projects/project-filters';
import { RealDiscoveryGrid } from '@/components/discovery/real-discovery-grid';
import { GlassCard } from '@/components/shared/glass-card';
import { useEntarcStore } from '@/store/use-entarc-store';
import { useEffect, useState } from 'react';
import { Compass, Sparkles, Globe, Database, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'real' | 'portfolio';

export function DiscoveryContent() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('real');
  const getFilteredProjects = useEntarcStore((state) => state.getFilteredProjects);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const projectCount = getFilteredProjects()?.length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <GlassCard padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
              <Compass className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Project Discovery</h1>
              <p className="text-slate-400">
                {viewMode === 'real' 
                  ? 'Pre-TGE projects building on Arc Network'
                  : 'Explore early-stage projects with AI-powered analysis'
                }
              </p>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('real')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'real'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              )}
            >
              <Zap className="h-4 w-4" />
              Arc Ecosystem
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-400">
                PRE-TGE
              </span>
            </button>
            <button
              onClick={() => setViewMode('portfolio')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'portfolio'
                  ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              )}
            >
              <Database className="h-4 w-4" />
              Portfolio Projects
              <span className="text-xs text-slate-500">({projectCount})</span>
            </button>
          </div>
        </div>

        {/* Info Banner for Arc Ecosystem */}
        {viewMode === 'real' && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <Zap className="h-5 w-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm text-amber-300">
                <span className="font-semibold">Pre-TGE Discovery</span> — Early-stage projects building on Arc Network before token launch
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Invest early via milestone-based streaming • No token yet = Maximum upside potential
              </p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Content based on view mode */}
      {viewMode === 'real' ? (
        <RealDiscoveryGrid />
      ) : (
        <>
          {/* Filters */}
          <ProjectFilters />
          {/* Project Grid */}
          <ProjectGrid />
        </>
      )}
    </div>
  );
}
