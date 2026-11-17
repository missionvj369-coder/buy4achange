import React from 'react';
import { ExternalLink, ShieldCheck, Download, MessageCircle, Mail } from 'lucide-react';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface FooterProps {
  onOpenMissionDoc?: (causeId: string) => void;
  onOpenTrack?: (tab: 'track' | 'ledger') => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
  whatsappSupportNumber?: string;
  supportEmail?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenMissionDoc,
  onOpenTrack,
  canInstallPwa = false,
  onInstallPwa,
  whatsappSupportNumber,
  supportEmail,
}) => {
  const { t } = useLanguage();
  const cleanWa = (whatsappSupportNumber || '').replace(/[^\d]/g, '');

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 text-xs mt-12 no-print w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Universal Guard Trust & UGT India Info */}
          <div className="md:col-span-5 space-y-3.5">
            <div>
              <div className="font-display font-bold text-xl text-[#14171A]">
                Buy<span className="text-[#166534]">4</span>AChange
              </div>
              <div className="text-[11px] font-medium text-[#166534] mt-0.5">
                A Universal Guard Trust &amp; UGT India Initiative
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm">
              {t.footerSummary}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://ugtglobal.space"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg border border-gray-300 bg-[#FAF9F6] hover:border-[#166534] text-[#14171A] font-semibold text-xs inline-flex items-center space-x-1.5"
              >
                <span>ugtglobal.space</span>
                <ExternalLink className="w-3 h-3 text-[#166534]" />
              </a>
              <a
                href="https://ugtindia.space"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg border border-gray-300 bg-[#FAF9F6] hover:border-[#166534] text-[#14171A] font-semibold text-xs inline-flex items-center space-x-1.5"
              >
                <span>ugtindia.space</span>
                <ExternalLink className="w-3 h-3 text-[#166534]" />
              </a>
            </div>

            {/* Transparency & Support Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenTrack && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenTrack('track')}
                    className="px-3 py-1.5 rounded-lg bg-[#F0FDF4] hover:bg-green-100 border border-[#BBF7D0] text-[#166534] font-semibold text-[11px] inline-flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.trackOrderTitle}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTrack('ledger')}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold text-[11px]"
                  >
                    {t.publicLedgerTitle}
                  </button>
                </>
              )}
              {canInstallPwa && onInstallPwa && (
                <button
                  type="button"
                  onClick={onInstallPwa}
                  className="px-3 py-1.5 rounded-lg bg-[#166534] text-white font-semibold text-[11px] inline-flex items-center space-x-1"
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
                  className="px-3 py-1.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-semibold text-[11px] inline-flex items-center space-x-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </a>
              )}
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  className="px-3 py-1.5 rounded-lg bg-[#FAF9F6] border border-gray-200 text-gray-700 font-medium text-[11px] inline-flex items-center space-x-1"
                >
                  <Mail className="w-3 h-3 text-[#166534]" />
                  <span>{supportEmail}</span>
                </a>
              )}
            </div>
          </div>

          {/* 8 Mission Dossiers Quick Links */}
          <div className="md:col-span-7 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Living India · 8 Mission Documents
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {MISSION_DOCUMENTS.map((doc) => (
                <button
                  key={doc.causeId}
                  type="button"
                  onClick={() => onOpenMissionDoc?.(doc.causeId)}
                  className="text-left text-xs text-gray-600 hover:text-[#166534] flex items-center space-x-2 py-0.5"
                >
                  <span className="font-mono text-[10px] font-bold text-[#166534]">
                    0{doc.projectNumber}
                  </span>
                  <span className="truncate">{doc.officialTitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Links Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Buy4AChange · Universal Guard Trust · Open-Source Architecture</span>
          <div className="flex items-center space-x-4 font-medium">
            <a
              href="https://ugtglobal.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#166534] hover:underline"
            >
              ugtglobal.space
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="https://ugtindia.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#166534] hover:underline"
            >
              ugtindia.space
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
