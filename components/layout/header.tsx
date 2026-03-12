'use client';

// Header Component - Top navigation bar
// Shows current page title, search, and user actions

import { cn } from '@/lib/utils';
import { Bell, Search, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/discovery': 'Project Discovery',
  '/portfolio': 'Portfolio Management',
  '/insights': 'AI Insights',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession() || {};

  // Get page title - handle project detail pages
  const getPageTitle = () => {
    if (pathname?.startsWith('/projects/')) {
      return 'Project Details';
    }
    return pageTitles[pathname ?? ''] ?? 'ENTARC';
  };

  const userName = session?.user?.name ?? session?.user?.email ?? 'User';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
          <p className="text-xs text-slate-500">Arc Network • Autonomous VC Agent</p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              className={cn(
                'h-10 w-64 rounded-xl border border-slate-700/50',
                'bg-slate-900/50 pl-10 pr-4',
                'text-sm text-slate-200 placeholder:text-slate-500',
                'transition-all duration-200',
                'focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25'
              )}
            />
          </div>

          {/* Notifications */}
          <button
            className={cn(
              'relative rounded-xl p-2.5',
              'text-slate-400 transition-colors',
              'hover:bg-slate-800/50 hover:text-white'
            )}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-400" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/50 py-2 pl-2 pr-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-slate-500">Investor</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
