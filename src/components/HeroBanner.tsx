import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpRight, Share2 } from 'lucide-react';
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
  { left: '16%', top: '44%', size: 4, delay: '0s' },
  { left: '24%', top: '38%', size: 3, delay: '1.2s' },
  { left: '30%', top: '54%', size: 2.5, delay: '2.4s' },
  { left: '72%', top: '32%', size: 3.5, delay: '0.8s' },
  { left: '80%', top: '48%', size: 3, delay: '1.9s' },
  { left: '64%', top: '22%', size: 4, delay: '3.1s' },
  { left: '12%', top: '68%', size: 2.5, delay: '2.1s' },
  { left: '86%', top: '62%', size: 3, delay: '0.5s' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenLedger,
  onOpenReferEarn,
}) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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
    <section
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-[100svh] min-h-[640px] max-h-[940px] overflow-hidden flex flex-col justify-between bg-[#063825]"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 68% 64% at 50% 48%, #0E6946 0%, #07412B 52%, #02160E 96%)',
      }}
    >
      {/* Subtle Diagonal White-Hot Studio Light Bar Behind Subject (Signature Hape Depth Cue) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6%] top-[44%] w-[46vw] h-[14px] sm:h-[18px] bg-white/95 rotate-[17deg] shadow-[0_0_28px_8px_rgba(52,211,153,0.65)] z-10 opacity-85"
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

      {/* MASSIVE MONUMENTAL JET-BLACK WORDMARK (Exact Hape.io Poster Contrast & Placement) */}
      <div className="relative z-10 pt-24 sm:pt-28 px-3 sm:px-8 w-full flex justify-center select-none pointer-events-none">
        <h1 className="font-display font-bold text-[#020A07] text-[10.8vw] sm:text-[8.6vw] xl:text-[118px] leading-[0.88] tracking-[-0.045em] whitespace-nowrap">
          Buy4AChange<sup className="text-[4.2vw] sm:text-[3.4vw] xl:text-[46px] font-medium align-super">®</sup>INDIA
        </h1>
      </div>

      {/* ONLY THE TWO TINY FLANKING HAPE-STYLE MICRO-CAPTIONS (ZERO EXTRA TEXT OR BOXES) */}
      <div className="relative z-30 max-w-[1440px] w-full mx-auto px-5 sm:px-10 grid grid-cols-12 items-start pointer-events-none -mt-2 sm:mt-0">
        <div className="col-span-6 sm:col-span-4 text-[10px] sm:text-[11px] uppercase leading-[1.35] tracking-[0.06em] text-black/90 max-w-[190px]">
          <strong className="font-extrabold text-black">{scene.captionLeftBold}</strong>{' '}
          <span className="font-medium">{scene.captionLeftRest}</span>
        </div>

        <div className="hidden sm:block sm:col-span-2" />

        <div className="col-span-6 sm:col-span-4 text-[10px] sm:text-[11px] uppercase leading-[1.35] tracking-[0.06em] text-black/90 text-right sm:text-left">
          <div className="font-medium">{scene.captionRightTop}</div>
          <div className="font-extrabold text-black">{scene.captionRightBold}</div>
          <div className="font-medium">{scene.captionRightBottom}</div>
        </div>
      </div>

      {/* FULL-BLEED SEAMLESS 3D STUDIO CENTERPIECE WITH INTERACTIVE 3D PARALLAX */}
      <div className="absolute inset-x-0 bottom-0 top-[18%] sm:top-[16%] z-20 flex items-end justify-center pointer-events-none overflow-hidden">
        <div
          className="relative w-full max-w-[780px] h-full flex items-end justify-center transition-transform duration-300 ease-out"
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
                'radial-gradient(ellipse 68% 76% at 50% 58%, #000 54%, rgba(0,0,0,0.65) 74%, transparent 94%)',
              maskImage:
                'radial-gradient(ellipse 68% 76% at 50% 58%, #000 54%, rgba(0,0,0,0.65) 74%, transparent 94%)',
            }}
          />
        </div>
      </div>

      {/* Bottom Edge Studio Ground Fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#02140D] via-[#02140D]/55 to-transparent z-20"
      />

      {/* EXACT HAPE.IO BOTTOM HUD BAR (Ultra-Clean, Zero Clutter) */}
      <div className="relative z-30 max-w-[1440px] w-full mx-auto px-4 sm:px-10 pb-6 sm:pb-8 flex items-center justify-between gap-3">
        {/* Bottom-Left: IMPACT LEDGER Pill + Refer Circle */}
        <div className="flex items-center space-x-2">
          {onOpenLedger && (
            <button type="button" onClick={onOpenLedger} className="pill-hape-cta">
              <span>IMPACT LEDGER</span>
              <span className="pill-hape-circle">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </button>
          )}
          {onOpenReferEarn && (
            <button
              type="button"
              onClick={onOpenReferEarn}
              aria-label="Refer and Earn"
              title="Refer & Earn"
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/15 flex items-center justify-center transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bottom-Center: Sculpted Beveled Keycap Switcher + Scroll Indicator */}
        <div className="flex flex-col items-center space-y-2">
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
            SWITCH 3D VIEW
          </button>
          <div className="hidden md:flex items-center space-x-2 text-[11px] text-white/75">
            <span className="w-4 h-6 rounded-full border border-white/50 flex justify-center pt-1">
              <span className="w-1 h-1.5 rounded-full bg-white scroll-dot-anim" />
            </span>
            <span>Scroll to explore.</span>
          </div>
        </div>

        {/* Bottom-Right: REFER & EARN Link + 5-Dot Equalizer */}
        <div className="hidden sm:flex items-center space-x-6 text-[10px] font-mono uppercase tracking-[0.18em] text-white/85">
          {onOpenReferEarn && (
            <button
              type="button"
              onClick={onOpenReferEarn}
              className="hover:text-emerald-300 inline-flex items-center space-x-1 font-bold transition-colors"
            >
              <span>REFER &amp; EARN</span>
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
  );
};
