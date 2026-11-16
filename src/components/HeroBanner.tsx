import React from 'react';
import { ArrowDown, BookOpen, Sparkles } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';

interface HeroBannerProps {
  causes: any[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
  onScrollToShop?: () => void;
  onOpenMissionDoc?: (causeId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToCatalog,
  onScrollToShop,
  onOpenMissionDoc,
}) => {
  return (
    <section
      className="relative overflow-hidden flex flex-col justify-between"
      style={{
        minHeight: '90vh',
        background:
          'radial-gradient(ellipse 80% 60% at 50% 18%, rgba(212,175,55,0.08) 0%, rgba(16,185,129,0.04) 40%, #05070b 78%)',
      }}
    >
      {/* Subtle Architectural Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #d4af37 1px, transparent 1px), linear-gradient(to bottom, #d4af37 1px, transparent 1px)',
          backgroundSize: '88px 88px',
        }}
      />

      {/* Main Editorial Centerpiece */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-6 sm:px-8 pt-20 pb-14 space-y-8">
        <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full border border-champagne-500/30 bg-champagne-500/[0.06] backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-champagne-400" />
          <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-champagne-200">
            Living Tamilagam · Universal Guard Trust
          </span>
        </div>

        <div className="space-y-4">
          <h1
            className="font-display font-medium text-ivory-50 tracking-tight"
            style={{ fontSize: 'clamp(2.7rem, 6.8vw, 5.75rem)', lineHeight: 1.02 }}
          >
            Commerce Elevated Into{' '}
            <span className="italic gold-gradient-text font-normal">
              Living Impact
            </span>
          </h1>
          <p className="font-editorial text-base sm:text-xl text-ivory-300/85 max-w-2xl mx-auto leading-relaxed">
            Discover thoughtfully crafted goods and interactive digital editions. On every single order, you choose which of Tamil Nadu&rsquo;s eight Living Tamilagam missions your purchase directly funds.
          </p>
        </div>

        {/* Luxury Dual CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onScrollToCatalog}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-champagne-500 via-champagne-400 to-champagne-500 hover:brightness-110 text-obsidian-950 font-bold text-xs tracking-[0.18em] uppercase shadow-gold transition-all active:scale-95 flex items-center space-x-2"
          >
            <span>Explore The 8 Missions</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {onScrollToShop && (
            <button
              onClick={onScrollToShop}
              className="px-8 py-3.5 rounded-full border border-white/15 hover:border-champagne-500/60 bg-white/[0.03] hover:bg-white/[0.06] text-ivory-100 font-semibold text-xs tracking-[0.18em] uppercase transition-all"
            >
              Browse Collection
            </button>
          )}
        </div>
      </div>

      {/* Architectural 8-Project Dossier Index Strip */}
      <div className="relative z-10 border-t border-white/[0.07] bg-[#070a10]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-champagne-400/90">
              Official Living Tamilagam Dossiers · Click Any Project To Read
            </span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-[0.2em] text-slate-500">
              38 DISTRICTS · 8 MISSIONS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {MISSION_DOCUMENTS.map((doc) => (
              <button
                key={doc.causeId}
                type="button"
                onClick={() =>
                  onOpenMissionDoc ? onOpenMissionDoc(doc.causeId) : onScrollToCatalog()
                }
                className="group text-left p-2.5 rounded-xl border border-white/[0.07] hover:border-champagne-500/45 bg-white/[0.02] hover:bg-champagne-500/[0.06] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[10px] font-semibold"
                    style={{ color: doc.accent }}
                  >
                    0{doc.projectNumber}
                  </span>
                  <BookOpen className="w-3 h-3 text-slate-600 group-hover:text-champagne-400 transition-colors" />
                </div>
                <div className="text-[11px] font-semibold text-ivory-200 group-hover:text-ivory-50 line-clamp-2 mt-1 leading-snug">
                  {doc.officialTitle
                    .replace(/^Tamil\s*Nadu\s*/i, '')
                    .replace(/\s*Mission$/i, '')}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
