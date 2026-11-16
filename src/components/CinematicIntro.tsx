import React, { useState, useEffect, useRef } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'hold' | 'reveal-title' | 'reveal-tagline' | 'exit'>('hold');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Particle canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; vx: number; vy: number; alpha: number; r: number; color: string }[] = [];
    const COLORS = ['#10b981', '#059669', '#f59e0b', '#6ee7b7', '#fbbf24'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
        r: Math.random() * 1.5 + 0.5,
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

  // Sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal-title'), 300);
    const t2 = setTimeout(() => setPhase('reveal-tagline'), 1300);
    const t3 = setTimeout(() => setPhase('exit'), 2900);
    const t4 = setTimeout(() => onComplete(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('exit');
    setTimeout(onComplete, 450);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: '#020408',
        transition: phase === 'exit' ? 'opacity 1s ease, transform 1s ease' : undefined,
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* Particle layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Cinematic bars */}
      <div className="absolute top-0 left-0 w-full h-[52px] bg-black z-10" />
      <div className="absolute bottom-0 left-0 w-full h-[52px] bg-black z-10" />

      {/* Center vignette glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(5,150,105,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center select-none" style={{ gap: '1.5rem' }}>
        {/* Pre-title line */}
        <div
          style={{
            opacity: phase === 'reveal-title' || phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-title' || phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.9s ease, transform 0.9s ease',
            transitionDelay: '0.1s',
          }}
          className="flex items-center space-x-3"
        >
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-emerald-500/60" />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.65rem',
              letterSpacing: '0.4em',
              color: '#6ee7b7',
              textTransform: 'uppercase',
            }}
          >
            UGT India Initiative
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-emerald-500/60" />
        </div>

        {/* Main Title */}
        <div
          style={{
            opacity: phase === 'reveal-title' || phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-title' || phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)',
            transitionDelay: '0.15s',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 8vw, 6.5rem)',
              letterSpacing: '0.08em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #ffffff 0%, #d1fae5 40%, #6ee7b7 70%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
            }}
          >
            BUY4ACHANGE
          </h1>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 1s ease, transform 1s ease',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.75rem, 2vw, 1.05rem)',
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.65)',
              textTransform: 'uppercase',
            }}
          >
            Every Purchase Changes A Life
          </p>
          <div className="mt-3 flex justify-center">
            <span className="h-px w-24 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          </div>
        </div>

        {/* Tagline 2 */}
        <div
          style={{
            opacity: phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 1s ease 0.3s, transform 1s ease 0.3s',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              color: 'rgba(16,185,129,0.7)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            8 National Missions · 1 Purchase · Infinite Impact
          </span>
        </div>
      </div>

      {/* Subtle Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-4 right-6 z-30 text-[11px] uppercase tracking-[0.25em] text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
      >
        Skip Intro →
      </button>
    </div>
  );
};
