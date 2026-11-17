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
      className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer transition-colors"
    >
      {/* Product Photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
            {product.category}
          </div>
        )}

        {product.badge && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-white/95 text-[#14171A] text-[10px] font-semibold border border-gray-200">
            {product.badge}
          </div>
        )}

        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 border border-gray-200 rounded-lg px-2.5 py-1 flex items-center justify-between text-[11px]">
          <span className="flex items-center space-x-1 text-[#166534] font-semibold">
            <Heart className="w-3 h-3 text-[#166534] fill-[#166534]" />
            <span>{product.cause_allocation_pct}% to Mission</span>
          </span>
          <span className="font-mono font-bold text-[#14171A]">₹{donationAmount}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-500 font-medium truncate">{product.category}</span>
            <span className={product.stock > 0 ? 'text-[#166534] font-medium' : 'text-red-600 font-medium'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
            </span>
          </div>

          <h3 className="font-display font-bold text-[#14171A] text-base leading-snug line-clamp-2">
            {product.name}
          </h3>

          {/* Buyer Mission Selector */}
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

        {/* Price + Add Button */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-bold text-[#14171A]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{product.compare_at_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-500">Incl. all taxes</div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
              justAdded
                ? 'bg-[#14532D] text-white'
                : product.stock <= 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#166534] hover:bg-[#14532D] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
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
