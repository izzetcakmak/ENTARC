'use client';

// DocsContent - plain-language guide to ENTARC with interactive visuals.
// Every claim here describes behaviour that exists in the code; examples are labelled as examples.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Bot,
  Briefcase,
  Brain,
  Compass,
  LayoutDashboard,
  Sparkles,
  Terminal,
  Zap,
  Settings,
  FileText,
  User,
  Rocket,
  ShieldCheck,
  Database,
  Wallet,
  Github,
  Link2,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { FlowDiagram } from '@/components/docs/flow-diagram';
import { TrustGauge } from '@/components/docs/trust-gauge';
import { PolicySimulator, type PolicyValues } from '@/components/docs/policy-simulator';
import { MilestoneDemo } from '@/components/docs/milestone-demo';
import { cn } from '@/lib/utils';
import {
  NETWORK_LABEL,
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  explorerAddressUrl,
} from '@/lib/arc-network';

const DEFAULT_POLICY: PolicyValues = { maxPerTxUsdc: 5, dailyCapUsdc: 20, minTrustScore: 70 };

interface AgentInfo {
  wallet: string | null;
  usdc: string | number | null;
  engine: string;
  policy: PolicyValues;
}

const SECTIONS = [
  { id: 'what', label: 'What is ENTARC?' },
  { id: 'how', label: 'How a deal works' },
  { id: 'roles', label: 'Who does what' },
  { id: 'start', label: 'Getting started' },
  { id: 'trust', label: 'The trust score' },
  { id: 'policy', label: 'The spending rules' },
  { id: 'milestones', label: 'Milestone escrow' },
  { id: 'pages', label: 'Guide to each page' },
  { id: 'data', label: 'Where numbers come from' },
  { id: 'status', label: 'Live vs. planned' },
  { id: 'network', label: 'Network facts' },
  { id: 'faq', label: 'FAQ' },
  { id: 'glossary', label: 'Glossary' },
];

