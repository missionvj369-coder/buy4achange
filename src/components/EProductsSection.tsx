import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  Unlock,
  Sparkles,
  Heart,
  Plus,
  Check,
  Code2,
  Zap,
} from 'lucide-react';
import { Product, Cause, UnlockedDigitalItem } from '../types.ts';
import { Tilt3DCard } from './Tilt3DCard.tsx';

export const EPRODUCT_SUBCATEGORIES = [
  'eBooks',
  'AI & Tech Guides',
  'Templates & Toolkits',
  'Courses & Workshops',
  'Digital Art & Culture',
  'Wellness & Mind',
  'Business & Startup',
];

interface EProductsSectionProps {
  eproducts: Product[];
  causes: Cause[];
  preferredCauseId?: string | null;
  unlockedLibrary: UnlockedDigitalItem[];
  onAddToCart: (product: Product, selectedCauseId: string) => void;
  onOpenDetails: (product: Product, initialCauseId?: string) => void;
  onLaunchUnlocked: (item: UnlockedDigitalItem) => void;
  onOpenLibrary: () => void;
}

interface EProductCardProps {
  product: Product;
  causes: Cause[];
  preferredCauseId?: string | null;
  unlockedItem?: UnlockedDigitalItem;
  onAddToCart: (product: Product, selectedCauseId: string) => void;
  onOpenDetails: (product: Product, initialCauseId?: string) => void;
  onLaunchUnlocked: (item: UnlockedDigitalItem) => void;
}

