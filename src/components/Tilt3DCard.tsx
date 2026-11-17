import React, { useRef, useState, useEffect } from 'react';

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(0, 240, 255, 0.25)',
  maxTilt = 7,
  onClick,
  style,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - py) * maxTilt * 2;

    setTransform(
      `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
    );
    setGlare({ x: px * 100, y: py * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    if (!canHover) return;
    setTransform('');
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={canHover ? handleMouseMove : undefined}
      onMouseLeave={canHover ? handleMouseLeave : undefined}
      style={{
        ...style,
        ...(canHover && transform ? { transform } : {}),
        ...(canHover
          ? {
              transition:
                glare.opacity > 0
                  ? 'transform 120ms ease-out, box-shadow 250ms ease'
                  : 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 350ms ease',
            }
          : {}),
      }}
      className={`relative ${className}`}
    >
      {canHover && (
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, ${glowColor}, transparent 72%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};
