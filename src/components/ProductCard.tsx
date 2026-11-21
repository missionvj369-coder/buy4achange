import React, { useState, useEffect } from 'react';
import { Heart, Plus, Check, ShieldCheck, Share2 } from 'lucide-react';
import { Product, Cause } from '../types.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

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
    <div
      onClick={() => onOpenDetails(product, selectedCauseId)}
      className="card-editorial rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group"
    >
      {/* Product Photo + Obsidian Telemetry HUD */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono font-medium">
            {product.category}
          </div>
        )}

        {product.quality_cert_url && product.zero_chemical_cert_url ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#070D19]/90 text-emerald-300 text-[10px] font-mono font-semibold border border-emerald-400/40 inline-flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span>ZERO-CHEMICAL</span>
          </div>
        ) : product.badge ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#070D19]/85 text-cyan-200 text-[10px] font-mono font-semibold border border-cyan-400/30">
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
            className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/95 hover:bg-[#070D19] border border-slate-200 hover:border-emerald-400/50 text-[#0D9488] hover:text-emerald-300 shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#070D19]/90 border border-white/15 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] shadow-md">
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
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
            <span className="text-slate-500 font-semibold truncate">{product.category}</span>
            <span className={product.stock > 0 ? 'text-[#059669] font-bold' : 'text-rose-600 font-bold'}>
              {product.stock > 0 ? `${product.stock} READY` : 'SOLD OUT'}
            </span>
          </div>

          <h3 className="font-display font-bold text-[#0A101F] text-base leading-snug line-clamp-2">
            {product.name}
          </h3>

          {product.seller_name && (
            <div className="text-[11px] text-[#0D9488] font-semibold truncate">
              Verified Maker: {product.seller_name}
              {product.origin_state ? ` · ${product.origin_state}` : ''}
            </div>
          )}

          {/* Buyer Mission Selector */}
          <div className="pt-1 space-y-1" onClick={(e) => e.stopPropagation()}>
            <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              Route Impact To
            </label>
            <select
              value={selectedCauseId}
              onChange={(e) => setSelectedCauseId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-[#0A101F] focus:outline-none focus:bg-white focus:border-[#0D9488]"
            >
              {causes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price + Add Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-mono font-bold text-[#0A101F]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compare_at_price && (
                <span className="text-xs font-mono text-slate-400 line-through">
                  ₹{product.compare_at_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">Incl. all taxes</div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 ${
              justAdded
                ? 'btn-future-obsidian'
                : product.stock <= 0
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'btn-future-primary'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
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
    </div>
  );
};
