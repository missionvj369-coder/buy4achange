import React from 'react';
import { ArrowRight, BookOpen, ShieldCheck, Share2 } from 'lucide-react';
import { Cause } from '../types.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface HeroBannerProps {
  causes: Cause[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
  onScrollToShop?: () => void;
  onOpenMissionDoc?: (causeId: string) => void;
  onOpenLedger?: () => void;
  onOpenReferEarn?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  causes,
  onScrollToCatalog,
  onScrollToShop,
  onOpenLedger,
  onOpenReferEarn,
}) => {
  const { t } = useLanguage();
  const totalRaised = causes.reduce((sum, c) => sum + (c.raised_amount || 0), 0);

  return (
    <section className="hero-architectural border-b border-gray-200 w-full">
      <div className="hero-horizon-bar" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-11 sm:py-16 text-center space-y-5">
        <div className="inline-flex items-center space-x-2 text-xs sm:text-sm font-medium text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-3.5 py-1.5 rounded-full">
          <span className="live-dot shrink-0" />
          <span>{t.taglinePill}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#14171A] leading-tight tracking-tight">
          {t.heroTitle}
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={onScrollToShop || onScrollToCatalog}
            className="w-full sm:w-auto px-6 py-3 rounded-xl btn-future-primary text-sm font-semibold flex items-center justify-center space-x-2"
          >
            <span>{t.browseProducts}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onScrollToCatalog}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#FAF9F6] border border-gray-300 text-[#14171A] text-sm font-semibold flex items-center justify-center space-x-2"
          >
            <BookOpen className="w-4 h-4 text-[#166534]" />
            <span>{t.readDossiers}</span>
          </button>

          {onOpenLedger && (
            <button
              type="button"
              onClick={onOpenLedger}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F0FDF4] hover:bg-green-100 border border-[#BBF7D0] text-[#166534] text-sm font-semibold flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.trackAndLedger}</span>
            </button>
          )}
        </div>

        {/* Clean Futuristic Bento Telemetry Bar */}
        <div className="pt-3 space-y-3">
          <div className="bento-surface inline-grid grid-cols-3 divide-x divide-gray-200 rounded-2xl overflow-hidden w-full max-w-lg text-center">
            <div className="px-3 py-3">
              <div className="text-sm sm:text-base font-bold font-mono text-[#166534]">
                ₹{Math.round(totalRaised).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                Verified Live Impact
              </div>
            </div>
            <div className="px-3 py-3">
              <div className="text-sm sm:text-base font-bold font-mono text-gray-900">
                {causes.length || 8}
              </div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                National Missions
              </div>
            </div>
            <div className="px-3 py-3">
              <div className="text-sm sm:text-base font-bold font-mono text-gray-900">
                22+1
              </div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                Indian Languages
              </div>
            </div>
          </div>

          {onOpenReferEarn && (
            <div>
              <button
                type="button"
                onClick={onOpenReferEarn}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#166534] hover:underline underline-offset-4"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share products on socials &amp; earn referral income on every verified purchase →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
