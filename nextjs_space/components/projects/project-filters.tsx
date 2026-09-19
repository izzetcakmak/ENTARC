'use client';

// ProjectFilters Component - Filter and sort controls for discovery
// Provides filtering by trust score, sentiment, activity, and category

import { useEntarcStore } from '@/store/use-entarc-store';
import { GlassCard } from '@/components/shared/glass-card';
import type { ProjectCategory, SentimentLabel, ActivityLevel, SortOption } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Filter,
  SortDesc,
  Shield,
  MessageCircle,
  Activity,
  Folder,
  ChevronDown,
  X,
} from 'lucide-react';
import { useState } from 'react';

const categories: (ProjectCategory | 'all')[] = [
  'all',
  'DeFi',
  'Infrastructure',
  'Gaming',
  'NFT',
  'DAO',
  'AI/ML',
  'Privacy',
  'Social',
];

const sentiments: (SentimentLabel | 'all')[] = ['all', 'positive', 'neutral', 'negative'];

const activityLevels: ActivityLevel[] = ['all', 'low', 'medium', 'high'];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'trustScore', label: 'Trust Score' },
  { value: 'activity', label: 'Activity' },
  { value: 'valuation', label: 'Valuation' },
  { value: 'roi', label: 'ROI' },
];

export function ProjectFilters() {
  const { filters, sortBy, sortOrder, setFilters, setSortBy, toggleSortOrder } =
    useEntarcStore();
  const [expanded, setExpanded] = useState(false);

  const activeFilterCount = [
    filters?.minTrustScore && filters.minTrustScore > 0,
    filters?.sentimentType && filters.sentimentType !== 'all',
    filters?.activityLevel && filters.activityLevel !== 'all',
    filters?.category && filters.category !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      minTrustScore: 0,
      sentimentType: 'all',
      activityLevel: 'all',
      category: 'all',
    });
  };

  return (
    <GlassCard padding="sm">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2',
            'text-sm font-medium transition-colors',
            expanded ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>

        {/* Right: Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={cn(
              'rounded-lg border border-slate-700/50 bg-slate-800/50',
              'px-3 py-2 text-sm text-white',
              'focus:border-cyan-500/50 focus:outline-none'
            )}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleSortOrder}
            className={cn(
              'flex items-center justify-center rounded-lg p-2',
              'bg-slate-800/50 text-slate-300 transition-colors hover:bg-slate-800'
            )}
            aria-label="Toggle sort order"
          >
            <SortDesc
              className={cn(
                'h-4 w-4 transition-transform',
                sortOrder === 'asc' && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {/* Expanded Filter Options */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-700/30 pt-4">
          {/* Trust Score Slider */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Shield className="h-4 w-4" />
              Min Trust Score: {filters?.minTrustScore ?? 0}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters?.minTrustScore ?? 0}
              onChange={(e) => setFilters({ minTrustScore: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <MessageCircle className="h-4 w-4" />
              Sentiment
            </label>
            <div className="flex flex-wrap gap-2">
              {sentiments.map((sentiment) => (
                <button
                  key={sentiment}
                  onClick={() => setFilters({ sentimentType: sentiment })}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm capitalize transition-colors',
                    filters?.sentimentType === sentiment
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  )}
                >
                  {sentiment === 'all' ? 'All' : sentiment}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Activity className="h-4 w-4" />
              Activity Level
            </label>
            <div className="flex flex-wrap gap-2">
              {activityLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setFilters({ activityLevel: level })}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm capitalize transition-colors',
                    filters?.activityLevel === level
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  )}
                >
                  {level === 'all' ? 'All' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Folder className="h-4 w-4" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilters({ category: category })}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                    filters?.category === category
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  )}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-red-400 transition-colors hover:text-red-300"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
}