const EProductCard: React.FC<EProductCardProps> = ({
  product,
  causes,
  preferredCauseId,
  unlockedItem,
  onAddToCart,
  onOpenDetails,
  onLaunchUnlocked,
}) => {
  const [selectedCauseId, setSelectedCauseId] = useState<string>(
    preferredCauseId || product.cause_id || causes[0]?.id || 'cause-everyday-essentials'
  );
  const [justAdded, setJustAdded] = useState(false);

  React.useEffect(() => {
    if (preferredCauseId) {
      setSelectedCauseId(preferredCauseId);
    } else if (product.cause_id) {
      setSelectedCauseId(product.cause_id);
    }
  }, [preferredCauseId, product.cause_id]);

  const donationAmount = Math.round((product.price * (product.cause_allocation_pct || 15)) / 100);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedCauseId);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <Tilt3DCard
      maxTilt={6}
      glowColor="rgba(0, 240, 255, 0.28)"
      onClick={() => onOpenDetails(product, selectedCauseId)}
      className="group luxury-card rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Cover Media */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-950/80 via-slate-900 to-emerald-950/60 text-cyan-300 space-y-2">
            <BookOpen className="w-10 h-10 opacity-80" />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              {product.subcategory || 'eBook / eProduct'}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/85 backdrop-blur text-cyan-300 border border-cyan-400/40 inline-flex items-center space-x-1">
            <Code2 className="w-3 h-3" />
            <span>{product.subcategory || 'eProduct'}</span>
          </span>

          {unlockedItem ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 inline-flex items-center space-x-1">
              <Unlock className="w-3 h-3" />
              <span>Unlocked</span>
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-950/80 backdrop-blur text-amber-300 border border-amber-500/30 inline-flex items-center space-x-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Unlocks on Purchase</span>
            </span>
          )}
        </div>

        {/* Cause Allocation Strip */}
        <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-r from-emerald-950/90 to-slate-950/90 backdrop-blur border border-emerald-500/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs shadow-md">
          <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold text-[11px]">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>{product.cause_allocation_pct}% Donated</span>
          </div>
          <span className="text-[11px] font-bold text-amber-300">₹{donationAmount}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-cyan-400 font-semibold inline-flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Instant Digital Access</span>
            </span>
            <span className="text-slate-400">₹0 Shipping</span>
          </div>

          <h3 className="font-display font-bold text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Buyer Choose Mission Dropdown */}
          <div
            className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-600/30 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              Choose Mission to Fund:
            </label>
            <select
              value={selectedCauseId}
              onChange={(e) => setSelectedCauseId(e.target.value)}
              className="w-full bg-[#0d1424] border border-slate-700 hover:border-emerald-500 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
            >
              {causes.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Price + Action */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-extrabold text-white font-display">
                ₹{product.price.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-slate-500 line-through">
                  ₹{product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-[10px] text-cyan-300/80">Interactive HTML Access</div>
          </div>

          {unlockedItem ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLaunchUnlocked(unlockedItem);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 flex items-center space-x-1.5 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
                justAdded
                  ? 'bg-emerald-500 text-slate-950 scale-105'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-95'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Buy &amp; Unlock</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Tilt3DCard>
  );
};

export const EProductsSection: React.FC<EProductsSectionProps> = ({
  eproducts,
  causes,
  preferredCauseId,
  unlockedLibrary,
  onAddToCart,
  onOpenDetails,
  onLaunchUnlocked,
  onOpenLibrary,
}) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');

  // Combine standard eProduct subcategories with any custom subcategory added by Admin
  const liveSubcats = Array.from(
    new Set([
      ...EPRODUCT_SUBCATEGORIES,
      ...eproducts.map((p) => p.subcategory || '').filter(Boolean),
    ])
  );
  const subcatTabs = ['All', ...liveSubcats];

  const filtered = eproducts.filter(
    (p) => selectedSubcategory === 'All' || (p.subcategory || 'eBooks') === selectedSubcategory
  );

  return (
    <section
      id="eproducts-section"
      className="relative bg-gradient-to-b from-[#060416] via-[#0d0829] to-[#060416] border-t border-white/15 py-20 sm:py-24 overflow-hidden"
    >
      {/* Colourful Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#00f0ff]/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#ff2e97]/15 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-7">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6 border-b border-white/15">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full glass-3d text-[#00f0ff] font-mono text-[10px] font-bold uppercase tracking-[0.24em]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Digital Editions · Zero Shipping</span>
            </div>
            <h2
              className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-3"
            >
              <span>E-Products &amp; <span className="prism-gradient-text">eBooks</span></span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#ff2e97]/15 text-[#ff2e97] border border-[#ff2e97]/40 font-bold">
                {filtered.length} Available
              </span>
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Interactive HTML eBooks, AI guides, templates, and digital toolkits — strictly locked on the server until verified purchase, unlocking instantly in your Library while funding your chosen Living India mission.
            </p>
          </div>

          <button
            onClick={onOpenLibrary}
            className="px-5 py-2.5 rounded-full glass-3d hover:border-[#00f0ff]/60 text-[#00f0ff] font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition shrink-0"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>
              My Library{unlockedLibrary.length > 0 ? ` (${unlockedLibrary.length})` : ''}
            </span>
          </button>
        </div>

        {/* Subcategory Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {subcatTabs.map((sub) => {
            const count =
              sub === 'All'
                ? eproducts.length
                : eproducts.filter((p) => (p.subcategory || 'eBooks') === sub).length;
            const active = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  active
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{sub}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-cyan-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid or Empty State */}
        {filtered.length === 0 ? (
          <div className="py-16 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2.5">
            <BookOpen className="w-8 h-8 mx-auto text-cyan-500/50" />
            <h3 className="text-sm font-bold text-white">
              {eproducts.length === 0
                ? 'E-Products & eBooks Launching Soon'
                : `No items in "${selectedSubcategory}" yet`}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {eproducts.length === 0
                ? 'Interactive HTML eBooks and digital toolkits published in the Admin Console will appear here immediately.'
                : 'Try selecting another subcategory above to explore available eProducts.'}
            </p>
            {selectedSubcategory !== 'All' && (
              <button
                onClick={() => setSelectedSubcategory('All')}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300"
              >
                Show All E-Products
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((prod) => {
              const owned = unlockedLibrary.find((u) => u.product_id === prod.id);
              return (
                <EProductCard
                  key={prod.id}
                  product={prod}
                  causes={causes}
                  preferredCauseId={preferredCauseId}
                  unlockedItem={owned}
                  onAddToCart={onAddToCart}
                  onOpenDetails={onOpenDetails}
                  onLaunchUnlocked={onLaunchUnlocked}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
