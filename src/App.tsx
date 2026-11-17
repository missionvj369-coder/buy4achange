import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
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
import { Package, RefreshCw } from 'lucide-react';

export function App() {
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
    window.scrollTo(0, 0);
  };

  // Live data
  const [causes, setCauses] = useState<Cause[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCauseId, setSelectedCauseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Bag
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('buy4achange_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalInitialCauseId, setModalInitialCauseId] = useState<string | undefined>(undefined);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [orderDraft, setOrderDraft] = useState<any | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Digital Library (strictly populated ONLY after verified paid orders)
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
      localStorage.setItem('buy4achange_cart_v2', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('buy4achange_digital_library_v1', JSON.stringify(unlockedLibrary));
    } catch {}
  }, [unlockedLibrary]);

  const mergeUnlockedItems = (incoming: UnlockedDigitalItem[]) => {
    if (!incoming || incoming.length === 0) return;
    setUnlockedLibrary((prev) => {
      const map = new Map<string, UnlockedDigitalItem>();
      for (const item of prev) map.set(`${item.order_number}:${item.product_id}`, item);
      for (const item of incoming) map.set(`${item.order_number}:${item.product_id}`, item);
      return Array.from(map.values());
    });
  };

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
      console.error('Failed to load catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPath]);

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
        { product, quantity, selectedCauseId: selectedCause, selectedCauseTitle: causeObj?.title },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
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

  const handlePaymentSuccess = async (paymentResult: any) => {
    setIsPaymentOpen(false);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderDraft,
          paymentId: paymentResult.transactionId,
          paymentMethod: paymentResult.paymentMethod || 'Direct UPI',
          paymentStatus: paymentResult.status || 'pending_verification',
        }),
      });
      const orderData = await res.json();
      if (!res.ok) {
        alert(orderData.error || 'Could not create order. Please verify payment first.');
        return;
      }
      if (
        orderData.payment_status === 'paid' &&
        Array.isArray(orderData?.digital_items) &&
        orderData.digital_items.length > 0
      ) {
        mergeUnlockedItems(orderData.digital_items);
      }
      setCompletedOrder(orderData);
      setCartItems([]);
      fetchData();
    } catch (e) {
      console.error('Error creating order:', e);
    }
  };

  const physicalProducts = products.filter((p) => p.product_type !== 'digital');
  const digitalProducts = products.filter((p) => {
    if (p.product_type !== 'digital') return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.subcategory || '').toLowerCase().includes(q)
    );
  });

  const filteredProducts = physicalProducts.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeMission = selectedCauseId ? causes.find((c) => c.id === selectedCauseId) : null;
  const dynamicCategories = Array.from(
    new Set(physicalProducts.map((p) => p.category).filter((c): c is string => Boolean(c && c.trim())))
  );
  const categories = ['All', ...dynamicCategories];
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ADMIN ROUTE (/admin)
  const isAdminRoute =
    /^\/admin(\/.*)?$/i.test(currentPath) || /^#\/?admin(\/.*)?$/i.test(currentHash);

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

  // PUBLIC STOREFRONT — Fast, Clean, Universal Compatibility (No Blocking Intro!)
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#14171A] flex flex-col font-sans w-full">
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
          window.scrollTo(0, 0);
        }}
      />

      <main className="flex-1 w-full">
        {/* 1. Calm, Dignified Hero */}
        <HeroBanner
          causes={causes}
          selectedCauseId={selectedCauseId}
          onSelectCause={setSelectedCauseId}
          onScrollToCatalog={() => {
            document.getElementById('missions-showcase')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onScrollToShop={() => {
            document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenMissionDoc={(cId) => setReadingMissionCauseId(cId)}
        />

        {/* 2. Shop Catalog First for Instant Visitor Clarity */}
        <section id="catalog-grid" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-gray-200">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
                Shop &amp; Fund
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14171A]">
                Conscious Catalog
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {activeMission
                  ? `Supporting "${activeMission.title}" — you can change the mission on any item.`
                  : 'Select your preferred Living India mission on any product before adding to bag.'}
              </p>
            </div>

            {categories.length > 1 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${
                      selectedCategory === cat
                        ? 'bg-[#166534] text-white border-[#166534]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center flex flex-col items-center space-y-2 text-gray-500">
              <RefreshCw className="w-6 h-6 text-[#166534] animate-spin" />
              <span className="text-xs">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-14 mt-6 rounded-xl bg-white border border-gray-200 text-center space-y-2">
              <Package className="w-8 h-8 mx-auto text-gray-400" />
              <h3 className="text-sm font-bold text-[#14171A]">
                {physicalProducts.length === 0
                  ? 'New Products Launching Soon'
                  : 'No matching products found'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {physicalProducts.length === 0
                  ? 'Products published from the Admin Portal appear here immediately.'
                  : 'Try clearing your search or category filter.'}
              </p>
              {physicalProducts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchTerm('');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#166534] text-white text-xs font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-6">
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
        </section>

        {/* 3. Dedicated E-Products & eBooks Section */}
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

        {/* 4. The 8 Living India National Missions + Official Dossier Reader */}
        <MissionsCinematic
          causes={causes}
          selectedCauseId={selectedCauseId}
          onSelectCause={setSelectedCauseId}
          onScrollToCatalog={() => {
            document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenDocument={(causeId) => setReadingMissionCauseId(causeId)}
        />
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        causes={causes}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateItemCause={handleUpdateItemCause}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

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

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        causes={causes}
        onStartPayment={(draft) => {
          setOrderDraft(draft);
          setIsCheckoutOpen(false);
          setIsPaymentOpen(true);
        }}
      />

      <PaymentGatewayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        orderDraft={orderDraft}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onLaunchDigital={(item) => {
          setCompletedOrder(null);
          setActiveDigitalReader(item);
        }}
      />

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

      <DigitalReaderModal
        item={activeDigitalReader}
        onClose={() => setActiveDigitalReader(null)}
      />

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
          }, 120);
        }}
      />

      <Footer onOpenMissionDoc={(cId) => setReadingMissionCauseId(cId)} />
    </div>
  );
}
export default App;
