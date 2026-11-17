import React, { useRef, useEffect, useState } from 'react';
import { Cause } from '../types.ts';
import { ArrowRight, BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { MISSION_DOCUMENTS, MissionDocument } from '../data/missionDocuments.ts';
import { Tilt3DCard } from './Tilt3DCard.tsx';

interface MissionsCinematicProps {
  causes: Cause[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
  onOpenDocument: (causeId: string) => void;
}

function useInView(threshold = 0.08) {
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

interface MissionCardProps {
  doc: MissionDocument;
  cause?: Cause;
  isSelected: boolean;
  onSelect: () => void;
  onScrollToCatalog: () => void;
  onOpenDocument: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({
  doc,
  cause,
  isSelected,
  onSelect,
  onScrollToCatalog,
  onOpenDocument,
}) => {
  const { ref, inView } = useInView();
  const raised = cause?.raised_amount || 0;
  const target = cause?.target_amount || 500000;
  const impactCount = cause?.impact_count || 0;
  const impactMetric = cause?.impact_metric || 'Community Impact Units';
  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

  const isPanoramic = doc.projectNumber === 1 || doc.projectNumber === 6;

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(34px)',
        transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}
      className={isPanoramic ? 'lg:col-span-2' : ''}
    >
      <Tilt3DCard
        maxTilt={5.5}
        glowColor={`${doc.accent}42`}
        className={`relative overflow-hidden rounded-3xl group border transition-all duration-400 flex flex-col justify-between bg-[#0b0724]
          ${isPanoramic ? 'min-h-[470px] sm:min-h-[530px]' : 'min-h-[440px] sm:min-h-[470px]'}`}
        style={{
          borderColor: isSelected ? doc.accent : 'rgba(255,255,255,0.14)',
          boxShadow: isSelected
            ? `0 0 0 2px ${doc.accent}, 0 28px 70px -15px ${doc.accent}55`
            : `0 24px 60px -22px rgba(0,0,0,0.85), 0 0 36px -14px ${doc.accent}35`,
        }}
      >
        {/* Bespoke Regenerated 3D Mission Artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-108"
          style={{ backgroundImage: `url(${doc.imageUrl})` }}
        />

        {/* Vibrant Colourful Depth Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060416] via-[#060416]/62 to-[#060416]/15" />
        <div
          className="absolute inset-0 opacity-35 mix-blend-color pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${doc.accent}66 0%, transparent 55%, ${doc.accentSecondary}55 100%)`,
          }}
        />

        {/* Top Luminous Ribbon */}
        <div
          className="absolute top-0 inset-x-0 h-[3px] z-20"
          style={{
            background: `linear-gradient(90deg, ${doc.accent}, ${doc.accentSecondary})`,
          }}
        />

        {/* Top HUD Bar */}
        <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-3.5 py-1 rounded-full font-mono text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#060416] shadow-lg"
              style={{
                background: `linear-gradient(90deg, ${doc.accent}, ${doc.accentSecondary})`,
              }}
            >
              Project 0{doc.projectNumber}
            </span>
            <span className="inline-flex items-center space-x-1 font-mono text-[10px] text-white/90 bg-[#060416]/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
              <Clock className="w-3 h-3" style={{ color: doc.accent }} />
              <span>
                {doc.sectionCount} Chapters · {doc.readMinutes} min read
              </span>
            </span>
          </div>

          {isSelected && (
            <span
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#060416]"
              style={{ backgroundColor: doc.accent }}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Active Cause</span>
            </span>
          )}
        </div>

        {/* Bottom 3D Content Card */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-5 mt-auto">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-1.5">
              {doc.pillars.map((p) => (
                <span
                  key={p}
                  className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase px-2.5 py-0.5 rounded-full backdrop-blur-md border"
                  style={{
                    color: '#ffffff',
                    borderColor: `${doc.accent}66`,
                    backgroundColor: `${doc.accent}22`,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>

            <h3
              className="font-display font-extrabold text-white leading-[1.08] tracking-tight drop-shadow-lg"
              style={{
                fontSize: isPanoramic
                  ? 'clamp(1.85rem, 3.6vw, 3.05rem)'
                  : 'clamp(1.45rem, 2.3vw, 2rem)',
              }}
            >
              {doc.officialTitle}
            </h3>

            <p
              className="font-medium text-xs sm:text-sm"
              style={{ color: doc.accentSecondary }}
            >
              {doc.subtitle}
            </p>

            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-2 max-w-xl">
              {doc.sections[0]?.paragraphs[0] || cause?.description}
            </p>
          </div>

          {/* Live Funding Bar & Action Buttons */}
          <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: inView ? `${pct}%` : '0%',
                    background: `linear-gradient(90deg, ${doc.accent}, ${doc.accentSecondary})`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span style={{ color: doc.accent }} className="font-bold">
                  ₹{Math.round(raised).toLocaleString('en-IN')} raised
                </span>
                <span className="text-slate-300">
                  {pct}% · ₹{(target / 1000).toFixed(0)}k goal
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: doc.accent }}
                />
                <span>
                  Live · {impactCount.toLocaleString('en-IN')} {impactMetric}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenDocument}
                className="px-4 py-2.5 rounded-full glass-3d hover:border-white/50 text-white font-bold text-xs tracking-wider uppercase flex items-center space-x-2 transition active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" style={{ color: doc.accent }} />
                <span>Read Document</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelect();
                  onScrollToCatalog();
                }}
                className="px-4 py-2.5 rounded-full text-[#060416] font-extrabold text-xs tracking-wider uppercase flex items-center space-x-1.5 shadow-lg transition hover:brightness-110 active:scale-95"
                style={{
                  background: `linear-gradient(90deg, ${doc.accent}, ${doc.accentSecondary})`,
                }}
              >
                <span>Fund Mission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Tilt3DCard>
    </div>
  );
};

export const MissionsCinematic: React.FC<MissionsCinematicProps> = ({
  causes,
  selectedCauseId,
  onSelectCause,
  onScrollToCatalog,
  onOpenDocument,
}) => {
  const { ref: headerRef, inView: headerInView } = useInView(0.1);

  return (
    <section
      id="missions-showcase"
      className="relative bg-[#060416] py-20 sm:py-28 overflow-hidden border-b border-white/10"
    >
      {/* Colourful Ambient Backlights */}
      <div className="absolute top-20 right-[-10%] w-[480px] h-[480px] rounded-full bg-[#ff2e97]/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 left-[-10%] w-[480px] h-[480px] rounded-full bg-[#00f0ff]/15 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4"
          style={{
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.9s ease, transform 0.9s ease',
          }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-3d">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb800]" />
            <span className="font-mono text-[10px] tracking-[0.32em] text-[#00f0ff] uppercase font-bold">
              Living India · 8 Open National Missions
            </span>
          </div>

          <h2
            className="font-display font-extrabold text-white tracking-tight"
            style={{ fontSize: 'clamp(2.1rem, 4.8vw, 3.7rem)', lineHeight: 1.06 }}
          >
            Eight Living <span className="prism-gradient-text">India Missions</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Explore our bespoke 3D mission worlds, read each complete official Living India dossier, and direct a verified contribution from any purchase to the mission you choose.
          </p>

          {selectedCauseId && (
            <div className="pt-2">
              <button
                onClick={() => onSelectCause(null)}
                className="inline-flex items-center px-4 py-1.5 rounded-full glass-3d border-[#ffb800]/50 text-xs font-mono uppercase tracking-wider text-[#ffb800] hover:bg-white/10 transition"
              >
                Clear Selected Mission · View All 8
              </button>
            </div>
          )}
        </div>

        {/* All 8 Living India Projects (01 → 08) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {MISSION_DOCUMENTS.map((doc) => {
            const matchedCause = causes.find((c) => c.id === doc.causeId);
            return (
              <MissionCard
                key={doc.causeId}
                doc={doc}
                cause={matchedCause}
                isSelected={selectedCauseId === doc.causeId}
                onSelect={() =>
                  onSelectCause(selectedCauseId === doc.causeId ? null : doc.causeId)
                }
                onScrollToCatalog={onScrollToCatalog}
                onOpenDocument={() => onOpenDocument(doc.causeId)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
