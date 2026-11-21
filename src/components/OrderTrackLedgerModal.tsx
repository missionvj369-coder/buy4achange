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

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<PublicLedgerEntry[]>([]);
  const [ledgerTotalRaised, setLedgerTotalRaised] = useState<number>(0);
  const [ledgerCauses, setLedgerCauses] = useState<Cause[]>(causes);

  useEffect(() => {
    if (isOpen) setTab(initialTab);
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
      if (!res.ok || !data.success) throw new Error(data.error || 'Order not found.');
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
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#02140D] border border-emerald-400/30 rounded-2xl overflow-hidden shadow-2xl my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-horizon-bar" />

        {/* Header */}
        <div className="px-6 py-4 bg-[#031D13] border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
                OPEN VERIFICATION PROTOCOL
              </div>
              <h2 className="text-base sm:text-lg font-extrabold font-display uppercase text-white">
                {t.trackAndLedger}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 bg-[#02120B] border-b border-white/10 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setTab('track')}
            className={`px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider font-bold border-b-2 -mb-px flex items-center space-x-1.5 ${
              tab === 'track'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-white/55 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.trackOrderTitle}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('ledger')}
            className={`px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider font-bold border-b-2 -mb-px flex items-center space-x-1.5 ${
              tab === 'ledger'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-white/55 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.publicLedgerTitle}</span>
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 scrollbar-thin">
          {tab === 'track' ? (
            <>
              <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Order Number (B4C-2026-...)"
                  className="bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Checkout Email Address"
                  className="bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2.5 rounded-full bg-emerald-400 hover:bg-white text-black font-mono uppercase tracking-wider font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>{searching ? 'Checking...' : 'Check Status'}</span>
                </button>
              </form>

              {trackError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackedOrder ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-sm text-white">
                          {trackedOrder.order_number}
                        </div>
                        <div className="text-xs text-white/55">
                          Placed {new Date(trackedOrder.created_at).toLocaleString('en-IN')} · Ref:{' '}
                          <span className="font-mono text-emerald-300">{trackedOrder.payment_id}</span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold border ${
                          trackedOrder.payment_status === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
                            : trackedOrder.payment_status === 'failed'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-400/40'
                            : 'bg-amber-400/15 text-amber-200 border-amber-300/40'
                        }`}
                      >
                        {trackedOrder.payment_status === 'paid'
                          ? `${t.verifiedPaid} · ${trackedOrder.order_status}`
                          : trackedOrder.payment_status === 'failed'
                          ? 'Payment Rejected'
                          : t.pendingVerification}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {[
                        { label: 'Order Placed', step: 1 },
                        { label: 'Verified Paid', step: 2 },
                        { label: 'Dispatched', step: 3 },
                        { label: 'Delivered', step: 4 },
                      ].map((s) => {
                        const active = getStepIndex(trackedOrder) >= s.step;
                        return (
                          <div
                            key={s.label}
                            className={`p-2.5 rounded-xl border text-center ${
                              active
                                ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                                : 'bg-white/[0.03] border-white/10 text-white/35'
                            }`}
                          >
                            <div className="flex justify-center mb-1">
                              {active ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div className="text-[10px] font-mono uppercase font-bold leading-tight">{s.label}</div>
                          </div>
                        );
                      })}
                    </div>

                    {trackedOrder.tracking_number && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/35 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
                          <Truck className="w-4 h-4" />
                          <span>
                            {trackedOrder.courier_name || 'Courier Dispatch'} · AWB:{' '}
                            <span className="font-mono text-white">{trackedOrder.tracking_number}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-white/75">
                        <span className="font-mono font-bold text-emerald-300">
                          ₹{trackedOrder.cause_donation_amount}
                        </span>{' '}
                        allocated to <strong className="text-white">{trackedOrder.cause_title || 'Living India Mission'}</strong>
                      </div>
                      <button
                        type="button"
                        disabled={generatingPdf}
                        onClick={() => handleDownloadPdf(trackedOrder)}
                        className="px-4 py-2 rounded-full bg-white hover:bg-emerald-400 text-black font-mono uppercase tracking-wider font-bold text-[11px] inline-flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>{generatingPdf ? 'Generating PDF...' : t.downloadPdf}</span>
                      </button>
                    </div>
                  </div>

                  {trackedOrder.payment_status === 'paid' &&
                    trackedOrder.digital_items &&
                    trackedOrder.digital_items.length > 0 && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/35 space-y-2.5">
                        <div className="text-xs font-mono uppercase font-bold text-emerald-300 flex items-center space-x-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Unlocked Digital eProducts Ready</span>
                        </div>
                        {trackedOrder.digital_items.map((digi) => (
                          <div
                            key={digi.product_id}
                            className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2"
                          >
                            <span className="text-xs font-semibold text-white truncate">{digi.product_name}</span>
                            {onLaunchDigital && (
                              <button
                                type="button"
                                onClick={() => onLaunchDigital(digi)}
                                className="px-3.5 py-1.5 rounded-full bg-emerald-400 text-black font-mono uppercase text-[10px] font-bold shrink-0"
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
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2">
                  <Package className="w-7 h-7 mx-auto text-emerald-400" />
                  <div className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                    Enter Order Number &amp; Email Above
                  </div>
                  <p className="text-xs text-white/55 max-w-md mx-auto">
                    Check live bank verification status, courier AWB once dispatched, and download your official PDF Invoice &amp; Impact Certificate.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-[#031C13] border border-emerald-400/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-[0.16em] font-bold text-emerald-300">
                    <span className="live-dot" />
                    <span>LIVE VERIFIED LIVING INDIA LEDGER</span>
                  </div>
                  <p className="text-xs text-white/65 mt-1">
                    Only bank-verified paid orders are recorded in this open public audit ledger.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-bold text-emerald-300 font-mono">
                    ₹{ledgerTotalRaised.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/55">
                    Total Verified Mission Funds
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ledgerCauses.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] text-emerald-400 font-bold mr-1.5">
                        0{idx + 1}/
                      </span>
                      <span className="font-medium text-white truncate">{c.title}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300 shrink-0">
                      ₹{Math.round(c.raised_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white/55">
                  Recent Verified Contributions
                </div>
                {loadingLedger ? (
                  <div className="py-8 text-center text-xs font-mono text-emerald-300 flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading public ledger...</span>
                  </div>
                ) : ledgerEntries.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1.5">
                    <Heart className="w-5 h-5 mx-auto text-emerald-400" />
                    <div className="text-xs font-semibold text-white">
                      Fresh Live Ledger — Ready for First Verified Contribution
                    </div>
                    <p className="text-[11px] text-white/50">
                      Every verified paid purchase automatically logs an anonymized entry here.
                    </p>
                  </div>
                ) : (
                  <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/10">
                    {ledgerEntries.map((entry) => (
                      <div
                        key={entry.order_number}
                        className="px-4 py-3 bg-white/[0.03] flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                            {entry.supporter_initials}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate">{entry.cause_title}</div>
                            <div className="text-[11px] text-white/50 font-mono">
                              {entry.order_number} · {new Date(entry.created_at).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-300">
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
