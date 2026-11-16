import crypto from 'node:crypto';
import { PaymentGatewayConfig } from './db.ts';

/**
 * Open-Source Payment Gateway Engine for Buy4AChange
 * Integrates:
 * 1. Juspay Hyperswitch (https://github.com/juspay/hyperswitch - Apache 2.0)
 *    - Sandbox: https://sandbox.hyperswitch.io
 *    - Production: https://api.hyperswitch.io
 *    - Self-Hosted Docker: http://localhost:8080
 * 2. NPCI Open UPI Payment Intent Standard (upi://pay)
 */

export function maskSecret(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return `••••${secret.slice(-6)}`;
}

export function getHyperswitchSdkUrl(config: PaymentGatewayConfig): string {
  if (config.mode === 'hyperswitch_live' && !config.hyperswitch_base_url.includes('sandbox')) {
    return 'https://checkout.hyperswitch.io/v0/HyperLoader.js';
  }
  return 'https://beta.hyperswitch.io/v1/HyperLoader.js';
}

export function isHyperswitchConfigured(config: PaymentGatewayConfig): boolean {
  return (
    (config.mode === 'hyperswitch_sandbox' || config.mode === 'hyperswitch_live') &&
    Boolean(config.hyperswitch_base_url) &&
    Boolean(config.hyperswitch_api_key) &&
    Boolean(config.hyperswitch_publishable_key)
  );
}

/**
 * Validate card number using the standard Luhn algorithm
 */
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleNext = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (doubleNext) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleNext = !doubleNext;
  }
  return sum % 10 === 0;
}

/**
 * Validate UPI VPA format (e.g., name@okhdfcbank, ugtindia@upi)
 */
export function validateUpiVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(vpa.trim());
}

/**
 * Build an NPCI-standard UPI payment deep link (scannable by GPay, PhonePe, Paytm, BHIM)
 */
export function buildUpiPaymentUri(params: {
  vpa: string;
  merchantName: string;
  amount: number;
  transactionRef: string;
  note: string;
  currency?: string;
}): string {
  const qs = new URLSearchParams({
    pa: params.vpa,
    pn: params.merchantName,
    tr: params.transactionRef,
    tn: params.note.slice(0, 60),
    am: params.amount.toFixed(2),
    cu: params.currency || 'INR',
  });
  return `upi://pay?${qs.toString()}`;
}

/**
 * Create a live Payment Intent on Juspay Hyperswitch (POST /payments)
 */
export async function createHyperswitchPaymentIntent(
  config: PaymentGatewayConfig,
  payload: {
    amount: number;
    currency?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    description?: string;
    causeId?: string;
    orderRef?: string;
  }
) {
  const baseUrl = config.hyperswitch_base_url.replace(/\/+$/, '');
  const amountMinor = Math.round(payload.amount * 100); // paise / cents

  const body: Record<string, any> = {
    amount: amountMinor,
    currency: (payload.currency || config.currency || 'INR').toUpperCase(),
    confirm: false,
    capture_method: 'automatic',
    authentication_type: 'three_ds',
    description: payload.description || 'Buy4AChange Conscious Commerce Order',
    email: payload.customerEmail || 'customer@buy4achange.org',
    name: payload.customerName || 'Buy4AChange Supporter',
    phone: payload.customerPhone || undefined,
    metadata: {
      store: 'Buy4AChange',
      network: 'UGT India (ugtindia.space)',
      cause_id: payload.causeId || 'general',
      order_ref: payload.orderRef || `B4C_${Date.now()}`,
    },
  };

  if (config.hyperswitch_profile_id) {
    body.profile_id = config.hyperswitch_profile_id;
  }

  const response = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.hyperswitch_api_key,
    },
    body: JSON.stringify(body),
  });

  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errMsg =
      data?.error?.message ||
      data?.message ||
      `Hyperswitch API responded with HTTP ${response.status}`;
    throw new Error(errMsg);
  }

  return {
    paymentId: data.payment_id,
    clientSecret: data.client_secret,
    status: data.status,
    amount: payload.amount,
    currency: body.currency,
    publishableKey: config.hyperswitch_publishable_key,
    backendUrl: baseUrl,
    sdkUrl: getHyperswitchSdkUrl(config),
  };
}

