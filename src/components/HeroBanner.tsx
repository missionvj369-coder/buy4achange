import React from 'react';
import { ArrowDown, BookOpen, Sparkles, Zap } from 'lucide-react';
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
    <section className="relative overflow-hidden flex flex-col justify-between min-h-[92vh] bg-[#060416]">
      {/* Vibrant Multi-Colour 3D Nebula Orbs */}
      <div className="absolute -top-32 left-[-8%] w-[520px] h-[520px] rounded-full bg-[#00f0ff]/20 blur-[140px] animate-float-slow pointer-events-none" />
      <div className="absolute top-[12%] right-[-8%] w-[540px] h-[540px] rounded-full bg-[#ff2e97]/22 blur-[145px] animate-float-3d pointer-events-none" />
      <div className="absolute bottom-[10%] left-[30%] w-[460px] h-[460px] rounded-full bg-[#8b5cf6]/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[360px] h-[360px] rounded-full bg-[#ffb800]/16 blur-[130px] pointer-events-none" />

      {/* 3D Perspective Neon Horizon Grid */}
      <div className="absolute bottom-0 inset-x-0 h-[44vh] overflow-hidden opacity-40 pointer-events-none">
        <div className="w-full h-full perspective-grid-3d" />
      </div>

      {/* Main Futuristic 3D Hero Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-6xl mx-auto px-6 sm:px-8 pt-16 pb-12 space-y-8">
        <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full glass-3d">
          <Sparkles className="w-3.5 h-3.5 text-[#ffb800]" />
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-[#00f0ff] font-bold">
            Living India · Open National Movement · ugtindia.space
          </span>
        </div>

        <div className="space-y-5">
          <h1
            className="font-display font-extrabold text-white tracking-tight"
            style={{
              fontSize: 'clamp(2.5rem, 6.6vw, 5.4rem)',
              lineHeight: 1.03,
              textShadow: '0 14px 48px rgba(0, 0, 0, 0.55)',
            }}
          >
            Shop The Future.
            <br />
            <span className="prism-gradient-text">Power Living India.</span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed">
            Every physical product and interactive digital eBook you purchase directly funds your chosen Living India national mission — open to communities across every district of India.
          </p>
        </div>

        {/* Colourful 3D Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <button
            onClick={onScrollToCatalog}
            className="px-8 py-4 rounded-full prism-button text-white font-bold text-xs tracking-[0.18em] uppercase transition-all active:scale-95 flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Explore 8 Living India Missions</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          {onScrollToShop && (
            <button
              onClick={onScrollToShop}
              className="px-8 py-4 rounded-full glass-3d hover:border-[#00f0ff]/60 text-white font-bold text-xs tracking-[0.18em] uppercase transition-all active:scale-95"
            >
              Browse Store &amp; eBooks
            </button>
          )}
        </div>
      </div>

      {/* Interactive 3D 8-Project Living India Visual Dock */}
      <div className="relative z-10 border-t border-white/15 bg-[#090620]/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-3.5">
            <span className="font-mono text-[10px] tracking-[0.26em] uppercase text-[#00f0ff] font-bold">
              Living India · 8 Open National Missions · Click Any Card To Read Full Dossier
            </span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-[0.2em] text-[#ffb800] font-semibold">
              NATIONWIDE · OPEN TO ALL
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {MISSION_DOCUMENTS.map((doc) => (
              <Tilt3DCard
                key={doc.causeId}
                maxTilt={10}
                glowColor={`${doc.accent}44`}
                onClick={() =>
                  onOpenMissionDoc ? onOpenMissionDoc(doc.causeId) : onScrollToCatalog()
                }
                className="group cursor-pointer rounded-2xl overflow-hidden border border-white/15 hover:border-white/40 bg-[#100b2d]"
              >
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={doc.imageUrl}
                    alt={doc.officialTitle}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060416] via-[#060416]/45 to-transparent" />
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                    <span
                      className="px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold text-[#060416]"
                      style={{ backgroundColor: doc.accent }}
                    >
                      0{doc.projectNumber}
                    </span>
                    <BookOpen className="w-3 h-3 text-white/80 group-hover:text-[#00f0ff]" />
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
