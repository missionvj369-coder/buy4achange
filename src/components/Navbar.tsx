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
  User,
  Layers,
} from 'lucide-react';
import { MemberUser } from '../types.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface NavbarProps {
  cartCount: number;
  libraryCount?: number;
  memberUser?: MemberUser | null;
  invitedByName?: string | null;
  onOpenCart: () => void;
  onOpenLibrary?: () => void;
  onOpenTrack?: () => void;
  onOpenAccount?: () => void;
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
  memberUser = null,
  invitedByName = null,
  onOpenCart,
  onOpenLibrary,
  onOpenTrack,
  onOpenAccount,
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
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_6px_24px_-18px_rgba(7,13,25,0.22)]">
      <div className="hero-horizon-bar" />
      {invitedByName && (
        <div className="bg-[#070D19] border-b border-emerald-500/25 px-3 py-1.5 text-center text-[11px] font-medium text-emerald-200">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle" />
          Invited by <strong className="text-white">{invitedByName}</strong> · Conscious commerce powering 8 Living India missions
        </div>
      )}
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Futuristic Prism Brand Mark */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center space-x-1.5 sm:space-x-2.5 text-left shrink-0 focus:outline-none group"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#070D19] via-[#0F2438] to-[#059669] flex items-center justify-center shadow-sm border border-emerald-400/30 shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
            </div>
            <div>
              <div className="font-display font-bold text-sm sm:text-lg tracking-tight text-[#0A101F] leading-none flex items-center space-x-1">
                <span>
                  Buy<span className="gradient-text-future">4</span>AChange
                </span>
              </div>
              <div className="text-[9px] font-mono uppercase tracking-[0.14em] text-slate-500 hidden sm:flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>UGT INDIA · PROTOCOL</span>
              </div>
            </div>
          </button>

          {/* Desktop Floating Segmented Pill Nav Dock */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 border border-slate-200/80 p-1 rounded-full text-xs font-semibold text-slate-700">
            {onScrollToCatalog && (
              <button
                type="button"
                onClick={onScrollToCatalog}
                className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#059669] hover:shadow-sm transition-all whitespace-nowrap"
              >
                {t.navShop}
              </button>
            )}
            {onScrollToEProducts && (
              <button
                type="button"
                onClick={onScrollToEProducts}
                className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#059669] hover:shadow-sm transition-all whitespace-nowrap"
              >
                {t.navEProducts}
              </button>
            )}
            {onScrollToMissions && (
              <button
                type="button"
                onClick={onScrollToMissions}
                className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#059669] hover:shadow-sm transition-all whitespace-nowrap"
              >
                {t.navMissions}
              </button>
            )}
            {onOpenTrack && (
              <button
                type="button"
                onClick={onOpenTrack}
                className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#059669] hover:shadow-sm transition-all whitespace-nowrap flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>{t.navTrack}</span>
              </button>
            )}
          </nav>

          {/* Right Action Controls — Always Visible on Any Phone */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* Desktop Inline Fuzzy Search */}
            <div className="hidden lg:flex relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search network..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-100/80 border border-slate-200 rounded-full pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/15 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
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
                className={`flex items-center space-x-1 px-1.5 py-1.5 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all ${
                  langMenuOpen || lang !== 'en'
                    ? 'border-teal-500/50 bg-emerald-50 text-[#047857]'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-400/50 hover:bg-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                <span className="max-w-[42px] sm:max-w-[52px] truncate text-[10px] sm:text-[11px] font-mono font-semibold">
                  {lang === 'en' ? 'EN' : meta.nativeName}
                </span>
              </button>

              {langMenuOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#070D19] text-white border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-display font-bold text-white">
                        Languages of India (22 + English)
                      </div>
                      <div className="text-[10px] font-mono text-emerald-300/90">
                        EIGHTH SCHEDULE · MULTI-SCRIPT ENGINE
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLangMenuOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-300"
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
                          className={`px-2.5 py-2 rounded-xl border text-left flex items-center justify-between gap-1.5 transition-all ${
                            active
                              ? 'bg-emerald-50 border-teal-500 text-[#047857]'
                              : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{item.nativeName}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {item.englishName}
                            </div>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />}
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
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#0F766E] text-xs font-semibold"
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
              className={`lg:hidden p-1.5 sm:p-2 rounded-xl border text-slate-700 ${
                mobileSearchOpen || searchTerm
                  ? 'border-teal-500 bg-emerald-50 text-[#047857]'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              {mobileSearchOpen ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Digital Library Button */}
            {onOpenLibrary && (
              <button
                type="button"
                onClick={onOpenLibrary}
                aria-label="My Library"
                title="My Purchased eBooks & eProducts"
                className="relative flex items-center space-x-1.5 p-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-white text-slate-700 text-xs font-semibold transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488]" />
                <span className="hidden sm:inline">{t.navLibrary}</span>
                {libraryCount > 0 && (
                  <span className="bg-[#070D19] text-emerald-300 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {libraryCount}
                  </span>
                )}
              </button>
            )}

            {/* Member Account / Refer & Earn Button */}
            {onOpenAccount && (
              <button
                type="button"
                onClick={onOpenAccount}
                aria-label="My Account"
                title={memberUser ? `${memberUser.name} — Refer & Earn Dashboard` : 'Sign In / Refer & Earn'}
                className={`flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all ${
                  memberUser
                    ? 'border-emerald-400/60 bg-emerald-50 text-[#047857]'
                    : 'border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-white text-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488] shrink-0" />
                <span className="hidden sm:inline max-w-[72px] truncate">
                  {memberUser ? memberUser.name.split(/\s+/)[0] : 'Account'}
                </span>
              </button>
            )}

            {/* Futuristic Gradient Bag Button */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Shopping Bag"
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl btn-future-primary text-xs font-semibold shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">{t.navBag}</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#047857] font-mono text-[10px] font-bold px-1.5 rounded-full">
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
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0D9488]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Section Links Bar */}
        <div className="md:hidden flex items-center justify-between gap-2 border-t border-slate-200/70 py-2 text-xs font-semibold text-slate-700">
          {onScrollToCatalog && (
            <button type="button" onClick={onScrollToCatalog} className="whitespace-nowrap hover:text-[#059669]">
              {t.navShop}
            </button>
          )}
          {onScrollToEProducts && (
            <button type="button" onClick={onScrollToEProducts} className="whitespace-nowrap hover:text-[#059669]">
              {t.navEProducts}
            </button>
          )}
          {onScrollToMissions && (
            <button type="button" onClick={onScrollToMissions} className="whitespace-nowrap hover:text-[#059669]">
              {t.navMissions}
            </button>
          )}
          {onOpenTrack && (
            <button type="button" onClick={onOpenTrack} className="whitespace-nowrap text-[#0D9488] font-bold">
              {t.navTrack}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
