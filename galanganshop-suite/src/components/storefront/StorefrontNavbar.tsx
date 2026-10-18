import React, { useState } from 'react';
import { KasirSession, SiteConfig } from '../../types';

interface StorefrontNavbarProps {
  config: SiteConfig;
  cartCount: number;
  activeTab: 'menu' | 'catering';
  setActiveTab: (tab: 'menu' | 'catering') => void;
  onOpenCart: () => void;
  onOpenLoginGate: () => void;
  onOpenPosKasir: () => void;
  onOpenAccounting: () => void;
  onOpenTracker: () => void;
  onOpenWhatsApp: () => void;
  kasirSession: KasirSession | null;
  onLogoutKasir: () => void;
}

export const StorefrontNavbar: React.FC<StorefrontNavbarProps> = ({
  config,
  cartCount,
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenLoginGate,
  onOpenPosKasir,
  onOpenAccounting,
  onOpenTracker,
  onOpenWhatsApp,
  kasirSession,
  onLogoutKasir
}) => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isKasirMenuOpen, setIsKasirMenuOpen] = useState(false);

  const brandWords = config.brandWords && config.brandWords.length > 0
    ? config.brandWords
    : (config.brandName || 'GALANGAN SHOP').split(' ').map((w, idx) => ({
        text: w,
        color: ['#ea580c', '#f59e0b', '#e11d48', '#10b981'][idx % 4]
      }));

  const firstWord = brandWords[0] || { text: 'GALANGAN', color: '#ea580c' };
  const remainingWords = brandWords.slice(1);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsNavMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-stone-200/90 backdrop-blur-md transition-colors shadow-xs"
      style={{ backgroundColor: `${config.headerBgColor || '#ffffff'}f2` }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4 relative">
        {/* Brand Logo & Title with 2 Lines Word Color customization */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-md overflow-hidden transition-all flex-shrink-0"
            style={{ backgroundColor: config.logoBgColor || '#ea580c' }}
          >
            {config.logoType === 'image' && config.logoImage ? (
              <img src={config.logoImage} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <i className={`${config.logoIcon || 'fa-solid fa-store'} text-xs sm:text-base`}></i>
            )}
          </div>

          <div className="flex flex-col justify-center min-w-0 overflow-hidden select-none">
            <div className="font-black text-xs sm:text-base md:text-lg tracking-tight leading-tight uppercase truncate">
              <span style={{ color: firstWord.color }}>{firstWord.text}</span>
            </div>
            <div className="font-black text-xs sm:text-base md:text-lg tracking-tight leading-tight flex items-center gap-1 min-w-0">
              {remainingWords.map((word, idx) => (
                <span key={`nav-word-${idx}`} className="truncate" style={{ color: word.color }}>
                  {word.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-stone-700">
          <button
            onClick={() => {
              setActiveTab('menu');
              scrollTo('tab-section');
            }}
            className={`pb-1 transition ${activeTab === 'menu' ? 'text-orange-600 border-b-2 border-orange-600 font-bold' : 'hover:text-orange-600'}`}
          >
            {config.navMenuText || 'Katalog Produk'}
          </button>
          <button
            onClick={() => {
              setActiveTab('catering');
              scrollTo('catering-section');
            }}
            className={`pb-1 transition ${activeTab === 'catering' ? 'text-orange-600 border-b-2 border-orange-600 font-bold' : 'hover:text-orange-600'}`}
          >
            {config.navCateringText || 'Paket Catering'}
          </button>
          <button onClick={() => scrollTo('ongkir-calculator')} className="hover:text-orange-600 transition">
            {config.navOngkirText || 'Cek Ongkir'}
          </button>
          <button onClick={() => scrollTo('b2b-section')} className="hover:text-orange-600 transition">
            {config.navB2bText || 'Grosir & B2B'}
          </button>
        </nav>

        {/* Action Controls: 3-Bars, Kasir / Accounting, Login Gate, Cart */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Quick Menu (3 Garis) */}
          <button
            type="button"
            onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
            className={`h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 text-stone-700 hover:text-orange-600 hover:border-orange-500 hover:bg-stone-50 transition shadow-2xs active:scale-95 ${
              isNavMenuOpen ? 'bg-orange-50 text-orange-600 border-orange-500 ring-2 ring-orange-500/20' : ''
            }`}
            title="Menu Akses Cepat"
          >
            <i className={`text-xs sm:text-sm ${isNavMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}`}></i>
            <span className="text-xs font-bold hidden sm:inline">{isNavMenuOpen ? 'Tutup' : 'Menu'}</span>
          </button>

          {/* POS Kasir Direct Access */}
          <button
            type="button"
            onClick={onOpenPosKasir}
            className="h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300 transition text-xs font-extrabold shadow-2xs"
            title="Buka Kasir Pintar POS"
          >
            <i className="fa-solid fa-cash-register text-xs sm:text-sm text-emerald-600"></i>
            <span className="hidden md:inline">Kasir POS</span>
          </button>

          {/* Accounting Direct Access */}
          <button
            type="button"
            onClick={onOpenAccounting}
            className="h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-1.5 text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-300 transition text-xs font-extrabold shadow-2xs"
            title="Buku Besar & Pembukuan Akuntansi"
          >
            <i className="fa-solid fa-scale-balanced text-xs text-blue-600"></i>
            <span className="hidden md:inline">Akuntansi</span>
          </button>

          {/* Portal Access Lock / Cashier Active Indicator */}
          <div className="relative">
            {!kasirSession ? (
              <button
                type="button"
                onClick={onOpenLoginGate}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-stone-300 text-stone-700 hover:text-orange-600 hover:border-orange-500 hover:bg-stone-50 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                title="Pilih Akses (Kasir Operator / Master Admin)"
              >
                <i className="fa-solid fa-lock text-xs sm:text-sm"></i>
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setIsKasirMenuOpen(!isKasirMenuOpen)}
                  className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-95 cursor-pointer"
                  title="Sesi Kasir Aktif"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <i className="fa-solid fa-cash-register text-xs"></i>
                  <span className="hidden sm:inline text-xs font-bold max-w-[80px] truncate">
                    {kasirSession.kasirName || kasirSession.username}
                  </span>
                  <i className="fa-solid fa-chevron-down text-[9px] text-emerald-600"></i>
                </button>

                {isKasirMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50">
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Operator Kasir Aktif</p>
                      <p className="text-xs font-extrabold text-stone-800 truncate">{kasirSession.kasirName || kasirSession.username}</p>
                      <p className="text-[10px] text-emerald-600 font-mono mt-0.5">{kasirSession.shiftId || 'Shift Kasir Aktif'}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsKasirMenuOpen(false);
                          onOpenPosKasir();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 text-left"
                      >
                        <i className="fa-solid fa-cash-register text-emerald-600"></i>
                        <span>Buka Terminal Kasir</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsKasirMenuOpen(false);
                          onOpenLoginGate();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-left"
                      >
                        <i className="fa-solid fa-arrows-split-up-and-left text-stone-400"></i>
                        <span>Pilih Akses / Panel Admin</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsKasirMenuOpen(false);
                          onLogoutKasir();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket text-red-500"></i>
                        <span>Logout Kasir</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="h-8 sm:h-9 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm px-2.5 sm:px-4 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
          >
            <i className="fa-solid fa-cart-shopping text-xs"></i>
            <span className="hidden sm:inline">Keranjang</span>
            <span className="bg-white text-orange-700 font-black text-[11px] px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Fast Access Nav Panel */}
      {isNavMenuOpen && (
        <div className="border-t border-stone-200/90 bg-white/98 backdrop-blur-xl shadow-2xl py-4 px-4 sm:px-6 lg:px-8 relative z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-ping"></span>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <i className="fa-solid fa-compass text-orange-600"></i>
                  <span>Menu Navigasi & Akses Cepat Suite</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNavMenuOpen(false)}
                className="text-xs font-bold text-stone-500 hover:text-orange-600 px-2.5 py-1 rounded-lg hover:bg-stone-100"
              >
                <i className="fa-solid fa-xmark mr-1"></i> Tutup
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('menu');
                  scrollTo('tab-section');
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition shadow-2xs ${
                  activeTab === 'menu' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-stone-200 bg-white hover:border-orange-300'
                }`}
              >
                <i className="fa-solid fa-store text-lg text-orange-600 mb-1"></i>
                <span className="text-xs font-black">{config.navMenuText || 'Katalog Produk'}</span>
                <span className="text-[10px] text-stone-500">Ritel & Menu Kuliner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('catering');
                  scrollTo('catering-section');
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition shadow-2xs ${
                  activeTab === 'catering' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-stone-200 bg-white hover:border-orange-300'
                }`}
              >
                <i className="fa-solid fa-boxes-packing text-lg text-orange-600 mb-1"></i>
                <span className="text-xs font-black">{config.navCateringText || 'Paket Catering'}</span>
                <span className="text-[10px] text-stone-500">Box & Prasmanan</span>
              </button>

              <button
                type="button"
                onClick={() => scrollTo('ongkir-calculator')}
                className="p-3 rounded-2xl border border-stone-200 bg-white hover:border-blue-300 text-left flex flex-col gap-1 transition shadow-2xs"
              >
                <i className="fa-solid fa-truck-fast text-lg text-blue-600 mb-1"></i>
                <span className="text-xs font-black">{config.navOngkirText || 'Cek Ongkir'}</span>
                <span className="text-[10px] text-stone-500">Kalkulasi 7 Kurir</span>
              </button>

              <button
                type="button"
                onClick={() => scrollTo('b2b-section')}
                className="p-3 rounded-2xl border border-stone-200 bg-white hover:border-amber-300 text-left flex flex-col gap-1 transition shadow-2xs"
              >
                <i className="fa-solid fa-building text-lg text-amber-600 mb-1"></i>
                <span className="text-xs font-black">{config.navB2bText || 'Grosir & B2B'}</span>
                <span className="text-[10px] text-stone-500">Pasokan Perusahaan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsNavMenuOpen(false);
                  onOpenTracker();
                }}
                className="p-3 rounded-2xl border border-stone-200 bg-white hover:border-emerald-300 text-left flex flex-col gap-1 transition shadow-2xs"
              >
                <i className="fa-solid fa-satellite-dish text-lg text-emerald-600 mb-1"></i>
                <span className="text-xs font-black">Lacak Pesanan</span>
                <span className="text-[10px] text-stone-500">Status Live Real-time</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsNavMenuOpen(false);
                  onOpenWhatsApp();
                }}
                className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left flex flex-col gap-1 transition shadow-2xs"
              >
                <i className="fa-brands fa-whatsapp text-xl text-emerald-600 mb-1"></i>
                <span className="text-xs font-black text-emerald-900">Chat WhatsApp</span>
                <span className="text-[10px] text-emerald-700">Layanan Pelanggan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
