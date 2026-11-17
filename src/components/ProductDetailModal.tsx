import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Heart,
  Check,
  Truck,
  ShieldCheck,
  FileCheck2,
  Leaf,
  QrCode,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Product, Cause, ProductReview } from '../types.ts';
import { CertificateViewerModal, OriginQrModal } from './CertificateViewerModal.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, causeId: string) => void;
  causes: Cause[];
  initialCauseId?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  causes,
  initialCauseId,
}) => {
  const [selectedCauseId, setSelectedCauseId] = useState<string>(
    initialCauseId || product?.cause_id || causes[0]?.id || 'cause-everyday-essentials'
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Certificate & QR viewers
  const [viewingCert, setViewingCert] = useState<{
    title: string;
    subtitle?: string;
    fileName?: string;
    dataUrl: string;
  } | null>(null);
  const [showQr, setShowQr] = useState(false);

  // Verified-Buyer-Only Reviews
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revOrder, setRevOrder] = useState('');
  const [revEmail, setRevEmail] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revNotice, setRevNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (initialCauseId) {
      setSelectedCauseId(initialCauseId);
    } else if (product?.cause_id) {
      setSelectedCauseId(product.cause_id);
    }
    setShowReviewForm(false);
    setRevNotice(null);
    if (product?.id) {
      fetch(`/api/products/${encodeURIComponent(product.id)}/reviews`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : []))
        .then((list) => setReviews(Array.isArray(list) ? list : []))
        .catch(() => setReviews([]));
    }
  }, [initialCauseId, product]);

  if (!product) return null;

  const connectedCause = causes.find((c) => c.id === selectedCauseId) || causes[0];
  const donationAmount = Math.round((product.price * (product.cause_allocation_pct || 15)) / 100) * quantity;
  const hasDualCerts = Boolean(product.quality_cert_url && product.zero_chemical_cert_url);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedCauseId);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevSubmitting(true);
    setRevNotice(null);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: revOrder,
          email: revEmail,
          rating: revRating,
          comment: revComment,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not verify order for review.');
      }
      setReviews(data.reviews || []);
      setRevNotice({ ok: true, text: 'Verified buyer review published!' });
      setRevOrder('');
      setRevEmail('');
      setRevComment('');
      setShowReviewForm(false);
    } catch (err: any) {
      setRevNotice({ ok: false, text: err.message || 'Review failed' });
    } finally {
      setRevSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl flex flex-col md:flex-row max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Image & Contribution Summary */}
          <div className="md:w-1/2 bg-[#FAF9F6] border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between">
            <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-60 md:h-full object-cover"
              />
            </div>

            <div className="p-4 bg-[#F0FDF4] border-t border-[#BBF7D0]">
              <div className="flex items-center space-x-2 text-[#166534] font-semibold text-xs mb-1">
                <Heart className="w-4 h-4 text-[#166534]" />
                <span>Selected Mission Contribution</span>
              </div>
              <p className="text-xs text-gray-700">
                {product.cause_allocation_pct}% of this purchase funds:{' '}
                <strong className="text-gray-900">{connectedCause?.title}</strong>
              </p>
              <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-[#BBF7D0]">
                <span className="text-gray-600">Dedicated Contribution:</span>
                <span className="font-bold text-[#166534] text-sm">₹{donationAmount}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Certificates, Verified Reviews & Action */}
          <div className="md:w-1/2 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Category & Availability */}
              <div className="flex items-center justify-between pr-8">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                  {product.product_type === 'digital'
                    ? product.subcategory || 'E-Product'
                    : product.category}
                </span>
                {reviews.length > 0 ? (
                  <div className="flex items-center space-x-1 text-amber-600 font-semibold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>
                      {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span className="text-gray-500 font-normal">({reviews.length} verified)</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-[#166534]">
                    {product.product_type === 'digital'
                      ? 'Digital Access'
                      : product.stock > 0
                      ? `${product.stock} in stock`
                      : 'Out of stock'}
                  </span>
                )}
              </div>

              {/* Product Name & Manufacturer */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900 leading-snug">
                  {product.name}
                </h2>
                {product.seller_name && (
                  <div className="text-xs text-[#166534] font-semibold mt-1">
                    Verified Manufacturer: {product.seller_name}
                    {product.origin_state ? ` · ${product.origin_state}` : ''}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.compare_at_price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{product.description}</p>

              {/* QUALITY & ZERO-CHEMICAL CERTIFICATE VERIFICATION PANEL */}
              {(hasDualCerts || product.quality_cert_url || product.zero_chemical_cert_url) && (
                <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#166534]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Audited Quality &amp; Zero-Chemical Purity</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQr(true)}
                      className="text-[11px] font-semibold text-[#166534] hover:underline inline-flex items-center space-x-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Origin QR</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.quality_cert_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setViewingCert({
                            title: `Quality Certificate — ${product.name}`,
                            subtitle: product.seller_name ? `Manufacturer: ${product.seller_name}` : undefined,
                            fileName: product.quality_cert_name,
                            dataUrl: product.quality_cert_url!,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-green-50 border border-[#BBF7D0] text-[#166534] text-[11px] font-semibold inline-flex items-center space-x-1"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>View Quality Cert</span>
                      </button>
                    )}
                    {product.zero_chemical_cert_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setViewingCert({
                            title: `Zero-Chemical Certificate — ${product.name}`,
                            subtitle: product.seller_name ? `Manufacturer: ${product.seller_name}` : undefined,
                            fileName: product.zero_chemical_cert_name,
                            dataUrl: product.zero_chemical_cert_url!,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-green-50 border border-[#BBF7D0] text-[#166534] text-[11px] font-semibold inline-flex items-center space-x-1"
                      >
                        <Leaf className="w-3.5 h-3.5" />
                        <span>View Zero-Chemical Cert</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Buyer Choose Mission Dropdown */}
              <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-900">
                    Choose Mission to Support:
                  </label>
                  <span className="text-[11px] text-[#166534] font-medium">
                    UGT India National Mission
                  </span>
                </div>
                <select
                  value={selectedCauseId}
                  onChange={(e) => setSelectedCauseId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#166534] font-medium"
                >
                  {causes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                  <Truck className="w-4 h-4 text-[#166534] shrink-0" />
                  <span>
                    {product.product_type === 'digital'
                      ? 'Digital Delivery (₹0 Shipping)'
                      : 'Free Shipping over ₹1,000'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200">
                  <ShieldCheck className="w-4 h-4 text-[#166534] shrink-0" />
                  <span>
                    {product.product_type === 'digital'
                      ? 'Unlocks After Verified Payment'
                      : 'Audited Mission Allocation'}
                  </span>
                </div>
              </div>

              {/* Verified-Buyer-Only Reviews */}
              <div className="pt-2 border-t border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    Verified Buyer Reviews ({reviews.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm((v) => !v)}
                    className="text-xs font-semibold text-[#166534] hover:underline"
                  >
                    {showReviewForm ? 'Cancel' : 'Write Verified Review'}
                  </button>
                </div>

                {revNotice && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center space-x-1.5 border ${
                      revNotice.ok
                        ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {revNotice.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{revNotice.text}</span>
                  </div>
                )}

                {showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-200 space-y-2 text-xs"
                  >
                    <p className="text-[11px] text-gray-600">
                      Only verified buyers with a <strong>paid</strong> order for this product can review (zero fake ratings).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={revOrder}
                        onChange={(e) => setRevOrder(e.target.value)}
                        placeholder="Paid Order # (B4C-...)"
                        className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                      />
                      <input
                        type="email"
                        required
                        value={revEmail}
                        onChange={(e) => setRevEmail(e.target.value)}
                        placeholder="Checkout Email"
                        className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 font-medium">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRevRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= revRating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={revComment}
                      onChange={(e) => setRevComment(e.target.value)}
                      placeholder="Share your honest experience with this product..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={revSubmitting}
                      className="px-3.5 py-1.5 rounded-lg bg-[#166534] text-white font-semibold text-xs"
                    >
                      {revSubmitting ? 'Verifying Purchase...' : 'Submit Verified Review'}
                    </button>
                  </form>
                )}

                {reviews.length > 0 && (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {reviews.map((rv) => (
                      <div key={rv.id} className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">
                            {rv.reviewer_name}{' '}
                            <span className="text-[10px] text-[#166534] font-medium">✓ Verified Buyer</span>
                          </span>
                          <span className="text-amber-600 font-semibold">{rv.rating} ★</span>
                        </div>
                        {rv.comment && <p className="text-gray-600 mt-1">{rv.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-gray-200 flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 rounded-lg bg-white px-1 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-sm font-semibold flex items-center justify-center space-x-2"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <span>Add to Bag · ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CertificateViewerModal cert={viewingCert} onClose={() => setViewingCert(null)} />
      <OriginQrModal product={showQr ? product : null} onClose={() => setShowQr(false)} />
    </>
  );
};
