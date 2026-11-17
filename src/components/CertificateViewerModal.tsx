import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Download, QrCode, Printer } from 'lucide-react';
import QRCode from 'qrcode';

interface CertificateViewerModalProps {
  cert: {
    title: string;
    subtitle?: string;
    fileName?: string;
    dataUrl: string;
  } | null;
  onClose: () => void;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({
  cert,
  onClose,
}) => {
  if (!cert) return null;
  const isPdf = cert.dataUrl.startsWith('data:application/pdf') || cert.fileName?.toLowerCase().endsWith('.pdf');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = cert.dataUrl;
    a.download = cert.fileName || `${cert.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${isPdf ? 'pdf' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/60 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#166534] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">{cert.title}</h3>
              {cert.subtitle && (
                <p className="text-[11px] text-gray-500 truncate">{cert.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold inline-flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
              aria-label="Close certificate"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 overflow-auto p-4 flex items-center justify-center min-h-[340px]">
          {isPdf ? (
            <iframe
              src={cert.dataUrl}
              title={cert.title}
              className="w-full h-[68vh] bg-white border border-gray-200 rounded-lg"
            />
          ) : (
            <img
              src={cert.dataUrl}
              alt={cert.title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg border border-gray-200 bg-white shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface OriginQrModalProps {
  product: {
    id: string;
    name: string;
    seller_name?: string;
    origin_state?: string;
    cause_title?: string;
  } | null;
  onClose: () => void;
}

export const OriginQrModal: React.FC<OriginQrModalProps> = ({ product, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!product) return;
    const verifyUrl = `${window.location.origin}/?verify=${encodeURIComponent(product.id)}`;
    QRCode.toDataURL(verifyUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#14532D', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [product]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#166534]">
            <QrCode className="w-4 h-4" />
            <span>Origin &amp; Purity QR Label</span>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-200 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="inline-block p-3 bg-white border-2 border-[#166534] rounded-xl">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Product Origin QR Code" className="w-48 h-48 mx-auto" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400">
                Generating QR...
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-gray-900">{product.name}</div>
            <div className="text-xs text-[#166534] font-semibold">
              {product.seller_name || 'UGT Verified Maker'}
              {product.origin_state ? ` · ${product.origin_state}` : ''}
            </div>
            <div className="text-[11px] text-gray-500">
              Quality &amp; Zero-Chemical Certified · Buy4AChange
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold inline-flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pack QR</span>
            </button>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`QR-${product.id}.png`}
                className="flex-1 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold inline-flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
