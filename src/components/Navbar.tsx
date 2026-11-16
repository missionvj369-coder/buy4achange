import React from 'react';
import { ShoppingBag, Search, BookOpen, Compass } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#05070b]/85 backdrop-blur-xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Editorial Luxury Wordmark */}
          <div
            onClick={onNavigateHome}
            className="flex items-center space-x-3.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-full border border-champagne-500/40 bg-champagne-500/[0.06] flex items-center justify-center group-hover:border-champagne-400 transition-colors">
              <span className="font-display text-lg font-semibold text-champagne-300 tracking-tight">
                B4
              </span>
            </div>
            <div>
              <div className="font-display font-semibold text-xl sm:text-2xl tracking-[0.14em] text-ivory-50 group-hover:text-champagne-300 transition-colors leading-none">
                BUY<span className="text-champagne-400">4</span>ACHANGE
              </div>
              <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-slate-400 mt-1">
                Living Tamilagam · UGT India
              </div>
            </div>
          </div>

          {/* Center Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium tracking-[0.12em] uppercase text-slate-300">
            {onScrollToMissions && (
              <button
                onClick={onScrollToMissions}
                className="hover:text-champagne-300 transition-colors flex items-center space-x-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-champagne-400/80" />
                <span>8 Missions</span>
              </button>
            )}
            {onScrollToCatalog && (
              <button
                onClick={onScrollToCatalog}
                className="hover:text-champagne-300 transition-colors"
              >
                Catalog
              </button>
            )}
            {onScrollToEProducts && (
              <button
                onClick={onScrollToEProducts}
                className="hover:text-champagne-300 transition-colors"
              >
                E-Products &amp; eBooks
              </button>
            )}
          </nav>

          {/* Search + Actions */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden md:flex relative w-44 xl:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-full pl-9 pr-3 py-2 text-xs text-ivory-100 placeholder-slate-500 focus:outline-none focus:border-champagne-500/60 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-ivory-100"
                >
                  ✕
                </button>
              )}
            </div>

            {onOpenLibrary && (
              <button
                onClick={onOpenLibrary}
                className="relative flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-white/12 hover:border-champagne-500/50 bg-white/[0.03] text-ivory-200 font-medium text-xs transition-all"
                title="Open your purchased eBooks & eProducts"
              >
                <BookOpen className="w-3.5 h-3.5 text-champagne-400" />
                <span className="hidden sm:inline">Library</span>
                {libraryCount > 0 && (
                  <span className="flex items-center justify-center bg-champagne-400 text-obsidian-950 text-[10px] font-extrabold h-4 min-w-4 px-1 rounded-full">
                    {libraryCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-champagne-500 via-champagne-400 to-champagne-500 hover:brightness-110 text-obsidian-950 font-bold text-xs tracking-wider uppercase shadow-gold transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center bg-obsidian-950 text-champagne-300 text-[10px] font-extrabold h-4 min-w-4 px-1 rounded-full">
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
