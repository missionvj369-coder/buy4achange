import React, { useState, useEffect } from 'react';
import {
  Package, ShoppingCart, Plus, Edit, Trash2, Printer, ShieldCheck,
  Heart, Database, RefreshCw, Lock, LogOut, ArrowLeft, ExternalLink,
  ChevronRight, Calendar, CheckCircle2, AlertCircle, CreditCard, Key,
  Copy, Check, Zap, Server, Upload, Image as ImageIcon, X, RotateCcw,
  BookOpen, Code2, Eye, FileCode
} from 'lucide-react';
import { Product, Order, Cause, AdminMetrics, PaymentTransaction, UnlockedDigitalItem } from '../types.ts';
import { EPRODUCT_SUBCATEGORIES } from './EProductsSection.tsx';
import { DigitalReaderModal } from './DigitalReaderModal.tsx';

interface AdminPortalProps {
  causes: Cause[];
  products: Product[];
  onRefreshData: () => void;
  onNavigateStore: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  causes,
  products,
  onRefreshData,
  onNavigateStore,
}) => {
  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('buy4achange_admin_token'));
  const [loginEmail, setLoginEmail] = useState('admin@ugtindia.space');
  const [loginPassword, setLoginPassword] = useState('Admin@UGT2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'missions' | 'transactions' | 'gateway'>('orders');
  
  // Data states
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDateFilter, setOrderDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('all');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  // Open-Source Payment Gateway Config State
  const [gwConfig, setGwConfig] = useState({
    mode: 'direct_upi' as 'direct_upi' | 'hyperswitch_sandbox' | 'hyperswitch_live',
    hyperswitch_base_url: 'https://sandbox.hyperswitch.io',
    hyperswitch_api_key: '',
    hyperswitch_publishable_key: '',
    hyperswitch_profile_id: '',
    hyperswitch_webhook_hash_key: '',
    merchant_upi_vpa: 'ugtindia@upi',
    merchant_name: 'Buy4AChange UGT India',
    currency: 'INR',
    enable_card: true,
    enable_upi: true,
    enable_netbanking: true,
    webhook_url: '',
    hyperswitch_ready: false,
  });
  const [savingGw, setSavingGw] = useState(false);
  const [testingGw, setTestingGw] = useState(false);
  const [gwNotice, setGwNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Product CRUD modal state
  const [adminProducts, setAdminProducts] = useState<Product[]>(products);
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'physical' | 'digital'>('all');
  const [previewDigitalItem, setPreviewDigitalItem] = useState<UnlockedDigitalItem | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoSizeKb, setPhotoSizeKb] = useState<number | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [productNotice, setProductNotice] = useState<string | null>(null);
  const [resettingMissions, setResettingMissions] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    category: 'Living Culture',
    subcategory: 'eBooks',
    product_type: 'physical' as 'physical' | 'digital',
    digital_html_content: '',
    digital_access_note: 'Instant interactive HTML access unlocked immediately after purchase',
    image_url: '',
    stock: '50',
    cause_id: causes[0]?.id || 'cause-everyday-essentials',
    cause_allocation_pct: '15',
    cause_impact_text: '',
    badge: '',
  });

  // Shipping Label Printout Modal state
  const [printOrders, setPrintOrders] = useState<Order[] | null>(null);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      localStorage.setItem('buy4achange_admin_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('buy4achange_admin_token');
    setToken(null);
  };

  // Fetch Admin Data
  const fetchMetrics = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async (filter = orderDateFilter) => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/admin/orders?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setTransactions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGatewayConfig = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/payment-config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setGwConfig((prev) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGatewayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingGw(true);
    setGwNotice(null);
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gwConfig),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save configuration');
      }
      setGwConfig((prev) => ({ ...prev, ...data.config }));
      setGwNotice({ ok: true, text: 'Payment gateway configuration saved and active immediately.' });
    } catch (err: any) {
      setGwNotice({ ok: false, text: err.message || 'Save failed' });
    } finally {
      setSavingGw(false);
    }
  };

  const handleTestGateway = async () => {
    if (!token) return;
    setTestingGw(true);
    setGwNotice(null);
    try {
      const res = await fetch('/api/admin/payment-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gwConfig),
      });
      const data = await res.json();
      setGwNotice({
        ok: Boolean(data.ok),
        text: data.message || (data.ok ? 'Connection verified' : 'Connection test failed'),
      });
    } catch (err: any) {
      setGwNotice({ ok: false, text: err.message || 'Connection test failed' });
    } finally {
      setTestingGw(false);
    }
  };

  const fetchAdminProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminProducts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setAdminProducts((prev) => (prev.length === 0 ? products : prev));
  }, [products]);

  useEffect(() => {
    if (token) {
      fetchMetrics();
      fetchOrders(orderDateFilter);
      fetchTransactions();
      fetchGatewayConfig();
      fetchAdminProducts();
    }
  }, [token, orderDateFilter]);

  // Order Status Update
  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders(orderDateFilter);
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Resize & compress uploaded photo into an optimized JPEG Data URL (fast in D1 & instant on storefront)
  const compressImageToDataUrl = (file: File): Promise<{ dataUrl: string; sizeKb: number }> =>
    new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(new Error('Please select a valid image file (JPG, PNG, WebP).'));
      }
      if (file.size > 15 * 1024 * 1024) {
        return reject(new Error('Photo is too large (max 15 MB).'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not decode image file.'));
        img.onload = () => {
          const MAX_DIM = 900;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width >= height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context unavailable'));
          ctx.fillStyle = '#0f1728';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          resolve({ dataUrl, sizeKb });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handlePhotoFileChange = async (file: File | null) => {
    if (!file) return;
    setUploadingPhoto(true);
    setProductError(null);
    try {
      const { dataUrl, sizeKb } = await compressImageToDataUrl(file);
      setProductForm((prev) => ({ ...prev, image_url: dataUrl }));
      setPhotoSizeKb(sizeKb);
    } catch (err: any) {
      setProductError(err.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Reset all 8 missions to zero (live data start)
  const handleResetMissions = async () => {
    if (!token) return;
    if (!confirm('Reset all 8 UGT India mission totals and impact counters to 0?')) return;
    setResettingMissions(true);
    try {
      const res = await fetch('/api/admin/missions/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onRefreshData();
        fetchAdminProducts();
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResettingMissions(false);
    }
  };

  // Product Save (Add / Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!productForm.image_url) {
      setProductError('Please upload a product cover photo before saving.');
      return;
    }
    if (productForm.product_type === 'digital' && !productForm.digital_html_content.trim()) {
      setProductError('Please paste or upload the HTML code for this eProduct / eBook.');
      return;
    }
    setSavingProduct(true);
    setProductError(null);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';

      const payload = {
        ...productForm,
        cause_id: productForm.cause_id || causes[0]?.id || 'cause-everyday-essentials',
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Failed to save product (HTTP ${res.status})`);
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setPhotoSizeKb(null);
      setProductNotice(
        editingProduct
          ? `"${productForm.name}" updated live on the storefront.`
          : productForm.product_type === 'digital'
          ? `E-Product "${productForm.name}" published live to E-Products & eBooks (HTML locked until purchase).`
          : `"${productForm.name}" published live on the storefront.`
      );
      setTimeout(() => setProductNotice(null), 4500);
      onRefreshData();
      fetchAdminProducts();
      fetchMetrics();
    } catch (err: any) {
      setProductError(err.message || 'Could not save product. Please try again.');
    } finally {
      setSavingProduct(false);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        onRefreshData();
        fetchAdminProducts();
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddProductModal = (defaultType: 'physical' | 'digital' = 'physical') => {
    setEditingProduct(null);
    setProductError(null);
    setPhotoSizeKb(null);
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      compare_at_price: '',
      category: defaultType === 'digital' ? 'E-Products & eBooks' : 'Living Culture',
      subcategory: defaultType === 'digital' ? 'eBooks' : '',
      product_type: defaultType,
      digital_html_content: '',
      digital_access_note: 'Instant interactive HTML access unlocked immediately after purchase',
      image_url: '',
      stock: defaultType === 'digital' ? '9999' : '50',
      cause_id: causes[0]?.id || 'cause-everyday-essentials',
      cause_allocation_pct: '20',
      cause_impact_text: 'Directly funds UGT India grassroots mission',
      badge: defaultType === 'digital' ? 'Instant Digital Unlock' : '',
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductError(null);
    setPhotoSizeKb(null);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: prod.price.toString(),
      compare_at_price: prod.compare_at_price?.toString() || '',
      category: prod.category,
      subcategory: prod.subcategory || (prod.product_type === 'digital' ? 'eBooks' : ''),
      product_type: prod.product_type === 'digital' ? 'digital' : 'physical',
      digital_html_content: prod.digital_html_content || '',
      digital_access_note:
        prod.digital_access_note || 'Instant interactive HTML access unlocked immediately after purchase',
      image_url: prod.image_url,
      stock: prod.stock.toString(),
      cause_id: prod.cause_id || causes[0]?.id || 'cause-everyday-essentials',
      cause_allocation_pct: prod.cause_allocation_pct.toString(),
      cause_impact_text: prod.cause_impact_text,
      badge: prod.badge || '',
    });
    setShowProductModal(true);
  };

  const handleHtmlFileUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProductForm((prev) => ({
        ...prev,
        digital_html_content: String(reader.result || ''),
      }));
    };
    reader.readAsText(file);
  };

  const insertSampleEbookHtml = () => {
    const title = productForm.name || 'UGT India Conscious Living eBook';
    const sample = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; font-family: Georgia, serif; background: #070b14; color: #e2e8f0; line-height: 1.8; }
    .container { max-width: 780px; margin: 0 auto; padding: 48px 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(16,185,129,0.15); color: #6ee7b7; font-family: sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; }
    h1 { font-size: 2.4rem; color: #ffffff; margin: 16px 0 8px; line-height: 1.2; }
    h2 { color: #34d399; margin-top: 36px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">Buy4AChange · Exclusive Unlocked Edition</span>
    <h1>${title}</h1>
    <p>Thank you for supporting UGT India's national missions. This interactive HTML edition is unlocked exclusively for verified buyers.</p>
    <div class="card">
      <h2>Chapter 1: Purpose-Driven Action</h2>
      <p>Replace this sample content with your full HTML eBook, interactive course, calculator, or digital toolkit.</p>
    </div>
  </div>
</body>
</html>`;
    setProductForm((prev) => ({ ...prev, digital_html_content: sample }));
  };

  // --- VIEW 1: ADMIN LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f1728] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-display">
              UGT Operations Console
            </h2>
            <p className="text-xs text-slate-400">
              Secure administration portal for Buy4AChange & UGT India
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Administrator Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick credentials hint */}
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
              <span className="text-slate-300 font-semibold">Configured Login: </span>
              <span className="font-mono text-emerald-400">admin@ugtindia.space</span> / <span className="font-mono text-amber-300">Admin@UGT2026!</span>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              {loggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Operations Console</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              onClick={onNavigateStore}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTHENTICATED ADMIN CONSOLE ---
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      
      {/* Top Console Navigation Bar */}
      <header className="bg-[#0f1728] border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateStore}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs flex items-center space-x-1.5"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Store</span>
            </button>
            <div className="h-5 w-px bg-slate-700" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-sm sm:text-base text-white">
                  Buy4AChange Console
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  UGT INDIA
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center space-x-1 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Products ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('missions')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'missions'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              8 Missions
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Transactions
            </button>

            <button
              onClick={() => setActiveTab('gateway')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'gateway'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Gateway</span>
            </button>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-2">
            <span className="hidden md:inline text-xs text-slate-400 font-mono">
              admin@ugtindia.space
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition-all text-xs"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#0f1728] p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Gross Revenue</span>
            <div className="text-xl sm:text-2xl font-black text-white font-display mt-1">
              ₹{(metrics?.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              Today: ₹{(metrics?.todayRevenue || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0f1728] p-4 rounded-2xl border border-emerald-900/40">
            <span className="text-xs text-emerald-300 font-medium flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Total Cause Funds Raised</span>
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-display mt-1">
              ₹{(metrics?.totalRaised || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              Today's Impact: ₹{(metrics?.todayRaised || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0f1728] p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Orders Fulfilled</span>
            <div className="text-xl sm:text-2xl font-black text-white font-display mt-1">
              {metrics?.totalOrders || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Today: {metrics?.todayOrdersCount || 0} orders
            </div>
          </div>

          <div className="bg-[#0f1728] p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">UGT India Missions</span>
            <div className="text-xl sm:text-2xl font-black text-white font-display mt-1">
              {causes.length}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              100% Verified Community Hubs
            </div>
          </div>
        </div>

        {/* TAB 1: DAILY ORDERS & ADDRESS PRINTOUT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter and Batch Print Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0f1728] p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
                  Orders:
                </span>
                <button
                  onClick={() => setOrderDateFilter('today')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    orderDateFilter === 'today'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setOrderDateFilter('yesterday')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    orderDateFilter === 'yesterday'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Yesterday
                </button>
                <button
                  onClick={() => setOrderDateFilter('week')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    orderDateFilter === 'week'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setOrderDateFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    orderDateFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  All ({orders.length})
                </button>
              </div>

              {/* Batch Print Button */}
              <button
                onClick={() => setPrintOrders(orders)}
                disabled={orders.length === 0}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm flex items-center space-x-2 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Batch Print Address Slips ({orders.length})</span>
              </button>
            </div>

            {/* Orders Table */}
            <div className="bg-[#0f1728] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {loadingOrders ? (
                <div className="py-16 text-center text-slate-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  <span className="text-xs">Loading orders...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-1">
                  <ShoppingCart className="w-7 h-7 mx-auto text-slate-600" />
                  <p className="text-xs">No orders found for this filter period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#131d31] uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Order # / Date</th>
                        <th className="px-5 py-3.5">Customer & PIN Code</th>
                        <th className="px-5 py-3.5">Items & Amount</th>
                        <th className="px-5 py-3.5">Cause Allocation</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Address Slip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                          
                          <td className="px-5 py-3.5">
                            <div className="font-mono font-bold text-white text-xs">
                              {ord.order_number}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {new Date(ord.created_at).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                              {ord.tracking_number}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-100">{ord.customer_name}</div>
                            <div className="text-slate-400 text-[11px]">{ord.customer_phone}</div>
                            <div className="inline-block mt-0.5 font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                              PIN: {ord.pincode}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-extrabold text-white text-xs">
                              ₹{ord.total_amount.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {ord.items?.length || 1} product(s)
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-bold text-amber-300 text-xs">
                              ₹{ord.cause_donation_amount}
                            </div>
                            <div className="text-[11px] text-emerald-300 line-clamp-1">
                              {ord.cause_title || 'UGT National Mission'}
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <select
                              value={ord.order_status}
                              onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                                ord.order_status === 'Delivered'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : ord.order_status === 'Shipped'
                                  ? 'bg-blue-950 text-blue-300 border-blue-700'
                                  : ord.order_status === 'Packed'
                                  ? 'bg-purple-950 text-purple-300 border-purple-700'
                                  : 'bg-amber-950 text-amber-300 border-amber-700'
                              }`}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => setPrintOrders([ord])}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs inline-flex items-center space-x-1.5 transition-all"
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-400" />
                              <span>Print Slip</span>
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCT INVENTORY CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Products &amp; E-Products Management</h3>
                <p className="text-xs text-slate-400">
                  Manage physical catalog items and interactive HTML eProducts / eBooks ({adminProducts.length} active)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onNavigateStore}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View Live Store</span>
                </button>
                <button
                  onClick={() => openAddProductModal('digital')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Add E-Product / eBook</span>
                </button>
                <button
                  onClick={() => openAddProductModal('physical')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Product Type Filter Strip */}
            <div className="flex items-center space-x-2">
              {(
                [
                  { id: 'all', label: `All (${adminProducts.length})` },
                  {
                    id: 'physical',
                    label: `Physical (${adminProducts.filter((p) => p.product_type !== 'digital').length})`,
                  },
                  {
                    id: 'digital',
                    label: `E-Products & eBooks (${adminProducts.filter((p) => p.product_type === 'digital').length})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProductTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    productTypeFilter === tab.id
                      ? tab.id === 'digital'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {productNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{productNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminProducts
                .filter((p) =>
                  productTypeFilter === 'all'
                    ? true
                    : productTypeFilter === 'digital'
                    ? p.product_type === 'digital'
                    : p.product_type !== 'digital'
                )
                .map((p) => {
                  const isDigital = p.product_type === 'digital';
                  return (
                    <div
                      key={p.id}
                      className={`bg-[#0f1728] border rounded-2xl p-4 flex flex-col justify-between space-y-3 ${
                        isDigital ? 'border-cyan-500/30' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex space-x-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-16 h-16 rounded-xl object-cover bg-slate-900 shrink-0 border border-slate-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-500 shrink-0">
                            {isDigital ? <BookOpen className="w-6 h-6" /> : <ImageIcon className="w-6 h-6 text-slate-600" />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <span
                              className={`text-[10px] font-semibold uppercase truncate ${
                                isDigital ? 'text-cyan-400' : 'text-emerald-400'
                              }`}
                            >
                              {isDigital ? `E-Product · ${p.subcategory || 'eBooks'}` : p.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                isDigital
                                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                  : p.stock > 0
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {isDigital ? 'HTML Locked' : p.stock > 0 ? `Live · ${p.stock}` : 'Sold Out'}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-xs line-clamp-1 mt-0.5">{p.name}</h4>
                          <div className="text-sm font-extrabold text-amber-300 mt-0.5">
                            ₹{p.price.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-emerald-300 line-clamp-1">
                            {p.cause_allocation_pct}% to {p.cause_title || 'UGT Mission'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                        {isDigital && p.digital_html_content && (
                          <button
                            onClick={() =>
                              setPreviewDigitalItem({
                                product_id: p.id,
                                product_name: p.name,
                                subcategory: p.subcategory,
                                category: p.category,
                                image_url: p.image_url,
                                digital_html_content: p.digital_html_content || '',
                                order_number: 'ADMIN-PREVIEW',
                                customer_email: 'admin@ugtindia.space',
                              })
                            }
                            className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 transition-all text-xs flex items-center space-x-1 border border-cyan-800/40"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-all text-xs flex items-center space-x-1 border border-rose-800/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: UGT 8 MISSIONS TRACKER */}
        {activeTab === 'missions' && (
          <div className="space-y-4">
            <div className="bg-[#0f1728] p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">
                      UGT India 8 National Missions — Live Status
                    </h3>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE DATA</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time contributions updated automatically with every verified order.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => { onRefreshData(); fetchMetrics(); }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handleResetMissions}
                    disabled={resettingMissions}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/50 text-rose-200 text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${resettingMissions ? 'animate-spin' : ''}`} />
                    <span>{resettingMissions ? 'Resetting...' : 'Reset All to ₹0'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {causes.map((c) => {
                  const pct = c.target_amount > 0 ? Math.min(100, (c.raised_amount / c.target_amount) * 100) : 0;
                  return (
                    <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white text-xs">{c.title}</span>
                          <span className="text-slate-400 ml-2">({c.category})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-amber-300">
                            ₹{Math.round(c.raised_amount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-400"> / ₹{(c.target_amount / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{c.tagline}</span>
                        <span className="font-bold text-emerald-400">{(c.impact_count || 0).toLocaleString('en-IN')} {c.impact_metric}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS LEDGER */}
        {activeTab === 'transactions' && (
          <div className="bg-[#0f1728] p-5 rounded-2xl border border-slate-800 space-y-3">
            <div>
              <h3 className="text-base font-bold text-white">Payment Audit Trail</h3>
              <p className="text-xs text-slate-400">Verifiable cryptographic payment records</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#131d31] uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Order Ref</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-2.5 font-mono text-emerald-400 font-bold">{tx.id}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-300">{tx.order_id}</td>
                      <td className="px-4 py-2.5 font-bold text-white">₹{tx.amount}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: OPEN-SOURCE PAYMENT GATEWAY CONFIGURATION */}
        {activeTab === 'gateway' && (
          <div className="space-y-5">
            <div className="bg-[#0f1728] p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">Open-Source Payment Gateway Configuration</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        gwConfig.mode === 'direct_upi'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : gwConfig.hyperswitch_ready
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {gwConfig.mode === 'direct_upi'
                        ? 'Direct NPCI UPI Active'
                        : gwConfig.hyperswitch_ready
                        ? 'Hyperswitch Live'
                        : 'Keys Required'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Powered by{' '}
                    <a
                      href="https://github.com/juspay/hyperswitch"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Juspay Hyperswitch (GitHub · Apache 2.0)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and NPCI Open UPI QR Intent.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleTestGateway}
                    disabled={testingGw}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition"
                  >
                    {testingGw ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Test Connection</span>
                  </button>
                </div>
              </div>

              {gwNotice && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2 ${
                    gwNotice.ok
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {gwNotice.ok ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  )}
                  <span>{gwNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveGatewayConfig} className="space-y-6">
                {/* Operating Mode Cards */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    1. Active Payment Engine Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'direct_upi' as const,
                        title: 'Direct NPCI UPI + Local Checkout',
                        desc: 'Zero-fee scannable UPI QR & deep links (GPay, PhonePe, Paytm, BHIM) + Card/NetBanking.',
                      },
                      {
                        id: 'hyperswitch_sandbox' as const,
                        title: 'Hyperswitch Sandbox',
                        desc: 'Connect to sandbox.hyperswitch.io for live open-source Unified Checkout testing.',
                      },
                      {
                        id: 'hyperswitch_live' as const,
                        title: 'Hyperswitch Live / Self-Hosted',
                        desc: 'Production api.hyperswitch.io or your own Docker container from GitHub.',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setGwConfig((prev) => ({
                            ...prev,
                            mode: opt.id,
                            hyperswitch_base_url:
                              opt.id === 'hyperswitch_sandbox'
                                ? 'https://sandbox.hyperswitch.io'
                                : opt.id === 'hyperswitch_live' &&
                                  prev.hyperswitch_base_url.includes('sandbox')
                                ? 'https://api.hyperswitch.io'
                                : prev.hyperswitch_base_url,
                          }));
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          gwConfig.mode === opt.id
                            ? 'bg-emerald-500/10 border-emerald-400 shadow-sm'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{opt.title}</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Merchant & Direct UPI Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Merchant UPI VPA (NPCI)
                    </label>
                    <input
                      type="text"
                      value={gwConfig.merchant_upi_vpa}
                      onChange={(e) => setGwConfig({ ...gwConfig, merchant_upi_vpa: e.target.value })}
                      placeholder="ugtindia@upi"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Merchant Display Name
                    </label>
                    <input
                      type="text"
                      value={gwConfig.merchant_name}
                      onChange={(e) => setGwConfig({ ...gwConfig, merchant_name: e.target.value })}
                      placeholder="Buy4AChange UGT India"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Settlement Currency
                    </label>
                    <select
                      value={gwConfig.currency}
                      onChange={(e) => setGwConfig({ ...gwConfig, currency: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="INR">INR (₹ Indian Rupee)</option>
                      <option value="USD">USD ($ US Dollar)</option>
                      <option value="EUR">EUR (€ Euro)</option>
                    </select>
                  </div>
                </div>

                {/* Enabled Checkout Methods */}
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-xs font-semibold text-slate-400">Enabled Methods:</span>
                  {[
                    { key: 'enable_upi' as const, label: 'UPI / QR Code' },
                    { key: 'enable_card' as const, label: 'Credit / Debit Card' },
                    { key: 'enable_netbanking' as const, label: 'NetBanking' },
                  ].map((m) => (
                    <label
                      key={m.key}
                      className="inline-flex items-center space-x-2 text-xs text-slate-200 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={gwConfig[m.key]}
                        onChange={(e) => setGwConfig({ ...gwConfig, [m.key]: e.target.checked })}
                        className="accent-emerald-500 rounded"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>

                {/* Juspay Hyperswitch Credentials */}
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        2. Juspay Hyperswitch API Credentials (github.com/juspay/hyperswitch)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          setGwConfig({ ...gwConfig, hyperswitch_base_url: 'https://sandbox.hyperswitch.io' })
                        }
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        Sandbox URL
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGwConfig({ ...gwConfig, hyperswitch_base_url: 'https://api.hyperswitch.io' })
                        }
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        Production URL
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGwConfig({ ...gwConfig, hyperswitch_base_url: 'http://localhost:8080' })
                        }
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300"
                      >
                        Self-Hosted Docker (:8080)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hyperswitch API Base URL
                      </label>
                      <input
                        type="url"
                        value={gwConfig.hyperswitch_base_url}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_base_url: e.target.value })
                        }
                        placeholder="https://sandbox.hyperswitch.io"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Profile ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={gwConfig.hyperswitch_profile_id}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_profile_id: e.target.value })
                        }
                        placeholder="pro_xxxxxxxxxxxxxxxx"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Secret API Key (<code className="text-emerald-400">api-key</code>)
                      </label>
                      <input
                        type="password"
                        value={gwConfig.hyperswitch_api_key}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_api_key: e.target.value })
                        }
                        placeholder="snd_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Publishable Key (<code className="text-emerald-400">pk_snd_...</code>)
                      </label>
                      <input
                        type="text"
                        value={gwConfig.hyperswitch_publishable_key}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_publishable_key: e.target.value })
                        }
                        placeholder="pk_snd_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Payment Response Hash Key (HMAC-SHA512 Webhook)
                      </label>
                      <input
                        type="password"
                        value={gwConfig.hyperswitch_webhook_hash_key}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_webhook_hash_key: e.target.value })
                        }
                        placeholder="Paste webhook hash key from Hyperswitch Dashboard"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your Webhook Endpoint URL (Copy into Hyperswitch)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value={
                            gwConfig.webhook_url ||
                            `${window.location.origin}/api/payment/webhook/hyperswitch`
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              gwConfig.webhook_url ||
                                `${window.location.origin}/api/payment/webhook/hyperswitch`
                            );
                            setCopiedWebhook(true);
                            setTimeout(() => setCopiedWebhook(false), 2000);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                          title="Copy Webhook URL"
                        >
                          {copiedWebhook ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingGw}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-sm flex items-center space-x-2 transition active:scale-95"
                  >
                    {savingGw ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>{savingGw ? 'Saving...' : 'Save Gateway Configuration'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Self-Host Open-Source Hyperswitch Guide */}
            <div className="bg-[#0f1728] p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Self-Hosting Juspay Hyperswitch via GitHub Docker (Optional)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                <div className="text-emerald-400"># Clone &amp; run the official Apache 2.0 gateway locally</div>
                <div>git clone https://github.com/juspay/hyperswitch.git &amp;&amp; cd hyperswitch</div>
                <div>docker compose up -d</div>
                <div className="text-slate-500 pt-1">
                  # Then set Base URL above to http://localhost:8080 and paste your API &amp; Publishable keys.
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: ADD / EDIT PRODUCT OR E-PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0f1728] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-6">
            <div className="p-4 border-b border-slate-800 bg-[#131d31] flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                {productForm.product_type === 'digital' ? (
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Package className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {editingProduct
                    ? productForm.product_type === 'digital'
                      ? 'Edit E-Product / eBook'
                      : 'Edit Product'
                    : productForm.product_type === 'digital'
                    ? 'Add New E-Product / eBook (HTML)'
                    : 'Add New Product'}
                </span>
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3.5 text-xs max-h-[82vh] overflow-y-auto">
              {/* Product Type Switcher: Physical vs Digital E-Product / eBook */}
              <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setProductForm((prev) => ({
                      ...prev,
                      product_type: 'physical',
                      category: prev.category === 'E-Products & eBooks' ? 'Living Culture' : prev.category,
                      stock: prev.stock === '9999' ? '50' : prev.stock,
                    }))
                  }
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition ${
                    productForm.product_type === 'physical'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Physical Product</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProductForm((prev) => ({
                      ...prev,
                      product_type: 'digital',
                      category: 'E-Products & eBooks',
                      subcategory: prev.subcategory || 'eBooks',
                      stock: '9999',
                    }))
                  }
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition ${
                    productForm.product_type === 'digital'
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>E-Product / eBook (HTML)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    {productForm.product_type === 'digital' ? 'eBook / E-Product Title' : 'Product Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder={
                      productForm.product_type === 'digital'
                        ? 'e.g. Complete AI Mastery Interactive eBook'
                        : 'e.g. Handwoven Cotton Kurta'
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                {productForm.product_type === 'digital' ? (
                  <div>
                    <label className="block text-cyan-300 font-semibold mb-1">E-Product Subcategory</label>
                    <select
                      value={
                        EPRODUCT_SUBCATEGORIES.includes(productForm.subcategory)
                          ? productForm.subcategory
                          : '__custom__'
                      }
                      onChange={(e) => {
                        if (e.target.value !== '__custom__') {
                          setProductForm({ ...productForm, subcategory: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 text-white"
                    >
                      {EPRODUCT_SUBCATEGORIES.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                      <option value="__custom__">Custom Subcategory...</option>
                    </select>
                    <input
                      type="text"
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                      placeholder="Or type custom subcategory (e.g. Audio Guides)"
                      className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-cyan-200"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Living Culture">Living Culture</option>
                      <option value="Everyday Essentials">Everyday Essentials</option>
                      <option value="Women Entrepreneurship">Women Entrepreneurship</option>
                      <option value="AI Free Training">AI Free Training</option>
                      <option value="Water Security">Water Security</option>
                      <option value="Protect the Earth">Protect the Earth</option>
                      <option value="Hill and City">Hill and City</option>
                      <option value="Sports Ecosystem">Sports Ecosystem</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.compare_at_price}
                    onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              {productError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{productError}</span>
                </div>
              )}

              {/* Upload Product Photo (replaces external image link) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Product Photo</label>

                {productForm.image_url ? (
                  <div className="relative rounded-2xl border border-slate-700 bg-slate-900/80 p-3 flex items-center space-x-4">
                    <img
                      src={productForm.image_url}
                      alt="Product preview"
                      className="w-24 h-24 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Photo ready for live storefront</span>
                      </div>
                      {photoSizeKb !== null && (
                        <div className="text-[11px] text-slate-400">
                          Auto-optimized · {photoSizeKb} KB
                        </div>
                      )}
                      <div className="flex items-center space-x-2 pt-0.5">
                        <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] cursor-pointer inline-flex items-center space-x-1.5 transition">
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Change Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoFileChange(e.target.files?.[0] || null)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm((prev) => ({ ...prev, image_url: '' }));
                            setPhotoSizeKb(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 font-bold text-[11px] inline-flex items-center space-x-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handlePhotoFileChange(e.dataTransfer.files?.[0] || null);
                    }}
                    className="flex flex-col items-center justify-center w-full py-6 px-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition-all text-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      {uploadingPhoto ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white">
                      {uploadingPhoto ? 'Optimizing photo...' : 'Click to upload photo or drag & drop'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      JPG, PNG, or WebP · Automatically compressed for fast global loading
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoFileChange(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* DIGITAL HTML CODE EDITOR (Only for E-Products & eBooks — Locked on Server Until Purchase) */}
              {productForm.product_type === 'digital' && (
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                        <Code2 className="w-4 h-4" />
                        <span>Interactive HTML Code (eBook / eProduct Content)</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Strictly locked on server — delivered and executed for the buyer ONLY after verified payment.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <label className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] cursor-pointer inline-flex items-center space-x-1 transition">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Upload .html</span>
                        <input
                          type="file"
                          accept=".html,.htm,text/html"
                          className="hidden"
                          onChange={(e) => handleHtmlFileUpload(e.target.files?.[0] || null)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={insertSampleEbookHtml}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] transition"
                      >
                        Sample Template
                      </button>
                      {productForm.digital_html_content.trim() && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDigitalItem({
                              product_id: editingProduct?.id || 'preview',
                              product_name: productForm.name || 'Live Preview',
                              subcategory: productForm.subcategory,
                              category: productForm.category,
                              image_url: productForm.image_url,
                              digital_html_content: productForm.digital_html_content,
                              order_number: 'ADMIN-PREVIEW',
                              customer_email: 'admin@ugtindia.space',
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] inline-flex items-center space-x-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview HTML</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    required={productForm.product_type === 'digital'}
                    value={productForm.digital_html_content}
                    onChange={(e) =>
                      setProductForm({ ...productForm, digital_html_content: e.target.value })
                    }
                    placeholder="<!DOCTYPE html>&#10;<html>&#10;  <body>&#10;    <h1>Your interactive eBook or HTML eProduct code here...</h1>&#10;  </body>&#10;</html>"
                    className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2.5 font-mono text-[11px] text-cyan-100 focus:border-cyan-400 focus:outline-none leading-relaxed"
                  />

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Buyer Access Note (shown before purchase)
                    </label>
                    <input
                      type="text"
                      value={productForm.digital_access_note}
                      onChange={(e) =>
                        setProductForm({ ...productForm, digital_access_note: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
                <div className="text-[11px] font-bold text-emerald-300">Default Mission & Impact Allocation</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Primary Mission</label>
                    <select
                      value={productForm.cause_id}
                      onChange={(e) => setProductForm({ ...productForm, cause_id: e.target.value })}
                      className="w-full bg-slate-900 border border-emerald-600/50 rounded-xl px-2.5 py-1.5 text-white"
                    >
                      {causes.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Allocation % (e.g. 20%)</label>
                    <input
                      type="number"
                      value={productForm.cause_allocation_pct}
                      onChange={(e) => setProductForm({ ...productForm, cause_allocation_pct: e.target.value })}
                      className="w-full bg-slate-900 border border-emerald-600/50 rounded-xl px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Impact Statement</label>
                  <input
                    type="text"
                    value={productForm.cause_impact_text}
                    onChange={(e) => setProductForm({ ...productForm, cause_impact_text: e.target.value })}
                    className="w-full bg-slate-900 border border-emerald-600/50 rounded-xl px-2.5 py-1.5 text-emerald-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct || uploadingPhoto}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold flex items-center space-x-1.5 transition"
                >
                  {savingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingProduct ? 'Publishing...' : editingProduct ? 'Update Product' : 'Publish Product Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ULTRA FACILITY SHIPPING LABEL & ADDRESS PRINTOUT */}
      {printOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white text-slate-950 rounded-2xl overflow-hidden shadow-2xl my-6 p-6">
            
            {/* Screen Controls */}
            <div className="no-print flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Print Shipping Labels ({printOrders.length} Order{printOrders.length > 1 ? 's' : ''})
                </h3>
                <p className="text-xs text-slate-500">
                  Thermal 4x6" or standard A4 dispatch sheet format.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Now</span>
                </button>
                <button
                  onClick={() => setPrintOrders(null)}
                  className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Labels */}
            <div className="space-y-6">
              {printOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="border-2 border-black p-5 rounded-lg text-slate-950 bg-white font-sans break-inside-avoid space-y-3"
                >
                  {/* Top Barcode Header */}
                  <div className="flex justify-between items-start border-b-2 border-black pb-2">
                    <div>
                      <div className="font-black text-lg tracking-tight">BUY4ACHANGE EXPRESS</div>
                      <div className="text-[10px] font-bold uppercase text-slate-700">
                        Universal Guard Trust • PIN-Code Community Network
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-xs">{ord.tracking_number}</div>
                      <div className="text-[10px] font-bold">Standard Priority</div>
                    </div>
                  </div>

                  {/* Simulated High-Res Barcode */}
                  <div className="py-1 text-center border-b border-slate-300">
                    <div className="h-8 w-full flex items-center justify-center space-x-0.5 overflow-hidden">
                      {Array.from({ length: 65 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-black h-full"
                          style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1)}px` }}
                        />
                      ))}
                    </div>
                    <div className="font-mono text-[9px] tracking-[0.3em] font-bold mt-1">
                      *{ord.order_number}*
                    </div>
                  </div>

                  {/* Ship From & Ship To */}
                  <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-3 text-xs">
                    <div className="border-r border-slate-300 pr-3 space-y-0.5">
                      <div className="text-[9px] font-bold uppercase text-slate-500">DISPATCH FROM:</div>
                      <div className="font-bold">Buy4AChange Central Fulfillment</div>
                      <div className="text-[11px] text-slate-700">UGT Community Hub #12</div>
                      <div className="text-[11px] text-slate-700">Bengaluru, KA - 560001</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold uppercase text-slate-500">SHIP TO:</div>
                      <div className="font-black text-sm text-black">{ord.customer_name}</div>
                      <div className="text-[11px] text-slate-800">{ord.shipping_address}</div>
                      <div className="text-[11px] font-bold text-slate-900">
                        {ord.city}, {ord.state}
                      </div>
                      <div className="inline-block mt-1 font-mono font-black text-base bg-black text-white px-2 py-0.5 rounded">
                        PIN: {ord.pincode}
                      </div>
                      <div className="text-[11px] text-slate-700 pt-0.5">
                        Phone: {ord.customer_phone}
                      </div>
                    </div>
                  </div>

                  {/* Parcel Details & Printed Cause Declaration */}
                  <div className="flex justify-between items-center text-xs pt-1">
                    <div>
                      <div className="font-bold">Order: {ord.order_number}</div>
                      <div className="text-[10px] text-slate-600">
                        Paid • Weight: 0.85 kg
                      </div>
                    </div>

                    <div className="text-right border border-black p-1.5 rounded bg-slate-50">
                      <div className="text-[9px] font-bold uppercase text-emerald-800">
                        ✓ Verified Cause Impact Parcel
                      </div>
                      <div className="font-bold text-[10px]">
                        ₹{ord.cause_donation_amount} Funded to {ord.cause_title || 'UGT National Mission'}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ADMIN LIVE HTML PREVIEW MODAL */}
      <DigitalReaderModal
        item={previewDigitalItem}
        onClose={() => setPreviewDigitalItem(null)}
        isPreview={true}
      />

    </div>
  );
};
