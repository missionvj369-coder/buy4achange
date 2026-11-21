import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  Plus,
  Trash2,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Upload,
  FileCheck2,
  Leaf,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Truck,
  QrCode,
  Eye,
  X,
  IndianRupee,
} from 'lucide-react';
import { Cause, Product, Seller, SellerEarningsSummary } from '../types.ts';
import { CertificateViewerModal, OriginQrModal } from './CertificateViewerModal.tsx';

interface SellerPortalProps {
  causes: Cause[];
  onNavigateStore: () => void;
  onRefreshStore: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

export const SellerPortal: React.FC<SellerPortalProps> = ({
  causes,
  onNavigateStore,
  onRefreshStore,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('buy4achange_seller_token')
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regForm, setRegForm] = useState({
    store_name: '',
    owner_name: '',
    email: '',
    password: '',
    phone: '',
    business_type: 'Manufacturer',
    registration_no: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    upi_payout_id: '',
    story: '',
  });

  // Authenticated Dashboard State
  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<SellerEarningsSummary>({
    totalGross: 0,
    missionContribution: 0,
    platformFee: 0,
    netPayout: 0,
    verifiedOrdersCount: 0,
    pendingOrdersCount: 0,
  });
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'payouts'>('products');
  const [loadingDash, setLoadingDash] = useState(false);

  // Product Submission Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingProd, setSubmittingProd] = useState(false);
  const [prodError, setProdError] = useState<string | null>(null);
  const [prodNotice, setProdNotice] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'Everyday Essentials',
    price: '',
    compare_at_price: '',
    stock: '50',
    description: '',
    image_url: '',
    cause_id: causes[0]?.id || 'cause-everyday-essentials',
    cause_allocation_pct: '15',
    cause_impact_text: '',
    origin_state: '',
    quality_cert_url: '',
    quality_cert_name: '',
    zero_chemical_cert_url: '',
    zero_chemical_cert_name: '',
  });

  // Viewers & Dispatch Modal
  const [viewingCert, setViewingCert] = useState<{
    title: string;
    subtitle?: string;
    fileName?: string;
    dataUrl: string;
  } | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const [dispatchOrder, setDispatchOrder] = useState<any | null>(null);
  const [dispatchCourier, setDispatchCourier] = useState('India Post');
  const [dispatchAwb, setDispatchAwb] = useState('');
  const [savingDispatch, setSavingDispatch] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('buy4achange_seller_token');
    setToken(null);
    setSeller(null);
  };

  const fetchSellerDashboard = async (activeTok = token) => {
    if (!activeTok) return;
    setLoadingDash(true);
    try {
      const res = await fetch('/api/seller/me', {
        headers: { Authorization: `Bearer ${activeTok}` },
        cache: 'no-store',
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.seller) setSeller(data.seller);
      if (Array.isArray(data.products)) setSellerProducts(data.products);
      if (Array.isArray(data.orders)) setSellerOrders(data.orders);
      if (data.earnings) setEarnings(data.earnings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => {
    if (token) fetchSellerDashboard(token);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/seller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
      localStorage.setItem('buy4achange_seller_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/seller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('buy4achange_seller_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Compress uploaded photo/certificate image or read PDF (max 2.5MB)
  const readFileAsDataUrl = (file: File, compressIfImage = true): Promise<{ dataUrl: string; name: string }> =>
    new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error('File is too large (max 5 MB).'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.onload = () => {
        const result = String(reader.result || '');
        if (!compressIfImage || !file.type.startsWith('image/')) {
          return resolve({ dataUrl: result, name: file.name });
        }
        const img = new Image();
        img.onerror = () => resolve({ dataUrl: result, name: file.name });
        img.onload = () => {
          const MAX = 1100;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width >= height) {
              height = Math.round((height * MAX) / width);
              width = MAX;
            } else {
              width = Math.round((width * MAX) / height);
              height = MAX;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve({ dataUrl: result, name: file.name });
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.82), name: file.name });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });

  const handleUploadAsset = async (
    file: File | null,
    field: 'image_url' | 'quality_cert' | 'zero_chemical_cert'
  ) => {
    if (!file) return;
    setProdError(null);
    try {
      const { dataUrl, name } = await readFileAsDataUrl(file, true);
      if (field === 'image_url') {
        setProdForm((p) => ({ ...p, image_url: dataUrl }));
      } else if (field === 'quality_cert') {
        setProdForm((p) => ({ ...p, quality_cert_url: dataUrl, quality_cert_name: name }));
      } else {
        setProdForm((p) => ({ ...p, zero_chemical_cert_url: dataUrl, zero_chemical_cert_name: name }));
      }
    } catch (err: any) {
      setProdError(err.message || 'Upload failed');
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!prodForm.image_url) {
      setProdError('Please upload a clear product photo.');
      return;
    }
    if (!prodForm.quality_cert_url) {
      setProdError('Quality Certificate upload is mandatory.');
      return;
    }
    if (!prodForm.zero_chemical_cert_url) {
      setProdError('Zero-Chemical Certificate upload is mandatory.');
      return;
    }

    setSubmittingProd(true);
    setProdError(null);
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...prodForm,
          origin_state: prodForm.origin_state || seller?.state || 'India',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not submit product.');
      }
      setShowAddModal(false);
      setProdNotice(
        `"${prodForm.name}" submitted with Quality & Zero-Chemical certificates for UGT Admin audit.`
      );
      setTimeout(() => setProdNotice(null), 6000);
      setProdForm({
        name: '',
        category: 'Everyday Essentials',
        price: '',
        compare_at_price: '',
        stock: '50',
        description: '',
        image_url: '',
        cause_id: causes[0]?.id || 'cause-everyday-essentials',
        cause_allocation_pct: '15',
        cause_impact_text: '',
        origin_state: seller?.state || '',
        quality_cert_url: '',
        quality_cert_name: '',
        zero_chemical_cert_url: '',
        zero_chemical_cert_name: '',
      });
      fetchSellerDashboard();
      onRefreshStore();
    } catch (err: any) {
      setProdError(err.message || 'Submission failed');
    } finally {
      setSubmittingProd(false);
    }
  };

  const handleDeleteSellerProduct = async (id: string) => {
    if (!token || !confirm('Remove this product from your manufacturer catalog?')) return;
    const res = await fetch(`/api/seller/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchSellerDashboard();
      onRefreshStore();
    }
  };

  const handleSellerDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !dispatchOrder) return;
    setSavingDispatch(true);
    try {
      const res = await fetch(`/api/seller/orders/${dispatchOrder.id}/dispatch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courierName: dispatchCourier,
          trackingNumber: dispatchAwb,
          status: 'Shipped',
        }),
      });
      if (res.ok) {
        setDispatchOrder(null);
        fetchSellerDashboard();
      }
    } finally {
      setSavingDispatch(false);
    }
  };

  // --- VIEW 1: MANUFACTURER LOGIN / REGISTRATION ---
  if (!token) {
    return (
      <div className="min-h-screen hero-architectural text-[#0A101F] py-8 px-4">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateStore}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center space-x-1.5 hover:border-teal-400"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Back to Storefront</span>
            </button>
            <span className="text-[11px] font-mono font-semibold text-emerald-300 bg-[#070D19] border border-emerald-400/35 px-3 py-1 rounded-full">
              ZERO-CHEMICAL CERTIFIED NETWORK
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="hero-horizon-bar" />
            <div className="p-6 bg-[#070D19] text-white border-b border-emerald-500/20 text-center space-y-2.5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300">
                <Store className="w-6 h-6" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white tracking-tight">
                Sell With Buy4AChange
              </h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                For ethical Indian manufacturers, artisan collectives, women SHGs, and farmer FPOs producing verified <strong className="text-emerald-300">Quality &amp; Zero-Chemical</strong> products.
              </p>

              <div className="inline-flex p-1 rounded-xl bg-white/[0.06] border border-white/15 mt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    authMode === 'register' ? 'btn-future-primary text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Register Manufacturer Store
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    authMode === 'login' ? 'btn-future-primary text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Manufacturer Sign In
                </button>
              </div>
            </div>

            <div className="p-6">
              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Registered Email *</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="maker@brand.in"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs"
                  >
                    {authLoading ? 'Signing in...' : 'Sign In to Manufacturer Dashboard'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Brand / Factory / SHG Name *</label>
                      <input
                        type="text"
                        required
                        value={regForm.store_name}
                        onChange={(e) => setRegForm({ ...regForm, store_name: e.target.value })}
                        placeholder="e.g. Prakriti Pure Organics"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Owner / Coordinator Name *</label>
                      <input
                        type="text"
                        required
                        value={regForm.owner_name}
                        onChange={(e) => setRegForm({ ...regForm, owner_name: e.target.value })}
                        placeholder="Full name"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Producer Category *</label>
                      <select
                        value={regForm.business_type}
                        onChange={(e) => setRegForm({ ...regForm, business_type: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      >
                        <option value="Manufacturer">Zero-Chemical Manufacturer</option>
                        <option value="Women SHG">Women Self-Help Group (SHG)</option>
                        <option value="Farmer FPO">Farmer Producer Org (FPO)</option>
                        <option value="Artisan Collective">Artisan / Handloom Collective</option>
                        <option value="Eco Startup">Conscious Eco Startup</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">GST / Udyam / FSSAI Reg No.</label>
                      <input
                        type="text"
                        value={regForm.registration_no}
                        onChange={(e) => setRegForm({ ...regForm, registration_no: e.target.value })}
                        placeholder="e.g. UDYAM-KA-01-0012345"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="maker@brand.in"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="+91 98XXXXXXXX"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={regForm.city}
                        onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                        placeholder="City / Town"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">State *</label>
                      <select
                        value={regForm.state}
                        onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={regForm.pincode}
                        onChange={(e) =>
                          setRegForm({ ...regForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })
                        }
                        placeholder="560001"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">UPI ID for Payouts *</label>
                      <input
                        type="text"
                        required
                        value={regForm.upi_payout_id}
                        onChange={(e) => setRegForm({ ...regForm, upi_payout_id: e.target.value })}
                        placeholder="brand@okaxis"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Create Password (min 6 chars) *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="Create password"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      About Your Manufacturing &amp; Zero-Chemical Process *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={regForm.story}
                      onChange={(e) => setRegForm({ ...regForm, story: e.target.value })}
                      placeholder="Briefly describe how your products are crafted without synthetic chemicals..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] text-[#166534]">
                    <strong>Two-Stage Trust Verification:</strong> (1) UGT Admin reviews &amp; approves your store registration. (2) Each product you submit requires both a <strong>Quality Certificate</strong> and a <strong>Zero-Chemical Certificate</strong> before Admin publishes it live.
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs"
                  >
                    {authLoading ? 'Submitting Application...' : 'Submit Manufacturer Store for Approval'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: PRO SELLER DASHBOARD ---
  const isApprovedStore = seller?.status === 'approved';

  return (
    <div className="min-h-screen bg-[#F3F7FB] text-[#0A101F]">
      <header className="bg-[#070D19] text-white border-b border-emerald-500/25 sticky top-0 z-30 shadow-[0_12px_32px_-16px_rgba(7,13,25,0.65)]">
        <div className="hero-horizon-bar" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              type="button"
              onClick={onNavigateStore}
              className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.07] hover:bg-white/[0.14] text-xs font-semibold text-slate-200 flex items-center space-x-1 shrink-0 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Store</span>
            </button>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm sm:text-base text-white truncate">
                {seller?.store_name || 'Manufacturer Portal'}
              </div>
              <div className="text-[11px] text-cyan-300 font-mono truncate">
                {seller?.business_type} · {seller?.city}, {seller?.state}
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-1 overflow-x-auto text-xs bg-white/[0.04] border border-white/10 p-1 rounded-2xl scrollbar-thin">
            {(
              [
                { id: 'products', label: `Products (${sellerProducts.length})` },
                { id: 'orders', label: `Orders (${sellerOrders.length})` },
                { id: 'payouts', label: '3-Way Payouts' },
              ] as const
            ).map((tb) => (
              <button
                key={tb.id}
                type="button"
                onClick={() => setActiveTab(tb.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeTab === tb.id ? 'btn-future-primary text-white' : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {tb.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl border border-white/15 bg-white/[0.07] hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Store Approval Status Banner */}
        {seller && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              seller.status === 'approved'
                ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                : seller.status === 'rejected' || seller.status === 'suspended'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              {seller.status === 'approved' ? (
                <CheckCircle2 className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
              ) : seller.status === 'rejected' || seller.status === 'suspended' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-gray-900">
                  {seller.status === 'approved'
                    ? 'Verified Manufacturer Store Active'
                    : seller.status === 'rejected'
                    ? 'Store Application Needs Revision'
                    : seller.status === 'suspended'
                    ? 'Store Suspended'
                    : 'Store Registration Pending UGT Admin Approval'}
                </div>
                <p className="text-xs text-gray-700">
                  {seller.status === 'approved'
                    ? 'You can submit products with Quality & Zero-Chemical certificates. Each product goes live as soon as Admin approves its certificates.'
                    : seller.admin_notes ||
                      'Our UGT India team is reviewing your registration details. Once approved, you can submit certified zero-chemical products.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchSellerDashboard()}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 inline-flex items-center space-x-1.5 self-start sm:self-center shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#166534] ${loadingDash ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        )}

        {/* Top KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-xs text-gray-500">Net Manufacturer Payout</div>
            <div className="text-xl font-bold font-mono text-[#166534] mt-1">
              ₹{earnings.netPayout.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-gray-500">UPI: {seller?.upi_payout_id || 'Not set'}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-xs text-gray-500">Living India Mission Funded</div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-1">
              ₹{earnings.missionContribution.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#166534]">Generated via your products</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-xs text-gray-500">Approved Live Products</div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-1">
              {sellerProducts.filter((p) => p.approval_status === 'approved').length} / {sellerProducts.length}
            </div>
            <div className="text-[11px] text-amber-700">
              {sellerProducts.filter((p) => p.approval_status === 'pending_approval').length} awaiting certificate audit
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-xs text-gray-500">Verified Orders</div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-1">
              {earnings.verifiedOrdersCount}
            </div>
            <div className="text-[11px] text-gray-500">{earnings.pendingOrdersCount} pending verification</div>
          </div>
        </div>

        {/* TAB 1: SELLER PRODUCTS & MANDATORY CERTIFICATES */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">My Certified Product Catalog</h2>
                <p className="text-xs text-gray-500">
                  Every product requires both a Quality Certificate &amp; a Zero-Chemical Certificate for Admin approval.
                </p>
              </div>
              <button
                type="button"
                disabled={!isApprovedStore}
                onClick={() => {
                  setProdError(null);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Certified Product</span>
              </button>
            </div>

            {prodNotice && (
              <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{prodNotice}</span>
              </div>
            )}

            {sellerProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-2">
                <Package className="w-8 h-8 mx-auto text-gray-400" />
                <div className="text-sm font-bold text-gray-900">No Products Submitted Yet</div>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {isApprovedStore
                    ? 'Click "Submit New Certified Product" above to upload your product photo along with your Quality Certificate and Zero-Chemical Certificate.'
                    : 'Once UGT Admin approves your store registration, you can submit your certified zero-chemical products here.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellerProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-gray-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-semibold text-gray-500 truncate">
                            {p.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                              p.approval_status === 'approved'
                                ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                : p.approval_status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {p.approval_status === 'approved'
                              ? 'Approved & Live'
                              : p.approval_status === 'rejected'
                              ? 'Rejected'
                              : 'Pending Audit'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mt-0.5">{p.name}</h3>
                        <div className="text-sm font-bold text-[#166534]">
                          ₹{p.price.toLocaleString('en-IN')} · Stock {p.stock}
                        </div>
                        {p.approval_notes && (
                          <div className="text-[11px] text-rose-700 mt-1">
                            Admin Note: {p.approval_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Certificates Attached */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {p.quality_cert_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setViewingCert({
                              title: `Quality Certificate — ${p.name}`,
                              fileName: p.quality_cert_name,
                              dataUrl: p.quality_cert_url!,
                            })
                          }
                          className="px-2 py-1 rounded bg-[#FAF9F6] border border-gray-200 text-gray-700 hover:border-[#166534] inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3 text-[#166534]" />
                          <span>Quality Cert</span>
                        </button>
                      )}
                      {p.zero_chemical_cert_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setViewingCert({
                              title: `Zero-Chemical Certificate — ${p.name}`,
                              fileName: p.zero_chemical_cert_name,
                              dataUrl: p.zero_chemical_cert_url!,
                            })
                          }
                          className="px-2 py-1 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] inline-flex items-center space-x-1"
                        >
                          <Leaf className="w-3 h-3" />
                          <span>Zero-Chemical Cert</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      {p.approval_status === 'approved' ? (
                        <button
                          type="button"
                          onClick={() => setQrProduct(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F0FDF4] hover:bg-green-100 border border-[#BBF7D0] text-[#166534] text-xs font-semibold inline-flex items-center space-x-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pack QR Label</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400">QR unlocks on approval</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteSellerProduct(p.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold inline-flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SELLER ORDERS & REAL COURIER DISPATCH */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {sellerOrders.length === 0 ? (
              <div className="p-10 text-center text-xs text-gray-500">
                Verified customer orders containing your products will appear here for dispatch.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-[#FAF9F6] text-[11px] uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">Buyer &amp; PIN</th>
                      <th className="px-4 py-3">Item &amp; Qty</th>
                      <th className="px-4 py-3">Your Net Payout</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sellerOrders.map((o) => (
                      <tr key={o.item_id}>
                        <td className="px-4 py-3 font-mono font-semibold text-gray-900">{o.order_number}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{o.customer_name}</div>
                          <div className="text-[11px] text-gray-500">
                            {o.city}, {o.state} {o.pincode}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{o.product_name}</div>
                          <div className="text-[11px] text-gray-500">
                            Qty {o.quantity} · Gross ₹{o.total}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-[#166534]">
                          ₹{o.seller_net_payout}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              o.payment_status === 'paid'
                                ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {o.payment_status === 'paid' ? o.order_status : 'Awaiting Payment Audit'}
                          </span>
                          {o.tracking_number && (
                            <div className="text-[10px] font-mono text-gray-500 mt-0.5">
                              {o.courier_name}: {o.tracking_number}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {o.payment_status === 'paid' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDispatchOrder(o);
                                setDispatchCourier(o.courier_name || 'India Post');
                                setDispatchAwb(o.tracking_number || '');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#166534] text-white text-xs font-semibold inline-flex items-center space-x-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{o.tracking_number ? 'Update AWB' : 'Dispatch'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: 3-WAY PAYOUT & MISSION IMPACT LEDGER */}
        {activeTab === 'payouts' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-[#166534]" />
              <h3 className="text-base font-bold text-gray-900">Transparent 3-Way Order Split</h3>
            </div>
            <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
              Every verified paid order transparently splits into: (1) <strong>Living India Mission Allocation</strong> (selected by buyer &amp; product %), (2) <strong>5% Platform Operations</strong> (hosting, gateway, verification), and (3) <strong>Your Net Manufacturer Payout</strong> settled to your registered UPI ID (<span className="font-mono font-semibold text-gray-900">{seller?.upi_payout_id}</span>).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200">
                <div className="text-xs text-gray-500">Gross Verified Sales</div>
                <div className="text-lg font-bold font-mono text-gray-900 mt-1">₹{earnings.totalGross}</div>
              </div>
              <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
                <div className="text-xs text-[#166534]">Mission Contribution</div>
                <div className="text-lg font-bold font-mono text-[#166534] mt-1">₹{earnings.missionContribution}</div>
              </div>
              <div className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200">
                <div className="text-xs text-gray-500">Platform Ops (5%)</div>
                <div className="text-lg font-bold font-mono text-gray-700 mt-1">₹{earnings.platformFee}</div>
              </div>
              <div className="p-4 rounded-lg bg-[#166534] text-white">
                <div className="text-xs text-green-100">Net Payable to You</div>
                <div className="text-lg font-bold font-mono mt-1">₹{earnings.netPayout}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: SUBMIT NEW CERTIFIED PRODUCT (WITH MANDATORY QUALITY & ZERO-CHEMICAL CERTIFICATES) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden my-6">
            <div className="px-5 py-4 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#166534]" />
                <span>Submit Product + Mandatory Quality &amp; Zero-Chemical Certificates</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-gray-200 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-5 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              {prodError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{prodError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="e.g. Cold-Pressed Wood-Ghani Groundnut Oil (1L)"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Everyday Essentials">Everyday Essentials</option>
                    <option value="Living Culture">Living Culture</option>
                    <option value="Women Entrepreneurship">Women Entrepreneurship</option>
                    <option value="Protect the Earth">Protect the Earth</option>
                    <option value="Water Security">Water Security</option>
                    <option value="Hill and City">Hill and City</option>
                    <option value="Sports Ecosystem">Sports Ecosystem</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mission Share % (min 10%)</label>
                  <input
                    type="number"
                    min={10}
                    max={50}
                    value={prodForm.cause_allocation_pct}
                    onChange={(e) => setProdForm({ ...prodForm, cause_allocation_pct: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Description &amp; Ingredients *</label>
                <textarea
                  rows={2}
                  required
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="List pure natural ingredients, batch shelf life, and production method..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Cover Photo Upload */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">1. Product Photo (Required) *</label>
                {prodForm.image_url ? (
                  <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                    <img src={prodForm.image_url} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
                    <span className="text-[#166534] font-semibold flex-1">Product photo attached ✓</span>
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, image_url: '' })}
                      className="text-rose-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center space-x-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#166534] bg-[#FAF9F6] cursor-pointer">
                    <Upload className="w-4 h-4 text-[#166534]" />
                    <span className="font-semibold text-gray-700">Upload Product Photo (JPG / PNG / WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadAsset(e.target.files?.[0] || null, 'image_url')}
                    />
                  </label>
                )}
              </div>

              {/* MANDATORY DUAL CERTIFICATE UPLOAD ZONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#166534] flex items-center space-x-1">
                    <FileCheck2 className="w-4 h-4" />
                    <span>2. Quality Certificate *</span>
                  </label>
                  <p className="text-[11px] text-gray-600">
                    ISO / FSSAI / AGMARK / Lab Quality Report (Image or PDF)
                  </p>
                  {prodForm.quality_cert_url ? (
                    <div className="p-2 rounded-lg bg-white border border-[#BBF7D0] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#166534] truncate">
                        ✓ {prodForm.quality_cert_name || 'Attached'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setProdForm({ ...prodForm, quality_cert_url: '', quality_cert_name: '' })}
                        className="text-rose-600 text-[11px] font-semibold shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center space-x-1.5 p-3 rounded-lg border-2 border-dashed border-[#166534]/50 bg-white hover:bg-green-50 cursor-pointer text-[#166534] font-semibold">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Quality Cert</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleUploadAsset(e.target.files?.[0] || null, 'quality_cert')}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-[#166534] flex items-center space-x-1">
                    <Leaf className="w-4 h-4" />
                    <span>3. Zero-Chemical Certificate *</span>
                  </label>
                  <p className="text-[11px] text-gray-600">
                    NPOP Organic / Residue-Free Lab Test / Pure Natural Cert (Image or PDF)
                  </p>
                  {prodForm.zero_chemical_cert_url ? (
                    <div className="p-2 rounded-lg bg-white border border-[#BBF7D0] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#166534] truncate">
                        ✓ {prodForm.zero_chemical_cert_name || 'Attached'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setProdForm({ ...prodForm, zero_chemical_cert_url: '', zero_chemical_cert_name: '' })
                        }
                        className="text-rose-600 text-[11px] font-semibold shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center space-x-1.5 p-3 rounded-lg border-2 border-dashed border-[#166534]/50 bg-white hover:bg-green-50 cursor-pointer text-[#166534] font-semibold">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Zero-Chemical Cert</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleUploadAsset(e.target.files?.[0] || null, 'zero_chemical_cert')}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProd}
                  className="px-5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] disabled:opacity-50 text-white font-semibold"
                >
                  {submittingProd ? 'Submitting for Audit...' : 'Submit for Admin Certificate Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELLER DISPATCH MODAL */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Dispatch {dispatchOrder.order_number}</h3>
              <button type="button" onClick={() => setDispatchOrder(null)} className="text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSellerDispatch} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Courier Partner</label>
                <select
                  value={dispatchCourier}
                  onChange={(e) => setDispatchCourier(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="India Post">India Post</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Karrio Carrier">Karrio Carrier</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Real AWB Tracking Number *</label>
                <input
                  type="text"
                  required
                  value={dispatchAwb}
                  onChange={(e) => setDispatchAwb(e.target.value)}
                  placeholder="Enter real consignment AWB"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono"
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
                  className="px-4 py-2 rounded-lg bg-[#166534] text-white font-semibold"
                >
                  {savingDispatch ? 'Saving...' : 'Save Dispatch AWB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CertificateViewerModal cert={viewingCert} onClose={() => setViewingCert(null)} />
      <OriginQrModal product={qrProduct} onClose={() => setQrProduct(null)} />
    </div>
  );
};
