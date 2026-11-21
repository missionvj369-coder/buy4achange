import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  LogOut,
  Share2,
  Copy,
  Check,
  Wallet,
  Heart,
  Package,
  BookOpen,
  FileDown,
  MessageCircle,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Settings,
} from 'lucide-react';
import {
  Cause,
  MemberUser,
  Order,
  ReferralEarning,
  ReferralPayout,
  ReferralWalletSummary,
  UnlockedDigitalItem,
} from '../types.ts';
import { generateOrderReceiptPdf } from '../utils/pdfCertificate.ts';

interface MemberPortalProps {
  causes: Cause[];
  onNavigateStore: () => void;
  onAuthChange: (user: MemberUser | null, token: string | null) => void;
  onSyncUnlockedLibrary: (items: UnlockedDigitalItem[]) => void;
  onLaunchDigital: (item: UnlockedDigitalItem) => void;
  referredByCode?: string;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({
  causes,
  onNavigateStore,
  onAuthChange,
  onSyncUnlockedLibrary,
  onLaunchDigital,
  referredByCode = '',
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('buy4achange_member_token')
  );
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Login / Register state (zero fake defaults)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    shipping_address: '',
    upi_payout_id: '',
    referred_by_code: referredByCode,
  });

  // Dashboard state
  const [user, setUser] = useState<MemberUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [digitalItems, setDigitalItems] = useState<UnlockedDigitalItem[]>([]);
  const [earnings, setEarnings] = useState<ReferralEarning[]>([]);
  const [payouts, setPayouts] = useState<ReferralPayout[]>([]);
  const [wallet, setWallet] = useState<ReferralWalletSummary>({
    commissionPct: 5,
    minPayout: 100,
    pendingEarnings: 0,
    approvedEarnings: 0,
    paidOutTotal: 0,
    donatedTotal: 0,
    availableBalance: 0,
    totalReferralsCount: 0,
    networkMissionImpact: 0,
  });
  const [activeTab, setActiveTab] = useState<'refer' | 'orders' | 'library' | 'profile'>('refer');
  const [loadingDash, setLoadingDash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Payout / Donate form
  const [payoutMode, setPayoutMode] = useState<'upi_withdraw' | 'donate_mission'>('upi_withdraw');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutUpi, setPayoutUpi] = useState('');
  const [donateCauseId, setDonateCauseId] = useState(causes[0]?.id || 'cause-everyday-essentials');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [dashNotice, setDashNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Profile edit form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    shipping_address: '',
    city: '',
    state: '',
    pincode: '',
    upi_payout_id: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('buy4achange_member_token');
    setToken(null);
    setUser(null);
    onAuthChange(null, null);
  };

  const fetchDashboard = async (activeTok = token) => {
    if (!activeTok) return;
    setLoadingDash(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeTok}` },
        cache: 'no-store',
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const d = await res.json();
      if (d.user) {
        setUser(d.user);
        onAuthChange(d.user, activeTok);
        setPayoutUpi(d.user.upi_payout_id || '');
        setProfileForm({
          name: d.user.name || '',
          phone: d.user.phone || '',
          shipping_address: d.user.shipping_address || '',
          city: d.user.city || '',
          state: d.user.state || '',
          pincode: d.user.pincode || '',
          upi_payout_id: d.user.upi_payout_id || '',
        });
      }
      if (Array.isArray(d.orders)) setOrders(d.orders);
      if (Array.isArray(d.digitalItems)) {
        setDigitalItems(d.digitalItems);
        if (d.digitalItems.length > 0) onSyncUnlockedLibrary(d.digitalItems);
      }
      if (Array.isArray(d.earnings)) setEarnings(d.earnings);
      if (Array.isArray(d.payouts)) setPayouts(d.payouts);
      if (d.wallet) setWallet(d.wallet);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboard(token);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Login failed');
      localStorage.setItem('buy4achange_member_token', d.token);
      setToken(d.token);
      onAuthChange(d.user, d.token);
    } catch (err: any) {
      setAuthError(err.message || 'Sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Registration failed');
      localStorage.setItem('buy4achange_member_token', d.token);
      setToken(d.token);
      onAuthChange(d.user, d.token);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setDashNotice(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Could not save profile');
      setUser(d.user);
      onAuthChange(d.user, token);
      setDashNotice({ ok: true, text: 'Profile saved — your checkout details & UPI ID are updated.' });
    } catch (err: any) {
      setDashNotice({ ok: false, text: err.message || 'Save failed' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePayoutOrDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPayoutLoading(true);
    setDashNotice(null);
    try {
      const res = await fetch('/api/referrals/payout-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          payoutType: payoutMode,
          amount: Number(payoutAmount),
          upiId: payoutUpi,
          causeId: donateCauseId,
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Request failed');
      setWallet(d.wallet);
      setPayouts(d.payouts || []);
      setPayoutAmount('');
      setDashNotice({
        ok: true,
        text:
          payoutMode === 'donate_mission'
            ? 'Thank you! Your referral earnings have been credited directly to your chosen Living India mission.'
            : 'UPI payout request submitted! UGT Admin will settle it to your UPI ID and record the bank UTR.',
      });
    } catch (err: any) {
      setDashNotice({ ok: false, text: err.message || 'Request failed' });
    } finally {
      setPayoutLoading(false);
    }
  };

  // --- VIEW 1: REGISTER / SIGN IN ---
  if (!token) {
    return (
      <div className="min-h-screen hero-architectural py-8 px-4">
        <div className="max-w-lg mx-auto space-y-5">
          <button
            type="button"
            onClick={onNavigateStore}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 inline-flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#166534]" />
            <span>Back to Buy4AChange</span>
          </button>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="hero-horizon-bar" />
            <div className="p-6 bg-[#FAF9F6] border-b border-gray-200 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
                <User className="w-6 h-6" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Buy4AChange Member Account
              </h1>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Save your checkout details, sync your eBooks across devices, and get your personal <strong>Refer &amp; Earn</strong> social sharing link.
              </p>

              <div className="inline-flex p-1 rounded-xl bg-white border border-gray-200 mt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                    authMode === 'register' ? 'bg-[#166534] text-white' : 'text-gray-600'
                  }`}
                >
                  Create Free Account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                    authMode === 'login' ? 'bg-[#166534] text-white' : 'text-gray-600'
                  }`}
                >
                  Sign In
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
                    <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:border-[#166534] focus:outline-none"
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
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 focus:border-[#166534] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl btn-future-primary font-semibold text-xs"
                  >
                    {authLoading ? 'Signing in...' : 'Sign In to Dashboard'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="+91 98XXXXXXXX"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
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
                        placeholder="you@example.com"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Password (min 6 chars) *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="Create password"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">UPI ID for Referral Earnings (Optional)</label>
                      <input
                        type="text"
                        value={regForm.upi_payout_id}
                        onChange={(e) => setRegForm({ ...regForm, upi_payout_id: e.target.value })}
                        placeholder="yourname@okicici"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Invited By Code (Optional)</label>
                      <input
                        type="text"
                        value={regForm.referred_by_code}
                        onChange={(e) => setRegForm({ ...regForm, referred_by_code: e.target.value })}
                        placeholder="B4C-XXXXX"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] text-[#166534]">
                    <strong>Instant Referral Link:</strong> You will immediately get your personal shareable code to earn income on every verified purchase through your referrals!
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl btn-future-primary font-semibold text-xs"
                  >
                    {authLoading ? 'Creating Account...' : 'Create Account & Get My Referral Link'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTHENTICATED MEMBER & REFER-AND-EARN DASHBOARD ---
  const referralLink = user
    ? `${window.location.origin}/?ref=${encodeURIComponent(user.referral_code)}`
    : window.location.origin;
  const shareText = `Shop zero-chemical products & interactive eBooks on Buy4AChange where every purchase funds 8 Living India national missions!`;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900">
      <div className="hero-horizon-bar" />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              type="button"
              onClick={onNavigateStore}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center space-x-1 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#166534]" />
              <span className="hidden sm:inline">Shop</span>
            </button>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm sm:text-base text-gray-900 truncate">
                {user?.name || 'My Account'}
              </div>
              <div className="text-[11px] text-[#166534] font-mono truncate">
                {user?.referral_code} · Earn {wallet.commissionPct}% per referral
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-1 overflow-x-auto text-xs">
            {(
              [
                { id: 'refer', label: 'Refer & Earn', icon: Share2 },
                { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
                { id: 'library', label: `Library (${digitalItems.length})`, icon: BookOpen },
                { id: 'profile', label: 'Profile', icon: Settings },
              ] as const
            ).map((tb) => {
              const Icon = tb.icon;
              return (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setActiveTab(tb.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap inline-flex items-center space-x-1 ${
                    activeTab === tb.id ? 'bg-[#166534] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tb.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-rose-50 hover:text-rose-700 text-gray-600"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {dashNotice && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
              dashNotice.ok
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {dashNotice.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{dashNotice.text}</span>
          </div>
        )}

        {/* Wallet & Impact Bento Telemetry */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bento-surface p-4 rounded-2xl">
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <Wallet className="w-3.5 h-3.5 text-[#166534]" />
              <span>Available Balance</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#166534] mt-1">
              ₹{wallet.availableBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-gray-500">Min UPI payout: ₹{wallet.minPayout}</div>
          </div>
          <div className="bento-surface p-4 rounded-2xl">
            <div className="text-xs text-gray-500">Pending Verification</div>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
              ₹{wallet.pendingEarnings.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-gray-500">Unlocks once orders verify paid</div>
          </div>
          <div className="bento-surface p-4 rounded-2xl">
            <div className="text-xs text-gray-500">Paid Out / Donated</div>
            <div className="text-2xl font-bold font-mono text-gray-900 mt-1">
              ₹{(wallet.paidOutTotal + wallet.donatedTotal).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-gray-500">{wallet.totalReferralsCount} referred orders</div>
          </div>
          <div className="bento-surface p-4 rounded-2xl">
            <div className="text-xs text-[#166534] font-semibold flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5" />
              <span>Your Network Impact</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#166534] mt-1">
              ₹{wallet.networkMissionImpact.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-gray-500">Living India missions funded</div>
          </div>
        </div>

        {/* TAB 1: REFER & EARN HUB */}
        {activeTab === 'refer' && (
          <div className="space-y-5">
            {/* Personal Share Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full">
                    <span className="live-dot" />
                    <span>EARN {wallet.commissionPct}% ON EVERY VERIFIED REFERRAL</span>
                  </span>
                  <h2 className="font-display text-xl font-bold text-gray-900 mt-2">
                    Share Buy4AChange on Your Socials &amp; Earn Honest Income
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Every friend who buys via your link funds a Living India mission AND credits {wallet.commissionPct}% of the verified order to your wallet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchDashboard()}
                  className="self-start px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 inline-flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#166534] ${loadingDash ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 bg-[#FAF9F6] border border-gray-300 rounded-xl px-3.5 py-2.5 font-mono text-xs text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(referralLink).catch(() => {});
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-xl btn-future-primary font-semibold text-xs inline-flex items-center justify-center space-x-1.5 shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy My Link'}</span>
                </button>
              </div>

              {/* 1-Tap Social Buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${referralLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#F0FDF4] hover:bg-green-100 border border-[#BBF7D0] text-[#166534] font-semibold inline-flex items-center space-x-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-semibold inline-flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold"
                >
                  X (Twitter)
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold"
                >
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Withdraw to UPI OR Donate to Living India Mission */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <form
                onSubmit={handlePayoutOrDonate}
                className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                    <IndianRupee className="w-4 h-4 text-[#166534]" />
                    <span>Withdraw or Donate Earnings</span>
                  </h3>
                  <span className="font-mono font-bold text-[#166534]">
                    Available: ₹{wallet.availableBalance}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FAF9F6] border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPayoutMode('upi_withdraw')}
                    className={`py-2 rounded-lg font-semibold ${
                      payoutMode === 'upi_withdraw' ? 'bg-[#166534] text-white' : 'text-gray-600'
                    }`}
                  >
                    Withdraw to UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMode('donate_mission')}
                    className={`py-2 rounded-lg font-semibold ${
                      payoutMode === 'donate_mission' ? 'bg-[#166534] text-white' : 'text-gray-600'
                    }`}
                  >
                    Donate to Mission
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min={payoutMode === 'donate_mission' ? 10 : wallet.minPayout}
                      step="1"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder={
                        payoutMode === 'donate_mission' ? 'Min ₹10' : `Min ₹${wallet.minPayout}`
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono font-semibold"
                    />
                  </div>
                  {payoutMode === 'upi_withdraw' ? (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Your UPI ID *</label>
                      <input
                        type="text"
                        required
                        value={payoutUpi}
                        onChange={(e) => setPayoutUpi(e.target.value)}
                        placeholder="yourname@okicici"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Choose Living India Mission</label>
                      <select
                        value={donateCauseId}
                        onChange={(e) => setDonateCauseId(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                      >
                        {causes.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={payoutLoading || wallet.availableBalance <= 0}
                  className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] disabled:opacity-40 text-white font-semibold"
                >
                  {payoutLoading
                    ? 'Processing...'
                    : payoutMode === 'donate_mission'
                    ? 'Donate Directly to Mission Now'
                    : 'Request UPI Payout'}
                </button>
              </form>

              {/* Recent Referral Earnings & Payouts */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 text-xs">
                <h3 className="text-sm font-bold text-gray-900">Recent Referral Earnings</h3>
                {earnings.length === 0 ? (
                  <p className="text-gray-500 py-4 text-center">
                    Share your link above on WhatsApp or Instagram — your verified referral earnings appear here in real time.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {earnings.map((e) => (
                      <div
                        key={e.id}
                        className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-mono font-semibold text-gray-900">{e.order_number}</div>
                          <div className="text-[11px] text-gray-500">
                            {e.buyer_name} · Order ₹{e.order_subtotal} ({e.commission_pct}%)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-[#166534]">+₹{e.commission_amount}</div>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              e.status === 'approved'
                                ? 'bg-[#F0FDF4] text-[#166534]'
                                : e.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {e.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {payouts.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 space-y-1.5">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase">Payouts &amp; Donations</div>
                    {payouts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-700">
                          {p.payout_type === 'donate_mission' ? 'Mission Donation' : `UPI (${p.upi_id})`}
                        </span>
                        <span className="font-mono font-semibold text-gray-900">
                          ₹{p.amount} · {p.status.toUpperCase()}
                          {p.payout_utr ? ` (${p.payout_utr})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY ORDERS & PDF CERTIFICATES */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-10 text-center text-xs text-gray-500">
                Your verified orders and PDF Impact Certificates will appear here.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-gray-900">{ord.order_number}</div>
                      <div className="text-gray-500">
                        {new Date(ord.created_at).toLocaleString('en-IN')} · ₹{ord.total_amount} · Mission: ₹{ord.cause_donation_amount}
                      </div>
                      {ord.tracking_number && (
                        <div className="text-[11px] text-[#166534] font-mono mt-0.5">
                          {ord.courier_name || 'Courier'}: {ord.tracking_number}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          ord.payment_status === 'paid'
                            ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {ord.payment_status === 'paid' ? ord.order_status : 'Pending UTR Check'}
                      </span>
                      <button
                        type="button"
                        onClick={() => void generateOrderReceiptPdf(ord)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold inline-flex items-center space-x-1"
                      >
                        <FileDown className="w-3.5 h-3.5 text-[#166534]" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACCOUNT-SYNCED DIGITAL LIBRARY */}
        {activeTab === 'library' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            {digitalItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Purchased paid eBooks &amp; HTML eProducts linked to your account will sync here automatically on every device.
              </div>
            ) : (
              digitalItems.map((item) => (
                <div
                  key={`${item.order_number}-${item.product_id}`}
                  className="p-3.5 rounded-xl bg-[#FAF9F6] border border-gray-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-gray-900">{item.product_name}</div>
                    <div className="text-[11px] text-gray-500 font-mono">Order {item.order_number}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onLaunchDigital(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#166534] text-white font-semibold"
                  >
                    Open Now
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: SAVED PROFILE & DELIVERY DETAILS */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 text-xs max-w-2xl"
          >
            <div>
              <h3 className="text-sm font-bold text-gray-900">Saved Checkout &amp; Payout Profile</h3>
              <p className="text-gray-500">
                Your saved contact and address auto-fill checkout whenever you are signed in.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Delivery Address</label>
              <input
                type="text"
                value={profileForm.shipping_address}
                onChange={(e) => setProfileForm({ ...profileForm, shipping_address: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="State"
                value={profileForm.state}
                onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                maxLength={6}
                placeholder="PIN Code"
                value={profileForm.pincode}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })
                }
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">UPI ID for Referral Earnings Payout</label>
              <input
                type="text"
                placeholder="yourname@okicici"
                value={profileForm.upi_payout_id}
                onChange={(e) => setProfileForm({ ...profileForm, upi_payout_id: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl btn-future-primary font-semibold"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