function Section({
  id,
  title,
  kicker,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      id={id}
      className="scroll-mt-24"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard padding="lg">
        {kicker && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">{kicker}</p>}
        <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
        {children}
      </GlassCard>
    </motion.section>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-white">{q}</span>
        <ChevronDown className={cn('h-4 w-4 flex-shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4 text-sm leading-relaxed text-slate-300">{children}</div>}
    </div>
  );
}

export function DocsContent() {
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [activeId, setActiveId] = useState('what');

  // Live values, so the docs never drift from the running system.
  useEffect(() => {
    fetch('/api/agent/run')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.agent && setAgent(d.agent))
      .catch(() => {});
  }, []);

  // Highlight the section being read in the table of contents.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const policy = agent?.policy ?? DEFAULT_POLICY;

  const pages = [
    { icon: LayoutDashboard, name: 'Dashboard', href: '/dashboard', text: 'The big picture: how much USDC the agent has committed, released and still holds locked, plus its latest transfers with explorer links.', source: 'Database + Circle' },
    { icon: Sparkles, name: 'Deal Flow', href: '/deal-flow', text: 'The marketplace. Browse analysed projects, propose an investment, and — if you are a founder — accept or reject proposals.', source: 'Database' },
    { icon: Compass, name: 'Discovery', href: '/discovery', text: 'A watchlist of public projects building on Arc, and a GitHub search. Stars, commits and last activity are fetched live.', source: 'GitHub (live)' },
    { icon: Briefcase, name: 'Portfolio', href: '/portfolio', text: 'Your own deals: what you committed, what has been released to founders, what is still locked.', source: 'Database' },
    { icon: Bot, name: 'Agent Hub', href: '/agent-hub', text: 'The agent’s wallet: its address, network and status. Use “Fund” to copy the address when you want to top it up.', source: 'Circle' },
    { icon: Terminal, name: 'Agent Console', href: '/agent-console', text: 'Where money actually moves. Pick an accepted deal and press “Run agent”: it analyses, checks the rules and — if they pass — pays.', source: 'Database + Circle + Arc' },
    { icon: Zap, name: 'Autonomous Agent', href: '/autonomous-agent', text: 'Analysis tools: combine a project’s signals into one view, check the portfolio’s risk, and read the agent wallet’s live status.', source: 'Database + Circle' },
    { icon: Brain, name: 'AI Insights', href: '/insights', text: 'What the agent has concluded so far: its scores, recommendations and summaries, next to live watchlist activity.', source: 'Database + GitHub' },
    { icon: FileText, name: 'Submit Project', href: '/submit-project', text: 'For founders: list a project so the agent can analyse it and investors can find it.', source: 'Database' },
    { icon: Settings, name: 'Settings', href: '/settings', text: 'Connect your own wallet (MetaMask) and see both your wallet and the agent wallet.', source: 'Arc + Circle' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <GlassCard padding="lg" className="mb-6 bg-gradient-to-br from-cyan-500/5 to-violet-500/5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
              <BookOpen className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">How ENTARC works</h1>
              <p className="mt-1 max-w-2xl text-slate-300">
                A plain-language guide. No crypto background needed — every section has a picture you can play with.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
              ● Running on {NETWORK_LABEL}
            </span>
            <span className="rounded-full border border-slate-600 bg-slate-800/50 px-3 py-1 text-slate-300">
              ~8 min read
            </span>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Table of contents */}
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">On this page</p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                  activeId === s.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'
                )}
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-6">
          {/* 1 */}
          <Section id="what" kicker="Start here" title="What is ENTARC?">
            <p className="leading-relaxed text-slate-300">
              ENTARC is a small <strong className="text-white">investment fund run by software</strong>. An AI agent
              reads early-stage projects, gives each one a score, and — when a deal is agreed — pays the founder in{' '}
              <strong className="text-white">USDC</strong> (a digital dollar) step by step, as the project delivers.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Brain, title: 'It reads', text: 'The agent studies each project and writes a trust score from 0 to 100.' },
                { icon: ShieldCheck, title: 'It follows rules', text: 'It can only pay small, capped amounts to projects that score well enough.' },
                { icon: Wallet, title: 'It pays for real', text: 'Payments are real transfers with a public receipt anyone can check.' },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <c.icon className="h-5 w-5 text-cyan-400" />
                  <p className="mt-2 font-semibold text-white">{c.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-slate-300">
              <strong className="text-violet-300">Think of it like this:</strong> a careful accountant with a company card.
              They can pay suppliers without asking the boss each time — but the card has a low limit, a daily budget, and
              only works at approved shops. ENTARC’s agent is that accountant, and its rules are built into the card.
            </div>
          </Section>

          {/* 2 */}
          <Section id="how" kicker="The journey of one deal" title="How a deal works, step by step">
            <p className="mb-5 text-sm text-slate-400">
              Follow the coin. It shows where a deal is, and who acts at each step.
            </p>
            <FlowDiagram />
          </Section>

          {/* 3 */}
          <Section id="roles" kicker="People and software" title="Who does what">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: Rocket, color: 'text-violet-400', name: 'Founder', does: ['Submits a project with milestones', 'Adds a wallet address to receive funds', 'Accepts or rejects proposals'] },
                { icon: User, color: 'text-emerald-400', name: 'Investor', does: ['Browses scored projects', 'Proposes an amount in USDC', 'Follows releases in Portfolio'] },
                { icon: Bot, color: 'text-cyan-400', name: 'The agent', does: ['Scores every project', 'Checks the spending rules', 'Sends USDC and records the receipt'] },
              ].map((r) => (
                <div key={r.name} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-2">
                    <r.icon className={cn('h-5 w-5', r.color)} />
                    <p className="font-semibold text-white">{r.name}</p>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                    {r.does.map((d) => (
                      <li key={d} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              One account can be both: you are the founder of projects you submit, and an investor everywhere else. You
              cannot invest in your own project.
            </p>
          </Section>

          {/* 4 */}
          <Section id="start" kicker="Two short checklists" title="Getting started">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="mb-3 font-semibold text-emerald-300">I want to invest</p>
                <ol className="space-y-2 text-sm text-slate-300">
                  <li>1. Open <Link href="/deal-flow" className="text-cyan-400 hover:text-cyan-300">Deal Flow</Link> and pick a project with a score you like.</li>
                  <li>2. Press <em>Propose Investment</em> and enter an amount.</li>
                  <li>3. Wait for the founder to accept — you will see the status change.</li>
                  <li>4. Settlement runs in the <Link href="/agent-console" className="text-cyan-400 hover:text-cyan-300">Agent Console</Link>.</li>
                  <li>5. Follow releases in <Link href="/portfolio" className="text-cyan-400 hover:text-cyan-300">Portfolio</Link>.</li>
                </ol>
              </div>
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                <p className="mb-3 font-semibold text-violet-300">I am a founder</p>
                <ol className="space-y-2 text-sm text-slate-300">
                  <li>1. Add your wallet address in <Link href="/settings" className="text-cyan-400 hover:text-cyan-300">Settings</Link> — payments go there.</li>
                  <li>2. <Link href="/submit-project" className="text-cyan-400 hover:text-cyan-300">Submit your project</Link> with clear milestones.</li>
                  <li>3. The agent scores it; it then appears in Deal Flow.</li>
                  <li>4. Accept a proposal in Deal Flow under <em>Proposals on My Projects</em>.</li>
                  <li>5. Deliver milestones — each one unlocks the next payment.</li>
                </ol>
              </div>
            </div>
          </Section>

          {/* 5 */}
          <Section id="trust" kicker="The agent’s opinion, as a number" title="The trust score">
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              The trust score answers one question: <em>“How confident is the agent in this project?”</em> It runs from
              0 to 100. It is an opinion produced by an AI model from the information the founder provided and public
              repository activity — useful, but not a guarantee.
            </p>
            <TrustGauge minTrustScore={policy.minTrustScore} />
          </Section>

          {/* 6 */}
          <Section id="policy" kicker="Why the agent cannot go wild" title="The spending rules">
            <p className="mb-2 text-sm leading-relaxed text-slate-300">
              No person approves the agent’s payments — three rules do. Every transfer must pass all of them, in code,
              before any USDC leaves the wallet. There is no override.
            </p>
            <div className="mb-5 grid gap-2 sm:grid-cols-3">
              {[
                { label: 'Max per transfer', value: `${policy.maxPerTxUsdc} USDC` },
                { label: 'Max per 24 hours', value: `${policy.dailyCapUsdc} USDC` },
                { label: 'Min trust score', value: `${policy.minTrustScore} / 100` },
              ].map((r) => (
                <div key={r.label} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 text-center">
                  <p className="text-xs text-slate-400">{r.label}</p>
                  <p className="text-lg font-bold text-white">{r.value}</p>
                </div>
              ))}
            </div>
            <p className="mb-4 text-xs text-slate-500">
              {agent ? 'These are the live values of the running agent.' : 'Showing the default values.'} A fourth switch
              exists too: the risk monitor can pause a single deal, and a paused deal is always refused.
            </p>
            <PolicySimulator policy={policy} />
          </Section>

          {/* 7 */}
          <Section id="milestones" kicker="Pay as they deliver" title="Milestone escrow">
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              A founder never receives everything at once. The agreed amount is split by the project’s milestones. The
              first share is sent when the deal is funded; the rest stays in the agent’s wallet until the next
              milestone is released. If a project stalls, the remaining money simply never leaves. Every release passes
              the spending rules again.
            </p>
            <MilestoneDemo />
          </Section>

          {/* 8 */}
          <Section id="pages" kicker="The left menu, explained" title="Guide to each page">
            <div className="grid gap-3 md:grid-cols-2">
              {pages.map((p) => (
                <Link
                  key={p.name}
                  href={p.href}
                  className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-colors hover:border-cyan-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p.icon className="h-4 w-4 text-cyan-400" />
                      <p className="font-semibold text-white group-hover:text-cyan-400">{p.name}</p>
                    </div>
                    <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-300">{p.source}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{p.text}</p>
                </Link>
              ))}
            </div>
          </Section>

          {/* 9 */}
          <Section id="data" kicker="No made-up numbers" title="Where the numbers come from">
            <p className="mb-4 text-sm leading-relaxed text-slate-300">
              Everything you see is read from one of four real sources. If something has not happened yet, the page
              shows zero or “not analysed” — never a placeholder figure.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Database, name: 'ENTARC database', text: 'Projects, proposals, milestones and the agent’s analyses.' },
                { icon: Wallet, name: 'Circle', text: 'The agent’s wallet, its USDC balance and the transfers it signs.' },
                { icon: Link2, name: 'Arc blockchain', text: 'The public record. Every payment has a transaction hash you can open in the explorer.' },
                { icon: Github, name: 'GitHub', text: 'Stars, commits, contributors and last activity of watched repositories, fetched live.' },
              ].map((d) => (
                <div key={d.name} className="flex gap-3 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <d.icon className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                  <div>
                    <p className="font-semibold text-white">{d.name}</p>
                    <p className="text-sm text-slate-400">{d.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 10 */}
          <Section id="status" kicker="Honest status" title="What is live, and what is planned">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Live today
                </p>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  <li>• AI project analysis and trust scores</li>
                  <li>• Proposals between investors and founders</li>
                  <li>• Agent wallet on {NETWORK_LABEL} (Circle developer-controlled wallet)</li>
                  <li>• Real, policy-gated USDC transfers with explorer receipts</li>
                  <li>• Milestone-by-milestone release</li>
                  <li>• Live GitHub activity for the Arc watchlist</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-300">
                  <Clock className="h-4 w-4" /> Planned, not built yet
                </p>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  <li>• Nanopayments (per-second micro-payments)</li>
                  <li>• Cross-chain USDC bridging inside the app (CCTP)</li>
                  <li>• Agent marketplace</li>
                  <li>• Automatic discovery of new projects directly from the chain</li>
                  <li>• A smart-contract escrow (today the agent’s own wallet holds locked funds)</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* 11 */}
          <Section id="network" kicker="For the curious" title="Network facts">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { k: 'Network', v: NETWORK_LABEL },
                { k: 'Chain ID', v: String(ARC_CHAIN_ID) },
                { k: 'Currency and gas', v: 'USDC — fees are paid in USDC too, no second token needed' },
                { k: 'Reasoning engine', v: agent?.engine ?? '—' },
              ].map((f) => (
                <div key={f.k} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3">
                  <p className="text-xs text-slate-400">{f.k}</p>
                  <p className="text-sm font-medium text-white">{f.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <a href={ARC_EXPLORER_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                Open the Arc explorer <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {agent?.wallet && (
                <a href={explorerAddressUrl(agent.wallet)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                  View the agent wallet on the explorer <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </Section>

          {/* 12 */}
          <Section id="faq" kicker="Quick answers" title="Frequently asked questions">
            <div className="space-y-2">
              <Faq q="Is this real money?">
                Yes. On {NETWORK_LABEL} the agent sends real USDC. That is exactly why its limits are small and cannot be
                overridden from the app.
              </Faq>
              <Faq q="Can the agent spend everything in its wallet?">
                No. It can send at most {policy.maxPerTxUsdc} USDC per transfer and {policy.dailyCapUsdc} USDC in any 24
                hours, and only to projects scoring {policy.minTrustScore} or more — however much the wallet holds.
              </Faq>
              <Faq q="Why does my dashboard show zeros?">
                Because nothing has been funded on {NETWORK_LABEL} yet. ENTARC only shows what really happened. Numbers
                appear after the first settled deal.
              </Faq>
              <Faq q="Why does a project say “Not analysed”?">
                The agent has not scored it yet. Watchlist projects in Discovery only get a score once they are
                submitted and analysed.
              </Faq>
              <Faq q="The agent refused a payment. What now?">
                The Agent Console shows the exact reason — amount too high, daily budget used up, score too low, or the
                deal is paused. Fix the cause (for example, propose a smaller first milestone) and run it again.
              </Faq>
              <Faq q="How do I check that a payment really happened?">
                Every settled transfer has a link to the Arc explorer. Open it: you will see the sender (the agent
                wallet), the receiver (the founder), the amount and the time — independent of ENTARC.
              </Faq>
              <Faq q="Is the trust score investment advice?">
                No. It is an AI-generated opinion meant to help you compare projects. Do your own research, and never
                commit more than you can afford to lose.
              </Faq>
            </div>
          </Section>

          {/* 13 */}
          <Section id="glossary" kicker="Words you will meet" title="Glossary">
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ['USDC', 'A digital dollar. 1 USDC is designed to stay worth 1 US dollar.'],
                ['Arc', 'The blockchain ENTARC runs on. USDC is its native currency.'],
                ['Wallet', 'An account that holds USDC. It is identified by an address starting with 0x.'],
                ['Agent wallet', 'The wallet the AI agent pays from. It is managed through Circle.'],
                ['Escrow', 'Money set aside for a deal and released in parts instead of all at once.'],
                ['Milestone', 'A promised deliverable. Completing one unlocks the next payment.'],
                ['Trust score', 'The agent’s 0–100 confidence in a project.'],
                ['Proposal', 'An investor’s offer to fund a project with a given amount.'],
                ['Transaction hash', 'The public receipt number of a payment on the blockchain.'],
                ['Explorer', 'A website where anyone can look up wallets and transactions.'],
              ].map(([term, def]) => (
                <div key={term} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3">
                  <dt className="font-semibold text-white">{term}</dt>
                  <dd className="mt-0.5 text-sm text-slate-400">{def}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
              ENTARC is experimental software handling real funds. Nothing on this site is financial advice.
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
