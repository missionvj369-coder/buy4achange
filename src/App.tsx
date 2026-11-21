import React, { useState, useEffect, useMemo } from 'react';
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
import { OrderTrackLedgerModal } from './components/OrderTrackLedgerModal.tsx';
import { SellerPortal } from './components/SellerPortal.tsx';
import { IndiaImpactMapModal } from './components/IndiaImpactMapModal.tsx';
import { NationalProgramsModal } from './components/NationalProgramsModal.tsx';
import { FieldAuditorPortal } from './components/FieldAuditorPortal.tsx';
import { MemberPortal } from './components/MemberPortal.tsx';
import { ShareEarnModal } from './components/ShareEarnModal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { Footer } from './components/Footer.tsx';
import { Cause, Product, CartItem, Order, UnlockedDigitalItem, MemberUser } from './types.ts';
import { buildUnifiedSearchIndex } from './utils/fuzzySearch.ts';
import { useLanguage } from './i18n/LanguageContext.tsx';
import { Package, RefreshCw, BookOpen } from 'lucide-react';

export function App() {
  const { lang, t } = useLanguage();
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

  // PWA Install Prompt
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState<any>(null);

  // Public Open-Source Integrations (Umami / Chatwoot / WhatsApp / Support Email)
  const [publicIntegrations, setPublicIntegrations] = useState<{
    whatsappSupportNumber?: string;
    supportEmail?: string;
  }>({ supportEmail: 'support@ugtindia.space' });

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
  const [isTrackLedgerOpen, setIsTrackLedgerOpen] = useState<boolean>(
    () => /^\/(track|ledger|impact)\b/i.test(window.location.pathname)
  );
  const [trackLedgerTab, setTrackLedgerTab] = useState<'track' | 'ledger'>(() =>
    /^\/(ledger|impact)\b/i.test(window.location.pathname) ? 'ledger' : 'track'
  );
  const [isIndiaMapOpen, setIsIndiaMapOpen] = useState<boolean>(
    () => /^\/map\b/i.test(window.location.pathname)
  );
  const [isProgramsOpen, setIsProgramsOpen] = useState<boolean>(false);
  const [programsTab, setProgramsTab] = useState<'subscription' | 'bulk'>('subscription');

  // Open-Source Member Auth + 30-Day Referral Attribution + Share & Earn Modal
  const [memberToken, setMemberToken] = useState<string | null>(() =>
    localStorage.getItem('buy4achange_member_token')
  );
  const [memberUser, setMemberUser] = useState<MemberUser | null>(null);
  const [activeRefCode, setActiveRefCode] = useState<string>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('buy4achange_ref_code_v1') || 'null');
      if (saved && saved.code && Date.now() - saved.ts < 30 * 24 * 60 * 60 * 1000) {
        return saved.code;
      }
    } catch {}
    return '';
  });
  const [invitedByName, setInvitedByName] = useState<string | null>(null);
  const [refCommissionPct, setRefCommissionPct] = useState<number>(5);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);

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

  // Cookie-Free Analytics Helper
  const logTelemetry = (eventType: string, targetId = '') => {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, targetId, lang }),
    }).catch(() => {});
  };

  // Hydrate logged-in Member Account & capture ?ref=CODE (30-day attribution)
  useEffect(() => {
    const refParam = new URLSearchParams(window.location.search).get('ref');
    const codeToCheck = (refParam || activeRefCode || '').trim().toUpperCase();
    if (refParam && refParam.trim()) {
      const clean = refParam.trim().toUpperCase();
      setActiveRefCode(clean);
      try {
        localStorage.setItem('buy4achange_ref_code_v1', JSON.stringify({ code: clean, ts: Date.now() }));
      } catch {}
    }
    if (codeToCheck) {
      fetch(`/api/referrals/lookup/${encodeURIComponent(codeToCheck)}`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.valid) {
            setInvitedByName(d.referrerName);
            if (typeof d.commissionPct === 'number') setRefCommissionPct(d.commissionPct);
          }
        })
        .catch(() => {});
    }

    if (memberToken) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${memberToken}` }, cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.user) {
            setMemberUser(d.user);
            if (typeof d?.wallet?.commissionPct === 'number') setRefCommissionPct(d.wallet.commissionPct);
            if (Array.isArray(d.digitalItems) && d.digitalItems.length > 0) {
              mergeUnlockedItems(d.digitalItems);
            }
          }
        })
        .catch(() => {});
    }
  }, [memberToken]);

  // Capture PWA Install Event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    await deferredPwaPrompt.userChoice.catch(() => {});
    setDeferredPwaPrompt(null);
  };

  // Load Safe Open-Source Public Integrations (Umami / Chatwoot / WhatsApp) & Log Anonymous View
  useEffect(() => {
    if (/^\/admin(\/.*)?$/i.test(currentPath)) return;
    logTelemetry('page_view', currentPath || '/');

    fetch('/api/integrations/public', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (!cfg) return;
        setPublicIntegrations({
          whatsappSupportNumber: cfg.whatsappSupportNumber || '',
          supportEmail: cfg.supportEmail || 'support@ugtindia.space',
        });

        // Dynamically attach Umami / Plausible ONLY if configured by Admin
        if (cfg.umamiScriptUrl && cfg.umamiWebsiteId && !document.querySelector('script[data-ugt-analytics]')) {
          const s = document.createElement('script');
          s.defer = true;
          s.src = cfg.umamiScriptUrl;
          s.setAttribute('data-website-id', cfg.umamiWebsiteId);
          s.setAttribute('data-domain', cfg.umamiWebsiteId);
          s.setAttribute('data-ugt-analytics', 'true');
          document.head.appendChild(s);
        }

        // Dynamically attach Chatwoot ONLY if configured by Admin
        if (cfg.chatwootBaseUrl && cfg.chatwootWebsiteToken && !document.querySelector('script[data-ugt-chatwoot]')) {
          const s = document.createElement('script');
          s.async = true;
          s.src = `${cfg.chatwootBaseUrl.replace(/\/+$/, '')}/packs/js/sdk.js`;
          s.setAttribute('data-ugt-chatwoot', 'true');
          s.onload = () => {
            (window as any).chatwootSDK?.run({
              websiteToken: cfg.chatwootWebsiteToken,
              baseUrl: cfg.chatwootBaseUrl.replace(/\/+$/, ''),
            });
          };
          document.head.appendChild(s);
        }
      })
      .catch(() => {});
  }, []);

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

  // Open-Source MiniSearch Typo-Tolerant Search Index (Products + eBooks + All 8 Mission Dossiers)
  const searchIndex = useMemo(() => buildUnifiedSearchIndex(products, causes), [products, causes]);

  const fuzzyMatches = useMemo(() => {
    const q = searchTerm.trim();
    if (!q) return null;
    const results = searchIndex.search(q);
    const productIds = new Set<string>();
    const missionIds = new Set<string>();
    for (const r of results) {
      if (r.kind === 'mission') missionIds.add(String(r.refId));
      else productIds.add(String(r.refId));
    }
    return { productIds, missionIds };
  }, [searchTerm, searchIndex]);

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
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (memberToken) headers.Authorization = `Bearer ${memberToken}`;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...orderDraft,
          paymentId: paymentResult.transactionId,
          paymentMethod: paymentResult.paymentMethod || 'Direct UPI',
          paymentStatus: paymentResult.status || 'pending_verification',
          referredByCode: activeRefCode || undefined,
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
    if (!fuzzyMatches) return true;
    return fuzzyMatches.productIds.has(p.id);
  });

  const filteredProducts = physicalProducts.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !fuzzyMatches || fuzzyMatches.productIds.has(p.id);
    return matchesCategory && matchesSearch;
  });

  const matchingMissions = fuzzyMatches
    ? causes.filter((c) => fuzzyMatches.missionIds.has(c.id))
    : [];

  const activeMission = selectedCauseId ? causes.find((c) => c.id === selectedCauseId) : null;
  const dynamicCategories = Array.from(
    new Set(physicalProducts.map((p) => p.category).filter((c): c is string => Boolean(c && c.trim())))
  );
  const categories = ['All', ...dynamicCategories];
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-open verified product when scanned via Origin & Purity QR Code (?verify=<productId>)
  useEffect(() => {
    const verifyId = new URLSearchParams(window.location.search).get('verify');
    if (verifyId && products.length > 0 && !selectedProduct) {
      const match = products.find((p) => p.id === verifyId || p.slug === verifyId);
      if (match) setSelectedProduct(match);
    }
  }, [products]);

  // ADMIN ROUTE (/admin) & SELLER MARKETPLACE ROUTE (/seller)
  const isAdminRoute =
    /^\/admin(\/.*)?$/i.test(currentPath) || /^#\/?admin(\/.*)?$/i.test(currentHash);
  const isSellerRoute =
    /^\/seller(\/.*)?$/i.test(currentPath) || /^#\/?seller(\/.*)?$/i.test(currentHash);
  const isAuditorRoute =
    /^\/auditor(\/.*)?$/i.test(currentPath) || /^#\/?auditor(\/.*)?$/i.test(currentHash);
  const isAccountRoute =
    /^\/account(\/.*)?$/i.test(currentPath) || /^#\/?account(\/.*)?$/i.test(currentHash);

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

  if (isSellerRoute) {
    return (
      <SellerPortal
        causes={causes}
        onNavigateStore={() => navigateTo('/')}
        onRefreshStore={fetchData}
      />
    );
  }

  if (isAuditorRoute) {
    return <FieldAuditorPortal onNavigateStore={() => navigateTo('/')} />;
  }

  if (isAccountRoute) {
    return (
      <>
        <MemberPortal
          causes={causes}
          referredByCode={activeRefCode}
          onNavigateStore={() => navigateTo('/')}
          onAuthChange={(u, tok) => {
            setMemberUser(u);
            setMemberToken(tok);
          }}
          onSyncUnlockedLibrary={mergeUnlockedItems}
          onLaunchDigital={(item) => setActiveDigitalReader(item)}
        />
        <DigitalReaderModal
          item={activeDigitalReader}
          onClose={() => setActiveDigitalReader(null)}
        />
      </>
    );
  }

  // PUBLIC STOREFRONT — Clean Futuristic Warm-Paper & Forest-Green Editorial UI
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#14171A] flex flex-col font-sans w-full">
      <Navbar
        cartCount={totalCartCount}
        libraryCount={unlockedLibrary.length}
        memberUser={memberUser}
        invitedByName={invitedByName}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenTrack={() => {
          setTrackLedgerTab('track');
          setIsTrackLedgerOpen(true);
        }}
        onOpenAccount={() => navigateTo('/account')}
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
        canInstallPwa={Boolean(deferredPwaPrompt)}
        onInstallPwa={handleInstallPwa}
        onNavigateHome={() => {
          setSelectedCauseId(null);
          setSelectedCategory('All');
          setSearchTerm('');
          window.scrollTo(0, 0);
        }}
      />

      <main className="flex-1 w-full">
        {/* 1. Clean Futuristic Editorial Hero */}
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
          onOpenMissionDoc={(cId) => {
            setReadingMissionCauseId(cId);
            logTelemetry('mission_read', cId);
          }}
          onOpenLedger={() => {
            setTrackLedgerTab('ledger');
            setIsTrackLedgerOpen(true);
          }}
          onOpenReferEarn={() => navigateTo('/account')}
        />

        {/* Instant Fuzzy Search Hits Across 8 Living India Mission Dossiers */}
        {matchingMissions.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
            <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2.5">
              <div className="text-xs font-semibold text-[#166534] flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Matching Living India Mission Dossiers ({matchingMissions.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchingMissions.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setReadingMissionCauseId(m.id);
                      logTelemetry('mission_read', m.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-green-50 border border-[#BBF7D0] text-xs font-semibold text-[#14171A]"
                  >
                    {m.title} →
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2. Shop Catalog First for Instant Visitor Clarity */}
        <section id="catalog-grid" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-gray-200">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
                {t.shopEyebrow}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14171A]">
                {t.shopHeading}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {activeMission
                  ? `Supporting "${activeMission.title}" — you can change the mission on any item.`
                  : t.shopSubtext}
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
                    {cat === 'All' ? t.allCategories : cat}
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
                    logTelemetry('product_view', p.id);
                  }}
                  onShareProduct={(p) => {
                    setShareProduct(p);
                    setShareModalOpen(true);
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
            logTelemetry('product_view', p.id);
          }}
          onLaunchUnlocked={(item) => setActiveDigitalReader(item)}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onShareProduct={(p) => {
            setShareProduct(p);
            setShareModalOpen(true);
          }}
        />

        {/* 4. The 8 Living India National Missions + Official Dossier Reader */}
        <MissionsCinematic
          causes={causes}
          selectedCauseId={selectedCauseId}
          onSelectCause={setSelectedCauseId}
          onScrollToCatalog={() => {
            document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenDocument={(causeId) => {
            setReadingMissionCauseId(causeId);
            logTelemetry('mission_read', causeId);
          }}
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
        memberUser={memberUser}
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
        onLogPdfDownload={(ordNum) => logTelemetry('pdf_download', ordNum)}
      />

      <OrderTrackLedgerModal
        isOpen={isTrackLedgerOpen}
        initialTab={trackLedgerTab}
        onClose={() => setIsTrackLedgerOpen(false)}
        causes={causes}
        onAddUnlockedItems={mergeUnlockedItems}
        onLaunchDigital={(item) => {
          setIsTrackLedgerOpen(false);
          setActiveDigitalReader(item);
        }}
        onLogPdfDownload={(ordNum) => logTelemetry('pdf_download', ordNum)}
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
        onSelectMission={(cId) => {
          setReadingMissionCauseId(cId);
          logTelemetry('mission_read', cId);
        }}
        onFundMission={(cId) => {
          setSelectedCauseId(cId);
          setReadingMissionCauseId(null);
          setTimeout(() => {
            document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
          }, 120);
        }}
      />

      <IndiaImpactMapModal
        isOpen={isIndiaMapOpen}
        onClose={() => setIsIndiaMapOpen(false)}
        causes={causes}
      />

      <NationalProgramsModal
        isOpen={isProgramsOpen}
        initialTab={programsTab}
        onClose={() => setIsProgramsOpen(false)}
        causes={causes}
      />

      <ShareEarnModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        product={shareProduct}
        memberUser={memberUser}
        commissionPct={refCommissionPct}
        onOpenAccount={() => navigateTo('/account')}
      />

      <Footer
        onOpenMissionDoc={(cId) => {
          setReadingMissionCauseId(cId);
          logTelemetry('mission_read', cId);
        }}
        onOpenTrack={(tab) => {
          setTrackLedgerTab(tab);
          setIsTrackLedgerOpen(true);
        }}
        onOpenSellerPortal={() => navigateTo('/seller')}
        onOpenIndiaMap={() => setIsIndiaMapOpen(true)}
        onOpenPrograms={(tab) => {
          setProgramsTab(tab);
          setIsProgramsOpen(true);
        }}
        onOpenAuditorPortal={() => navigateTo('/auditor')}
        canInstallPwa={Boolean(deferredPwaPrompt)}
        onInstallPwa={handleInstallPwa}
        whatsappSupportNumber={publicIntegrations.whatsappSupportNumber}
        supportEmail={publicIntegrations.supportEmail}
      />
    </div>
  );
}
export default App;
