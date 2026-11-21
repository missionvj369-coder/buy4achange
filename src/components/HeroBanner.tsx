import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpRight, Share2, Store, MapPin } from 'lucide-react';
import { Cause } from '../types.ts';

interface HeroBannerProps {
  causes: Cause[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
  onScrollToShop?: () => void;
  onOpenMissionDoc?: (causeId: string) => void;
  onOpenLedger?: () => void;
  onOpenReferEarn?: () => void;
  onOpenSellerPortal?: () => void;
  onOpenIndiaMap?: () => void;
}

const LIVING_INDIA_SCENES = [
  {
    id: 'guardian',
    image: '/hero/hero-01-guardian.jpg',
    alt: 'Living India Earth Guardian 3D Sculpture',
    captionLeftBold: 'ZERO-CHEMICAL',
    captionLeftRest: 'AND PURE TO REDEFINE CONSCIOUS COMMERCE',
    captionRightTop: 'DISCOVER',
    captionRightBold: '08 LIVING INDIA',
    captionRightBottom: 'NATIONAL MISSIONS',
  },
  {
    id: 'earth',
    image: '/hero/hero-02-earth.jpg',
    alt: 'Living Earth Sacred Banyan 3D Sculpture',
    captionLeftBold: 'EVERY ORDER',
    captionLeftRest: 'FUNDS LIVING SOIL, WATER & ARTISANS',
    captionRightTop: 'POWERED BY',
    captionRightBold: '100% VERIFIED',
    captionRightBottom: 'PUBLIC IMPACT LEDGER',
  },
  {
    id: 'lotus',
    image: '/hero/hero-03-lotus.jpg',
    alt: 'Future India Craftsmanship Lotus 3D Vessel',
    captionLeftBold: 'CRAFTED IN INDIA',
    captionLeftRest: 'UNITING HERITAGE ARTISANS & FUTURE TECH',
    captionRightTop: 'BUILT FOR',
    captionRightBold: '22+1 INDIAN',
    captionRightBottom: 'LANGUAGES & REGIONS',
  },
];

const BOKEH_MOTES = [
  { left: '14%', top: '42%', size: 4, delay: '0s' },
  { left: '22%', top: '36%', size: 3, delay: '1.2s' },
  { left: '27%', top: '56%', size: 2.5, delay: '2.4s' },
  { left: '74%', top: '34%', size: 3.5, delay: '0.8s' },
  { left: '82%', top: '48%', size: 3, delay: '1.9s' },
  { left: '66%', top: '22%', size: 4, delay: '3.1s' },
  { left: '11%', top: '68%', size: 2.5, delay: '2.1s' },
  { left: '88%', top: '64%', size: 3, delay: '0.5s' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  causes,
  onOpenLedger,
  onOpenReferEarn,
  onOpenSellerPortal,
  onOpenIndiaMap,
}) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const totalRaised = causes.reduce((sum, c) => sum + (c.raised_amount || 0), 0);

  const switchScene = () => setSceneIdx((i) => (i + 1) % LIVING_INDIA_SCENES.length);

