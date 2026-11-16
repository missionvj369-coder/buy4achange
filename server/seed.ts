import { db, initDatabase, ensureDefaultAdmin } from './db.ts';

initDatabase();
ensureDefaultAdmin();

console.log('Seeding Buy4AChange with the 8 Official UGT India National Missions (ugtindia.space)...');

// Clear existing tables
db.exec(`
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM products;
  DELETE FROM causes;
  DELETE FROM payment_transactions;
`);

// The 8 Official National Missions of UGT India (Universal Guard Trust)
const causes = [
  {
    id: 'cause-everyday-essentials',
    slug: 'everyday-essentials',
    title: 'Everyday Essentials',
    tagline: 'Establishing community-run essential stores across every PIN code',
    category: 'Local Economy',
    description: 'Ensuring routine household spending stays within the community, building local inventory, fair producer pricing, and resilient neighbourhood supply chains.',
    icon: 'Store',
    target_amount: 500000,
    raised_amount: 0,
    impact_metric: 'Local Community Hubs Supported',
    impact_count: 0,
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cause-women-entrepreneurship',
    slug: 'women-entrepreneurship',
    title: 'Women Entrepreneurship',
    tagline: 'Equipping women makers with tools, capital, and direct market access',
    category: 'Livelihoods',
    description: 'Enables rural and semi-urban women to establish sustainable micro-enterprises, from textile weaving and herbal processing to decentralized services.',
    icon: 'Sparkles',
    target_amount: 750000,
    raised_amount: 0,
    impact_metric: 'Women Micro-Enterprises Funded',
    impact_count: 0,
    image_url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cause-ai-free-training',
    slug: 'ai-free-training',
    title: 'AI Free Training',
    tagline: 'Democratizing free artificial intelligence & digital literacy for youth',
    category: 'Education & Tech',
    description: 'Providing youth in non-metro towns with hands-on AI tools, computational logic labs, and mentorship so they lead the intelligent economy.',
    icon: 'BrainCircuit',
    target_amount: 1000000,
    raised_amount: 0,
    impact_metric: 'Youth Certified in AI Skills',
    impact_count: 0,
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cause-water-security',
    slug: 'water-security',
    title: 'Water Security',
    tagline: 'Solar filtration, aquifer recharge, and traditional well restoration',
    category: 'Ecological Health',
    description: 'Decentralized rainwater harvesting, revival of village stepwells, and solar-powered community filtration ensuring safe drinking water.',
    icon: 'Droplets',
    target_amount: 600000,
    raised_amount: 0,
    impact_metric: 'Liters Clean Water Delivered',
    impact_count: 0,
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cause-protect-earth',
    slug: 'protect-the-earth',
    title: 'Protect the Earth',
    tagline: 'Native agroforestry, living soil revival, and plastic-free stewardship',
    category: 'Ecological Health',
    description: 'Planting native food forests, supporting regenerative organic farmers, and establishing zero-waste circular loops in residential clusters.',
    icon: 'Trees',
    target_amount: 600000,
    raised_amount: 0,
    impact_metric: 'Native Trees Planted & Nurtured',
    impact_count: 0,
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cause-hill-and-city',
    slug: 'hill-and-city',
    title: 'Hill and City',
    tagline: 'Balanced sustainable growth respecting mountain ecosystems & urban habitats',
    category: 'Town Development',
    description: 'Protecting fragile hill ecosystems from uncurbed commercial degradation while creating decentralized, breathable green zones in fast-growing cities.',
    icon: 'Mountain',
    target_amount: 500000,
    raised_amount: 0,
    impact_metric: 'Ecological Green Zones Created',
    impact_count: 0,
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cause-sports-ecosystem',
    slug: 'sports-ecosystem',
    title: 'Sports Ecosystem',
    tagline: 'Scouting, coaching, and nurturing athletic talent from streets to districts',
    category: 'Youth & Health',
    description: 'Providing grassroots sports infrastructure, basic athletic equipment, and nutrition stipends so passionate youth can pursue athletic excellence.',
    icon: 'Trophy',
    target_amount: 400000,
    raised_amount: 0,
    impact_metric: 'Aspiring Athletes Sponsored',
    impact_count: 0,
    image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cause-living-culture',
    slug: 'living-culture',
    title: 'Living Culture',
    tagline: 'Sustaining endangered folk crafts, handlooms, and indigenous traditions',
    category: 'Culture & Arts',
    description: 'Direct stipends and apprenticeship circles for master artisans of bell-metal casting, organic khadi weaving, and indigenous performing arts.',
    icon: 'Palette',
    target_amount: 400000,
    raised_amount: 0,
    impact_metric: 'Master Artisans Supported',
    impact_count: 0,
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  }
];

