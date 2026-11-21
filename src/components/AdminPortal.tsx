import React, { useState, useEffect } from 'react';
import {
  Package, ShoppingCart, Plus, Edit, Trash2, Printer, ShieldCheck,
  Heart, RefreshCw, Lock, LogOut, ArrowLeft, ExternalLink,
  CheckCircle2, AlertCircle, CreditCard, Key,
  Copy, Check, Zap, Server, Upload, Image as ImageIcon, X, RotateCcw,
  BookOpen, Code2, Eye, FileCode, Truck, FileDown, Activity, Mail, Sliders,
  Store, Leaf, FileCheck2, Download, Globe, ClipboardCheck, Repeat, Building2, Share2
} from 'lucide-react';
import {
  Product, Order, Cause, AdminMetrics, PaymentTransaction,
  UnlockedDigitalItem, SiteIntegrations, AnalyticsSummary, Seller,
  BulkInquiry, SubscriptionRecord, FieldAuditReport
} from '../types.ts';
import { EPRODUCT_SUBCATEGORIES } from './EProductsSection.tsx';
import { DigitalReaderModal } from './DigitalReaderModal.tsx';
import { CertificateViewerModal } from './CertificateViewerModal.tsx';
import { generateOrderReceiptPdf } from '../utils/pdfCertificate.ts';

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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'sellers' | 'programs' | 'referrals' | 'missions' | 'transactions' | 'gateway' | 'integrations'
  >('orders');

  // Referrals & Payouts Admin state
  const [refConfig, setRefConfig] = useState({ commissionPct: 5, minPayout: 100 });
  const [refOverview, setRefOverview] = useState<{
    totalUsers: number;
    topReferrers: any[];
    payouts: any[];
    recentEarnings: any[];
  }>({ totalUsers: 0, topReferrers: [], payouts: [], recentEarnings: [] });
  const [savingRefCfg, setSavingRefCfg] = useState(false);
  const [refNotice, setRefNotice] = useState<string | null>(null);

  // Stage 2 National Programs state (CSR Bulk, Subscriptions, Field Audits)
  const [bulkInquiries, setBulkInquiries] = useState<BulkInquiry[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [fieldAudits, setFieldAudits] = useState<FieldAuditReport[]>([]);

  // Manufacturer / Seller Store & Certificate Audit state
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [viewingCert, setViewingCert] = useState<{
    title: string;
    subtitle?: string;
    fileName?: string;
    dataUrl: string;
  } | null>(null);

  // Real Dispatch Modal state (Courier + AWB Tracking)
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [dispatchCourier, setDispatchCourier] = useState('India Post');
  const [dispatchAwb, setDispatchAwb] = useState('');
  const [savingDispatch, setSavingDispatch] = useState(false);

  // Open-Source Integrations & Cookie-Free Analytics state
  const [integrations, setIntegrations] = useState<SiteIntegrations>({
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
  });
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [savingIntegrations, setSavingIntegrations] = useState(false);
  const [integrationsNotice, setIntegrationsNotice] = useState<{ ok: boolean; text: string } | null>(null);
  
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

  const fetchIntegrationsAndAnalytics = async () => {
    if (!token) return;
    try {
      const [intRes, anaRes] = await Promise.all([
        fetch('/api/admin/integrations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (intRes.ok) {
        const intData = await intRes.json();
        setIntegrations((prev) => ({ ...prev, ...intData }));
      }
      if (anaRes.ok) {
        const anaData = await anaRes.json();
        setAnalytics(anaData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingIntegrations(true);
    setIntegrationsNotice(null);
    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(integrations),
      });
      if (!res.ok) throw new Error('Could not save integrations.');
      setIntegrationsNotice({ ok: true, text: 'Open-source integrations saved and active immediately.' });
      fetchIntegrationsAndAnalytics();
    } catch (err: any) {
      setIntegrationsNotice({ ok: false, text: err.message || 'Save failed' });
    } finally {
      setSavingIntegrations(false);
    }
  };

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !dispatchOrder) return;
    setSavingDispatch(true);
    try {
      const res = await fetch(`/api/admin/orders/${dispatchOrder.id}/dispatch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courierName: dispatchCourier,
          trackingNumber: dispatchAwb,
          status: dispatchAwb.trim() ? 'Shipped' : dispatchOrder.order_status,
        }),
      });
      if (res.ok) {
        setDispatchOrder(null);
        fetchOrders(orderDateFilter);
        fetchIntegrationsAndAnalytics();
      }
    } finally {
      setSavingDispatch(false);
    }
  };

  const fetchSellers = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/sellers', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSellers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSellerStatusChange = async (
    sellerId: string,
    status: 'approved' | 'rejected' | 'suspended'
  ) => {
    if (!token) return;
    const adminNotes =
      status === 'approved'
        ? 'Verified & Approved by UGT India Operations'
        : prompt(`Optional reason for marking store as ${status}:`) || '';
    const res = await fetch(`/api/admin/sellers/${sellerId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, adminNotes }),
    });
    if (res.ok) fetchSellers();
  };

  const handleProductApproval = async (
    productId: string,
    approvalStatus: 'approved' | 'rejected'
  ) => {
    if (!token) return;
    const approvalNotes =
      approvalStatus === 'approved'
        ? 'Quality & Zero-Chemical Certificates Audited & Verified'
        : prompt('Reason for rejecting product certificates:') || 'Certificates require clarification.';
    const res = await fetch(`/api/admin/products/${productId}/approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ approvalStatus, approvalNotes }),
    });
    if (res.ok) {
      fetchAdminProducts();
      fetchSellers();
      onRefreshData();
    }
  };

  const handleDownloadAdminExport = async (endpoint: string, fileName: string) => {
    if (!token) return;
    const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchNationalPrograms = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/national-programs', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const d = await res.json();
        setBulkInquiries(d.bulkInquiries || []);
        setSubscriptions(d.subscriptions || []);
        setFieldAudits(d.fieldAudits || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateFieldAudit = async (id: string, verificationStatus: 'verified' | 'flagged') => {
    if (!token) return;
    const res = await fetch(`/api/admin/field-audits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ verificationStatus }),
    });
    if (res.ok) fetchNationalPrograms();
  };

  const handleUpdateBulkStatus = async (id: string, status: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/bulk-inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchNationalPrograms();
  };

  const handleUpdateSubStatus = async (id: string, status: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchNationalPrograms();
  };

  const fetchAdminReferrals = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/referrals', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const d = await res.json();
        if (d.config) setRefConfig(d.config);
        setRefOverview({
          totalUsers: d.totalUsers || 0,
          topReferrers: d.topReferrers || [],
          payouts: d.payouts || [],
          recentEarnings: d.recentEarnings || [],
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRefConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingRefCfg(true);
    setRefNotice(null);
    try {
      const res = await fetch('/api/admin/referrals/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(refConfig),
      });
      if (res.ok) {
        setRefNotice(`Referral income updated to ${refConfig.commissionPct}% (min payout ₹${refConfig.minPayout}).`);
        fetchAdminReferrals();
      }
    } finally {
      setSavingRefCfg(false);
    }
  };

  const handleSettleReferralPayout = async (payoutId: string, status: 'paid' | 'rejected') => {
    if (!token) return;
    const payoutUtr =
      status === 'paid'
        ? prompt('Enter the real 12-digit UPI UTR / Bank Transfer Ref for this payout:') || ''
        : '';
    if (status === 'paid' && !payoutUtr.trim()) return;
    const res = await fetch(`/api/admin/referrals/payouts/${payoutId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, payoutUtr }),
    });
    if (res.ok) fetchAdminReferrals();
  };

  useEffect(() => {
    if (token) {
      fetchMetrics();
      fetchOrders(orderDateFilter);
      fetchTransactions();
      fetchGatewayConfig();
      fetchAdminProducts();
      fetchIntegrationsAndAnalytics();
      fetchSellers();
      fetchNationalPrograms();
      fetchAdminReferrals();
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

  // Verify or Reject Pending Direct UPI Payment
  const handleVerifyPayment = async (orderId: string, action: 'approve' | 'reject') => {
    if (!token) return;
    const msg =
      action === 'approve'
        ? 'Confirm you have received this exact UPI payment in your bank account? This will credit the chosen Living India mission and unlock any digital eBooks.'
        : 'Reject this payment submission and mark the order as Payment Rejected?';
    if (!confirm(msg)) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchOrders(orderDateFilter);
        fetchTransactions();
        fetchMetrics();
        onRefreshData();
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
          ctx.fillStyle = '#ffffff';
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

  // --- VIEW 1: FUTURISTIC OBSIDIAN ADMIN VAULT ---
  if (!token) {
    return (
      <div className="min-h-screen futuristic-obsidian-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md obsidian-deck rounded-3xl overflow-hidden">
          <div className="hero-horizon-bar" />
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2.5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_24px_-6px_rgba(16,185,129,0.5)]">
                <Lock className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300">
                <span className="live-dot" />
                <span>UGT OPS // COMMAND VAULT</span>
              </div>
              <h2 className="text-2xl font-bold text-white font-display tracking-tight">
                Buy4AChange Control Deck
              </h2>
              <p className="text-xs text-slate-400">
                Operations &amp; Mission Control · Universal Guard Trust (UGT India)
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-mono uppercase tracking-wider text-[10px]">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@ugtindia.space"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-mono uppercase tracking-wider text-[10px]">
                  Security Passkey
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter administrator password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 rounded-xl btn-future-primary font-semibold text-xs flex items-center justify-center space-x-2"
              >
                {loggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authenticating Session...</span>
                  </>
                ) : (
                  <span>Initialize Operations Console</span>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={onNavigateStore}
                className="text-xs text-slate-400 hover:text-emerald-300 inline-flex items-center space-x-1.5 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Storefront</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: FUTURISTIC ADMIN COMMAND CONSOLE ---
  return (
    <div className="min-h-screen bg-[#F3F7FB] text-[#0A101F]">
      {/* Deep Obsidian Futuristic Command Header */}
      <header className="bg-[#070D19] text-white border-b border-emerald-500/25 sticky top-0 z-30 shadow-[0_12px_32px_-16px_rgba(7,13,25,0.65)]">
        <div className="hero-horizon-bar" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={onNavigateStore}
                className="px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-slate-200 text-xs flex items-center space-x-1.5 font-semibold transition-all"
                title="Return to Storefront"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Store</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-base tracking-tight text-white">
                  Buy<span className="text-emerald-400">4</span>AChange
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/35">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>OPS OS</span>
                </span>
              </div>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
                admin@ugtindia.space
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.07] hover:bg-rose-500/20 hover:text-rose-300 border border-white/15 text-slate-300 text-xs inline-flex items-center space-x-1.5 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Full-Width Sleek Dark Glass Tab Rail — Zero Clipping on Desktop */}
          <nav className="flex items-center space-x-1 overflow-x-auto pb-2.5 pt-1 text-xs scrollbar-thin border-t border-white/[0.07]">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'orders'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              Orders ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'products'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              Products ({adminProducts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sellers')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                activeTab === 'sellers'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sellers &amp; Audits</span>
              {sellers.filter((s) => s.status === 'pending_approval').length +
                adminProducts.filter((p) => p.approval_status === 'pending_approval').length >
                0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#070D19] font-mono text-[10px] font-bold">
                  {sellers.filter((s) => s.status === 'pending_approval').length +
                    adminProducts.filter((p) => p.approval_status === 'pending_approval').length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('programs')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                activeTab === 'programs'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>National Programs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('referrals')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                activeTab === 'referrals'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Referrals</span>
              {refOverview.payouts.filter((p) => p.status === 'requested').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#070D19] font-mono text-[10px] font-bold">
                  {refOverview.payouts.filter((p) => p.status === 'requested').length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('missions')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'missions'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              8 Missions
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === 'transactions'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              Transactions
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gateway')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                activeTab === 'gateway'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Gateway</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('integrations')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                activeTab === 'integrations'
                  ? 'btn-future-primary text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Integrations &amp; Analytics</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Futuristic KPI Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="kpi-tile-future rounded-2xl p-4 sm:p-5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-slate-500 font-semibold">
              Verified Revenue
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#0A101F] mt-1.5">
              ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#059669] font-semibold mt-1">
              Today: ₹{(metrics?.todayRevenue || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="obsidian-deck rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-300 font-semibold flex items-center space-x-1">
              <Heart className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              <span>Mission Funds Raised</span>
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1.5">
              ₹{(metrics?.totalRaised || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Today: ₹{(metrics?.todayRaised || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="kpi-tile-future rounded-2xl p-4 sm:p-5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-sky-500" />
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-slate-500 font-semibold">
              Total Orders
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#0A101F] mt-1.5">
              {metrics?.totalOrders || 0}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Today: {metrics?.todayOrdersCount || 0} orders
            </div>
          </div>

          <div className="kpi-tile-future rounded-2xl p-4 sm:p-5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-slate-500 font-semibold">
              Living India Nodes
            </span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#0A101F] mt-1.5">
              0{causes.length}
            </div>
            <div className="text-[11px] text-[#0D9488] font-semibold mt-1">
              Active National Initiatives
            </div>
          </div>
        </div>

        {/* TAB 1: DAILY ORDERS & ADDRESS PRINTOUT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter and Batch Print Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mr-1">
                  Orders:
                </span>
                {(
                  [
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'Yesterday' },
                    { id: 'week', label: 'Last 7 Days' },
                    { id: 'all', label: `All (${orders.length})` },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderDateFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      orderDateFilter === f.id
                        ? 'bg-[#166534] text-white'
                        : 'bg-[#FAF9F6] text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Batch Print Button */}
              <button
                type="button"
                onClick={() => setPrintOrders(orders)}
                disabled={orders.length === 0}
                className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white font-semibold text-xs flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Batch Print Address Slips ({orders.length})</span>
              </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {loadingOrders ? (
                <div className="py-16 text-center text-gray-500 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#166534]" />
                  <span className="text-xs">Loading orders...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center text-gray-500 space-y-1">
                  <ShoppingCart className="w-7 h-7 mx-auto text-gray-400" />
                  <p className="text-xs">No orders found for this filter period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-[#FAF9F6] uppercase tracking-wider text-[11px] text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3.5">Order # / Date</th>
                        <th className="px-5 py-3.5">Customer &amp; PIN Code</th>
                        <th className="px-5 py-3.5">Items &amp; Amount</th>
                        <th className="px-5 py-3.5">Mission Allocation</th>
                        <th className="px-5 py-3.5">Verification / Status</th>
                        <th className="px-5 py-3.5 text-right">Address Slip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FAF9F6]">
                          <td className="px-5 py-3.5">
                            <div className="font-mono font-bold text-gray-900 text-xs">
                              {ord.order_number}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {new Date(ord.created_at).toLocaleString()}
                            </div>
                            {ord.payment_id && (
                              <div className="text-[10px] text-[#166534] font-mono mt-0.5">
                                Ref: {ord.payment_id}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-gray-900">{ord.customer_name}</div>
                            <div className="text-gray-500 text-[11px]">{ord.customer_phone}</div>
                            {ord.pincode && (
                              <div className="inline-block mt-0.5 font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] text-[10px]">
                                PIN: {ord.pincode}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900 text-xs">
                              ₹{ord.total_amount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {ord.items?.length || 1} product(s)
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                ord.payment_status === 'paid'
                                  ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                  : ord.payment_status === 'failed'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {ord.payment_status === 'paid'
                                ? 'Verified Paid'
                                : ord.payment_status === 'failed'
                                ? 'Payment Rejected'
                                : 'Pending UTR Check'}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-bold text-[#166534] text-xs">
                              ₹{ord.cause_donation_amount}
                            </div>
                            <div className="text-[11px] text-gray-600 line-clamp-1">
                              {ord.cause_title || 'Living India Mission'}
                            </div>
                          </td>

                          <td className="px-5 py-3.5 space-y-1.5">
                            {ord.payment_status === 'pending_verification' ? (
                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleVerifyPayment(ord.id, 'approve')}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-[11px]"
                                >
                                  Confirm Paid
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVerifyPayment(ord.id, 'reject')}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-[11px]"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <select
                                value={ord.order_status}
                                onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#166534]"
                              >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Packed">Packed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {ord.payment_status === 'paid' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDispatchOrder(ord);
                                    setDispatchCourier(ord.courier_name || 'India Post');
                                    setDispatchAwb(ord.tracking_number || '');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#F0FDF4] hover:bg-green-100 text-[#166534] border border-[#BBF7D0] font-semibold text-xs inline-flex items-center space-x-1"
                                  title="Enter real courier & AWB tracking"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>{ord.tracking_number ? 'AWB' : 'Dispatch'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void generateOrderReceiptPdf(ord)}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs inline-flex items-center space-x-1"
                                title="Download Official PDF Receipt & Certificate"
                              >
                                <FileDown className="w-3.5 h-3.5 text-[#166534]" />
                                <span>PDF</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPrintOrders([ord])}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs inline-flex items-center space-x-1"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#166534]" />
                                <span>Slip</span>
                              </button>
                            </div>
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
                <h3 className="text-base font-bold text-gray-900">Products &amp; E-Products Management</h3>
                <p className="text-xs text-gray-500">
                  Manage physical catalog items and HTML eProducts / eBooks ({adminProducts.length} active)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onNavigateStore}
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-xs flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#166534]" />
                  <span>View Live Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddProductModal('digital')}
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F0FDF4] border border-[#166534] text-[#166534] font-semibold text-xs flex items-center space-x-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Add E-Product / eBook</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddProductModal('physical')}
                  className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Product Type Filter Strip */}
            <div className="flex flex-wrap items-center gap-2">
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
                  type="button"
                  onClick={() => setProductTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    productTypeFilter === tab.id
                      ? 'bg-[#166534] text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {productNotice && (
              <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
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
                      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex space-x-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-[#FAF9F6] border border-gray-200 flex items-center justify-center text-[#166534] shrink-0">
                            {isDigital ? <BookOpen className="w-6 h-6" /> : <ImageIcon className="w-6 h-6 text-gray-400" />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[11px] font-semibold text-[#166534] truncate">
                              {isDigital ? `E-Product · ${p.subcategory || 'eBooks'}` : p.category}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                                isDigital
                                  ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                  : p.stock > 0
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {isDigital ? 'HTML Locked' : p.stock > 0 ? `Stock: ${p.stock}` : 'Sold Out'}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 mt-0.5">{p.name}</h4>
                          <div className="text-sm font-bold text-gray-900 mt-0.5">
                            ₹{p.price.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-gray-500 line-clamp-1">
                            {p.cause_allocation_pct}% to {p.cause_title || 'Living India Mission'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-end space-x-2">
                        {isDigital && p.digital_html_content && (
                          <button
                            type="button"
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
                            className="px-2.5 py-1.5 rounded-lg bg-[#F0FDF4] hover:bg-green-100 text-[#166534] text-xs font-semibold flex items-center space-x-1 border border-[#BBF7D0]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditProductModal(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center space-x-1 border border-rose-200"
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

        {/* TAB 2B: SELLERS & PER-PRODUCT DUAL-CERTIFICATE AUDIT QUEUE */}
        {activeTab === 'sellers' && (
          <div className="space-y-6">
            {/* National Transformation Open Exports Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Manufacturer Verification &amp; National Open-Commerce Exports
                </h3>
                <p className="text-xs text-gray-500">
                  Approve manufacturer stores, audit every Quality &amp; Zero-Chemical certificate, and export 3-Way Payout CSV or ONDC/Beckn catalog.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadAdminExport(
                      '/api/admin/exports/payouts.csv',
                      'buy4achange-3way-payouts.csv'
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-[#F0FDF4] hover:bg-green-100 border border-[#BBF7D0] text-[#166534] text-xs font-semibold inline-flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>3-Way Payout CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadAdminExport(
                      '/api/admin/exports/ondc-catalog.json',
                      'buy4achange-ondc-beckn-catalog.json'
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold inline-flex items-center space-x-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Export ONDC JSON</span>
                </button>
              </div>
            </div>

            {/* Section 1: Pending & Registered Manufacturer Stores */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <Store className="w-4 h-4 text-[#166534]" />
                  <span>Manufacturer &amp; Artisan Stores ({sellers.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={fetchSellers}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 inline-flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Refresh</span>
                </button>
              </div>

              {sellers.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  No manufacturer stores registered yet. Share <span className="font-mono text-gray-800">/seller</span> with ethical producers to onboard.
                </p>
              ) : (
                <div className="space-y-3">
                  {sellers.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{s.store_name}</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-semibold text-gray-700">
                            {s.business_type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              s.status === 'approved'
                                ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                : s.status === 'rejected' || s.status === 'suspended'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {s.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          Owner: <strong>{s.owner_name}</strong> · {s.email} · {s.phone}
                        </div>
                        <div className="text-gray-600">
                          Location: {s.city}, {s.state} {s.pincode} · Reg: <span className="font-mono">{s.registration_no || 'N/A'}</span> · Payout UPI: <span className="font-mono text-[#166534]">{s.upi_payout_id}</span>
                        </div>
                        {s.story && <p className="text-gray-500 italic">&ldquo;{s.story}&rdquo;</p>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {s.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleSellerStatusChange(s.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold"
                          >
                            Approve Store
                          </button>
                        )}
                        {s.status === 'pending_approval' && (
                          <button
                            type="button"
                            onClick={() => handleSellerStatusChange(s.id, 'rejected')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        )}
                        {s.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleSellerStatusChange(s.id, 'suspended')}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-gray-300 text-gray-700 text-xs font-semibold"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Per-Product Dual-Certificate Audit Queue */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#166534]" />
                  <span>
                    Product Quality &amp; Zero-Chemical Certificate Audit Queue (
                    {adminProducts.filter((p) => p.seller_id).length})
                  </span>
                </h4>
                <p className="text-xs text-gray-500">
                  Inspect both uploaded certificates before approving any manufacturer product to appear on the storefront.
                </p>
              </div>

              {adminProducts.filter((p) => p.seller_id).length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  No manufacturer products submitted for certificate audit yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {adminProducts
                    .filter((p) => p.seller_id)
                    .sort((a, b) =>
                      a.approval_status === 'pending_approval' && b.approval_status !== 'pending_approval'
                        ? -1
                        : 1
                    )
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-white shrink-0"
                          />
                          <div className="space-y-1 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{p.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  p.approval_status === 'approved'
                                    ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                    : p.approval_status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {(p.approval_status || 'pending_approval').replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="text-gray-600">
                              Manufacturer: <strong>{p.seller_name}</strong> ({p.origin_state || 'India'}) · ₹{p.price} · Mission Share {p.cause_allocation_pct}%
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {p.quality_cert_url ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingCert({
                                      title: `Quality Certificate — ${p.name}`,
                                      subtitle: `Submitted by ${p.seller_name}`,
                                      fileName: p.quality_cert_name,
                                      dataUrl: p.quality_cert_url!,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-white border border-[#166534] text-[#166534] font-semibold text-[11px] inline-flex items-center space-x-1"
                                >
                                  <FileCheck2 className="w-3.5 h-3.5" />
                                  <span>Inspect Quality Certificate</span>
                                </button>
                              ) : (
                                <span className="text-rose-600 font-semibold">Missing Quality Cert</span>
                              )}

                              {p.zero_chemical_cert_url ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingCert({
                                      title: `Zero-Chemical Certificate — ${p.name}`,
                                      subtitle: `Submitted by ${p.seller_name}`,
                                      fileName: p.zero_chemical_cert_name,
                                      dataUrl: p.zero_chemical_cert_url!,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-semibold text-[11px] inline-flex items-center space-x-1"
                                >
                                  <Leaf className="w-3.5 h-3.5" />
                                  <span>Inspect Zero-Chemical Certificate</span>
                                </button>
                              ) : (
                                <span className="text-rose-600 font-semibold">Missing Zero-Chemical Cert</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {p.approval_status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleProductApproval(p.id, 'approved')}
                              className="px-3.5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold"
                            >
                              Approve &amp; Publish Live
                            </button>
                          )}
                          {p.approval_status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleProductApproval(p.id, 'rejected')}
                              className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2C: NATIONAL PROGRAMS (FIELD AUDITS, CSR BULK, SUBSCRIPTIONS) */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            {/* 1. Field Auditor Ground Reports */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                    <ClipboardCheck className="w-4 h-4 text-[#166534]" />
                    <span>Ground Field Audit Reports ({fieldAudits.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Verified field inspections appear live on the Public Living India OpenStreetMap Map.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchNationalPrograms}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700"
                >
                  Refresh
                </button>
              </div>

              {fieldAudits.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">
                  No field inspection reports submitted yet. Ground auditors can submit offline/online at <span className="font-mono">/auditor</span>.
                </p>
              ) : (
                <div className="space-y-3">
                  {fieldAudits.map((fa) => (
                    <div
                      key={fa.id}
                      className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start space-x-3">
                        {fa.photo_url && (
                          <img
                            src={fa.photo_url}
                            alt={fa.subject_name}
                            className="w-16 h-16 rounded-lg object-cover border shrink-0"
                          />
                        )}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-gray-900">{fa.subject_name}</span>
                            <span className="px-2 py-0.5 rounded bg-white border text-[10px] font-semibold">
                              {fa.audit_type}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                fa.verification_status === 'verified'
                                  ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                  : fa.verification_status === 'flagged'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {fa.verification_status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            Auditor: <strong>{fa.auditor_name}</strong> · {fa.district ? `${fa.district}, ` : ''}{fa.state}
                            {fa.latitude && fa.longitude ? ` (GPS ${fa.latitude}, ${fa.longitude})` : ''}
                          </div>
                          {fa.notes && <p className="text-gray-600">{fa.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {fa.verification_status !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldAudit(fa.id, 'verified')}
                            className="px-3 py-1.5 rounded-lg bg-[#166534] text-white font-semibold"
                          >
                            Verify &amp; Publish to Map
                          </button>
                        )}
                        {fa.verification_status !== 'flagged' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldAudit(fa.id, 'flagged')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold"
                          >
                            Flag
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Institutional & CSR Bulk Procurement */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#166534]" />
                <span>Institutional &amp; Corporate CSR Bulk Inquiries ({bulkInquiries.length})</span>
              </h3>
              {bulkInquiries.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No bulk CSR procurement inquiries yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {bulkInquiries.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900">
                          {b.org_name} <span className="font-normal text-gray-500">({b.org_type})</span>
                        </div>
                        <div className="text-gray-600">
                          {b.contact_name} · {b.email} · {b.phone} · Est. ₹{Number(b.estimated_budget || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-gray-600">{b.requirements}</div>
                      </div>
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateBulkStatus(b.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 font-semibold text-xs shrink-0"
                      >
                        <option value="new">New</option>
                        <option value="quoted">Quoted</option>
                        <option value="approved">Approved</option>
                        <option value="fulfilled">Fulfilled</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Monthly Conscious Essentials Subscriptions */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Repeat className="w-4 h-4 text-[#166534]" />
                <span>Recurring Monthly Essentials Boxes ({subscriptions.length})</span>
              </h3>
              {subscriptions.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No recurring box enrollments yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {subscriptions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900">
                          {s.subscriber_name} — <span className="text-[#166534]">{s.plan_name}</span>
                        </div>
                        <div className="text-gray-600">
                          {s.frequency} · ₹{s.monthly_budget} · {s.email} · {s.phone} · PIN {s.pincode}
                        </div>
                        <div className="text-[11px] text-[#166534]">
                          Mission: {s.cause_title || s.cause_id}
                        </div>
                      </div>
                      <select
                        value={s.status}
                        onChange={(e) => handleUpdateSubStatus(s.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 font-semibold text-xs shrink-0"
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2D: MEMBER REFERRALS & PAYOUTS CONSOLE */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Live Commission Config */}
            <form
              onSubmit={handleSaveRefConfig}
              className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                    <Share2 className="w-4 h-4 text-[#166534]" />
                    <span>Member Referral Income Program ({refOverview.totalUsers} Registered Members)</span>
                  </h3>
                  <p className="text-gray-500">
                    Members earn a percentage on verified paid orders referred via their social share links (self-referrals auto-blocked).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAdminReferrals}
                  className="self-start px-3 py-1.5 rounded-lg border border-gray-300 font-semibold text-gray-700"
                >
                  Refresh
                </button>
              </div>

              {refNotice && (
                <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] font-semibold">
                  {refNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Referral Commission % (0–25%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    step="0.5"
                    value={refConfig.commissionPct}
                    onChange={(e) =>
                      setRefConfig({ ...refConfig, commissionPct: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Minimum UPI Withdrawal (₹)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={refConfig.minPayout}
                    onChange={(e) =>
                      setRefConfig({ ...refConfig, minPayout: parseFloat(e.target.value) || 100 })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono font-bold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingRefCfg}
                  className="py-2 px-4 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold"
                >
                  {savingRefCfg ? 'Saving...' : 'Update Referral Rules'}
                </button>
              </div>
            </form>

            {/* Pending & Settled UPI Payout Requests */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3 text-xs">
              <h4 className="text-sm font-bold text-gray-900">
                Referral Payout Requests &amp; Mission Donations ({refOverview.payouts.length})
              </h4>
              {refOverview.payouts.length === 0 ? (
                <p className="text-gray-500 py-2">No referral payout requests yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {refOverview.payouts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900">
                          {p.user_name} ({p.user_email}) · <span className="font-mono text-[#166534]">₹{p.amount}</span>
                        </div>
                        <div className="text-gray-600">
                          {p.payout_type === 'donate_mission'
                            ? `Direct Mission Donation (${p.cause_id})`
                            : `UPI Payout to: ${p.upi_id}`}
                          {p.payout_utr ? ` · UTR: ${p.payout_utr}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {p.status === 'requested' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSettleReferralPayout(p.id, 'paid')}
                              className="px-3 py-1.5 rounded-lg bg-[#166534] text-white font-semibold"
                            >
                              Mark Paid (Enter UTR)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSettleReferralPayout(p.id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] font-semibold">
                            {p.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Referrers Leaderboard */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3 text-xs">
              <h4 className="text-sm font-bold text-gray-900">Registered Members &amp; Referrers</h4>
              {refOverview.topReferrers.length === 0 ? (
                <p className="text-gray-500 py-2">No registered members yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-[#FAF9F6] text-[11px] uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2">Member</th>
                        <th className="px-3 py-2">Referral Code</th>
                        <th className="px-3 py-2">Referred Orders</th>
                        <th className="px-3 py-2">Total Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {refOverview.topReferrers.map((r) => (
                        <tr key={r.id}>
                          <td className="px-3 py-2 font-semibold text-gray-900">
                            {r.name} <span className="font-normal text-gray-500">({r.email})</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[#166534] font-semibold">{r.referral_code}</td>
                          <td className="px-3 py-2 font-mono">{r.referrals_count}</td>
                          <td className="px-3 py-2 font-mono font-bold text-[#166534]">
                            ₹{Math.round(r.total_earned || 0)}
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

        {/* TAB 3: UGT 8 MISSIONS TRACKER */}
        {activeTab === 'missions' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-gray-900">
                      UGT India 8 National Missions — Live Status
                    </h3>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[10px] font-semibold text-[#166534]">
                      <span>LIVE DATA</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Real-time contributions updated automatically with every verified paid order.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => { onRefreshData(); fetchMetrics(); }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#166534]" />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetMissions}
                    disabled={resettingMissions}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-1.5"
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
                    <div key={c.id} className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200 space-y-2">
                      <div className="flex justify-between items-center text-xs gap-2">
                        <div>
                          <span className="font-semibold text-gray-900">{c.title}</span>
                          <span className="text-gray-500 ml-2">({c.category})</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#166534]">
                            ₹{Math.round(c.raised_amount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-gray-500"> / ₹{(c.target_amount / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#166534] h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500 gap-2">
                        <span>{c.tagline}</span>
                        <span className="font-semibold text-gray-700 shrink-0">
                          {(c.impact_count || 0).toLocaleString('en-IN')} {c.impact_metric}
                        </span>
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
          <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Payment Audit Trail</h3>
              <p className="text-xs text-gray-500">Recorded payment references and verification states</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#FAF9F6] uppercase tracking-wider text-[11px] text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Order Ref</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#FAF9F6]">
                      <td className="px-4 py-2.5 font-mono text-[#166534] font-semibold">{tx.id}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-700">{tx.order_id}</td>
                      <td className="px-4 py-2.5 font-bold text-gray-900">₹{tx.amount}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tx.status === 'succeeded' || tx.status === 'paid'
                              ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                              : tx.status === 'rejected' || tx.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 font-mono text-[11px]">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
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
            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-gray-900">Open-Source Payment Gateway Configuration</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        gwConfig.mode === 'direct_upi' || gwConfig.hyperswitch_ready
                          ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {gwConfig.mode === 'direct_upi'
                        ? 'Direct NPCI UPI Active'
                        : gwConfig.hyperswitch_ready
                        ? 'Hyperswitch Live'
                        : 'Keys Required'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Powered by{' '}
                    <a
                      href="https://github.com/juspay/hyperswitch"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#166534] hover:underline inline-flex items-center space-x-1 font-medium"
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
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-xs font-semibold text-gray-800 flex items-center space-x-1.5"
                  >
                    {testingGw ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#166534]" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-[#166534]" />
                    )}
                    <span>Test Connection</span>
                  </button>
                </div>
              </div>

              {gwNotice && (
                <div
                  className={`p-3.5 rounded-lg border text-xs flex items-start space-x-2 ${
                    gwNotice.ok
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {gwNotice.ok ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{gwNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveGatewayConfig} className="space-y-6">
                {/* Operating Mode Cards */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    1. Active Payment Engine Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'direct_upi' as const,
                        title: 'Direct NPCI UPI (UTR Verified)',
                        desc: 'Zero-fee scannable UPI QR & deep links (GPay, PhonePe, Paytm, BHIM) with mandatory 12-digit UTR audit.',
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
                        className={`p-3.5 rounded-lg border text-left ${
                          gwConfig.mode === opt.id
                            ? 'bg-[#F0FDF4] border-[#166534]'
                            : 'bg-[#FAF9F6] border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-gray-900">{opt.title}</div>
                        <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Merchant & Direct UPI Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Merchant UPI VPA (NPCI)
                    </label>
                    <input
                      type="text"
                      value={gwConfig.merchant_upi_vpa}
                      onChange={(e) => setGwConfig({ ...gwConfig, merchant_upi_vpa: e.target.value })}
                      placeholder="ugtindia@upi"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-[#166534] focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Merchant Display Name
                    </label>
                    <input
                      type="text"
                      value={gwConfig.merchant_name}
                      onChange={(e) => setGwConfig({ ...gwConfig, merchant_name: e.target.value })}
                      placeholder="Buy4AChange UGT India"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Settlement Currency
                    </label>
                    <select
                      value={gwConfig.currency}
                      onChange={(e) => setGwConfig({ ...gwConfig, currency: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-[#166534] focus:outline-none"
                    >
                      <option value="INR">INR (₹ Indian Rupee)</option>
                      <option value="USD">USD ($ US Dollar)</option>
                      <option value="EUR">EUR (€ Euro)</option>
                    </select>
                  </div>
                </div>

                {/* Enabled Checkout Methods */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600">Enabled Methods:</span>
                  {[
                    { key: 'enable_upi' as const, label: 'UPI / QR Code' },
                    { key: 'enable_card' as const, label: 'Credit / Debit Card' },
                    { key: 'enable_netbanking' as const, label: 'NetBanking' },
                  ].map((m) => (
                    <label
                      key={m.key}
                      className="inline-flex items-center space-x-2 text-xs text-gray-800 cursor-pointer bg-[#FAF9F6] px-3 py-1.5 rounded-lg border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={gwConfig[m.key]}
                        onChange={(e) => setGwConfig({ ...gwConfig, [m.key]: e.target.checked })}
                        className="accent-[#166534] rounded"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>

                {/* Juspay Hyperswitch Credentials */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4 text-[#166534]" />
                      <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                        2. Juspay Hyperswitch API Credentials
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() =>
                          setGwConfig({ ...gwConfig, hyperswitch_base_url: 'https://sandbox.hyperswitch.io' })
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-700"
                      >
                        Sandbox URL
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGwConfig({ ...gwConfig, hyperswitch_base_url: 'https://api.hyperswitch.io' })
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-700"
                      >
                        Production URL
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGwConfig({ ...gwConfig, hyperswitch_base_url: 'http://localhost:8080' })
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#F0FDF4] hover:bg-green-100 border border-[#BBF7D0] text-[#166534]"
                      >
                        Self-Hosted (:8080)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Hyperswitch API Base URL
                      </label>
                      <input
                        type="url"
                        value={gwConfig.hyperswitch_base_url}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_base_url: e.target.value })
                        }
                        placeholder="https://sandbox.hyperswitch.io"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#166534] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Profile ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={gwConfig.hyperswitch_profile_id}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_profile_id: e.target.value })
                        }
                        placeholder="pro_xxxxxxxxxxxxxxxx"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#166534] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Secret API Key (<code className="text-[#166534]">api-key</code>)
                      </label>
                      <input
                        type="password"
                        value={gwConfig.hyperswitch_api_key}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_api_key: e.target.value })
                        }
                        placeholder="snd_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#166534] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Publishable Key (<code className="text-[#166534]">pk_snd_...</code>)
                      </label>
                      <input
                        type="text"
                        value={gwConfig.hyperswitch_publishable_key}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_publishable_key: e.target.value })
                        }
                        placeholder="pk_snd_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#166534] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Payment Response Hash Key (HMAC-SHA512 Webhook)
                      </label>
                      <input
                        type="password"
                        value={gwConfig.hyperswitch_webhook_hash_key}
                        onChange={(e) =>
                          setGwConfig({ ...gwConfig, hyperswitch_webhook_hash_key: e.target.value })
                        }
                        placeholder="Paste webhook hash key from Hyperswitch Dashboard"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:border-[#166534] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                          className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600"
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
                          className="p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shrink-0"
                          title="Copy Webhook URL"
                        >
                          {copiedWebhook ? (
                            <Check className="w-4 h-4 text-[#166534]" />
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
                    className="px-5 py-2.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs flex items-center space-x-2"
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
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-900">
                <Server className="w-4 h-4 text-[#166534]" />
                <span>Self-Hosting Juspay Hyperswitch via GitHub Docker (Optional)</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200 font-mono text-[11px] text-gray-800 space-y-1 overflow-x-auto">
                <div className="text-[#166534]"># Clone &amp; run the official Apache 2.0 gateway locally</div>
                <div>git clone https://github.com/juspay/hyperswitch.git &amp;&amp; cd hyperswitch</div>
                <div>docker compose up -d</div>
                <div className="text-gray-500 pt-1">
                  # Then set Base URL above to http://localhost:8080 and paste your API &amp; Publishable keys.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OPEN-SOURCE INTEGRATIONS & COOKIE-FREE ANALYTICS */}
        {activeTab === 'integrations' && (
          <div className="space-y-5">
            {/* Cookie-Free Telemetry Cards */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-[#166534]" />
                    <span>Privacy-First Zero-Cookie Analytics</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Anonymous DPDP-friendly engagement metrics recorded directly in your database (zero tracking cookies).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchIntegrationsAndAnalytics}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-xs font-semibold text-gray-700 inline-flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                  <div className="text-[11px] text-gray-500">Storefront Views</div>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
                    {analytics?.pageViews || 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                  <div className="text-[11px] text-gray-500">Mission Dossiers Read</div>
                  <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
                    {analytics?.missionReads || 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                  <div className="text-[11px] text-gray-500">Product Views</div>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
                    {analytics?.productViews || 0}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                  <div className="text-[11px] text-gray-500">PDF Certificates Issued</div>
                  <div className="text-xl font-bold font-mono text-[#166534] mt-0.5">
                    {analytics?.pdfDownloads || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Open-Source Integrations Form */}
            <form
              onSubmit={handleSaveIntegrations}
              className="bg-white p-6 rounded-xl border border-gray-200 space-y-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Open-Source Ecosystem Connectors
                </h3>
                <p className="text-xs text-gray-500">
                  Plug in self-hosted Umami/Plausible analytics, Listmonk/SMTP transactional email webhook, Chatwoot/WhatsApp support, Karrio shipping, or Cloudflare R2/MinIO storage.
                </p>
              </div>

              {integrationsNotice && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
                    integrationsNotice.ok
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{integrationsNotice.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Umami / Plausible Script URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={integrations.umami_script_url}
                    onChange={(e) => setIntegrations({ ...integrations, umami_script_url: e.target.value })}
                    placeholder="https://analytics.ugtindia.space/script.js"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Umami Website ID / Plausible Domain
                  </label>
                  <input
                    type="text"
                    value={integrations.umami_website_id}
                    onChange={(e) => setIntegrations({ ...integrations, umami_website_id: e.target.value })}
                    placeholder="website-uuid-or-domain"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Transactional Email Webhook (Listmonk / Nodemailer / SMTP Relay)
                  </label>
                  <input
                    type="url"
                    value={integrations.smtp_webhook_url}
                    onChange={(e) => setIntegrations({ ...integrations, smtp_webhook_url: e.target.value })}
                    placeholder="https://mail.ugtindia.space/api/tx"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Sender Email Address
                  </label>
                  <input
                    type="email"
                    value={integrations.smtp_from_email}
                    onChange={(e) => setIntegrations({ ...integrations, smtp_from_email: e.target.value })}
                    placeholder="orders@ugtindia.space"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    WhatsApp Support Number (with country code, e.g. 9198XXXXXXXX)
                  </label>
                  <input
                    type="text"
                    value={integrations.whatsapp_support_number}
                    onChange={(e) => setIntegrations({ ...integrations, whatsapp_support_number: e.target.value })}
                    placeholder="9198XXXXXXXX"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Public Support Email (shown in Footer)
                  </label>
                  <input
                    type="email"
                    value={integrations.support_email}
                    onChange={(e) => setIntegrations({ ...integrations, support_email: e.target.value })}
                    placeholder="support@ugtindia.space"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Chatwoot Base URL (Open-Source Helpdesk)
                  </label>
                  <input
                    type="url"
                    value={integrations.chatwoot_base_url}
                    onChange={(e) => setIntegrations({ ...integrations, chatwoot_base_url: e.target.value })}
                    placeholder="https://chat.ugtindia.space"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Chatwoot Website Token
                  </label>
                  <input
                    type="text"
                    value={integrations.chatwoot_website_token}
                    onChange={(e) => setIntegrations({ ...integrations, chatwoot_website_token: e.target.value })}
                    placeholder="chatwoot_inbox_token"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Karrio Open-Source Shipping API URL
                  </label>
                  <input
                    type="url"
                    value={integrations.karrio_api_url}
                    onChange={(e) => setIntegrations({ ...integrations, karrio_api_url: e.target.value })}
                    placeholder="https://shipping.ugtindia.space/v1"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Cloudflare R2 / MinIO Public Asset CDN URL
                  </label>
                  <input
                    type="url"
                    value={integrations.r2_public_base_url}
                    onChange={(e) => setIntegrations({ ...integrations, r2_public_base_url: e.target.value })}
                    placeholder="https://cdn.ugtindia.space"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingIntegrations}
                  className="px-5 py-2.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs flex items-center space-x-2"
                >
                  {savingIntegrations ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{savingIntegrations ? 'Saving...' : 'Save Integrations'}</span>
                </button>
              </div>
            </form>

            {/* Transactional Email Notification Log */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                <Mail className="w-4 h-4 text-[#166534]" />
                <span>Transactional Email Notification Log</span>
              </div>
              {!analytics?.recentEmails || analytics.recentEmails.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Order confirmations, payment verifications, and dispatch emails are logged here automatically.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-[#FAF9F6] text-[11px] uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2">Order</th>
                        <th className="px-3 py-2">Recipient</th>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.recentEmails.map((em) => (
                        <tr key={em.id}>
                          <td className="px-3 py-2 font-mono font-semibold">{em.order_number}</td>
                          <td className="px-3 py-2">{em.recipient_email}</td>
                          <td className="px-3 py-2">{em.subject}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] text-[10px] font-semibold">
                              {em.status}
                            </span>
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
      </main>

      {/* MODAL: REAL SHIPPING DISPATCH (COURIER + AWB TRACKING NUMBER) */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#166534]" />
                <span>Dispatch Order {dispatchOrder.order_number}</span>
              </h3>
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveDispatch} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Courier Partner</label>
                <select
                  value={dispatchCourier}
                  onChange={(e) => setDispatchCourier(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                >
                  <option value="India Post">India Post (Speed Post / Registered)</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Karrio Carrier">Karrio Open-Source Carrier</option>
                  <option value="Local Hand Delivery">Local Hand Delivery</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Real AWB / Consignment Tracking Number
                </label>
                <input
                  type="text"
                  required
                  value={dispatchAwb}
                  onChange={(e) => setDispatchAwb(e.target.value)}
                  placeholder="Enter real courier AWB number"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-900 focus:border-[#166534] focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchOrder(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDispatch}
                  className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold"
                >
                  {savingDispatch ? 'Saving...' : 'Save & Mark Shipped'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT OR E-PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl my-6">
            <div className="p-4 border-b border-gray-200 bg-[#FAF9F6] flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                {productForm.product_type === 'digital' ? (
                  <BookOpen className="w-4 h-4 text-[#166534]" />
                ) : (
                  <Package className="w-4 h-4 text-[#166534]" />
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
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              {/* Product Type Switcher: Physical vs Digital E-Product / eBook */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#FAF9F6] border border-gray-200">
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
                  className={`py-2 px-3 rounded-md font-semibold flex items-center justify-center space-x-2 ${
                    productForm.product_type === 'physical'
                      ? 'bg-[#166534] text-white'
                      : 'text-gray-600 hover:text-gray-900'
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
                  className={`py-2 px-3 rounded-md font-semibold flex items-center justify-center space-x-2 ${
                    productForm.product_type === 'digital'
                      ? 'bg-[#166534] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>E-Product / eBook (HTML)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
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
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#166534] focus:outline-none"
                  />
                </div>
                {productForm.product_type === 'digital' ? (
                  <div>
                    <label className="block text-[#166534] font-semibold mb-1">E-Product Subcategory</label>
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
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#166534] focus:outline-none"
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
                      className="mt-1.5 w-full bg-[#FAF9F6] border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#166534] focus:outline-none"
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
                  <label className="block text-gray-700 font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-semibold focus:border-[#166534] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.compare_at_price}
                    onChange={(e) => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#166534] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-semibold focus:border-[#166534] focus:outline-none"
                  />
                </div>
              </div>

              {productError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{productError}</span>
                </div>
              )}

              {/* Upload Product Photo */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Product Photo</label>

                {productForm.image_url ? (
                  <div className="relative rounded-lg border border-gray-200 bg-[#FAF9F6] p-3 flex items-center space-x-4">
                    <img
                      src={productForm.image_url}
                      alt="Product preview"
                      className="w-24 h-24 rounded-lg object-cover border border-gray-200 bg-white shrink-0"
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="text-xs font-semibold text-[#166534] flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Photo ready for live storefront</span>
                      </div>
                      {photoSizeKb !== null && (
                        <div className="text-[11px] text-gray-500">
                          Auto-optimized · {photoSizeKb} KB
                        </div>
                      )}
                      <div className="flex items-center space-x-2 pt-0.5">
                        <label className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-[11px] cursor-pointer inline-flex items-center space-x-1.5">
                          <Upload className="w-3.5 h-3.5 text-[#166534]" />
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
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-[11px] inline-flex items-center space-x-1"
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
                    className="flex flex-col items-center justify-center w-full py-6 px-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#166534] bg-[#FAF9F6] cursor-pointer text-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
                      {uploadingPhoto ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-gray-900">
                      {uploadingPhoto ? 'Optimizing photo...' : 'Click to upload photo or drag & drop'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      JPG, PNG, or WebP · Automatically compressed for fast loading
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
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#166534] focus:outline-none"
                />
              </div>

              {/* DIGITAL HTML CODE EDITOR */}
              {productForm.product_type === 'digital' && (
                <div className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-[#166534] flex items-center space-x-1.5">
                        <Code2 className="w-4 h-4" />
                        <span>Interactive HTML Code (eBook / eProduct Content)</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Locked on server — delivered ONLY after verified payment.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <label className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-[11px] cursor-pointer inline-flex items-center space-x-1">
                        <FileCode className="w-3.5 h-3.5 text-[#166534]" />
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
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-[11px]"
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
                          className="px-2.5 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-[11px] inline-flex items-center space-x-1"
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
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 font-mono text-[11px] text-gray-900 focus:border-[#166534] focus:outline-none leading-relaxed"
                  />

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Buyer Access Note (shown before purchase)
                    </label>
                    <input
                      type="text"
                      value={productForm.digital_access_note}
                      onChange={(e) =>
                        setProductForm({ ...productForm, digital_access_note: e.target.value })
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] space-y-2.5">
                <div className="text-xs font-semibold text-[#166534]">Default Mission &amp; Impact Allocation</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1">Primary Mission</label>
                    <select
                      value={productForm.cause_id}
                      onChange={(e) => setProductForm({ ...productForm, cause_id: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-900"
                    >
                      {causes.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Allocation % (e.g. 20%)</label>
                    <input
                      type="number"
                      value={productForm.cause_allocation_pct}
                      onChange={(e) => setProductForm({ ...productForm, cause_allocation_pct: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Impact Statement</label>
                  <input
                    type="text"
                    value={productForm.cause_impact_text}
                    onChange={(e) => setProductForm({ ...productForm, cause_impact_text: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct || uploadingPhoto}
                  className="px-5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] disabled:opacity-50 text-white font-semibold flex items-center space-x-1.5"
                >
                  {savingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingProduct ? 'Publishing...' : editingProduct ? 'Update Product' : 'Publish Product Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHIPPING LABEL & ADDRESS PRINTOUT */}
      {printOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white text-gray-900 rounded-xl overflow-hidden shadow-2xl my-6 p-6">
            {/* Screen Controls */}
            <div className="no-print flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Print Shipping Labels ({printOrders.length} Order{printOrders.length > 1 ? 's' : ''})
                </h3>
                <p className="text-xs text-gray-500">
                  Thermal 4x6&quot; or standard A4 dispatch sheet format.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintOrders(null)}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
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
                  className="border-2 border-black p-5 rounded-lg text-gray-950 bg-white font-sans break-inside-avoid space-y-3"
                >
                  {/* Top Order Header */}
                  <div className="flex justify-between items-start border-b-2 border-black pb-2">
                    <div>
                      <div className="font-black text-lg tracking-tight">BUY4ACHANGE</div>
                      <div className="text-[10px] font-bold uppercase text-gray-700">
                        Universal Guard Trust · UGT India Initiative
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-xs">{ord.order_number}</div>
                      <div className="text-[10px] font-bold uppercase">
                        {ord.payment_status === 'paid' ? 'Verified Paid' : 'Pending Payment Verification'}
                      </div>
                    </div>
                  </div>

                  {/* Ship From & Ship To */}
                  <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-3 text-xs">
                    <div className="border-r border-gray-300 pr-3 space-y-0.5">
                      <div className="text-[9px] font-bold uppercase text-gray-500">DISPATCH FROM:</div>
                      <div className="font-bold">Buy4AChange Fulfillment</div>
                      <div className="text-[11px] text-gray-700">Universal Guard Trust (UGT India)</div>
                      <div className="text-[11px] text-gray-700">ugtindia.space</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold uppercase text-gray-500">SHIP TO:</div>
                      <div className="font-black text-sm text-black">{ord.customer_name}</div>
                      <div className="text-[11px] text-gray-800">{ord.shipping_address}</div>
                      <div className="text-[11px] font-bold text-gray-900">
                        {ord.city}, {ord.state}
                      </div>
                      {ord.pincode && (
                        <div className="inline-block mt-1 font-mono font-black text-base bg-black text-white px-2 py-0.5 rounded">
                          PIN: {ord.pincode}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-700 pt-0.5">
                        Phone: {ord.customer_phone}
                      </div>
                    </div>
                  </div>

                  {/* Parcel Details & Mission Declaration */}
                  <div className="flex justify-between items-center text-xs pt-1">
                    <div>
                      <div className="font-bold">Order: {ord.order_number}</div>
                      <div className="text-[10px] text-gray-600 font-mono">
                        Payment Ref: {ord.payment_id}
                      </div>
                    </div>

                    <div className="text-right border border-black p-1.5 rounded bg-gray-50">
                      <div className="text-[9px] font-bold uppercase text-[#166534]">
                        ✓ Cause Impact Parcel
                      </div>
                      <div className="font-bold text-[10px]">
                        ₹{ord.cause_donation_amount} to {ord.cause_title || 'UGT National Mission'}
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

      {/* ADMIN CERTIFICATE AUDIT VIEWER */}
      <CertificateViewerModal cert={viewingCert} onClose={() => setViewingCert(null)} />
    </div>
  );
};
