import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, Unlock, Heart, Plus, Check, Share2 } from 'lucide-react';
import { Product, Cause, UnlockedDigitalItem } from '../types.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
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
  onShareProduct?: (product: Product) => void;
}

const EProductCard: React.FC<{
  product: Product;
  causes: Cause[];
  preferredCauseId?: string | null;
  unlockedItem?: UnlockedDigitalItem;
  onAddToCart: (product: Product, selectedCauseId: string) => void;
  onOpenDetails: (product: Product, initialCauseId?: string) => void;
  onLaunchUnlocked: (item: UnlockedDigitalItem) => void;
  onShareProduct?: (product: Product) => void;
}> = ({
  product,
  causes,
  preferredCauseId,
  unlockedItem,
  onAddToCart,
  onOpenDetails,
  onLaunchUnlocked,
  onShareProduct,
}) => {
  const [selectedCauseId, setSelectedCauseId] = useState<string>(
    preferredCauseId || product.cause_id || causes[0]?.id || 'cause-everyday-essentials'
  );
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
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
      onClick={() => onOpenDetails(product, selectedCauseId)}
      className="studio-card-3d rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A131A]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-emerald-400 space-y-1.5">
            <BookOpen className="w-8 h-8" />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">
              {product.subcategory || 'eBook'}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#05080A]/80 via-transparent to-black/30 pointer-events-none" />

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-mono uppercase font-semibold border border-white/20">
            {product.subcategory || 'eProduct'}
          </span>
          {unlockedItem ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-[#05080A] text-[10px] font-mono uppercase font-bold inline-flex items-center space-x-1">
              <Unlock className="w-3 h-3" />
              <span>Unlocked</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/35 text-[10px] font-mono font-semibold inline-flex items-center space-x-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Instant Unlock</span>
            </span>
          )}
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/85 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px]">
          <span className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
            <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span>{product.cause_allocation_pct}% to Mission</span>
          </span>
          <span className="font-mono font-bold text-white">₹{donationAmount}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.12em] text-slate-400">
            <span className="text-emerald-400 font-semibold">Digital Edition</span>
            <span>₹0 Shipping</span>
          </div>

          <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
          )}

          <div className="pt-1 space-y-1" onClick={(e) => e.stopPropagation()}>
            <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-slate-400">
              Route Impact To
            </label>
            <select
              value={selectedCauseId}
              onChange={(e) => setSelectedCauseId(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              {causes.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0B1016] text-white">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-mono font-bold text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] font-mono text-slate-400">INTERACTIVE HTML</div>
          </div>

          <div className="flex items-center space-x-1.5">
            {onShareProduct && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShareProduct(product);
                }}
                aria-label="Share and earn"
                title="Share & Earn"
                className="p-2 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white text-white hover:text-[#05080A] transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
            {unlockedItem ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchUnlocked(unlockedItem);
                }}
                className="px-3.5 py-2 rounded-full bg-emerald-400 hover:bg-white text-[#05080A] text-xs font-mono uppercase font-bold"
              >
                Open
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className={`px-3.5 py-2 rounded-full text-xs font-mono uppercase font-bold flex items-center space-x-1 transition-all ${
                  justAdded
                    ? 'bg-emerald-400 text-[#05080A]'
                    : 'bg-white hover:bg-emerald-400 text-[#05080A]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buy</span>
                  </>
                )}
              </button>
            )}
          </div>
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
  onShareProduct,
}) => {
  const { t } = useLanguage();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');

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
      className="relative py-20 sm:py-28 w-full border-t border-white/10"
      style={{
        background:
          'linear-gradient(180deg, #031B12 0%, #053222 50%, #031C13 100%)',
      }}
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/55">
              02 /
            </div>
            <h2 className="font-display font-extrabold uppercase text-3xl sm:text-5xl text-white leading-[0.92] tracking-[-0.03em]">
              DIGITAL
              <br />
              KNOWLEDGE
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenLibrary}
            className="self-start sm:self-end pill-hape-cta shrink-0"
          >
            <span>
              My Library{unlockedLibrary.length > 0 ? ` (${unlockedLibrary.length})` : ''}
            </span>
            <span className="pill-hape-circle">
              <Unlock className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* Subcategory Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {subcatTabs.map((sub) => {
            const active = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.14em] font-semibold whitespace-nowrap border transition-all ${
                  active
                    ? 'bg-white text-black border-white'
                    : 'bg-black/30 text-white/75 border-white/15 hover:border-white/40 hover:text-white'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 px-6 border border-white/10 bg-black/25 text-center space-y-2">
            <BookOpen className="w-7 h-7 mx-auto text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-white/80">
              {eproducts.length === 0
                ? 'Digital Editions Launching Soon'
                : `No items in "${selectedSubcategory}"`}
            </h3>
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
                  onShareProduct={onShareProduct}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
