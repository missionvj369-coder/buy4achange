import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Download,
  MessageCircle,
  Mail,
  Store,
  MapPin,
  Repeat,
  Building2,
  ClipboardCheck,
  Layers,
} from 'lucide-react';
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
    <footer className="bg-[#070D19] text-slate-300 text-xs mt-12 no-print w-full border-t border-emerald-500/20">
      <div className="hero-horizon-bar" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Universal Guard Trust & UGT India Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 via-teal-500/25 to-cyan-500/25 border border-emerald-400/40 flex items-center justify-center">
                <Layers className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="font-display font-bold text-xl text-white leading-none">
                  Buy<span className="text-emerald-400">4</span>AChange
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-300 mt-1">
                  Universal Guard Trust · UGT India
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t.footerSummary}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://ugtglobal.space"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.05] hover:border-emerald-400/50 text-white font-semibold text-xs inline-flex items-center space-x-1.5 transition-all"
              >
                <span>ugtglobal.space</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>
              <a
                href="https://ugtindia.space"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.05] hover:border-cyan-400/50 text-white font-semibold text-xs inline-flex items-center space-x-1.5 transition-all"
              >
                <span>ugtindia.space</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            </div>

            {/* Platform Modules & Portals Quick Launch */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenSellerPortal && (
                <button
                  type="button"
                  onClick={onOpenSellerPortal}
                  className="px-3.5 py-1.5 rounded-xl btn-future-primary font-semibold text-[11px] inline-flex items-center space-x-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Sell With Us (Manufacturer)</span>
                </button>
              )}
              {onOpenIndiaMap && (
                <button
                  type="button"
                  onClick={onOpenIndiaMap}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 font-semibold text-[11px] inline-flex items-center space-x-1 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>India Live Map</span>
                </button>
              )}
              {onOpenPrograms && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenPrograms('subscription')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold text-[11px] inline-flex items-center space-x-1 transition-all"
                  >
                    <Repeat className="w-3 h-3 text-cyan-400" />
                    <span>Monthly Box</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPrograms('bulk')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold text-[11px] inline-flex items-center space-x-1 transition-all"
                  >
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    <span>CSR / Bulk Orders</span>
                  </button>
                </>
              )}
              {onOpenAuditorPortal && (
                <button
                  type="button"
                  onClick={onOpenAuditorPortal}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold text-[11px] inline-flex items-center space-x-1 transition-all"
                >
                  <ClipboardCheck className="w-3 h-3 text-emerald-400" />
                  <span>Field Auditor</span>
                </button>
              )}
              {onOpenTrack && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenTrack('track')}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 text-cyan-200 font-semibold text-[11px] inline-flex items-center space-x-1 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.trackOrderTitle}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTrack('ledger')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold text-[11px] transition-all"
                  >
                    {t.publicLedgerTitle}
                  </button>
                </>
              )}
              {canInstallPwa && onInstallPwa && (
                <button
                  type="button"
                  onClick={onInstallPwa}
                  className="px-3 py-1.5 rounded-xl btn-future-primary font-semibold text-[11px] inline-flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>{t.installApp}</span>
                </button>
              )}
              {cleanWa && (
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-200 font-semibold text-[11px] inline-flex items-center space-x-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </a>
              )}
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-slate-300 font-medium text-[11px] inline-flex items-center space-x-1"
                >
                  <Mail className="w-3 h-3 text-cyan-400" />
                  <span>{supportEmail}</span>
                </a>
              )}
            </div>
          </div>

          {/* 8 Mission Dossiers Quick Links */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-emerald-300">
              Living India // 08 Mission Nodes
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MISSION_DOCUMENTS.map((doc) => (
                <button
                  key={doc.causeId}
                  type="button"
                  onClick={() => onOpenMissionDoc?.(doc.causeId)}
                  className="text-left text-xs text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/40 rounded-xl px-3 py-2 flex items-center space-x-2.5 transition-all"
                >
                  <span className="font-mono text-[10px] font-bold text-cyan-300 shrink-0">
                    0{doc.projectNumber}
                  </span>
                  <span className="truncate font-medium">{doc.officialTitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Links Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            © {new Date().getFullYear()} BUY4ACHANGE · UNIVERSAL GUARD TRUST · OPEN-SOURCE ARCHITECTURE
          </span>
          <div className="flex items-center space-x-4 font-semibold">
            <a
              href="https://ugtglobal.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              ugtglobal.space
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="https://ugtindia.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300"
            >
              ugtindia.space
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
