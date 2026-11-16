import React from 'react';
import { ArrowDown, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  causes: any[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToCatalog,
}) => {
  return (
    <div
      className="relative overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        minHeight: '92vh',
        background: 'linear-gradient(180deg, #020408 0%, #060c14 60%, #070b14 100%)',
      }}
    >
      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(5,150,105,0.14) 0%, rgba(245,158,11,0.04) 50%, transparent 80%)',
        }}
      />

      {/* Subtle horizontal scan line */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: '42%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.15) 30%, rgba(16,185,129,0.3) 50%, rgba(16,185,129,0.15) 70%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 flex flex-col items-center space-y-7">

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-950/40 backdrop-blur-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              color: '#6ee7b7',
              textTransform: 'uppercase',
            }}
          >
            UGT India · ugtindia.space
          </span>
        </div>

        {/* Main headline */}
        <div>
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 800,
              fontSize: 'clamp(2.2rem, 7vw, 5.5rem)',
              letterSpacing: '0.05em',
              lineHeight: 1.05,
              background: 'linear-gradient(135deg, #ffffff 0%, #d1fae5 35%, #6ee7b7 60%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BUY4ACHANGE
          </h1>
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.7rem, 1.8vw, 1rem)',
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.45)',
              textTransform: 'uppercase',
              marginTop: '0.75rem',
            }}
          >
            Every Purchase Changes A Life
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center space-x-4 w-full max-w-xs">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent to-emerald-500/40" />
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(16,185,129,0.6)', textTransform: 'uppercase', fontWeight: 700 }}>
            8 Missions
          </span>
          <span className="flex-1 h-px bg-gradient-to-l from-transparent to-emerald-500/40" />
        </div>

        {/* Sub-headline */}
        <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
          Shop our conscious catalog and direct a portion of every purchase to one of UGT India's eight verified national missions.
        </p>

        {/* CTA */}
        <button
          onClick={onScrollToCatalog}
          className="group flex flex-col items-center space-y-2 mt-4"
        >
          <span
            className="px-7 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#020408',
              boxShadow: '0 0 32px rgba(16,185,129,0.3)',
              letterSpacing: '0.05em',
            }}
          >
            Explore Causes & Shop
          </span>
          <span className="flex flex-col items-center opacity-50 group-hover:opacity-80 transition-opacity">
            <ArrowDown className="w-4 h-4 text-emerald-400 animate-bounce mt-1" />
          </span>
        </button>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 w-full h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #070b14)' }}
      />
    </div>
  );
};
