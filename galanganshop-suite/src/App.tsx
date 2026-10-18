import React, { useEffect, useState } from 'react';
import { AccountingModal } from './components/accounting/AccountingModal';
import { MasterAdminPanel } from './components/admin/MasterAdminPanel';
import { AdminAuthModal } from './components/auth/AdminAuthModal';
import { LoginGateModal } from './components/auth/LoginGateModal';
import { PosKasirModal } from './components/pos/PosKasirModal';
import { B2BSection } from './components/storefront/B2BSection';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CateringCalculator } from './components/storefront/CateringCalculator';
import { CategoryPills } from './components/storefront/CategoryPills';
import { CheckoutSection } from './components/storefront/CheckoutSection';
import { DeliveryAndSocialSection } from './components/storefront/DeliveryAndSocialSection';
import { FloatingActionButtons } from './components/storefront/FloatingActionButtons';
import { GpsPermissionModal } from './components/storefront/GpsPermissionModal';
import { HeroBanner } from './components/storefront/HeroBanner';
import { ManualPaymentModals } from './components/storefront/ManualPaymentModals';
import { OrderTrackingModal } from './components/storefront/OrderTrackingModal';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { ProductGrid } from './components/storefront/ProductGrid';
import { StorefrontFooter } from './components/storefront/StorefrontFooter';
import { StorefrontNavbar } from './components/storefront/StorefrontNavbar';
import { TopMarqueeRibbon } from './components/storefront/TopMarqueeRibbon';
import { defaultSiteConfig, initialCateringPackages, initialCourierRates } from './data/initialData';
import {
  CartItem,
  CateringPackage,
  CourierRate,
  KasirAccount,
  KasirSession,
  Order,
  Product,
  SiteConfig
} from './types';
import { generateOrderReceiptPDF } from './utils/pdfGenerator';
import { syncOrderToFirestore } from './services/dataSync';
import {
  appendOrder,
  appendRecentOrder,
  getCategories,
  getInventory,
  getKasirAccounts,
  getOrders,
  getProducts,
  getRecentOrders,
  getSiteConfig,
  saveCategories,
  saveKasirAccounts,
  saveOrders,
  saveProducts,
  saveSiteConfig
} from './utils/storage';

