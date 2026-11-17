import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Heart,
  Printer,
  ArrowRight,
  MapPin,
  Unlock,
  BookOpen,
  Download,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import { Order, UnlockedDigitalItem } from '../types.ts';
import { generateOrderReceiptPdf } from '../utils/pdfCertificate.ts';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onLaunchDigital?: (item: UnlockedDigitalItem) => void;
  onLogPdfDownload?: (orderNumber: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onLaunchDigital,
  onLogPdfDownload,
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!order) return null;

  const isVerifiedPaid = order.payment_status === 'paid';

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await generateOrderReceiptPdf(order);
      onLogPdfDownload?.(order.order_number);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl my-6">
        {/* Top Status Banner — Honest Distinction Between Verified Paid vs Pending Verification */}
        <div
          className={`p-6 sm:p-7 text-center border-b border-gray-200 space-y-3 ${
            isVerifiedPaid ? 'bg-[#F0FDF4]' : 'bg-amber-50'
          }`}
        >
          <div
            className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center border ${
              isVerifiedPaid
                ? 'bg-white border-[#BBF7D0] text-[#166534]'
                : 'bg-white border-amber-300 text-amber-700'
            }`}
          >
            {isVerifiedPaid ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
              {isVerifiedPaid
                ? 'Payment Verified & Order Confirmed'
                : 'Order Received — Payment Verification Pending'}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-gray-600">
              Order #{order.order_number} · Ref: {order.payment_id}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {!isVerifiedPaid && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2 text-xs text-gray-700 leading-relaxed">
              <div className="font-semibold text-amber-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Real Payment Verification In Progress</span>
              </div>
              <p>
                We have recorded your order and submitted UPI reference{' '}
                <strong className="font-mono text-gray-900">{order.payment_id}</strong> for ₹
                {order.total_amount.toLocaleString('en-IN')}.
              </p>
              <p>
                Once our team confirms your payment credit in the bank ledger, your chosen Living India mission total will be credited and any digital eBooks or eProducts in this order will unlock automatically inside <strong>My Library</strong> using Order{' '}
                <strong className="font-mono text-gray-900">{order.order_number}</strong> and{' '}
                <strong className="text-gray-900">{order.customer_email}</strong>.
              </p>
            </div>
          )}

          {/* Mission Contribution Card */}
          <div className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Universal Guard Trust · Mission Allocation
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  isVerifiedPaid
                    ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {isVerifiedPaid ? 'CREDITED' : 'PENDING CREDIT'}
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              Order by <strong className="text-gray-900">{order.customer_name}</strong> allocates{' '}
              <strong className="text-[#166534] font-bold">₹{order.cause_donation_amount}</strong> toward:
            </p>

            <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs flex items-center space-x-3">
              <Heart className="w-5 h-5 text-[#166534] shrink-0" />
              <div>
                <div className="font-semibold text-gray-900 text-sm">
                  {order.cause_title || 'Living India National Mission'}
                </div>
                <div className="text-gray-600 text-xs">
                  {order.cause_impact_delivered}
                </div>
              </div>
            </div>
          </div>

          {/* UNLOCKED DIGITAL E-PRODUCTS (ONLY WHEN VERIFIED PAID) */}
          {isVerifiedPaid && order.digital_items && order.digital_items.length > 0 && (
            <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#166534] font-semibold text-xs uppercase tracking-wider">
                  <Unlock className="w-4 h-4" />
                  <span>Unlocked eProducts &amp; eBooks Ready</span>
                </div>
                <span className="text-[11px] text-gray-600">Saved to Library</span>
              </div>

              <div className="space-y-2">
                {order.digital_items.map((digi) => (
                  <div
                    key={digi.product_id}
                    className="p-3 rounded-lg bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-[#166534] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{digi.product_name}</div>
                        <div className="text-[11px] text-gray-500">
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
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>HTML</span>
                      </button>
                      {onLaunchDigital && (
                        <button
                          type="button"
                          onClick={() => onLaunchDigital(digi)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold"
                        >
                          Open Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clean Real Delivery Details */}
          {order.shipping_address && order.shipping_address !== 'Digital Delivery' && (
            <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200 text-xs space-y-1">
              <div className="text-gray-600 flex items-center space-x-1.5 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#166534]" />
                <span>Delivery Address</span>
              </div>
              <div className="text-gray-900 font-medium">
                {order.shipping_address}, {order.city}, {order.state}
                {order.pincode ? ` - ${order.pincode}` : ''}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              disabled={downloadingPdf}
              onClick={handleDownloadPdf}
              className="py-2.5 px-3 rounded-lg bg-[#F0FDF4] hover:bg-green-100 border border-[#BBF7D0] text-[#166534] font-semibold text-xs flex items-center justify-center space-x-1.5"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              <span>{downloadingPdf ? 'Creating PDF...' : 'PDF Certificate'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="py-2.5 px-3 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-xs flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs flex items-center justify-center space-x-1.5"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
