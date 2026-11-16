import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Printer,
  Heart,
  List,
  Type,
} from 'lucide-react';
import { Cause } from '../types.ts';
import { MISSION_DOCUMENTS, MissionDocument } from '../data/missionDocuments.ts';

interface MissionDocumentModalProps {
  causeId: string | null;
  causes: Cause[];
  onClose: () => void;
  onSelectMission: (causeId: string) => void;
  onFundMission: (causeId: string) => void;
}

export const MissionDocumentModal: React.FC<MissionDocumentModalProps> = ({
  causeId,
  causes,
  onClose,
  onSelectMission,
  onFundMission,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTocMobile, setShowTocMobile] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const docIndex = causeId
    ? MISSION_DOCUMENTS.findIndex((d) => d.causeId === causeId)
    : -1;
  const doc: MissionDocument | undefined =
    docIndex >= 0 ? MISSION_DOCUMENTS[docIndex] : undefined;
  const cause = causes.find((c) => c.id === causeId);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0 });
      setScrollProgress(0);
      setActiveSectionIdx(0);
    }
    setSearchQuery('');
  }, [causeId]);

  useEffect(() => {
    if (!causeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [causeId, onClose]);

  if (!causeId || !doc) return null;

  const prevDoc = MISSION_DOCUMENTS[(docIndex - 1 + MISSION_DOCUMENTS.length) % MISSION_DOCUMENTS.length];
  const nextDoc = MISSION_DOCUMENTS[(docIndex + 1) % MISSION_DOCUMENTS.length];

  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setScrollProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
  };

  const scrollToSection = (idx: number) => {
    setActiveSectionIdx(idx);
    setShowTocMobile(false);
    const target = document.getElementById(`mission-sec-${doc.projectNumber}-${idx}`);
    if (target && contentRef.current) {
      const top = target.offsetTop - 28;
      contentRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const filteredSections = searchQuery.trim()
    ? doc.sections.filter(
        (s) =>
          s.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.paragraphs.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : doc.sections;

  const proseSizeClass =
    fontSize === 'sm'
      ? 'text-[15px] leading-[1.82]'
      : fontSize === 'lg'
      ? 'text-[19px] leading-[1.92]'
      : 'text-[17px] leading-[1.88]';

  const heroImg = cause?.image_url
    ? cause.image_url.replace('w=800', 'w=1600')
    : '';

  return (
    <div className="fixed inset-0 z-[110] bg-[#040609]/95 backdrop-blur-xl flex flex-col">
      {/* Top Champagne Gold Reading Progress Line */}
      <div className="h-[2px] w-full bg-white/5 shrink-0">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${scrollProgress}%`,
            background: `linear-gradient(90deg, ${doc.accent}, #ebd28f)`,
          }}
        />
      </div>

      {/* Executive Reader Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 bg-[#080c13]/95 border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0 no-print">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => setShowTocMobile((v) => !v)}
            className="lg:hidden p-2 rounded-lg border border-white/10 text-ivory-200 hover:border-champagne-500/50 transition"
            title="Chapters"
          >
            <List className="w-4 h-4" />
          </button>
          <span
            className="px-2.5 py-1 rounded-full font-mono text-[10px] tracking-[0.22em] uppercase border shrink-0"
            style={{
              color: doc.accent,
              borderColor: `${doc.accent}44`,
              backgroundColor: `${doc.accent}12`,
            }}
          >
            Project {String(doc.projectNumber).padStart(2, '0')} / 08
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg font-semibold text-ivory-50 truncate tracking-wide">
              {doc.officialTitle}
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Search inside Dossier */}
          <div className="hidden md:flex items-center relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dossier..."
              className="w-44 lg:w-52 bg-white/[0.04] border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs text-ivory-100 placeholder-slate-500 focus:outline-none focus:border-champagne-500/60 transition"
            />
          </div>

          {/* Typography Size */}
          <button
            type="button"
            onClick={() =>
              setFontSize((f) => (f === 'sm' ? 'md' : f === 'md' ? 'lg' : 'sm'))
            }
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-champagne-500/50 text-xs text-ivory-200 transition"
            title="Cycle text size"
          >
            <Type className="w-3.5 h-3.5 text-champagne-400" />
            <span className="font-mono text-[10px] uppercase">{fontSize}</span>
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-champagne-500/50 text-xs text-ivory-200 transition"
            title="Print / Save PDF"
          >
            <Printer className="w-3.5 h-3.5 text-champagne-400" />
          </button>

          {/* Prev / Next Project */}
          <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onSelectMission(prevDoc.causeId)}
              className="p-1.5 hover:bg-white/10 text-ivory-200 transition"
              title={`Previous: Project ${prevDoc.projectNumber}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelectMission(nextDoc.causeId)}
              className="p-1.5 hover:bg-white/10 text-ivory-200 border-l border-white/10 transition"
              title={`Next: Project ${nextDoc.projectNumber}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/15 text-ivory-100 transition"
            title="Close dossier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Reader Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Chapter Sidebar */}
        <aside
          className={`${
            showTocMobile
              ? 'fixed inset-y-14 left-0 z-30 w-72 block'
              : 'hidden lg:block w-72 xl:w-80'
          } bg-[#070a10] border-r border-white/[0.07] overflow-y-auto shrink-0 no-print`}
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-champagne-400">
                Table of Contents
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {doc.sectionCount} Chapters
              </span>
            </div>

            <nav className="space-y-1">
              {doc.sections.map((sec, idx) => (
                <button
                  key={`${sec.number}-${idx}`}
                  type="button"
                  onClick={() => scrollToSection(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-start space-x-2.5 ${
                    activeSectionIdx === idx
                      ? 'bg-champagne-500/12 text-champagne-300 border border-champagne-500/30'
                      : 'text-slate-400 hover:text-ivory-100 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-champagne-500/80 pt-0.5 shrink-0">
                    {sec.number}
                  </span>
                  <span className="line-clamp-2 leading-snug font-medium">
                    {sec.heading}
                  </span>
                </button>
              ))}
            </nav>

            {/* Quick Jump to Other 7 Missions */}
            <div className="pt-5 border-t border-white/[0.07] space-y-2">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-500">
                Living Tamilagam Portfolio
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {MISSION_DOCUMENTS.map((m) => (
                  <button
                    key={m.causeId}
                    type="button"
                    onClick={() => onSelectMission(m.causeId)}
                    className={`py-1.5 rounded-lg font-mono text-[11px] font-semibold transition border ${
                      m.causeId === doc.causeId
                        ? 'bg-champagne-500 text-obsidian-950 border-champagne-400'
                        : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-champagne-500/40 hover:text-ivory-100'
                    }`}
                    title={m.officialTitle}
                  >
                    0{m.projectNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Editorial Document Viewport */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-[#05070b]"
        >
          {/* Editorial Hero Masthead */}
          <div className="relative overflow-hidden border-b border-white/[0.08]">
            {heroImg && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 scale-105"
                style={{ backgroundImage: `url(${heroImg})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#05070b]/60 via-[#05070b]/85 to-[#05070b]" />

            <div className="relative max-w-3xl mx-auto px-6 sm:px-10 py-14 sm:py-20 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tracking-[0.22em] uppercase">
                <span className="text-champagne-400">{doc.series}</span>
                <span className="text-slate-600">·</span>
                <span style={{ color: doc.accent }}>
                  Project 0{doc.projectNumber}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 inline-flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{doc.readMinutes} min read</span>
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.4rem] font-medium text-ivory-50 leading-[1.08] tracking-tight">
                {doc.officialTitle}
              </h1>

              <p className="font-editorial italic text-lg sm:text-xl text-champagne-200/90 leading-relaxed">
                {doc.subtitle}
              </p>

              {/* Pillars */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {doc.pillars.map((pillar) => (
                  <span
                    key={pillar}
                    className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-[0.18em] border border-white/12 bg-white/[0.03] text-ivory-200"
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Full Structured Editorial Document Body */}
          <article className="max-w-3xl mx-auto px-6 sm:px-10 py-12 sm:py-16 space-y-12">
            {filteredSections.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No sections match &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredSections.map((sec, idx) => (
                <section
                  key={`${sec.number}-${idx}`}
                  id={`mission-sec-${doc.projectNumber}-${idx}`}
                  className="scroll-mt-8 space-y-4"
                >
                  <div className="flex items-baseline space-x-3 pb-3 border-b border-white/[0.08]">
                    <span
                      className="font-mono text-xs tracking-[0.2em]"
                      style={{ color: doc.accent }}
                    >
                      {sec.number}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ivory-50 tracking-wide">
                      {sec.heading}
                    </h2>
                  </div>

                  <div className={`font-editorial text-[#ddd6c7] space-y-3.5 ${proseSizeClass}`}>
                    {sec.paragraphs.map((para, pIdx) => {
                      const isFlow = para.includes('→') || para.includes('↔');
                      const isShortBullet =
                        para.length < 75 &&
                        !para.endsWith('.') &&
                        !para.endsWith('?') &&
                        !para.endsWith(':') &&
                        !isFlow &&
                        !/^(Phase|Step|Model|Module|Core|Principle|Vision|Objective|Output)/i.test(
                          para
                        );

                      if (isFlow && para.length < 220) {
                        const steps = para.split(/\s*(?:→|↔)\s*/).filter(Boolean);
                        if (steps.length >= 3) {
                          return (
                            <div
                              key={pIdx}
                              className="my-4 p-4 rounded-2xl bg-white/[0.025] border border-champagne-500/20 flex flex-wrap items-center gap-2 font-sans"
                            >
                              {steps.map((st, sIdx) => (
                                <React.Fragment key={sIdx}>
                                  <span className="px-3 py-1 rounded-lg bg-[#0d121c] border border-white/10 text-xs font-semibold text-ivory-100">
                                    {st}
                                  </span>
                                  {sIdx < steps.length - 1 && (
                                    <span className="text-champagne-400 text-xs font-bold">
                                      →
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          );
                        }
                      }

                      if (isShortBullet) {
                        return (
                          <div
                            key={pIdx}
                            className="flex items-start space-x-3 pl-2 text-[#e8e2d5]"
                          >
                            <span
                              className="mt-2.5 w-1.5 h-1.5 rotate-45 shrink-0"
                              style={{ backgroundColor: doc.accent }}
                            />
                            <span>{para}</span>
                          </div>
                        );
                      }

                      return (
                        <p key={pIdx} className="leading-[1.88]">
                          {para}
                        </p>
                      );
                    })}
                  </div>
                </section>
              ))
            )}

            {/* End-of-Dossier Signature Footer */}
            <div className="pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-champagne-400">
                  Official Mission Proposal · UGT India
                </div>
                <div className="font-display text-2xl text-ivory-50 mt-1">
                  {doc.officialTitle}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onFundMission(doc.causeId)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-champagne-500 via-champagne-400 to-champagne-500 hover:brightness-110 text-obsidian-950 font-bold text-xs tracking-wider uppercase flex items-center space-x-2 shadow-gold transition active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-obsidian-950" />
                <span>Support This Mission</span>
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* Bottom Sticky Action Strip */}
      <div className="px-4 sm:px-8 py-3 bg-[#080c13]/95 border-t border-white/[0.08] flex items-center justify-between gap-4 shrink-0 no-print">
        <div className="flex items-center space-x-3 text-xs">
          <BookOpen className="w-4 h-4 text-champagne-400 shrink-0" />
          <span className="text-slate-400 hidden sm:inline">Live Mission Total:</span>
          <span className="font-mono font-semibold text-champagne-300">
            ₹{Math.round(cause?.raised_amount || 0).toLocaleString('en-IN')} raised
          </span>
          <span className="hidden md:inline text-slate-500">
            · {(cause?.impact_count || 0).toLocaleString('en-IN')} {cause?.impact_metric || 'lives impacted'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onFundMission(doc.causeId)}
          className="px-5 py-2 rounded-full bg-champagne-500 hover:bg-champagne-400 text-obsidian-950 font-bold text-xs tracking-wider uppercase transition active:scale-95"
        >
          Shop &amp; Fund Project 0{doc.projectNumber}
        </button>
      </div>
    </div>
  );
};
