import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { MemberUser, Product } from '../types.ts';

interface ShareEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  memberUser?: MemberUser | null;
  commissionPct?: number;
  onOpenAccount: () => void;
}

export const ShareEarnModal: React.FC<ShareEarnModalProps> = ({
  isOpen,
  onClose,
  product,
  memberUser,
  commissionPct = 5,
  onOpenAccount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const params = new URLSearchParams();
  if (product?.id) params.set('verify', product.id);
  if (memberUser?.referral_code) params.set('ref', memberUser.referral_code);
  const queryStr = params.toString();
  const shareUrl = `${origin}/${queryStr ? '?' + queryStr : ''}`;

  const shareText = product
    ? `Check out "${product.name}" (₹${product.price}) on Buy4AChange — every purchase funds a Living India national mission by Universal Guard Trust & UGT India!`
    : `Discover Buy4AChange — zero-chemical products & interactive eBooks where every purchase funds 8 Living India national missions by Universal Guard Trust & UGT India!`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${shareText}\n${shareUrl}`);
  const encodedTextOnly = encodeURIComponent(shareText);

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product ? `${product.name} — Buy4AChange` : 'Buy4AChange · Living India',
          text: shareText,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-horizon-bar" />
        <div className="px-5 py-4 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Share &amp; Earn {commissionPct}%</h3>
              <p className="text-[11px] text-gray-500">
                Spread the Living India mission &amp; earn on verified purchases
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
            aria-label="Close share"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {product && (
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-200 flex items-center space-x-3">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="font-bold text-gray-900 truncate">{product.name}</div>
                <div className="text-[11px] text-[#166534] font-semibold">
                  ₹{product.price.toLocaleString('en-IN')} · Earn ~₹
                  {Math.round((product.price * commissionPct) / 100)} per verified referral
                </div>
              </div>
            </div>
          )}

          {memberUser ? (
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-[#166534] font-semibold">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Your Referral Code Attached:</span>
              </div>
              <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-[#BBF7D0]">
                {memberUser.referral_code}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="font-semibold text-amber-900">
                Want to earn {commissionPct}% income from this share?
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Sign in or create a free Buy4AChange member account so your unique referral code is automatically attached to every link you share.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAccount();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#166534] text-white font-semibold text-xs inline-flex items-center space-x-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Free Account &amp; Get Referral Link</span>
              </button>
            </div>
          )}

          {/* Copyable Link Box */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-[#FAF9F6] border border-gray-300 rounded-lg px-3 py-2 font-mono text-[11px] text-gray-800"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold inline-flex items-center space-x-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* 1-Tap Social Share Grid */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/?text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#F0FDF4] hover:bg-green-100 border border-[#BBF7D0] text-[#166534] font-semibold flex items-center justify-center space-x-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTextOnly}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-semibold flex items-center justify-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedTextOnly}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold text-center"
            >
              X (Twitter)
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold text-center"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#FAF9F6] hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold text-center"
            >
              LinkedIn
            </a>
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold flex items-center justify-center space-x-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Instagram / More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
