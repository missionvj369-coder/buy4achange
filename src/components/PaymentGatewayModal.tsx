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
  hyperswitchReady: boolean;
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
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load payment SDK: ${src}`));
    document.head.appendChild(script);
  });
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  orderDraft,
  onPaymentSuccess,
}) => {
  const [gwConfig, setGwConfig] = useState<PublicGatewayConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Direct NPCI UPI state — NEVER pre-filled with fake data
  const [upiUri, setUpiUri] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);

  // Hyperswitch Unified Checkout state
  const [hsIntent, setHsIntent] = useState<{
    paymentId: string;
    clientSecret: string;
    publishableKey: string;
    backendUrl: string;
    sdkUrl: string;
  } | null>(null);
  const [hsMounted, setHsMounted] = useState(false);
  const hyperInstanceRef = useRef<any>(null);
  const hyperWidgetsRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !orderDraft) return;
    let cancelled = false;

    const initCheckout = async () => {
      setLoadingConfig(true);
      setError(null);
      setHsIntent(null);
      setHsMounted(false);
      setQrFailed(false);
      setUtrNumber('');
      setUpiId('');

      try {
        const cfgRes = await fetch('/api/payment/config/public', { cache: 'no-store' });
        const cfg: PublicGatewayConfig = await cfgRes.json();
        if (cancelled) return;
        setGwConfig(cfg);
        setMethod('upi');

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
            description: `Buy4AChange Order — ${orderDraft.customerName || 'Buyer'}`,
          }),
        });
        const intentData = await intentRes.json();
        if (cancelled) return;

        if (!intentRes.ok) {
          throw new Error(intentData.error || 'Could not initialize payment session');
        }

        if (intentData.provider === 'hyperswitch' && intentData.clientSecret) {
          setHsIntent({
            paymentId: intentData.paymentId,
            clientSecret: intentData.clientSecret,
            publishableKey: intentData.publishableKey,
            backendUrl: intentData.backendUrl,
            sdkUrl: intentData.sdkUrl,
          });
        } else {
          setUpiUri(intentData.upiUri || '');
          setTransactionRef(intentData.transactionRef || '');
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Unable to connect to payment service.');
        }
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    };

    initCheckout();
    return () => {
      cancelled = true;
    };
  }, [isOpen, orderDraft]);

  // Mount live Hyperswitch Unified Checkout when configured
  useEffect(() => {
    if (!hsIntent) return;
    let cancelled = false;

    const mountHyperswitch = async () => {
      try {
        await loadExternalScript(hsIntent.sdkUrl);
        if (cancelled || !window.Hyper) return;

        const hyper = window.Hyper(hsIntent.publishableKey, {
          customBackendUrl: hsIntent.backendUrl,
        });
        const widgets = hyper.widgets({
          clientSecret: hsIntent.clientSecret,
          appearance: {
            theme: 'midnight',
            variables: {
              colorPrimary: '#00f0ff',
              colorBackground: '#0b0824',
              colorText: '#ffffff',
              borderRadius: '12px',
            },
          },
        });
        const unifiedCheckout = widgets.create('payment', { layout: 'tabs' });
        unifiedCheckout.mount('#hyperswitch-unified-checkout');
        hyperInstanceRef.current = hyper;
        hyperWidgetsRef.current = widgets;
        if (!cancelled) setHsMounted(true);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Could not load live Hyperswitch checkout widget.');
        }
      }
    };

    mountHyperswitch();
    return () => {
      cancelled = true;
    };
  }, [hsIntent]);

  if (!isOpen || !orderDraft) return null;

  const cleanUtr = utrNumber.replace(/\D/g, '');
  const isUtrValid = /^\d{12}$/.test(cleanUtr);

  const handleHyperswitchConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hyperInstanceRef.current || !hyperWidgetsRef.current || !hsIntent) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await hyperInstanceRef.current.confirmPayment({
        widgets: hyperWidgetsRef.current,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });

      if (result?.error) {
        throw new Error(result.error.message || 'Payment authorization failed.');
      }

      const verifyRes = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: hsIntent.paymentId }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed on server.');
      }

      setProcessing(false);
      onPaymentSuccess(verifyData);
    } catch (err: any) {
      setProcessing(false);
      setError(err.message || 'Payment could not be completed.');
    }
  };

  const handleSubmitDirectUpiUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUtrValid) {
      setError('Please complete your UPI payment first and enter the exact 12-digit UTR / Reference Number from your UPI app.');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderDraft.totalAmount,
          currency: gwConfig?.currency || 'INR',
          method: 'upi',
          upiId: upiId.trim() || undefined,
          utrNumber: cleanUtr,
          transactionRef,
          orderDetails: {
            customerName: orderDraft.customerName,
            customerEmail: orderDraft.customerEmail,
            pincode: orderDraft.pincode,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not submit UPI reference.');
      }

      setProcessing(false);
      onPaymentSuccess(data);
    } catch (err: any) {
      setProcessing(false);
      setError(err.message || 'Payment submission failed.');
    }
  };

  const merchantVpa = gwConfig?.merchantUpiVpa || 'ugtindia@upi';
  const qrImageUrl = upiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#04030e]/92 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-3d rounded-3xl overflow-hidden shadow-2xl my-6">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#0d0929] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/35 flex items-center justify-center text-[#00f0ff]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                {hsIntent ? 'Verified Gateway Checkout' : 'Direct UPI Payment'}
              </div>
              <p className="text-[10px] text-slate-300 font-mono">
                {hsIntent ? 'Live Payment Processor Connected' : 'Real Payment Verification Required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-5 sm:px-6 py-3 bg-[#08051c] border-b border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-300">Exact Amount Payable:</span>
          <span className="text-lg font-extrabold text-[#00f0ff] font-mono">
            ₹{orderDraft.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {loadingConfig ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-300 text-xs">
              <RefreshCw className="w-6 h-6 text-[#00f0ff] animate-spin" />
              <span>Initializing secure payment session...</span>
            </div>
          ) : hsIntent ? (
            /* LIVE HYPERSWITCH UNIFIED CHECKOUT */
            <form onSubmit={handleHyperswitchConfirm} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div
                id="hyperswitch-unified-checkout"
                className="min-h-[210px] rounded-2xl bg-[#0b0824] border border-white/15 p-3"
              >
                {!hsMounted && (
                  <div className="py-14 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#00f0ff]" />
                    <span>Loading live payment form...</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={processing || !hsMounted}
                className="w-full py-3.5 rounded-full prism-button disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition active:scale-95"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{orderDraft.totalAmount.toLocaleString('en-IN')} Now</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* HONEST DIRECT UPI MODE — NO FAKE CARD/BANK APPROVALS */
            <>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setMethod('upi'); setError(null); }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition ${
                    method === 'upi'
                      ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff]'
                      : 'bg-white/[0.04] border-white/10 text-slate-300'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('card'); setError(null); }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition ${
                    method === 'card'
                      ? 'bg-[#ff2e97]/15 border-[#ff2e97] text-[#ff2e97]'
                      : 'bg-white/[0.04] border-white/10 text-slate-300'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('netbanking'); setError(null); }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition ${
                    method === 'netbanking'
                      ? 'bg-[#ffb800]/15 border-[#ffb800] text-[#ffb800]'
                      : 'bg-white/[0.04] border-white/10 text-slate-300'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>NetBanking</span>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {method === 'upi' ? (
                <form onSubmit={handleSubmitDirectUpiUtr} className="space-y-4">
                  {/* Step 1: Real UPI QR & Deep Link */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00f0ff] font-bold">
                      Step 1 · Pay ₹{orderDraft.totalAmount.toLocaleString('en-IN')} via Any UPI App
                    </div>

                    <div className="p-2.5 bg-white rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-lg">
                      {qrImageUrl && !qrFailed ? (
                        <img
                          src={qrImageUrl}
                          alt={`UPI QR Code for ${merchantVpa}`}
                          onError={() => setQrFailed(true)}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-slate-800 text-[11px] font-mono p-2">
                          Pay to UPI ID: <strong>{merchantVpa}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      <span className="px-3 py-1 rounded-lg bg-[#07051a] border border-white/15 font-mono text-xs text-[#00f0ff] font-bold">
                        {merchantVpa}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(merchantVpa);
                          setCopiedVpa(true);
                          setTimeout(() => setCopiedVpa(false), 2000);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                        title="Copy UPI ID"
                      >
                        {copiedVpa ? <Check className="w-3.5 h-3.5 text-[#00e5a0]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {upiUri && (
                      <a
                        href={upiUri}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-bold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in GPay / PhonePe / Paytm / BHIM</span>
                      </a>
                    )}
                  </div>

                  {/* Step 2: Mandatory 12-Digit Bank UTR */}
                  <div className="p-4 rounded-2xl bg-[#ffb800]/[0.07] border border-[#ffb800]/30 space-y-2.5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ffb800] font-bold">
                      Step 2 · Enter 12-Digit Bank UTR / Reference Number (Required)
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      After completing the payment in your UPI app, copy the <strong>12-digit UTR / UPI Transaction Reference Number</strong> from your receipt and paste it below. Your order is confirmed once verified against our bank ledger.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={12}
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="Enter exact 12-digit UTR (e.g. 421812345678)"
                      className="w-full bg-[#07051a] border border-[#ffb800]/50 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none tracking-widest text-center font-bold"
                    />
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isUtrValid ? 'text-[#00e5a0]' : 'text-slate-400'}>
                        {isUtrValid ? '✓ Valid 12-digit UTR format' : `${cleanUtr.length} / 12 digits entered`}
                      </span>
                      <span className="text-slate-400">No fake auto-approvals</span>
                    </div>

                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Your UPI ID (optional, e.g. yourname@okicici)"
                      className="w-full bg-[#07051a] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-[#00f0ff] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing || !isUtrValid}
                    className="w-full py-3.5 rounded-full prism-button disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition active:scale-95"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting UTR for Verification...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit 12-Digit UTR &amp; Place Order</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* HONEST GUARD FOR CARD / NETBANKING UNTIL LIVE HYPERSWITCH KEYS ARE CONNECTED */
                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/15 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 mx-auto text-[#ffb800]" />
                  <h4 className="text-sm font-bold text-white">
                    {method === 'card' ? 'Card Payments' : 'NetBanking'} Not Yet Activated
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To protect buyers from simulated transactions, live Card and NetBanking checkout only activates once live Hyperswitch gateway keys are configured in <strong>Admin → Payment Gateway</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className="px-5 py-2.5 rounded-full prism-button text-white font-bold text-xs uppercase tracking-wider"
                  >
                    Pay Now via Direct UPI / QR
                  </button>
                </div>
              )}
            </>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1 text-[#00e5a0]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Audited Payment Verification</span>
            </span>
            <span className="font-mono">256-bit TLS Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
