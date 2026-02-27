'use client';

// LoginForm - Client component for login/signup
// Handles authentication flow with NextAuth

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid email or password');
        } else {
          router.replace('/dashboard');
        }
      } else {
        // Signup
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.error ?? 'Signup failed');
        } else {
          // Auto login after signup
          const loginResult = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (loginResult?.error) {
            setError('Account created but login failed. Please try logging in.');
          } else {
            router.replace('/dashboard');
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D1421]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D1421] p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              ARC<span className="text-cyan-400">ENT</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Autonomous VC Agent on Arc Network
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="mb-6 flex rounded-xl bg-slate-800/50 p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                isLogin
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                !isLogin
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (signup only) */}
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm text-slate-400">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 pl-11 pr-12 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-cyan-500 py-3 font-medium text-slate-900 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to ARCENT&apos;s Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
