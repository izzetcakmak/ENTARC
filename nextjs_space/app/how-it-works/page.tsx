// Public "How it works" page — same guide as /docs, no sign-in required

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { DocsContent } from '../(main)/docs/docs-content';

export const metadata = {
  title: 'How ENTARC works — a plain-language guide',
  description:
    'An AI agent that scores early-stage projects and pays founders in USDC, milestone by milestone, under hard spending rules. Interactive guide, no crypto background needed.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              ENT<span className="text-cyan-400">ARC</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 transition-all hover:bg-cyan-400"
          >
            Open the app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <DocsContent publicView />
      </main>
    </div>
  );
}
