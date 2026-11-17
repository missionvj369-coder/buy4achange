import React, { useState } from 'react';
import { ShoppingBag, Search, BookOpen, Compass, Sparkles, X } from 'lucide-react';

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#07051a]/92 backdrop-blur-2xl border-b border-white/[0.12] w-full">
      {/* Prismatic top hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#00f0ff] via-[#ff2e97] to-[#ffb800]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Compact Mobile-Safe Brand Wordmark */}
          <div
            onClick={onNavigateHome}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group select-none min-w-0 shrink"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#00f0ff] via-[#8b5cf6] to-[#ff2e97] p-[2px] shadow-[0_0_20px_rgba(0,240,255,0.3)] shrink-0">
              <div className="w-full h-full bg-[#090620] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#00f0ff]" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-display font-extrabold text-base sm:text-xl lg:text-2xl tracking-tight text-white leading-none truncate">
                BUY<span className="text-[#00f0ff]">4</span>A<span className="text-[#ff2e97]">CHANGE</span>
              </div>
              <div className="font-mono text-[8px] sm:text-[9px] tracking-[0.16em] uppercase text-[#ffb800] mt-0.5 font-semibold truncate">
                Universal Guard Trust · UGT India
              </div>
            </div>
          </div>

          {/* Desktop Center Navigation Pills */}
          <nav className="hidden lg:flex items-center space-x-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold shrink-0">
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

          {/* Right Controls: ALWAYS visible Search + Library + Bag on Mobile & Desktop */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Desktop inline search */}
            <div className="hidden md:flex relative w-44 xl:w-56">
              <Search className="w-3.5 h-3.5 text-[#00f0ff] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/15 rounded-full pl-9 pr-7 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00f0ff] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 hover:text-white"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Search Toggle Button (Always visible on < md) */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Search products"
              className={`md:hidden p-2 rounded-full border transition-all ${
                mobileSearchOpen || searchTerm
                  ? 'border-[#00f0ff] bg-[#00f0ff]/20 text-[#00f0ff]'
                  : 'border-white/15 bg-white/[0.06] text-white'
              }`}
            >
              {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Library Button */}
            {onOpenLibrary && (
              <button
                type="button"
                onClick={onOpenLibrary}
                aria-label="My Digital Library"
                className="relative flex items-center space-x-1.5 p-2 sm:px-3.5 sm:py-2 rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-white font-semibold text-xs transition-all"
                title="My Digital Library"
              >
                <BookOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#00f0ff]" />
                <span className="hidden sm:inline">Library</span>
                {libraryCount > 0 && (
                  <span className="flex items-center justify-center bg-[#ffb800] text-[#060416] text-[10px] font-black h-4 min-w-4 px-1 rounded-full">
                    {libraryCount}
                  </span>
                )}
              </button>
            )}

            {/* Bag Button (Always visible & prominent on Mobile + Desktop) */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Shopping Bag"
              className="relative flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-full prism-button text-white font-bold text-xs tracking-wider uppercase transition-all active:scale-95 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Bag</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center bg-white text-[#060416] text-[10px] font-black h-4 min-w-4 px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Drawer */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#00f0ff] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, eBooks, or missions..."
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (e.target.value.trim()) {
                    document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full bg-white/[0.08] border border-[#00f0ff]/50 rounded-full pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00f0ff]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Compact Mobile Section Quick-Jump Bar */}
        <div className="lg:hidden flex items-center justify-center space-x-2 pb-2.5 pt-0.5 text-[11px] font-semibold overflow-x-auto scrollbar-thin">
          {onScrollToMissions && (
            <button
              type="button"
              onClick={onScrollToMissions}
              className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-200 whitespace-nowrap"
            >
              8 Missions
            </button>
          )}
          {onScrollToCatalog && (
            <button
              type="button"
              onClick={onScrollToCatalog}
              className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-200 whitespace-nowrap"
            >
              Catalog
            </button>
          )}
          {onScrollToEProducts && (
            <button
              type="button"
              onClick={onScrollToEProducts}
              className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[#00f0ff] whitespace-nowrap"
            >
              E-Products &amp; eBooks
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
