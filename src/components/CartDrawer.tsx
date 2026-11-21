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

  const isDigitalOnly = items.length > 0 && items.every((i) => i.product.product_type === 'digital');
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = isDigitalOnly || subtotal >= 1000 || subtotal === 0 ? 0 : 70;
  const total = subtotal + shippingFee;

  const totalCauseDonation = items.reduce((sum, item) => {
    const pct = item.product.cause_allocation_pct || 15;
    return sum + (item.product.price * item.quantity * pct) / 100;
  }, 0);

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#02140D] border-l border-emerald-400/25 text-white h-full flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#031D13] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-400/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold uppercase text-white font-display tracking-tight">
                Your Bag
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                {items.length} item(s)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#02120B] scrollbar-thin">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-emerald-400/40" />
              <div className="text-sm font-display font-bold uppercase text-white">Your bag is empty</div>
              <p className="text-xs text-white/55 max-w-xs mx-auto">
                Add any zero-chemical product or digital eBook and choose which Living India mission it supports.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-white text-black font-mono uppercase tracking-wider text-[11px] font-extrabold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemDonation = Math.round(
                (item.product.price * item.quantity * (item.product.cause_allocation_pct || 15)) / 100
              );
              return (
                <div
                  key={`${item.product.id}-${item.selectedCauseId}`}
                  className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2.5"
                >
                  <div className="flex space-x-3">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-white/10 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs text-white line-clamp-2">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-white/40 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm font-mono font-bold text-white mt-1">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-white/20 rounded-full bg-black/40">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-0.5 text-xs font-bold text-white hover:text-emerald-300"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-0.5 text-xs font-bold text-white hover:text-emerald-300"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-emerald-300">
                          ₹{itemDonation} to mission
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <select
                      value={item.selectedCauseId}
                      onChange={(e) => onUpdateItemCause(item.product.id, e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                    >
                      {causes.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#031810]">
                          Mission: {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-[#031D13] space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-between text-xs">
              <span className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                <span>Total Mission Support</span>
              </span>
              <span className="font-mono font-bold text-white">
                ₹{Math.round(totalCauseDonation).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-1 text-xs text-white/65">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-white/10">
                <span>Total</span>
                <span className="font-mono text-emerald-300">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3 rounded-full bg-emerald-400 hover:bg-white text-black font-mono uppercase tracking-[0.14em] font-extrabold text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono uppercase tracking-wider text-white/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Payment &amp; Direct Mission Allocation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
