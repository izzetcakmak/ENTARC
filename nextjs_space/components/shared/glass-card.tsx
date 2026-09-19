'use client';

// GlassCard Component - Glassmorphism styled card wrapper
// Used throughout the app for the cyberpunk aesthetic

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
};

export function GlassCard({
  children,
  className,
  hover = false,
  padding = 'md',
  glow = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // Base glass effect
        'relative rounded-xl',
        'bg-slate-900/40 backdrop-blur-xl',
        'border border-slate-700/50',
        // Shadow
        'shadow-lg shadow-slate-900/20',
        // Padding
        paddingClasses[padding],
        // Hover effect
        hover && 'transition-all duration-300 hover:bg-slate-800/50 hover:border-cyan-500/30 hover:shadow-cyan-500/10',
        // Glow effect
        glow && 'ring-1 ring-cyan-500/20',
        className
      )}
    >
      {children}
    </div>
  );
}
