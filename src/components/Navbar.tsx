import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  BookOpen,
  X,
  Globe,
  ShieldCheck,
  Download,
  Check,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface NavbarProps {
  cartCount: number;
  libraryCount?: number;
  onOpenCart: () => void;
  onOpenLibrary?: () => void;
  onOpenTrack?: () => void;
  onScrollToMissions?: () => void;
  onScrollToCatalog?: () => void;
  onScrollToEProducts?: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNavigateHome: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  libraryCount = 0,
  onOpenCart,
  onOpenLibrary,
  onOpenTrack,
  onScrollToMissions,
  onScrollToCatalog,
  onScrollToEProducts,
  searchTerm,
  onSearchChange,
  onNavigateHome,
  canInstallPwa = false,
  onInstallPwa,
}) => {
  const { lang, meta, t, languages, setLang } = useLanguage();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [langMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-left shrink-0 focus:outline-none"
          >
            <div className="font-display font-bold text-base sm:text-xl tracking-tight text-[#14171A] leading-none">
              Buy<span className="text-[#166534]">4</span>AChange
            </div>
            <div className="text-[10px] text-gray-500 font-medium hidden sm:block mt-0.5">
              Universal Guard Trust · UGT India
            </div>
          </button>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-5 text-sm font-medium text-gray-700">
            {onScrollToCatalog && (
              <button
                type="button"
                onClick={onScrollToCatalog}
                className="hover:text-[#166534] whitespace-nowrap"
              >
                {t.navShop}
              </button>
            )}
            {onScrollToEProducts && (
              <button
                type="button"
                onClick={onScrollToEProducts}
                className="hover:text-[#166534] whitespace-nowrap"
              >
                {t.navEProducts}
              </button>
            )}
            {onScrollToMissions && (
              <button
                type="button"
                onClick={onScrollToMissions}
                className="hover:text-[#166534] whitespace-nowrap"
              >
                {t.navMissions}
              </button>
            )}
            {onOpenTrack && (
              <button
                type="button"
                onClick={onOpenTrack}
                className="hover:text-[#166534] whitespace-nowrap flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
                <span>{t.navTrack}</span>
              </button>
            )}
          </nav>

          {/* Right Action Controls — Always Visible on Any Phone */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Desktop Inline Fuzzy Search */}
            <div className="hidden lg:flex relative w-44">
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

            {/* All 22 Indian Languages + English Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen((v) => !v)}
                aria-label="Select Indian Language"
                title="Switch Language (English + 22 Indian Languages)"
                className={`flex items-center space-x-1 px-2 py-2 sm:px-2.5 rounded-lg border text-xs font-medium ${
                  langMenuOpen || lang !== 'en'
                    ? 'border-[#166534] bg-[#F0FDF4] text-[#166534]'
                    : 'border-gray-200 bg-[#FAF9F6] text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#166534] shrink-0" />
                <span className="max-w-[52px] truncate text-[11px] font-semibold">
                  {lang === 'en' ? 'EN' : meta.nativeName}
                </span>
              </button>

              {langMenuOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        Languages of India (22 + English)
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Eighth Schedule Constitutional Languages
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLangMenuOpen(false)}
                      className="p-1 rounded-lg hover:bg-gray-200 text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-2.5 grid grid-cols-2 gap-1.5 max-h-[65vh] overflow-y-auto scrollbar-thin">
                    {languages.map((item) => {
                      const active = item.code === lang;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setLang(item.code);
                            setLangMenuOpen(false);
                          }}
                          className={`px-2.5 py-2 rounded-lg border text-left flex items-center justify-between gap-1.5 ${
                            active
                              ? 'bg-[#F0FDF4] border-[#166534] text-[#166534]'
                              : 'bg-white border-gray-100 hover:bg-[#FAF9F6] hover:border-gray-200 text-gray-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{item.nativeName}</div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {item.englishName}
                            </div>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-[#166534] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Optional 1-Tap PWA Install Button */}
            {canInstallPwa && onInstallPwa && (
              <button
                type="button"
                onClick={onInstallPwa}
                title={t.installApp}
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] hover:bg-green-100 text-[#166534] text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>App</span>
              </button>
            )}

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
                <span className="hidden sm:inline">{t.navLibrary}</span>
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
              className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold shrink-0"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{t.navBag}</span>
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
                placeholder={t.searchPlaceholder}
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

        {/* Simple Mobile Section Links — Fits Cleanly on 320px+ Phones with Zero Clipping */}
        <div className="md:hidden flex items-center justify-between gap-2 border-t border-gray-100 py-2 text-xs font-medium text-gray-700">
          {onScrollToCatalog && (
            <button type="button" onClick={onScrollToCatalog} className="whitespace-nowrap hover:text-[#166534]">
              {t.navShop}
            </button>
          )}
          {onScrollToEProducts && (
            <button type="button" onClick={onScrollToEProducts} className="whitespace-nowrap hover:text-[#166534]">
              {t.navEProducts}
            </button>
          )}
          {onScrollToMissions && (
            <button type="button" onClick={onScrollToMissions} className="whitespace-nowrap hover:text-[#166534]">
              {t.navMissions}
            </button>
          )}
          {onOpenTrack && (
            <button type="button" onClick={onOpenTrack} className="whitespace-nowrap text-[#166534] font-semibold">
              {t.navTrack}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
