import React, { useRef, useEffect, useState } from 'react';
import { Cause } from '../types.ts';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { MISSION_DOCUMENTS, MissionDocument } from '../data/missionDocuments.ts';

interface MissionsCinematicProps {
  causes: Cause[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
  onOpenDocument: (causeId: string) => void;
}

function useInView(threshold = 0.1) {
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

function getHighResImageUrl(url?: string): string {
  if (!url) return '';
  return url.includes('w=800') ? url.replace('w=800', 'w=1600') : url;
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

  // Alternating editorial gallery rhythm: Project 01 and Project 06 span full width
  const isPanoramic = doc.projectNumber === 1 || doc.projectNumber === 6;
  const highResBg = getHighResImageUrl(cause?.image_url);

  return (
    <article
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1), transform 0.85s cubic-bezier(0.16,1,0.3,1)`,
        ...(isSelected
          ? { boxShadow: `0 0 0 1.5px ${doc.accent}, 0 24px 60px -15px ${doc.accent}33` }
          : {}),
      }}
      className={`relative overflow-hidden rounded-3xl group border border-white/[0.08] hover:border-champagne-500/40 transition-all duration-500 flex flex-col justify-between bg-[#090d14]
        ${isPanoramic ? 'lg:col-span-2 min-h-[470px] sm:min-h-[520px]' : 'min-h-[430px] sm:min-h-[460px]'}`}
    >
      {/* Full-bleed Photography */}
      {highResBg && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 opacity-75"
          style={{ backgroundImage: `url(${highResBg})` }}
        />
      )}

      {/* Luxury Obsidian Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b]/75 to-[#05070b]/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070b]/90 via-[#05070b]/35 to-transparent" />

      {/* Top Metadata Bar */}
      <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span
            className="px-3 py-1 rounded-full font-mono text-[10px] font-semibold tracking-[0.25em] uppercase backdrop-blur-md border"
            style={{
              color: doc.accent,
              borderColor: `${doc.accent}45`,
              backgroundColor: 'rgba(5,7,11,0.7)',
            }}
          >
            Project 0{doc.projectNumber}
          </span>
          <span className="hidden sm:inline-flex items-center space-x-1 font-mono text-[10px] text-ivory-300/75 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
            <Clock className="w-3 h-3 text-champagne-400" />
            <span>
              {doc.sectionCount} Chapters · {doc.readMinutes} min
            </span>
          </span>
        </div>

        {isSelected && (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-champagne-400 text-obsidian-950">
            <CheckCircle2 className="w-3 h-3" />
            <span>Selected Cause</span>
          </span>
        )}
      </div>

      {/* Bottom Editorial Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-5 mt-auto">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            {doc.pillars.map((p) => (
              <span
                key={p}
                className="font-mono text-[9px] tracking-[0.2em] uppercase text-champagne-200/80 px-2 py-0.5 rounded border border-white/10 bg-black/35"
              >
                {p}
              </span>
            ))}
          </div>

          <h3
            className="font-display font-medium text-ivory-50 leading-[1.08] tracking-tight"
            style={{
              fontSize: isPanoramic
                ? 'clamp(1.9rem, 3.8vw, 3.2rem)'
                : 'clamp(1.5rem, 2.5vw, 2.15rem)',
            }}
          >
            {doc.officialTitle}
          </h3>

          <p className="font-editorial italic text-champagne-200/90 text-sm sm:text-base">
            {doc.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed line-clamp-2 max-w-xl">
            {doc.sections[0]?.paragraphs[0] || cause?.description}
          </p>
        </div>

        {/* Live Telemetry & Dual Luxury Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 flex-1 max-w-xs">
            <div className="w-full h-[3px] rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: inView ? `${pct}%` : '0%',
                  background: `linear-gradient(90deg, ${doc.accent}, #ebd28f)`,
                }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span style={{ color: doc.accent }} className="font-semibold">
                ₹{Math.round(raised).toLocaleString('en-IN')} raised
              </span>
              <span className="text-slate-400">
                {pct}% · ₹{(target / 1000).toFixed(0)}k goal
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Live · {impactCount.toLocaleString('en-IN')} {impactMetric}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenDocument}
              className="px-4 py-2.5 rounded-full border border-champagne-500/50 bg-black/50 hover:bg-champagne-500/15 text-champagne-200 hover:text-ivory-50 font-semibold text-xs tracking-wider uppercase flex items-center space-x-2 backdrop-blur-md transition active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-champagne-400" />
              <span>Read Full Document</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelect();
                onScrollToCatalog();
              }}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-champagne-500 to-champagne-400 hover:brightness-110 text-obsidian-950 font-bold text-xs tracking-wider uppercase flex items-center space-x-1.5 shadow-gold transition active:scale-95"
            >
              <span>Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
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
      className="relative bg-[#05070b] py-20 sm:py-28 overflow-hidden border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Section Header */}
        <div
          ref={headerRef}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4"
          style={{
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.9s ease, transform 0.9s ease',
          }}
        >
          <div className="flex items-center justify-center space-x-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-champagne-500/60" />
            <span className="font-mono text-[10px] tracking-[0.38em] text-champagne-400 uppercase">
              Living Tamilagam · Official Blueprints
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-champagne-500/60" />
          </div>

          <h2
            className="font-display font-medium text-ivory-50 tracking-tight"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.06 }}
          >
            The Eight National <span className="italic gold-gradient-text font-normal">Missions</span>
          </h2>

          <p className="font-editorial text-ivory-300/80 text-base sm:text-lg leading-relaxed">
            Read the complete official Living Tamilagam project dossier for each mission, then direct a verified contribution from any purchase toward the future you believe in.
          </p>

          {selectedCauseId && (
            <div className="pt-2">
              <button
                onClick={() => onSelectCause(null)}
                className="inline-flex items-center px-4 py-1.5 rounded-full border border-champagne-500/40 bg-champagne-500/10 text-xs font-mono uppercase tracking-wider text-champagne-300 hover:bg-champagne-500/20 transition"
              >
                Clear Selected Mission · View All 8
              </button>
            </div>
          )}
        </div>

        {/* All 8 Projects in Official Living Tamilagam Order (Project 01 -> Project 08) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
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
