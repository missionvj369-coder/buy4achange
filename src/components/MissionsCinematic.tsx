import React from 'react';
import { Cause } from '../types.ts';
import { Check } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

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
  const activeIdx = Math.max(
    0,
    MISSION_DOCUMENTS.findIndex((d) => d.causeId === selectedCauseId)
  );

  return (
    <section
      id="missions-showcase"
      className="relative py-20 sm:py-28 w-full"
      style={{
        background:
          'linear-gradient(180deg, #031C13 0%, #052B1D 50%, #010B07 100%)',
      }}
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-10 space-y-10">
        {/* Exact Hape.io Section 03 / Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/55">
              03 /
            </div>
            <h2 className="heading-future font-extrabold uppercase text-3xl sm:text-5xl leading-[0.98]">
              08 LIVING INDIA
              <br />
              MISSIONS
            </h2>
          </div>

          {selectedCauseId && (
            <button
              type="button"
              onClick={() => onSelectCause(null)}
              className="self-start sm:self-end text-[11px] font-mono uppercase tracking-[0.16em] text-emerald-300 hover:text-white"
            >
              Clear selection ✕
            </button>
          )}
        </div>

        {/* Exact Hape.io "OUR PARTNERS" Sharp Square Studio Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {MISSION_DOCUMENTS.map((doc) => {
            const cause = causes.find((c) => c.id === doc.causeId);
            const raised = cause?.raised_amount || 0;
            const isSelected = selectedCauseId === doc.causeId;

            return (
              <article
                key={doc.causeId}
                className={`group relative overflow-hidden bg-[#041D14] border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-400'
                    : 'border-white/10 hover:border-emerald-400/60'
                }`}
              >
                <div
                  onClick={() => onOpenDocument(doc.causeId)}
                  className="relative aspect-square overflow-hidden cursor-pointer bg-[#02120C]"
                >
                  <img
                    src={doc.imageUrl}
                    alt={doc.officialTitle}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                  {/* Cohesive Emerald Studio Color Grading Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010C08] via-[#042619]/30 to-transparent pointer-events-none" />

                  <span className="absolute top-3 left-3 text-[10px] font-mono tracking-[0.18em] text-white/80 font-bold">
                    0{doc.projectNumber} /
                  </span>

                  {isSelected && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-400 text-black text-[10px] font-mono uppercase font-bold inline-flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}

                  <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-1">
                    <h3 className="font-display font-bold uppercase text-base text-white leading-tight">
                      {doc.officialTitle}
                    </h3>
                    <div className="text-[11px] font-mono text-emerald-300">
                      ₹{Math.round(raised).toLocaleString('en-IN')} {t.raisedLabel}
                    </div>
                  </div>
                </div>

                {/* Minimal 2-Action Bar */}
                <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 text-[10px] font-mono uppercase tracking-[0.14em] font-bold">
                  <button
                    type="button"
                    onClick={() => onOpenDocument(doc.causeId)}
                    className="py-2.5 text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    {t.readBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCause(isSelected ? null : doc.causeId);
                      onScrollToCatalog();
                    }}
                    className={`py-2.5 transition-colors ${
                      isSelected
                        ? 'bg-emerald-400 text-black'
                        : 'text-emerald-300 hover:bg-emerald-400 hover:text-black'
                    }`}
                  >
                    {isSelected ? t.supportingBtn : t.supportBtn}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Exact Hape.io Hairline Studio Progress Track Underneath Gallery */}
        <div className="w-full h-[1px] bg-white/15 relative mt-6">
          <div
            className="h-[2px] bg-emerald-400 absolute top-0 transition-all duration-500"
            style={{
              width: '22%',
              left: `${Math.min(78, activeIdx * 11)}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
};
