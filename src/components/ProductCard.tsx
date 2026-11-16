import React, { useState } from 'react';
import { Heart, Plus, Star, Check } from 'lucide-react';
import { Product, Cause } from '../types.ts';

interface ProductCardProps {
  product: Product;
  causes: Cause[];
  onAddToCart: (product: Product, selectedCauseId: string) => void;
  onOpenDetails: (product: Product, initialCauseId?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  causes,
  onAddToCart,
  onOpenDetails,
}) => {
  const [selectedCauseId, setSelectedCauseId] = useState<string>(
    product.cause_id || causes[0]?.id || 'cause-everyday-essentials'
  );
  const [justAdded, setJustAdded] = useState(false);

  const selectedCause = causes.find((c) => c.id === selectedCauseId) || causes[0];
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
      className="group bg-[#111927] hover:bg-[#152033] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm cursor-pointer relative"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur text-amber-300 border border-amber-500/30">
            {product.badge}
          </div>
        )}

        {/* Cause Allocation Indicator */}
        <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-r from-emerald-950/90 to-slate-950/90 backdrop-blur border border-emerald-500/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs shadow-md">
          <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold text-[11px]">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>{product.cause_allocation_pct}% Donated</span>
          </div>
          <span className="text-[11px] font-bold text-amber-300">
            ₹{donationAmount}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium tracking-wide">
              {product.category}
            </span>
            <div className="flex items-center space-x-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-500 text-[10px]">({product.reviews_count})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-300 transition-colors">
            {product.name}
          </h3>

          {/* USER CHOOSE THE CAUSE DROPDOWN */}
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

        {/* Price & Action Button */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
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
            <div className="text-[10px] text-slate-400">All inclusive</div>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
              justAdded
                ? 'bg-emerald-500 text-slate-950 scale-105'
                : product.stock <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:text-slate-950 active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added</span>
              </>
            ) : product.stock <= 0 ? (
              <span>Sold Out</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
