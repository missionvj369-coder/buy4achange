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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-gray-900">
              National Transformation Programs
            </h2>
            <p className="text-xs text-gray-500">
              Recurring Zero-Chemical Household Boxes &amp; Institutional / CSR Bulk Procurement
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 border-b border-gray-200 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => { setTab('subscription'); setNotice(null); }}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 -mb-px flex items-center space-x-1.5 ${
              tab === 'subscription' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-gray-500'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Monthly Essentials Box</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('bulk'); setNotice(null); }}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 -mb-px flex items-center space-x-1.5 ${
              tab === 'bulk' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-gray-500'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Institutional &amp; CSR Bulk</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 max-h-[76vh] overflow-y-auto space-y-4 text-xs">
          {notice && (
            <div
              className={`p-3.5 rounded-lg border flex items-start space-x-2 ${
                notice.ok
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {notice.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {tab === 'subscription' ? (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SUBSCRIPTION_BOXES.map((box) => {
                  const selected = subForm.plan_name === box.name;
                  return (
                    <button
                      key={box.name}
                      type="button"
                      onClick={() =>
                        setSubForm({ ...subForm, plan_name: box.name, monthly_budget: box.price })
                      }
                      className={`p-3 rounded-xl border text-left ${
                        selected
                          ? 'bg-[#F0FDF4] border-[#166534]'
                          : 'bg-[#FAF9F6] border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 text-xs">{box.name}</div>
                      <div className="font-mono font-bold text-[#166534] mt-1">₹{box.price} / box</div>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{box.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Delivery Frequency</label>
                  <select
                    value={subForm.frequency}
                    onChange={(e) => setSubForm({ ...subForm, frequency: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Monthly">Monthly Refill</option>
                    <option value="Bi-Monthly">Every 2 Months</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <Heart className="w-3.5 h-3.5 text-[#166534]" />
                    <span>Recurring Mission to Fund</span>
                  </label>
                  <select
                    value={subForm.cause_id}
                    onChange={(e) => setSubForm({ ...subForm, cause_id: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {causes.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
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
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={subForm.email}
                  onChange={(e) => setSubForm({ ...subForm, email: e.target.value })}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="tel"
                  required
                  placeholder="Mobile / WhatsApp *"
                  value={subForm.phone}
                  onChange={(e) => setSubForm({ ...subForm, phone: e.target.value })}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Delivery Address *"
                  value={subForm.delivery_address}
                  onChange={(e) => setSubForm({ ...subForm, delivery_address: e.target.value })}
                  className="sm:col-span-2 bg-white border border-gray-300 rounded-lg px-3 py-2"
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
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold"
              >
                {submitting ? 'Enrolling...' : `Enroll in ${subForm.frequency} Essentials Box`}
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Organization / Institution Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="School, Hospital, Company, or Trust"
                    value={bulkForm.org_name}
                    onChange={(e) => setBulkForm({ ...bulkForm, org_name: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Organization Type</label>
                  <select
                    value={bulkForm.org_type}
                    onChange={(e) => setBulkForm({ ...bulkForm, org_type: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="Corporate CSR">Corporate CSR Program</option>
                    <option value="School / College">School / University</option>
                    <option value="Hospital / Clinic">Hospital / Wellness Center</option>
                    <option value="NGO / Trust">NGO / Charitable Trust</option>
                    <option value="Government / Panchayat">Government / Gram Panchayat</option>
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
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="email"
                  required
                  placeholder="Official Email *"
                  value={bulkForm.email}
                  onChange={(e) => setBulkForm({ ...bulkForm, email: e.target.value })}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number *"
                  value={bulkForm.phone}
                  onChange={(e) => setBulkForm({ ...bulkForm, phone: e.target.value })}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estimated Order Budget (₹)</label>
                  <input
                    type="number"
                    value={bulkForm.estimated_budget}
                    onChange={(e) => setBulkForm({ ...bulkForm, estimated_budget: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Living India Mission to Direct CSR Impact</label>
                  <select
                    value={bulkForm.cause_id}
                    onChange={(e) => setBulkForm({ ...bulkForm, cause_id: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {causes.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bulk Product Needs &amp; Delivery Location *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify quantities, preferred zero-chemical products or eBooks, and target delivery city/state..."
                  value={bulkForm.requirements}
                  onChange={(e) => setBulkForm({ ...bulkForm, requirements: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold"
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
