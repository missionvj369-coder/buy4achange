import React, { useState, useEffect } from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import { Product, Cause } from '../types.ts';

interface ProductCardProps {
  product: Product;
  causes: Cause[];
  preferredCauseId?: string | null;
  onAddToCart: (product: Product, selectedCauseId: string) => void;
  onOpenDetails: (product: Product, initialCauseId?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  causes,
  preferredCauseId,
  onAddToCart,
  onOpenDetails,
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
      className="group luxury-card rounded-2xl overflow-hidden transition-all duration-400 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#080c13]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0c111b] to-[#080c13] text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">
            {product.category}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b]/80 via-transparent to-transparent" />

        {product.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-mono text-[9px] font-semibold uppercase tracking-[0.18em] bg-[#05070b]/80 backdrop-blur text-champagne-300 border border-champagne-500/30">
            {product.badge}
          </div>
        )}

        {/* Cause Allocation Pill */}
        <div className="absolute bottom-3 left-3 right-3 bg-[#05070b]/85 backdrop-blur-md border border-champagne-500/25 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-ivory-200 font-medium text-[11px]">
            <Heart className="w-3 h-3 text-champagne-400 fill-champagne-400" />
            <span>{product.cause_allocation_pct}% to Mission</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-champagne-300">
            ₹{donationAmount}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] uppercase">
            <span className="text-slate-400 truncate">{product.category}</span>
            <span className={product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
            </span>
          </div>

          <h3 className="font-display font-medium text-ivory-50 text-xl leading-snug line-clamp-2 group-hover:text-champagne-300 transition-colors">
            {product.name}
          </h3>

          {/* Buyer Choose Mission Dropdown */}
          <div
            className="pt-2 space-y-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="block font-mono text-[9px] font-semibold text-champagne-400 uppercase tracking-[0.2em]">
              Direct Donation To:
            </label>
            <select
              value={selectedCauseId}
              onChange={(e) => setSelectedCauseId(e.target.value)}
              className="w-full bg-[#06090f] border border-white/10 hover:border-champagne-500/50 rounded-xl px-2.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-champagne-400 font-medium cursor-pointer transition"
            >
              {causes.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#080c13] text-ivory-100">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-display text-2xl font-semibold text-ivory-50">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  ₹{product.compare_at_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
              All inclusive
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase flex items-center space-x-1.5 transition-all ${
              justAdded
                ? 'bg-emerald-500 text-obsidian-950 scale-105'
                : product.stock <= 0
                ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-champagne-500 to-champagne-400 hover:brightness-110 text-obsidian-950 shadow-gold active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added</span>
              </>
            ) : product.stock <= 0 ? (
              <span>Sold Out</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
