import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Printer,
  Heart,
  List,
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
      contentRef.current.scrollTo({ top: target.offsetTop - 20, behavior: 'smooth' });
    }
  };

  const filteredSections = searchQuery.trim()
    ? doc.sections.filter(
        (s) =>
          s.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.paragraphs.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : doc.sections;

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-gray-100 shrink-0">
        <div className="h-full bg-[#166534]" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Top Reader Bar */}
      <div className="px-4 sm:px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-2 shrink-0 no-print">
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setShowTocMobile((v) => !v)}
            className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-700"
            title="Chapters"
          >
            <List className="w-4 h-4" />
          </button>
          <span className="px-2 py-0.5 rounded bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] font-mono text-[10px] font-bold shrink-0">
            0{doc.projectNumber} / 08
          </span>
          <h2 className="font-display text-sm sm:text-base font-bold text-[#14171A] truncate">
            {doc.officialTitle}
          </h2>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="hidden md:flex items-center relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document..."
              className="w-44 bg-[#FAF9F6] border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#166534]"
            />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:flex p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>

          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onSelectMission(prevDoc.causeId)}
              className="p-1.5 hover:bg-gray-50 text-gray-700"
              title="Previous Mission"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelectMission(nextDoc.causeId)}
              className="p-1.5 hover:bg-gray-50 text-gray-700 border-l border-gray-200"
              title="Next Mission"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Split */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chapter Sidebar */}
        <aside
          className={`${
            showTocMobile
              ? 'fixed inset-y-14 left-0 z-30 w-72 block shadow-xl'
              : 'hidden lg:block w-72'
          } bg-[#FAF9F6] border-r border-gray-200 overflow-y-auto shrink-0 no-print`}
        >
          <div className="p-4 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Chapters ({doc.sectionCount})
            </div>
            <nav className="space-y-1">
              {doc.sections.map((sec, idx) => (
                <button
                  key={`${sec.number}-${idx}`}
                  type="button"
                  onClick={() => scrollToSection(idx)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start space-x-2 ${
                    activeSectionIdx === idx
                      ? 'bg-[#F0FDF4] text-[#166534] font-semibold border border-[#BBF7D0]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-mono text-[10px] text-gray-400 pt-0.5 shrink-0">
                    {sec.number}
                  </span>
                  <span className="line-clamp-2">{sec.heading}</span>
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Switch Mission
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {MISSION_DOCUMENTS.map((m) => (
                  <button
                    key={m.causeId}
                    type="button"
                    onClick={() => onSelectMission(m.causeId)}
                    className={`py-1.5 rounded text-xs font-mono font-bold border ${
                      m.causeId === doc.causeId
                        ? 'bg-[#166534] text-white border-[#166534]'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    0{m.projectNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Clean Crisp Paper Article */}
        <div ref={contentRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-5 sm:px-10 py-8 sm:py-12 space-y-8">
            {/* Header */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="font-semibold text-[#166534] uppercase tracking-wider">
                  {doc.series} · Project 0{doc.projectNumber}
                </span>
                <span>•</span>
                <span className="inline-flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{doc.readMinutes} min read</span>
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#14171A] leading-tight">
                {doc.officialTitle}
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {doc.subtitle}
              </p>

              <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[16/9] bg-gray-100">
                <img
                  src={doc.imageUrl}
                  alt={doc.officialTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Chapters */}
            <div className="space-y-10">
              {filteredSections.map((sec, idx) => (
                <section
                  key={`${sec.number}-${idx}`}
                  id={`mission-sec-${doc.projectNumber}-${idx}`}
                  className="space-y-3"
                >
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#14171A] pb-2 border-b border-gray-100 flex items-baseline space-x-2">
                    <span className="font-mono text-xs text-[#166534]">{sec.number}</span>
                    <span>{sec.heading}</span>
                  </h2>

                  <div className="font-editorial text-[16px] leading-[1.8] text-gray-800 space-y-3">
                    {sec.paragraphs.map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Strip */}
      <div className="px-4 sm:px-6 py-3 bg-[#FAF9F6] border-t border-gray-200 flex items-center justify-between gap-3 shrink-0 no-print">
        <div className="text-xs text-gray-600">
          Raised:{' '}
          <strong className="text-[#166534] font-mono">
            ₹{Math.round(cause?.raised_amount || 0).toLocaleString('en-IN')}
          </strong>
        </div>
        <button
          type="button"
          onClick={() => onFundMission(doc.causeId)}
          className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs flex items-center space-x-1.5"
        >
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>Support This Mission</span>
        </button>
      </div>
    </div>
  );
};
