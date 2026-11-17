import React, { useState } from 'react';
import { ShoppingBag, Search, BookOpen, X } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Clean Brand Wordmark */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-left focus:outline-none min-w-0 shrink"
          >
            <div className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#14171A] leading-none">
              Buy<span className="text-[#166534]">4</span>AChange
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5 truncate">
              Universal Guard Trust · UGT India
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
            {onScrollToCatalog && (
              <button
                type="button"
                onClick={onScrollToCatalog}
                className="hover:text-[#166534] transition-colors"
              >
                Shop
              </button>
            )}
            {onScrollToEProducts && (
              <button
                type="button"
                onClick={onScrollToEProducts}
                className="hover:text-[#166534] transition-colors"
              >
                E-Products &amp; eBooks
              </button>
            )}
            {onScrollToMissions && (
              <button
                type="button"
                onClick={onScrollToMissions}
                className="hover:text-[#166534] transition-colors"
              >
                8 Missions
              </button>
            )}
          </nav>

          {/* Right Action Controls — Always Visible on Any Phone */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Desktop Inline Search */}
            <div className="hidden lg:flex relative w-48">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-gray-300 rounded-lg pl-9 pr-7 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#166534]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile / Tablet Search Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Search"
              className={`lg:hidden p-2 rounded-lg border text-gray-700 ${
                mobileSearchOpen || searchTerm
                  ? 'border-[#166534] bg-[#F0FDF4] text-[#166534]'
                  : 'border-gray-200 bg-[#FAF9F6]'
              }`}
            >
              {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Digital Library Button */}
            {onOpenLibrary && (
              <button
                type="button"
                onClick={onOpenLibrary}
                aria-label="My Library"
                title="My Purchased eBooks & eProducts"
                className="relative flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] hover:border-[#166534] text-gray-700 text-xs font-medium"
              >
                <BookOpen className="w-4 h-4 text-[#166534]" />
                <span className="hidden sm:inline">Library</span>
                {libraryCount > 0 && (
                  <span className="bg-[#166534] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {libraryCount}
                  </span>
                )}
              </button>
            )}

            {/* Bag Button — Guaranteed Visible */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Shopping Bag"
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold shrink-0"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Bag</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#166534] text-[10px] font-bold px-1.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar on Mobile/Tablet */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, eBooks, or causes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#166534]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Simple Mobile Section Links — Fits Cleanly on 320px+ Phones */}
        <div className="md:hidden flex items-center justify-between gap-2 border-t border-gray-100 py-2 text-xs font-medium text-gray-700">
          {onScrollToCatalog && (
            <button type="button" onClick={onScrollToCatalog} className="whitespace-nowrap hover:text-[#166534]">
              Shop
            </button>
          )}
          {onScrollToEProducts && (
            <button type="button" onClick={onScrollToEProducts} className="whitespace-nowrap hover:text-[#166534]">
              E-Products &amp; eBooks
            </button>
          )}
          {onScrollToMissions && (
            <button type="button" onClick={onScrollToMissions} className="whitespace-nowrap hover:text-[#166534]">
              8 Missions
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
