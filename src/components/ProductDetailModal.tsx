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
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image & Contribution Summary */}
        <div className="md:w-1/2 bg-[#FAF9F6] border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between">
          <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>

          <div className="p-4 bg-[#F0FDF4] border-t border-[#BBF7D0]">
            <div className="flex items-center space-x-2 text-[#166534] font-semibold text-xs mb-1">
              <Heart className="w-4 h-4 text-[#166534]" />
              <span>Selected Mission Contribution</span>
            </div>
            <p className="text-xs text-gray-700">
              {product.cause_allocation_pct}% of this purchase funds:{' '}
              <strong className="text-gray-900">{connectedCause?.title}</strong>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-[#BBF7D0]">
              <span className="text-gray-600">Dedicated Contribution:</span>
              <span className="font-bold text-[#166534] text-sm">₹{donationAmount}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Selection */}
        <div className="md:w-1/2 p-5 sm:p-7 overflow-y-auto flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Category & Availability */}
            <div className="flex items-center justify-between pr-8">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                {product.product_type === 'digital'
                  ? product.subcategory || 'E-Product'
                  : product.category}
              </span>
              {product.reviews_count > 0 && product.rating > 0 ? (
                <div className="flex items-center space-x-1 text-amber-600 font-semibold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-gray-500 font-normal">({product.reviews_count})</span>
                </div>
              ) : (
                <span className="text-xs font-medium text-[#166534]">
                  {product.product_type === 'digital'
                    ? 'Digital Access'
                    : product.stock > 0
                    ? `${product.stock} in stock`
                    : 'Out of stock'}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 leading-snug">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.compare_at_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* Buyer Choose Mission Dropdown */}
            <div className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-900">
                  Choose Mission to Support:
                </label>
                <span className="text-[11px] text-[#166534] font-medium">
                  UGT India National Mission
                </span>
              </div>
              <select
                value={selectedCauseId}
                onChange={(e) => setSelectedCauseId(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#166534] font-medium"
              >
                {causes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {connectedCause && (
                <p className="text-xs text-gray-600 pt-1 leading-relaxed">
                  {connectedCause.description}
                </p>
              )}
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700">
              <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                <Truck className="w-4 h-4 text-[#166534] shrink-0" />
                <span>
                  {product.product_type === 'digital'
                    ? 'Digital Delivery (₹0 Shipping)'
                    : 'Free Shipping over ₹1,000'}
                </span>
              </div>
              <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0" />
                <span>
                  {product.product_type === 'digital'
                    ? 'Unlocks After Verified Payment'
                    : 'Audited Mission Allocation'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-gray-200 flex items-center space-x-3">
            <div className="flex items-center border border-gray-300 rounded-lg bg-white px-1 py-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-sm font-semibold flex items-center justify-center space-x-2"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <span>Add to Bag · ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
