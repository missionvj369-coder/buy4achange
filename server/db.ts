import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'buy4achange.db');
const schemaPath = path.join(__dirname, 'schema.sql');

export const db = new DatabaseSync(dbPath);

// Initialize tables
export function initDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('✓ Database schema verified and active at:', dbPath);
}

// Ensure schema is created
initDatabase();

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Cause {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  icon: string;
  target_amount: number;
  raised_amount: number;
  impact_metric: string;
  impact_count: number;
  image_url: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  image_url: string;
  stock: number;
  is_featured: number;
  cause_id: string;
  cause_allocation_pct: number;
  cause_impact_text: string;
  rating: number;
  reviews_count: number;
  badge?: string;
  created_at?: string;
  cause_title?: string;
  cause_category?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
  cause_id?: string;
  cause_title?: string;
  cause_allocation_pct: number;
  cause_contribution: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  cause_id: string;
  cause_donation_amount: number;
  cause_impact_delivered: string;
  payment_method: string;
  payment_status: string;
  payment_id: string;
  order_status: string;
  tracking_number?: string;
  guardian_id?: string;
  created_at: string;
  items?: OrderItem[];
  cause_title?: string;
}

// --- Admin Authentication ---
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'UGT_SECRET_SALT_2026').digest('hex');
}

export function ensureDefaultAdmin() {
  const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get('admin@ugtindia.space') as any;
  if (!existing) {
    const adminId = 'admin-ugt-001';
    const pwdHash = hashPassword('Admin@UGT2026!');
    const stmt = db.prepare('INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)');
    stmt.run(adminId, 'admin@ugtindia.space', pwdHash, 'UGT Lead Operations', 'superadmin');
    console.log('✓ Default Admin account initialized: admin@ugtindia.space');
  }
}

ensureDefaultAdmin();

export function verifyAdminLogin(email: string, password: string): { user: AdminUser; token: string } | null {
  const hash = hashPassword(password);
  const stmt = db.prepare('SELECT id, email, name, role FROM admin_users WHERE email = ? AND password_hash = ?');
  const user = stmt.get(email.trim().toLowerCase(), hash) as AdminUser | undefined;

  if (!user) return null;

  // Simple, deterministic cryptographically signed session token
  const tokenPayload = `${user.id}:${user.email}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', 'UGT_TOKEN_SECRET_KEY').update(tokenPayload).digest('hex');
  const token = Buffer.from(`${tokenPayload}:${signature}`).toString('base64');

  return { user, token };
}

export function validateAdminToken(token: string): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 4) return false;

    const [id, email, timestamp, signature] = parts;
    const tokenPayload = `${id}:${email}:${timestamp}`;
    const expectedSig = crypto.createHmac('sha256', 'UGT_TOKEN_SECRET_KEY').update(tokenPayload).digest('hex');

    if (signature !== expectedSig) return false;

    // Check expiration (7 days)
    const age = Date.now() - parseInt(timestamp, 10);
    return age < 7 * 24 * 3600 * 1000;
  } catch {
    return false;
  }
}

// --- Cause Operations (UGT India Missions) ---
export function getAllCauses(): Cause[] {
  const stmt = db.prepare('SELECT * FROM causes ORDER BY title ASC');
  return stmt.all() as unknown as Cause[];
}

export function getCauseById(id: string): Cause | undefined {
  const stmt = db.prepare('SELECT * FROM causes WHERE id = ?');
  return stmt.get(id) as unknown as Cause | undefined;
}

export function updateCauseRaised(id: string, amount: number, impactIncrement: number = 1) {
  const stmt = db.prepare(`
    UPDATE causes 
    SET raised_amount = raised_amount + ?, 
        impact_count = impact_count + ?
    WHERE id = ?
  `);
  stmt.run(amount, impactIncrement, id);
}

// --- Product Operations ---
export function getAllProducts(category?: string, search?: string): Product[] {
  let query = `
    SELECT p.*, c.title as cause_title, c.category as cause_category 
    FROM products p
    LEFT JOIN causes c ON p.cause_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ` AND p.category = ?`;
    params.push(category);
  }

  if (search && search.trim() !== '') {
    query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;

  const stmt = db.prepare(query);
  return stmt.all(...params) as unknown as Product[];
}

