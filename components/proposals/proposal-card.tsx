'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface Proposal {
  id: string;
  proposedAmount: number;
  proposedROI: number | null;
  message: string | null;
  status: string;
  counterAmount: number | null;
  counterMessage: string | null;
  agreedAmount: number | null;
  expiresAt: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    logoEmoji: string;
    aiTrustScore: number | null;
  };
  investor: {
    name: string | null;
    email: string;
  };
  founder: {
    name: string | null;
    email: string;
  };
}

interface ProposalCardProps {
  proposal: Proposal;
  role: 'investor' | 'founder';
  onAction?: (proposalId: string, action: string, data?: any) => void;
}

export function ProposalCard({ proposal, role, onAction }: ProposalCardProps) {
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    if (!onAction) return;
    setIsLoading(true);
    try {
      await onAction(proposal.id, action, {
        counterAmount,
        counterMessage,
      });
    } finally {
      setIsLoading(false);
      setShowCounterForm(false);
    }
  };

  const getStatusBadge = () => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      PENDING: { color: 'text-amber-400 bg-amber-400/10', icon: Clock, label: 'Pending' },
      COUNTERED: { color: 'text-purple-400 bg-purple-400/10', icon: MessageSquare, label: 'Counter Offer' },
      ACCEPTED: { color: 'text-emerald-400 bg-emerald-400/10', icon: CheckCircle, label: 'Accepted' },
      REJECTED: { color: 'text-red-400 bg-red-400/10', icon: XCircle, label: 'Rejected' },
      FUNDED: { color: 'text-cyan-400 bg-cyan-400/10', icon: DollarSign, label: 'Funded' },
      EXPIRED: { color: 'text-slate-400 bg-slate-400/10', icon: Clock, label: 'Expired' },
    };
    const config = statusConfig[proposal.status] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span className={cn('flex items-center gap-1 px-2 py-1 rounded text-xs font-medium', config.color)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const expiresIn = Math.ceil((new Date(proposal.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <GlassCard hover className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{proposal.project.logoEmoji}</span>
          <div>
            <h4 className="font-semibold text-white">{proposal.project.name}</h4>
            <p className="text-xs text-slate-400">
              {role === 'investor'
                ? `To: ${proposal.founder.name || proposal.founder.email}`
                : `From: ${proposal.investor.name || proposal.investor.email}`}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Amount */}
      <div className="flex items-center gap-4 mb-3">
        <div>
          <span className="text-xs text-slate-500">Proposed</span>
          <p className="text-lg font-bold text-cyan-400">${proposal.proposedAmount.toLocaleString()}</p>
        </div>
        {proposal.counterAmount && (
          <>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div>
              <span className="text-xs text-slate-500">Counter</span>
              <p className="text-lg font-bold text-purple-400">${proposal.counterAmount.toLocaleString()}</p>
            </div>
          </>
        )}
        {proposal.agreedAmount && (
          <>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div>
              <span className="text-xs text-slate-500">Agreed</span>
              <p className="text-lg font-bold text-emerald-400">${proposal.agreedAmount.toLocaleString()}</p>
            </div>
          </>
        )}
      </div>

      {/* Message */}
      {proposal.message && (
        <div className="p-2 bg-slate-800/30 rounded text-sm text-slate-300 mb-3">
          &quot;{proposal.message}&quot;
        </div>
      )}

      {/* Counter Message */}
      {proposal.counterMessage && (
        <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded text-sm text-purple-300 mb-3">
          Counter: &quot;{proposal.counterMessage}&quot;
        </div>
      )}

      {/* Expiry */}
      {proposal.status === 'PENDING' && expiresIn > 0 && (
        <p className="text-xs text-slate-500 mb-3">
          Expires in {expiresIn} day{expiresIn !== 1 ? 's' : ''}
        </p>
      )}

      {/* Actions */}
      {role === 'founder' && proposal.status === 'PENDING' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleAction('accept')}
            disabled={isLoading}
            className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-sm font-medium transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => setShowCounterForm(!showCounterForm)}
            disabled={isLoading}
            className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-sm font-medium transition-colors"
          >
            Counter
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={isLoading}
            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm font-medium transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {/* Counter Form */}
      {showCounterForm && (
        <div className="mt-3 p-3 bg-slate-800/30 rounded-lg space-y-2">
          <input
            type="number"
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            placeholder="Counter amount (USDC)"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <textarea
            value={counterMessage}
            onChange={(e) => setCounterMessage(e.target.value)}
            placeholder="Message (optional)"
            rows={2}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
          />
          <button
            onClick={() => handleAction('counter')}
            disabled={isLoading || !counterAmount}
            className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Counter Offer'}
          </button>
        </div>
      )}

      {/* Investor actions for counter offer */}
      {role === 'investor' && proposal.status === 'COUNTERED' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleAction('accept_counter')}
            disabled={isLoading}
            className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-sm font-medium transition-colors"
          >
            Accept Counter (${proposal.counterAmount?.toLocaleString()})
          </button>
          <button
            onClick={() => handleAction('withdraw')}
            disabled={isLoading}
            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm font-medium transition-colors"
          >
            Withdraw
          </button>
        </div>
      )}

      {/* Withdraw for pending */}
      {role === 'investor' && proposal.status === 'PENDING' && (
        <div className="mt-3">
          <button
            onClick={() => handleAction('withdraw')}
            disabled={isLoading}
            className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded text-sm font-medium transition-colors"
          >
            Withdraw Proposal
          </button>
        </div>
      )}
    </GlassCard>
  );
}
