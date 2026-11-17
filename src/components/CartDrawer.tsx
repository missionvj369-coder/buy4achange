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
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#166534]" />
            <div>
              <h2 className="text-base font-bold text-[#14171A] font-display">Your Bag</h2>
              <p className="text-[11px] text-gray-500">{items.length} item(s)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-gray-300" />
              <div className="text-sm font-semibold text-[#14171A]">Your bag is empty</div>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Add any product or digital eBook and choose which Living India mission it supports.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold"
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
                  className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2.5"
                >
                  <div className="flex space-x-3">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs text-[#14171A] line-clamp-2">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-red-600 p-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm font-bold text-[#14171A] mt-1">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs font-bold text-gray-700"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs font-bold text-gray-700"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] font-semibold text-[#166534]">
                          ₹{itemDonation} to mission
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <select
                      value={item.selectedCauseId}
                      onChange={(e) => onUpdateItemCause(item.product.id, e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-[#14171A]"
                    >
                      {causes.map((c) => (
                        <option key={c.id} value={c.id}>
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
          <div className="p-4 border-t border-gray-200 bg-white space-y-3">
            <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-xs">
              <span className="flex items-center space-x-1.5 text-[#166534] font-semibold">
                <Heart className="w-3.5 h-3.5 fill-[#166534]" />
                <span>Total Mission Support</span>
              </span>
              <span className="font-bold text-[#14532D]">
                ₹{Math.round(totalCauseDonation).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[#166534] font-medium">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#14171A] pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-sm flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
              <span>Verified Payment &amp; Direct Mission Allocation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
