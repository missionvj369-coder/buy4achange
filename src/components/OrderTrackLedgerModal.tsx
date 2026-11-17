import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  FileDown,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Activity,
  Heart,
} from 'lucide-react';
import { Order, PublicLedgerEntry, Cause, UnlockedDigitalItem } from '../types.ts';
import { generateOrderReceiptPdf } from '../utils/pdfCertificate.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface OrderTrackLedgerModalProps {
  isOpen: boolean;
  initialTab?: 'track' | 'ledger';
  onClose: () => void;
  causes: Cause[];
  onLaunchDigital?: (item: UnlockedDigitalItem) => void;
  onAddUnlockedItems?: (items: UnlockedDigitalItem[]) => void;
  onLogPdfDownload?: (orderNumber: string) => void;
}

export const OrderTrackLedgerModal: React.FC<OrderTrackLedgerModalProps> = ({
  isOpen,
  initialTab = 'track',
  onClose,
  causes,
  onLaunchDigital,
  onAddUnlockedItems,
  onLogPdfDownload,
}) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'track' | 'ledger'>(initialTab);

  // Track Order state
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Public Impact Ledger state
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<PublicLedgerEntry[]>([]);
  const [ledgerTotalRaised, setLedgerTotalRaised] = useState<number>(0);
  const [ledgerCauses, setLedgerCauses] = useState<Cause[]>(causes);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen || tab !== 'ledger') return;
    let cancelled = false;
    const loadLedger = async () => {
      setLoadingLedger(true);
      try {
        const res = await fetch('/api/ledger/public', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setLedgerEntries(Array.isArray(data.entries) ? data.entries : []);
        setLedgerTotalRaised(Number(data.totalRaised || 0));
        if (Array.isArray(data.causes) && data.causes.length > 0) {
          setLedgerCauses(data.causes);
        }
      } catch {
      } finally {
        if (!cancelled) setLoadingLedger(false);
      }
    };
    loadLedger();
    return () => {
      cancelled = true;
    };
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setTrackError(null);
    setTrackedOrder(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Order not found.');
      }
      setTrackedOrder(data.order);
      if (
        data.order?.payment_status === 'paid' &&
        Array.isArray(data.order?.digital_items) &&
        data.order.digital_items.length > 0 &&
        onAddUnlockedItems
      ) {
        onAddUnlockedItems(data.order.digital_items);
      }
    } catch (err: any) {
      setTrackError(err.message || 'Could not locate order.');
    } finally {
      setSearching(false);
    }
  };

  const handleDownloadPdf = async (order: Order) => {
    setGeneratingPdf(true);
    try {
      await generateOrderReceiptPdf(order);
      onLogPdfDownload?.(order.order_number);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getStepIndex = (order: Order): number => {
    if (order.payment_status === 'failed') return 0;
    if (order.payment_status !== 'paid') return 1;
    const s = (order.order_status || '').toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'packed' || s === 'processing') return 2;
    return 2;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-[#14171A]">
                {t.trackAndLedger}
              </h2>
              <p className="text-xs text-gray-500">
                Real-time verified order status &amp; open Living India mission audit log
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Tab Switcher */}
        <div className="px-5 sm:px-6 pt-4 bg-white border-b border-gray-200 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setTab('track')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px flex items-center space-x-1.5 ${
              tab === 'track'
                ? 'border-[#166534] text-[#166534]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.trackOrderTitle}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('ledger')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px flex items-center space-x-1.5 ${
              tab === 'ledger'
                ? 'border-[#166534] text-[#166534]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.publicLedgerTitle}</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {tab === 'track' ? (
            <>
              <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Order Number (B4C-2026-...)"
                  className="bg-[#FAF9F6] border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-900 placeholder-gray-400 focus:border-[#166534] focus:bg-white focus:outline-none"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Checkout Email Address"
                  className="bg-[#FAF9F6] border border-gray-300 rounded-lg px-3 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#166534] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs flex items-center justify-center space-x-1.5"
                >
                  {searching ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>{searching ? 'Checking...' : 'Check Status'}</span>
                </button>
              </form>

              {trackError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackedOrder ? (
                <div className="space-y-4">
                  {/* Order Status Card */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#FAF9F6] border border-gray-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-sm text-gray-900">
                          {trackedOrder.order_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          Placed {new Date(trackedOrder.created_at).toLocaleString('en-IN')} · Ref:{' '}
                          <span className="font-mono text-gray-700">{trackedOrder.payment_id}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          trackedOrder.payment_status === 'paid'
                            ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                            : trackedOrder.payment_status === 'failed'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {trackedOrder.payment_status === 'paid'
                          ? `${t.verifiedPaid} · ${trackedOrder.order_status}`
                          : trackedOrder.payment_status === 'failed'
                          ? 'Payment Rejected'
                          : t.pendingVerification}
                      </span>
                    </div>

                    {/* Clean Progress Timeline */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {[
                        { label: 'Order Placed', step: 1 },
                        { label: 'Payment Verified', step: 2 },
                        { label: 'Shipped / Digital', step: 3 },
                        { label: 'Delivered', step: 4 },
                      ].map((s) => {
                        const active = getStepIndex(trackedOrder) >= s.step;
                        return (
                          <div
                            key={s.label}
                            className={`p-2 rounded-lg border text-center ${
                              active
                                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                                : 'bg-white border-gray-200 text-gray-400'
                            }`}
                          >
                            <div className="flex justify-center mb-1">
                              {active ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Clock className="w-4 h-4" />
                              )}
                            </div>
                            <div className="text-[10px] font-semibold leading-tight">{s.label}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Real Courier & AWB Tracking (Only Shown When Actually Dispatched by Admin) */}
                    {trackedOrder.tracking_number && (
                      <div className="p-3 rounded-lg bg-white border border-[#BBF7D0] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2 text-[#166534] font-semibold">
                          <Truck className="w-4 h-4" />
                          <span>
                            {trackedOrder.courier_name || 'Courier Dispatch'} · AWB:{' '}
                            <span className="font-mono text-gray-900">
                              {trackedOrder.tracking_number}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Mission Allocation & PDF Certificate Download */}
                    <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-gray-700">
                        <span className="font-semibold text-[#166534]">
                          ₹{trackedOrder.cause_donation_amount}
                        </span>{' '}
                        allocated to <strong>{trackedOrder.cause_title || 'Living India Mission'}</strong>
                      </div>
                      <button
                        type="button"
                        disabled={generatingPdf}
                        onClick={() => handleDownloadPdf(trackedOrder)}
                        className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs inline-flex items-center justify-center space-x-1.5"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>{generatingPdf ? 'Generating PDF...' : t.downloadPdf}</span>
                      </button>
                    </div>
                  </div>

                  {/* Unlocked Digital eBooks if Paid */}
                  {trackedOrder.payment_status === 'paid' &&
                    trackedOrder.digital_items &&
                    trackedOrder.digital_items.length > 0 && (
                      <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2.5">
                        <div className="text-xs font-semibold text-[#166534] flex items-center space-x-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Unlocked Digital eProducts Ready</span>
                        </div>
                        {trackedOrder.digital_items.map((digi) => (
                          <div
                            key={digi.product_id}
                            className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between gap-2"
                          >
                            <span className="text-xs font-semibold text-gray-900 truncate">
                              {digi.product_name}
                            </span>
                            {onLaunchDigital && (
                              <button
                                type="button"
                                onClick={() => onLaunchDigital(digi)}
                                className="px-3 py-1.5 rounded-lg bg-[#166534] text-white text-xs font-semibold shrink-0"
                              >
                                Open Now
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#FAF9F6] border border-gray-200 text-center space-y-1.5">
                  <Package className="w-6 h-6 mx-auto text-gray-400" />
                  <div className="text-xs font-semibold text-gray-900">
                    Enter your Order Number and checkout email above
                  </div>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Check live payment verification status, real courier tracking AWB once shipped, and download your official PDF Invoice &amp; Impact Certificate.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* TAB 2: PUBLIC ANONYMIZED IMPACT TRANSPARENCY LEDGER */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-[#166534]">
                    <span className="live-dot" />
                    <span>LIVE VERIFIED LIVING INDIA LEDGER</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Only bank-verified paid orders appear in this public audit ledger.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl font-bold text-[#166534] font-mono">
                    ₹{ledgerTotalRaised.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Total Verified Mission Funds
                  </div>
                </div>
              </div>

              {/* 8 Mission Compact Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ledgerCauses.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] text-[#166534] font-bold mr-1.5">
                        0{idx + 1}
                      </span>
                      <span className="font-medium text-gray-900 truncate">{c.title}</span>
                    </div>
                    <span className="font-mono font-bold text-[#166534] shrink-0">
                      ₹{Math.round(c.raised_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Verified Contributions */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Recent Verified Contributions
                </div>
                {loadingLedger ? (
                  <div className="py-8 text-center text-xs text-gray-500 flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#166534]" />
                    <span>Loading public ledger...</span>
                  </div>
                ) : ledgerEntries.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#FAF9F6] border border-gray-200 text-center space-y-1">
                    <Heart className="w-5 h-5 mx-auto text-gray-400" />
                    <div className="text-xs font-semibold text-gray-800">
                      Fresh Live Ledger — Ready for First Verified Contribution
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Every verified paid purchase automatically records an anonymized contribution entry here.
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {ledgerEntries.map((entry) => (
                      <div
                        key={entry.order_number}
                        className="px-4 py-2.5 bg-white flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {entry.supporter_initials}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {entry.cause_title}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {entry.order_number} · {new Date(entry.created_at).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[#166534]">
                          +₹{Math.round(entry.cause_donation_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
