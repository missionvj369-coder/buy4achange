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
    const COLORS = ['#00f0ff', '#ff2e97', '#ffb800', '#8b5cf6', '#00e5a0'];

    for (let i = 0; i < 95; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.65,
        vy: -Math.random() * 0.5 - 0.12,
        alpha: Math.random() * 0.7 + 0.15,
        r: Math.random() * 2 + 0.6,
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
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }
      ctx.shadowBlur = 0;
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
    const t1 = setTimeout(() => setPhase('reveal-title'), 220);
    const t2 = setTimeout(() => setPhase('reveal-tagline'), 1050);
    const t3 = setTimeout(() => setPhase('exit'), 2500);
    const t4 = setTimeout(() => onComplete(), 3250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('exit');
    setTimeout(onComplete, 380);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 90% 80% at 50% 45%, #160c3d 0%, #090522 48%, #04030e 100%)',
        transition: phase === 'exit' ? 'opacity 0.75s ease, transform 0.75s ease' : undefined,
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.05)' : 'scale(1)',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      {/* Vibrant 3D Ambient Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00f0ff]/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#ff2e97]/25 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[#8b5cf6]/20 blur-[130px] pointer-events-none" />

      {/* 3D Perspective Grid Floor */}
      <div className="absolute bottom-0 inset-x-0 h-[42vh] overflow-hidden opacity-45 pointer-events-none">
        <div className="w-full h-full perspective-grid-3d" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center select-none px-6 space-y-6 text-center">
        {/* 3D Rotating Holographic Prism */}
        <div
          style={{
            perspective: '700px',
            opacity: phase === 'reveal-title' || phase === 'reveal-tagline' ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
          className="w-16 h-16 flex items-center justify-center mb-1"
        >
          <div className="relative w-12 h-12 animate-prism-3d">
            <div className="absolute inset-0 border-2 border-[#00f0ff]/80 rounded-xl bg-[#00f0ff]/10 shadow-[0_0_24px_rgba(0,240,255,0.45)]" style={{ transform: 'translateZ(24px)' }} />
            <div className="absolute inset-0 border-2 border-[#ff2e97]/80 rounded-xl bg-[#ff2e97]/10" style={{ transform: 'rotateY(180deg) translateZ(24px)' }} />
            <div className="absolute inset-0 border-2 border-[#ffb800]/80 rounded-xl bg-[#ffb800]/10" style={{ transform: 'rotateY(90deg) translateZ(24px)' }} />
            <div className="absolute inset-0 border-2 border-[#00e5a0]/80 rounded-xl bg-[#00e5a0]/10" style={{ transform: 'rotateY(-90deg) translateZ(24px)' }} />
          </div>
        </div>

        <div
          style={{
            opacity: phase === 'reveal-title' || phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-title' || phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
          className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full glass-3d"
        >
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.34em] text-[#00f0ff] uppercase font-bold">
            Living India · National Movement
          </span>
        </div>

        <div
          style={{
            opacity: phase === 'reveal-title' || phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-title' || phase === 'reveal-tagline' ? 'translateY(0) scale(1)' : 'translateY(26px) scale(0.95)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.08s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.08s',
          }}
        >
          <h1
            className="font-display font-extrabold prism-gradient-text tracking-[0.06em]"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 6.2rem)',
              lineHeight: 1,
              filter: 'drop-shadow(0 12px 32px rgba(0, 240, 255, 0.3))',
            }}
          >
            BUY4ACHANGE
          </h1>
        </div>

        <div
          style={{
            opacity: phase === 'reveal-tagline' ? 1 : 0,
            transform: phase === 'reveal-tagline' ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.85s ease, transform 0.85s ease',
          }}
          className="space-y-3"
        >
          <p className="text-slate-200 text-sm sm:text-lg font-medium tracking-wide">
            Shop the Future. Power Eight Open National Missions Across India.
          </p>
          <div className="mx-auto h-[2px] w-32 gold-hairline rounded-full" />
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 z-30 px-4 py-2 rounded-full glass-3d font-mono text-[10px] uppercase tracking-[0.25em] text-[#00f0ff] hover:text-white transition cursor-pointer"
      >
        Launch Experience →
      </button>
    </div>
  );
};
