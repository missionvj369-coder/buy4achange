import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface HeroBannerProps {
  causes: any[];
  selectedCauseId: string | null;
  onSelectCause: (id: string | null) => void;
  onScrollToCatalog: () => void;
  onScrollToShop?: () => void;
  onOpenMissionDoc?: (causeId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToCatalog,
  onScrollToShop,
}) => {
  return (
    <section className="bg-white border-b border-gray-200 w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center space-y-5">
        <p className="text-xs sm:text-sm font-medium text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] inline-block px-3.5 py-1.5 rounded-full">
          An initiative of Universal Guard Trust &amp; UGT India — turning everyday purchases into verified community impact.
        </p>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#14171A] leading-tight tracking-tight">
          Every Purchase Funds a Living India Mission.
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Shop thoughtfully curated products and interactive digital eBooks. On every order, choose which of the eight national missions your purchase supports.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onScrollToShop || onScrollToCatalog}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-sm font-semibold flex items-center justify-center space-x-2"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onScrollToCatalog}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#FAF9F6] hover:bg-gray-100 border border-gray-300 text-[#14171A] text-sm font-semibold flex items-center justify-center space-x-2"
          >
            <BookOpen className="w-4 h-4 text-[#166534]" />
            <span>Read 8 Mission Dossiers</span>
          </button>
        </div>
      </div>
    </section>
  );
};
