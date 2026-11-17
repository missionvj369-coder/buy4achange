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
            theme: 'flat',
            variables: {
              colorPrimary: '#166534',
              colorBackground: '#ffffff',
              colorText: '#14171a',
              borderRadius: '8px',
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
          setError(err.message || 'Could not load live payment checkout widget.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl my-6">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-gray-900 font-bold text-sm">
                {hsIntent ? 'Verified Gateway Checkout' : 'Direct UPI Payment'}
              </div>
              <p className="text-[11px] text-gray-500">
                {hsIntent ? 'Live Payment Processor Connected' : 'Real Payment Verification Required'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Exact Amount Payable:</span>
          <span className="text-lg font-bold text-[#166534] font-mono">
            ₹{orderDraft.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {loadingConfig ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-gray-600 text-xs">
              <RefreshCw className="w-6 h-6 text-[#166534] animate-spin" />
              <span>Initializing secure payment session...</span>
            </div>
          ) : hsIntent ? (
            /* LIVE HYPERSWITCH UNIFIED CHECKOUT */
            <form onSubmit={handleHyperswitchConfirm} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div
                id="hyperswitch-unified-checkout"
                className="min-h-[210px] rounded-lg bg-white border border-gray-200 p-3"
              >
                {!hsMounted && (
                  <div className="py-14 flex flex-col items-center justify-center space-y-2 text-xs text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#166534]" />
                    <span>Loading live payment form...</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={processing || !hsMounted}
                className="w-full py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
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
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border ${
                    method === 'upi'
                      ? 'bg-[#F0FDF4] border-[#166534] text-[#166534]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('card'); setError(null); }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border ${
                    method === 'card'
                      ? 'bg-[#FAF9F6] border-gray-900 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('netbanking'); setError(null); }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border ${
                    method === 'netbanking'
                      ? 'bg-[#FAF9F6] border-gray-900 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>NetBanking</span>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {method === 'upi' ? (
                <form onSubmit={handleSubmitDirectUpiUtr} className="space-y-4">
                  {/* Step 1: Real UPI QR & Deep Link */}
                  <div className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200 text-center space-y-3">
                    <div className="text-xs uppercase tracking-wider text-[#166534] font-semibold">
                      Step 1 · Pay ₹{orderDraft.totalAmount.toLocaleString('en-IN')} via Any UPI App
                    </div>

                    <div className="p-2 bg-white border border-gray-200 rounded-lg w-44 h-44 mx-auto flex items-center justify-center">
                      {qrImageUrl && !qrFailed ? (
                        <img
                          src={qrImageUrl}
                          alt={`UPI QR Code for ${merchantVpa}`}
                          onError={() => setQrFailed(true)}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-800 text-xs font-mono p-2">
                          Pay to UPI ID: <strong>{merchantVpa}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      <span className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 font-mono text-xs text-gray-900 font-semibold">
                        {merchantVpa}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(merchantVpa);
                          setCopiedVpa(true);
                          setTimeout(() => setCopiedVpa(false), 2000);
                        }}
                        className="p-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 text-gray-700"
                        title="Copy UPI ID"
                      >
                        {copiedVpa ? <Check className="w-4 h-4 text-[#166534]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {upiUri && (
                      <a
                        href={upiUri}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-[#166534] text-[#166534] text-xs font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in GPay / PhonePe / Paytm / BHIM</span>
                      </a>
                    )}
                  </div>

                  {/* Step 2: Mandatory 12-Digit Bank UTR */}
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2.5">
                    <div className="text-xs uppercase tracking-wider text-amber-900 font-semibold">
                      Step 2 · Enter 12-Digit Bank UTR / Reference Number (Required)
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
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
                      className="w-full bg-white border border-amber-400 rounded-lg px-3.5 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400 focus:border-[#166534] focus:outline-none tracking-widest text-center font-bold"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={isUtrValid ? 'text-[#166534] font-semibold' : 'text-gray-600'}>
                        {isUtrValid ? '✓ Valid 12-digit UTR format' : `${cleanUtr.length} / 12 digits entered`}
                      </span>
                      <span className="text-gray-500">Audited verification</span>
                    </div>

                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Your UPI ID (optional, e.g. yourname@okicici)"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 placeholder-gray-400 focus:border-[#166534] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing || !isUtrValid}
                    className="w-full py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center space-x-2"
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
                <div className="p-5 rounded-lg bg-[#FAF9F6] border border-gray-200 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 mx-auto text-amber-600" />
                  <h4 className="text-sm font-bold text-gray-900">
                    {method === 'card' ? 'Card Payments' : 'NetBanking'} Not Yet Activated
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    To protect buyers from simulated transactions, live Card and NetBanking checkout only activates once live gateway keys are configured in the Admin console.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className="px-5 py-2.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs"
                  >
                    Pay Now via Direct UPI / QR
                  </button>
                </div>
              )}
            </>
          )}

          <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center space-x-1 text-[#166534] font-medium">
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
