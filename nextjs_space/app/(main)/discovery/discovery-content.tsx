'use client';

// DiscoveryContent - Client component for discovery page
// Arc ecosystem watchlist and GitHub search, live data only

import { RealDiscoveryGrid } from '@/components/discovery/real-discovery-grid';
import { GlassCard } from '@/components/shared/glass-card';
import { Compass, FileText } from 'lucide-react';
import Link from 'next/link';

export function DiscoveryContent() {
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
                Public projects building on Arc, with live GitHub figures
              </p>
            </div>
          </div>
          <Link
            href="/deal-flow"
            className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700/50 hover:text-white"
          >
            <FileText className="h-4 w-4" />
            Submitted projects are in Deal Flow
          </Link>
        </div>
      </GlassCard>

      <RealDiscoveryGrid />
    </div>
  );
}
