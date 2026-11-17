import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Heart, ArrowRight, User } from 'lucide-react';
import { CartItem, Cause } from '../types.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  causes: Cause[];
  onStartPayment: (orderDraft: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  causes,
  onStartPayment,
}) => {
  const defaultCause = causes.find((c) => c.id === items[0]?.selectedCauseId) || causes[0];

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    selectedCauseId: defaultCause?.id || 'cause-everyday-essentials',
  });

  if (!isOpen) return null;

  const isDigitalOnly = items.length > 0 && items.every((it) => it.product.product_type === 'digital');
  const hasDigitalItems = items.some((it) => it.product.product_type === 'digital');
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = isDigitalOnly || subtotal >= 1000 ? 0 : 70;
  const total = subtotal + shippingFee;

  const totalDonationAmount = items.reduce((sum, it) => {
    const pct = it.product.cause_allocation_pct || 15;
    return sum + (it.product.price * it.quantity * pct) / 100;
  }, 0);

  const selectedCause = causes.find((c) => c.id === formData.selectedCauseId) || causes[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerEmail.trim() || !formData.customerPhone.trim()) {
      alert('Please fill in your full name, email address, and phone number.');
      return;
    }
    if (!isDigitalOnly && (!formData.shippingAddress.trim() || !/^\d{6}$/.test(formData.pincode.trim()))) {
      alert('Please enter your complete delivery address and a valid 6-digit PIN code.');
      return;
    }

    onStartPayment({
      ...formData,
      shippingAddress: isDigitalOnly ? 'Digital Delivery' : formData.shippingAddress.trim(),
      city: isDigitalOnly ? 'Online' : formData.city.trim(),
      state: isDigitalOnly ? 'India' : formData.state.trim(),
      pincode: isDigitalOnly ? '' : formData.pincode.trim(),
      subtotal,
      shippingFee,
      totalAmount: total,
      causeId: formData.selectedCauseId,
      causeDonationAmount: Math.round(totalDonationAmount),
      causeImpactDelivered: selectedCause
        ? `${selectedCause.title} — ${selectedCause.impact_metric}`
        : 'Living India Mission',
      items: items.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        productType: it.product.product_type || 'physical',
        price: it.product.price,
        quantity: it.quantity,
        causeId: it.selectedCauseId || formData.selectedCauseId,
        causeAllocationPct: it.product.cause_allocation_pct || 15.0,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#04030e]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-3d rounded-3xl overflow-hidden shadow-2xl my-6">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 bg-[#0d0929] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold font-display text-white">Checkout</h2>
              <p className="text-[11px] text-slate-300">Enter your real contact &amp; delivery details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Mission Selection */}
          <div className="p-4 rounded-2xl bg-[#00f0ff]/[0.07] border border-[#00f0ff]/25 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#00f0ff] font-bold text-xs uppercase tracking-wider">
                <Heart className="w-4 h-4 text-[#ff2e97] fill-[#ff2e97]" />
                <span>Mission Contribution (₹{Math.round(totalDonationAmount)})</span>
              </div>
              <span className="text-[10px] text-[#ffb800] font-semibold">Verified on Payment</span>
            </div>

            <select
              value={formData.selectedCauseId}
              onChange={(e) => setFormData({ ...formData, selectedCauseId: e.target.value })}
              className="w-full bg-[#07051a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-medium"
            >
              {causes.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#07051a]">
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>Your Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98XXXXXXXX"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Digital Instant Delivery Notice OR Shipping Address */}
          {isDigitalOnly ? (
            <div className="p-4 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 space-y-1 text-xs">
              <div className="font-bold text-[#00f0ff] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Digital Delivery (₹0 Shipping)</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                No shipping address needed. Your HTML eBook / eProduct unlocks inside <strong>My Library</strong> once your payment is verified.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {hasDigitalItems && (
                <div className="p-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[11px] text-cyan-200">
                  Digital eProducts in your bag unlock in My Library once payment is verified; physical items ship to the address below.
                </div>
              )}
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#ffb800]" />
                <span>Delivery Address</span>
              </h3>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">House / Flat, Street, Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter complete delivery address"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">PIN Code (6 digits) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="e.g. 560001"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })
                    }
                    className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Shipping</span>
              <span className="font-mono text-[#00e5a0]">
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
              <span>Total Payable</span>
              <span className="font-mono text-[#00f0ff]">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full prism-button text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
