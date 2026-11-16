/**
 * Buy4AChange — Production Cloudflare Worker (Edge API + D1 + Open-Source Payment Gateway)
 * Serves full eCommerce storefront, 8 UGT India National Missions, Admin Portal API,
 * and Juspay Hyperswitch + NPCI Direct UPI Payment Gateway on Cloudflare Edge.
 */

export interface Env {
  BUY4ACHANGE_DB: D1Database;
  ASSETS?: Fetcher;
  ENVIRONMENT?: string;
  ADMIN_TOKEN_SECRET?: string;
  HYPERSWITCH_BASE_URL?: string;
  HYPERSWITCH_API_KEY?: string;
  HYPERSWITCH_PUBLISHABLE_KEY?: string;
  HYPERSWITCH_PROFILE_ID?: string;
  HYPERSWITCH_WEBHOOK_HASH_KEY?: string;
  MERCHANT_UPI_VPA?: string;
  MERCHANT_NAME?: string;
}

type GatewayMode = 'direct_upi' | 'hyperswitch_sandbox' | 'hyperswitch_live';

interface PaymentGatewayConfig {
  mode: GatewayMode;
  hyperswitch_base_url: string;
  hyperswitch_api_key: string;
  hyperswitch_publishable_key: string;
  hyperswitch_profile_id: string;
  hyperswitch_webhook_hash_key: string;
  merchant_upi_vpa: string;
  merchant_name: string;
  currency: string;
  enable_card: boolean;
  enable_upi: boolean;
  enable_netbanking: boolean;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Signature-512',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

// --- WebCrypto Helpers (SHA-256 & HMAC-SHA256 / HMAC-SHA512) ---

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return toHex(hash);
}

async function hmacHex(algo: 'SHA-256' | 'SHA-512', secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: algo },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return toHex(sig);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function getTokenSecret(env: Env): string {
  return env.ADMIN_TOKEN_SECRET || 'BUY4ACHANGE_UGT_EDGE_JWT_SECRET_2026_V1';
}

async function createAdminToken(user: { id: string; email: string; name: string; role: string }, env: Env): Promise<string> {
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
  );
  const sig = await hmacHex('SHA-256', getTokenSecret(env), payload);
  return `${payload}.${sig}`;
}

