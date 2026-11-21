import React, { useState, useEffect } from 'react';
import { Heart, Plus, Check, ShieldCheck, Share2 } from 'lucide-react';
import { Product, Cause } from '../types.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { Tilt3DCard } from './Tilt3DCard.tsx';

interface ProductCardProps {
  product: Product;
  causes: Cause[];
  preferredCauseId?: string | null;
  onAddToCart: (product: Product, selectedCauseId: string) => void;
  onOpenDetails: (product: Product, initialCauseId?: string) => void;
  onShareProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  causes,
  preferredCauseId,
  onAddToCart,
  onOpenDetails,
  onShareProduct,
}) => {
  const { t } = useLanguage();
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
      {/* Product Photo + Dark Studio Lighting Vignette */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0E141B]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            {product.category}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#05080A]/80 via-transparent to-black/25 pointer-events-none" />

        {product.quality_cert_url && product.zero_chemical_cert_url ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/40 inline-flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span>ZERO-CHEMICAL</span>
          </div>
        ) : product.badge ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-wider font-semibold border border-white/20">
            {product.badge}
          </div>
        ) : null}

        {onShareProduct && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShareProduct(product);
            }}
            aria-label="Share and earn"
            title="Share & Earn Referral Income"
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/75 hover:bg-white border border-white/20 text-white hover:text-[#05080A] transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/85 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px]">
          <span className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
            <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span>{product.cause_allocation_pct}% to Mission</span>
          </span>
          <span className="font-mono font-bold text-white">₹{donationAmount}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.12em]">
            <span className="text-slate-400 truncate">{product.category}</span>
            <span className={product.stock > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {product.stock > 0 ? `${product.stock} READY` : 'SOLD OUT'}
            </span>
          </div>

          <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-2">
            {product.name}
          </h3>

          {product.seller_name && (
            <div className="text-[11px] text-emerald-300/90 font-medium truncate">
              By {product.seller_name}
              {product.origin_state ? ` · ${product.origin_state}` : ''}
            </div>
          )}

          {/* Buyer Mission Selector */}
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

        {/* Price + Hape-Grade CTA */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-mono font-bold text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compare_at_price && (
                <span className="text-xs font-mono text-slate-500 line-through">
                  ₹{product.compare_at_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">INCL. TAXES</div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-1 transition-all ${
              justAdded
                ? 'bg-emerald-400 text-[#05080A]'
                : product.stock <= 0
                ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                : 'bg-white hover:bg-emerald-400 text-[#05080A]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t.addedBtn}</span>
              </>
            ) : product.stock <= 0 ? (
              <span>Sold Out</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Tilt3DCard>
  );
};
