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

// Initialize tables & safely migrate new columns
export function initDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  // Ensure digital product columns exist on older SQLite databases
  const cols = (db.prepare('PRAGMA table_info(products)').all() as any[]).map((c) => c.name);
  if (!cols.includes('product_type')) {
    db.exec("ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'physical'");
  }
  if (!cols.includes('subcategory')) {
    db.exec("ALTER TABLE products ADD COLUMN subcategory TEXT DEFAULT ''");
  }
  if (!cols.includes('digital_html_content')) {
    db.exec("ALTER TABLE products ADD COLUMN digital_html_content TEXT DEFAULT ''");
  }
  if (!cols.includes('digital_access_note')) {
    db.exec("ALTER TABLE products ADD COLUMN digital_access_note TEXT DEFAULT ''");
  }

  // Ensure courier_name exists on orders for real shipping dispatch tracking
  const orderCols = (db.prepare('PRAGMA table_info(orders)').all() as any[]).map((c) => c.name);
  if (!orderCols.includes('courier_name')) {
    db.exec("ALTER TABLE orders ADD COLUMN courier_name TEXT DEFAULT ''");
  }

  // Ensure manufacturer/seller & dual-certificate columns exist on products
  const sellerProdMigrations: [string, string][] = [
    ['seller_id', "TEXT DEFAULT ''"],
    ['seller_name', "TEXT DEFAULT ''"],
    ['approval_status', "TEXT DEFAULT 'approved'"],
    ['quality_cert_url', "TEXT DEFAULT ''"],
    ['quality_cert_name', "TEXT DEFAULT ''"],
    ['zero_chemical_cert_url', "TEXT DEFAULT ''"],
    ['zero_chemical_cert_name', "TEXT DEFAULT ''"],
    ['approval_notes', "TEXT DEFAULT ''"],
    ['origin_state', "TEXT DEFAULT ''"],
  ];
  for (const [col, def] of sellerProdMigrations) {
    if (!cols.includes(col)) {
      db.exec(`ALTER TABLE products ADD COLUMN ${col} ${def}`);
    }
  }

  // Open-source integrations, analytics, email outbox, sellers marketplace & verified reviews
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_integrations (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      target_id TEXT DEFAULT '',
      lang TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS email_outbox (
      id TEXT PRIMARY KEY,
      order_number TEXT DEFAULT '',
      recipient_email TEXT NOT NULL,
      event_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_preview TEXT DEFAULT '',
      status TEXT DEFAULT 'queued',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sellers (
      id TEXT PRIMARY KEY,
      store_name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT DEFAULT '',
      business_type TEXT DEFAULT 'Manufacturer',
      registration_no TEXT DEFAULT '',
      city TEXT DEFAULT '',
      state TEXT DEFAULT '',
      pincode TEXT DEFAULT '',
      upi_payout_id TEXT DEFAULT '',
      bank_details TEXT DEFAULT '',
      story TEXT DEFAULT '',
      status TEXT DEFAULT 'pending_approval',
      admin_notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS product_reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      reviewer_email TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT DEFAULT '',
      verified_purchase INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

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
  subcategory?: string;
  product_type?: 'physical' | 'digital';
  digital_html_content?: string;
  digital_access_note?: string;
  has_digital_content?: number | boolean;
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
  seller_id?: string;
  seller_name?: string;
  approval_status?: 'pending_approval' | 'approved' | 'rejected';
  quality_cert_url?: string;
  quality_cert_name?: string;
  zero_chemical_cert_url?: string;
  zero_chemical_cert_name?: string;
  approval_notes?: string;
  origin_state?: string;
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

export function resetAllCausesToZero(): Cause[] {
  db.prepare('UPDATE causes SET raised_amount = 0, impact_count = 0').run();
  return getAllCauses();
}

// --- Product Operations ---
// Public product listing: NEVER exposes digital_html_content (locked until purchase!)
// AND ONLY returns admin-approved products!
const PUBLIC_PRODUCT_COLS = `
  p.id, p.name, p.slug, p.description, p.price, p.compare_at_price,
  p.category, COALESCE(p.subcategory, '') as subcategory,
  COALESCE(p.product_type, 'physical') as product_type,
  COALESCE(p.digital_access_note, '') as digital_access_note,
  CASE WHEN COALESCE(p.digital_html_content, '') != '' THEN 1 ELSE 0 END as has_digital_content,
  p.image_url, p.stock, p.is_featured, p.cause_id, p.cause_allocation_pct,
  p.cause_impact_text, p.rating, p.reviews_count, p.badge, p.created_at,
  COALESCE(p.seller_id, '') as seller_id,
  COALESCE(p.seller_name, '') as seller_name,
  COALESCE(p.approval_status, 'approved') as approval_status,
  COALESCE(p.quality_cert_url, '') as quality_cert_url,
  COALESCE(p.quality_cert_name, '') as quality_cert_name,
  COALESCE(p.zero_chemical_cert_url, '') as zero_chemical_cert_url,
  COALESCE(p.zero_chemical_cert_name, '') as zero_chemical_cert_name,
  COALESCE(p.origin_state, '') as origin_state,
  c.title as cause_title, c.category as cause_category
`;

export function getAllProducts(category?: string, search?: string): Product[] {
  let query = `
    SELECT ${PUBLIC_PRODUCT_COLS}
    FROM products p
    LEFT JOIN causes c ON p.cause_id = c.id
    WHERE COALESCE(p.approval_status, 'approved') = 'approved'
  `;
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ` AND p.category = ?`;
    params.push(category);
  }

  if (search && search.trim() !== '') {
    query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR p.subcategory LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  query += ` ORDER BY p.created_at DESC, p.rowid DESC`;

  const stmt = db.prepare(query);
  return stmt.all(...params) as unknown as Product[];
}

// Admin product listing: includes full digital_html_content for editing
export function getAllProductsAdmin(): Product[] {
  const stmt = db.prepare(`
    SELECT p.*, c.title as cause_title, c.category as cause_category
    FROM products p
    LEFT JOIN causes c ON p.cause_id = c.id
    ORDER BY p.created_at DESC, p.rowid DESC
  `);
  return stmt.all() as unknown as Product[];
}

export function getProductById(id: string, includeDigitalHtml = false): Product | undefined {
  const cols = includeDigitalHtml
    ? 'p.*, c.title as cause_title, c.category as cause_category'
    : PUBLIC_PRODUCT_COLS;
  const stmt = db.prepare(`
    SELECT ${cols}
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
      subcategory, product_type, digital_html_content, digital_access_note,
      image_url, stock, is_featured, cause_id, cause_allocation_pct,
      cause_impact_text, rating, reviews_count, badge,
      seller_id, seller_name, approval_status,
      quality_cert_url, quality_cert_name, zero_chemical_cert_url, zero_chemical_cert_name,
      approval_notes, origin_state
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    prod.id,
    prod.name,
    prod.slug,
    prod.description || '',
    prod.price,
    prod.compare_at_price || null,
    prod.category,
    prod.subcategory || '',
    prod.product_type || 'physical',
    prod.digital_html_content || '',
    prod.digital_access_note || '',
    prod.image_url || '',
    prod.stock ?? 50,
    prod.is_featured ?? 0,
    prod.cause_id || 'cause-everyday-essentials',
    prod.cause_allocation_pct ?? 15,
    prod.cause_impact_text || '',
    prod.rating ?? 0,
    prod.reviews_count ?? 0,
    prod.badge || '',
    prod.seller_id || '',
    prod.seller_name || '',
    prod.approval_status || 'approved',
    prod.quality_cert_url || '',
    prod.quality_cert_name || '',
    prod.zero_chemical_cert_url || '',
    prod.zero_chemical_cert_name || '',
    prod.approval_notes || '',
    prod.origin_state || ''
  );
  return getProductById(prod.id, true)!;
}

export function updateProduct(id: string, prod: Partial<Product>): Product | undefined {
  const current = getProductById(id, true);
  if (!current) return undefined;

  const updated = { ...current, ...prod };
  const stmt = db.prepare(`
    UPDATE products SET
      name = ?, slug = ?, description = ?, price = ?, compare_at_price = ?,
      category = ?, subcategory = ?, product_type = ?, digital_html_content = ?, digital_access_note = ?,
      image_url = ?, stock = ?, is_featured = ?, cause_id = ?,
      cause_allocation_pct = ?, cause_impact_text = ?, badge = ?,
      approval_status = ?, quality_cert_url = ?, quality_cert_name = ?,
      zero_chemical_cert_url = ?, zero_chemical_cert_name = ?, approval_notes = ?, origin_state = ?
    WHERE id = ?
  `);
  stmt.run(
    updated.name,
    updated.slug,
    updated.description,
    updated.price,
    updated.compare_at_price || null,
    updated.category,
    updated.subcategory || '',
    updated.product_type || 'physical',
    updated.digital_html_content ?? '',
    updated.digital_access_note ?? '',
    updated.image_url,
    updated.stock,
    updated.is_featured,
    updated.cause_id || 'cause-everyday-essentials',
    updated.cause_allocation_pct,
    updated.cause_impact_text,
    updated.badge || '',
    updated.approval_status || 'approved',
    updated.quality_cert_url || '',
    updated.quality_cert_name || '',
    updated.zero_chemical_cert_url || '',
    updated.zero_chemical_cert_name || '',
    updated.approval_notes || '',
    updated.origin_state || '',
    id
  );
  return getProductById(id, true);
}

// Unlock purchased digital products/eBooks ONLY when order is verified PAID
export function getUnlockedDigitalItemsByOrder(orderNumber: string, email?: string) {
  let query = `
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
      AND COALESCE(p.product_type, 'physical') = 'digital'
  `;
  const params: any[] = [orderNumber.trim()];
  if (email && email.trim()) {
    query += ` AND LOWER(o.customer_email) = LOWER(?)`;
    params.push(email.trim());
  }
  return db.prepare(query).all(...params);
}

export function deleteProduct(id: string): boolean {
  db.prepare('UPDATE order_items SET product_id = NULL WHERE product_id = ?').run(id);
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
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

    // ONLY credit mission funds when payment is verified PAID (never for pending_verification)
    if (order.payment_status === 'paid' && itemCause && item.cause_contribution) {
      updateCauseRaised(itemCause, item.cause_contribution, 1);
    }
  }

  return getOrderById(order.id)!;
}

export function getTransactionById(id: string): any | undefined {
  return db.prepare('SELECT * FROM payment_transactions WHERE id = ? OR transaction_ref = ?').get(id, id);
}

export function getTransactionByUtr(utrRef: string): any | undefined {
  return db.prepare('SELECT * FROM payment_transactions WHERE transaction_ref = ?').get(utrRef);
}

export function verifyOrderPayment(orderId: string, action: 'approve' | 'reject'): Order | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;

  if (action === 'approve') {
    if (order.payment_status === 'paid') {
      return order; // Idempotent: never double-count mission funds
    }
    db.prepare("UPDATE orders SET payment_status = 'paid', order_status = 'Confirmed' WHERE id = ?").run(orderId);
    if (order.payment_id) {
      db.prepare("UPDATE payment_transactions SET status = 'succeeded', order_id = ? WHERE id = ? OR transaction_ref = ?")
        .run(order.order_number, order.payment_id, order.payment_id);
    }
    for (const item of order.items || []) {
      const cId = item.cause_id || order.cause_id;
      if (cId && item.cause_contribution) {
        updateCauseRaised(cId, item.cause_contribution, 1);
      }
    }
    return getOrderById(orderId);
  } else {
    db.prepare("UPDATE orders SET payment_status = 'failed', order_status = 'Payment Rejected' WHERE id = ?").run(orderId);
    if (order.payment_id) {
      db.prepare("UPDATE payment_transactions SET status = 'failed', order_id = ? WHERE id = ? OR transaction_ref = ?")
        .run(order.order_number, order.payment_id, order.payment_id);
    }
    return getOrderById(orderId);
  }
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

// --- Self-Service Order Tracking (Order # + Email) ---
export function trackOrderByNumberAndEmail(orderNumber: string, email: string): Order | undefined {
  const cleanOrder = String(orderNumber || '').trim().toUpperCase();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanOrder || !cleanEmail) return undefined;

  const order = db
    .prepare(
      `SELECT o.*, c.title as cause_title
       FROM orders o
       LEFT JOIN causes c ON o.cause_id = c.id
       WHERE UPPER(o.order_number) = ? AND LOWER(o.customer_email) = ?
       LIMIT 1`
    )
    .get(cleanOrder, cleanEmail) as Order | undefined;

  if (!order) return undefined;

  const items = db
    .prepare(
      `SELECT oi.*, c.title as cause_title
       FROM order_items oi
       LEFT JOIN causes c ON oi.cause_id = c.id
       WHERE oi.order_id = ?`
    )
    .all(order.id) as OrderItem[];

  return { ...order, items };
}

// --- Real Shipping Dispatch (Courier Name + AWB Tracking Number) ---
export function updateOrderDispatch(
  orderId: string,
  courierName: string,
  trackingNumber: string,
  status?: string
): Order | undefined {
  const order = getOrderById(orderId);
  if (!order) return undefined;
  const nextStatus = status || (trackingNumber.trim() ? 'Shipped' : order.order_status);
  db.prepare(
    'UPDATE orders SET courier_name = ?, tracking_number = ?, order_status = ? WHERE id = ?'
  ).run(courierName.trim(), trackingNumber.trim(), nextStatus, orderId);
  return getOrderById(orderId);
}

// --- Public Anonymized Transparency Audit Ledger ---
export function getPublicImpactLedger(limit = 30) {
  const rows = db
    .prepare(
      `SELECT o.order_number, o.customer_name, o.cause_id, COALESCE(c.title, 'Living India Mission') as cause_title,
              o.cause_donation_amount, o.total_amount, o.payment_status, o.created_at
       FROM orders o
       LEFT JOIN causes c ON o.cause_id = c.id
       WHERE o.payment_status = 'paid'
       ORDER BY o.created_at DESC
       LIMIT ?`
    )
    .all(limit) as any[];

  return rows.map((r) => {
    const parts = String(r.customer_name || 'Supporter').trim().split(/\s+/);
    const initials = parts
      .map((p: string) => (p[0] ? p[0].toUpperCase() + '.' : ''))
      .join(' ')
      .slice(0, 8);
    return {
      order_number: r.order_number,
      supporter_initials: initials || 'S.',
      cause_id: r.cause_id,
      cause_title: r.cause_title,
      cause_donation_amount: r.cause_donation_amount,
      total_amount: r.total_amount,
      payment_status: r.payment_status,
      created_at: r.created_at,
    };
  });
}

// --- Open-Source Integrations Configuration ---
export interface SiteIntegrationsConfig {
  umami_script_url: string;
  umami_website_id: string;
  chatwoot_base_url: string;
  chatwoot_website_token: string;
  whatsapp_support_number: string;
  support_email: string;
  karrio_api_url: string;
  karrio_api_key: string;
  smtp_webhook_url: string;
  smtp_from_email: string;
  r2_public_base_url: string;
}

const DEFAULT_INTEGRATIONS: SiteIntegrationsConfig = {
  umami_script_url: '',
  umami_website_id: '',
  chatwoot_base_url: '',
  chatwoot_website_token: '',
  whatsapp_support_number: '',
  support_email: 'support@ugtindia.space',
  karrio_api_url: '',
  karrio_api_key: '',
  smtp_webhook_url: '',
  smtp_from_email: 'orders@ugtindia.space',
  r2_public_base_url: '',
};

export function getSiteIntegrations(): SiteIntegrationsConfig {
  const rows = db.prepare('SELECT key, value FROM site_integrations').all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    umami_script_url: map.umami_script_url ?? DEFAULT_INTEGRATIONS.umami_script_url,
    umami_website_id: map.umami_website_id ?? DEFAULT_INTEGRATIONS.umami_website_id,
    chatwoot_base_url: map.chatwoot_base_url ?? DEFAULT_INTEGRATIONS.chatwoot_base_url,
    chatwoot_website_token: map.chatwoot_website_token ?? DEFAULT_INTEGRATIONS.chatwoot_website_token,
    whatsapp_support_number: map.whatsapp_support_number ?? DEFAULT_INTEGRATIONS.whatsapp_support_number,
    support_email: map.support_email ?? DEFAULT_INTEGRATIONS.support_email,
    karrio_api_url: map.karrio_api_url ?? DEFAULT_INTEGRATIONS.karrio_api_url,
    karrio_api_key: map.karrio_api_key ?? DEFAULT_INTEGRATIONS.karrio_api_key,
    smtp_webhook_url: map.smtp_webhook_url ?? DEFAULT_INTEGRATIONS.smtp_webhook_url,
    smtp_from_email: map.smtp_from_email ?? DEFAULT_INTEGRATIONS.smtp_from_email,
    r2_public_base_url: map.r2_public_base_url ?? DEFAULT_INTEGRATIONS.r2_public_base_url,
  };
}

export function saveSiteIntegrations(updates: Partial<SiteIntegrationsConfig>): SiteIntegrationsConfig {
  const current = getSiteIntegrations();
  const merged: SiteIntegrationsConfig = {
    ...current,
    ...updates,
    karrio_api_key:
      updates.karrio_api_key && !updates.karrio_api_key.startsWith('••••')
        ? updates.karrio_api_key.trim()
        : updates.karrio_api_key === ''
        ? ''
        : current.karrio_api_key,
  };
  const upsert = db.prepare('INSERT OR REPLACE INTO site_integrations (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(merged)) {
    upsert.run(k, String(v ?? '').trim());
  }
  return getSiteIntegrations();
}

// --- Privacy-First Zero-Cookie Analytics ---
export function logAnalyticsEvent(eventType: string, targetId = '', lang = 'en') {
  const id = `ev_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  db.prepare('INSERT INTO analytics_events (id, event_type, target_id, lang) VALUES (?, ?, ?, ?)').run(
    id,
    String(eventType || 'page_view').slice(0, 40),
    String(targetId || '').slice(0, 120),
    String(lang || 'en').slice(0, 12)
  );
}

export function getAnalyticsSummary() {
  const totalEvents = (db.prepare('SELECT COUNT(*) as c FROM analytics_events').get() as any)?.c || 0;
  const pageViews =
    (db.prepare("SELECT COUNT(*) as c FROM analytics_events WHERE event_type = 'page_view'").get() as any)?.c || 0;
  const missionReads =
    (db.prepare("SELECT COUNT(*) as c FROM analytics_events WHERE event_type = 'mission_read'").get() as any)?.c || 0;
  const productViews =
    (db.prepare("SELECT COUNT(*) as c FROM analytics_events WHERE event_type = 'product_view'").get() as any)?.c || 0;
  const pdfDownloads =
    (db.prepare("SELECT COUNT(*) as c FROM analytics_events WHERE event_type = 'pdf_download'").get() as any)?.c || 0;
  const topMissions = db
    .prepare(
      `SELECT target_id, COUNT(*) as count
       FROM analytics_events
       WHERE event_type = 'mission_read' AND target_id != ''
       GROUP BY target_id
       ORDER BY count DESC
       LIMIT 8`
    )
    .all() as { target_id: string; count: number }[];

  const recentEmails = db
    .prepare('SELECT * FROM email_outbox ORDER BY created_at DESC LIMIT 20')
    .all() as any[];

  return {
    totalEvents,
    pageViews,
    missionReads,
    productViews,
    pdfDownloads,
    topMissions,
    recentEmails,
  };
}

// --- Transactional Email Outbox & Optional Webhook Relay (Listmonk / SMTP Relay) ---
export async function queueEmailNotification(params: {
  orderNumber: string;
  recipientEmail: string;
  eventType: 'order_received' | 'payment_verified' | 'order_dispatched';
  subject: string;
  bodyPreview: string;
}) {
  if (!params.recipientEmail) return;
  const id = `mail_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  let status = 'recorded';

  const cfg = getSiteIntegrations();
  if (cfg.smtp_webhook_url) {
    try {
      const resp = await fetch(cfg.smtp_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: cfg.smtp_from_email || 'orders@ugtindia.space',
          to: params.recipientEmail,
          subject: params.subject,
          event_type: params.eventType,
          order_number: params.orderNumber,
          text: params.bodyPreview,
        }),
      });
      status = resp.ok ? 'dispatched' : `webhook_http_${resp.status}`;
    } catch {
      status = 'webhook_failed';
    }
  }

  db.prepare(
    `INSERT INTO email_outbox (id, order_number, recipient_email, event_type, subject, body_preview, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, params.orderNumber, params.recipientEmail, params.eventType, params.subject, params.bodyPreview, status);
}

// ============================================================
// PRO MANUFACTURER / SELLER MARKETPLACE + CERTIFICATE AUDIT
// ============================================================

export interface SellerRecord {
  id: string;
  store_name: string;
  owner_name: string;
  email: string;
  phone: string;
  business_type: string;
  registration_no: string;
  city: string;
  state: string;
  pincode: string;
  upi_payout_id: string;
  bank_details: string;
  story: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'suspended';
  admin_notes: string;
  created_at: string;
}

function signSellerToken(seller: { id: string; email: string }): string {
  const payload = `seller:${seller.id}:${seller.email}:${Date.now()}`;
  const sig = crypto.createHmac('sha256', 'UGT_SELLER_SECRET_KEY_2026').update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

export function validateSellerToken(token: string): { id: string; email: string } | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 5 || parts[0] !== 'seller') return null;
    const [prefix, id, email, ts, sig] = parts;
    const payload = `${prefix}:${id}:${email}:${ts}`;
    const expected = crypto.createHmac('sha256', 'UGT_SELLER_SECRET_KEY_2026').update(payload).digest('hex');
    if (sig !== expected) return null;
    if (Date.now() - parseInt(ts, 10) > 14 * 24 * 60 * 60 * 1000) return null;
    return { id, email };
  } catch {
    return null;
  }
}

export function registerSeller(input: {
  store_name: string;
  owner_name: string;
  email: string;
  password: string;
  phone: string;
  business_type?: string;
  registration_no?: string;
  city?: string;
  state?: string;
  pincode?: string;
  upi_payout_id?: string;
  bank_details?: string;
  story?: string;
}): { seller: SellerRecord; token: string } {
  const cleanEmail = input.email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM sellers WHERE LOWER(email) = ?').get(cleanEmail);
  if (existing) {
    throw new Error('An account with this manufacturer email already exists. Please sign in.');
  }

  const id = `seller-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const pwdHash = hashPassword(input.password);
  db.prepare(`
    INSERT INTO sellers (
      id, store_name, owner_name, email, password_hash, phone,
      business_type, registration_no, city, state, pincode,
      upi_payout_id, bank_details, story, status, admin_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', '')
  `).run(
    id,
    input.store_name.trim(),
    input.owner_name.trim(),
    cleanEmail,
    pwdHash,
    input.phone.trim(),
    input.business_type || 'Manufacturer',
    (input.registration_no || '').trim(),
    (input.city || '').trim(),
    (input.state || '').trim(),
    (input.pincode || '').trim(),
    (input.upi_payout_id || '').trim(),
    (input.bank_details || '').trim(),
    (input.story || '').trim()
  );

  const seller = getSellerById(id)!;
  return { seller, token: signSellerToken(seller) };
}

export function verifySellerLogin(email: string, password: string): { seller: SellerRecord; token: string } | null {
  const cleanEmail = email.trim().toLowerCase();
  const pwdHash = hashPassword(password);
  const row = db
    .prepare(
      `SELECT id, store_name, owner_name, email, phone, business_type, registration_no,
              city, state, pincode, upi_payout_id, bank_details, story, status, admin_notes, created_at
       FROM sellers
       WHERE LOWER(email) = ? AND password_hash = ?`
    )
    .get(cleanEmail, pwdHash) as SellerRecord | undefined;
  if (!row) return null;
  return { seller: row, token: signSellerToken(row) };
}

export function getSellerById(id: string): SellerRecord | undefined {
  return db
    .prepare(
      `SELECT id, store_name, owner_name, email, phone, business_type, registration_no,
              city, state, pincode, upi_payout_id, bank_details, story, status, admin_notes, created_at
       FROM sellers WHERE id = ?`
    )
    .get(id) as SellerRecord | undefined;
}

export function getAllSellersAdmin() {
  return db
    .prepare(
      `SELECT s.id, s.store_name, s.owner_name, s.email, s.phone, s.business_type, s.registration_no,
              s.city, s.state, s.pincode, s.upi_payout_id, s.bank_details, s.story, s.status,
              s.admin_notes, s.created_at,
              (SELECT COUNT(*) FROM products p WHERE p.seller_id = s.id) as product_count,
              (SELECT COUNT(*) FROM products p WHERE p.seller_id = s.id AND p.approval_status = 'pending_approval') as pending_product_count
       FROM sellers s
       ORDER BY CASE WHEN s.status = 'pending_approval' THEN 0 ELSE 1 END, s.created_at DESC`
    )
    .all();
}

export function updateSellerStatus(
  sellerId: string,
  status: 'approved' | 'rejected' | 'suspended' | 'pending_approval',
  adminNotes = ''
): SellerRecord | undefined {
  const existing = getSellerById(sellerId);
  if (!existing) return undefined;
  db.prepare('UPDATE sellers SET status = ?, admin_notes = ? WHERE id = ?').run(
    status,
    adminNotes.trim(),
    sellerId
  );
  return getSellerById(sellerId);
}

export function getSellerProducts(sellerId: string): Product[] {
  return db
    .prepare(
      `SELECT p.*, c.title as cause_title, c.category as cause_category
       FROM products p
       LEFT JOIN causes c ON p.cause_id = c.id
       WHERE p.seller_id = ?
       ORDER BY p.created_at DESC, p.rowid DESC`
    )
    .all(sellerId) as unknown as Product[];
}

export function updateProductApproval(
  productId: string,
  approvalStatus: 'approved' | 'rejected' | 'pending_approval',
  approvalNotes = ''
): Product | undefined {
  const existing = getProductById(productId, true);
  if (!existing) return undefined;
  db.prepare('UPDATE products SET approval_status = ?, approval_notes = ? WHERE id = ?').run(
    approvalStatus,
    approvalNotes.trim(),
    productId
  );
  return getProductById(productId, true);
}

export function getSellerOrdersAndEarnings(sellerId: string) {
  const rows = db
    .prepare(
      `SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.shipping_address,
              o.city, o.state, o.pincode, o.payment_status, o.order_status,
              o.courier_name, o.tracking_number, o.created_at,
              oi.id as item_id, oi.product_id, oi.product_name, oi.price, oi.quantity, oi.total,
              oi.cause_allocation_pct, oi.cause_contribution,
              COALESCE(c.title, 'Living India Mission') as cause_title
       FROM order_items oi
       INNER JOIN products p ON p.id = oi.product_id
       INNER JOIN orders o ON o.id = oi.order_id
       LEFT JOIN causes c ON oi.cause_id = c.id
       WHERE p.seller_id = ?
       ORDER BY o.created_at DESC`
    )
    .all(sellerId) as any[];

  let totalGross = 0;
  let missionContribution = 0;
  let platformFee = 0;
  let netPayout = 0;
  let verifiedOrdersCount = 0;
  let pendingOrdersCount = 0;

  const enriched = rows.map((r) => {
    const gross = Number(r.total || 0);
    const mission = Number(r.cause_contribution || 0);
    const ops = Math.round(gross * 0.05 * 100) / 100; // Transparent 5% platform operations split
    const sellerNet = Math.max(0, Math.round((gross - mission - ops) * 100) / 100);
    if (r.payment_status === 'paid') {
      totalGross += gross;
      missionContribution += mission;
      platformFee += ops;
      netPayout += sellerNet;
      verifiedOrdersCount += 1;
    } else if (r.payment_status === 'pending_verification') {
      pendingOrdersCount += 1;
    }
    return {
      ...r,
      platform_fee: ops,
      seller_net_payout: sellerNet,
    };
  });

  return {
    orders: enriched,
    earnings: {
      totalGross: Math.round(totalGross),
      missionContribution: Math.round(missionContribution),
      platformFee: Math.round(platformFee),
      netPayout: Math.round(netPayout),
      verifiedOrdersCount,
      pendingOrdersCount,
    },
  };
}

export function sellerOwnsOrder(sellerId: string, orderId: string): boolean {
  const row = db
    .prepare(
      `SELECT oi.id FROM order_items oi
       INNER JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ? AND p.seller_id = ?
       LIMIT 1`
    )
    .get(orderId, sellerId);
  return Boolean(row);
}

// --- Verified-Buyer-Only Reviews (Zero Fake Ratings) ---
export function getProductReviews(productId: string) {
  return db
    .prepare(
      `SELECT id, product_id, order_number, reviewer_name, rating, comment, verified_purchase, created_at
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY created_at DESC`
    )
    .all(productId);
}

export function createVerifiedProductReview(input: {
  productId: string;
  orderNumber: string;
  email: string;
  rating: number;
  comment: string;
}) {
  const cleanOrder = input.orderNumber.trim().toUpperCase();
  const cleanEmail = input.email.trim().toLowerCase();
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));

  // Strictly verify buyer has a PAID order containing this product
  const verifiedOrder = db
    .prepare(
      `SELECT o.order_number, o.customer_name
       FROM orders o
       INNER JOIN order_items oi ON oi.order_id = o.id
       WHERE UPPER(o.order_number) = ?
         AND LOWER(o.customer_email) = ?
         AND o.payment_status = 'paid'
         AND oi.product_id = ?
       LIMIT 1`
    )
    .get(cleanOrder, cleanEmail, input.productId) as any;

  if (!verifiedOrder) {
    throw new Error(
      'Only verified buyers with a PAID order for this exact product can submit a review.'
    );
  }

  const dup = db
    .prepare('SELECT id FROM product_reviews WHERE product_id = ? AND UPPER(order_number) = ?')
    .get(input.productId, cleanOrder);
  if (dup) {
    throw new Error('You have already submitted a verified review for this product on this order.');
  }

  const id = `rev_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  db.prepare(
    `INSERT INTO product_reviews (id, product_id, order_number, reviewer_name, reviewer_email, rating, comment, verified_purchase)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(
    id,
    input.productId,
    cleanOrder,
    verifiedOrder.customer_name || 'Verified Buyer',
    cleanEmail,
    rating,
    input.comment.trim().slice(0, 600)
  );

  // Recalculate authentic product rating & review count
  const agg = db
    .prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM product_reviews WHERE product_id = ?')
    .get(input.productId) as any;
  db.prepare('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?').run(
    Math.round((agg?.avg_rating || rating) * 10) / 10,
    agg?.cnt || 1,
    input.productId
  );

  return getProductReviews(input.productId);
}

// --- 3-Way Split Accounting CSV Export (Tally / Trust Audit) ---
export function generatePayoutSplitCsv(): string {
  const rows = db
    .prepare(
      `SELECT o.order_number, o.created_at, o.payment_status, o.order_status,
              oi.product_name, oi.quantity, oi.total, oi.cause_contribution,
              COALESCE(p.seller_name, 'UGT Direct') as seller_name,
              COALESCE(c.title, 'Living India Mission') as cause_title
       FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN causes c ON oi.cause_id = c.id
       ORDER BY o.created_at DESC`
    )
    .all() as any[];

  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    'Order Number,Date,Payment Status,Order Status,Manufacturer / Seller,Product,Qty,Gross INR,Mission Title,Mission Share INR,Platform Ops (5%) INR,Manufacturer Payout INR',
  ];
  for (const r of rows) {
    const gross = Number(r.total || 0);
    const mission = Number(r.cause_contribution || 0);
    const ops = Math.round(gross * 0.05 * 100) / 100;
    const payout = Math.max(0, Math.round((gross - mission - ops) * 100) / 100);
    lines.push(
      [
        esc(r.order_number),
        esc(r.created_at),
        esc(r.payment_status),
        esc(r.order_status),
        esc(r.seller_name),
        esc(r.product_name),
        r.quantity,
        gross.toFixed(2),
        esc(r.cause_title),
        mission.toFixed(2),
        ops.toFixed(2),
        payout.toFixed(2),
      ].join(',')
    );
  }
  return lines.join('\n');
}

// --- ONDC / Beckn Open-Commerce Catalog JSON Export ---
export function generateOndcBecknCatalog() {
  const approvedProducts = getAllProducts();
  const approvedSellers = (getAllSellersAdmin() as any[]).filter((s) => s.status === 'approved');
  return {
    context: {
      domain: 'ONDC:RET10',
      country: 'IND',
      action: 'on_search',
      core_version: '1.2.0',
      bap_id: 'buy4achange.ugtindia.space',
      timestamp: new Date().toISOString(),
    },
    message: {
      catalog: {
        'bpp/descriptor': {
          name: 'Buy4AChange — Universal Guard Trust & UGT India',
          short_desc: 'Verified zero-chemical Indian manufacturers funding 8 Living India missions.',
        },
        'bpp/providers': [
          {
            id: 'ugt-india-direct',
            descriptor: { name: 'Buy4AChange Direct & Certified Makers' },
            items: approvedProducts.map((p) => ({
              id: p.id,
              descriptor: {
                name: p.name,
                short_desc: p.description,
                images: p.image_url ? [p.image_url] : [],
              },
              category_id: p.category,
              price: { currency: 'INR', value: String(p.price) },
              quantity: { available: { count: String(p.stock) } },
              tags: [
                {
                  code: 'origin_and_purity',
                  list: [
                    { code: 'manufacturer', value: p.seller_name || 'UGT India' },
                    { code: 'origin_state', value: p.origin_state || 'India' },
                    { code: 'quality_certified', value: p.quality_cert_url ? 'yes' : 'standard' },
                    { code: 'zero_chemical_certified', value: p.zero_chemical_cert_url ? 'yes' : 'standard' },
                    { code: 'living_india_mission', value: p.cause_title || p.cause_id },
                  ],
                },
              ],
            })),
          },
          ...approvedSellers.map((s) => ({
            id: s.id,
            descriptor: {
              name: s.store_name,
              short_desc: `${s.business_type} · ${s.city}, ${s.state}`,
            },
            locations: [{ id: `${s.id}-loc`, address: { city: s.city, state: s.state, area_code: s.pincode } }],
          })),
        ],
      },
    },
  };
}