/**
 * Retrieve and verify a payment status directly from Hyperswitch (GET /payments/:id)
 */
export async function retrieveHyperswitchPayment(
  config: PaymentGatewayConfig,
  paymentId: string
) {
  const baseUrl = config.hyperswitch_base_url.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.hyperswitch_api_key,
    },
  });

  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errMsg =
      data?.error?.message ||
      data?.message ||
      `Hyperswitch payment verification failed (HTTP ${response.status})`;
    throw new Error(errMsg);
  }

  return data;
}

/**
 * Verify incoming Hyperswitch webhook signature using HMAC-SHA512 (X-Webhook-Signature-512)
 */
export function verifyHyperswitchWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  hashKey: string
): boolean {
  if (!signatureHeader || !hashKey) return false;
  try {
    const expected = crypto
      .createHmac('sha512', hashKey)
      .update(rawBody, 'utf8')
      .digest('hex');

    const sigBuf = Buffer.from(signatureHeader.trim(), 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) {
      // Fallback: compare as UTF-8 strings if header is hex text of differing parse
      const a = Buffer.from(signatureHeader.trim(), 'utf8');
      const b = Buffer.from(expected, 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    }
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Test live connectivity & API credentials against configured gateway
 */
export async function testGatewayConnection(config: PaymentGatewayConfig) {
  const startedAt = Date.now();

  if (config.mode === 'direct_upi') {
    const vpaOk = validateUpiVpa(config.merchant_upi_vpa);
    return {
      ok: vpaOk,
      mode: config.mode,
      latencyMs: Date.now() - startedAt,
      endpoint: `upi://pay?pa=${config.merchant_upi_vpa}`,
      message: vpaOk
        ? `Direct UPI & Local Checkout is active and valid for ${config.merchant_upi_vpa}`
        : `Invalid Merchant UPI VPA "${config.merchant_upi_vpa}". Expected format like ugtindia@upi`,
    };
  }

  if (!config.hyperswitch_base_url) {
    return {
      ok: false,
      mode: config.mode,
      latencyMs: 0,
      endpoint: '',
      message: 'Hyperswitch Base URL is required.',
    };
  }

  if (!config.hyperswitch_api_key) {
    return {
      ok: false,
      mode: config.mode,
      latencyMs: 0,
      endpoint: config.hyperswitch_base_url,
      message: 'Hyperswitch Secret API Key is not configured yet.',
    };
  }

  const baseUrl = config.hyperswitch_base_url.replace(/\/+$/, '');
  const testUrl = `${baseUrl}/payments/list?limit=1`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'api-key': config.hyperswitch_api_key,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - startedAt;
    if (resp.ok) {
      return {
        ok: true,
        mode: config.mode,
        statusCode: resp.status,
        latencyMs,
        endpoint: baseUrl,
        message: `Connected to Juspay Hyperswitch (${baseUrl}) — API key authenticated (${latencyMs}ms).`,
      };
    }

    const errBody: any = await resp.json().catch(() => ({}));
    return {
      ok: false,
      mode: config.mode,
      statusCode: resp.status,
      latencyMs,
      endpoint: baseUrl,
      message:
        errBody?.error?.message ||
        errBody?.message ||
        `Hyperswitch returned HTTP ${resp.status}. Please check your API key and endpoint URL.`,
    };
  } catch (err: any) {
    return {
      ok: false,
      mode: config.mode,
      latencyMs: Date.now() - startedAt,
      endpoint: baseUrl,
      message: `Could not reach ${baseUrl}: ${err?.message || 'Network error'}`,
    };
  }
}