  // Spacebar switches the 3D Living India centerpiece (exact HAPEBAR interaction)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setSceneIdx((i) => (i + 1) % LIVING_INDIA_SCENES.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: nx * 16, y: ny * 10 });
  };

  const handlePointerLeave = () => setTilt({ x: 0, y: 0 });

  const scene = LIVING_INDIA_SCENES[sceneIdx];

  return (
    <>
      <section
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full h-[100svh] min-h-[640px] max-h-[940px] overflow-hidden flex flex-col justify-between bg-[#063825]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 68% 64% at 50% 48%, #0E6946 0%, #07412B 52%, #02160E 96%)',
        }}
      >
        {/* Diagonal White-Hot Studio Light Bar Behind Subject */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-6%] top-[44%] w-[44vw] h-[14px] sm:h-[18px] bg-white/95 rotate-[17deg] shadow-[0_0_28px_8px_rgba(52,211,153,0.65)] z-10 opacity-85"
        />

        {/* Ambient Floating Studio Bokeh Dust Motes */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {BOKEH_MOTES.map((m, idx) => (
            <span
              key={idx}
              className="mote-dot absolute rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,0.65)]"
              style={{
                left: m.left,
                top: m.top,
                width: `${m.size}px`,
                height: `${m.size}px`,
                animationDelay: m.delay,
              }}
            />
          ))}
        </div>

        {/* MASSIVE MONUMENTAL JET-BLACK WORDMARK */}
        <div className="relative z-10 pt-24 sm:pt-28 px-3 sm:px-8 w-full flex justify-center select-none pointer-events-none">
          <h1 className="font-display font-bold text-[#020A07] text-[10.5vw] sm:text-[8.6vw] xl:text-[118px] leading-[0.88] tracking-[-0.045em] whitespace-nowrap">
            Buy4AChange<sup className="text-[4vw] sm:text-[3.4vw] xl:text-[46px] font-medium align-super">®</sup>INDIA
          </h1>
        </div>

        {/* FAR-LEFT & FAR-RIGHT OUTER FLANK CAPTIONS — COMPLETELY CLEAR OF THE 3D GUARDIAN'S FACE */}
        <div className="relative z-30 max-w-[1440px] w-full mx-auto px-4 sm:px-10 flex items-start justify-between gap-4 pointer-events-none -mt-1 sm:mt-2">
          <div className="text-[9px] sm:text-[11px] uppercase leading-[1.35] tracking-[0.07em] text-black/90 max-w-[140px] sm:max-w-[190px]">
            <strong className="font-extrabold text-black">{scene.captionLeftBold}</strong>{' '}
            <span className="font-medium">{scene.captionLeftRest}</span>
          </div>

          <div className="text-[9px] sm:text-[11px] uppercase leading-[1.35] tracking-[0.07em] text-black/90 text-right max-w-[140px] sm:max-w-[190px]">
            <div className="font-medium">{scene.captionRightTop}</div>
            <div className="font-extrabold text-black">{scene.captionRightBold}</div>
            <div className="font-medium">{scene.captionRightBottom}</div>
          </div>
        </div>

        {/* FULL-BLEED SEAMLESS 3D STUDIO CENTERPIECE WITH INTERACTIVE 3D PARALLAX */}
        <div className="absolute inset-x-0 bottom-0 top-[20%] sm:top-[17%] z-20 flex items-end justify-center pointer-events-none overflow-hidden">
          <div
            className="relative w-full max-w-[760px] h-full flex items-end justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(1200px) translate3d(${(-tilt.x).toFixed(1)}px, ${(-tilt.y).toFixed(1)}px, 0) rotateY(${(tilt.x * 0.25).toFixed(2)}deg) rotateX(${(-tilt.y * 0.2).toFixed(2)}deg)`,
            }}
          >
            <img
              key={scene.id}
              src={scene.image}
              alt={scene.alt}
              className="w-full h-full object-contain object-bottom select-none"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 66% 75% at 50% 58%, #000 54%, rgba(0,0,0,0.62) 74%, transparent 94%)',
                maskImage:
                  'radial-gradient(ellipse 66% 75% at 50% 58%, #000 54%, rgba(0,0,0,0.62) 74%, transparent 94%)',
              }}
            />
          </div>
        </div>

        {/* Bottom Edge Studio Ground Fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#02140D] via-[#02140D]/60 to-transparent z-20"
        />

        {/* BOTTOM HUD BAR — HIGHLIGHTING REFER & EARN + SELL WITH US + 3D SWITCHER */}
        <div className="relative z-30 max-w-[1440px] w-full mx-auto px-4 sm:px-10 pb-6 sm:pb-8 flex flex-wrap items-center justify-between gap-3">
          {/* Bottom-Left: Highlighted REFER & EARN + SELL WITH US Attention Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenReferEarn && (
              <button
                type="button"
                onClick={onOpenReferEarn}
                className="inline-flex items-center space-x-2.5 pl-4 pr-1.5 py-1.5 rounded-full bg-emerald-400 hover:bg-white text-black text-[10px] font-mono uppercase tracking-[0.14em] font-extrabold shadow-[0_0_24px_-4px_rgba(52,211,153,0.75)] transition-all"
              >
                <span>REFER &amp; EARN 5%</span>
                <span className="w-7 h-7 rounded-full bg-black text-emerald-300 flex items-center justify-center">
                  <Share2 className="w-3.5 h-3.5" />
                </span>
              </button>
            )}

            {onOpenSellerPortal && (
              <button
                type="button"
                onClick={onOpenSellerPortal}
                className="pill-hape-cta border-amber-300/45 hover:border-amber-300"
              >
                <span className="text-amber-200">SELL WITH US</span>
                <span className="pill-hape-circle bg-amber-300 text-black">
                  <Store className="w-3.5 h-3.5" />
                </span>
              </button>
            )}
          </div>

          {/* Bottom-Center: Sculpted Beveled Keycap Switcher + Scroll Cue */}
          <div className="flex flex-col items-center space-y-1.5">
            <div className="hidden sm:flex items-center space-x-2.5 text-[10px] font-mono uppercase tracking-[0.16em] text-white/80">
              <span>PRESS</span>
              <button type="button" onClick={switchScene} className="keycap-3d">
                SPACE
              </button>
              <span>TO SWITCH</span>
            </div>
            <button
              type="button"
              onClick={switchScene}
              className="sm:hidden keycap-3d text-[9px] px-4 py-1.5"
            >
              SWITCH 3D
            </button>
            <div className="hidden lg:flex items-center space-x-2 text-[11px] text-white/70">
              <span className="w-4 h-6 rounded-full border border-white/45 flex justify-center pt-1">
                <span className="w-1 h-1.5 rounded-full bg-white scroll-dot-anim" />
              </span>
              <span>Scroll to explore.</span>
            </div>
          </div>

          {/* Bottom-Right: 3D INDIA LIVE MAP + IMPACT LEDGER + 5 Dots */}
          <div className="hidden sm:flex items-center space-x-4 text-[10px] font-mono uppercase tracking-[0.16em] text-white/85">
            {onOpenIndiaMap && (
              <button
                type="button"
                onClick={onOpenIndiaMap}
                className="pill-hape-cta border-emerald-400/40"
              >
                <span>3D INDIA MAP</span>
                <span className="pill-hape-circle">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
              </button>
            )}
            {onOpenLedger && (
              <button
                type="button"
                onClick={onOpenLedger}
                className="hover:text-emerald-300 inline-flex items-center space-x-1 font-bold transition-colors"
              >
                <span>LEDGER</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="flex items-center space-x-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  className={`w-1 h-1 rounded-full ${
                    dot === sceneIdx ? 'bg-emerald-300' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HIGH-ATTENTION SPOTLIGHT RAIL: REFER & EARN · SELL WITH US · 3D INDIA LIVE MAP */}
      <section className="w-full bg-[#02120B] border-y border-white/10">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-10 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {onOpenReferEarn && (
            <button
              type="button"
              onClick={onOpenReferEarn}
              className="group text-left p-5 bg-gradient-to-br from-emerald-950/90 to-[#031C13] border border-emerald-400/35 hover:border-emerald-300 transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300 font-bold">
                  <span className="live-dot" />
                  <span>EARN 5% INCOME</span>
                </div>
                <div className="font-display font-extrabold uppercase text-base sm:text-lg text-white">
                  REFER &amp; EARN ON SOCIALS
                </div>
                <div className="text-xs text-white/60">
                  Share any product link &amp; withdraw verified earnings via UPI.
                </div>
              </div>
              <span className="w-10 h-10 rounded-full bg-emerald-400 group-hover:bg-white text-black flex items-center justify-center shrink-0 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </button>
          )}

          {onOpenSellerPortal && (
            <button
              type="button"
              onClick={onOpenSellerPortal}
              className="group text-left p-5 bg-gradient-to-br from-amber-950/45 via-[#062419] to-[#031710] border border-amber-300/35 hover:border-amber-300 transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300 font-bold">
                  <Store className="w-3 h-3" />
                  <span>MANUFACTURERS · SHGs · FPOs</span>
                </div>
                <div className="font-display font-extrabold uppercase text-base sm:text-lg text-white">
                  SELL WITH BUY4ACHANGE
                </div>
                <div className="text-xs text-white/60">
                  Upload Quality &amp; Zero-Chemical certificates to sell nationwide.
                </div>
              </div>
              <span className="w-10 h-10 rounded-full bg-amber-300 group-hover:bg-white text-black flex items-center justify-center shrink-0 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </button>
          )}

          {onOpenIndiaMap && (
            <button
              type="button"
              onClick={onOpenIndiaMap}
              className="group text-left p-5 bg-gradient-to-br from-cyan-950/45 via-[#052319] to-[#031710] border border-cyan-300/30 hover:border-cyan-300 transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-300 font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>₹{Math.round(totalRaised).toLocaleString('en-IN')} LIVE VERIFIED</span>
                </div>
                <div className="font-display font-extrabold uppercase text-base sm:text-lg text-white">
                  3D INDIA LIVE MAP
                </div>
                <div className="text-xs text-white/60">
                  Inspect real-time missions, verified makers &amp; GPS field audits.
                </div>
              </div>
              <span className="w-10 h-10 rounded-full bg-white group-hover:bg-emerald-300 text-black flex items-center justify-center shrink-0 transition-colors">
                <MapPin className="w-4 h-4" />
              </span>
            </button>
          )}
        </div>
      </section>
    </>
  );
};
