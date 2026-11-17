import React from 'react';
import { ArrowDown, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';
import { Tilt3DCard } from './Tilt3DCard.tsx';

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
    <section className="relative overflow-hidden flex flex-col justify-between min-h-[84vh] sm:min-h-[90vh] bg-[#060416] w-full">
      {/* Contained Multi-Colour 3D Nebula Orbs (strictly clipped to prevent mobile scroll wobble) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 sm:w-[460px] h-72 sm:h-[460px] rounded-full bg-[#00f0ff]/20 blur-[110px]" />
        <div className="absolute top-[12%] -right-24 w-72 sm:w-[480px] h-72 sm:h-[480px] rounded-full bg-[#ff2e97]/22 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-72 sm:w-[420px] h-72 sm:h-[420px] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />
        <div className="hidden sm:block absolute bottom-0 inset-x-0 h-[40vh] overflow-hidden opacity-35">
          <div className="w-full h-full perspective-grid-3d" />
        </div>
      </div>

      {/* Main Futuristic 3D Hero Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-10 space-y-6 sm:space-y-8">
        {/* Universal Guard Trust & UGT India Initiative One-Line Banner */}
        <div className="inline-flex items-center space-x-2 px-3.5 sm:px-5 py-2 rounded-full glass-3d max-w-full">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00f0ff] shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-slate-100 leading-snug">
            An initiative of <strong className="text-[#00f0ff]">Universal Guard Trust</strong> &amp; <strong className="text-[#ffb800]">UGT India</strong> — turning everyday purchases into grassroots impact.
          </span>
        </div>

        <div className="space-y-4">
          <h1
            className="font-display font-extrabold text-white tracking-tight"
            style={{
              fontSize: 'clamp(2.15rem, 6.5vw, 5.2rem)',
              lineHeight: 1.05,
              textShadow: '0 14px 48px rgba(0, 0, 0, 0.55)',
            }}
          >
            Shop The Future.
            <br />
            <span className="prism-gradient-text">Power Living India.</span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed px-1">
            Every physical product and interactive digital eBook you purchase directly funds the national mission you choose across India.
          </p>
        </div>

        {/* Colourful 3D Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto pt-1">
          <button
            onClick={onScrollToCatalog}
            className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-full prism-button text-white font-bold text-xs tracking-[0.16em] uppercase transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Explore 8 Missions</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          {onScrollToShop && (
            <button
              onClick={onScrollToShop}
              className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-full glass-3d hover:border-[#00f0ff]/60 text-white font-bold text-xs tracking-[0.16em] uppercase transition-all active:scale-95"
            >
              Browse Store &amp; eBooks
            </button>
          )}
        </div>
      </div>

      {/* Interactive 8-Project Visual Dock */}
      <div className="relative z-10 border-t border-white/15 bg-[#090620]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-3 gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#00f0ff] font-bold">
              8 National Mission Dossiers · Tap Any Project To Read
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
            {MISSION_DOCUMENTS.map((doc) => (
              <Tilt3DCard
                key={doc.causeId}
                maxTilt={8}
                glowColor={`${doc.accent}44`}
                onClick={() =>
                  onOpenMissionDoc ? onOpenMissionDoc(doc.causeId) : onScrollToCatalog()
                }
                className="group cursor-pointer rounded-2xl overflow-hidden border border-white/15 hover:border-white/40 bg-[#100b2d]"
              >
                <div className="relative h-20 sm:h-24 overflow-hidden">
                  <img
                    src={doc.imageUrl}
                    alt={doc.officialTitle}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060416] via-[#060416]/50 to-transparent" />
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                    <span
                      className="px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold text-[#060416]"
                      style={{ backgroundColor: doc.accent }}
                    >
                      0{doc.projectNumber}
                    </span>
                    <BookOpen className="w-3 h-3 text-white/80" />
                  </div>
                  <div className="absolute bottom-1.5 inset-x-2 text-[10px] font-bold text-white line-clamp-2 leading-tight">
                    {doc.officialTitle
                      .replace(/^India\s*/i, '')
                      .replace(/\s*Mission$/i, '')}
                  </div>
                </div>
              </Tilt3DCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
