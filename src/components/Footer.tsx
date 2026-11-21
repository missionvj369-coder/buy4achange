import React from 'react';
import { ArrowUpRight } from 'lucide-react';
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
  onOpenTrack,
  onOpenSellerPortal,
  onOpenIndiaMap,
  onOpenPrograms,
  onOpenAuditorPortal,
  whatsappSupportNumber,
  supportEmail,
}) => {
  const { t } = useLanguage();
  const cleanWa = (whatsappSupportNumber || '').replace(/[^\d]/g, '');

  return (
    <footer className="bg-black text-white/75 text-xs no-print w-full">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-10 pt-14 pb-10">
        {/* Exact Hape.io Editorial Quote + Connect With Us 2-Column Lockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 items-start">
          {/* Left: Monumental Manifesto Quote */}
          <div className="lg:col-span-5 space-y-3">
            <div className="heading-future font-extrabold uppercase text-2xl sm:text-3xl leading-[1.04] max-w-md">
              EVERY PURCHASE BUILDS
              <br />A LIVING INDIA.
            </div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-300/70">
              Universal Guard Trust · UGT India
            </div>
          </div>

          {/* Center Label */}
          <div className="lg:col-span-2">
            <div className="heading-future font-extrabold uppercase text-base sm:text-lg leading-[1.05] tracking-[0.04em]">
              CONNECT
              <br />
              WITH
              <br />
              US
            </div>
          </div>

          {/* Right: Clean 2-Column Arrow Links (Exact Hape Footer Columns) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-x-8 gap-y-2.5 text-xs text-white/75">
            {onOpenSellerPortal && (
              <button
                type="button"
                onClick={onOpenSellerPortal}
                className="text-left hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
              >
                <span>Sell With Us</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
              </button>
            )}
            {onOpenIndiaMap && (
              <button
                type="button"
                onClick={onOpenIndiaMap}
                className="text-left hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
              >
                <span>India Live Map</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
              </button>
            )}
            {onOpenTrack && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenTrack('track')}
                  className="text-left hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>{t.trackOrderTitle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTrack('ledger')}
                  className="text-left hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>{t.publicLedgerTitle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
                </button>
              </>
            )}
            {onOpenPrograms && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenPrograms('subscription')}
                  className="text-left hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>Monthly Box</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPrograms('bulk')}
                  className="text-left hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>CSR / Bulk Orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
                </button>
              </>
            )}
            {onOpenAuditorPortal && (
              <button
                type="button"
                onClick={onOpenAuditorPortal}
                className="text-left hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
              >
                <span>Field Auditor</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
              </button>
            )}
            <a
              href="https://ugtindia.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
            >
              <span>ugtindia.space</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
            </a>
            <a
              href="https://ugtglobal.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
            >
              <span>ugtglobal.space</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
            </a>
            {cleanWa && (
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors"
              >
                <span>WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
              </a>
            )}
            {supportEmail && (
              <a
                href={`mailto:${supportEmail}`}
                className="hover:text-emerald-300 inline-flex items-center space-x-1 transition-colors truncate"
              >
                <span className="truncate">{supportEmail}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
              </a>
            )}
          </div>
        </div>

        {/* Exact Hape.io Bottom Hairline Legal Lockup + 5-Dot Equalizer */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-mono uppercase tracking-[0.26em] text-white/40">
          <span>
            © {new Date().getFullYear()} · BUY4ACHANGE® · UNIVERSAL GUARD TRUST
          </span>
          <div className="flex items-center space-x-8 text-white/55">
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
              <span className="w-1 h-1 rounded-full bg-white/70" />
              <span className="w-1 h-1 rounded-full bg-white/70" />
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="w-1 h-1 rounded-full bg-white/25" />
              <span className="w-1 h-1 rounded-full bg-white/25" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
