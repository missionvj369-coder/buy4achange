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
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#02140D] border border-emerald-400/35 rounded-2xl shadow-2xl overflow-hidden my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-horizon-bar" />
        <div className="px-5 py-4 bg-[#031D13] border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300">
                PARTNER PROTOCOL
              </div>
              <h3 className="text-sm font-display font-extrabold uppercase text-white">
                Share &amp; Earn {commissionPct}%
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
            aria-label="Close share"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {product && (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center space-x-3">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-white/15 shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{product.name}</div>
                <div className="text-[11px] font-mono text-emerald-300 font-semibold">
                  ₹{product.price.toLocaleString('en-IN')} · Earn ~₹
                  {Math.round((product.price * commissionPct) / 100)} / referral
                </div>
              </div>
            </div>
          )}

          {memberUser ? (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Your Referral Code Attached:</span>
              </div>
              <span className="font-mono font-bold text-black bg-emerald-300 px-2.5 py-0.5 rounded-full">
                {memberUser.referral_code}
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-300/30 space-y-2.5">
              <div className="font-bold text-amber-200">
                Want to earn {commissionPct}% income from this share?
              </div>
              <p className="text-[11px] text-white/65 leading-relaxed">
                Create a free Buy4AChange member account so your unique referral code attaches automatically to every link you share.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAccount();
                }}
                className="px-4 py-2 rounded-full bg-emerald-400 hover:bg-white text-black font-mono uppercase tracking-wider font-extrabold text-[10px] inline-flex items-center space-x-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Free Account &amp; Earn</span>
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2.5 font-mono text-[11px] text-emerald-200"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-emerald-400 text-black font-mono uppercase text-[10px] font-bold inline-flex items-center space-x-1 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/?text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-400 border border-emerald-400/35 text-emerald-200 hover:text-black font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTextOnly}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-sky-400/15 hover:bg-sky-400 border border-sky-300/35 text-sky-200 hover:text-black font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedTextOnly}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white border border-white/15 text-white hover:text-black font-semibold text-center transition-colors"
            >
              X (Twitter)
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white border border-white/15 text-white hover:text-black font-semibold text-center transition-colors"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white border border-white/15 text-white hover:text-black font-semibold text-center transition-colors"
            >
              LinkedIn
            </a>
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-400 hover:bg-white text-black font-bold flex items-center justify-center space-x-1.5 transition-colors"
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
