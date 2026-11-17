import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, Unlock, Heart, Plus, Check } from 'lucide-react';
import { Product, Cause, UnlockedDigitalItem } from '../types.ts';

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

const EProductCard: React.FC<{
  product: Product;
  causes: Cause[];
  preferredCauseId?: string | null;
  unlockedItem?: UnlockedDigitalItem;
  onAddToCart: (product: Product, selectedCauseId: string) => void;
  onOpenDetails: (product: Product, initialCauseId?: string) => void;
  onLaunchUnlocked: (item: UnlockedDigitalItem) => void;
}> = ({
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
    <div
      onClick={() => onOpenDetails(product, selectedCauseId)}
      className="bg-white border border-gray-200 hover:border-[#166534] rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer transition-colors"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F0FDF4]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#166534] space-y-1.5">
            <BookOpen className="w-8 h-8" />
            <span className="text-xs font-semibold">{product.subcategory || 'eBook'}</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded bg-white/95 text-[#14171A] text-[10px] font-semibold border border-gray-200">
            {product.subcategory || 'eProduct'}
          </span>
          {unlockedItem ? (
            <span className="px-2 py-0.5 rounded bg-[#166534] text-white text-[10px] font-semibold inline-flex items-center space-x-1">
              <Unlock className="w-3 h-3" />
              <span>Unlocked</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-white/95 text-amber-800 border border-amber-200 text-[10px] font-semibold inline-flex items-center space-x-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Unlocks After Payment</span>
            </span>
          )}
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 border border-gray-200 rounded-lg px-2.5 py-1 flex items-center justify-between text-[11px]">
          <span className="flex items-center space-x-1 text-[#166534] font-semibold">
            <Heart className="w-3 h-3 text-[#166534] fill-[#166534]" />
            <span>{product.cause_allocation_pct}% to Mission</span>
          </span>
          <span className="font-mono font-bold text-[#14171A]">₹{donationAmount}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="text-[#166534] font-medium">Digital Edition</span>
            <span>₹0 Shipping</span>
          </div>

          <h3 className="font-display font-bold text-[#14171A] text-base leading-snug line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
          )}

          <div className="pt-1 space-y-1" onClick={(e) => e.stopPropagation()}>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Mission to Support
            </label>
            <select
              value={selectedCauseId}
              onChange={(e) => setSelectedCauseId(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-[#14171A] focus:outline-none focus:border-[#166534]"
            >
              {causes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-[#14171A]">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-gray-500">Interactive HTML</div>
          </div>

          {unlockedItem ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLaunchUnlocked(unlockedItem);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold"
            >
              Open Now
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="px-3.5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold flex items-center space-x-1"
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
      className="bg-white border-t border-b border-gray-200 py-12 sm:py-16 w-full"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
              Digital Library · ₹0 Shipping
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14171A]">
              E-Products &amp; eBooks
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl">
              Interactive HTML eBooks and digital guides that unlock in your Library once payment is verified.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenLibrary}
            className="self-start sm:self-end px-4 py-2 rounded-lg border border-gray-300 bg-[#FAF9F6] hover:border-[#166534] text-[#14171A] text-xs font-semibold flex items-center space-x-1.5 shrink-0"
          >
            <Unlock className="w-3.5 h-3.5 text-[#166534]" />
            <span>
              My Library{unlockedLibrary.length > 0 ? ` (${unlockedLibrary.length})` : ''}
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${
                  active
                    ? 'bg-[#166534] text-white border-[#166534]'
                    : 'bg-[#FAF9F6] text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 px-4 rounded-xl bg-[#FAF9F6] border border-gray-200 text-center space-y-2">
            <BookOpen className="w-7 h-7 mx-auto text-gray-400" />
            <h3 className="text-sm font-bold text-[#14171A]">
              {eproducts.length === 0
                ? 'E-Products & eBooks Coming Soon'
                : `No items in "${selectedSubcategory}" yet`}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Digital eBooks and HTML editions published from Admin will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
