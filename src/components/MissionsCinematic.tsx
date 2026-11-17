import React from 'react';
import { Cause } from '../types.ts';
import { BookOpen, Check } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';

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
  return (
    <section
      id="missions-showcase"
      className="bg-[#FAF9F6] border-b border-gray-200 py-12 sm:py-16 w-full"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Calm Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
              Living India · 8 National Missions
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14171A]">
              Choose a Mission to Support
            </h2>
            <p className="text-sm text-gray-600">
              Read the complete official proposal document for any mission, or select one to fund with your purchase.
            </p>
          </div>

          {selectedCauseId && (
            <button
              type="button"
              onClick={() => onSelectCause(null)}
              className="self-start sm:self-end text-xs font-semibold text-[#166534] underline underline-offset-4"
            >
              Clear selected mission
            </button>
          )}
        </div>

        {/* Clean, Scannable 8-Card Responsive Grid (Light, Fast, Zero Clutter on Mobile) */}
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
                className={`bg-white rounded-xl overflow-hidden border flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'border-[#166534] ring-2 ring-[#166534]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  {/* Mission Image */}
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={doc.imageUrl}
                      alt={doc.officialTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-white/95 text-[#14171A] font-mono text-[10px] font-bold border border-gray-200">
                      0{doc.projectNumber}
                    </span>
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#166534] text-white text-[10px] font-semibold inline-flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>

                  {/* Clean Concise Card Text */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-display font-bold text-base text-[#14171A] leading-snug">
                      {doc.officialTitle}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {doc.subtitle}
                    </p>

                    {/* Live Progress */}
                    <div className="pt-2 space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-[#166534] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#166534]">
                          ₹{Math.round(raised).toLocaleString('en-IN')} raised
                        </span>
                        <span className="text-gray-500">{pct}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clean 2-Button Footer */}
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDocument(doc.causeId)}
                    className="flex-1 py-2 px-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-[#14171A] text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#166534]" />
                    <span>Read</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCause(isSelected ? null : doc.causeId);
                      onScrollToCatalog();
                    }}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold ${
                      isSelected
                        ? 'bg-[#14532D] text-white'
                        : 'bg-[#166534] hover:bg-[#14532D] text-white'
                    }`}
                  >
                    {isSelected ? 'Supporting' : 'Support'}
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
