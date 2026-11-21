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
    <header className="sticky top-0 z-50 w-full bg-[#05080A]/80 backdrop-blur-xl border-b border-white/10">
      {invitedByName && (
        <div className="bg-emerald-950/80 border-b border-emerald-400/25 px-3 py-1.5 text-center text-[11px] font-mono text-emerald-200">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle" />
          INVITED BY <strong className="text-white uppercase">{invitedByName}</strong> · CONSCIOUS COMMERCE PROTOCOL
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Minimal Hape-Grade Brand Lockup */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center space-x-2 text-left shrink-0 focus:outline-none group"
          >
            <div className="flex items-center space-x-1">
              <span className="inline-block w-1.5 h-5 sm:h-6 rounded-full bg-emerald-400 group-hover:bg-white transition-colors" />
              <span className="font-display font-extrabold text-sm sm:text-xl tracking-tight text-white leading-none">
                Buy<span className="text-emerald-400">4</span>AChange<sup className="text-[9px] text-white/60 ml-0.5">®</sup>
              </span>
            </div>
          </button>

          {/* Desktop Wide-Tracked Studio Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/[0.04] border border-white/10 p-1 rounded-full text-[11px] font-mono uppercase tracking-[0.12em] text-slate-300">
            {onScrollToCatalog && (
              <button
                type="button"
                onClick={onScrollToCatalog}
                className="px-3.5 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
              >
                {t.navShop}
              </button>
            )}
            {onScrollToEProducts && (
              <button
                type="button"
                onClick={onScrollToEProducts}
                className="px-3.5 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
              >
                {t.navEProducts}
              </button>
            )}
            {onScrollToMissions && (
              <button
                type="button"
                onClick={onScrollToMissions}
                className="px-3.5 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
              >
                {t.navMissions}
              </button>
            )}
            {onOpenTrack && (
              <button
                type="button"
                onClick={onOpenTrack}
                className="px-3.5 py-1.5 rounded-full hover:bg-white/10 hover:text-emerald-300 transition-all whitespace-nowrap flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.navTrack}</span>
              </button>
            )}
          </nav>

          {/* Right Studio Controls */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* Desktop Inline Fuzzy Search */}
            <div className="hidden xl:flex relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search 3D catalog..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/12 rounded-full pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-white/[0.10] focus:border-emerald-400/60 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
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
                className={`flex items-center space-x-1 px-1.5 py-1.5 sm:px-2.5 sm:py-2 rounded-full border text-xs font-semibold transition-all ${
                  langMenuOpen || lang !== 'en'
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/15 bg-white/[0.05] text-slate-200 hover:border-white/35 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="max-w-[38px] sm:max-w-[52px] truncate text-[10px] sm:text-[11px] font-mono">
                  {lang === 'en' ? 'EN' : meta.nativeName}
                </span>
              </button>

              {langMenuOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] bg-[#0B1016] border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#05080A] border-b border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-display font-bold text-white uppercase tracking-wider">
                        Languages of India (22 + English)
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400">
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
                              ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-300'
                              : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{item.nativeName}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {item.englishName}
                            </div>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {canInstallPwa && onInstallPwa && (
              <button
                type="button"
                onClick={onInstallPwa}
                title={t.installApp}
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold"
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
              className={`xl:hidden p-1.5 sm:p-2 rounded-full border transition-all ${
                mobileSearchOpen || searchTerm
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/15 bg-white/[0.05] text-slate-200 hover:border-white/35'
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
                className="relative flex items-center space-x-1.5 p-1.5 sm:px-2.5 sm:py-2 rounded-full border border-white/15 bg-white/[0.05] hover:border-emerald-400/50 text-slate-200 hover:text-white text-xs font-semibold transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span className="hidden sm:inline">{t.navLibrary}</span>
                {libraryCount > 0 && (
                  <span className="bg-emerald-400 text-[#05080A] font-mono text-[10px] font-bold px-1.5 rounded-full">
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
                className={`flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-2 rounded-full border text-xs font-semibold transition-all ${
                  memberUser
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/15 bg-white/[0.05] hover:border-emerald-400/50 text-slate-200 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline max-w-[72px] truncate">
                  {memberUser ? memberUser.name.split(/\s+/)[0] : 'Account'}
                </span>
              </button>
            )}

            {/* Signature Hape-Style White Circle Badge Bag Button */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Shopping Bag"
              className="flex items-center space-x-1.5 pl-2.5 pr-1 py-1 sm:pl-3.5 sm:pr-1 sm:py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white text-[11px] font-mono uppercase tracking-wider font-bold shrink-0 transition-all"
            >
              <span className="hidden sm:inline">{t.navBag}</span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#05080A] flex items-center justify-center relative">
                {cartCount > 0 ? (
                  <span className="text-[11px] font-mono font-extrabold">{cartCount}</span>
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Search Bar on Mobile/Tablet */}
        {mobileSearchOpen && (
          <div className="xl:hidden pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/15 rounded-full pl-9 pr-8 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Quick Links Row */}
        <div className="md:hidden flex items-center justify-between gap-2 border-t border-white/10 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-300">
          {onScrollToCatalog && (
            <button type="button" onClick={onScrollToCatalog} className="whitespace-nowrap hover:text-white">
              {t.navShop}
            </button>
          )}
          {onScrollToEProducts && (
            <button type="button" onClick={onScrollToEProducts} className="whitespace-nowrap hover:text-white">
              {t.navEProducts}
            </button>
          )}
          {onScrollToMissions && (
            <button type="button" onClick={onScrollToMissions} className="whitespace-nowrap hover:text-white">
              {t.navMissions}
            </button>
          )}
          {onOpenTrack && (
            <button type="button" onClick={onOpenTrack} className="whitespace-nowrap text-emerald-400 font-bold">
              {t.navTrack}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
