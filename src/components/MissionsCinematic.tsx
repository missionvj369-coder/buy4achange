import React from 'react';
import { Cause } from '../types.ts';
import { BookOpen, Check, ArrowUpRight } from 'lucide-react';
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
  return (
    <section
      id="missions-showcase"
      className="bg-[#F3F7FB] border-b border-slate-200/80 py-14 sm:py-20 w-full"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Precision Futuristic Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#0D9488]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t.missionsEyebrow}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#0A101F] tracking-tight">
              {t.missionsHeading}
            </h2>
            <p className="text-sm text-slate-600">{t.missionsSubtext}</p>
          </div>

          {selectedCauseId && (
            <button
              type="button"
              onClick={() => onSelectCause(null)}
              className="self-start sm:self-end px-3.5 py-1.5 rounded-full bg-white border border-teal-500/40 text-xs font-semibold text-[#047857] hover:bg-emerald-50"
            >
              Clear selected mission ✕
            </button>
          )}
        </div>

        {/* 8 Futuristic Mission Dossier Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {MISSION_DOCUMENTS.map((doc) => {
            const cause = causes.find((c) => c.id === doc.causeId);
            const raised = cause?.raised_amount || 0;
            const target = cause?.target_amount || 500000;
            const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
            const isSelected = selectedCauseId === doc.causeId;

            return (
              <article
                key={doc.causeId}
                className={`card-editorial rounded-2xl overflow-hidden flex flex-col justify-between group ${
                  isSelected ? 'border-teal-500 ring-2 ring-teal-500/25' : ''
                }`}
              >
                <div>
                  {/* Mission Visual + Obsidian HUD Node Badge */}
                  <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                    <img
                      src={doc.imageUrl}
                      alt={doc.officialTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D19]/70 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#070D19]/85 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-400/30 tracking-wider">
                      NODE 0{doc.projectNumber}
                    </span>
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full btn-future-primary text-[10px] font-semibold inline-flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/95">
                      <span className="font-semibold text-emerald-300">
                        ₹{Math.round(raised).toLocaleString('en-IN')} {t.raisedLabel}
                      </span>
                      <span className="text-slate-200">{pct}%</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="font-display font-bold text-base text-[#0A101F] leading-snug">
                      {doc.officialTitle}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.subtitle}
                    </p>

                    {/* Luminous Progress Track */}
                    <div className="pt-1">
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full progress-future rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Futuristic 2-Button Footer */}
                <div className="px-4 pb-4 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDocument(doc.causeId)}
                    className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-teal-400 text-[#0A101F] text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>{t.readBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCause(isSelected ? null : doc.causeId);
                      onScrollToCatalog();
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 ${
                      isSelected ? 'btn-future-obsidian' : 'btn-future-primary'
                    }`}
                  >
                    <span>{isSelected ? t.supportingBtn : t.supportBtn}</span>
                    {!isSelected && <ArrowUpRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