export default function App() {
  // Core state loaded from persistent storage
  const [siteConfig, setSiteConfigState] = useState<SiteConfig>(getSiteConfig());
  const [products, setProductsState] = useState<Product[]>(getProducts());
  const [categories, setCategoriesState] = useState(getCategories());
  const [inventory] = useState(getInventory());
  const [orders, setOrdersState] = useState<Order[]>(getOrders());
  const [recentOrders, setRecentOrdersState] = useState<Order[]>(getRecentOrders());
  const [kasirAccounts, setKasirAccountsState] = useState<KasirAccount[]>(getKasirAccounts());

  // Storefront & Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'catering'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'large' | 'compact' | 'list'>('large');
  const [hideHeroBanner, setHideHeroBanner] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Checkout form state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isPickup, setIsPickup] = useState<boolean>(false);
  const [courierRates] = useState<CourierRate[]>(initialCourierRates);
  const [selectedCourier, setSelectedCourier] = useState<CourierRate>(initialCourierRates[1] || initialCourierRates[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('qris');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);

  // Active / Tracking order & detail inspection
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  // Session & Auth state
  const [kasirSession, setKasirSession] = useState<KasirSession | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Modals visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginGateOpen, setIsLoginGateOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPosKasirOpen, setIsPosKasirOpen] = useState(false);
  const [isAccountingOpen, setIsAccountingOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  // Payment popups
  const [isOpenQrisModal, setIsOpenQrisModal] = useState(false);
  const [isOpenBankModal, setIsOpenBankModal] = useState(false);
  const [isOpenEwalletModal, setIsOpenEwalletModal] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? '' : prev));
    }, 3500);
  };

  // Sync event listeners for cross-tab or component updates
  useEffect(() => {
    const handleConfigUpdate = (e: any) => setSiteConfigState(e.detail);
    const handleProductsUpdate = (e: any) => setProductsState(e.detail);
    const handleCategoriesUpdate = (e: any) => setCategoriesState(e.detail);
    const handleOrdersUpdate = (e: any) => {
      setOrdersState(e.detail);
      setRecentOrdersState(getRecentOrders());
    };

    window.addEventListener('galangan-config-updated', handleConfigUpdate);
    window.addEventListener('galangan-products-updated', handleProductsUpdate);
    window.addEventListener('galangan-categories-updated', handleCategoriesUpdate);
    window.addEventListener('galangan-orders-updated', handleOrdersUpdate);

    return () => {
      window.removeEventListener('galangan-config-updated', handleConfigUpdate);
      window.removeEventListener('galangan-products-updated', handleProductsUpdate);
      window.removeEventListener('galangan-categories-updated', handleCategoriesUpdate);
      window.removeEventListener('galangan-orders-updated', handleOrdersUpdate);
    };
  }, []);

  // Update site config
  const handleSaveConfig = (newCfg: SiteConfig) => {
    setSiteConfigState(newCfg);
    saveSiteConfig(newCfg);
  };

  // Update products
  const handleSaveProducts = (newProds: Product[]) => {
    setProductsState(newProds);
    saveProducts(newProds);
  };

  // Update categories
  const handleSaveCategories = (newCats: any[]) => {
    setCategoriesState(newCats);
    saveCategories(newCats);
  };

  // Update Kasir accounts
  const handleSaveKasirAccounts = (accs: KasirAccount[]) => {
    setKasirAccountsState(accs);
    saveKasirAccounts(accs);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      existing.quantity += quantity;
      setCart([...cart]);
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    showToast(`"${product.name}" dimasukkan ke keranjang!`);
  };

  const handleIncreaseQty = (id: string) => {
    setCart(cart.map(c => (c.id === id ? { ...c, quantity: c.quantity + 1 } : c)));
  };

  const handleDecreaseQty = (id: string) => {
    setCart(
      cart
        .map(c => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c))
        .filter(c => c.quantity > 0)
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const handleAddCateringToCart = (pkg: CateringPackage, pax: number) => {
    const item: CartItem = {
      id: `catering-${pkg.id}-${Date.now()}`,
      name: `${pkg.name} (${pax} Pax)`,
      category: 'catering',
      categoryLabel: 'Paket Catering',
      price: pkg.pricePerPax,
      quantity: pax,
      isCatering: true,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      description: pkg.description,
      showOnMain: true
    };
    setCart([...cart, item]);
    showToast(`Paket Catering (${pax} pax) dimasukkan ke keranjang!`);
    const checkoutEl = document.getElementById('checkout-section');
    if (checkoutEl) checkoutEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Cycle view mode
  const handleCycleViewMode = () => {
    const modes: ('large' | 'compact' | 'list')[] = ['large', 'compact', 'list'];
    const nextIdx = (modes.indexOf(viewMode) + 1) % modes.length;
    setViewMode(modes[nextIdx]);
  };

  // GPS detection simulation / real Geolocation
  const handleConfirmLocation = () => {
    setIsGpsModalOpen(false);
    if (navigator.geolocation) {
      setCustomerAddress('Mencari koordinat GPS Anda...');
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setCustomerAddress(`Jl. Lokasi Pengantaran (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          showToast('Lokasi GPS berhasil dideteksi!');
        },
        () => {
          setCustomerAddress('Jl. Niaga Raya No. 12, Jakarta Selatan');
          showToast('Menggunakan perkiraan alamat terdekat.');
        }
      );
    } else {
      setCustomerAddress('Jl. Niaga Raya No. 12, Jakarta Selatan');
    }
  };

  // Proceed checkout
  const handleProceedCheckout = () => {
    setIsProcessingCheckout(true);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fee = isPickup ? 0 : selectedCourier.price;
    const total = subtotal + fee;

    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    const newOrder: Order = {
      orderId,
      customer: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        notes: orderNotes
      },
      customerName,
      customerPhone,
      customerAddress,
      items: cart.map(c => ({
        id: c.id,
        name: c.name,
        price: c.price,
        quantity: c.quantity
      })),
      courier: isPickup ? { name: 'Ambil di Toko (Pickup)', price: 0 } : selectedCourier,
      subtotal,
      courierFee: fee,
      totalAmount: total,
      paymentMethod: selectedPaymentMethod,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      isPickup
    };

    setActiveOrder(newOrder);
    appendOrder(newOrder);
    appendRecentOrder(newOrder);
    syncOrderToFirestore(newOrder);
    setIsProcessingCheckout(false);

    if (selectedPaymentMethod === 'qris') {
      setIsOpenQrisModal(true);
    } else if (selectedPaymentMethod === 'bank_transfer') {
      setIsOpenBankModal(true);
    } else {
      setIsOpenEwalletModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    if (!activeOrder) return;
    const updated: Order = { ...activeOrder, status: 'Dibayar' };
    setActiveOrder(updated);
    appendOrder(updated);
    generateOrderReceiptPDF(updated, siteConfig);
    setCart([]);
    setIsOpenQrisModal(false);
    setIsOpenBankModal(false);
    setIsOpenEwalletModal(false);
    setIsTrackerOpen(true);
    showToast('Pembayaran berhasil diverifikasi! Struk PDF telah diunduh.');
  };

  // Filter products for storefront
  const visibleProducts = products.filter(p => p.showOnMain !== false);
  const filteredProducts = visibleProducts.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const perPage = siteConfig.menuItemsPerPage || 12;
  const totalPages = Math.ceil(filteredProducts.length / perPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return visibleProducts.length;
    return visibleProducts.filter(p => p.category === catId).length;
  };

  return (
    <div
      className="min-h-screen text-stone-900 transition-colors duration-200"
      style={{
        backgroundColor: siteConfig.pageBgColor || '#fafaf9',
        color: siteConfig.pageTextColor || '#1c1917',
        backgroundImage: siteConfig.pageBgImage ? `url("${siteConfig.pageBgImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Top Promotional Running Text Ribbon */}
      <TopMarqueeRibbon config={siteConfig} />

      {/* Main Navbar */}
      <StorefrontNavbar
        config={siteConfig}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLoginGate={() => setIsLoginGateOpen(true)}
        onOpenPosKasir={() => setIsPosKasirOpen(true)}
        onOpenAccounting={() => setIsAccountingOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenWhatsApp={() => {
          const num = (siteConfig.phone || '6281234567890').replace(/[^0-9]/g, '');
          const cleanNum = num.startsWith('0') ? '62' + num.slice(1) : num;
          window.open(`https://wa.me/${cleanNum}?text=Halo%20Admin%20${encodeURIComponent(siteConfig.brandName)}`, '_blank');
        }}
        kasirSession={kasirSession}
        onLogoutKasir={() => {
          setKasirSession(null);
          showToast('Logout kasir berhasil.');
        }}
      />

      {/* Hero Banner Section with Ephemeral Hide Banner option */}
      <HeroBanner
        config={siteConfig}
        hideHeroBanner={hideHeroBanner}
        setHideHeroBanner={setHideHeroBanner}
        onOrderClick={() => {
          setActiveTab('menu');
          const el = document.getElementById('tab-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onCateringClick={() => {
          setActiveTab('catering');
          const el = document.getElementById('catering-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main id="tab-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Navigation Switcher: Katalog Multi-Produk vs Paket Catering */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
          <div className="inline-flex p-1 sm:p-1.5 bg-stone-200/80 rounded-2xl border border-stone-300 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-base transition-all flex items-center gap-2 cursor-pointer font-bold ${
                activeTab === 'menu' ? 'bg-white text-orange-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <i className="fa-solid fa-store"></i>
              <span>{siteConfig.navMenuText || 'Katalog Multi-Produk'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catering')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-base transition-all flex items-center gap-2 cursor-pointer font-bold ${
                activeTab === 'catering' ? 'bg-white text-orange-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <i className="fa-solid fa-boxes-packing"></i>
              <span>{siteConfig.navCateringText || 'Paket Catering Box'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Multi-Product Catalog */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            <CategoryPills
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={catId => {
                setSelectedCategory(catId);
                setCurrentPage(1);
              }}
              getCategoryCount={getCategoryCount}
            />

            <ProductGrid
              products={paginatedProducts}
              inventory={inventory}
              viewMode={viewMode}
              onCycleViewMode={handleCycleViewMode}
              config={siteConfig}
              onAddToCart={prod => handleAddToCart(prod, 1)}
              onSelectProduct={prod => setSelectedDetailProduct(prod)}
              onOpenEditModal={prod => {
                setSelectedDetailProduct(prod);
                setIsAdminPanelOpen(true);
              }}
              isAdminLoggedIn={isAdminLoggedIn}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalFilteredCount={filteredProducts.length}
            />
          </div>
        )}

        {/* Tab 2: Catering & 7-Courier Logistics Calculator */}
        {activeTab === 'catering' && (
          <CateringCalculator
            config={siteConfig}
            packages={siteConfig.cateringPackages || initialCateringPackages}
            courierRates={courierRates}
            selectedCourier={selectedCourier}
            onSelectCourier={setSelectedCourier}
            onAddCateringToCart={handleAddCateringToCart}
            onDetectLocation={() => setIsGpsModalOpen(true)}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
          />
        )}

        {/* Checkout Section Form */}
        <CheckoutSection
          config={siteConfig}
          cart={cart}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerAddress={customerAddress}
          setCustomerAddress={setCustomerAddress}
          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}
          isPickup={isPickup}
          setIsPickup={setIsPickup}
          selectedCourier={selectedCourier}
          courierRates={courierRates}
          onSelectCourierCode={code => {
            const found = courierRates.find(c => c.courier_code === code);
            if (found) setSelectedCourier(found);
          }}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          onDetectLocation={() => setIsGpsModalOpen(true)}
          onProceedCheckout={handleProceedCheckout}
          onOpenCart={() => setIsCartOpen(true)}
          isProcessing={isProcessingCheckout}
        />

        {/* Official Delivery Apps & Social Media Section */}
        <DeliveryAndSocialSection config={siteConfig} />

        {/* B2B Corporate Procurement & Wholesale Inquiry Form */}
        <B2BSection config={siteConfig} />
      </main>

      {/* Floating Buttons (Bottom Right WhatsApp & Bottom Left Tracker/Platform) */}
      <FloatingActionButtons
        config={siteConfig}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenWhatsApp={() => {
          const num = (siteConfig.phone || '6281234567890').replace(/[^0-9]/g, '');
          const cleanNum = num.startsWith('0') ? '62' + num.slice(1) : num;
          window.open(`https://wa.me/${cleanNum}?text=Halo%20Admin%20${encodeURIComponent(siteConfig.brandName)}`, '_blank');
        }}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Storefront Footer */}
      <StorefrontFooter
        config={siteConfig}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setIsAdminPanelOpen(true);
          } else {
            setIsAdminAuthOpen(true);
          }
        }}
        onOpenAccounting={() => setIsAccountingOpen(true)}
        onOpenPosKasir={() => setIsPosKasirOpen(true)}
      />

      {/* MODAL 1: Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onIncreaseQty={handleIncreaseQty}
        onDecreaseQty={handleDecreaseQty}
        onRemoveItem={handleRemoveFromCart}
        onEmptyCart={() => setCart([])}
        onProceedToCheckout={() => {
          const el = document.getElementById('checkout-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* MODAL 2: Product Detail */}
      <ProductDetailModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={handleAddToCart}
        inventory={inventory}
      />

      {/* MODAL 3: Dual-Gate Login (Kasir vs Admin) */}
      <LoginGateModal
        isOpen={isLoginGateOpen}
        onClose={() => setIsLoginGateOpen(false)}
        onSelectAdminGate={() => setIsAdminAuthOpen(true)}
        onKasirLoginSuccess={session => {
          setKasirSession(session);
          showToast(`Selamat bekerja, ${session.kasirName}! Terminal POS siap digunakan.`);
        }}
        kasirAccounts={kasirAccounts}
        activeKasirSession={kasirSession}
        onOpenPosTerminal={() => setIsPosKasirOpen(true)}
      />

      {/* MODAL 4: Master Admin Password Auth */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminPanelOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* MODAL 5: SINGLE MASTER ADMIN PANEL ("Hanya boleh ada satu panel admin") */}
      <MasterAdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        config={siteConfig}
        onSaveConfig={handleSaveConfig}
        products={products}
        onSaveProducts={handleSaveProducts}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        orders={orders}
        onUpdateOrderStatus={(orderId, status) => {
          const updated = orders.map(o => (o.orderId === orderId ? { ...o, status } : o));
          setOrdersState(updated);
          saveOrders(updated);
          showToast(`Status pesanan ${orderId} diubah ke ${status}.`);
        }}
        kasirAccounts={kasirAccounts}
        onSaveKasirAccounts={handleSaveKasirAccounts}
        onLogoutAdmin={() => {
          setIsAdminLoggedIn(false);
          setIsAdminPanelOpen(false);
          showToast('Logout Master Admin berhasil.');
        }}
        onShowToast={showToast}
      />

      {/* MODAL 6: POS Kasir Pintar */}
      <PosKasirModal
        isOpen={isPosKasirOpen}
        onClose={() => setIsPosKasirOpen(false)}
        products={products}
        inventory={inventory}
        config={siteConfig}
        session={kasirSession}
        onOpenAdmin={() => {
          setIsPosKasirOpen(false);
          if (isAdminLoggedIn) {
            setIsAdminPanelOpen(true);
          } else {
            setIsAdminAuthOpen(true);
          }
        }}
      />

      {/* MODAL 7: Accounting & General Ledger */}
      <AccountingModal
        isOpen={isAccountingOpen}
        onClose={() => setIsAccountingOpen(false)}
        config={siteConfig}
      />

      {/* MODAL 8: Real-Time Order Tracking */}
      <OrderTrackingModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        activeOrder={activeOrder}
        recentOrders={recentOrders}
        onSelectRecentOrder={o => setActiveOrder(o)}
        onDownloadReceipt={o => generateOrderReceiptPDF(o, siteConfig)}
        onSimulateStatus={status => {
          if (!activeOrder) return;
          const updated = { ...activeOrder, status };
          setActiveOrder(updated);
          appendOrder(updated);
          showToast(`Status pesanan disimulasikan: ${status}`);
        }}
      />

      {/* MODAL 9: Payment Modals (QRIS with 15m countdown, Bank, E-Wallet) */}
      <ManualPaymentModals
        order={activeOrder}
        config={siteConfig}
        isOpenQris={isOpenQrisModal}
        onCloseQris={() => setIsOpenQrisModal(false)}
        onConfirmQris={handlePaymentSuccess}
        isOpenBank={isOpenBankModal}
        onCloseBank={() => setIsOpenBankModal(false)}
        onConfirmBank={handlePaymentSuccess}
        isOpenEwallet={isOpenEwalletModal}
        onCloseEwallet={() => setIsOpenEwalletModal(false)}
        onConfirmEwallet={handlePaymentSuccess}
        onShowToast={showToast}
      />

      {/* MODAL 10: Location Permission in Indonesian */}
      <GpsPermissionModal
        isOpen={isGpsModalOpen}
        onConfirm={handleConfirmLocation}
        onReject={() => setIsGpsModalOpen(false)}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
