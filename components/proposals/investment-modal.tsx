'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import {
  X,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    tagline: string;
    logoEmoji: string;
    fundingGoal: number;
    currentFunding: number;
    aiTrustScore: number | null;
  };
}

export function InvestmentModal({ isOpen, onClose, project }: InvestmentModalProps) {
  const [amount, setAmount] = useState('');
  const [expectedROI, setExpectedROI] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const remainingFunding = project.fundingGoal - project.currentFunding;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          proposedAmount: amount,
          proposedROI: expectedROI || null,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit proposal');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setAmount('');
        setExpectedROI('');
        setMessage('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg z-10">
        <GlassCard className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success State */}
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Proposal Sent!</h3>
              <p className="text-slate-400 text-center">
                Your investment proposal has been sent to the founder.
                They will respond within 7 days.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{project.logoEmoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{project.name}</h3>
                    <p className="text-sm text-slate-400">{project.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <span className="text-slate-400">
                    Goal: <span className="text-emerald-400 font-semibold">${project.fundingGoal.toLocaleString()}</span>
                  </span>
                  <span className="text-slate-400">
                    Remaining: <span className="text-cyan-400 font-semibold">${remainingFunding.toLocaleString()}</span>
                  </span>
                  {project.aiTrustScore && (
                    <span className="text-slate-400">
                      Trust: <span className={cn(
                        'font-semibold',
                        project.aiTrustScore >= 70 ? 'text-emerald-400' :
                        project.aiTrustScore >= 40 ? 'text-amber-400' : 'text-red-400'
                      )}>{project.aiTrustScore}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Investment Amount (USDC) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 5000"
                    min="100"
                    step="100"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-lg font-semibold placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum: 100 USDC</p>
                </div>

                {/* Expected ROI */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Expected ROI (%) - Optional
                  </label>
                  <input
                    type="number"
                    value={expectedROI}
                    onChange={(e) => setExpectedROI(e.target.value)}
                    placeholder="e.g., 25"
                    min="0"
                    max="1000"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message to Founder - Optional
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Introduce yourself and explain why you're interested in investing..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Terms Notice */}
                <div className="p-3 bg-slate-800/30 rounded-lg text-xs text-slate-500">
                  By submitting this proposal, you agree to ENTARC&apos;s investment terms.
                  The founder has 7 days to respond. If accepted, funds will be held in escrow
                  and released based on milestone completion.
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
                    isSubmitting
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Proposal...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Send Investment Proposal
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