const insertCauseStmt = db.prepare(`
  INSERT INTO causes (id, slug, title, tagline, category, description, icon, target_amount, raised_amount, impact_metric, impact_count, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const c of causes) {
  insertCauseStmt.run(
    c.id, c.slug, c.title, c.tagline, c.category, c.description, c.icon,
    c.target_amount, c.raised_amount, c.impact_metric, c.impact_count, c.image_url
  );
}

// Realistic Products
const products = [
  {
    id: 'prod-copper-carafe',
    name: 'Artisan Hand-Hammered Pure Copper Carafe (1.2L)',
    slug: 'artisan-copper-carafe',
    description: 'Forged by generational coppersmiths. Naturally purifies drinking water with antimicrobial oligodynamic properties. Includes matching solid copper tumbler.',
    price: 1899,
    compare_at_price: 2499,
    category: 'Living Culture',
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    stock: 45,
    is_featured: 1,
    cause_id: 'cause-water-security',
    cause_allocation_pct: 20.0,
    cause_impact_text: 'Provides 250 Liters of purified drinking water to drought-hit village clusters',
    rating: 4.95,
    reviews_count: 64,
    badge: 'Artisan Guild',
  },
  {
    id: 'prod-coldpress-oil',
    name: 'Cold-Pressed Virgin Coconut & Sesame Oil Duo (1L)',
    slug: 'cold-pressed-oil-duo',
    description: 'Traditional wood-pressed ("marachekku") slow extracted oil from certified regenerative coastal family farms. Unrefined, unbleached, rich in natural aroma.',
    price: 949,
    compare_at_price: 1200,
    category: 'Everyday Essentials',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    stock: 80,
    is_featured: 1,
    cause_id: 'cause-everyday-essentials',
    cause_allocation_pct: 15.0,
    cause_impact_text: 'Directly supports PIN-code community grain and essential inventory stores',
    rating: 4.9,
    reviews_count: 112,
    badge: 'Farm Direct',
  },
  {
    id: 'prod-khadi-shirt',
    name: 'Hand-Spun Khadi Organic Linen Relaxed Tunic',
    slug: 'khadi-linen-relaxed-tunic',
    description: 'Woven on indigenous wooden handlooms by women artisan collectives. Breathable, climate-responsive, dyed with natural plant indigo and wild turmeric.',
    price: 2450,
    compare_at_price: 3200,
    category: 'Women Entrepreneurship',
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    is_featured: 1,
    cause_id: 'cause-women-entrepreneurship',
    cause_allocation_pct: 25.0,
    cause_impact_text: 'Funds 1 full week of fair wage stipend and loom maintenance for rural women weavers',
    rating: 4.88,
    reviews_count: 43,
    badge: 'Fair Trade',
  },
  {
    id: 'prod-solar-lantern',
    name: 'Helios Solar Emergency Ambient Lamp & Device Hub',
    slug: 'helios-solar-lamp-hub',
    description: 'High-efficiency solar lantern with dual brightness settings and 5000mAh reserve battery for reliable home and student study lighting.',
    price: 1599,
    compare_at_price: 2199,
    category: 'AI Free Training',
    image_url: 'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?auto=format&fit=crop&w=800&q=80',
    stock: 62,
    is_featured: 1,
    cause_id: 'cause-ai-free-training',
    cause_allocation_pct: 18.0,
    cause_impact_text: 'Sponsors 2 weeks of digital learning lab connectivity for 5 rural students',
    rating: 4.92,
    reviews_count: 89,
    badge: 'Clean Energy',
  },
  {
    id: 'prod-forest-honey',
    name: 'Raw Monofloral Forest Honey & Wild Pollen (500g)',
    slug: 'raw-monofloral-forest-honey',
    description: 'Harvested sustainably by tribal forest guardians from wild apiaries in the Western Ghats. Unfiltered, non-pasteurized, naturally rich in pollen enzymes.',
    price: 699,
    compare_at_price: 899,
    category: 'Protect the Earth',
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    stock: 110,
    is_featured: 0,
    cause_id: 'cause-protect-earth',
    cause_allocation_pct: 15.0,
    cause_impact_text: 'Funds planting 2 native fruit tree saplings in village agroforestry commons',
    rating: 4.97,
    reviews_count: 178,
    badge: 'Wild Harvest',
  },
  {
    id: 'prod-kansa-bowl-set',
    name: 'Pure Kansa (Bell Metal) Traditional Dining Set',
    slug: 'pure-kansa-traditional-set',
    description: 'Forged from an authentic alloy of 78% copper and 22% tin. Helps alkalize food and improves gut microbiome balance as detailed in classical wellness texts.',
    price: 3800,
    compare_at_price: 4900,
    category: 'Living Culture',
    image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    stock: 20,
    is_featured: 1,
    cause_id: 'cause-living-culture',
    cause_allocation_pct: 20.0,
    cause_impact_text: 'Supports ancient bell-metal furnace guild preservation and youth apprentice training',
    rating: 5.0,
    reviews_count: 31,
    badge: 'Generational Craft',
  },
  {
    id: 'prod-bamboo-travel-kit',
    name: 'Zero-Waste Bamboo Travel Dining & Flask Kit',
    slug: 'zero-waste-bamboo-kit',
    description: 'Solid carved bamboo tumbler, fork, spoon, chopsticks, and coconut coir cleaning brush packed inside a washable unbleached hemp roll.',
    price: 899,
    compare_at_price: 1199,
    category: 'Hill and City',
    image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
    stock: 65,
    is_featured: 0,
    cause_id: 'cause-hill-and-city',
    cause_allocation_pct: 15.0,
    cause_impact_text: 'Supports community plastic-free mountain cleanup and hill trail preservation',
    rating: 4.91,
    reviews_count: 95,
    badge: 'Eco Living',
  },
  {
    id: 'prod-athletic-jump-rope',
    name: 'Precision Solid Wood & Leather Athletic Training Rope',
    slug: 'precision-athletic-training-rope',
    description: 'Handcrafted rosewood handles with high-speed ball bearings and genuine vegetable-tanned leather cord. Designed for speed, endurance, and conditioning.',
    price: 749,
    compare_at_price: 999,
    category: 'Sports Ecosystem',
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    stock: 45,
    is_featured: 0,
    cause_id: 'cause-sports-ecosystem',
    cause_allocation_pct: 20.0,
    cause_impact_text: 'Supplies sports footwear and training kits to promising school athletes',
    rating: 4.89,
    reviews_count: 38,
    badge: 'Grassroots Sports',
  }
];

const insertProductStmt = db.prepare(`
  INSERT INTO products (
    id, name, slug, description, price, compare_at_price, category,
    image_url, stock, is_featured, cause_id, cause_allocation_pct,
    cause_impact_text, rating, reviews_count, badge
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of products) {
  insertProductStmt.run(
    p.id, p.name, p.slug, p.description, p.price, p.compare_at_price, p.category,
    p.image_url, p.stock, p.is_featured, p.cause_id, p.cause_allocation_pct,
    p.cause_impact_text, p.rating, p.reviews_count, p.badge
  );
}

// Sample orders
const sampleOrders = [
  {
    id: 'ord-1001',
    order_number: 'B4C-2026-8941',
    customer_name: 'Ananya Sharma',
    customer_email: 'ananya.sharma@example.com',
    customer_phone: '+91 98450 12345',
    shipping_address: 'Flat 402, Lotus Residency, 12th Main, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India',
    subtotal: 1899,
    shipping_fee: 0,
    total_amount: 1899,
    cause_id: 'cause-water-security',
    cause_donation_amount: 379.8,
    cause_impact_delivered: '250 Liters of purified drinking water delivered to dry rural community',
    payment_method: 'Card Payment Switch',
    payment_status: 'paid',
    payment_id: 'pay_osm_8f912a7d4e',
    order_status: 'Processing',
    tracking_number: 'UGT-EXP-BLR-9041',
    guardian_id: 'UGT-IND-BLR-0419',
    created_at: new Date().toISOString(),
    items: [
      {
        id: 'item-1001-1',
        product_id: 'prod-copper-carafe',
        product_name: 'Artisan Hand-Hammered Pure Copper Carafe (1.2L)',
        price: 1899,
        quantity: 1,
        total: 1899,
        cause_id: 'cause-water-security',
        cause_allocation_pct: 20.0,
        cause_contribution: 379.8
      }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 'B4C-2026-8942',
    customer_name: 'Dr. Vikramaditya Nair',
    customer_email: 'vikram.nair@example.org',
    customer_phone: '+91 94471 99821',
    shipping_address: 'House #17, Palm Meadows, Kowdiar Avenue',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    pincode: '695003',
    country: 'India',
    subtotal: 4749,
    shipping_fee: 0,
    total_amount: 4749,
    cause_id: 'cause-living-culture',
    cause_donation_amount: 760.0,
    cause_impact_delivered: 'Generational bell-metal furnace guild preservation & artisan training',
    payment_method: 'UPI Instant Node',
    payment_status: 'paid',
    payment_id: 'pay_osm_3c72b11a92',
    order_status: 'Packed',
    tracking_number: 'UGT-EXP-TVM-3321',
    guardian_id: 'UGT-IND-KER-8812',
    created_at: new Date(Date.now() - 3600 * 4 * 1000).toISOString(),
    items: [
      {
        id: 'item-1002-1',
        product_id: 'prod-coldpress-oil',
        product_name: 'Cold-Pressed Virgin Coconut & Sesame Oil Duo (1L)',
        price: 949,
        quantity: 1,
        total: 949,
        cause_id: 'cause-everyday-essentials',
        cause_allocation_pct: 15.0,
        cause_contribution: 142.35
      },
      {
        id: 'item-1002-2',
        product_id: 'prod-kansa-bowl-set',
        product_name: 'Pure Kansa (Bell Metal) Traditional Dining Set',
        price: 3800,
        quantity: 1,
        total: 3800,
        cause_id: 'cause-living-culture',
        cause_allocation_pct: 20.0,
        cause_contribution: 760.0
      }
    ]
  }
];

const insertOrderStmt = db.prepare(`
  INSERT INTO orders (
    id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, city, state, pincode, country,
    subtotal, shipping_fee, total_amount, cause_id, cause_donation_amount,
    cause_impact_delivered, payment_method, payment_status, payment_id,
    order_status, tracking_number, guardian_id, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertOrderItemStmt = db.prepare(`
  INSERT INTO order_items (
    id, order_id, product_id, product_name, price, quantity, total, cause_id, cause_allocation_pct, cause_contribution
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const ord of sampleOrders) {
  insertOrderStmt.run(
    ord.id, ord.order_number, ord.customer_name, ord.customer_email, ord.customer_phone,
    ord.shipping_address, ord.city, ord.state, ord.pincode, ord.country,
    ord.subtotal, ord.shipping_fee, ord.total_amount, ord.cause_id, ord.cause_donation_amount,
    ord.cause_impact_delivered, ord.payment_method, ord.payment_status, ord.payment_id,
    ord.order_status, ord.tracking_number, ord.guardian_id, ord.created_at
  );

  for (const item of ord.items) {
    insertOrderItemStmt.run(
      item.id, ord.id, item.product_id, item.product_name, item.price,
      item.quantity, item.total, item.cause_id, item.cause_allocation_pct, item.cause_contribution
    );
  }
}

console.log('✓ Successfully seeded:');
console.log(`  - ${causes.length} Official UGT India National Missions`);
console.log(`  - ${products.length} Products`);
console.log(`  - ${sampleOrders.length} Initial Daily Orders`);
