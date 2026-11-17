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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl my-6">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-gray-900">
                My Digital Library
              </h2>
              <p className="text-xs text-gray-500">
                Purchased eBooks &amp; HTML eProducts — unlocked after verified payment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close library"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Unlocked Items */}
          {libraryItems.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#166534] flex items-center space-x-1.5">
                <Unlock className="w-3.5 h-3.5" />
                <span>Your Unlocked eProducts ({libraryItems.length})</span>
              </h3>

              <div className="space-y-2.5">
                {libraryItems.map((item) => (
                  <div
                    key={`${item.order_number}-${item.product_id}`}
                    className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534] shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 text-xs truncate">
                            {item.product_name}
                          </span>
                          {item.subcategory && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] shrink-0">
                              {item.subcategory}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Order {item.order_number}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadHtml(item)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onLaunchItem(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold"
                      >
                        Open Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-[#FAF9F6] border border-gray-200 text-center space-y-2">
              <Lock className="w-6 h-6 mx-auto text-gray-400" />
              <div className="text-sm font-semibold text-gray-900">No Unlocked eProducts Yet</div>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Purchase any eBook or eProduct to unlock its content once payment is verified, or restore an existing paid order below.
              </p>
            </div>
          )}

          {/* Unlock by Order Number & Email */}
          <div className="p-4 rounded-lg bg-[#FAF9F6] border border-gray-200 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-900">Restore / Unlock Purchased eProducts</h4>
              <p className="text-xs text-gray-600">
                Enter your Order Number (e.g. <span className="font-mono text-gray-900">B4C-2026-...</span>) and the email used at checkout.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
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
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 placeholder-gray-400 focus:border-[#166534] focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="Purchase Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#166534] focus:outline-none"
              />
              <button
                type="submit"
                disabled={unlocking}
                className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs flex items-center justify-center space-x-1.5"
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
