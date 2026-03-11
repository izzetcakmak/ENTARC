'use client';

// DiscoveryContent - Client component for discovery page
// Handles project filtering, sorting, and display

import { ProjectGrid } from '@/components/projects/project-grid';
import { ProjectFilters } from '@/components/projects/project-filters';
import { GlassCard } from '@/components/shared/glass-card';
import { useEntarcStore } from '@/store/use-entarc-store';
import { useEffect, useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';

export function DiscoveryContent() {
  const [mounted, setMounted] = useState(false);
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
                Explore early-stage projects with AI-powered analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/50 px-4 py-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-white">{projectCount}</span> projects found
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Filters */}
      <ProjectFilters />

      {/* Project Grid */}
      <ProjectGrid />
    </div>
  );
}
