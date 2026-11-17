import React from 'react';
import { ShoppingBag, Search, BookOpen, Compass, Sparkles } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  libraryCount?: number;
  onOpenCart: () => void;
  onOpenLibrary?: () => void;
  onScrollToEProducts?: () => void;
  onScrollToMissions?: () => void;
  onScrollToCatalog?: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  libraryCount = 0,
  onOpenCart,
  onOpenLibrary,
  onScrollToEProducts,
  onScrollToMissions,
  onScrollToCatalog,
  searchTerm,
  onSearchChange,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#07051a]/80 backdrop-blur-2xl border-b border-white/[0.12] transition-all">
      {/* Prismatic top hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#00f0ff] via-[#ff2e97] to-[#ffb800]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 3D Futuristic Brand Wordmark */}
          <div
            onClick={onNavigateHome}
            className="flex items-center space-x-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00f0ff] via-[#8b5cf6] to-[#ff2e97] p-[2px] shadow-[0_0_24px_rgba(0,240,255,0.35)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090620] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00f0ff]" />
              </div>
            </div>
            <div>
              <div className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-none">
                BUY<span className="text-[#00f0ff]">4</span>A<span className="text-[#ff2e97]">CHANGE</span>
              </div>
              <div className="font-mono text-[9px] tracking-[0.26em] uppercase text-[#ffb800] mt-1 font-semibold">
                Living India · Open National Movement
              </div>
            </div>
          </div>

          {/* Center 3D Glass Navigation Pills */}
          <nav className="hidden lg:flex items-center space-x-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold">
            {onScrollToMissions && (
              <button
                onClick={onScrollToMissions}
                className="px-4 py-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition flex items-center space-x-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>8 Missions</span>
              </button>
            )}
            {onScrollToCatalog && (
              <button
                onClick={onScrollToCatalog}
                className="px-4 py-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition"
              >
                Catalog
              </button>
            )}
            {onScrollToEProducts && (
              <button
                onClick={onScrollToEProducts}
                className="px-4 py-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition"
              >
                E-Products &amp; eBooks
              </button>
            )}
          </nav>

          {/* Search + Actions */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden md:flex relative w-44 xl:w-56">
              <Search className="w-3.5 h-3.5 text-[#00f0ff] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/15 rounded-full pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_16px_rgba(0,240,255,0.25)] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {onOpenLibrary && (
              <button
                onClick={onOpenLibrary}
                className="relative flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-white font-semibold text-xs transition-all"
                title="Open your purchased eBooks & eProducts"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span className="hidden sm:inline">Library</span>
                {libraryCount > 0 && (
                  <span className="flex items-center justify-center bg-[#ffb800] text-[#060416] text-[10px] font-black h-4 min-w-4 px-1 rounded-full">
                    {libraryCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-2 px-4 py-2 rounded-full prism-button text-white font-bold text-xs tracking-wider uppercase transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center bg-white text-[#060416] text-[10px] font-black h-4 min-w-4 px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
