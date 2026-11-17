import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { CinematicIntro } from './components/CinematicIntro.tsx';
import { MissionsCinematic } from './components/MissionsCinematic.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { PaymentGatewayModal } from './components/PaymentGatewayModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { EProductsSection } from './components/EProductsSection.tsx';
import { DigitalLibraryModal } from './components/DigitalLibraryModal.tsx';
import { DigitalReaderModal } from './components/DigitalReaderModal.tsx';
import { MissionDocumentModal } from './components/MissionDocumentModal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { Footer } from './components/Footer.tsx';
import { Cause, Product, CartItem, Order, UnlockedDigitalItem } from './types.ts';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';

export function App() {
  // Simple SPA routing: check if on /admin (supports /admin, /admin/, /admin/*, or #/admin)
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setCurrentHash('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Data state
  const [causes, setCauses] = useState<Cause[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const handleIntroComplete = useCallback(() => setShowIntro(false), []);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCauseId, setSelectedCauseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('buy4achange_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalInitialCauseId, setModalInitialCauseId] = useState<string | undefined>(undefined);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [orderDraft, setOrderDraft] = useState<any | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Digital Library (Unlocked eBooks & eProducts — ONLY populated after verified paid orders!)
  const [unlockedLibrary, setUnlockedLibrary] = useState<UnlockedDigitalItem[]>(() => {
    try {
      const saved = localStorage.getItem('buy4achange_digital_library_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeDigitalReader, setActiveDigitalReader] = useState<UnlockedDigitalItem | null>(null);
  const [readingMissionCauseId, setReadingMissionCauseId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('buy4achange_digital_library_v1', JSON.stringify(unlockedLibrary));
    } catch {
      // Ignore storage quota issues for very large HTML items
    }
  }, [unlockedLibrary]);

  const mergeUnlockedItems = (incoming: UnlockedDigitalItem[]) => {
    if (!incoming || incoming.length === 0) return;
    setUnlockedLibrary((prev) => {
      const map = new Map<string, UnlockedDigitalItem>();
      for (const item of prev) {
        map.set(`${item.order_number}:${item.product_id}`, item);
      }
      for (const item of incoming) {
        map.set(`${item.order_number}:${item.product_id}`, item);
      }
      return Array.from(map.values());
    });
  };

  // Persist cart
  useEffect(() => {
    localStorage.setItem('buy4achange_cart_v2', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch causes and products (always live, never cached)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [causesRes, productsRes] = await Promise.all([
        fetch('/api/causes', { cache: 'no-store' }),
        fetch('/api/products', { cache: 'no-store' }),
      ]);
      const causesData = await causesRes.json();
      const productsData = await productsRes.json();
      if (Array.isArray(causesData)) setCauses(causesData);
      if (Array.isArray(productsData)) setProducts(productsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPath]);

  // Cart actions with selected cause
  const handleAddToCart = (product: Product, selectedCause: string, quantity: number = 1) => {
    const causeObj = causes.find((c) => c.id === selectedCause);
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedCauseId === selectedCause
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedCauseId === selectedCause
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedCauseId: selectedCause,
          selectedCauseTitle: causeObj?.title,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleUpdateItemCause = (productId: string, causeId: string) => {
    const causeObj = causes.find((c) => c.id === causeId);
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, selectedCauseId: causeId, selectedCauseTitle: causeObj?.title }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Checkout flow
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleStartPayment = (draft: any) => {
    setOrderDraft(draft);
    setIsCheckoutOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (paymentResult: any) => {
    setIsPaymentOpen(false);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderDraft,
          paymentId: paymentResult.transactionId,
          paymentMethod: paymentResult.paymentMethod || 'Card Payment',
          paymentStatus: 'paid',
        }),
      });

      const orderData = await res.json();
      if (Array.isArray(orderData?.digital_items) && orderData.digital_items.length > 0) {
        mergeUnlockedItems(orderData.digital_items);
      }
      setCompletedOrder(orderData);
      setCartItems([]);
      fetchData();
    } catch (e) {
      console.error('Error creating order:', e);
    }
  };

  // Split Physical Catalog vs E-Products & eBooks
  const physicalProducts = products.filter((p) => p.product_type !== 'digital');
  const digitalProducts = products.filter((p) => {
    if (p.product_type !== 'digital') return false;
    if (searchTerm.trim() === '') return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.subcategory || '').toLowerCase().includes(q)
    );
  });

  // Filter physical products
  const filteredProducts = physicalProducts.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeMission = selectedCauseId ? causes.find((c) => c.id === selectedCauseId) : null;

  const dynamicCategories = Array.from(
    new Set(physicalProducts.map((p) => p.category).filter((c): c is string => Boolean(c && c.trim())))
  );
  const categories = ['All', ...dynamicCategories];

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ROUTE: ADMIN PORTAL (/admin, /admin/, /admin/*, or #/admin)
  const isAdminRoute =
    /^\/admin(\/.*)?$/i.test(currentPath) ||
    /^#\/?admin(\/.*)?$/i.test(currentHash);

  if (isAdminRoute) {
    return (
      <AdminPortal
        causes={causes}
        products={products}
        onRefreshData={fetchData}
        onNavigateStore={() => navigateTo('/')}
      />
    );
  }

  // ROUTE: CUSTOMER STOREFRONT (/)
  return (
    <div className="min-h-screen bg-[#060416] text-white flex flex-col font-sans selection:bg-[#ff2e97]/40 selection:text-white">
      
      {/* Cinematic Opening Reveal */}
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      {/* Navigation (Customer Only, No Admin Button) */}
      <Navbar
        cartCount={totalCartCount}
        libraryCount={unlockedLibrary.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onScrollToMissions={() => {
          document.getElementById('missions-showcase')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onScrollToCatalog={() => {
          document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onScrollToEProducts={() => {
          document.getElementById('eproducts-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNavigateHome={() => {
          setSelectedCauseId(null);
          setSelectedCategory('All');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <div>
          
          {/* Editorial Luxury Hero */}
          <HeroBanner
            causes={causes}
            selectedCauseId={selectedCauseId}
            onSelectCause={setSelectedCauseId}
            onScrollToCatalog={() => {
              const el = document.getElementById('missions-showcase') || document.getElementById('catalog-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onScrollToShop={() => {
              document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenMissionDoc={(causeId) => setReadingMissionCauseId(causeId)}
          />

          {/* The 8 Official Living India Missions — Futuristic 3D Visuals + Full Document Reader */}
          <MissionsCinematic
            causes={causes}
            selectedCauseId={selectedCauseId}
            onSelectCause={setSelectedCauseId}
            onScrollToCatalog={() => {
              const el = document.getElementById('catalog-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenDocument={(causeId) => setReadingMissionCauseId(causeId)}
          />

          {/* Catalog Grid Section */}
          <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            
            {/* Category Filter Pills & Catalog Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6 border-b border-white/15">
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#00f0ff] font-bold">
                  Curated Collection · Direct Mission Funding
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-3">
                  <span>Conscious <span className="prism-gradient-text">Catalog</span></span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 font-bold">
                    {filteredProducts.length} Items
                  </span>
                </h2>
                <p className="text-sm text-slate-300">
                  {activeMission
                    ? `Pre-selected to fund "${activeMission.title}" — you can change the mission on any product.`
                    : 'Select your preferred Living India mission on any product before adding to bag.'}
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'prism-button text-white'
                        : 'bg-white/[0.05] text-slate-200 hover:bg-white/[0.12] border border-white/15'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Listing Grid */}
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                <p className="text-xs text-slate-400">Loading catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center space-y-3">
                <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-600" />
                <h3 className="text-sm font-bold text-white">
                  {products.length === 0 ? 'Conscious Products Launching Soon' : 'No matching products found'}
                </h3>
                <p className="text-xs text-slate-400">
                  {products.length === 0
                    ? 'Products added in the Operations Console will appear here immediately.'
                    : 'Try clearing your search or category filters.'}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedCauseId(null);
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    causes={causes}
                    preferredCauseId={selectedCauseId}
                    onAddToCart={(p, cId) => handleAddToCart(p, cId, 1)}
                    onOpenDetails={(p, cId) => {
                      setSelectedProduct(p);
                      setModalInitialCauseId(cId);
                    }}
                  />
                ))}
              </div>
            )}

          </div>

          {/* Dedicated E-Products & eBooks Section (with Subcategories & Post-Purchase HTML Unlock) */}
          <EProductsSection
            eproducts={digitalProducts}
            causes={causes}
            preferredCauseId={selectedCauseId}
            unlockedLibrary={unlockedLibrary}
            onAddToCart={(p, cId) => handleAddToCart(p, cId, 1)}
            onOpenDetails={(p, cId) => {
              setSelectedProduct(p);
              setModalInitialCauseId(cId);
            }}
            onLaunchUnlocked={(item) => setActiveDigitalReader(item)}
            onOpenLibrary={() => setIsLibraryOpen(true)}
          />

        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        causes={causes}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateItemCause={handleUpdateItemCause}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        initialCauseId={modalInitialCauseId}
        onClose={() => {
          setSelectedProduct(null);
          setModalInitialCauseId(undefined);
        }}
        onAddToCart={(p, qty, cId) => handleAddToCart(p, cId, qty)}
        causes={causes}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        causes={causes}
        onStartPayment={handleStartPayment}
      />

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        orderDraft={orderDraft}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Order Success & Impact Certificate */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onLaunchDigital={(item) => {
          setCompletedOrder(null);
          setActiveDigitalReader(item);
        }}
      />

      {/* Digital Library Vault (My Purchased eBooks & eProducts) */}
      <DigitalLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        libraryItems={unlockedLibrary}
        onAddUnlockedItems={mergeUnlockedItems}
        onLaunchItem={(item) => {
          setIsLibraryOpen(false);
          setActiveDigitalReader(item);
        }}
      />

      {/* Fullscreen Interactive HTML Viewer for Purchased eBooks & eProducts */}
      <DigitalReaderModal
        item={activeDigitalReader}
        onClose={() => setActiveDigitalReader(null)}
      />

      {/* Official Living India Mission Document Reader (All 8 Projects) */}
      <MissionDocumentModal
        causeId={readingMissionCauseId}
        causes={causes}
        onClose={() => setReadingMissionCauseId(null)}
        onSelectMission={(cId) => setReadingMissionCauseId(cId)}
        onFundMission={(cId) => {
          setSelectedCauseId(cId);
          setReadingMissionCauseId(null);
          setTimeout(() => {
            document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />

      {/* Footer */}
      <Footer onOpenMissionDoc={(cId) => setReadingMissionCauseId(cId)} />

    </div>
  );
}
export default App;
