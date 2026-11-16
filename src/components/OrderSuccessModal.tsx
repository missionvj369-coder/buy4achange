import React, { useEffect } from 'react';
import {
  CheckCircle2, Heart, Printer, ArrowRight, ShieldCheck, Sparkles, MapPin, Package,
  Unlock, BookOpen, Download
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
  if (!order) return null;

  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#10b981', '#f59e0b', '#3b82f6'],
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d1424] border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Top Celebration Banner */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-emerald-950 via-[#101c2e] to-[#0d1424] border-b border-emerald-800/40 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-glow">
            <div className="w-full h-full bg-[#0d1424] rounded-[22px] flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Order Confirmed & Impact Created!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-300 font-medium">
              Order #{order.order_number} • Transaction: {order.payment_id}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Official Guardian Impact Certificate Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-amber-950/40 border border-emerald-500/50 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 border-b border-emerald-800/40 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Universal Guard Trust • Impact Certificate
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60">
                ID: {order.guardian_id || 'UGT-GUARDIAN'}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                This certificate gratefully acknowledges <strong className="text-white">{order.customer_name}</strong> for their conscious purchase. 
                A direct contribution of <strong className="text-amber-300 font-bold">₹{order.cause_donation_amount}</strong> has been allocated to:
              </p>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center space-x-3">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">
                    {order.cause_title || 'UGT National Action Mission'}
                  </div>
                  <div className="text-emerald-300 text-[11px] font-medium">
                    {order.cause_impact_delivered}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UNLOCKED DIGITAL E-PRODUCTS & EBOOKS */}
          {order.digital_items && order.digital_items.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-emerald-950/60 border border-cyan-400/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Unlocked eProducts &amp; eBooks Ready!</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-200 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/60">
                  Saved to My Library
                </span>
              </div>

              <div className="space-y-2">
                {order.digital_items.map((digi) => (
                  <div
                    key={digi.product_id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{digi.product_name}</div>
                        <div className="text-[10px] text-cyan-300">
                          {digi.subcategory || 'Digital HTML Access'} · Instant Interactive Reader
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([digi.digital_html_content], { type: 'text/html;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${digi.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>HTML</span>
                      </button>
                      {onLaunchDigital && (
                        <button
                          type="button"
                          onClick={() => onLaunchDigital(digi)}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-[11px] font-extrabold flex items-center space-x-1 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Open &amp; Launch</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Logistics Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center space-x-1.5 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Shipping Address</span>
              </div>
              <div className="text-slate-200 font-medium">
                {order.shipping_address}, {order.city}, {order.state} - <strong className="text-emerald-300">{order.pincode}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center space-x-1.5 font-semibold">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>Logistics & Tracking</span>
              </div>
              <div className="text-slate-200 font-mono font-bold">
                {order.tracking_number}
              </div>
              <div className="text-[11px] text-emerald-400">
                Dispatched via UGT Community Express
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice & Impact Certificate</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-glow transition-all active:scale-95"
            >
              <span>Continue Conscious Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
