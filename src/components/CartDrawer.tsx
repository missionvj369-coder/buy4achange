import React from 'react';
import { X, Trash2, Heart, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { CartItem, Cause } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  causes: Cause[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateItemCause: (productId: string, causeId: string) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  causes,
  onUpdateQuantity,
  onUpdateItemCause,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1000;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 70;
  const total = subtotal + shippingFee;

  // Calculate total cause donation
  const totalCauseDonation = items.reduce((sum, item) => {
    const pct = item.product.cause_allocation_pct || 15;
    return sum + (item.product.price * item.quantity * pct) / 100;
  }, 0);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0f1728] border-l border-slate-800 flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#131d31]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-display">Your Conscious Cart</h2>
                <p className="text-xs text-slate-400">{items.length} items with dedicated cause impact</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {items.length > 0 && (
            <div className="px-5 py-2.5 bg-[#111a2d] border-b border-slate-800 text-xs">
              <div className="flex justify-between items-center mb-1 text-slate-300 font-medium text-[11px]">
                <span>
                  {amountNeededForFreeShipping === 0 ? (
                    <span className="text-emerald-400 font-bold">✓ Free Express Delivery Unlocked</span>
                  ) : (
                    <span>
                      Add <strong className="text-amber-400">₹{amountNeededForFreeShipping}</strong> more for Free Shipping
                    </span>
                  )}
                </span>
                <span className="text-slate-400">{freeShippingProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Your cart is empty</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Select a product and connect your purchase to any of the 8 UGT India national missions.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemDonation = Math.round(
                  (item.product.price * item.quantity * (item.product.cause_allocation_pct || 15)) / 100
                );
                return (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-[#141f35] border border-slate-800 flex flex-col space-y-2.5"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          ₹{item.product.price.toLocaleString()} each
                        </div>

                        {/* Impact amount */}
                        <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 shrink-0" />
                          <span>₹{itemDonation} dedicated contribution</span>
                        </div>
                      </div>
                    </div>

                    {/* Mission Selector per Item */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
                      <span className="text-[10px] text-slate-400 shrink-0 uppercase font-semibold">
                        Mission:
                      </span>
                      <select
                        value={item.selectedCauseId}
                        onChange={(e) => onUpdateItemCause(item.product.id, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 hover:border-emerald-500 rounded-lg px-2 py-1 text-[11px] text-emerald-200 focus:outline-none cursor-pointer"
                      >
                        {causes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 px-2 py-0.5 text-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-1.5 py-0.5 text-slate-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-white text-xs">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-1.5 py-0.5 text-slate-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-white">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Summary */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-[#121a2c] space-y-3">
              
              {/* Highlighted Cause Impact Card */}
              <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-300 font-bold text-[11px]">
                  <span>Total Cause Fundraising in Cart:</span>
                  <span className="text-amber-300 font-black text-sm">
                    ₹{Math.round(totalCauseDonation)}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/90 leading-tight">
                  100% of this fund is transferred directly to your selected national missions.
                </p>
              </div>

              {/* Price Details */}
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-1.5 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-emerald-400 font-display">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure &amp; Direct Checkout</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
