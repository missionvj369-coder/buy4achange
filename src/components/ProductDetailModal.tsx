import React, { useState, useEffect } from 'react';
import { X, Star, Heart, Check, Truck, ShieldCheck } from 'lucide-react';
import { Product, Cause } from '../types.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, causeId: string) => void;
  causes: Cause[];
  initialCauseId?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  causes,
  initialCauseId,
}) => {
  const [selectedCauseId, setSelectedCauseId] = useState<string>(
    initialCauseId || product?.cause_id || causes[0]?.id || 'cause-everyday-essentials'
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (initialCauseId) {
      setSelectedCauseId(initialCauseId);
    } else if (product?.cause_id) {
      setSelectedCauseId(product.cause_id);
    }
  }, [initialCauseId, product]);

  if (!product) return null;

  const connectedCause = causes.find((c) => c.id === selectedCauseId) || causes[0];
  const donationAmount = Math.round((product.price * (product.cause_allocation_pct || 15)) / 100) * quantity;

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedCauseId);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#101726] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image */}
        <div className="md:w-1/2 relative bg-slate-900 flex flex-col justify-between overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-72 md:h-full object-cover"
          />

          {/* Impact Floating Strip */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
            <div className="bg-emerald-950/90 border border-emerald-500/40 rounded-2xl p-3.5 backdrop-blur">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs mb-1">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Your Selected Cause Allocation</span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                {product.cause_allocation_pct}% of this purchase directly funds: <strong className="text-white">{connectedCause?.title}</strong>
              </p>
              <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-emerald-800/40">
                <span className="text-slate-300">Total Dedicated Contribution:</span>
                <span className="font-extrabold text-amber-300 text-sm">₹{donationAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Selection */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* Badges & Category */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {product.category}
              </span>
              <div className="flex items-center space-x-1 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 text-xs font-normal">({product.reviews_count} reviews)</span>
              </div>
            </div>

            {/* Product Name */}
            <h2 className="text-2xl font-extrabold font-display text-white leading-tight">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-white font-display">
                ₹{product.price.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-slate-500 line-through">
                  ₹{product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {product.description}
            </p>

            {/* BUYER CHOOSE THE CAUSE DROPDOWN */}
            <div className="p-4 rounded-2xl bg-[#141f35] border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Select Cause to Fund:
                </label>
                <span className="text-[10px] text-amber-400 font-semibold">
                  UGT India National Mission
                </span>
              </div>
              <select
                value={selectedCauseId}
                onChange={(e) => setSelectedCauseId(e.target.value)}
                className="w-full bg-[#0d1424] border border-slate-700 hover:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
              >
                {causes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.tagline}
                  </option>
                ))}
              </select>

              {connectedCause && (
                <p className="text-[11px] text-slate-300 pt-1">
                  {connectedCause.description}
                </p>
              )}
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Free Shipping over ₹1,000</span>
              </div>
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Cause Audit Guarantee</span>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center space-x-4">
            
            {/* Quantity */}
            <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900/80 px-2 py-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-bold text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white font-bold"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              className={`flex-1 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm ${
                added
                  ? 'bg-emerald-500 text-slate-950 scale-[1.02]'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Add to Cart • ₹{(product.price * quantity).toLocaleString()}</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
