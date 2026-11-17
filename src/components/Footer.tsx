import React from 'react';
import { Globe, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';

interface FooterProps {
  onOpenMissionDoc?: (causeId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMissionDoc }) => {
  return (
    <footer className="relative bg-[#04030e] border-t border-white/15 text-slate-300 text-xs mt-12 overflow-hidden no-print">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#00f0ff] via-[#ff2e97] to-[#ffb800]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10">
          {/* Brand & UGT Initiative Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00f0ff] via-[#8b5cf6] to-[#ff2e97] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                  BUY<span className="text-[#00f0ff]">4</span>A<span className="text-[#ff2e97]">CHANGE</span>
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#ffb800]">
                  A Universal Guard Trust · UGT India Initiative
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed max-w-md">
              An official initiative of Universal Guard Trust and UGT India, enabling transparent, direct community funding through conscious physical and digital commerce across India.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="https://ugtglobal.space"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border border-[#ff2e97]/40 bg-[#ff2e97]/10 hover:bg-[#ff2e97]/20 text-white font-mono text-[11px] font-semibold inline-flex items-center space-x-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5 text-[#ff2e97]" />
                <span>ugtglobal.space</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
              <a
                href="https://ugtindia.space"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-white font-mono text-[11px] font-semibold inline-flex items-center space-x-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>ugtindia.space</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
            </div>
          </div>

          {/* 8 Official Mission Dossiers */}
          <div className="md:col-span-7 space-y-3">
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#00f0ff] font-bold">
              Living India · 8 National Mission Dossiers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

        {/* Bottom Official Network Links Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] tracking-[0.14em] uppercase text-slate-400 text-center sm:text-left">
          <span>© {new Date().getFullYear()} Buy4AChange · Universal Guard Trust</span>
          <div className="flex items-center space-x-4">
            <a
              href="https://ugtglobal.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff2e97] hover:text-white font-bold transition"
            >
              ugtglobal.space
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="https://ugtindia.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00f0ff] hover:text-white font-bold transition"
            >
              ugtindia.space
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
