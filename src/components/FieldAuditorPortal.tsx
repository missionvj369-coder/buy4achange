import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ClipboardCheck,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface FieldAuditorPortalProps {
  onNavigateStore: () => void;
}

const OFFLINE_KEY = 'buy4achange_offline_audits_v1';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

export const FieldAuditorPortal: React.FC<FieldAuditorPortalProps> = ({ onNavigateStore }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    auditor_name: '',
    auditor_phone: '',
    audit_type: 'Manufacturer Factory Inspection',
    subject_name: '',
    state: 'Karnataka',
    district: '',
    latitude: null as number | null,
    longitude: null as number | null,
    zero_chemical_pass: true,
    hygiene_pass: true,
    fair_wage_pass: true,
    impact_verified: true,
    photo_url: '',
    notes: '',
  });

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const onUp = () => setIsOnline(true);
    const onDown = () => setIsOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(offlineQueue));
    } catch {}
  }, [offlineQueue]);

  const captureGps = () => {
    if (!navigator.geolocation) {
      setNotice({ ok: false, text: 'GPS geolocation is not supported by this browser.' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude: Math.round(pos.coords.latitude * 10000) / 10000,
          longitude: Math.round(pos.coords.longitude * 10000) / 10000,
        }));
        setLocating(false);
      },
      () => {
        setNotice({ ok: false, text: 'Could not read GPS location. State & District will be used.' });
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoCapture = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
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
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        setForm((p) => ({ ...p, photo_url: canvas.toDataURL('image/jpeg', 0.78) }));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setSyncing(true);
    const remaining: any[] = [];
    let syncedCount = 0;
    for (const item of offlineQueue) {
      try {
        const res = await fetch('/api/field-audits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (res.ok) syncedCount++;
        else remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }
    setOfflineQueue(remaining);
    setSyncing(false);
    setNotice({
      ok: syncedCount > 0,
      text:
        syncedCount > 0
          ? `Synced ${syncedCount} offline field inspection report(s) to UGT India Admin.`
          : 'Still offline — pending inspections remain safely stored on this device.',
    });
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);

    const payload = { ...form, capturedAt: new Date().toISOString() };
    if (!navigator.onLine) {
      setOfflineQueue((q) => [payload, ...q]);
      setNotice({
        ok: true,
        text: 'Saved to Offline Device Queue! Tap "Sync Pending Audits" once back on 4G/Wi-Fi.',
      });
      setForm((p) => ({ ...p, subject_name: '', district: '', photo_url: '', notes: '' }));
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/field-audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Server unreachable');
      setNotice({
        ok: true,
        text: 'Field Inspection Report submitted live to UGT India Admin for verification & India Map publishing.',
      });
      setForm((p) => ({ ...p, subject_name: '', district: '', photo_url: '', notes: '' }));
    } catch {
      setOfflineQueue((q) => [payload, ...q]);
      setNotice({
        ok: true,
        text: 'Network unavailable — report safely queued offline on this device for later sync.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 py-6 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onNavigateStore}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 inline-flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#166534]" />
            <span>Back to Store</span>
          </button>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center space-x-1.5 border ${
              isOnline
                ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online · Live Sync' : 'Offline PWA Mode'}</span>
          </span>
        </div>

        {/* Offline Queue Sync Bar */}
        {offlineQueue.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-amber-900">
                {offlineQueue.length} Offline Audit Report(s) Ready to Sync
              </div>
              <p className="text-amber-800">Stored safely on your phone until internet returns.</p>
            </div>
            <button
              type="button"
              disabled={syncing}
              onClick={syncOfflineQueue}
              className="px-3.5 py-2 rounded-lg bg-[#166534] text-white font-semibold inline-flex items-center space-x-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 bg-[#FAF9F6] border-b border-gray-200 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-gray-900">
                UGT India Field Auditor Mode (PWA)
              </h1>
              <p className="text-xs text-gray-500">
                Geo-tagged factory purity inspections &amp; mission ground verification — works offline
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitAudit} className="p-5 space-y-4 text-xs">
            {notice && (
              <div
                className={`p-3 rounded-lg border flex items-start space-x-2 ${
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Field Auditor Name *</label>
                <input
                  type="text"
                  required
                  value={form.auditor_name}
                  onChange={(e) => setForm({ ...form, auditor_name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Auditor Phone</label>
                <input
                  type="tel"
                  value={form.auditor_phone}
                  onChange={(e) => setForm({ ...form, auditor_phone: e.target.value })}
                  placeholder="+91 98XXXXXXXX"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Inspection Type *</label>
                <select
                  value={form.audit_type}
                  onChange={(e) => setForm({ ...form, audit_type: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Manufacturer Factory Inspection">Manufacturer Factory Inspection</option>
                  <option value="Zero-Chemical Batch Check">Zero-Chemical Batch Check</option>
                  <option value="Women SHG / FPO Verification">Women SHG / FPO Verification</option>
                  <option value="Living India Mission Ground Check">Living India Mission Ground Check</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Manufacturer / Site Name *</label>
                <input
                  type="text"
                  required
                  value={form.subject_name}
                  onChange={(e) => setForm({ ...form, subject_name: e.target.value })}
                  placeholder="e.g. Cauvery SHG Oil Unit"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">State *</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">District / Village</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder="District or village name"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* GPS Coordinates Capture */}
            <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-200 flex items-center justify-between gap-2">
              <div className="text-xs text-gray-700">
                <div className="font-semibold">GPS Geo-Tag</div>
                <div className="font-mono text-[11px] text-gray-500">
                  {form.latitude && form.longitude
                    ? `${form.latitude}, ${form.longitude}`
                    : 'Not captured yet (optional)'}
                </div>
              </div>
              <button
                type="button"
                onClick={captureGps}
                disabled={locating}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#166534] text-[#166534] font-semibold inline-flex items-center space-x-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{locating ? 'Locating...' : 'Capture GPS'}</span>
              </button>
            </div>

            {/* 4-Point Ground Purity & Ethics Checklist */}
            <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
              <div className="font-bold text-[#166534]">Ground Verification Checklist</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'zero_chemical_pass' as const, label: 'Zero Synthetic Chemicals Verified' },
                  { key: 'hygiene_pass' as const, label: 'Clean Hygiene & Packaging Standards' },
                  { key: 'fair_wage_pass' as const, label: 'Fair Wages & Safe Working Conditions' },
                  { key: 'impact_verified' as const, label: 'Living India Ground Impact Verified' },
                ].map((ck) => (
                  <label key={ck.key} className="flex items-center space-x-2 text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[ck.key]}
                      onChange={(e) => setForm({ ...form, [ck.key]: e.target.checked })}
                      className="accent-[#166534]"
                    />
                    <span>{ck.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Camera / Photo Capture */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Site / Batch Inspection Photo</label>
              {form.photo_url ? (
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-[#FAF9F6] border border-gray-200">
                  <img src={form.photo_url} alt="Inspection" className="w-16 h-16 rounded-lg object-cover border" />
                  <span className="text-[#166534] font-semibold flex-1">Inspection photo captured ✓</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, photo_url: '' })}
                    className="text-rose-600 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center space-x-2 p-3.5 rounded-lg border-2 border-dashed border-gray-300 bg-[#FAF9F6] cursor-pointer text-gray-700 font-semibold hover:border-[#166534]">
                  <Camera className="w-4 h-4 text-[#166534]" />
                  <span>Take Photo / Upload Inspection Evidence</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handlePhotoCapture(e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Field Auditor Findings &amp; Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Record observations on raw materials, batch purity, community impact..."
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold"
            >
              {submitting
                ? 'Saving Report...'
                : isOnline
                ? 'Submit Verified Field Inspection'
                : 'Save Inspection to Offline Queue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
