import React from 'react';
import { Cause } from '../types.ts';
import { BookOpen, Check, ArrowUpRight } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { Tilt3DCard } from './Tilt3DCard.tsx';

interface MissionsCinematicProps {
  causes: Cause[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
  onOpenDocument: (causeId: string) => void;
}

export const MissionsCinematic: React.FC<MissionsCinematicProps> = ({
  causes,
  selectedCauseId,
  onSelectCause,
  onScrollToCatalog,
  onOpenDocument,
}) => {
  const { t } = useLanguage();
  return (
    <section
      id="missions-showcase"
      className="relative bg-[#05080A] border-b border-white/10 py-16 sm:py-24 w-full"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 65% 45% at 50% 0%, rgba(16, 185, 129, 0.14) 0%, transparent 70%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hape-Style 03 / Monumental Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-emerald-400 font-bold">
              03 / {t.missionsEyebrow}
            </div>
            <h2 className="font-display font-extrabold uppercase text-3xl sm:text-5xl text-white leading-[0.94] tracking-[-0.03em]">
              {t.missionsHeading}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">{t.missionsSubtext}</p>
          </div>

          {selectedCauseId && (
            <button
              type="button"
              onClick={() => onSelectCause(null)}
              className="self-start sm:self-end px-4 py-2 rounded-full bg-white/10 border border-emerald-400/50 text-xs font-mono uppercase tracking-wider font-semibold text-emerald-300 hover:bg-white/15"
            >
              Clear selected mission ✕
            </button>
          )}
        </div>

        {/* 8 Interactive 3D Tilt Mission Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MISSION_DOCUMENTS.map((doc) => {
            const cause = causes.find((c) => c.id === doc.causeId);
            const raised = cause?.raised_amount || 0;
            const target = cause?.target_amount || 500000;
            const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
            const isSelected = selectedCauseId === doc.causeId;

            return (
              <Tilt3DCard
                key={doc.causeId}
                className={`studio-card-3d rounded-2xl overflow-hidden flex flex-col justify-between group ${
                  isSelected ? 'border-emerald-400/80 ring-2 ring-emerald-400/30' : ''
                }`}
              >
                <div>
                  {/* Dramatic Studio Imagery + 01 / Index Marker */}
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img
                      src={doc.imageUrl}
                      alt={doc.officialTitle}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05080A] via-[#05080A]/25 to-transparent pointer-events-none" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/20 tracking-[0.14em]">
                      0{doc.projectNumber} /
                    </span>
                    {isSelected && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-400 text-[#05080A] text-[10px] font-mono uppercase font-bold inline-flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-emerald-300">
                        ₹{Math.round(raised).toLocaleString('en-IN')} {t.raisedLabel}
                      </span>
                      <span className="text-white/75">{pct}%</span>
                    </div>
                  </div>

                  {/* Card Copy */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="font-display font-bold uppercase text-sm sm:text-base text-white leading-snug">
                      {doc.officialTitle}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {doc.subtitle}
                    </p>

                    {/* Hairline Glowing Progress Track */}
                    <div className="pt-1">
                      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full progress-future rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 3)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sharp Studio Footer Actions */}
                <div className="px-4 pb-4 pt-2.5 border-t border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDocument(doc.causeId)}
                    className="flex-1 py-2 px-2.5 rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/[0.12] text-white text-[11px] font-mono uppercase tracking-wider font-semibold flex items-center justify-center space-x-1 transition-all"
                  >
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    <span>{t.readBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCause(isSelected ? null : doc.causeId);
                      onScrollToCatalog();
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold flex items-center justify-center space-x-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-400 text-[#05080A]'
                        : 'bg-white hover:bg-emerald-400 text-[#05080A]'
                    }`}
                  >
                    <span>{isSelected ? t.supportingBtn : t.supportBtn}</span>
                    {!isSelected && <ArrowUpRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </Tilt3DCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
