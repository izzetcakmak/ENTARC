'use client';

// SettingsContent - Client component for settings page
// User preferences, account management, and wallet connection

import { GlassCard } from '@/components/shared/glass-card';
import { WalletConnectButton } from '@/components/wallet/wallet-connect-button';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Wallet,
  Globe,
  Save,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SettingsContent() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession() || {};
  const [notifications, setNotifications] = useState(true);
  const [streaming, setStreaming] = useState(true);

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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500/20 to-slate-600/20">
            <Settings className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">
              Manage your account and application preferences
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Wallet Connection - Full Width Priority Section */}
      <GlassCard className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Treasury Wallet</h2>
          </div>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400"
          >
            Arc Testnet Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="mb-4 text-sm text-slate-400">
          Connect your wallet to link it as the Treasury Owner on Arc Testnet. 
          This wallet will be used for managing investments and streaming payments.
        </p>
        <WalletConnectButton showBalance={true} />
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <input
                type="email"
                value={session?.user?.email ?? ''}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-slate-300"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Display Name</label>
              <input
                type="text"
                defaultValue={session?.user?.name ?? 'Entarc User'}
                className="mt-1 w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* Notification Settings */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <ToggleSetting
              label="Milestone Alerts"
              description="Get notified when milestones are completed"
              checked={notifications}
              onChange={setNotifications}
            />
            <ToggleSetting
              label="Streaming Updates"
              description="Real-time updates for fund releases"
              checked={streaming}
              onChange={setStreaming}
            />
          </div>
        </GlassCard>

        {/* Security Settings */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => alert('Password change feature coming soon!')}
              className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-left transition-colors hover:bg-slate-800"
            >
              <p className="font-medium text-white">Change Password</p>
              <p className="text-sm text-slate-400">Update your account password</p>
            </button>
            <button 
              onClick={() => alert('Two-Factor Authentication coming soon!')}
              className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-left transition-colors hover:bg-slate-800"
            >
              <p className="font-medium text-white">Two-Factor Authentication</p>
              <p className="text-sm text-slate-400">Add an extra layer of security</p>
            </button>
          </div>
        </GlassCard>

        {/* Appearance */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-pink-400" />
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Theme</label>
              <select
                defaultValue="dark"
                className="mt-1 w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="dark">Dark (Cyberpunk)</option>
                <option value="light" disabled>Light (Coming Soon)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Accent Color</label>
              <div className="mt-2 flex gap-2">
                {['bg-cyan-500', 'bg-violet-500', 'bg-emerald-500', 'bg-pink-500'].map(
                  (color) => (
                    <button
                      key={color}
                      className={cn(
                        'h-8 w-8 rounded-lg transition-transform hover:scale-110',
                        color,
                        color === 'bg-cyan-500' && 'ring-2 ring-white/30'
                      )}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => alert('Settings saved successfully!')}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-medium text-slate-900 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-cyan-500' : 'bg-slate-600'
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
            checked ? 'left-6' : 'left-1'
          )}
        />
      </button>
    </div>
  );
}
