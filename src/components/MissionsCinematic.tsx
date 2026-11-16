import React, { useRef, useEffect, useState } from 'react';
import { Cause } from '../types.ts';
import {
  ArrowRight,
  Heart,
  Users,
  Droplets,
  Leaf,
  Mountain,
  Dumbbell,
  Music,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

interface MissionsCinematicProps {
  causes: Cause[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
}

const MISSION_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  'Everyday Essentials': Heart,
  'Women Entrepreneurship': Users,
  'AI Free Training': Cpu,
  'Water Security': Droplets,
  'Protect the Earth': Leaf,
  'Hill and City': Mountain,
  'Sports Ecosystem': Dumbbell,
  'Living Culture': Music,
};

const MISSION_GRADIENTS: string[] = [
  'from-emerald-950/90 via-emerald-950/45 to-transparent',
  'from-violet-950/90 via-violet-950/45 to-transparent',
  'from-cyan-950/90 via-cyan-950/45 to-transparent',
  'from-blue-950/90 via-blue-950/45 to-transparent',
  'from-green-950/90 via-green-950/45 to-transparent',
  'from-orange-950/90 via-orange-950/45 to-transparent',
  'from-rose-950/90 via-rose-950/45 to-transparent',
  'from-amber-950/90 via-amber-950/45 to-transparent',
];

const MISSION_ACCENT: string[] = [
  '#10b981',
  '#a78bfa',
  '#22d3ee',
  '#60a5fa',
  '#4ade80',
  '#fb923c',
  '#fb7185',
  '#fbbf24',
];

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function getHighResImageUrl(url: string): string {
  if (!url) return '';
  if (url.includes('w=800')) {
    return url.replace('w=800', 'w=1600');
  }
  return url;
}

interface MissionCardProps {
  cause: Cause;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onScrollToCatalog: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({
  cause,
  index,
  isSelected,
  onSelect,
  onScrollToCatalog,
}) => {
  const { ref, inView } = useInView();
  const Icon = MISSION_ICONS[cause.title] || Heart;
  const gradient = MISSION_GRADIENTS[index % MISSION_GRADIENTS.length];
  const accent = MISSION_ACCENT[index % MISSION_ACCENT.length];
  const pct =
    cause.target_amount > 0
      ? Math.min(100, Math.round((cause.raised_amount / cause.target_amount) * 100))
      : 0;

  // Alternating cinematic rhythm: cards 0 and 5 are panoramic full-width widescreen scenes
  const isWidescreen = index === 0 || index === 5;
  const highResBg = getHighResImageUrl(cause.image_url);

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.98)',
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${(index % 2) * 0.1}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${(index % 2) * 0.1}s`,
        ...(isSelected
          ? { boxShadow: `0 0 0 2px ${accent}, 0 0 36px ${accent}33` }
          : {}),
      }}
      className={`relative overflow-hidden rounded-3xl cursor-pointer group border border-white/10 hover:border-white/20 transition-colors
        ${isWidescreen ? 'sm:col-span-2 h-[440px] sm:h-[520px]' : 'h-[380px] sm:h-[440px]'}`}
      onClick={() => {
        onSelect();
        onScrollToCatalog();
      }}
    >
      {/* Full-bleed cinematic photography */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
        style={{
          backgroundImage: `url(${highResBg})`,
        }}
      />

      {/* Cinematic lighting & depth overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#04070d] via-[#04070d]/55 to-black/25" />
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-80`} />

      {/* Subtle film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.75)] pointer-events-none rounded-3xl" />

      {/* Top Bar: Chapter Number + Category + Selected Indicator */}
      <div className="absolute top-5 left-5 right-5 sm:top-7 sm:left-7 sm:right-7 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <span
            className="px-2.5 py-1 rounded-full backdrop-blur-md border border-white/15 bg-black/40"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.62rem',
              letterSpacing: '0.28em',
              color: accent,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Mission {String(index + 1).padStart(2, '0')}
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] text-slate-300/80 font-semibold">
            {cause.category}
          </span>
        </div>

        {isSelected && (
          <span
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: accent, color: '#020408' }}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Active Filter</span>
          </span>
        )}
      </div>

      {/* Bottom Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10 z-10">
        {/* Icon Emblem */}
        <div
          className="mb-3 w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/15 group-hover:scale-110 transition-transform duration-500"
          style={{ background: `${accent}24` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>

        {/* Mission Title */}
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: isWidescreen
              ? 'clamp(1.65rem, 3.8vw, 2.9rem)'
              : 'clamp(1.25rem, 2.4vw, 1.85rem)',
            letterSpacing: '0.03em',
            color: '#ffffff',
            lineHeight: 1.12,
          }}
          className="drop-shadow-lg"
        >
          {cause.title}
        </h3>

        {/* Tagline */}
        <p
          className="mt-1.5 font-medium tracking-wide"
          style={{
            color: accent,
            fontSize: isWidescreen ? '0.9rem' : '0.78rem',
          }}
        >
          {cause.tagline}
        </p>

        {/* Description */}
        <p
          className="text-slate-300/85 leading-relaxed mt-2 mb-5"
          style={{
            fontSize: isWidescreen ? '0.88rem' : '0.78rem',
            maxWidth: isWidescreen ? '580px' : '420px',
            display: '-webkit-box',
            WebkitLineClamp: isWidescreen ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {cause.description}
        </p>

        {/* Progress & Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-3 border-t border-white/10">
          <div className="space-y-1.5 flex-1 max-w-xs">
            <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: inView ? `${pct}%` : '0%',
                  background: `linear-gradient(90deg, ${accent}, #ffffff)`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: accent, fontWeight: 700 }}>
                ₹{Math.round(cause.raised_amount || 0).toLocaleString('en-IN')} raised
              </span>
              <span className="text-slate-400">
                {pct}% of ₹{(cause.target_amount / 1000).toFixed(0)}k goal
              </span>
            </div>
            <div className="text-[11px] text-slate-300/75 font-medium flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Live · {(cause.impact_count || 0).toLocaleString('en-IN')} {cause.impact_metric}
              </span>
            </div>
          </div>

          <button
            className="self-start sm:self-end flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all group-hover:translate-x-0.5 active:scale-95 shrink-0"
            style={{
              background: accent,
              color: '#020408',
              boxShadow: `0 6px 24px ${accent}40`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
              onScrollToCatalog();
            }}
          >
            <span>Support Mission</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MissionsCinematic: React.FC<MissionsCinematicProps> = ({
  causes,
  selectedCauseId,
  onSelectCause,
  onScrollToCatalog,
}) => {
  const { ref: headerRef, inView: headerInView } = useInView(0.1);

  if (causes.length === 0) return null;

  return (
    <section
      id="missions-showcase"
      className="relative bg-[#070b14] py-16 sm:py-24 overflow-hidden border-b border-slate-800/60"
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(5,150,105,0.12) 0%, transparent 80%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div
          ref={headerRef}
          className="text-center mb-12 sm:mb-16"
          style={{
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.9s ease, transform 0.9s ease',
          }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-emerald-500/60" />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.68rem',
                letterSpacing: '0.38em',
                color: '#6ee7b7',
                textTransform: 'uppercase',
              }}
            >
              UGT India · Eight Living Causes
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-emerald-500/60" />
          </div>

          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 'clamp(1.9rem, 4.8vw, 3.3rem)',
              letterSpacing: '0.04em',
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            The Eight National Missions
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Every purchase funds the mission you choose. Explore all eight grassroots initiatives powering communities across India.
          </p>

          {selectedCauseId && (
            <button
              onClick={() => onSelectCause(null)}
              className="mt-5 inline-flex items-center px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-xs text-amber-300 hover:bg-amber-500/25 font-semibold transition"
            >
              Clear Mission Filter · Show All 8 Missions
            </button>
          )}
        </div>

        {/* Cinematic Visual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-7">
          {causes.map((cause, i) => (
            <MissionCard
              key={cause.id}
              cause={cause}
              index={i}
              isSelected={selectedCauseId === cause.id}
              onSelect={() =>
                onSelectCause(selectedCauseId === cause.id ? null : cause.id)
              }
              onScrollToCatalog={onScrollToCatalog}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
