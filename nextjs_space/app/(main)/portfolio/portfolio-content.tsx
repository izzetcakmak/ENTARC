'use client';

// PortfolioContent - Client component for portfolio page
// Renders portfolio summary and investment table

import { PortfolioSummary } from '@/components/portfolio/portfolio-summary';
import { PortfolioTable } from '@/components/portfolio/portfolio-table';
import { GlassCard } from '@/components/shared/glass-card';
import { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';

export function PortfolioContent() {
  const [mounted, setMounted] = useState(false);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <GlassCard padding="lg">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
            <Briefcase className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio Management</h1>
            <p className="text-slate-400">
              Track investments, manage exit strategies, and monitor performance
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Summary Cards */}
      <PortfolioSummary />

      {/* Investment Table */}
      <PortfolioTable />
    </div>
  );
}
