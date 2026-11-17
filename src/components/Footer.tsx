import React from 'react';
import { Globe, BookOpen, Sparkles } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';

interface FooterProps {
  onOpenMissionDoc?: (causeId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMissionDoc }) => {
  return (
    <footer className="relative bg-[#04030e] border-t border-white/15 text-slate-300 text-xs mt-16 overflow-hidden no-print">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#00f0ff] via-[#ff2e97] to-[#ffb800]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00f0ff] via-[#8b5cf6] to-[#ff2e97] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-display font-extrabold text-2xl tracking-tight text-white">
                  BUY<span className="text-[#00f0ff]">4</span>A<span className="text-[#ff2e97]">CHANGE</span>
                </div>
                <div className="font-mono text-[10px] tracking-[0.26em] uppercase text-[#ffb800]">
                  Living India · Universal Guard Trust
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-300/80 leading-relaxed max-w-md">
              A national conscious commerce movement where every physical product and interactive HTML digital edition directly funds open Living India missions across every district of India.
            </p>
            <div className="flex items-center space-x-5 pt-1 font-mono text-[11px]">
              <a
                href="https://ugtindia.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00f0ff] hover:text-white inline-flex items-center space-x-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ugtindia.space</span>
              </a>
              <a
                href="https://ugtglobal.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff2e97] hover:text-white inline-flex items-center space-x-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ugtglobal.space</span>
              </a>
            </div>
          </div>

          {/* 8 Official Living India Mission Dossiers */}
          <div className="md:col-span-7 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#00f0ff] font-bold">
              Living India · 8 National Mission Dossiers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MISSION_DOCUMENTS.map((doc) => (
                <button
                  key={doc.causeId}
                  type="button"
                  onClick={() => onOpenMissionDoc?.(doc.causeId)}
                  className="text-left p-2.5 rounded-xl border border-white/10 hover:border-white/35 bg-white/[0.03] hover:bg-white/[0.07] flex items-center justify-between gap-2 group transition"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold text-[#060416] shrink-0"
                      style={{ backgroundColor: doc.accent }}
                    >
                      0{doc.projectNumber}
                    </span>
                    <span className="text-white/90 group-hover:text-white truncate font-semibold text-xs">
                      {doc.officialTitle}
                    </span>
                  </div>
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00f0ff] shrink-0 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-slate-400">
          <span>© {new Date().getFullYear()} Buy4AChange · Living India · Universal Guard Trust</span>
          <span className="prism-gradient-text font-bold">Open National Movement · Built For Impact</span>
        </div>
      </div>
    </footer>
  );
};