export function getProductById(id: string): Product | undefined {
  const stmt = db.prepare(`
    SELECT p.*, c.title as cause_title, c.category as cause_category 
    FROM products p
    LEFT JOIN causes c ON p.cause_id = c.id
    WHERE p.id = ?
  `);
  return stmt.get(id) as unknown as Product | undefined;
}

export function createProduct(prod: Omit<Product, 'created_at'>): Product {
  const stmt = db.prepare(`
    INSERT INTO products (
      id, name, slug, description, price, compare_at_price, category, 
      image_url, stock, is_featured, cause_id, cause_allocation_pct, 
      cause_impact_text, rating, reviews_count, badge
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    prod.id,
    prod.name,
    prod.slug,
    prod.description || '',
    prod.price,
    prod.compare_at_price || null,
    prod.category,
    prod.image_url || '',
    prod.stock ?? 50,
    prod.is_featured ?? 0,
    prod.cause_id || 'cause-everyday-essentials',
    prod.cause_allocation_pct ?? 15,
    prod.cause_impact_text || '',
    prod.rating ?? 5.0,
    prod.reviews_count ?? 1,
    prod.badge || ''
  );
  return getProductById(prod.id)!;
}

export function updateProduct(id: string, prod: Partial<Product>): Product | undefined {
  const current = getProductById(id);
  if (!current) return undefined;

  const updated = { ...current, ...prod };
  const stmt = db.prepare(`
    UPDATE products SET
      name = ?, slug = ?, description = ?, price = ?, compare_at_price = ?,
      category = ?, image_url = ?, stock = ?, is_featured = ?, cause_id = ?,
      cause_allocation_pct = ?, cause_impact_text = ?, badge = ?
    WHERE id = ?
  `);
  stmt.run(
    updated.name,
    updated.slug,
    updated.description,
    updated.price,
    updated.compare_at_price || null,
    updated.category,
    updated.image_url,
    updated.stock,
    updated.is_featured,
    updated.cause_id || 'cause-everyday-essentials',
    updated.cause_allocation_pct,
    updated.cause_impact_text,
    updated.badge || '',
    id
  );
  return getProductById(id);
}

export function deleteProduct(id: string): boolean {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
  return true;
}

// --- Order Operations ---
export function getAllOrders(dateFilter?: 'today' | 'yesterday' | 'week' | 'all'): Order[] {
  let query = `
    SELECT o.*, c.title as cause_title
    FROM orders o
    LEFT JOIN causes c ON o.cause_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (dateFilter === 'today') {
    query += ` AND date(o.created_at) = date('now')`;
  } else if (dateFilter === 'yesterday') {
    query += ` AND date(o.created_at) = date('now', '-1 day')`;
  } else if (dateFilter === 'week') {
    query += ` AND date(o.created_at) >= date('now', '-7 days')`;
  }

  query += ` ORDER BY o.created_at DESC`;

  const stmt = db.prepare(query);
  const orders = stmt.all(...params) as unknown as Order[];

  // Attach items to each order
  const itemStmt = db.prepare(`
    SELECT oi.*, c.title as cause_title 
    FROM order_items oi
    LEFT JOIN causes c ON oi.cause_id = c.id
    WHERE oi.order_id = ?
  `);
  return orders.map((o) => {
    const items = itemStmt.all(o.id) as unknown as OrderItem[];
    return { ...o, items };
  });
}

export function getOrderById(id: string): Order | undefined {
  const stmt = db.prepare(`
    SELECT o.*, c.title as cause_title
    FROM orders o
    LEFT JOIN causes c ON o.cause_id = c.id
    WHERE o.id = ?
  `);
  const order = stmt.get(id) as unknown as Order | undefined;
  if (!order) return undefined;

  const itemStmt = db.prepare(`
    SELECT oi.*, c.title as cause_title 
    FROM order_items oi
    LEFT JOIN causes c ON oi.cause_id = c.id
    WHERE oi.order_id = ?
  `);
  order.items = itemStmt.all(order.id) as unknown as OrderItem[];
  return order;
}

export function createOrder(
  order: Omit<Order, 'created_at' | 'items'>,
  items: Omit<OrderItem, 'order_id'>[]
): Order {
  const defaultCauseId = order.cause_id || items[0]?.cause_id || 'cause-everyday-essentials';

  const orderStmt = db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_email, customer_phone,
      shipping_address, city, state, pincode, country,
      subtotal, shipping_fee, total_amount, cause_id, cause_donation_amount,
      cause_impact_delivered, payment_method, payment_status, payment_id,
      order_status, tracking_number, guardian_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  orderStmt.run(
    order.id || `ord-${Date.now()}`,
    order.order_number,
    order.customer_name || 'Customer',
    order.customer_email || 'customer@example.com',
    order.customer_phone || '',
    order.shipping_address || '',
    order.city || '',
    order.state || '',
    order.pincode || '',
    order.country || 'India',
    order.subtotal || 0,
    order.shipping_fee || 0,
    order.total_amount || 0,
    defaultCauseId,
    order.cause_donation_amount || 0,
    order.cause_impact_delivered || '',
    order.payment_method || 'Online Payment Switch',
    order.payment_status || 'paid',
    order.payment_id || `pay_${Date.now()}`,
    order.order_status || 'Processing',
    order.tracking_number || null,
    order.guardian_id || null
  );

  const itemStmt = db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, product_name, price, quantity, total,
      cause_id, cause_allocation_pct, cause_contribution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    const itemCause = item.cause_id || defaultCauseId;
    itemStmt.run(
      item.id,
      order.id,
      item.product_id,
      item.product_name,
      item.price,
      item.quantity,
      item.total,
      itemCause,
      item.cause_allocation_pct || 15.0,
      item.cause_contribution || (item.price * item.quantity * 0.15)
    );

    // Decrement stock safely
    const stockStmt = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?');
    stockStmt.run(item.quantity, item.product_id);

    // Update cause raised funds
    if (itemCause && item.cause_contribution) {
      updateCauseRaised(itemCause, item.cause_contribution, 1);
    }
  }

  return getOrderById(order.id)!;
}

