-- Buy4AChange Database Schema (SQLite & Cloudflare D1 Compatible)
-- Connected to UGT India (ugtindia.space) 8 National Missions

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS causes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  category TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  target_amount REAL DEFAULT 500000,
  raised_amount REAL DEFAULT 0,
  impact_metric TEXT NOT NULL,
  impact_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  compare_at_price REAL,
  category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  product_type TEXT DEFAULT 'physical',
  digital_html_content TEXT DEFAULT '',
  digital_access_note TEXT DEFAULT '',
  image_url TEXT,
  stock INTEGER DEFAULT 50,
  is_featured INTEGER DEFAULT 0,
  cause_id TEXT REFERENCES causes(id),
  cause_allocation_pct REAL DEFAULT 15.0,
  cause_impact_text TEXT,
  rating REAL DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 28,
  badge TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  subtotal REAL NOT NULL,
  shipping_fee REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  cause_id TEXT REFERENCES causes(id),
  cause_donation_amount REAL NOT NULL,
  cause_impact_delivered TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_id TEXT,
  order_status TEXT DEFAULT 'Processing',
  tracking_number TEXT,
  guardian_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  product_name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  total REAL NOT NULL,
  cause_id TEXT REFERENCES causes(id),
  cause_allocation_pct REAL,
  cause_contribution REAL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  amount REAL,
  currency TEXT DEFAULT 'INR',
  gateway TEXT DEFAULT 'BUY4ACHANGE_PAY_SWITCH',
  transaction_ref TEXT,
  status TEXT,
  method_details TEXT,
  webhook_payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gateway_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
