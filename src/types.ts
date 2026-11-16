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
  guardian_id?: string;
  created_at: string;
  items?: OrderItem[];
  cause_title?: string;
  digital_items?: UnlockedDigitalItem[];
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
