-- Buy4AChange Complete Production Cloudflare D1 Schema & Seed
-- Target Account: d2d9e117b1f2d60e8fba956d80de7c9f (buy4achange.in)

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
  rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  badge TEXT,
  seller_id TEXT DEFAULT '',
  seller_name TEXT DEFAULT '',
  approval_status TEXT DEFAULT 'approved',
  quality_cert_url TEXT DEFAULT '',
  quality_cert_name TEXT DEFAULT '',
  zero_chemical_cert_url TEXT DEFAULT '',
  zero_chemical_cert_name TEXT DEFAULT '',
  approval_notes TEXT DEFAULT '',
  origin_state TEXT DEFAULT '',
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
  order_status TEXT DEFAULT 'Pending Payment Verification',
  courier_name TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  guardian_id TEXT DEFAULT '',
  user_id TEXT DEFAULT '',
  referred_by_code TEXT DEFAULT '',
  referrer_user_id TEXT DEFAULT '',
  referral_commission_pct REAL DEFAULT 0,
  referral_commission_amount REAL DEFAULT 0,
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
  gateway TEXT DEFAULT 'NPCI_DIRECT_UPI',
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
  status TEXT DEFAULT 'recorded',
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

CREATE TABLE IF NOT EXISTS bulk_inquiries (
  id TEXT PRIMARY KEY,
  org_name TEXT NOT NULL,
  org_type TEXT DEFAULT 'Corporate CSR',
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  state TEXT DEFAULT '',
  city TEXT DEFAULT '',
  estimated_budget REAL DEFAULT 0,
  cause_id TEXT DEFAULT 'cause-everyday-essentials',
  requirements TEXT DEFAULT '',
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  subscriber_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  frequency TEXT DEFAULT 'Monthly',
  monthly_budget REAL DEFAULT 999,
  cause_id TEXT DEFAULT 'cause-everyday-essentials',
  delivery_address TEXT DEFAULT '',
  state TEXT DEFAULT '',
  pincode TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS field_audits (
  id TEXT PRIMARY KEY,
  auditor_name TEXT NOT NULL,
  auditor_phone TEXT DEFAULT '',
  audit_type TEXT DEFAULT 'Manufacturer Factory Inspection',
  subject_name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT DEFAULT '',
  latitude REAL,
  longitude REAL,
  zero_chemical_pass INTEGER DEFAULT 1,
  hygiene_pass INTEGER DEFAULT 1,
  fair_wage_pass INTEGER DEFAULT 1,
  impact_verified INTEGER DEFAULT 1,
  photo_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  verification_status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT DEFAULT '',
  shipping_address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  pincode TEXT DEFAULT '',
  upi_payout_id TEXT DEFAULT '',
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_code TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referral_earnings (
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  buyer_name TEXT DEFAULT '',
  order_subtotal REAL DEFAULT 0,
  commission_pct REAL DEFAULT 5,
  commission_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referral_payouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT DEFAULT '',
  user_email TEXT DEFAULT '',
  upi_id TEXT DEFAULT '',
  amount REAL NOT NULL,
  payout_type TEXT DEFAULT 'upi_withdraw',
  cause_id TEXT DEFAULT '',
  status TEXT DEFAULT 'requested',
  payout_utr TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Admin Account (admin@ugtindia.space / Admin@UGT2026!)
INSERT OR IGNORE INTO admin_users (id, email, password_hash, name, role) VALUES
('admin-ugt-001', 'admin@ugtindia.space', '09e9cf94cabea02f2d107e53322aef7d4c76cb6fdb8a35b2c33479113cbf8460', 'UGT Lead Operations', 'superadmin');

-- Seed Default Referral Commission Settings (5%, Min Payout ₹100)
INSERT OR IGNORE INTO site_integrations (key, value) VALUES
('referral_commission_pct', '5'),
('referral_min_payout', '100'),
('support_email', 'support@ugtindia.space');

-- Seed All 8 Living India National Missions at Fresh Live ₹0
INSERT OR REPLACE INTO causes (id, slug, title, tagline, category, description, icon, target_amount, raised_amount, impact_metric, impact_count, image_url) VALUES
('cause-women-entrepreneurship', 'women-entrepreneurship', 'Women Entrepreneurship', 'Equipping women makers with tools, capital, and direct market access', 'Livelihoods', 'Enables rural and semi-urban women to establish sustainable micro-enterprises, from textile weaving and herbal processing to decentralized services.', 'Sparkles', 750000, 0, 'Women Micro-Enterprises Funded', 0, '/missions/mission-01.jpg'),
('cause-ai-free-training', 'ai-free-training', 'AI Free Training', 'Democratizing free artificial intelligence & digital literacy for youth', 'Education & Tech', 'Providing youth in non-metro towns with hands-on AI tools, computational logic labs, and mentorship so they lead the intelligent economy.', 'BrainCircuit', 1000000, 0, 'Youth Certified in AI Skills', 0, '/missions/mission-02.jpg'),
('cause-everyday-essentials', 'everyday-essentials', 'Everyday Essentials', 'Establishing community-run essential stores across every PIN code', 'Local Economy', 'Ensuring routine household spending stays within the community, building local inventory, fair producer pricing, and resilient neighbourhood supply chains.', 'Store', 500000, 0, 'Local Community Hubs Supported', 0, '/missions/mission-03.jpg'),
('cause-protect-earth', 'protect-the-earth', 'Protect the Earth', 'Native agroforestry, living soil revival, and plastic-free stewardship', 'Ecological Health', 'Planting native food forests, supporting regenerative organic farmers, and establishing zero-waste circular loops in residential clusters.', 'Trees', 600000, 0, 'Native Trees Planted & Nurtured', 0, '/missions/mission-04.jpg'),
('cause-hill-and-city', 'hill-and-city', 'Hill and City', 'Balanced sustainable growth respecting mountain ecosystems & urban habitats', 'Town Development', 'Protecting fragile hill ecosystems from uncurbed commercial degradation while creating decentralized, breathable green zones in fast-growing cities.', 'Mountain', 500000, 0, 'Ecological Green Zones Created', 0, '/missions/mission-05.jpg'),
('cause-sports-ecosystem', 'sports-ecosystem', 'Sports Ecosystem', 'Scouting, coaching, and nurturing athletic talent from streets to districts', 'Youth & Health', 'Providing grassroots sports infrastructure, basic athletic equipment, and nutrition stipends so passionate youth can pursue athletic excellence.', 'Trophy', 400000, 0, 'Aspiring Athletes Sponsored', 0, '/missions/mission-06.jpg'),
('cause-water-security', 'water-security', 'Water Security', 'Solar filtration, aquifer recharge, and traditional well restoration', 'Ecological Health', 'Decentralized rainwater harvesting, revival of village stepwells, and solar-powered community filtration ensuring safe drinking water.', 'Droplets', 600000, 0, 'Liters Clean Water Delivered', 0, '/missions/mission-07.jpg'),
('cause-living-culture', 'living-culture', 'Living Culture', 'Sustaining endangered folk crafts, handlooms, and indigenous traditions', 'Culture & Arts', 'Direct stipends and apprenticeship circles for master artisans of bell-metal casting, organic khadi weaving, and indigenous performing arts.', 'Palette', 400000, 0, 'Master Artisans Supported', 0, '/missions/mission-08.jpg');
