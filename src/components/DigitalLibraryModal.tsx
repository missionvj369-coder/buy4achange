import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { UnlockedDigitalItem } from '../types.ts';

interface DigitalLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  libraryItems: UnlockedDigitalItem[];
  onAddUnlockedItems: (items: UnlockedDigitalItem[]) => void;
  onLaunchItem: (item: UnlockedDigitalItem) => void;
}

export const DigitalLibraryModal: React.FC<DigitalLibraryModalProps> = ({
  isOpen,
  onClose,
  libraryItems,
  onAddUnlockedItems,
  onLaunchItem,
}) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlockOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/digital/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not verify purchase.');
      }
      onAddUnlockedItems(data.items || []);
      setSuccessMsg(`Unlocked ${data.items.length} eProduct(s) from order ${orderNumber.trim().toUpperCase()}!`);
      setOrderNumber('');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Unlock failed. Please check your Order Number and Email.');
    } finally {
      setUnlocking(false);
    }
  };

  const handleDownloadHtml = (item: UnlockedDigitalItem) => {
    const blob = new Blob([item.digital_html_content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = item.product_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    a.download = `${safeName || 'buy4achange-eproduct'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d1424] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-[#111b30] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display text-white">
                My Digital Library
              </h2>
              <p className="text-[11px] text-slate-400">
                Purchased eBooks &amp; Interactive HTML eProducts — unlocked only after verified payment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Unlocked Items */}
          {libraryItems.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center space-x-1.5">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Your Unlocked eProducts ({libraryItems.length})</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {libraryItems.map((item) => (
                  <div
                    key={`${item.order_number}-${item.product_id}`}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs truncate">
                            {item.product_name}
                          </span>
                          {item.subcategory && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                              {item.subcategory}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Order {item.order_number}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadHtml(item)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onLaunchItem(item)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold flex items-center space-x-1.5 transition active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <Lock className="w-7 h-7 mx-auto text-slate-500" />
              <div className="text-xs font-bold text-white">No Unlocked eProducts in This Browser Yet</div>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Purchase any eBook or eProduct to unlock its interactive HTML content immediately, or restore an existing purchase below.
              </p>
            </div>
          )}

          {/* Unlock by Order Number & Email */}
          <div className="p-4 rounded-2xl bg-[#0a1020] border border-slate-800 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-white">Restore / Unlock Purchased eProducts</h4>
              <p className="text-[11px] text-slate-400">
                Enter your Order Number (e.g. <span className="font-mono text-cyan-300">B4C-2026-...</span>) and the email used at checkout.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleUnlockOrder} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                placeholder="Order Number (B4C-...)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="Purchase Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={unlocking}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                {unlocking ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
                <span>{unlocking ? 'Verifying...' : 'Unlock Access'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
