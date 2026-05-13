'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play, Pause, ChevronLeft, ChevronRight, ExternalLink,
  Brain, Shield, Zap, DollarSign, BarChart3, Globe,
  Wallet, ArrowRightLeft, TrendingUp, Lock, Layers,
  CircleDot, Target, Sparkles, Radio, Rocket, Languages
} from 'lucide-react';

/* ─────────────────── i18n ─────────────────── */
type Lang = 'en' | 'tr';

interface SlideData {
  id: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  badge?: string;
  badgeColor?: string;
  demoLink?: string;
  demoLabel?: Record<Lang, string>;
  bullets: { icon: React.ReactNode; text: Record<Lang, string>; highlight: Record<Lang, string> }[];
  gradient: string;
}

const UI: Record<Lang, {
  tryApp: string;
  autoPlay: string;
  pause: string;
  presenting: string;
  kbHint: string;
  hackathon: string;
}> = {
  en: {
    tryApp: 'Try the App \u2192',
    autoPlay: 'Auto Play',
    pause: 'Pause',
    presenting: 'PRESENTING',
    kbHint: '\u2190 \u2192 arrows to navigate | Space to play/pause',
    hackathon: 'Agora Agents Hackathon 2026',
  },
  tr: {
    tryApp: 'Uygulamay\u0131 Dene \u2192',
    autoPlay: 'Otomatik Oynat',
    pause: 'Duraklat',
    presenting: 'SUNUYOR',
    kbHint: '\u2190 \u2192 tu\u015flar\u0131 ile gezin | Space ile oynat/duraklat',
    hackathon: 'Agora Agents Hackathon 2026',
  },
};

