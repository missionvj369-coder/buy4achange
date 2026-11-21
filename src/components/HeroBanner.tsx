import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ArrowRight, Play, ShieldCheck, Share2, ArrowUpRight } from 'lucide-react';
import { Cause } from '../types.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { MISSION_3D_THEMES } from '../data/mission3dThemes.ts';

const LazyStudioStage3D = lazy(() => import('./StudioStage3D.tsx'));

interface HeroBannerProps {
  causes: Cause[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
  onScrollToShop?: () => void;
  onOpenMissionDoc?: (causeId: string) => void;
  onOpenLedger?: () => void;
  onOpenReferEarn?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  causes,
  onScrollToCatalog,
  onScrollToShop,
  onOpenLedger,
  onOpenReferEarn,
}) => {
  const { t } = useLanguage();
  const totalRaised = causes.reduce((sum, c) => sum + (c.raised_amount || 0), 0);
  const [active3dIdx, setActive3dIdx] = useState<number>(0);

  const cycleMissionNode = () => {
    setActive3dIdx((prev) => (prev + 1) % 8);
  };

  // Interactive [SPACE] keycap switcher (just like HAPE's interactive HAPEBAR)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setActive3dIdx((prev) => (prev + 1) % 8);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const currentTheme = MISSION_3D_THEMES[active3dIdx % 8];

  return (
    <section
      className="studio-hero-stage relative w-full min-h-[86vh] sm:min-h-[90vh] flex flex-col justify-between overflow-hidden border-b border-white/10"
      style={{
        backgroundImage: `radial-gradient(ellipse 68% 58% at 50% 45%, ${currentTheme.studioGlow} 0%, rgba(7, 11, 15, 0.92) 64%, #05080A 100%)`,
      }}
    >
      {/* REAL-TIME THREE.JS PBR 3D STUDIO CANVAS */}
      <Suspense fallback={null}>
        <LazyStudioStage3D activeMissionIndex={active3dIdx} />
      </Suspense>

      {/* MONUMENTAL HAPE-STYLE BACKDROP WORDMARK */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-x-0 top-[14%] sm:top-[12%] flex justify-center overflow-hidden z-10 px-2"
      >
        <div className="font-display font-extrabold uppercase text-[11.5vw] sm:text-[9.2vw] leading-[0.88] tracking-[-0.045em] text-white/[0.11] whitespace-nowrap">
          BUY4ACHANGE<sup className="text-[4vw] align-super">®</sup>
        </div>
      </div>

      {/* TOP MICRO-BAR INSIDE HERO STAGE */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center space-x-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-white/80">
          <span className="live-dot shrink-0" />
          <span>{t.taglinePill}</span>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono uppercase tracking-[0.18em] text-white/65">
          <span>ACTIVE 3D NODE</span>
          <span className="text-white font-bold">
            {currentTheme.code} / 08 · {currentTheme.label}
          </span>
        </div>
      </div>

      {/* CENTER STAGE: FLANKING EDITORIAL COLUMNS + MAIN COPY AROUND THE 3D SCULPTURE */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-12 grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
        {/* Left Hape-Style Mixed-Weight Editorial Column */}
        <div className="lg:col-span-4 space-y-5 text-left">
          <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.16em] leading-relaxed text-white/75">
            <strong className="text-white font-extrabold">FULLY 3D</strong> &amp; LAB-VERIFIED
            <br />
            TO REDEFINE CONSCIOUS
            <br />
            COMMERCE IN INDIA
          </div>

          <h1 className="font-display font-extrabold uppercase text-3xl sm:text-4xl lg:text-[42px] text-white leading-[0.95] tracking-[-0.03em]">
            {t.heroTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-md">
            {t.heroSubtitle}
          </p>

          {/* Signature Hape Pill + White Circle Icon Badge CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onScrollToShop || onScrollToCatalog}
              className="pill-hape-cta"
            >
              <span>{t.browseProducts}</span>
              <span className="pill-hape-circle">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            <button
              type="button"
              onClick={onScrollToCatalog}
              className="pill-hape-cta"
            >
              <span>{t.readDossiers}</span>
              <span className="pill-hape-circle">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </span>
            </button>
          </div>
        </div>

        {/* Center Clear Aperture for the Interactive 3D WebGL Sculpture */}
        <div className="hidden lg:block lg:col-span-4 h-[340px]" aria-hidden="true" />

        {/* Right Hape-Style Editorial Column + Live Telemetry */}
        <div className="lg:col-span-4 lg:text-right flex flex-col lg:items-end space-y-5">
          <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.16em] leading-relaxed text-white/75">
            DISCOVER
            <br />
            <strong className="text-white font-extrabold">08 LIVING INDIA</strong>
            <br />
            NATIONAL MISSIONS
          </div>

          {/* Floating Frosted Glass Telemetry Pod */}
          <div className="w-full max-w-xs rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 p-4 text-left space-y-3 shadow-2xl">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-slate-400">
              <span>LIVE VERIFIED LEDGER</span>
              <span style={{ color: currentTheme.accentHex }}>● ONLINE</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="text-xl font-mono font-bold text-white">
                  ₹{Math.round(totalRaised).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Impact Raised</div>
              </div>
              <div>
                <div className="text-xl font-mono font-bold text-white">22+1</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Indian Scripts</div>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              {onOpenLedger && (
                <button
                  type="button"
                  onClick={onOpenLedger}
                  className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 hover:text-white inline-flex items-center space-x-1 font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.trackAndLedger}</span>
                </button>
              )}
              {onOpenReferEarn && (
                <button
                  type="button"
                  onClick={onOpenReferEarn}
                  className="text-[11px] font-mono uppercase tracking-wider text-white/80 hover:text-emerald-300 inline-flex items-center space-x-1 font-semibold"
                >
                  <span>Earn</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PERSISTENT HAPE-STYLE INTERACTIVE 3D HUD BAR */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Refer & Earn Pill */}
        <div className="flex items-center space-x-2">
          {onOpenReferEarn && (
            <button
              type="button"
              onClick={onOpenReferEarn}
              className="pill-hape-cta"
            >
              <span>REFER &amp; EARN</span>
              <span className="pill-hape-circle">
                <Share2 className="w-3.5 h-3.5" />
              </span>
            </button>
          )}
        </div>

        {/* Center: Sculpted Beveled 3D Keycap Mission Switcher (PRESS [SPACE] TO SWITCH) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-white/75">
          <span>PRESS</span>
          <button
            type="button"
            onClick={cycleMissionNode}
            className="keycap-3d"
            title="Switch 3D Mission Lighting & Node (Spacebar)"
          >
            SPACE
          </button>
          <span>TO SWITCH ·</span>
          <span className="text-white font-bold" style={{ color: currentTheme.accentHex }}>
            {currentTheme.code}/ {currentTheme.label}
          </span>
        </div>

        {/* Right: Animated Scroll Cue + 5-Dot Equalizer */}
        <div className="hidden sm:flex items-center space-x-4 text-[10px] font-mono uppercase tracking-[0.16em] text-white/60">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-7 rounded-full border border-white/35 flex justify-center pt-1.5">
              <span className="w-1 h-1.5 rounded-full bg-white scroll-dot-anim" />
            </span>
            <span>Scroll to explore</span>
          </div>
          <div className="flex items-center space-x-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor: dot <= active3dIdx % 5 ? currentTheme.accentHex : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