export function updateOrderStatus(id: string, status: string, trackingNumber?: string): Order | undefined {
  if (trackingNumber) {
    const stmt = db.prepare('UPDATE orders SET order_status = ?, tracking_number = ? WHERE id = ?');
    stmt.run(status, trackingNumber, id);
  } else {
    const stmt = db.prepare('UPDATE orders SET order_status = ? WHERE id = ?');
    stmt.run(status, id);
  }
  return getOrderById(id);
}

// --- Metrics & Analytics ---
export function getMetrics() {
  const orderCount = db.prepare("SELECT COUNT(*) as count, SUM(total_amount) as total_revenue, SUM(cause_donation_amount) as total_raised FROM orders WHERE payment_status = 'paid'").get() as any;
  const todayOrders = db.prepare("SELECT COUNT(*) as count, SUM(total_amount) as today_revenue, SUM(cause_donation_amount) as today_raised FROM orders WHERE payment_status = 'paid' AND date(created_at) = date('now')").get() as any;
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
  const causesCount = db.prepare('SELECT COUNT(*) as count FROM causes').get() as any;

  return {
    totalRevenue: orderCount?.total_revenue || 0,
    totalRaised: orderCount?.total_raised || 0,
    totalOrders: orderCount?.count || 0,
    todayOrdersCount: todayOrders?.count || 0,
    todayRevenue: todayOrders?.today_revenue || 0,
    todayRaised: todayOrders?.today_raised || 0,
    totalProducts: productCount?.count || 0,
    totalCauses: causesCount?.count || 0,
  };
}

