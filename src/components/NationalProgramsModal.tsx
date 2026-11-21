import React, { useState, useEffect } from 'react';
import { X, Repeat, Building2, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import { Cause } from '../types.ts';

interface NationalProgramsModalProps {
  isOpen: boolean;
  initialTab?: 'subscription' | 'bulk';
  onClose: () => void;
  causes: Cause[];
}

const SUBSCRIPTION_BOXES = [
  {
    name: 'Zero-Chemical Family Essentials Box',
    price: 999,
    desc: 'Monthly curated pure household soaps, natural cleaners, & chemical-free daily staples from verified Indian makers.',
  },
  {
    name: 'Organic Millet & Cold-Pressed Pack',
    price: 1499,
    desc: 'Traditional unpolished millets, wood-pressed oils, and pure jaggery directly from verified Farmer FPOs.',
  },
  {
    name: 'Student AI & Conscious Book Pack',
    price: 499,
    desc: 'Monthly curated interactive HTML eBooks, study guides, and eco-stationery funding free student AI training.',
  },
];

export const NationalProgramsModal: React.FC<NationalProgramsModalProps> = ({
  isOpen,
  initialTab = 'subscription',
  onClose,
  causes,
}) => {
  const [tab, setTab] = useState<'subscription' | 'bulk'>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const [subForm, setSubForm] = useState({
    subscriber_name: '',
    email: '',
    phone: '',
    plan_name: SUBSCRIPTION_BOXES[0].name,
    frequency: 'Monthly',
    monthly_budget: SUBSCRIPTION_BOXES[0].price,
    cause_id: causes[0]?.id || 'cause-everyday-essentials',
    delivery_address: '',
    state: 'Karnataka',
    pincode: '',
  });

  const [bulkForm, setBulkForm] = useState({
    org_name: '',
    org_type: 'Corporate CSR',
    contact_name: '',
    email: '',
    phone: '',
    city: '',
    state: 'Karnataka',
    estimated_budget: '50000',
    cause_id: causes[0]?.id || 'cause-everyday-essentials',
    requirements: '',
  });

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setNotice(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Subscription failed');
      setNotice({
        ok: true,
        text: `Monthly Conscious Box enrolled! Our UGT India team will confirm your first dispatch schedule on ${subForm.email}.`,
      });
      setSubForm((p) => ({ ...p, subscriber_name: '', email: '', phone: '', delivery_address: '', pincode: '' }));
    } catch (err: any) {
      setNotice({ ok: false, text: err.message || 'Could not submit subscription' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/bulk-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Submission failed');
      setNotice({
        ok: true,
        text: `Institutional / CSR Procurement request received for ${bulkForm.org_name}. UGT India Operations will prepare your custom quotation & mission impact report.`,
      });
      setBulkForm((p) => ({ ...p, org_name: '', contact_name: '', email: '', phone: '', requirements: '' }));
    } catch (err: any) {
      setNotice({ ok: false, text: err.message || 'Could not submit inquiry' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#02140D] border border-emerald-400/30 rounded-2xl shadow-2xl overflow-hidden my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-horizon-bar" />

        {/* Header */}
        <div className="px-6 py-5 bg-[#031D13] border-b border-white/10 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
              LIVING INDIA PROGRAMS
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold font-display uppercase tracking-tight text-white">
              National Transformation Programs
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 bg-[#02120B] border-b border-white/10 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => { setTab('subscription'); setNotice(null); }}
            className={`px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider font-bold border-b-2 -mb-px flex items-center space-x-1.5 transition-colors ${
              tab === 'subscription' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-white/55 hover:text-white'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Monthly Box</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('bulk'); setNotice(null); }}
            className={`px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider font-bold border-b-2 -mb-px flex items-center space-x-1.5 transition-colors ${
              tab === 'bulk' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-white/55 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>CSR &amp; Institutional Bulk</span>
          </button>
        </div>

        <div className="p-6 max-h-[76vh] overflow-y-auto space-y-4 text-xs scrollbar-thin">
          {notice && (
            <div
              className={`p-3.5 rounded-xl border flex items-start space-x-2 ${
                notice.ok
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-400/40 text-rose-200'
              }`}
            >
              {notice.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {tab === 'subscription' ? (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUBSCRIPTION_BOXES.map((box) => {
                  const selected = subForm.plan_name === box.name;
                  return (
                    <button
                      key={box.name}
                      type="button"
                      onClick={() =>
                        setSubForm({ ...subForm, plan_name: box.name, monthly_budget: box.price })
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'bg-emerald-500/15 border-emerald-400 text-white'
                          : 'bg-white/[0.04] border-white/10 hover:border-white/30 text-white/80'
                      }`}
                    >
                      <div className="font-display font-bold text-white text-xs">{box.name}</div>
                      <div className="font-mono font-bold text-emerald-300 mt-1">₹{box.price} / box</div>
                      <p className="text-[11px] text-white/55 mt-1 leading-relaxed">{box.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-[10px] text-white/60 mb-1">
                    Delivery Frequency
                  </label>
                  <select
                    value={subForm.frequency}
                    onChange={(e) => setSubForm({ ...subForm, frequency: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Monthly" className="bg-[#031810]">Monthly Refill</option>
                    <option value="Bi-Monthly" className="bg-[#031810]">Every 2 Months</option>
                    <option value="Quarterly" className="bg-[#031810]">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider text-[10px] text-white/60 mb-1 flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-emerald-400" />
                    <span>Recurring Mission to Fund</span>
                  </label>
                  <select
                    value={subForm.cause_id}
                    onChange={(e) => setSubForm({ ...subForm, cause_id: e.target.value })}
                    className={inputCls}
                  >
                    {causes.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#031810]">{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={subForm.subscriber_name}
                  onChange={(e) => setSubForm({ ...subForm, subscriber_name: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={subForm.email}
                  onChange={(e) => setSubForm({ ...subForm, email: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="tel"
                  required
                  placeholder="Mobile / WhatsApp *"
                  value={subForm.phone}
                  onChange={(e) => setSubForm({ ...subForm, phone: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Delivery Address *"
                  value={subForm.delivery_address}
                  onChange={(e) => setSubForm({ ...subForm, delivery_address: e.target.value })}
                  className={`sm:col-span-2 ${inputCls}`}
                />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-Digit PIN *"
                  value={subForm.pincode}
                  onChange={(e) =>
                    setSubForm({ ...subForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })
                  }
                  className={`${inputCls} font-mono`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-full bg-emerald-400 hover:bg-white text-black font-mono uppercase tracking-[0.14em] font-extrabold transition-colors"
              >
                {submitting ? 'Enrolling...' : `Enroll in ${subForm.frequency} Essentials Box`}
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-[10px] text-white/60 mb-1">
                    Organization / Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="School, Hospital, Company, or Trust"
                    value={bulkForm.org_name}
                    onChange={(e) => setBulkForm({ ...bulkForm, org_name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider text-[10px] text-white/60 mb-1">
                    Organization Type
                  </label>
                  <select
                    value={bulkForm.org_type}
                    onChange={(e) => setBulkForm({ ...bulkForm, org_type: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Corporate CSR" className="bg-[#031810]">Corporate CSR Program</option>
                    <option value="School / College" className="bg-[#031810]">School / University</option>
                    <option value="Hospital / Clinic" className="bg-[#031810]">Hospital / Wellness Center</option>
                    <option value="NGO / Trust" className="bg-[#031810]">NGO / Charitable Trust</option>
                    <option value="Government / Panchayat" className="bg-[#031810]">Government / Gram Panchayat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Contact Person *"
                  value={bulkForm.contact_name}
                  onChange={(e) => setBulkForm({ ...bulkForm, contact_name: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="email"
                  required
                  placeholder="Official Email *"
                  value={bulkForm.email}
                  onChange={(e) => setBulkForm({ ...bulkForm, email: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number *"
                  value={bulkForm.phone}
                  onChange={(e) => setBulkForm({ ...bulkForm, phone: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-[10px] text-white/60 mb-1">
                    Estimated Order Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={bulkForm.estimated_budget}
                    onChange={(e) => setBulkForm({ ...bulkForm, estimated_budget: e.target.value })}
                    className={`${inputCls} font-mono font-bold`}
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider text-[10px] text-white/60 mb-1">
                    Mission to Direct CSR Impact
                  </label>
                  <select
                    value={bulkForm.cause_id}
                    onChange={(e) => setBulkForm({ ...bulkForm, cause_id: e.target.value })}
                    className={inputCls}
                  >
                    {causes.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#031810]">{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase tracking-wider text-[10px] text-white/60 mb-1">
                  Bulk Product Needs &amp; Delivery Location *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify quantities, preferred zero-chemical products or eBooks, and target delivery city/state..."
                  value={bulkForm.requirements}
                  onChange={(e) => setBulkForm({ ...bulkForm, requirements: e.target.value })}
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-full bg-emerald-400 hover:bg-white text-black font-mono uppercase tracking-[0.14em] font-extrabold transition-colors"
              >
                {submitting ? 'Submitting Proposal Request...' : 'Request Institutional / CSR Quote'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
