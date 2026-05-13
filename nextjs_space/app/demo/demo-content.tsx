'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play, Pause, ChevronLeft, ChevronRight, ExternalLink,
  Brain, Shield, Zap, DollarSign, BarChart3, Globe,
  Wallet, ArrowRightLeft, TrendingUp, Lock, Layers,
  CircleDot, Target, Sparkles, Radio, Rocket
} from 'lucide-react';

/* ─────────────────── SLIDE DATA ─────────────────── */
interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  bullets: { icon: React.ReactNode; text: string; highlight?: string }[];
  badge?: string;
  badgeColor?: string;
  demoLink?: string;
  demoLabel?: string;
  gradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 'intro',
    title: 'ENTARC Nedir?',
    subtitle: 'Autonomous Venture Intelligence Agent on Arc Network',
    badge: 'Agora Agents Hackathon',
    badgeColor: 'from-purple-500 to-pink-500',
    bullets: [
      { icon: <Brain className="w-5 h-5" />, text: 'Arc Network üzerinde çalışan', highlight: 'otonom yapay zeka ajanı' },
      { icon: <Target className="w-5 h-5" />, text: 'Pre-TGE projeleri analiz eder, yatırım kararlarını', highlight: 'tamamen otonom' },
      { icon: <Shield className="w-5 h-5" />, text: 'Circle Agent Stack ile', highlight: 'developer-controlled cüzdanlar' },
      { icon: <DollarSign className="w-5 h-5" />, text: 'Milestone-based USDC streaming ile', highlight: 'güvenli fon yönetimi' },
    ],
    gradient: 'from-cyan-500/20 via-transparent to-purple-500/20',
  },
  {
    id: 'problem',
    title: 'Hangi Sorunları Çözüyor?',
    subtitle: 'Web3 venture capital\'daki en büyük problemler',
    badge: 'Problem → Solution',
    badgeColor: 'from-red-500 to-orange-500',
    bullets: [
      { icon: <Zap className="w-5 h-5" />, text: 'Manuel due diligence çok yavaş →', highlight: 'AI-powered gerçek zamanlı analiz' },
      { icon: <Lock className="w-5 h-5" />, text: 'Fonlar tek seferde gönderiliyor →', highlight: 'Milestone-based escrow ile güvenlik' },
      { icon: <BarChart3 className="w-5 h-5" />, text: 'Veri kaynakları dağınık →', highlight: '5 sinyal kaynağı tek panelde birleşik' },
      { icon: <Globe className="w-5 h-5" />, text: 'Cross-chain transfer zor →', highlight: 'CCTP ile otomatik bridge' },
    ],
    gradient: 'from-red-500/20 via-transparent to-yellow-500/20',
  },
  {
    id: 'agent',
    title: 'Otonom Agent Dashboard',
    subtitle: 'Tüm operasyonlar tek ekrandan — gerçek API çağrıları',
    badge: 'LIVE DEMO',
    badgeColor: 'from-emerald-500 to-cyan-500',
    demoLink: '/autonomous-agent',
    demoLabel: 'Agent Dashboard\'u Aç',
    bullets: [
      { icon: <Radio className="w-5 h-5" />, text: 'Signal Aggregator:', highlight: 'GitHub, Social, On-chain, Market, Sentiment' },
      { icon: <BarChart3 className="w-5 h-5" />, text: 'Portfolio Manager:', highlight: 'Risk rejimi analizi ve rebalancing' },
      { icon: <Lock className="w-5 h-5" />, text: 'Escrow Operations:', highlight: 'Create, Release, Pause — USDC ile' },
      { icon: <DollarSign className="w-5 h-5" />, text: 'Nanopayment Streaming:', highlight: '$0.001/sn mikro ödeme akışı' },
    ],
    gradient: 'from-emerald-500/20 via-transparent to-cyan-500/20',
  },
  {
    id: 'circle',
    title: 'Circle Agent Stack',
    subtitle: 'Developer-controlled cüzdanlar + CCTP bridge',
    badge: 'CIRCLE TOOLING',
    badgeColor: 'from-blue-500 to-indigo-500',
    demoLink: '/agent-hub',
    demoLabel: 'Agent Hub\'u Aç',
    bullets: [
      { icon: <Wallet className="w-5 h-5" />, text: 'Programmable Wallets:', highlight: 'API ile otonom cüzdan oluşturma' },
      { icon: <CircleDot className="w-5 h-5" />, text: 'Faucet Integration:', highlight: 'Otomatik test USDC funding' },
      { icon: <ArrowRightLeft className="w-5 h-5" />, text: 'CCTP Bridge:', highlight: 'Burn → Attest → Mint cross-chain' },
      { icon: <Layers className="w-5 h-5" />, text: 'App Kit Demo:', highlight: 'Onboard, Send, Swap, Bridge — 4 tab' },
    ],
    gradient: 'from-blue-500/20 via-transparent to-indigo-500/20',
  },
  {
    id: 'discovery',
    title: 'Arc Ecosystem Discovery',
    subtitle: 'Pre-TGE projeleri keşfet ve analiz et',
    badge: 'PRE-TGE',
    badgeColor: 'from-amber-500 to-orange-500',
    demoLink: '/discovery',
    demoLabel: 'Discovery\'yi Aç',
    bullets: [
      { icon: <Globe className="w-5 h-5" />, text: 'Arc üzerindeki gerçek projeleri', highlight: 'canlı API ile listeleme' },
      { icon: <TrendingUp className="w-5 h-5" />, text: 'AI Trust Score:', highlight: 'Her proje için güvenilirlik puanı' },
      { icon: <Sparkles className="w-5 h-5" />, text: 'AI Insights:', highlight: 'Otomatik yatırım önerileri' },
      { icon: <BarChart3 className="w-5 h-5" />, text: 'Portfolio tracking:', highlight: 'ROI, P/L gerçek zamanlı takip' },
    ],
    gradient: 'from-amber-500/20 via-transparent to-orange-500/20',
  },
  {
    id: 'traction',
    title: 'Traction & Innovation',
    subtitle: 'Hackathon Scoring: Agentic 30% | Traction 30% | Circle 20% | Innovation 20%',
    badge: '$50K PRIZE POOL',
    badgeColor: 'from-yellow-500 to-amber-500',
    bullets: [
      { icon: <Brain className="w-5 h-5" />, text: 'Agentic Sophistication:', highlight: '5-source signal fusion, autonomous decisions' },
      { icon: <Rocket className="w-5 h-5" />, text: 'Traction:', highlight: 'Deployed on entarc.xyz — fully functional' },
      { icon: <CircleDot className="w-5 h-5" />, text: 'Circle Tooling:', highlight: 'Wallets, CCTP, Faucet, App Kit — tüm stack' },
      { icon: <Sparkles className="w-5 h-5" />, text: 'Innovation:', highlight: 'İlk otonom VC agent on Arc Network' },
    ],
    gradient: 'from-yellow-500/20 via-transparent to-emerald-500/20',
  },
];