const SLIDES: SlideData[] = [
  {
    id: 'intro',
    title: { en: 'What is ENTARC?', tr: 'ENTARC Nedir?' },
    subtitle: { en: 'Autonomous Venture Intelligence Agent on Arc Network', tr: 'Arc Network \u00fczerinde Otonom Giri\u015fim Zeka Ajan\u0131' },
    badge: 'Agora Agents Hackathon',
    badgeColor: 'from-purple-500 to-pink-500',
    bullets: [
      { icon: <Brain className="w-5 h-5" />, text: { en: 'An autonomous AI agent running on', tr: 'Arc Network \u00fczerinde \u00e7al\u0131\u015fan' }, highlight: { en: 'Arc Network', tr: 'otonom yapay zeka ajan\u0131' } },
      { icon: <Target className="w-5 h-5" />, text: { en: 'Analyzes pre-TGE projects, makes investment decisions', tr: 'Pre-TGE projeleri analiz eder, yat\u0131r\u0131m kararlar\u0131n\u0131' }, highlight: { en: 'fully autonomous', tr: 'tamamen otonom al\u0131r' } },
      { icon: <Shield className="w-5 h-5" />, text: { en: 'Circle Agent Stack with', tr: 'Circle Agent Stack ile' }, highlight: { en: 'developer-controlled wallets', tr: 'developer-controlled c\u00fczdan y\u00f6netimi' } },
      { icon: <DollarSign className="w-5 h-5" />, text: { en: 'Milestone-based USDC streaming for', tr: 'Milestone-based USDC streaming ile' }, highlight: { en: 'secure fund management', tr: 'g\u00fcvenli fon y\u00f6netimi' } },
    ],
    gradient: 'from-cyan-500/20 via-transparent to-purple-500/20',
  },
  {
    id: 'problem',
    title: { en: 'What Problems Does It Solve?', tr: 'Hangi Sorunlar\u0131 \u00c7\u00f6z\u00fcyor?' },
    subtitle: { en: 'The biggest challenges in Web3 venture capital', tr: 'Web3 venture capital\'daki en b\u00fcy\u00fck problemler' },
    badge: 'Problem \u2192 Solution',
    badgeColor: 'from-red-500 to-orange-500',
    bullets: [
      { icon: <Zap className="w-5 h-5" />, text: { en: 'Manual due diligence is too slow \u2192', tr: 'Manuel due diligence \u00e7ok yava\u015f \u2192' }, highlight: { en: 'AI-powered real-time analysis', tr: 'AI-powered ger\u00e7ek zamanl\u0131 analiz' } },
      { icon: <Lock className="w-5 h-5" />, text: { en: 'Funds sent in a single lump sum \u2192', tr: 'Fonlar tek seferde g\u00f6nderiliyor \u2192' }, highlight: { en: 'Milestone-based escrow security', tr: 'Milestone-based escrow ile g\u00fcvenlik' } },
      { icon: <BarChart3 className="w-5 h-5" />, text: { en: 'Data sources are fragmented \u2192', tr: 'Veri kaynaklar\u0131 da\u011f\u0131n\u0131k \u2192' }, highlight: { en: '5 signal sources unified in one panel', tr: '5 sinyal kayna\u011f\u0131 tek panelde birle\u015fik' } },
      { icon: <Globe className="w-5 h-5" />, text: { en: 'Cross-chain transfers are hard \u2192', tr: 'Cross-chain transfer zor \u2192' }, highlight: { en: 'Automatic CCTP bridge', tr: 'CCTP ile otomatik bridge' } },
    ],
    gradient: 'from-red-500/20 via-transparent to-yellow-500/20',
  },
  {
    id: 'agent',
    title: { en: 'Autonomous Agent Dashboard', tr: 'Otonom Agent Dashboard' },
    subtitle: { en: 'All operations from one screen \u2014 real API calls', tr: 'T\u00fcm operasyonlar tek ekrandan \u2014 ger\u00e7ek API \u00e7a\u011fr\u0131lar\u0131' },
    badge: 'LIVE DEMO',
    badgeColor: 'from-emerald-500 to-cyan-500',
    demoLink: '/autonomous-agent',
    demoLabel: { en: 'Open Agent Dashboard', tr: 'Agent Dashboard\'u A\u00e7' },
    bullets: [
      { icon: <Radio className="w-5 h-5" />, text: { en: 'Signal Aggregator:', tr: 'Signal Aggregator:' }, highlight: { en: 'GitHub, Social, On-chain, Market, Sentiment', tr: 'GitHub, Social, On-chain, Market, Sentiment' } },
      { icon: <BarChart3 className="w-5 h-5" />, text: { en: 'Portfolio Manager:', tr: 'Portfolio Manager:' }, highlight: { en: 'Risk regime analysis & rebalancing', tr: 'Risk rejimi analizi ve rebalancing' } },
      { icon: <Lock className="w-5 h-5" />, text: { en: 'Escrow Operations:', tr: 'Escrow Operations:' }, highlight: { en: 'Create, Release, Pause \u2014 with USDC', tr: 'Create, Release, Pause \u2014 USDC ile' } },
      { icon: <DollarSign className="w-5 h-5" />, text: { en: 'Nanopayment Streaming:', tr: 'Nanopayment Streaming:' }, highlight: { en: '$0.001/sec micro-payment flow', tr: '$0.001/sn mikro \u00f6deme ak\u0131\u015f\u0131' } },
    ],
    gradient: 'from-emerald-500/20 via-transparent to-cyan-500/20',
  },
  {
    id: 'circle',
    title: { en: 'Circle Agent Stack', tr: 'Circle Agent Stack' },
    subtitle: { en: 'Developer-controlled wallets + CCTP bridge', tr: 'Developer-controlled c\u00fczdanlar + CCTP bridge' },
    badge: 'CIRCLE TOOLING',
    badgeColor: 'from-blue-500 to-indigo-500',
    demoLink: '/agent-hub',
    demoLabel: { en: 'Open Agent Hub', tr: 'Agent Hub\'u A\u00e7' },
    bullets: [
      { icon: <Wallet className="w-5 h-5" />, text: { en: 'Programmable Wallets:', tr: 'Programmable Wallets:' }, highlight: { en: 'Autonomous wallet creation via API', tr: 'API ile otonom c\u00fczdan olu\u015fturma' } },
      { icon: <CircleDot className="w-5 h-5" />, text: { en: 'Faucet Integration:', tr: 'Faucet Integration:' }, highlight: { en: 'Auto test USDC funding', tr: 'Otomatik test USDC funding' } },
      { icon: <ArrowRightLeft className="w-5 h-5" />, text: { en: 'CCTP Bridge:', tr: 'CCTP Bridge:' }, highlight: { en: 'Burn \u2192 Attest \u2192 Mint cross-chain', tr: 'Burn \u2192 Attest \u2192 Mint cross-chain' } },
      { icon: <Layers className="w-5 h-5" />, text: { en: 'App Kit Demo:', tr: 'App Kit Demo:' }, highlight: { en: 'Onboard, Send, Swap, Bridge \u2014 4 tabs', tr: 'Onboard, Send, Swap, Bridge \u2014 4 tab' } },
    ],
    gradient: 'from-blue-500/20 via-transparent to-indigo-500/20',
  },
  {
    id: 'discovery',
    title: { en: 'Arc Ecosystem Discovery', tr: 'Arc Ecosystem Discovery' },
    subtitle: { en: 'Discover and analyze pre-TGE projects', tr: 'Pre-TGE projeleri ke\u015ffet ve analiz et' },
    badge: 'PRE-TGE',
    badgeColor: 'from-amber-500 to-orange-500',
    demoLink: '/discovery',
    demoLabel: { en: 'Open Discovery', tr: 'Discovery\'yi A\u00e7' },
    bullets: [
      { icon: <Globe className="w-5 h-5" />, text: { en: 'Real Arc ecosystem projects via', tr: 'Arc \u00fczerindeki ger\u00e7ek projeleri' }, highlight: { en: 'live API listing', tr: 'canl\u0131 API ile listeleme' } },
      { icon: <TrendingUp className="w-5 h-5" />, text: { en: 'AI Trust Score:', tr: 'AI Trust Score:' }, highlight: { en: 'Reliability score for every project', tr: 'Her proje i\u00e7in g\u00fcvenilirlik puan\u0131' } },
      { icon: <Sparkles className="w-5 h-5" />, text: { en: 'AI Insights:', tr: 'AI Insights:' }, highlight: { en: 'Automated investment recommendations', tr: 'Otomatik yat\u0131r\u0131m \u00f6nerileri' } },
      { icon: <BarChart3 className="w-5 h-5" />, text: { en: 'Portfolio tracking:', tr: 'Portfolio tracking:' }, highlight: { en: 'ROI, P/L real-time monitoring', tr: 'ROI, P/L ger\u00e7ek zamanl\u0131 takip' } },
    ],
    gradient: 'from-amber-500/20 via-transparent to-orange-500/20',
  },
  {
    id: 'traction',
    title: { en: 'Traction & Innovation', tr: 'Traction & Innovation' },
    subtitle: { en: 'Hackathon Scoring: Agentic 30% | Traction 30% | Circle 20% | Innovation 20%', tr: 'Hackathon Scoring: Agentic 30% | Traction 30% | Circle 20% | Innovation 20%' },
    badge: '$50K PRIZE POOL',
    badgeColor: 'from-yellow-500 to-amber-500',
    bullets: [
      { icon: <Brain className="w-5 h-5" />, text: { en: 'Agentic Sophistication:', tr: 'Agentic Sophistication:' }, highlight: { en: '5-source signal fusion, autonomous decisions', tr: '5 kaynakl\u0131 sinyal f\u00fczyonu, otonom kararlar' } },
      { icon: <Rocket className="w-5 h-5" />, text: { en: 'Traction:', tr: 'Traction:' }, highlight: { en: 'Deployed on entarc.xyz \u2014 fully functional', tr: 'entarc.xyz\'de yay\u0131nda \u2014 tam fonksiyonel' } },
      { icon: <CircleDot className="w-5 h-5" />, text: { en: 'Circle Tooling:', tr: 'Circle Tooling:' }, highlight: { en: 'Wallets, CCTP, Faucet, App Kit \u2014 full stack', tr: 'Wallets, CCTP, Faucet, App Kit \u2014 t\u00fcm stack' } },
      { icon: <Sparkles className="w-5 h-5" />, text: { en: 'Innovation:', tr: 'Innovation:' }, highlight: { en: 'First autonomous VC agent on Arc Network', tr: '\u0130lk otonom VC agent on Arc Network' } },
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
  const [lang, setLang] = useState<Lang>('en');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visibleBullets, setVisibleBullets] = useState(0);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const slide = SLIDES[currentSlide];
  const ui = UI[lang];

  // Typing effect for subtitle
  const subtitleText = slide?.subtitle?.[lang] || '';
  const { displayed: typedSubtitle, done: subtitleDone } = useTypingEffect(
    subtitleText, mounted && !!slide, 25
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

  // Reset visible bullets & typing on lang change
  useEffect(() => {
    setVisibleBullets(0);
  }, [lang]);

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
          {/* Language toggle */}
          <button
            onClick={() => setLang(prev => prev === 'en' ? 'tr' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs"
            title={lang === 'en' ? 'T\u00fcrk\u00e7e\'ye ge\u00e7' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <span className={lang === 'en' ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>EN</span>
            <span className="text-slate-600">/</span>
            <span className={lang === 'tr' ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>TR</span>
          </button>
          <span className="text-xs text-slate-400 hidden sm:block">{ui.hackathon}</span>
          <Link href="/login" className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
            {ui.tryApp}
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
                <span className="text-[10px] text-cyan-400 font-medium">{ui.presenting}</span>
              </div>
            </div>

            {/* Presenter info */}
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-sm font-semibold text-white">\u0130zzet \u00c7akmak</h3>
              <p className="text-xs text-slate-400">Founder & Lead Developer</p>
              <p className="text-[10px] text-cyan-400/80">ENTARC \u2014 Arc Network</p>
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
                {isPlaying ? ui.pause : ui.autoPlay}
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
                key={`title-${currentSlide}-${lang}`}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 animate-[fadeIn_0.5s_ease-out]"
              >
                {slide.title[lang]}
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
                    key={`${currentSlide}-${lang}-${i}`}
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
                      {bullet.text[lang]}{' '}
                      <span className="text-white font-semibold">{bullet.highlight[lang]}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Demo link button */}
              {slide.demoLink && slide.demoLabel && (
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
                    {slide.demoLabel[lang]}
                    <span className="group-hover:translate-x-1 transition-transform">\u2192</span>
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
        {ui.kbHint}
      </div>
    </div>
  );
}
