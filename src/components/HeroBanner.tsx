import React from 'react';
import { ArrowRight, BookOpen, ShieldCheck, Share2, Sparkles, Cpu } from 'lucide-react';
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
    <section className="hero-architectural border-b border-slate-200/80 w-full overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-16 text-center space-y-6">
        {/* Futuristic Protocol Status Chip */}
        <div className="inline-flex items-center space-x-2 text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.08em] text-[#047857] bg-white/90 border border-teal-500/30 shadow-sm px-4 py-1.5 rounded-full">
          <span className="live-dot shrink-0" />
          <span>{t.taglinePill}</span>
        </div>

        {/* Geometric Space Grotesk Display Headline */}
        <h1 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#0A101F] leading-[1.08] tracking-[-0.03em] max-w-4xl mx-auto">
          <span>{t.heroTitle}</span>
          <span className="block mt-1.5 text-xl sm:text-3xl lg:text-4xl gradient-text-future font-bold">
            Zero-Chemical Commerce · Verified National Impact
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Precision Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={onScrollToShop || onScrollToCatalog}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl btn-future-primary text-sm font-semibold flex items-center justify-center space-x-2"
          >
            <span>{t.browseProducts}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onScrollToCatalog}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl btn-future-obsidian text-sm font-semibold flex items-center justify-center space-x-2"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>{t.readDossiers}</span>
          </button>

          {onOpenLedger && (
            <button
              type="button"
              onClick={onOpenLedger}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-teal-400/60 text-[#0A101F] text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
              <span>{t.trackAndLedger}</span>
            </button>
          )}
        </div>

        {/* SIGNATURE 2030 OBSIDIAN MISSION TELEMETRY HUD DECK */}
        <div className="pt-4">
          <div className="obsidian-deck rounded-3xl p-4 sm:p-5 text-left max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-slate-300 font-semibold">
                  LIVE TELEMETRY // LIVING INDIA NETWORK
                </span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-mono text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>EDGE VERIFIED · REAL-TIME LEDGER</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Verified Impact
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
                  ₹{Math.round(totalRaised).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Zero-Inflation Ledger</div>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Mission Nodes
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-cyan-300 mt-1">
                  0{causes.length || 8}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Active National Pillars</div>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Indian Scripts
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                  22+1
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Constitutional Languages</div>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Purity Protocol
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono text-teal-300 mt-1">
                  100%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dual-Cert Lab Audited</div>
              </div>
            </div>

            {onOpenReferEarn && (
              <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    <strong className="text-white">Refer &amp; Earn Protocol:</strong> Share any product or eBook on socials &amp; earn verified commission on every purchase.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenReferEarn}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold shrink-0 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Open Partner Dashboard →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
