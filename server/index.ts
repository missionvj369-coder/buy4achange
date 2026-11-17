import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAllCauses,
  getCauseById,
  resetAllCausesToZero,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUnlockedDigitalItemsByOrder,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  verifyOrderPayment,
  getTransactionById,
  getTransactionByUtr,
  getMetrics,
  recordTransaction,
  getTransactions,
  updateTransactionStatus,
  updateOrderPaymentStatusByPaymentId,
  getGatewayConfig,
  saveGatewayConfig,
  verifyAdminLogin,
  validateAdminToken
} from './db.ts';
import {
  maskSecret,
  getHyperswitchSdkUrl,
  isHyperswitchConfigured,
  validateLuhn,
  validateUpiVpa,
  buildUpiPaymentUri,
  createHyperswitchPaymentIntent,
  retrieveHyperswitchPayment,
  verifyHyperswitchWebhookSignature,
  testGatewayConnection
} from './paymentGateway.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(
  express.json({
    limit: '5mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

// Disable caching on all API endpoints so live inventory & mission updates reflect immediately
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Admin Auth Middleware
const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const token = authHeader.split(' ')[1];
  if (!validateAdminToken(token)) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  next();
};

// --- Public Endpoints ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Buy4AChange API',
    version: '2.0.0',
    philosophy: 'Universal Guard Trust (ugtindia.space) 8 National Missions',
    database: 'SQLite (Cloudflare D1 Ready)',
    paymentSwitch: 'Active'
  });
});