/* ─────────── TYPING ANIMATION HOOK ─────────── */
function useTypingEffect(text: string, isActive: boolean, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isActive) { setDisplayed(''); setDone(false); return; }
    let i = 0;
    setDisplayed('');
    setDone(false);
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, isActive, speed]);

  return { displayed, done };
}

/* ─────────── MAIN COMPONENT ─────────── */
export default function DemoContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visibleBullets, setVisibleBullets] = useState(0);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const slide = SLIDES[currentSlide];

  // Typing effect for subtitle
  const { displayed: typedSubtitle, done: subtitleDone } = useTypingEffect(
    slide?.subtitle || '', mounted && !!slide, 25
  );

  // Stagger bullets after subtitle is done
  useEffect(() => {
    if (!subtitleDone) { setVisibleBullets(0); return; }
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setVisibleBullets(count);
      if (count >= (slide?.bullets.length || 0)) clearInterval(iv);
    }, 400);
    return () => clearInterval(iv);
  }, [subtitleDone, currentSlide, slide?.bullets.length]);

  // Auto-advance
  const goNext = useCallback(() => {
    setCurrentSlide(prev => {
      if (prev >= SLIDES.length - 1) { setIsPlaying(false); return prev; }
      return prev + 1;
    });
  }, []);

  useEffect(() => {
    if (isPlaying) {
      autoRef.current = setTimeout(goNext, 8000);
    }
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [isPlaying, currentSlide, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,5%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(222,47%,5%)] text-white overflow-hidden relative">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-1000 pointer-events-none`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.08),transparent_50%)] pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold">E</div>
          <span className="text-lg font-bold">ENT<span className="text-cyan-400">ARC</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">Agora Agents Hackathon 2026</span>
          <Link href="/login" className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
            Uygulamayı Dene →
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Avatar + Presenter */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Avatar with glow */}
            <div className="relative mb-6">
              <div className="absolute -inset-3 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-48 h-60 sm:w-56 sm:h-72 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                <Image
                  src="/founder-avatar.jpg"
                  alt="ENTARC Founder"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              {/* Speaking indicator */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 border border-cyan-500/30 rounded-full px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] text-cyan-400 font-medium">PRESENTING</span>
              </div>
            </div>

            {/* Presenter info */}
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-sm font-semibold text-white">İzzet Çakmak</h3>
              <p className="text-xs text-slate-400">Founder & Lead Developer</p>
              <p className="text-[10px] text-cyan-400/80">ENTARC — Arc Network</p>
            </div>

            {/* Slide navigation dots */}
            <div className="flex items-center gap-2 mb-4">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'w-8 bg-cyan-400'
                      : i < currentSlide
                      ? 'w-2 bg-cyan-400/50'
                      : 'w-2 bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  isPlaying
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Duraklat' : 'Otomatik Oynat'}
              </button>
              <button
                onClick={() => setCurrentSlide(Math.min(SLIDES.length - 1, currentSlide + 1))}
                disabled={currentSlide === SLIDES.length - 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-500 mt-3">
              {currentSlide + 1} / {SLIDES.length}
            </p>
          </div>

          {/* RIGHT: Slide Content */}
          <div className="lg:col-span-8">
            <div className="relative">
              {/* Badge */}
              {slide.badge && (
                <div className="inline-block mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${slide.badgeColor} text-white shadow-lg`}>
                    {slide.badge}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1
                key={`title-${currentSlide}`}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 animate-[fadeIn_0.5s_ease-out]"
              >
                {slide.title}
              </h1>

              {/* Subtitle with typing effect */}
              <div className="h-8 mb-8">
                <p className="text-base sm:text-lg text-slate-300">
                  {typedSubtitle}
                  {!subtitleDone && <span className="inline-block w-0.5 h-5 bg-cyan-400 ml-0.5 animate-pulse" />}
                </p>
              </div>

              {/* Bullets */}
              <div className="space-y-4 mb-8">
                {slide.bullets.map((bullet, i) => (
                  <div
                    key={`${currentSlide}-${i}`}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      i < visibleBullets
                        ? 'bg-white/5 border-white/10 opacity-100 translate-x-0'
                        : 'bg-transparent border-transparent opacity-0 translate-x-8'
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      {bullet.icon}
                    </div>
                    <p className="text-sm sm:text-base text-slate-300 pt-2">
                      {bullet.text}{' '}
                      {bullet.highlight && (
                        <span className="text-white font-semibold">{bullet.highlight}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Demo link button */}
              {slide.demoLink && (
                <div
                  className={`transition-all duration-500 ${
                    visibleBullets >= slide.bullets.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <Link
                    href={slide.demoLink}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all group"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {slide.demoLabel}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Feature chips */}
      <div className="relative z-10 border-t border-white/5 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Circle Agent Stack', color: 'text-blue-400 border-blue-500/30' },
              { label: 'CCTP Bridge', color: 'text-purple-400 border-purple-500/30' },
              { label: 'USDC Streaming', color: 'text-emerald-400 border-emerald-500/30' },
              { label: 'AI Signal Fusion', color: 'text-cyan-400 border-cyan-500/30' },
              { label: 'Arc Testnet', color: 'text-amber-400 border-amber-500/30' },
              { label: 'Programmable Wallets', color: 'text-pink-400 border-pink-500/30' },
            ].map(chip => (
              <span
                key={chip.label}
                className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full border bg-white/5 ${chip.color}`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 z-20 text-[10px] text-slate-600 hidden lg:block">
        ← → tuşları ile gezin | Space ile oynat/duraklat
      </div>
    </div>
  );
}
