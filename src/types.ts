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

export type ProductType = 'physical' | 'digital';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  subcategory?: string;
  product_type?: ProductType;
  digital_html_content?: string;
  digital_access_note?: string;
  has_digital_content?: boolean | number;
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

export interface Seller {
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
  bank_details?: string;
  story: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'suspended';
  admin_notes?: string;
  created_at: string;
  product_count?: number;
  pending_product_count?: number;
}

export interface ProductReview {
  id: string;
  product_id: string;
  order_number: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  verified_purchase: number;
  created_at: string;
}

export interface SellerEarningsSummary {
  totalGross: number;
  missionContribution: number;
  platformFee: number;
  netPayout: number;
  verifiedOrdersCount: number;
  pendingOrdersCount: number;
}

export interface BulkInquiry {
  id: string;
  org_name: string;
  org_type: string;
  contact_name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  estimated_budget: number;
  cause_id: string;
  cause_title?: string;
  requirements: string;
  status: 'new' | 'quoted' | 'approved' | 'fulfilled';
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  subscriber_name: string;
  email: string;
  phone: string;
  plan_name: string;
  frequency: string;
  monthly_budget: number;
  cause_id: string;
  cause_title?: string;
  delivery_address: string;
  state: string;
  pincode: string;
  status: 'active' | 'paused' | 'cancelled';
  created_at: string;
}

export interface FieldAuditReport {
  id: string;
  auditor_name: string;
  auditor_phone: string;
  audit_type: string;
  subject_name: string;
  state: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  zero_chemical_pass: number;
  hygiene_pass: number;
  fair_wage_pass: number;
  impact_verified: number;
  photo_url: string;
  notes: string;
  verification_status: 'pending' | 'verified' | 'flagged';
  created_at: string;
}

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  upi_payout_id: string;
  referral_code: string;
  referred_by_code?: string;
  created_at: string;
}

export interface ReferralEarning {
  id: string;
  referrer_user_id: string;
  order_id: string;
  order_number: string;
  buyer_name: string;
  order_subtotal: number;
  commission_pct: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid_out' | 'donated' | 'cancelled';
  created_at: string;
}

export interface ReferralPayout {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  upi_id: string;
  amount: number;
  payout_type: 'upi_withdraw' | 'donate_mission';
  cause_id?: string;
  status: 'requested' | 'paid' | 'rejected';
  payout_utr?: string;
  created_at: string;
}

export interface ReferralWalletSummary {
  commissionPct: number;
  minPayout: number;
  pendingEarnings: number;
  approvedEarnings: number;
  paidOutTotal: number;
  donatedTotal: number;
  availableBalance: number;
  totalReferralsCount: number;
  networkMissionImpact: number;
}

export interface UnlockedDigitalItem {
  product_id: string;
  product_name: string;
  subcategory?: string;
  category?: string;
  image_url?: string;
  digital_html_content: string;
  digital_access_note?: string;
  order_number: string;
  customer_email: string;
  purchased_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCauseId: string;
  selectedCauseTitle?: string;
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
  courier_name?: string;
  guardian_id?: string;
  created_at: string;
  items?: OrderItem[];
  cause_title?: string;
  digital_items?: UnlockedDigitalItem[];
}

export interface PublicLedgerEntry {
  order_number: string;
  supporter_initials: string;
  cause_id: string;
  cause_title: string;
  cause_donation_amount: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

export interface SiteIntegrations {
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

export interface EmailNotificationLog {
  id: string;
  order_number: string;
  recipient_email: string;
  event_type: string;
  subject: string;
  status: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  pageViews: number;
  missionReads: number;
  productViews: number;
  pdfDownloads: number;
  topMissions: { target_id: string; count: number }[];
  recentEmails: EmailNotificationLog[];
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  gateway: string;
  transaction_ref: string;
  status: string;
  method_details: string;
  webhook_payload?: string;
  created_at: string;
}

export interface AdminMetrics {
  totalRevenue: number;
  totalRaised: number;
  totalOrders: number;
  todayOrdersCount: number;
  todayRevenue: number;
  todayRaised: number;
  totalProducts: number;
  totalCauses: number;
}
