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
import { AdminPortal } from './components/AdminPortal.tsx';
import { Footer } from './components/Footer.tsx';
import { Cause, Product, CartItem, Order } from './types.ts';
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

  // Persist cart
  useEffect(() => {
    localStorage.setItem('buy4achange_cart_v2', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch causes and products
  const fetchData = async () => {
    setLoading(true);
    try {
      const [causesRes, productsRes] = await Promise.all([
        fetch('/api/causes'),
        fetch('/api/products'),
      ]);
      const causesData = await causesRes.json();
      const productsData = await productsRes.json();
      setCauses(causesData);
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      setCompletedOrder(orderData);
      setCartItems([]);
      fetchData();
    } catch (e) {
      console.error('Error creating order:', e);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesCause =
      selectedCauseId === null || p.cause_id === selectedCauseId;
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesCause && matchesSearch;
  });

  const categories = [
    'All',
    'Living Culture',
    'Everyday Essentials',
    'Women Entrepreneurship',
    'AI Free Training',
    'Water Security',
    'Protect the Earth',
    'Hill and City',
    'Sports Ecosystem',
  ];

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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Cinematic Opening Reveal */}
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      {/* Navigation (Customer Only, No Admin Button) */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNavigateHome={() => {
          setSelectedCauseId(null);
          setSelectedCategory('All');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <div>
          
          {/* Cinematic Hero */}
          <HeroBanner
            causes={causes}
            selectedCauseId={selectedCauseId}
            onSelectCause={setSelectedCauseId}
            onScrollToCatalog={() => {
              const el = document.getElementById('missions-showcase') || document.getElementById('catalog-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* The 8 UGT India National Missions — Cinematic Visual Experience */}
          <MissionsCinematic
            causes={causes}
            selectedCauseId={selectedCauseId}
            onSelectCause={setSelectedCauseId}
            onScrollToCatalog={() => {
              const el = document.getElementById('catalog-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Catalog Grid Section */}
          <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
            
            {/* Category Filter Pills & Catalog Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-5 border-b border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white tracking-tight flex items-center space-x-2">
                  <span>Conscious Catalog</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {filteredProducts.length} Items
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your preferred UGT India mission on any product before adding to cart.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
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
                <h3 className="text-sm font-bold text-white">No products found</h3>
                <p className="text-xs text-slate-400">
                  Try clearing your search or category filters.
                </p>
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
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    causes={causes}
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
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
export default App;
