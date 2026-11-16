import React from 'react';
import { ShoppingBag, Heart, Search, ShieldCheck, BookOpen } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  libraryCount?: number;
  onOpenCart: () => void;
  onOpenLibrary?: () => void;
  onScrollToEProducts?: () => void;
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
  searchTerm,
  onSearchChange,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Top UGT India Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 px-4 py-1.5 text-xs text-emerald-200 border-b border-emerald-800/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-100">
              UGT India Network for Action:
            </span>
            <span className="hidden sm:inline text-emerald-300/90">
              Every purchase directly funds your chosen national mission across Indian PIN codes.
            </span>
          </div>

          <div className="flex items-center space-x-4 text-emerald-300 text-[11px]">
            <a
              href="https://ugtindia.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-100 transition-colors flex items-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ugtindia.space</span>
            </a>
            <span className="text-emerald-800">|</span>
            <a
              href="https://ugtglobal.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-100 transition-colors hidden md:inline"
            >
              ugtglobal.space
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div
            onClick={onNavigateHome}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-500 p-[1.5px] shadow-sm group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0b1220] rounded-[10px] flex items-center justify-center">
                <Heart className="w-5 h-5 text-emerald-400 fill-emerald-500/20 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  BUY<span className="text-emerald-400">4</span>A<span className="text-amber-400">CHANGE</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded">
                  UGT INDIA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Conscious Commerce for Community
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by title, category, or mission..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: E-Products, My Library & Cart Buttons */}
          <div className="flex items-center space-x-2">
            {onScrollToEProducts && (
              <button
                onClick={onScrollToEProducts}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>E-Products</span>
              </button>
            )}

            {onOpenLibrary && (
              <button
                onClick={onOpenLibrary}
                className="relative flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-slate-200 font-semibold text-xs transition-all"
                title="Open your purchased eBooks & eProducts"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">My Library</span>
                {libraryCount > 0 && (
                  <span className="flex items-center justify-center bg-cyan-400 text-slate-950 text-[10px] font-black h-4 min-w-4 px-1 rounded-full">
                    {libraryCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-sm transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center bg-amber-400 text-slate-950 text-xs font-black h-5 min-w-5 px-1.5 rounded-full">
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
