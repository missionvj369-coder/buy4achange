import React, { useState } from 'react';
import { X, Download, Maximize2, Minimize2, BookOpen, ShieldCheck } from 'lucide-react';
import { UnlockedDigitalItem } from '../types.ts';

interface DigitalReaderModalProps {
  item: UnlockedDigitalItem | null;
  onClose: () => void;
  isPreview?: boolean;
}

export const DigitalReaderModal: React.FC<DigitalReaderModalProps> = ({
  item,
  onClose,
  isPreview = false,
}) => {
  const [fullscreen, setFullscreen] = useState(false);

  if (!item) return null;

  const handleDownloadHtml = () => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4">
      <div
        className={`relative bg-[#0a0f1d] border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden transition-all ${
          fullscreen
            ? 'w-screen h-screen rounded-none'
            : 'w-full max-w-6xl h-[90vh] rounded-2xl'
        }`}
      >
        {/* Top Interactive Reader Toolbar */}
        <div className="px-4 sm:px-6 py-3 bg-[#0f1728] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white truncate">{item.product_name}</h3>
                {item.subcategory && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                    {item.subcategory}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {isPreview
                    ? 'Admin Live Preview Mode (Locked on Storefront Until Purchase)'
                    : `Verified Purchase · Order ${item.order_number}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!isPreview && (
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition"
                title="Download offline HTML copy"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download HTML</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setFullscreen((f) => !f)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/70 text-slate-300 hover:text-white transition"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sandboxed Interactive HTML Viewport */}
        <div className="flex-1 bg-white relative">
          <iframe
            title={item.product_name}
            srcDoc={item.digital_html_content}
            sandbox="allow-scripts allow-forms allow-popups allow-modals"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