// Causes (The 8 Official UGT India National Missions)
app.get('/api/causes', (req, res) => {
  try {
    const causes = getAllCauses();
    res.json(causes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/causes/:id', (req, res) => {
  try {
    const cause = getCauseById(req.params.id);
    if (!cause) return res.status(404).json({ error: 'Mission not found' });
    res.json(cause);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products
app.get('/api/products', (req, res) => {
  try {
    const { category, search } = req.query;
    const products = getAllProducts(category as string, search as string);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Open-Source Payment Gateway Public Endpoints ---

// Safe public checkout configuration (never exposes secret keys)
app.get('/api/payment/config/public', (req, res) => {
  try {
    const cfg = getGatewayConfig();
    const hyperswitchActive = isHyperswitchConfigured(cfg);
    res.json({
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Payment Intent (Juspay Hyperswitch API OR Direct UPI Intent)
app.post('/api/payment/create-intent', async (req, res) => {
  try {
    const { amount, currency, customerName, customerEmail, customerPhone, causeId, description } = req.body;
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid transaction amount' });
    }

    const cfg = getGatewayConfig();
    const orderRef = `B4C_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;

    if (isHyperswitchConfigured(cfg)) {
      const intent = await createHyperswitchPaymentIntent(cfg, {
        amount: numericAmount,
        currency: currency || cfg.currency,
        customerName,
        customerEmail,
        customerPhone,
        causeId,
        orderRef,
        description,
      });

      recordTransaction({
        id: intent.paymentId,
        order_id: orderRef,
        amount: numericAmount,
        currency: intent.currency,
        gateway: cfg.mode === 'hyperswitch_live' ? 'HYPERSWITCH_LIVE' : 'HYPERSWITCH_SANDBOX',
        transaction_ref: orderRef,
        status: intent.status || 'requires_payment_method',
        method_details: JSON.stringify({
          provider: 'juspay/hyperswitch',
          endpoint: intent.backendUrl,
          createdAt: new Date().toISOString(),
        }),
      });

      return res.json({
        success: true,
        provider: 'hyperswitch',
        ...intent,
        transactionRef: orderRef,
      });
    }

    // Direct UPI + Local Open Checkout Intent
    const intentId = `pi_b4c_${crypto.randomBytes(8).toString('hex')}`;
    const upiUri = buildUpiPaymentUri({
      vpa: cfg.merchant_upi_vpa,
      merchantName: cfg.merchant_name,
      amount: numericAmount,
      transactionRef: orderRef,
      note: description || 'Buy4AChange UGT Mission Order',
      currency: currency || cfg.currency,
    });

    res.json({
      success: true,
      provider: 'direct_upi',
      paymentId: intentId,
      transactionRef: orderRef,
      amount: numericAmount,
      currency: currency || cfg.currency,
      upiUri,
      merchantUpiVpa: cfg.merchant_upi_vpa,
      merchantName: cfg.merchant_name,
    });
  } catch (err: any) {
    console.error('Create intent error:', err);
    res.status(502).json({ error: err.message || 'Failed to initialize payment gateway' });
  }
});

// Verify & Confirm Hyperswitch Payment Server-Side
app.post('/api/payment/confirm', async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId is required' });
    }

    const cfg = getGatewayConfig();
    if (!isHyperswitchConfigured(cfg)) {
      return res.status(400).json({ error: 'Hyperswitch gateway is not active' });
    }

    const payment = await retrieveHyperswitchPayment(cfg, paymentId);
    const succeeded =
      payment.status === 'succeeded' ||
      payment.status === 'processing' ||
      payment.status === 'requires_capture';

    updateTransactionStatus(paymentId, payment.status, JSON.stringify(payment));

    if (!succeeded) {
      return res.status(402).json({
        success: false,
        status: payment.status,
        error: payment.error_message || `Payment status is ${payment.status}`,
      });
    }

    res.json({
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Direct UPI Payment Submission Endpoint (Strict Real Verification — NO fake auto-paid approvals!)
app.post('/api/payment/process', async (req, res) => {
  try {
    const { amount, currency = 'INR', method, upiId, utrNumber, orderDetails } = req.body;
    const numericAmount = parseFloat(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid transaction amount' });
    }

    const cfg = getGatewayConfig();

    // NEVER fake-approve Card or NetBanking when no live Hyperswitch processor is connected
    if (method === 'card' || method === 'netbanking') {
      return res.status(400).json({
        error:
          'Card and NetBanking require a live payment gateway (Hyperswitch) configured in Admin → Payment Gateway. Please pay via Direct UPI and submit your 12-digit UTR reference.',
      });
    }

    if (method !== 'upi') {
      return res.status(400).json({ error: 'Unsupported payment method. Please use Direct UPI.' });
    }

    const cleanUtr = String(utrNumber || '').replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanUtr)) {
      return res.status(400).json({
        error: 'Please complete your UPI payment first and enter the exact 12-digit UTR / Reference Number from your UPI app receipt.',
      });
    }

    if (upiId && !validateUpiVpa(upiId)) {
      return res.status(400).json({ error: 'Please enter a valid UPI ID (e.g. name@okhdfcbank).' });
    }

    const utrRef = `UTR_${cleanUtr}`;
    const existingUtr = getTransactionByUtr(utrRef);
    if (existingUtr) {
      return res.status(409).json({
        error: 'This 12-digit UTR reference number has already been submitted for an order.',
      });
    }

    const transactionId = `upi_${crypto.randomBytes(8).toString('hex')}`;

    // Record in Payment Ledger as PENDING VERIFICATION (admin verifies actual bank credit)
    recordTransaction({
      id: transactionId,
      order_id: orderDetails?.orderNumber || 'PENDING',
      amount: numericAmount,
      currency,
      gateway: 'NPCI_DIRECT_UPI',
      transaction_ref: utrRef,
      status: 'pending_verification',
      method_details: JSON.stringify({
        method: 'upi',
        upiId: upiId || undefined,
        utrNumber: cleanUtr,
        merchantVpa: cfg.merchant_upi_vpa,
        timestamp: new Date().toISOString()
      }),
      webhook_payload: JSON.stringify({
        event: 'upi.utr_submitted',
        transactionId,
        utrNumber: cleanUtr,
        amount: numericAmount
      })
    });

    res.json({
      success: true,
      transactionId,
      transactionRef: utrRef,
      utrNumber: cleanUtr,
      amount: numericAmount,
      currency,
      status: 'pending_verification',
      gateway: 'NPCI_DIRECT_UPI',
      paymentMethod: `Direct UPI (UTR: ${cleanUtr})`,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Juspay Hyperswitch Webhook Receiver (HMAC-SHA512 Verified)
app.post('/api/payment/webhook/hyperswitch', (req: any, res) => {
  try {
    const cfg = getGatewayConfig();
    const signature = req.headers['x-webhook-signature-512'] as string | undefined;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    if (cfg.hyperswitch_webhook_hash_key) {
      const valid = verifyHyperswitchWebhookSignature(
        rawBody,
        signature,
        cfg.hyperswitch_webhook_hash_key
      );
      if (!valid) {
        console.warn('[Webhook] Invalid X-Webhook-Signature-512 rejected');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body;
    const eventType = event?.event_type || event?.type || 'unknown';
    const paymentId = event?.content?.object?.payment_id || event?.data?.payment_id;

    console.log(`[Webhook] Hyperswitch event=${eventType} paymentId=${paymentId}`);

    if (paymentId) {
      if (eventType === 'payment_succeeded') {
        updateTransactionStatus(paymentId, 'succeeded', rawBody);
        updateOrderPaymentStatusByPaymentId(paymentId, 'paid');
      } else if (eventType === 'payment_failed') {
        updateTransactionStatus(paymentId, 'failed', rawBody);
        updateOrderPaymentStatusByPaymentId(paymentId, 'failed');
      } else if (eventType === 'refund_succeeded') {
        updateTransactionStatus(paymentId, 'refunded', rawBody);
        updateOrderPaymentStatusByPaymentId(paymentId, 'refunded');
      }
    }

    res.status(200).json({ received: true, eventType });
  } catch (err: any) {
    console.error('[Webhook] Error processing Hyperswitch webhook:', err);
    res.status(500).json({ error: err.message });
  }
});

// Checkout & Create Order
app.post('/api/orders', (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      state,
      pincode,
      country = 'India',
      items,
      causeId,
      causeDonationAmount,
      causeImpactDelivered,
      paymentMethod,
      paymentStatus = 'paid',
      paymentId,
      guardianId
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // STRICT SERVER-SIDE PAYMENT VERIFICATION: Never trust client-supplied paymentStatus!
    if (!paymentId) {
      return res.status(402).json({ error: 'Payment transaction reference is required before creating an order.' });
    }
    const tx = getTransactionById(paymentId);
    if (!tx) {
      return res.status(402).json({ error: 'Payment record not found. Please complete payment first.' });
    }
    const verifiedPaymentStatus = tx.status === 'succeeded' ? 'paid' : 'pending_verification';
    const initialOrderStatus = verifiedPaymentStatus === 'paid' ? 'Confirmed' : 'Pending Payment Verification';

    const subtotal = items.reduce((sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1), 0);
    const isDigitalOnly = items.every((it: any) => it.productType === 'digital');
    const shippingFee = isDigitalOnly || subtotal >= 1000 ? 0 : 70;
    const totalAmount = subtotal + shippingFee;

    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const orderNumber = `B4C-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    const resolvedCauseId = causeId || items[0]?.causeId || 'cause-everyday-essentials';

    const orderData = {
      id: orderId,
      order_number: orderNumber,
      customer_name: customerName || 'Customer',
      customer_email: customerEmail || '',
      customer_phone: customerPhone || '',
      shipping_address: shippingAddress || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      country: country || 'India',
      subtotal,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      cause_id: resolvedCauseId,
      cause_donation_amount: causeDonationAmount || Math.round(subtotal * 0.15),
      cause_impact_delivered: causeImpactDelivered || 'Direct allocation to Living India Mission',
      payment_method: paymentMethod || 'Direct UPI',
      payment_status: verifiedPaymentStatus,
      payment_id: tx.transaction_ref || paymentId,
      order_status: initialOrderStatus,
      tracking_number: '',
      guardian_id: ''
    };

    const orderItems = items.map((it: any, index: number) => {
      const itemPrice = parseFloat(it.price) || 0;
      const itemQty = parseInt(it.quantity) || 1;
      const itemTotal = itemPrice * itemQty;
      const itemCause = it.causeId || resolvedCauseId;
      const itemPct = parseFloat(it.causeAllocationPct) || 15.0;

      return {
        id: `item-${orderId}-${index + 1}`,
        product_id: it.productId,
        product_name: it.productName || 'Product',
        price: itemPrice,
        quantity: itemQty,
        total: itemTotal,
        cause_id: itemCause,
        cause_allocation_pct: itemPct,
        cause_contribution: (itemTotal * itemPct) / 100
      };
    });

    const created = createOrder(orderData, orderItems);
    const digitalItems =
      verifiedPaymentStatus === 'paid'
        ? getUnlockedDigitalItemsByOrder(orderNumber, customerEmail)
        : [];
    res.status(201).json({ ...created, digital_items: digitalItems });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message });
  }
});

// Post-Purchase Digital Unlock Endpoint (HTML eProducts & eBooks ONLY after verified paid order!)
app.post('/api/digital/unlock', (req, res) => {
  try {
    const { orderNumber, email } = req.body || {};
    if (!orderNumber || !email) {
      return res.status(400).json({ error: 'Order number and purchase email are required.' });
    }
    const unlocked = getUnlockedDigitalItemsByOrder(orderNumber, email);
    if (!unlocked || unlocked.length === 0) {
      return res.status(404).json({
        error: 'No paid eProducts or eBooks found for this order number and email.',
      });
    }
    res.json({ success: true, items: unlocked });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin Authentication Endpoint ---
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const auth = verifyAdminLogin(email, password);
    if (!auth) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    res.json({
      success: true,
      token: auth.token,
      user: auth.user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/verify-session', requireAdminAuth, (req, res) => {
  res.json({ valid: true });
});

// --- Protected Admin Endpoints ---

// Metrics
app.get('/api/admin/metrics', requireAdminAuth, (req, res) => {
  try {
    const metrics = getMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Daily Orders
app.get('/api/admin/orders', requireAdminAuth, (req, res) => {
  try {
    const filter = (req.query.filter as 'today' | 'yesterday' | 'week' | 'all') || 'all';
    const orders = getAllOrders(filter);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders/:id', requireAdminAuth, (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status
app.patch('/api/admin/orders/:id/status', requireAdminAuth, (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = updateOrderStatus(req.params.id, status, trackingNumber);
    if (!updated) return res.status(404).json({ error: 'Order not found' });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Verify / Reject Pending Direct UPI Payment
app.post('/api/admin/orders/:id/verify-payment', requireAdminAuth, (req, res) => {
  try {
    const action = req.body?.action === 'reject' ? 'reject' : 'approve';
    const updated = verifyOrderPayment(req.params.id, action);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Full Products List (includes digital_html_content for editing)
app.get('/api/admin/products', requireAdminAuth, (_req, res) => {
  try {
    res.json(getAllProductsAdmin());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Product Management (CRUD)
app.post('/api/admin/products', requireAdminAuth, (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      compare_at_price,
      category,
      subcategory,
      product_type,
      digital_html_content,
      digital_access_note,
      image_url,
      stock,
      is_featured,
      cause_id,
      cause_allocation_pct,
      cause_impact_text,
      badge
    } = req.body;

    if (!name || price === undefined || price === '' || !category || !cause_id) {
      return res.status(400).json({ error: 'Missing required product fields (name, price, category, cause_id)' });
    }

    const resolvedType = product_type === 'digital' ? 'digital' : 'physical';
    if (resolvedType === 'digital' && !String(digital_html_content || '').trim()) {
      return res.status(400).json({ error: 'HTML code content is required for eProducts and eBooks.' });
    }

    const id = `prod-${Date.now()}`;
    const generatedSlug =
      slug ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
        '-' +
        Math.floor(Math.random() * 900 + 100);

    const newProduct = createProduct({
      id,
      name,
      slug: generatedSlug,
      description: description || '',
      price: parseFloat(price),
      compare_at_price: compare_at_price ? parseFloat(compare_at_price) : undefined,
      category,
      subcategory: subcategory || (resolvedType === 'digital' ? 'eBooks' : ''),
      product_type: resolvedType,
      digital_html_content: resolvedType === 'digital' ? String(digital_html_content || '') : '',
      digital_access_note:
        resolvedType === 'digital'
          ? digital_access_note || 'Instant interactive HTML access unlocked immediately after purchase'
          : '',
      image_url: image_url || '',
      stock: resolvedType === 'digital' ? parseInt(stock) || 9999 : parseInt(stock) || 50,
      is_featured: is_featured ? 1 : 0,
      cause_id,
      cause_allocation_pct: parseFloat(cause_allocation_pct) || 15,
      cause_impact_text: cause_impact_text || 'Supports UGT India community development programs',
      rating: 0,
      reviews_count: 0,
      badge: badge || (resolvedType === 'digital' ? 'Instant Digital Unlock' : '')
    });

    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset all 8 missions to zero (live start)
app.post('/api/admin/missions/reset', requireAdminAuth, (_req, res) => {
  try {
    const causes = resetAllCausesToZero();
    res.json({ success: true, causes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', requireAdminAuth, (req, res) => {
  try {
    const updated = updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', requireAdminAuth, (req, res) => {
  try {
    deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product successfully removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions Ledger
app.get('/api/admin/transactions', requireAdminAuth, (req, res) => {
  try {
    const txs = getTransactions();
    res.json(txs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Payment Gateway Configuration
app.get('/api/admin/payment-config', requireAdminAuth, (req, res) => {
  try {
    const cfg = getGatewayConfig();
    res.json({
      ...cfg,
      hyperswitch_api_key_masked: maskSecret(cfg.hyperswitch_api_key),
      hyperswitch_webhook_hash_key_masked: maskSecret(cfg.hyperswitch_webhook_hash_key),
      has_api_key: Boolean(cfg.hyperswitch_api_key),
      has_webhook_hash_key: Boolean(cfg.hyperswitch_webhook_hash_key),
      hyperswitch_api_key: maskSecret(cfg.hyperswitch_api_key),
      hyperswitch_webhook_hash_key: maskSecret(cfg.hyperswitch_webhook_hash_key),
      webhook_url: `${req.protocol}://${req.get('host')}/api/payment/webhook/hyperswitch`,
      hyperswitch_ready: isHyperswitchConfigured(cfg),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/payment-config', requireAdminAuth, (req, res) => {
  try {
    const saved = saveGatewayConfig(req.body);
    res.json({
      success: true,
      config: {
        ...saved,
        hyperswitch_api_key: maskSecret(saved.hyperswitch_api_key),
        hyperswitch_webhook_hash_key: maskSecret(saved.hyperswitch_webhook_hash_key),
        has_api_key: Boolean(saved.hyperswitch_api_key),
        has_webhook_hash_key: Boolean(saved.hyperswitch_webhook_hash_key),
        hyperswitch_ready: isHyperswitchConfigured(saved),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/payment-config/test', requireAdminAuth, async (req, res) => {
  try {
    const current = getGatewayConfig();
    // Allow testing unsaved form values if passed, keeping stored secret if masked
    const overrides = req.body || {};
    const testCfg = {
      ...current,
      ...overrides,
      hyperswitch_api_key:
        overrides.hyperswitch_api_key && !overrides.hyperswitch_api_key.startsWith('••••')
          ? overrides.hyperswitch_api_key.trim()
          : current.hyperswitch_api_key,
    };
    const result = await testGatewayConnection(testCfg);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Cloudflare D1 Export
app.get('/api/admin/cloudflare/export-d1', requireAdminAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="buy4achange_cloudflare_d1.sql"');
  
  const causes = getAllCauses();
  const products = getAllProducts();
  
  let sql = `-- Cloudflare D1 Export for BUY4ACHANGE (ugtindia.space)\n-- Generated on ${new Date().toISOString()}\n\n`;
  
  for (const c of causes) {
    sql += `INSERT OR REPLACE INTO causes (id, slug, title, tagline, category, description, icon, target_amount, raised_amount, impact_metric, impact_count, image_url) VALUES ('${c.id}', '${c.slug}', '${c.title.replace(/'/g, "''")}', '${(c.tagline||'').replace(/'/g, "''")}', '${c.category}', '${(c.description||'').replace(/'/g, "''")}', '${c.icon}', ${c.target_amount}, ${c.raised_amount}, '${c.impact_metric}', ${c.impact_count}, '${c.image_url}');\n`;
  }
  
  for (const p of products) {
    sql += `INSERT OR REPLACE INTO products (id, name, slug, description, price, compare_at_price, category, image_url, stock, is_featured, cause_id, cause_allocation_pct, cause_impact_text, rating, reviews_count, badge) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.slug}', '${(p.description||'').replace(/'/g, "''")}', ${p.price}, ${p.compare_at_price || 'NULL'}, '${p.category}', '${p.image_url}', ${p.stock}, ${p.is_featured}, '${p.cause_id}', ${p.cause_allocation_pct}, '${(p.cause_impact_text||'').replace(/'/g, "''")}', ${p.rating}, ${p.reviews_count}, '${p.badge||''}');\n`;
  }
  
  res.send(sql);
});

// Serve static frontend build
app.use(express.static(distPath));

// Fallback to index.html for all non-API requests (SPA routing)
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Buy4AChange Server Running!`);
  console.log(` Storefront: http://localhost:${PORT}`);
  console.log(` Admin Portal: http://localhost:${PORT}/admin`);
  console.log(` Default Admin: admin@ugtindia.space / Admin@UGT2026!`);
  console.log(`======================================================\n`);
});
