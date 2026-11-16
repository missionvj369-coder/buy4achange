import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  Lock,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDraft: any;
  onPaymentSuccess: (paymentData: any) => void;
}

interface PublicGatewayConfig {
  mode: 'direct_upi' | 'hyperswitch_sandbox' | 'hyperswitch_live';
  hyperswitchActive: boolean;
  publishableKey: string | null;
  backendUrl: string | null;
  sdkUrl: string | null;
  merchantUpiVpa: string;
  merchantName: string;
  currency: string;
  methods: {
    card: boolean;
    upi: boolean;
    netbanking: boolean;
  };
}

declare global {
  interface Window {
    Hyper?: (publishableKey: string, options?: Record<string, any>) => any;
  }
}

function loadExternalScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (window.Hyper) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load checkout SDK')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load checkout SDK'));
    document.head.appendChild(script);
  });
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  orderDraft,
  onPaymentSuccess,
}) => {
  const [gatewayConfig, setGatewayConfig] = useState<PublicGatewayConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hyperswitch Unified Checkout state
  const [hyperReady, setHyperReady] = useState(false);
  const [hyperPaymentId, setHyperPaymentId] = useState<string | null>(null);
  const hyperInstanceRef = useRef<any>(null);
  const hyperElementsRef = useRef<any>(null);
  const hyperMountRef = useRef<HTMLDivElement>(null);

  // Direct UPI intent state
  const [upiUri, setUpiUri] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [qrImgFailed, setQrImgFailed] = useState(false);

  // Card state (Luhn-valid test number for easy verification)
  const [cardNumber, setCardNumber] = useState('4532 8920 1422 7831');
  const [cardHolder, setCardHolder] = useState(orderDraft?.customerName || '');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('482');

  useEffect(() => {
    if (orderDraft?.customerName) {
      setCardHolder(orderDraft.customerName);
    }
  }, [orderDraft?.customerName]);

  // Initialize gateway configuration & payment intent when modal opens
  useEffect(() => {
    if (!isOpen || !orderDraft) return;

    let cancelled = false;
    setError(null);
    setHyperReady(false);
    setQrImgFailed(false);
    setLoadingConfig(true);

    const init = async () => {
      try {
        const cfgRes = await fetch('/api/payment/config/public');
        const cfg: PublicGatewayConfig = await cfgRes.json();
        if (cancelled) return;
        setGatewayConfig(cfg);

        // Pick first enabled method
        if (cfg.methods?.upi) setMethod('upi');
        else if (cfg.methods?.card) setMethod('card');
        else if (cfg.methods?.netbanking) setMethod('netbanking');

        // Create payment intent on server
        const intentRes = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: orderDraft.totalAmount,
            currency: cfg.currency || 'INR',
            customerName: orderDraft.customerName,
            customerEmail: orderDraft.customerEmail,
            customerPhone: orderDraft.customerPhone,
            causeId: orderDraft.causeId,
            description: `Buy4AChange Order (${orderDraft.items?.length || 1} items)`,
          }),
        });

        const intentData = await intentRes.json();
        if (cancelled) return;

        if (!intentRes.ok || !intentData.success) {
          throw new Error(intentData.error || 'Could not initialize payment session');
        }

        setTransactionRef(intentData.transactionRef || '');

        if (intentData.provider === 'hyperswitch' && intentData.clientSecret) {
          setHyperPaymentId(intentData.paymentId);
          await loadExternalScript(intentData.sdkUrl);
          if (cancelled || !window.Hyper) return;

          const hyper = window.Hyper(intentData.publishableKey, {
            customBackendUrl: intentData.backendUrl,
          });
          const elements = hyper.elements({
            clientSecret: intentData.clientSecret,
            appearance: {
              theme: 'midnight',
              variables: {
                colorPrimary: '#10b981',
                colorBackground: '#0f172a',
                colorText: '#f8fafc',
                borderRadius: '12px',
              },
            },
          });

          hyperInstanceRef.current = hyper;
          hyperElementsRef.current = elements;

          // Mount after DOM updates
          setTimeout(() => {
            if (!cancelled && hyperMountRef.current) {
              hyperMountRef.current.innerHTML = '';
              const paymentElement = elements.create('payment', {
                layout: 'tabs',
              });
              paymentElement.mount(hyperMountRef.current);
              setHyperReady(true);
            }
          }, 80);
        } else {
          setUpiUri(intentData.upiUri || '');
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Unable to connect to payment gateway');
        }
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isOpen, orderDraft]);

  if (!isOpen || !orderDraft) return null;

  const isHyperswitch = Boolean(gatewayConfig?.hyperswitchActive && hyperPaymentId);

  const handleCopyVpa = () => {
    if (!gatewayConfig?.merchantUpiVpa) return;
    navigator.clipboard.writeText(gatewayConfig.merchantUpiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleHyperswitchConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hyperInstanceRef.current || !hyperElementsRef.current || !hyperPaymentId) return;

    setProcessing(true);
    setError(null);

    try {
      const result = await hyperInstanceRef.current.confirmPayment({
        elements: hyperElementsRef.current,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (result?.error) {
        throw new Error(result.error.message || 'Payment authorization failed');
      }

      // Server-side verification against Hyperswitch API
      const verifyRes = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: hyperPaymentId }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification pending');
      }

      setProcessing(false);
      onPaymentSuccess(verifyData);
    } catch (err: any) {
      setProcessing(false);
      setError(err.message || 'Payment confirmation failed');
    }
  };

  const executeDirectPayment = async (bankName?: string) => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderDraft.totalAmount,
          currency: gatewayConfig?.currency || 'INR',
          method,
          transactionRef,
          cardDetails:
            method === 'card'
              ? { number: cardNumber, expiry, cvv, holder: cardHolder }
              : undefined,
          upiId: method === 'upi' && upiId.trim() ? upiId.trim() : undefined,
          utrNumber: method === 'upi' && utrNumber.trim() ? utrNumber.trim() : undefined,
          bankName,
          orderDetails: {
            customerName: orderDraft.customerName,
            customerEmail: orderDraft.customerEmail,
            pincode: orderDraft.pincode,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }

      setProcessing(false);
      onPaymentSuccess(data);
    } catch (err: any) {
      setProcessing(false);
      setError(err.message || 'Payment processing failed');
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeDirectPayment();
  };

  const qrImageUrl = upiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`
    : '';

  const enabledTabs: Array<{ id: 'upi' | 'card' | 'netbanking'; label: string; icon: any }> = [];
  if (gatewayConfig?.methods?.upi !== false) {
    enabledTabs.push({ id: 'upi', label: 'UPI / QR', icon: QrCode });
  }
  if (gatewayConfig?.methods?.card !== false) {
    enabledTabs.push({ id: 'card', label: 'Card', icon: CreditCard });
  }
  if (gatewayConfig?.methods?.netbanking !== false) {
    enabledTabs.push({ id: 'netbanking', label: 'NetBanking', icon: Building });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0b101d] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-6">
        {/* Gateway Brand Header */}
        <div className="px-6 py-4 bg-[#101728] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Secure Payment Checkout</div>
              <p className="text-[10px] text-slate-400 font-mono">
                {gatewayConfig?.merchantName || 'Buy4AChange'} · 256-bit TLS Encrypted
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-6 py-3 bg-[#0d1424] border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Total Payable:</span>
            {transactionRef && (
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Ref: {transactionRef}
              </div>
            )}
          </div>
          <span className="text-lg font-extrabold text-emerald-400 font-display">
            ₹{orderDraft.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loadingConfig ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
              <span className="text-xs">Initializing secure checkout session...</span>
            </div>
          ) : isHyperswitch ? (
            /* Live Juspay Hyperswitch Unified Checkout Mount */
            <form onSubmit={handleHyperswitchConfirm} className="space-y-4">
              <div
                ref={hyperMountRef}
                className="min-h-[220px] p-3 rounded-2xl bg-slate-900/70 border border-slate-800"
              />
              {!hyperReady && !error && (
                <div className="text-center text-xs text-slate-400">
                  Loading encrypted payment elements...
                </div>
              )}
              <button
                type="submit"
                disabled={processing || !hyperReady}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{orderDraft.totalAmount.toLocaleString('en-IN')} Securely</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Direct NPCI UPI QR + Card + NetBanking Checkout */
            <>
              {/* Method Tabs */}
              <div
                className={`grid gap-2 ${
                  enabledTabs.length === 1
                    ? 'grid-cols-1'
                    : enabledTabs.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
                }`}
              >
                {enabledTabs.map((t) => {
                  const TabIcon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setMethod(t.id);
                        setError(null);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                        method === t.id
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* UPI Flow (Real Scannable NPCI QR + Deep Link) */}
              {method === 'upi' && (
                <div className="space-y-3.5">
                  <div className="flex flex-col items-center text-center space-y-2.5">
                    <div className="p-2.5 bg-white rounded-2xl w-44 h-44 flex items-center justify-center shadow-lg">
                      {qrImageUrl && !qrImgFailed ? (
                        <img
                          src={qrImageUrl}
                          alt="Scan UPI QR to Pay"
                          className="w-full h-full object-contain rounded-lg"
                          onError={() => setQrImgFailed(true)}
                        />
                      ) : (
                        <div className="text-[11px] text-slate-700 font-semibold px-2">
                          Pay via UPI ID:<br />
                          <span className="font-mono text-emerald-700">
                            {gatewayConfig?.merchantUpiVpa || 'ugtindia@upi'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Merchant UPI VPA copy pill */}
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-slate-400">UPI ID:</span>
                      <span className="font-mono font-bold text-emerald-300">
                        {gatewayConfig?.merchantUpiVpa || 'ugtindia@upi'}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="text-slate-400 hover:text-white transition"
                        title="Copy UPI ID"
                      >
                        {copiedVpa ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {upiUri && (
                      <a
                        href={upiUri}
                        className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                      >
                        <span>Open in GPay / PhonePe / Paytm / BHIM</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Your UPI ID (optional)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="name@okhdfcbank"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        UTR / Transaction Ref (optional)
                      </label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="12-digit UTR number"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => executeDirectPayment()}
                    disabled={processing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying UPI Transaction...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm UPI Payment · ₹{orderDraft.totalAmount.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Card Form */}
              {method === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                      placeholder="4532 8920 1422 7831"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 font-mono text-xs text-center text-slate-100 focus:border-emerald-500 focus:outline-none"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 font-mono text-xs text-center text-slate-100 focus:border-emerald-500 focus:outline-none"
                          placeholder="•••"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Secure Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay ₹{orderDraft.totalAmount.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* NetBanking */}
              {method === 'netbanking' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      'HDFC Bank',
                      'State Bank of India',
                      'ICICI Bank',
                      'Axis Bank',
                      'Kotak Mahindra Bank',
                      'Canara Bank',
                    ].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => executeDirectPayment(bank)}
                        disabled={processing}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 text-slate-200 font-semibold text-left transition-all flex items-center justify-between"
                      >
                        <span>{bank}</span>
                        {processing && <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center space-x-1 text-emerald-500">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direct Cause Contribution Verified</span>
            </span>
            <span className="font-mono text-slate-500">256-bit Secure Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