// --- Payment Transactions Ledger ---
export function recordTransaction(tx: {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  gateway: string;
  transaction_ref: string;
  status: string;
  method_details: string;
  webhook_payload?: string;
}) {
  const stmt = db.prepare(`
    INSERT INTO payment_transactions (
      id, order_id, amount, currency, gateway, transaction_ref, status, method_details, webhook_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    tx.id,
    tx.order_id,
    tx.amount,
    tx.currency,
    tx.gateway,
    tx.transaction_ref,
    tx.status,
    tx.method_details,
    tx.webhook_payload || ''
  );
}

export function getTransactions() {
  const stmt = db.prepare('SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 50');
  return stmt.all();
}

export function updateTransactionStatus(id: string, status: string, webhookPayload?: string) {
  const existing = db.prepare('SELECT id FROM payment_transactions WHERE id = ? OR transaction_ref = ?').get(id, id) as any;
  if (!existing) return false;
  if (webhookPayload) {
    db.prepare('UPDATE payment_transactions SET status = ?, webhook_payload = ? WHERE id = ?')
      .run(status, webhookPayload, existing.id);
  } else {
    db.prepare('UPDATE payment_transactions SET status = ? WHERE id = ?')
      .run(status, existing.id);
  }
  return true;
}

export function updateOrderPaymentStatusByPaymentId(paymentId: string, paymentStatus: string) {
  const stmt = db.prepare('UPDATE orders SET payment_status = ? WHERE payment_id = ?');
  stmt.run(paymentStatus, paymentId);
}

// --- Open-Source Payment Gateway Configuration (SQLite + Env Overrides) ---
export type GatewayMode = 'direct_upi' | 'hyperswitch_sandbox' | 'hyperswitch_live';

export interface PaymentGatewayConfig {
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

const DEFAULT_GATEWAY_CONFIG: PaymentGatewayConfig = {
  mode: (process.env.PAYMENT_GATEWAY_MODE as GatewayMode) || 'direct_upi',
  hyperswitch_base_url: process.env.HYPERSWITCH_BASE_URL || 'https://sandbox.hyperswitch.io',
  hyperswitch_api_key: process.env.HYPERSWITCH_API_KEY || '',
  hyperswitch_publishable_key: process.env.HYPERSWITCH_PUBLISHABLE_KEY || '',
  hyperswitch_profile_id: process.env.HYPERSWITCH_PROFILE_ID || '',
  hyperswitch_webhook_hash_key: process.env.HYPERSWITCH_WEBHOOK_HASH_KEY || '',
  merchant_upi_vpa: process.env.MERCHANT_UPI_VPA || 'ugtindia@upi',
  merchant_name: process.env.MERCHANT_NAME || 'Buy4AChange UGT India',
  currency: process.env.PAYMENT_CURRENCY || 'INR',
  enable_card: true,
  enable_upi: true,
  enable_netbanking: true,
};

export function getGatewayConfig(): PaymentGatewayConfig {
  const rows = db.prepare('SELECT key, value FROM gateway_settings').all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }

  return {
    mode: (map.mode as GatewayMode) || DEFAULT_GATEWAY_CONFIG.mode,
    hyperswitch_base_url: map.hyperswitch_base_url ?? DEFAULT_GATEWAY_CONFIG.hyperswitch_base_url,
    hyperswitch_api_key: map.hyperswitch_api_key ?? DEFAULT_GATEWAY_CONFIG.hyperswitch_api_key,
    hyperswitch_publishable_key: map.hyperswitch_publishable_key ?? DEFAULT_GATEWAY_CONFIG.hyperswitch_publishable_key,
    hyperswitch_profile_id: map.hyperswitch_profile_id ?? DEFAULT_GATEWAY_CONFIG.hyperswitch_profile_id,
    hyperswitch_webhook_hash_key: map.hyperswitch_webhook_hash_key ?? DEFAULT_GATEWAY_CONFIG.hyperswitch_webhook_hash_key,
    merchant_upi_vpa: map.merchant_upi_vpa ?? DEFAULT_GATEWAY_CONFIG.merchant_upi_vpa,
    merchant_name: map.merchant_name ?? DEFAULT_GATEWAY_CONFIG.merchant_name,
    currency: map.currency ?? DEFAULT_GATEWAY_CONFIG.currency,
    enable_card: map.enable_card !== undefined ? map.enable_card === 'true' : DEFAULT_GATEWAY_CONFIG.enable_card,
    enable_upi: map.enable_upi !== undefined ? map.enable_upi === 'true' : DEFAULT_GATEWAY_CONFIG.enable_upi,
    enable_netbanking: map.enable_netbanking !== undefined ? map.enable_netbanking === 'true' : DEFAULT_GATEWAY_CONFIG.enable_netbanking,
  };
}

export function saveGatewayConfig(updates: Partial<PaymentGatewayConfig>): PaymentGatewayConfig {
  const current = getGatewayConfig();
  const merged: PaymentGatewayConfig = {
    ...current,
    ...updates,
    // Keep existing secrets if UI sends masked placeholder or empty sentinel
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

  const upsert = db.prepare('INSERT OR REPLACE INTO gateway_settings (key, value) VALUES (?, ?)');
  const entries: [string, string][] = [
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

  for (const [k, v] of entries) {
    upsert.run(k, v);
  }

  return getGatewayConfig();
}
