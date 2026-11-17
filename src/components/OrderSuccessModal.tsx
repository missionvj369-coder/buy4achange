import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Heart,
  Printer,
  ArrowRight,
  Sparkles,
  MapPin,
  Unlock,
  BookOpen,
  Download,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, UnlockedDigitalItem } from '../types.ts';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onLaunchDigital?: (item: UnlockedDigitalItem) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onLaunchDigital,
}) => {
  const isVerifiedPaid = order?.payment_status === 'paid';

  useEffect(() => {
    if (order && isVerifiedPaid) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff2e97', '#ffb800', '#00e5a0'],
      });
    }
  }, [order, isVerifiedPaid]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#04030e]/92 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-3d rounded-3xl overflow-hidden shadow-2xl my-6">
        {/* Top Status Banner — Honest Distinction Between Verified Paid vs Pending Verification */}
        <div
          className={`p-6 sm:p-8 text-center border-b border-white/10 space-y-3 ${
            isVerifiedPaid
              ? 'bg-gradient-to-b from-[#00e5a0]/15 via-[#0d0929] to-transparent'
              : 'bg-gradient-to-b from-[#ffb800]/15 via-[#0d0929] to-transparent'
          }`}
        >
          <div
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border ${
              isVerifiedPaid
                ? 'bg-[#00e5a0]/15 border-[#00e5a0]/40 text-[#00e5a0]'
                : 'bg-[#ffb800]/15 border-[#ffb800]/40 text-[#ffb800]'
            }`}
          >
            {isVerifiedPaid ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-3xl font-extrabold font-display text-white">
              {isVerifiedPaid
                ? 'Payment Verified & Order Confirmed!'
                : 'Order Received — Payment Verification Pending'}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[#00f0ff]">
              Order #{order.order_number} · Ref: {order.payment_id}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-5 max-h-[72vh] overflow-y-auto">
          {!isVerifiedPaid && (
            <div className="p-4 rounded-2xl bg-[#ffb800]/10 border border-[#ffb800]/35 space-y-2 text-xs text-slate-200 leading-relaxed">
              <div className="font-bold text-[#ffb800] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Real Payment Verification In Progress</span>
              </div>
              <p>
                We have recorded your order and submitted UPI reference <strong className="font-mono text-white">{order.payment_id}</strong> for ₹{order.total_amount.toLocaleString('en-IN')}.
              </p>
              <p className="text-slate-300">
                Once our team confirms your payment credit in the bank ledger, your chosen Living India mission total will be credited and any digital eBooks / eProducts in this order will unlock automatically inside <strong>My Library</strong> using Order <strong className="font-mono text-white">{order.order_number}</strong> and <strong className="text-white">{order.customer_email}</strong>.
              </p>
            </div>
          )}

          {/* Mission Contribution Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#ffb800]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#ffb800]">
                  Universal Guard Trust · Mission Allocation
                </span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isVerifiedPaid
                    ? 'bg-[#00e5a0]/15 text-[#00e5a0]'
                    : 'bg-[#ffb800]/15 text-[#ffb800]'
                }`}
              >
                {isVerifiedPaid ? 'CREDITED' : 'PENDING CREDIT'}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              Order by <strong className="text-white">{order.customer_name}</strong> allocates{' '}
              <strong className="text-[#00f0ff] font-bold">₹{order.cause_donation_amount}</strong> toward:
            </p>

            <div className="p-3 rounded-xl bg-[#07051a] border border-white/10 text-xs flex items-center space-x-3">
              <Heart className="w-5 h-5 text-[#ff2e97] fill-[#ff2e97] shrink-0" />
              <div>
                <div className="font-bold text-white text-sm">
                  {order.cause_title || 'Living India National Mission'}
                </div>
                <div className="text-[#00f0ff] text-[11px] font-medium">
                  {order.cause_impact_delivered}
                </div>
              </div>
            </div>
          </div>

          {/* UNLOCKED DIGITAL E-PRODUCTS (ONLY WHEN VERIFIED PAID) */}
          {isVerifiedPaid && order.digital_items && order.digital_items.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#00f0ff] font-bold text-xs uppercase tracking-wider">
                  <Unlock className="w-4 h-4" />
                  <span>Unlocked eProducts &amp; eBooks Ready!</span>
                </div>
                <span className="text-[10px] font-mono text-white/80">Saved to Library</span>
              </div>

              <div className="space-y-2">
                {order.digital_items.map((digi) => (
                  <div
                    key={digi.product_id}
                    className="p-3 rounded-xl bg-[#07051a] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-[#00f0ff] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{digi.product_name}</div>
                        <div className="text-[10px] text-[#00f0ff]">
                          {digi.subcategory || 'Digital HTML Access'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([digi.digital_html_content], {
                            type: 'text/html;charset=utf-8',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${digi.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>HTML</span>
                      </button>
                      {onLaunchDigital && (
                        <button
                          type="button"
                          onClick={() => onLaunchDigital(digi)}
                          className="px-3.5 py-1.5 rounded-lg prism-button text-white text-[11px] font-bold flex items-center space-x-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Open Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clean Real Delivery Details (No Fake Tracking IDs or Fake Courier Names) */}
          {order.shipping_address && order.shipping_address !== 'Digital Delivery' && (
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-1">
              <div className="text-slate-300 flex items-center space-x-1.5 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#ffb800]" />
                <span>Delivery Address</span>
              </div>
              <div className="text-white font-medium">
                {order.shipping_address}, {order.city}, {order.state}
                {order.pincode ? ` - ${order.pincode}` : ''}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-1/2 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 rounded-full prism-button text-white font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
