import React, { useState, useEffect, useRef } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'hold' | 'reveal-title' | 'reveal-tagline' | 'exit'>('hold');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; vx: number; vy: number; alpha: number; r: number; color: string }[] = [];
    const COLORS = ['#d4af37', '#ebd28f', '#f5f1e8', '#10b981', '#c8a45c'];

    for (let i = 0; i < 75; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -Math.random() * 0.25 - 0.05,
        alpha: Math.random() * 0.45 + 0.08,
        r: Math.random() * 1.4 + 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal-title'), 250);
    const t2 = setTimeout(() => setPhase('reveal-tagline'), 1150);
    const t3 = setTimeout(() => setPhase('exit'), 2650);
    const t4 = setTimeout(() => onComplete(), 3450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('exit');
    setTimeout(onComplete, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: '#030508',
        transition: phase === 'exit' ? 'opacity 0.85s ease, transform 0.85s ease' : undefined,
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />

      {/* Architectural Gold Hairline Frame */}
      <div className="absolute inset-6 sm:inset-10 border border-champagne-500/15 pointer-events-none z-10" />

      {/* Warm Obsidian & Champagne Ambient Glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(212,175,55,0.09) 0%, rgba(16,185,129,0.04) 45%, transparent 75%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center select-none px-6 space-y-6 text-center">
        <div
          style={{
            opacity: phase === 'reveal-title' || phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-title' || phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.85s ease, transform 0.85s ease',
          }}
          className="flex items-center space-x-4"
        >
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-500/60" />
          <span className="font-mono text-[10px] tracking-[0.42em] text-champagne-300 uppercase">
            Living Tamilagam · UGT India
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-champagne-500/60" />
        </div>

        <div
          style={{
            opacity: phase === 'reveal-title' || phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-title' || phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
          <h1
            className="font-display font-medium gold-gradient-text tracking-[0.14em]"
            style={{ fontSize: 'clamp(2.6rem, 7.8vw, 6.4rem)', lineHeight: 1 }}
          >
            BUY4ACHANGE
          </h1>
        </div>

        <div
          style={{
            opacity: phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.9s ease, transform 0.9s ease',
          }}
          className="space-y-3"
        >
          <p className="font-editorial italic text-ivory-200/80 text-base sm:text-xl tracking-wide">
            Where Every Purchase Sustains a Living Mission
          </p>
          <div className="mx-auto h-px w-24 gold-hairline" />
          <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-champagne-400/75">
            Eight National Missions · Verified Direct Impact
          </div>
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="absolute bottom-9 right-10 z-30 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400 hover:text-champagne-300 transition-colors cursor-pointer"
      >
        Enter Store →
      </button>
    </div>
  );
};
