import React, { useState, useEffect } from 'react';
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
  Menu,
  Play,
  ArrowUpRight,
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
  const { lang, t, languages, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLangList, setShowLangList] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* EXACT HAPE.IO MINIMAL FLOATING TOP CHROME — ZERO CLUTTER */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {invitedByName && (
          <div className="pointer-events-auto bg-black/85 backdrop-blur-md border-b border-emerald-400/25 px-3 py-1 text-center text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300">
            Invited by <strong className="text-white">{invitedByName}</strong>
          </div>
        )}

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 h-20 flex items-center justify-between gap-3">
          {/* Top-Left: Pill CTA on Hero → Clean White Wordmark When Scrolled (Exact Hape Behavior) */}
          <div className="pointer-events-auto flex items-center">
            {scrolled ? (
              <button
                type="button"
                onClick={onNavigateHome}
                className="font-display font-bold text-lg sm:text-xl tracking-tight text-white hover:text-emerald-300 transition-colors"
              >
                Buy4AChange<sup className="text-[10px] ml-0.5">®</sup>
              </button>
            ) : (
              <button
                type="button"
                onClick={onScrollToMissions}
                className="pill-hape-cta"
              >
                <span>{t.navMissions}</span>
                <span className="pill-hape-circle">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
              </button>
            )}
          </div>

          {/* Top-Center: Ultra-Minimal Micro-Label (Exact Hape Center Label) */}
          {!scrolled && (
            <div className="hidden md:block text-[10px] font-mono uppercase tracking-[0.24em] font-bold text-black/85 select-none">
              UNIVERSAL GUARD TRUST · INDIA
            </div>
          )}

          {/* Top-Right: VIEW STORE Pill + Circular Black Hamburger Menu Button */}
          <div className="pointer-events-auto flex items-center space-x-2.5 sm:space-x-3">
            {!scrolled && (
              <button
                type="button"
                onClick={onScrollToCatalog}
                className="hidden sm:inline-flex pill-hape-cta"
              >
                <span>{t.navShop}</span>
                <span className="pill-hape-circle">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </span>
              </button>
            )}

            {/* Compact Bag Pill when items are in cart */}
            {cartCount > 0 && (
              <button
                type="button"
                onClick={onOpenCart}
                aria-label="Open Shopping Bag"
                className="relative w-11 h-11 rounded-full bg-emerald-400 hover:bg-white text-black flex items-center justify-center shadow-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white text-[10px] font-mono font-bold flex items-center justify-center border border-white/25">
                  {cartCount}
                </span>
              </button>
            )}

            {/* Signature Solid Black Circular Hamburger Menu Button (Exact Hape Top-Right Circle) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open Menu"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black hover:bg-emerald-950 text-white border border-white/15 flex items-center justify-center shadow-2xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CLEAN FULL-HEIGHT STUDIO NAVIGATION DRAWER (Houses Search, 22 Languages, Library, Account, Bag, Track) */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative w-full max-w-sm bg-[#03140D] border-l border-white/12 text-white h-full flex flex-col justify-between overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-display font-bold text-lg tracking-tight">
                  Buy4AChange<sup className="text-[10px] ml-0.5">®</sup>
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close Menu"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-black flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-full pl-10 pr-8 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Primary Navigation */}
              <nav className="flex flex-col space-y-2 font-display text-2xl font-bold uppercase tracking-tight">
                {onScrollToCatalog && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onScrollToCatalog();
                    }}
                    className="text-left py-1.5 hover:text-emerald-400 flex items-center justify-between transition-colors"
                  >
                    <span>01 / {t.navShop}</span>
                    <ArrowUpRight className="w-5 h-5 text-white/40" />
                  </button>
                )}
                {onScrollToEProducts && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onScrollToEProducts();
                    }}
                    className="text-left py-1.5 hover:text-emerald-400 flex items-center justify-between transition-colors"
                  >
                    <span>02 / {t.navEProducts}</span>
                    <ArrowUpRight className="w-5 h-5 text-white/40" />
                  </button>
                )}
                {onScrollToMissions && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onScrollToMissions();
                    }}
                    className="text-left py-1.5 hover:text-emerald-400 flex items-center justify-between transition-colors"
                  >
                    <span>03 / {t.navMissions}</span>
                    <ArrowUpRight className="w-5 h-5 text-white/40" />
                  </button>
                )}
              </nav>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenCart();
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white text-black font-bold flex items-center justify-center space-x-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>
                    {t.navBag} ({cartCount})
                  </span>
                </button>

                {onOpenAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">
                      {memberUser ? memberUser.name.split(/\s+/)[0] : 'Account'}
                    </span>
                  </button>
                )}

                {onOpenLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenLibrary();
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {t.navLibrary} ({libraryCount})
                    </span>
                  </button>
                )}

                {onOpenTrack && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenTrack();
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.navTrack}</span>
                  </button>
                )}
              </div>

              {/* All 22 Indian Languages Switcher */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setShowLangList((v) => !v)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-between text-xs font-semibold"
                >
                  <span className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Indian Languages (22 + EN)</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase text-emerald-300">
                    {showLangList ? 'Hide' : lang.toUpperCase()}
                  </span>
                </button>

                {showLangList && (
                  <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                    {languages.map((item) => {
                      const active = item.code === lang;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setLang(item.code);
                            setShowLangList(false);
                          }}
                          className={`px-2.5 py-2 rounded-lg border text-left flex items-center justify-between gap-1 text-xs ${
                            active
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : 'bg-white/[0.03] border-white/10 text-slate-200 hover:bg-white/[0.08]'
                          }`}
                        >
                          <span className="truncate font-medium">{item.nativeName}</span>
                          {active && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {canInstallPwa && onInstallPwa && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onInstallPwa();
                  }}
                  className="w-full py-2.5 rounded-full bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.installApp}</span>
                </button>
              )}
            </div>

            <div className="pt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
              UNIVERSAL GUARD TRUST · UGT INDIA
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
