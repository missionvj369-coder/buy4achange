import React from 'react';
import { Globe, BookOpen } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';

interface FooterProps {
  onOpenMissionDoc?: (causeId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMissionDoc }) => {
  return (
    <footer className="bg-[#040609] border-t border-white/[0.07] text-slate-400 text-xs mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <div className="font-display font-semibold text-2xl tracking-[0.14em] text-ivory-50">
                BUY<span className="text-champagne-400">4</span>ACHANGE
              </div>
              <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-champagne-400/80 mt-1">
                Living Tamilagam · Universal Guard Trust
              </div>
            </div>
            <p className="font-editorial text-sm text-ivory-300/75 leading-relaxed max-w-md">
              A conscious commerce house where every physical purchase and interactive digital edition funds verified grassroots transformation across Tamil Nadu&rsquo;s 38 districts.
            </p>
            <div className="flex items-center space-x-5 pt-1 font-mono text-[11px]">
              <a
                href="https://ugtindia.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-champagne-300 hover:text-ivory-50 inline-flex items-center space-x-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ugtindia.space</span>
              </a>
              <a
                href="https://ugtglobal.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-champagne-300 inline-flex items-center space-x-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ugtglobal.space</span>
              </a>
            </div>
          </div>

          {/* 8 Official Living Tamilagam Mission Dossiers */}
          <div className="md:col-span-7 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-champagne-400">
              Living Tamilagam · 8 Official Mission Dossiers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MISSION_DOCUMENTS.map((doc) => (
                <button
                  key={doc.causeId}
                  type="button"
                  onClick={() => onOpenMissionDoc?.(doc.causeId)}
                  className="text-left p-2.5 rounded-xl border border-white/[0.06] hover:border-champagne-500/40 bg-white/[0.015] hover:bg-champagne-500/[0.05] flex items-center justify-between gap-2 group transition"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className="font-mono text-[10px] font-semibold shrink-0"
                      style={{ color: doc.accent }}
                    >
                      0{doc.projectNumber}
                    </span>
                    <span className="text-ivory-200 group-hover:text-ivory-50 truncate font-medium text-xs">
                      {doc.officialTitle}
                    </span>
                  </div>
                  <BookOpen className="w-3.5 h-3.5 text-slate-600 group-hover:text-champagne-400 shrink-0 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-slate-500">
          <span>© {new Date().getFullYear()} Buy4AChange · Universal Guard Trust</span>
          <span>Rooted in Purpose · Built for Living Impact</span>
        </div>
      </div>
    </footer>
  );
};
