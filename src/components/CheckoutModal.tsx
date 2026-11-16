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
  if (!isOpen) return null;

  const defaultCause = causes.find((c) => c.id === items[0]?.selectedCauseId) || causes[0];

  const [formData, setFormData] = useState({
    customerName: 'Siddharth Varma',
    customerEmail: 'siddharth.varma@example.com',
    customerPhone: '+91 98450 88219',
    shippingAddress: 'Flat 402, Lotus Residency, 12th Main',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India',
    selectedCauseId: defaultCause?.id || 'cause-everyday-essentials',
    guardianId: 'UGT-IND-BLR-5603',
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 1000 ? 0 : 70;
  const total = subtotal + shippingFee;

  const totalDonationAmount = items.reduce((sum, it) => {
    const pct = it.product.cause_allocation_pct || 15;
    return sum + (it.product.price * it.quantity * pct) / 100;
  }, 0);

  const selectedCause = causes.find((c) => c.id === formData.selectedCauseId) || causes[0];

  const handlePincodeChange = (pincode: string) => {
    setFormData((prev) => {
      let city = prev.city;
      let state = prev.state;

      if (pincode.startsWith('56')) {
        city = 'Bengaluru';
        state = 'Karnataka';
      } else if (pincode.startsWith('60') || pincode.startsWith('64')) {
        city = 'Chennai';
        state = 'Tamil Nadu';
      } else if (pincode.startsWith('40')) {
        city = 'Mumbai';
        state = 'Maharashtra';
      } else if (pincode.startsWith('11')) {
        city = 'New Delhi';
        state = 'Delhi';
      } else if (pincode.startsWith('50')) {
        city = 'Hyderabad';
        state = 'Telangana';
      }

      return {
        ...prev,
        pincode,
        city,
        state,
        guardianId: `UGT-IND-${pincode.slice(0, 3)}-${Math.floor(Math.random() * 8999 + 1000)}`,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.shippingAddress || !formData.pincode) {
      alert('Please fill in required shipping details');
      return;
    }

    onStartPayment({
      ...formData,
      subtotal,
      shippingFee,
      totalAmount: total,
      causeId: formData.selectedCauseId,
      causeDonationAmount: Math.round(totalDonationAmount),
      causeImpactDelivered: selectedCause ? `${selectedCause.title} — ${selectedCause.impact_metric}` : 'UGT National Mission',
      items: items.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
        causeId: it.selectedCauseId || formData.selectedCauseId,
        causeAllocationPct: it.product.cause_allocation_pct || 15.0,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#141e33] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Conscious Checkout</h2>
              <p className="text-xs text-slate-400">Universal Guard Trust Fulfillment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          
          {/* UGT Community Mission Selection */}
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Primary Cause Allocation (₹{Math.round(totalDonationAmount)})</span>
              </div>
              <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                100% Direct
              </span>
            </div>

            <label className="block text-xs text-slate-300 font-medium">
              National Mission Supported:
            </label>
            <select
              value={formData.selectedCauseId}
              onChange={(e) => setFormData({ ...formData, selectedCauseId: e.target.value })}
              className="w-full bg-[#0b101b] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {causes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} — {c.tagline}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivery Address</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">
                Hub: {formData.guardianId}
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Street Address, Flat / Villa No.</label>
              <input
                type="text"
                required
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">PIN Code (6 digits)</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={formData.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Items Total ({items.length} items):</span>
              <span className="text-slate-200 font-semibold">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Delivery Fee:</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>Included Cause Contribution:</span>
              <span className="font-bold">₹{Math.round(totalDonationAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-1.5 border-t border-slate-800">
              <span>Total Payable:</span>
              <span className="text-emerald-400 font-display">₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

        </form>

      </div>
    </div>
  );
};
