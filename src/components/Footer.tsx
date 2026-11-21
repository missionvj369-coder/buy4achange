import React from 'react';
import { ArrowUpRight, Download } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface FooterProps {
  onOpenMissionDoc?: (causeId: string) => void;
  onOpenTrack?: (tab: 'track' | 'ledger') => void;
  onOpenSellerPortal?: () => void;
  onOpenIndiaMap?: () => void;
  onOpenPrograms?: (tab: 'subscription' | 'bulk') => void;
  onOpenAuditorPortal?: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
  whatsappSupportNumber?: string;
  supportEmail?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenMissionDoc,
  onOpenTrack,
  onOpenSellerPortal,
  onOpenIndiaMap,
  onOpenPrograms,
  onOpenAuditorPortal,
  canInstallPwa = false,
  onInstallPwa,
  whatsappSupportNumber,
  supportEmail,
}) => {
  const { t } = useLanguage();
  const cleanWa = (whatsappSupportNumber || '').replace(/[^\d]/g, '');

  return (
    <footer className="bg-[#030506] text-slate-300 text-xs no-print w-full border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        {/* Hairline Progress Accent (Hape-style horizontal studio track) */}
        <div className="w-full h-[1px] bg-white/15 mb-12 relative">
          <div className="absolute left-0 top-0 h-[2px] w-44 bg-emerald-400" />
        </div>

        {/* Hape-Class Editorial Quote + Connect & Portals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12">
          {/* Left: Monumental Manifesto Quote */}
          <div className="lg:col-span-5 space-y-4">
            <div className="font-display font-extrabold uppercase text-2xl sm:text-3xl text-white leading-[0.98] tracking-[-0.03em] max-w-md">
              WE BUY, WE BUILD, WE HEAL. WE RISE.
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Universal Guard Trust · UGT India Living India Initiative
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm pt-1">
              {t.footerSummary}
            </p>

            {canInstallPwa && onInstallPwa && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onInstallPwa}
                  className="pill-hape-cta"
                >
                  <span>{t.installApp}</span>
                  <span className="pill-hape-circle">
                    <Download className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Middle: CONNECT WITH US / PLATFORM PORTALS */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-display font-extrabold uppercase text-sm tracking-tight text-white">
              CONNECT &amp; PORTALS
            </div>
            <div className="flex flex-col space-y-2 text-xs text-slate-300">
              {onOpenSellerPortal && (
                <button
                  type="button"
                  onClick={onOpenSellerPortal}
                  className="text-left hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>Sell With Us (Manufacturer)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
              {onOpenIndiaMap && (
                <button
                  type="button"
                  onClick={onOpenIndiaMap}
                  className="text-left hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>India Live Impact Map</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}
              {onOpenPrograms && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenPrograms('subscription')}
                    className="text-left hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>Monthly Conscious Box</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPrograms('bulk')}
                    className="text-left hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>CSR &amp; Institutional Bulk</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </>
              )}
              {onOpenAuditorPortal && (
                <button
                  type="button"
                  onClick={onOpenAuditorPortal}
                  className="text-left hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>Field Auditor PWA</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}
              {onOpenTrack && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenTrack('track')}
                    className="text-left hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>{t.trackOrderTitle}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTrack('ledger')}
                    className="text-left hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>{t.publicLedgerTitle}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </>
              )}
              <a
                href="https://ugtglobal.space"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
              >
                <span>ugtglobal.space</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </a>
              <a
                href="https://ugtindia.space"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
              >
                <span>ugtindia.space</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </a>
              {cleanWa && (
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>WhatsApp Support</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </a>
              )}
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  className="hover:text-emerald-400 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>{supportEmail}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
            </div>
          </div>

          {/* Right: 08 LIVING INDIA MISSIONS INDEX */}
          <div className="lg:col-span-4 space-y-3">
            <div className="font-display font-extrabold uppercase text-sm tracking-tight text-white">
              08 MISSION DOSSIERS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {MISSION_DOCUMENTS.map((doc) => (
                <button
                  key={doc.causeId}
                  type="button"
                  onClick={() => onOpenMissionDoc?.(doc.causeId)}
                  className="text-left text-xs text-slate-300 hover:text-white inline-flex items-center justify-between space-x-2 py-0.5 group"
                >
                  <span className="truncate flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">
                      0{doc.projectNumber}/
                    </span>
                    <span>{doc.officialTitle}</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Hairline Wide-Tracked Legal Row + 5-Dot Signal */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
          <span>
            © {new Date().getFullYear()} · BUY4ACHANGE® · UNIVERSAL GUARD TRUST · OPEN-SOURCE 3D
          </span>
          <div className="flex items-center space-x-6 text-slate-400">
            <a
              href="https://ugtglobal.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              UGT GLOBAL
            </a>
            <a
              href="https://ugtindia.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              UGT INDIA
            </a>
            <span className="hidden sm:inline-flex items-center space-x-1" aria-hidden="true">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="w-1 h-1 rounded-full bg-white/25" />
              <span className="w-1 h-1 rounded-full bg-white/15" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
