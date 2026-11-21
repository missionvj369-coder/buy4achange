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
      setSuccessMsg(`Unlocked ${data.items.length} eProduct(s) from order ${orderNumber.trim().toUpperCase()}.`);
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
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#02140D] border border-emerald-400/30 rounded-2xl overflow-hidden shadow-2xl my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-horizon-bar" />

        {/* Header */}
        <div className="px-6 py-4 bg-[#031D13] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
                DIGITAL VAULT
              </div>
              <h2 className="text-base font-extrabold uppercase font-display text-white">
                My Digital Library
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close library"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {libraryItems.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-emerald-300 flex items-center space-x-1.5">
                <Unlock className="w-3.5 h-3.5" />
                <span>Your Unlocked eProducts ({libraryItems.length})</span>
              </h3>

              <div className="space-y-2.5">
                {libraryItems.map((item) => (
                  <div
                    key={`${item.order_number}-${item.product_id}`}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-white/15 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-emerald-400/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white text-xs truncate">
                            {item.product_name}
                          </span>
                          {item.subcategory && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/35 shrink-0">
                              {item.subcategory}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/50 font-mono mt-0.5">
                          Order {item.order_number}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadHtml(item)}
                        className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-mono uppercase font-semibold flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onLaunchItem(item)}
                        className="px-4 py-1.5 rounded-full bg-emerald-400 hover:bg-white text-black font-mono uppercase text-[11px] font-extrabold transition-colors"
                      >
                        Open Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2">
              <Lock className="w-6 h-6 mx-auto text-emerald-400" />
              <div className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                No Unlocked eProducts Yet
              </div>
              <p className="text-xs text-white/55 max-w-md mx-auto">
                Purchase any eBook or eProduct to unlock its content once payment is verified, or restore an existing paid order below.
              </p>
            </div>
          )}

          {/* Unlock by Order Number & Email */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-300">
                Restore / Unlock Purchased eProducts
              </h4>
              <p className="text-xs text-white/55 mt-0.5">
                Enter your Order Number (e.g. <span className="font-mono text-white">B4C-2026-...</span>) and checkout email.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs flex items-center space-x-2">
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
                className="bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2.5 text-xs font-mono text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="Purchase Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={unlocking}
                className="px-4 py-2.5 rounded-full bg-emerald-400 hover:bg-white text-black font-mono uppercase tracking-wider font-extrabold text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
              >
                {unlocking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{unlocking ? 'Verifying...' : 'Unlock Access'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