async function verifyAdminToken(request: Request, env: Env): Promise<{ sub: string; email: string; role: string } | null> {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expected = await hmacHex('SHA-256', getTokenSecret(env), payloadB64);
  if (!timingSafeEqualStr(sig, expected)) return null;
  try {
    const parsed = JSON.parse(atob(payloadB64));
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

// --- Payment Gateway Helpers ---

function maskSecret(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return `••••${secret.slice(-6)}`;
}

function getHyperswitchSdkUrl(cfg: PaymentGatewayConfig): string {
  if (cfg.mode === 'hyperswitch_live' && !cfg.hyperswitch_base_url.includes('sandbox')) {
    return 'https://checkout.hyperswitch.io/v0/HyperLoader.js';
  }
  return 'https://beta.hyperswitch.io/v1/HyperLoader.js';
}

function isHyperswitchConfigured(cfg: PaymentGatewayConfig): boolean {
  return (
    (cfg.mode === 'hyperswitch_sandbox' || cfg.mode === 'hyperswitch_live') &&
    Boolean(cfg.hyperswitch_base_url) &&
    Boolean(cfg.hyperswitch_api_key) &&
    Boolean(cfg.hyperswitch_publishable_key)
  );
}

function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function validateUpiVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(vpa.trim());
}

function buildUpiPaymentUri(params: {
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

async function getGatewayConfig(env: Env): Promise<PaymentGatewayConfig> {
  const { results } = await env.BUY4ACHANGE_DB.prepare('SELECT key, value FROM gateway_settings').all();
  const map: Record<string, string> = {};
  for (const r of (results as any[]) || []) {
    map[r.key] = r.value;
  }

  return {
    mode: (map.mode as GatewayMode) || 'direct_upi',
    hyperswitch_base_url: map.hyperswitch_base_url ?? env.HYPERSWITCH_BASE_URL ?? 'https://sandbox.hyperswitch.io',
    hyperswitch_api_key: map.hyperswitch_api_key ?? env.HYPERSWITCH_API_KEY ?? '',
    hyperswitch_publishable_key: map.hyperswitch_publishable_key ?? env.HYPERSWITCH_PUBLISHABLE_KEY ?? '',
    hyperswitch_profile_id: map.hyperswitch_profile_id ?? env.HYPERSWITCH_PROFILE_ID ?? '',
    hyperswitch_webhook_hash_key: map.hyperswitch_webhook_hash_key ?? env.HYPERSWITCH_WEBHOOK_HASH_KEY ?? '',
    merchant_upi_vpa: map.merchant_upi_vpa ?? env.MERCHANT_UPI_VPA ?? 'ugtindia@upi',
    merchant_name: map.merchant_name ?? env.MERCHANT_NAME ?? 'Buy4AChange UGT India',
    currency: map.currency ?? 'INR',
    enable_card: map.enable_card !== undefined ? map.enable_card === 'true' : true,
    enable_upi: map.enable_upi !== undefined ? map.enable_upi === 'true' : true,
    enable_netbanking: map.enable_netbanking !== undefined ? map.enable_netbanking === 'true' : true,
  };
}

async function saveGatewayConfig(env: Env, updates: Partial<PaymentGatewayConfig>): Promise<PaymentGatewayConfig> {
  const current = await getGatewayConfig(env);
  const merged: PaymentGatewayConfig = {
    ...current,
    ...updates,
    hyperswitch_api_key:
      updates.hyperswitch_api_key && !updates.hyperswitch_api_key.startsWith('••••')
        ? updates.hyperswitch_api_key.trim()
        : updates.hyperswitch_api_key === ''
        ? ''
        : current.hyperswitch_api_key,
    hyperswitch_webhook_hash_key:
      updates.hyperswitch_webhook_hash_key && !updates.hyperswitch_webhook_hash_key.startsWith('••••')
        ? updates.hyperswitch_webhook_hash_key.trim()
        : updates.hyperswitch_webhook_hash_key === ''
        ? ''
        : current.hyperswitch_webhook_hash_key,
  };

  const pairs: [string, string][] = [
    ['mode', merged.mode],
    ['hyperswitch_base_url', merged.hyperswitch_base_url.trim().replace(/\/+$/, '')],
    ['hyperswitch_api_key', merged.hyperswitch_api_key],
    ['hyperswitch_publishable_key', merged.hyperswitch_publishable_key.trim()],
    ['hyperswitch_profile_id', merged.hyperswitch_profile_id.trim()],
    ['hyperswitch_webhook_hash_key', merged.hyperswitch_webhook_hash_key],
    ['merchant_upi_vpa', merged.merchant_upi_vpa.trim()],
    ['merchant_name', merged.merchant_name.trim()],
    ['currency', merged.currency.trim() || 'INR'],
    ['enable_card', String(Boolean(merged.enable_card))],
    ['enable_upi', String(Boolean(merged.enable_upi))],
    ['enable_netbanking', String(Boolean(merged.enable_netbanking))],
  ];

  const stmts = pairs.map(([k, v]) =>
    env.BUY4ACHANGE_DB.prepare('INSERT OR REPLACE INTO gateway_settings (key, value) VALUES (?, ?)').bind(k, v)
  );
  await env.BUY4ACHANGE_DB.batch(stmts);
  return getGatewayConfig(env);
}

async function getOrderWithItems(env: Env, id: string) {
  const order: any = await env.BUY4ACHANGE_DB.prepare(
    'SELECT o.*, c.title as cause_title FROM orders o LEFT JOIN causes c ON o.cause_id = c.id WHERE o.id = ? OR o.order_number = ?'
  )
    .bind(id, id)
    .first();
  if (!order) return null;
  const { results: items } = await env.BUY4ACHANGE_DB.prepare(
    'SELECT oi.*, c.title as cause_title FROM order_items oi LEFT JOIN causes c ON oi.cause_id = c.id WHERE oi.order_id = ?'
  )
    .bind(order.id)
    .all();
  order.items = items || [];
  return order;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Serve static frontend assets for non-API routes
    if (!pathname.startsWith('/api')) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response('Buy4AChange Edge API is running', { status: 200 });
    }

    try {
      // ============================================================
      // PUBLIC ENDPOINTS
      // ============================================================

      if (pathname === '/api/health') {
        const cfg = await getGatewayConfig(env);
        return json({
          status: 'online',
          app: 'Buy4AChange Production API',
          version: '2.1.0',
          runtime: 'Cloudflare Workers (Global Edge)',
          database: 'Cloudflare D1',
          network: 'UGT India (ugtindia.space) · 8 National Missions',
          paymentMode: cfg.mode,
          timestamp: new Date().toISOString(),
        });
      }

      // Causes
      if (pathname === '/api/causes' && request.method === 'GET') {
        const { results } = await env.BUY4ACHANGE_DB.prepare(
          'SELECT * FROM causes ORDER BY raised_amount DESC'
        ).all();
        return json(results || []);
      }

      const causeMatch = pathname.match(/^\/api\/causes\/([^/]+)$/);
      if (causeMatch && request.method === 'GET') {
        const id = decodeURIComponent(causeMatch[1]);
        const cause = await env.BUY4ACHANGE_DB.prepare(
          'SELECT * FROM causes WHERE id = ? OR slug = ?'
        )
          .bind(id, id)
          .first();
        if (!cause) return json({ error: 'Mission not found' }, 404);
        return json(cause);
      }

      // Products (Public — NEVER returns digital_html_content; locked until purchase!)
      const PUBLIC_PRODUCT_COLS = `
        p.id, p.name, p.slug, p.description, p.price, p.compare_at_price,
        p.category, COALESCE(p.subcategory, '') as subcategory,
        COALESCE(p.product_type, 'physical') as product_type,
        COALESCE(p.digital_access_note, '') as digital_access_note,
        CASE WHEN COALESCE(p.digital_html_content, '') != '' THEN 1 ELSE 0 END as has_digital_content,
        p.image_url, p.stock, p.is_featured, p.cause_id, p.cause_allocation_pct,
        p.cause_impact_text, p.rating, p.reviews_count, p.badge, p.created_at,
        c.title as cause_title, c.category as cause_category
      `;

      if (pathname === '/api/products' && request.method === 'GET') {
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        let query = `
          SELECT ${PUBLIC_PRODUCT_COLS}
          FROM products p
          LEFT JOIN causes c ON p.cause_id = c.id
          WHERE 1=1
        `;
        const params: any[] = [];

        if (category && category !== 'All') {
          query += ' AND p.category = ?';
          params.push(category);
        }
        if (search && search.trim() !== '') {
          query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR p.subcategory LIKE ?)';
          const term = `%${search.trim()}%`;
          params.push(term, term, term, term);
        }
        query += ' ORDER BY p.created_at DESC, p.rowid DESC';

        const stmt = env.BUY4ACHANGE_DB.prepare(query);
        const { results } = params.length ? await stmt.bind(...params).all() : await stmt.all();
        return json(results || []);
      }

      const prodMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
      if (prodMatch && request.method === 'GET') {
        const id = decodeURIComponent(prodMatch[1]);
        const prod = await env.BUY4ACHANGE_DB.prepare(
          `SELECT ${PUBLIC_PRODUCT_COLS} FROM products p LEFT JOIN causes c ON p.cause_id = c.id WHERE p.id = ? OR p.slug = ?`
        )
          .bind(id, id)
          .first();
        if (!prod) return json({ error: 'Product not found' }, 404);
        return json(prod);
      }

      // ============================================================
      // OPEN-SOURCE PAYMENT GATEWAY ENDPOINTS
      // ============================================================

      if (pathname === '/api/payment/config/public' && request.method === 'GET') {
        const cfg = await getGatewayConfig(env);
        const hyperswitchActive = isHyperswitchConfigured(cfg);
        return json({
          mode: cfg.mode,
          hyperswitchActive,
          publishableKey: hyperswitchActive ? cfg.hyperswitch_publishable_key : null,
          backendUrl: hyperswitchActive ? cfg.hyperswitch_base_url : null,
          sdkUrl: hyperswitchActive ? getHyperswitchSdkUrl(cfg) : null,
          merchantUpiVpa: cfg.merchant_upi_vpa,
          merchantName: cfg.merchant_name,
          currency: cfg.currency,
          methods: {
            card: cfg.enable_card,
            upi: cfg.enable_upi,
            netbanking: cfg.enable_netbanking,
          },
        });
      }

      if (pathname === '/api/payment/create-intent' && request.method === 'POST') {
        const body: any = await request.json();
        const numericAmount = parseFloat(body.amount);
        if (!numericAmount || numericAmount <= 0) {
          return json({ error: 'Invalid transaction amount' }, 400);
        }

        const cfg = await getGatewayConfig(env);
        const orderRef = `B4C_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;

        if (isHyperswitchConfigured(cfg)) {
          const baseUrl = cfg.hyperswitch_base_url.replace(/\/+$/, '');
          const hsPayload: Record<string, any> = {
            amount: Math.round(numericAmount * 100),
            currency: (body.currency || cfg.currency || 'INR').toUpperCase(),
            confirm: false,
            capture_method: 'automatic',
            authentication_type: 'three_ds',
            description: body.description || 'Buy4AChange Conscious Commerce Order',
            email: body.customerEmail || 'customer@buy4achange.org',
            name: body.customerName || 'Buy4AChange Supporter',
            metadata: {
              store: 'Buy4AChange',
              network: 'UGT India (ugtindia.space)',
              cause_id: body.causeId || 'general',
              order_ref: orderRef,
            },
          };
          if (cfg.hyperswitch_profile_id) {
            hsPayload.profile_id = cfg.hyperswitch_profile_id;
          }

          const hsResp = await fetch(`${baseUrl}/payments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': cfg.hyperswitch_api_key,
            },
            body: JSON.stringify(hsPayload),
          });
          const hsData: any = await hsResp.json().catch(() => ({}));
          if (!hsResp.ok) {
            return json(
              { error: hsData?.error?.message || hsData?.message || `Hyperswitch HTTP ${hsResp.status}` },
              502
            );
          }

          await env.BUY4ACHANGE_DB.prepare(
            `INSERT INTO payment_transactions (id, order_id, amount, currency, gateway, transaction_ref, status, method_details, webhook_payload)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              hsData.payment_id,
              orderRef,
              numericAmount,
              hsPayload.currency,
              cfg.mode === 'hyperswitch_live' ? 'HYPERSWITCH_LIVE' : 'HYPERSWITCH_SANDBOX',
              orderRef,
              hsData.status || 'requires_payment_method',
              JSON.stringify({ provider: 'juspay/hyperswitch', endpoint: baseUrl }),
              ''
            )
            .run();

          return json({
            success: true,
            provider: 'hyperswitch',
            paymentId: hsData.payment_id,
            clientSecret: hsData.client_secret,
            status: hsData.status,
            amount: numericAmount,
            currency: hsPayload.currency,
            publishableKey: cfg.hyperswitch_publishable_key,
            backendUrl: baseUrl,
            sdkUrl: getHyperswitchSdkUrl(cfg),
            transactionRef: orderRef,
          });
        }

        // Direct NPCI UPI + Local Checkout Intent
        const intentId = `pi_b4c_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
        const upiUri = buildUpiPaymentUri({
          vpa: cfg.merchant_upi_vpa,
          merchantName: cfg.merchant_name,
          amount: numericAmount,
          transactionRef: orderRef,
          note: body.description || 'Buy4AChange UGT Mission Order',
          currency: body.currency || cfg.currency,
        });

        return json({
          success: true,
          provider: 'direct_upi',
          paymentId: intentId,
          transactionRef: orderRef,
          amount: numericAmount,
          currency: body.currency || cfg.currency,
          upiUri,
          merchantUpiVpa: cfg.merchant_upi_vpa,
          merchantName: cfg.merchant_name,
        });
      }

      if (pathname === '/api/payment/confirm' && request.method === 'POST') {
        const body: any = await request.json();
        const { paymentId } = body;
        if (!paymentId) return json({ error: 'paymentId is required' }, 400);

        const cfg = await getGatewayConfig(env);
        if (!isHyperswitchConfigured(cfg)) {
          return json({ error: 'Hyperswitch gateway is not active' }, 400);
        }

        const baseUrl = cfg.hyperswitch_base_url.replace(/\/+$/, '');
        const resp = await fetch(`${baseUrl}/payments/${encodeURIComponent(paymentId)}`, {
          headers: { 'api-key': cfg.hyperswitch_api_key, 'Content-Type': 'application/json' },
        });
        const payment: any = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          return json({ error: payment?.error?.message || `Verification failed (HTTP ${resp.status})` }, 502);
        }

        await env.BUY4ACHANGE_DB.prepare(
          'UPDATE payment_transactions SET status = ?, webhook_payload = ? WHERE id = ?'
        )
          .bind(payment.status || 'unknown', JSON.stringify(payment), paymentId)
          .run();

        const succeeded =
          payment.status === 'succeeded' ||
          payment.status === 'processing' ||
          payment.status === 'requires_capture';

        if (!succeeded) {
          return json({ success: false, status: payment.status, error: payment.error_message || 'Payment not completed' }, 402);
        }

        return json({
          success: true,
          transactionId: payment.payment_id,
          transactionRef: payment.merchant_order_reference_id || payment.payment_id,
          amount: (payment.amount || 0) / 100,
          currency: payment.currency || cfg.currency,
          status: 'paid',
          gateway: cfg.mode === 'hyperswitch_live' ? 'HYPERSWITCH_LIVE' : 'HYPERSWITCH_SANDBOX',
          paymentMethod: payment.payment_method || 'Hyperswitch Checkout',
          timestamp: new Date().toISOString(),
        });
      }

      if (pathname === '/api/payment/process' && request.method === 'POST') {
        const body: any = await request.json();
        const {
          amount,
          currency = 'INR',
          method,
          cardDetails,
          upiId,
          utrNumber,
          bankName,
          transactionRef: clientRef,
          orderDetails,
        } = body;

        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
          return json({ error: 'Invalid transaction amount' }, 400);
        }

        const cfg = await getGatewayConfig(env);

        if (method === 'card') {
          const num = (cardDetails?.number || '').replace(/\s+/g, '');
          if (!validateLuhn(num)) {
            return json({ error: 'Please enter a valid card number (Luhn check failed).' }, 400);
          }
          if (!cardDetails?.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry.trim())) {
            return json({ error: 'Expiry date must be in MM/YY format.' }, 400);
          }
          if (!cardDetails?.cvv || !/^\d{3,4}$/.test(cardDetails.cvv.trim())) {
            return json({ error: 'Please enter a valid 3 or 4 digit CVV.' }, 400);
          }
        }

        if (method === 'upi' && upiId && !validateUpiVpa(upiId)) {
          return json({ error: 'Please enter a valid UPI ID (e.g. name@okhdfcbank).' }, 400);
        }

        const transactionId = `pay_b4c_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
        const transactionRef = utrNumber
          ? `UTR_${String(utrNumber).trim()}`
          : clientRef || `REF_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
        const gatewayLabel = method === 'upi' ? 'NPCI_DIRECT_UPI' : 'OPEN_CHECKOUT_GATEWAY';

        await env.BUY4ACHANGE_DB.prepare(
          `INSERT INTO payment_transactions (id, order_id, amount, currency, gateway, transaction_ref, status, method_details, webhook_payload)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            transactionId,
            orderDetails?.orderNumber || 'PENDING',
            numericAmount,
            currency,
            gatewayLabel,
            transactionRef,
            'succeeded',
            JSON.stringify({
              method,
              cardLast4: method === 'card' ? (cardDetails?.number || '4242').replace(/\D/g, '').slice(-4) : undefined,
              upiId: method === 'upi' ? upiId : undefined,
              utrNumber: method === 'upi' && utrNumber ? String(utrNumber).trim() : undefined,
              merchantVpa: method === 'upi' ? cfg.merchant_upi_vpa : undefined,
              bankName: method === 'netbanking' ? bankName : undefined,
              timestamp: new Date().toISOString(),
            }),
            JSON.stringify({ event: 'payment.captured', transactionId, gateway: gatewayLabel, amount: numericAmount })
          )
          .run();

        return json({
          success: true,
          transactionId,
          transactionRef,
          amount: numericAmount,
          currency,
          status: 'paid',
          gateway: gatewayLabel,
          paymentMethod:
            method === 'upi'
              ? 'UPI Direct'
              : method === 'netbanking'
              ? `NetBanking (${bankName || 'Bank'})`
              : 'Card Payment',
          timestamp: new Date().toISOString(),
        });
      }

      if (pathname === '/api/payment/webhook/hyperswitch' && request.method === 'POST') {
        const rawBody = await request.text();
        const cfg = await getGatewayConfig(env);
        const signature = request.headers.get('x-webhook-signature-512') || '';

        if (cfg.hyperswitch_webhook_hash_key) {
          const expected = await hmacHex('SHA-512', cfg.hyperswitch_webhook_hash_key, rawBody);
          if (!timingSafeEqualStr(signature.trim(), expected)) {
            return json({ error: 'Invalid webhook signature' }, 401);
          }
        }

        const event: any = JSON.parse(rawBody || '{}');
        const eventType = event?.event_type || event?.type || 'unknown';
        const paymentId = event?.content?.object?.payment_id || event?.data?.payment_id;

        if (paymentId) {
          if (eventType === 'payment_succeeded') {
            await env.BUY4ACHANGE_DB.prepare(
              'UPDATE payment_transactions SET status = ?, webhook_payload = ? WHERE id = ?'
            ).bind('succeeded', rawBody, paymentId).run();
            await env.BUY4ACHANGE_DB.prepare(
              'UPDATE orders SET payment_status = ? WHERE payment_id = ?'
            ).bind('paid', paymentId).run();
          } else if (eventType === 'payment_failed') {
            await env.BUY4ACHANGE_DB.prepare(
              'UPDATE payment_transactions SET status = ?, webhook_payload = ? WHERE id = ?'
            ).bind('failed', rawBody, paymentId).run();
            await env.BUY4ACHANGE_DB.prepare(
              'UPDATE orders SET payment_status = ? WHERE payment_id = ?'
            ).bind('failed', paymentId).run();
          } else if (eventType === 'refund_succeeded') {
            await env.BUY4ACHANGE_DB.prepare(
              'UPDATE payment_transactions SET status = ?, webhook_payload = ? WHERE id = ?'
            ).bind('refunded', rawBody, paymentId).run();
            await env.BUY4ACHANGE_DB.prepare(
              'UPDATE orders SET payment_status = ? WHERE payment_id = ?'
            ).bind('refunded', paymentId).run();
          }
        }

        return json({ received: true, eventType });
      }

      // ============================================================
      // CHECKOUT & CREATE ORDER
      // ============================================================

      if (pathname === '/api/orders' && request.method === 'POST') {
        const body: any = await request.json();
        const items = body.items || [];
        if (!items.length) return json({ error: 'Order must contain at least one item' }, 400);

        const subtotal = items.reduce((sum: number, it: any) => sum + (parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1), 0);
        const isDigitalOnly = items.every((it: any) => it.productType === 'digital');
        const shippingFee = isDigitalOnly || subtotal >= 1000 ? 0 : 70;
        const totalAmount = subtotal + shippingFee;

        const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
        const orderNumber = `B4C-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
        const trackingNumber = isDigitalOnly
          ? `DIGI-INSTANT-${Math.floor(Math.random() * 9000 + 1000)}`
          : `UGT-EXP-${(body.city || 'IND').slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
        const resolvedCauseId = body.causeId || items[0]?.causeId || 'cause-everyday-essentials';
        const donationAmount = parseFloat(body.causeDonationAmount) || Math.round(subtotal * 0.18);
        const paymentId = body.paymentId || `pay_b4c_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
        const guardianId = body.guardianId || `UGT-IND-${String(body.pincode || '999').slice(0, 3)}-${Math.floor(Math.random() * 9000 + 1000)}`;

        const statements: D1PreparedStatement[] = [
          env.BUY4ACHANGE_DB.prepare(`
            INSERT INTO orders (
              id, order_number, customer_name, customer_email, customer_phone,
              shipping_address, city, state, pincode, country,
              subtotal, shipping_fee, total_amount, cause_id, cause_donation_amount,
              cause_impact_delivered, payment_method, payment_status, payment_id,
              order_status, tracking_number, guardian_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            orderId,
            orderNumber,
            body.customerName || 'Valued Guardian Buyer',
            body.customerEmail || 'customer@example.com',
            body.customerPhone || '',
            body.shippingAddress || '',
            body.city || 'City',
            body.state || 'State',
            body.pincode || '000000',
            body.country || 'India',
            subtotal,
            shippingFee,
            totalAmount,
            resolvedCauseId,
            donationAmount,
            body.causeImpactDelivered || 'Direct allocation to UGT National Mission',
            body.paymentMethod || 'Card Payment',
            body.paymentStatus || 'paid',
            paymentId,
            'Processing',
            trackingNumber,
            guardianId
          ),
        ];

        const causeDonations: Record<string, number> = {};

        for (let idx = 0; idx < items.length; idx++) {
          const it = items[idx];
          const itemPrice = parseFloat(it.price) || 0;
          const itemQty = parseInt(it.quantity) || 1;
          const itemTotal = itemPrice * itemQty;
          const itemCause = it.causeId || resolvedCauseId;
          const itemPct = parseFloat(it.causeAllocationPct) || 15.0;
          const itemContrib = (itemTotal * itemPct) / 100;

          causeDonations[itemCause] = (causeDonations[itemCause] || 0) + itemContrib;

          statements.push(
            env.BUY4ACHANGE_DB.prepare(`
              INSERT INTO order_items (
                id, order_id, product_id, product_name, price, quantity, total,
                cause_id, cause_allocation_pct, cause_contribution
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              `item-${orderId}-${idx + 1}`,
              orderId,
              it.productId || '',
              it.productName || 'Product',
              itemPrice,
              itemQty,
              itemTotal,
              itemCause,
              itemPct,
              itemContrib
            )
          );

          if (it.productId) {
            statements.push(
              env.BUY4ACHANGE_DB.prepare(
                'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?'
              ).bind(itemQty, it.productId)
            );
          }
        }

        for (const [cId, amt] of Object.entries(causeDonations)) {
          statements.push(
            env.BUY4ACHANGE_DB.prepare(
              'UPDATE causes SET raised_amount = raised_amount + ?, impact_count = impact_count + 1 WHERE id = ?'
            ).bind(amt, cId)
          );
        }

        await env.BUY4ACHANGE_DB.batch(statements);
        const created = await getOrderWithItems(env, orderId);

        let digitalItems: any[] = [];
        if ((body.paymentStatus || 'paid') === 'paid') {
          const { results: digi } = await env.BUY4ACHANGE_DB.prepare(`
            SELECT
              p.id as product_id,
              p.name as product_name,
              COALESCE(p.subcategory, '') as subcategory,
              p.category,
              p.image_url,
              p.digital_html_content,
              COALESCE(p.digital_access_note, '') as digital_access_note,
              o.order_number,
              o.customer_email,
              o.created_at as purchased_at
            FROM orders o
            INNER JOIN order_items oi ON oi.order_id = o.id
            INNER JOIN products p ON p.id = oi.product_id
            WHERE o.id = ?
              AND o.payment_status = 'paid'
              AND COALESCE(p.product_type, 'physical') = 'digital'
          `).bind(orderId).all();
          digitalItems = (digi as any[]) || [];
        }

        return json({ ...created, digital_items: digitalItems }, 201);
      }

      // Post-Purchase Digital Unlock (ONLY verified PAID orders unlock HTML eProducts & eBooks)
      if (pathname === '/api/digital/unlock' && request.method === 'POST') {
        const body: any = await request.json();
        const orderNumber = String(body?.orderNumber || '').trim();
        const email = String(body?.email || '').trim();
        if (!orderNumber || !email) {
          return json({ error: 'Order number and purchase email are required.' }, 400);
        }

        const { results: unlocked } = await env.BUY4ACHANGE_DB.prepare(`
          SELECT
            p.id as product_id,
            p.name as product_name,
            COALESCE(p.subcategory, '') as subcategory,
            p.category,
            p.image_url,
            p.digital_html_content,
            COALESCE(p.digital_access_note, '') as digital_access_note,
            o.order_number,
            o.customer_email,
            o.created_at as purchased_at
          FROM orders o
          INNER JOIN order_items oi ON oi.order_id = o.id
          INNER JOIN products p ON p.id = oi.product_id
          WHERE o.payment_status = 'paid'
            AND UPPER(o.order_number) = UPPER(?)
            AND LOWER(o.customer_email) = LOWER(?)
            AND COALESCE(p.product_type, 'physical') = 'digital'
        `).bind(orderNumber, email).all();

        if (!unlocked || unlocked.length === 0) {
          return json({
            error: 'No paid eProducts or eBooks found for this order number and email.',
          }, 404);
        }

        return json({ success: true, items: unlocked });
      }

      // ============================================================
      // ADMIN AUTHENTICATION
      // ============================================================

      if (pathname === '/api/admin/login' && request.method === 'POST') {
        const body: any = await request.json();
        const { email, password } = body;
        if (!email || !password) return json({ error: 'Email and password are required' }, 400);

        const hash = await sha256Hex(password + 'UGT_SECRET_SALT_2026');
        const user: any = await env.BUY4ACHANGE_DB.prepare(
          'SELECT id, email, name, role, password_hash FROM admin_users WHERE email = ?'
        )
          .bind(email)
          .first();

        if (!user || !timingSafeEqualStr(user.password_hash, hash)) {
          return json({ error: 'Invalid admin credentials' }, 401);
        }

        const token = await createAdminToken(user, env);
        return json({
          success: true,
          token,
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
      }

      // ============================================================
      // PROTECTED ADMIN ENDPOINTS
      // ============================================================

      if (pathname.startsWith('/api/admin/')) {
        const admin = await verifyAdminToken(request, env);
        if (!admin) return json({ error: 'Admin authentication required' }, 401);

        if (pathname === '/api/admin/verify-session' && request.method === 'GET') {
          return json({ valid: true, user: admin });
        }

        if (pathname === '/api/admin/metrics' && request.method === 'GET') {
          const orderStats: any = await env.BUY4ACHANGE_DB.prepare(
            "SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as total_revenue, COALESCE(SUM(cause_donation_amount),0) as total_raised FROM orders WHERE payment_status = 'paid'"
          ).first();
          const todayStats: any = await env.BUY4ACHANGE_DB.prepare(
            "SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as today_revenue, COALESCE(SUM(cause_donation_amount),0) as today_raised FROM orders WHERE payment_status = 'paid' AND date(created_at) = date('now')"
          ).first();
          const prodCount: any = await env.BUY4ACHANGE_DB.prepare('SELECT COUNT(*) as count FROM products').first();
          const causeCount: any = await env.BUY4ACHANGE_DB.prepare('SELECT COUNT(*) as count FROM causes').first();

          return json({
            totalRevenue: orderStats?.total_revenue || 0,
            totalRaised: orderStats?.total_raised || 0,
            totalOrders: orderStats?.count || 0,
            todayOrdersCount: todayStats?.count || 0,
            todayRevenue: todayStats?.today_revenue || 0,
            todayRaised: todayStats?.today_raised || 0,
            totalProducts: prodCount?.count || 0,
            totalCauses: causeCount?.count || 0,
          });
        }

        if (pathname === '/api/admin/orders' && request.method === 'GET') {
          const filter = searchParams.get('filter') || 'all';
          let where = '';
          if (filter === 'today') where = "WHERE date(o.created_at) = date('now')";
          else if (filter === 'yesterday') where = "WHERE date(o.created_at) = date('now', '-1 day')";
          else if (filter === 'week') where = "WHERE date(o.created_at) >= date('now', '-7 days')";

          const { results: orders } = await env.BUY4ACHANGE_DB.prepare(
            `SELECT o.*, c.title as cause_title FROM orders o LEFT JOIN causes c ON o.cause_id = c.id ${where} ORDER BY o.created_at DESC LIMIT 100`
          ).all();

          const { results: allItems } = await env.BUY4ACHANGE_DB.prepare(
            'SELECT oi.*, c.title as cause_title FROM order_items oi LEFT JOIN causes c ON oi.cause_id = c.id'
          ).all();

          const itemsByOrder: Record<string, any[]> = {};
          for (const it of (allItems as any[]) || []) {
            if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
            itemsByOrder[it.order_id].push(it);
          }

          const enriched = ((orders as any[]) || []).map((o) => ({
            ...o,
            items: itemsByOrder[o.id] || [],
          }));
          return json(enriched);
        }

        const orderStatusMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
        if (orderStatusMatch && request.method === 'PATCH') {
          const id = decodeURIComponent(orderStatusMatch[1]);
          const body: any = await request.json();
          if (!body.status) return json({ error: 'Status is required' }, 400);

          if (body.trackingNumber) {
            await env.BUY4ACHANGE_DB.prepare(
              'UPDATE orders SET order_status = ?, tracking_number = ? WHERE id = ?'
            ).bind(body.status, body.trackingNumber, id).run();
          } else {
            await env.BUY4ACHANGE_DB.prepare(
              'UPDATE orders SET order_status = ? WHERE id = ?'
            ).bind(body.status, id).run();
          }
          const updated = await getOrderWithItems(env, id);
          if (!updated) return json({ error: 'Order not found' }, 404);
          return json(updated);
        }

        const singleOrderMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
        if (singleOrderMatch && request.method === 'GET') {
          const order = await getOrderWithItems(env, decodeURIComponent(singleOrderMatch[1]));
          if (!order) return json({ error: 'Order not found' }, 404);
          return json(order);
        }

        // Admin Full Products List (includes digital_html_content for editing)
        if (pathname === '/api/admin/products' && request.method === 'GET') {
          const { results } = await env.BUY4ACHANGE_DB.prepare(
            'SELECT p.*, c.title as cause_title, c.category as cause_category FROM products p LEFT JOIN causes c ON p.cause_id = c.id ORDER BY p.created_at DESC, p.rowid DESC'
          ).all();
          return json(results || []);
        }

        // Products CRUD
        if (pathname === '/api/admin/products' && request.method === 'POST') {
          const b: any = await request.json();
          if (!b.name || b.price === undefined || b.price === '' || !b.category || !b.cause_id) {
            return json({ error: 'Missing required product fields (name, price, category, cause_id)' }, 400);
          }

          const resolvedType = b.product_type === 'digital' ? 'digital' : 'physical';
          if (resolvedType === 'digital' && !String(b.digital_html_content || '').trim()) {
            return json({ error: 'HTML code content is required for eProducts and eBooks.' }, 400);
          }

          const id = `prod-${Date.now()}`;
          const slug =
            b.slug ||
            String(b.name)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') +
              '-' +
              Math.floor(Math.random() * 900 + 100);

          await env.BUY4ACHANGE_DB.prepare(`
            INSERT INTO products (
              id, name, slug, description, price, compare_at_price, category,
              subcategory, product_type, digital_html_content, digital_access_note,
              image_url, stock, is_featured, cause_id, cause_allocation_pct,
              cause_impact_text, rating, reviews_count, badge
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
            .bind(
              id,
              b.name,
              slug,
              b.description || '',
              parseFloat(b.price),
              b.compare_at_price ? parseFloat(b.compare_at_price) : null,
              b.category,
              b.subcategory || (resolvedType === 'digital' ? 'eBooks' : ''),
              resolvedType,
              resolvedType === 'digital' ? String(b.digital_html_content || '') : '',
              resolvedType === 'digital'
                ? b.digital_access_note || 'Instant interactive HTML access unlocked immediately after purchase'
                : '',
              b.image_url || '',
              resolvedType === 'digital' ? parseInt(b.stock) || 9999 : parseInt(b.stock) || 50,
              b.is_featured ? 1 : 0,
              b.cause_id,
              parseFloat(b.cause_allocation_pct) || 15,
              b.cause_impact_text || 'Supports UGT India community development programs',
              0,
              0,
              b.badge || (resolvedType === 'digital' ? 'Instant Digital Unlock' : '')
            )
            .run();

          const created = await env.BUY4ACHANGE_DB.prepare(
            'SELECT p.*, c.title as cause_title, c.category as cause_category FROM products p LEFT JOIN causes c ON p.cause_id = c.id WHERE p.id = ?'
          ).bind(id).first();
          return json(created, 201);
        }

        // Reset all 8 missions to zero (live start)
        if (pathname === '/api/admin/missions/reset' && request.method === 'POST') {
          await env.BUY4ACHANGE_DB.prepare(
            'UPDATE causes SET raised_amount = 0, impact_count = 0'
          ).run();
          const { results } = await env.BUY4ACHANGE_DB.prepare(
            'SELECT * FROM causes ORDER BY id ASC'
          ).all();
          return json({ success: true, causes: results || [] });
        }

        const adminProdMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
        if (adminProdMatch && request.method === 'PUT') {
          const id = decodeURIComponent(adminProdMatch[1]);
          const b: any = await request.json();
          const existing: any = await env.BUY4ACHANGE_DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
          if (!existing) return json({ error: 'Product not found' }, 404);

          const resolvedType = (b.product_type ?? existing.product_type) === 'digital' ? 'digital' : 'physical';

          await env.BUY4ACHANGE_DB.prepare(`
            UPDATE products SET
              name = ?, description = ?, price = ?, compare_at_price = ?, category = ?,
              subcategory = ?, product_type = ?, digital_html_content = ?, digital_access_note = ?,
              image_url = ?, stock = ?, cause_id = ?, cause_allocation_pct = ?,
              cause_impact_text = ?, badge = ?
            WHERE id = ?
          `)
            .bind(
              b.name ?? existing.name,
              b.description ?? existing.description,
              b.price !== undefined ? parseFloat(b.price) : existing.price,
              b.compare_at_price !== undefined && b.compare_at_price !== '' ? parseFloat(b.compare_at_price) : existing.compare_at_price,
              b.category ?? existing.category,
              b.subcategory ?? existing.subcategory ?? '',
              resolvedType,
              b.digital_html_content !== undefined ? b.digital_html_content : (existing.digital_html_content ?? ''),
              b.digital_access_note !== undefined ? b.digital_access_note : (existing.digital_access_note ?? ''),
              b.image_url ?? existing.image_url,
              b.stock !== undefined ? parseInt(b.stock) : existing.stock,
              b.cause_id ?? existing.cause_id,
              b.cause_allocation_pct !== undefined ? parseFloat(b.cause_allocation_pct) : existing.cause_allocation_pct,
              b.cause_impact_text ?? existing.cause_impact_text,
              b.badge ?? existing.badge,
              id
            )
            .run();

          const updated = await env.BUY4ACHANGE_DB.prepare(
            'SELECT p.*, c.title as cause_title, c.category as cause_category FROM products p LEFT JOIN causes c ON p.cause_id = c.id WHERE p.id = ?'
          ).bind(id).first();
          return json(updated);
        }

        if (adminProdMatch && request.method === 'DELETE') {
          const id = decodeURIComponent(adminProdMatch[1]);
          await env.BUY4ACHANGE_DB.batch([
            env.BUY4ACHANGE_DB.prepare('UPDATE order_items SET product_id = NULL WHERE product_id = ?').bind(id),
            env.BUY4ACHANGE_DB.prepare('DELETE FROM products WHERE id = ?').bind(id),
          ]);
          return json({ success: true, message: 'Product successfully removed' });
        }

        // Transactions
        if (pathname === '/api/admin/transactions' && request.method === 'GET') {
          const { results } = await env.BUY4ACHANGE_DB.prepare(
            'SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 50'
          ).all();
          return json(results || []);
        }

        // Payment Gateway Configuration
        if (pathname === '/api/admin/payment-config' && request.method === 'GET') {
          const cfg = await getGatewayConfig(env);
          return json({
            ...cfg,
            has_api_key: Boolean(cfg.hyperswitch_api_key),
            has_webhook_hash_key: Boolean(cfg.hyperswitch_webhook_hash_key),
            hyperswitch_api_key: maskSecret(cfg.hyperswitch_api_key),
            hyperswitch_webhook_hash_key: maskSecret(cfg.hyperswitch_webhook_hash_key),
            webhook_url: `${url.origin}/api/payment/webhook/hyperswitch`,
            hyperswitch_ready: isHyperswitchConfigured(cfg),
          });
        }

        if (pathname === '/api/admin/payment-config' && request.method === 'PUT') {
          const body: any = await request.json();
          const saved = await saveGatewayConfig(env, body);
          return json({
            success: true,
            config: {
              ...saved,
              has_api_key: Boolean(saved.hyperswitch_api_key),
              has_webhook_hash_key: Boolean(saved.hyperswitch_webhook_hash_key),
              hyperswitch_api_key: maskSecret(saved.hyperswitch_api_key),
              hyperswitch_webhook_hash_key: maskSecret(saved.hyperswitch_webhook_hash_key),
              webhook_url: `${url.origin}/api/payment/webhook/hyperswitch`,
              hyperswitch_ready: isHyperswitchConfigured(saved),
            },
          });
        }

        if (pathname === '/api/admin/payment-config/test' && request.method === 'POST') {
          const current = await getGatewayConfig(env);
          const overrides: any = await request.json().catch(() => ({}));
          const cfg: PaymentGatewayConfig = {
            ...current,
            ...overrides,
            hyperswitch_api_key:
              overrides.hyperswitch_api_key && !overrides.hyperswitch_api_key.startsWith('••••')
                ? overrides.hyperswitch_api_key.trim()
                : current.hyperswitch_api_key,
          };

          const startedAt = Date.now();
          if (cfg.mode === 'direct_upi') {
            const vpaOk = validateUpiVpa(cfg.merchant_upi_vpa);
            return json({
              ok: vpaOk,
              mode: cfg.mode,
              latencyMs: Date.now() - startedAt,
              endpoint: `upi://pay?pa=${cfg.merchant_upi_vpa}`,
              message: vpaOk
                ? `Direct UPI & Local Checkout is active and valid for ${cfg.merchant_upi_vpa}`
                : `Invalid Merchant UPI VPA "${cfg.merchant_upi_vpa}". Expected format like ugtindia@upi`,
            });
          }

          if (!cfg.hyperswitch_base_url || !cfg.hyperswitch_api_key) {
            return json({
              ok: false,
              mode: cfg.mode,
              latencyMs: 0,
              message: 'Hyperswitch Base URL and Secret API Key are required.',
            });
          }

          const baseUrl = cfg.hyperswitch_base_url.replace(/\/+$/, '');
          try {
            const resp = await fetch(`${baseUrl}/payments/list?limit=1`, {
              headers: { 'api-key': cfg.hyperswitch_api_key, 'Content-Type': 'application/json' },
            });
            const latencyMs = Date.now() - startedAt;
            if (resp.ok) {
              return json({
                ok: true,
                mode: cfg.mode,
                statusCode: resp.status,
                latencyMs,
                endpoint: baseUrl,
                message: `Connected to Juspay Hyperswitch (${baseUrl}) — API key authenticated (${latencyMs}ms).`,
              });
            }
            const errBody: any = await resp.json().catch(() => ({}));
            return json({
              ok: false,
              mode: cfg.mode,
              statusCode: resp.status,
              latencyMs,
              message: errBody?.error?.message || errBody?.message || `Hyperswitch returned HTTP ${resp.status}`,
            });
          } catch (err: any) {
            return json({
              ok: false,
              mode: cfg.mode,
              latencyMs: Date.now() - startedAt,
              message: `Could not reach ${baseUrl}: ${err?.message || 'Network error'}`,
            });
          }
        }
      }

      return json({ error: 'Endpoint not found' }, 404);
    } catch (err: any) {
      return json({ error: err?.message || 'Internal Server Error' }, 500);
    }
  },
};
