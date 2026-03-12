'use client';

// StateBlock Component - Reusable state display (loading, empty, error)
// Shows appropriate UI state with icons and messages

import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, Inbox, SearchX } from 'lucide-react';

type StateType = 'loading' | 'empty' | 'error' | 'no-results';

interface StateBlockProps {
  type: StateType;
  title?: string;
  message?: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const stateConfig = {
  loading: {
    icon: Loader2,
    defaultTitle: 'Loading...',
    defaultMessage: 'Please wait while we fetch your data',
    iconClass: 'animate-spin text-cyan-400',
  },
  empty: {
    icon: Inbox,
    defaultTitle: 'No Data',
    defaultMessage: 'There is nothing to display here yet',
    iconClass: 'text-slate-500',
  },
  error: {
    icon: AlertCircle,
    defaultTitle: 'Error',
    defaultMessage: 'Something went wrong. Please try again.',
    iconClass: 'text-red-400',
  },
  'no-results': {
    icon: SearchX,
    defaultTitle: 'No Results',
    defaultMessage: 'No items match your current filters',
    iconClass: 'text-amber-400',
  },
};

export function StateBlock({
  type,
  title,
  message,
  className,
  action,
}: StateBlockProps) {
  const config = stateConfig[type] ?? stateConfig.empty;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-slate-800/50 p-4">
        <Icon className={cn('h-8 w-8', config.iconClass)} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-200">
        {title ?? config.defaultTitle}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-slate-400">
        {message ?? config.defaultMessage}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-cyan-600/20 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-600/30"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
