'use client';

// Sidebar Component - Main navigation sidebar
// Features glassmorphism design with navigation links

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  Brain,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Discovery', href: '/discovery', icon: Compass },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'AI Insights', href: '/insights', icon: Brain },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const founderNavItems: NavItem[] = [
  { label: 'Submit Project', href: '/submit-project', icon: Zap },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen',
        'bg-slate-950/80 backdrop-blur-xl',
        'border-r border-slate-800/50',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/50 px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-white">
              ENT<span className="text-cyan-400">ARC</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3',
                'transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />
              )}
            </Link>
          );
        })}

        {/* Founder Section */}
        {!collapsed && (
          <div className="mt-4 mb-2 px-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Founder</span>
          </div>
        )}
        {founderNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3',
                'transition-all duration-200',
                isActive
                  ? 'bg-purple-500/10 text-purple-400 shadow-lg shadow-purple-500/5'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-purple-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/50 p-3">
        {/* Streaming Status */}
        <div
          className={cn(
            'mb-3 rounded-xl bg-slate-900/50 p-3',
            collapsed && 'hidden'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-slate-400">Streaming Active</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Real-time fund release</p>
        </div>

        {/* Contact & Partnerships */}
        <a
          href="https://entarc.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'mb-2 flex items-center gap-3 rounded-xl px-4 py-3',
            'text-slate-400 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400',
            collapsed && 'justify-center px-0'
          )}
        >
          <Globe className="h-5 w-5 flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium">Partnerships & Ads</span>
              <span className="text-xs text-slate-500">entarc.xyz</span>
            </div>
          )}
        </a>

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-4 py-3',
            'text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
