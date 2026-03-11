'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import {
  Rocket,
  Github,
  Twitter,
  Globe,
  MessageSquare,
  DollarSign,
  Target,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'DEFI', label: 'DeFi', emoji: '💰' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure', emoji: '🔧' },
  { value: 'GAMING', label: 'Gaming', emoji: '🎮' },
  { value: 'NFT', label: 'NFT', emoji: '🖼️' },
  { value: 'DAO', label: 'DAO', emoji: '🏛️' },
  { value: 'SOCIAL', label: 'Social', emoji: '💬' },
  { value: 'AI', label: 'AI', emoji: '🤖' },
  { value: 'OTHER', label: 'Other', emoji: '🚀' },
];

const EMOJI_OPTIONS = ['🚀', '💎', '⚡', '🔥', '🌟', '💰', '🎯', '🔮', '🌐', '🛡️'];

interface Milestone {
  title: string;
  description: string;
  percentage: number;
}

export default function SubmitProjectContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'DEFI',
    logoEmoji: '🚀',
    githubUrl: '',
    twitterHandle: '',
    discordUrl: '',
    websiteUrl: '',
    fundingGoal: '',
  });
  
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: 'MVP Launch', description: 'Initial product release', percentage: 25 },
    { title: 'Beta Release', description: 'Feature-complete beta version', percentage: 25 },
    { title: 'Security Audit', description: 'Third-party security audit', percentage: 25 },
    { title: 'Mainnet Launch', description: 'Production deployment', percentage: 25 },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string | number) => {
    setMilestones(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addMilestone = () => {
    if (milestones.length < 6) {
      setMilestones(prev => [...prev, { title: '', description: '', percentage: 0 }]);
    }
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 2) {
      setMilestones(prev => prev.filter((_, i) => i !== index));
    }
  };

  const redistributePercentages = () => {
    const equal = Math.floor(100 / milestones.length);
    const remainder = 100 - (equal * milestones.length);
    setMilestones(prev => 
      prev.map((m, i) => ({ ...m, percentage: equal + (i === 0 ? remainder : 0) }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.tagline || !formData.description || !formData.fundingGoal) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
    if (totalPercentage !== 100) {
      setError(`Milestone percentages must total 100% (currently ${totalPercentage}%)`);
      setIsSubmitting(false);
      return;
    }

    try {
      const fundingGoal = parseFloat(formData.fundingGoal);
      const milestonesWithAmounts = milestones.map(m => ({
        ...m,
        targetAmount: (fundingGoal * m.percentage) / 100,
      }));

      const response = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          milestones: milestonesWithAmounts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit project');
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/discovery');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Project Submitted!</h2>
        <p className="text-slate-400">Your project is under review. AI analysis will be performed shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/discovery"
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-6 h-6 text-cyan-400" />
            Submit Your Project
          </h1>
          <p className="text-slate-400">Get discovered by AI-powered investors on Arc Network</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            
            {/* Logo Emoji */}
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Project Logo</label>
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoEmoji: emoji }))}
                    className={cn(
                      'w-12 h-12 text-2xl rounded-lg border transition-all',
                      formData.logoEmoji === emoji
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Name */}
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Project Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., DeFi Protocol X"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Tagline */}
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Tagline *</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="e.g., Revolutionizing decentralized lending"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                maxLength={100}
                required
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project, its goals, and unique value proposition..."
                rows={5}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                required
              />
            </div>
          </GlassCard>

          {/* Social Links */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Links & Social</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/your-project"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Twitter className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={handleInputChange}
                  placeholder="@yourproject"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  name="discordUrl"
                  value={formData.discordUrl}
                  onChange={handleInputChange}
                  placeholder="https://discord.gg/your-server"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="https://yourproject.com"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Funding & Milestones */}
        <div className="space-y-6">
          {/* Funding Goal */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Funding Goal
            </h3>
            
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleInputChange}
                placeholder="10000"
                min="100"
                step="100"
                className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-xl font-semibold placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <span className="text-xl font-bold text-emerald-400">USDC</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Minimum: 100 USDC</p>
          </GlassCard>

          {/* Milestones */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Milestones
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={redistributePercentages}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                >
                  Equal Split
                </button>
                {milestones.length < 6 && (
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="p-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-cyan-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-cyan-400">Milestone {index + 1}</span>
                    {milestones.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    placeholder="Milestone title"
                    className="w-full px-3 py-2 mb-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  
                  <input
                    type="text"
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                    placeholder="Brief description"
                    className="w-full px-3 py-2 mb-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={milestone.percentage}
                      onChange={(e) => handleMilestoneChange(index, 'percentage', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400">%</span>
                    {formData.fundingGoal && (
                      <span className="text-sm text-emerald-400 ml-auto">
                        ≈ {((parseFloat(formData.fundingGoal) * milestone.percentage) / 100).toFixed(0)} USDC
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Percentage Total */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
              <span className="text-slate-400">Total:</span>
              <span className={cn(
                'font-bold',
                milestones.reduce((sum, m) => sum + m.percentage, 0) === 100
                  ? 'text-emerald-400'
                  : 'text-red-400'
              )}>
                {milestones.reduce((sum, m) => sum + m.percentage, 0)}%
              </span>
            </div>
          </GlassCard>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2',
              isSubmitting
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Submit Project for Review
              </>
            )}
          </button>

          <p className="text-sm text-slate-500 text-center">
            Your project will be analyzed by our AI to calculate a Trust Score.
            Approved projects will be visible to investors.
          </p>
        </div>
      </form>
    </div>
  );
}
