'use client';

// TrustScoreBadge Component - Displays AI Trust Score with color coding
// Visual indicator of project trustworthiness

import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function TrustScoreBadge({
  score,
  size = 'md',
  showLabel = true,
}: TrustScoreBadgeProps) {
  const safeScore = score ?? 0;
  
  // Determine color and icon based on score
  let colorClass: string;
  let bgClass: string;
  let Icon: typeof Shield;

  if (safeScore >= 80) {
    colorClass = 'text-emerald-400';
    bgClass = 'bg-emerald-500/10 border-emerald-500/30';
    Icon = ShieldCheck;
  } else if (safeScore >= 60) {
    colorClass = 'text-amber-400';
    bgClass = 'bg-amber-500/10 border-amber-500/30';
    Icon = Shield;
  } else {
    colorClass = 'text-red-400';
    bgClass = 'bg-red-500/10 border-red-500/30';
    Icon = ShieldAlert;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        sizeClasses[size],
        bgClass,
        colorClass
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{safeScore}</span>
      {showLabel && <span className="opacity-70">AI Score</span>}
    </div>
  );
}
