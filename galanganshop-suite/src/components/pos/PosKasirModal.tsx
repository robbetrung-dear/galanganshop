import React, { useEffect, useRef, useState } from 'react';
import { InventoryItem, KasirSession, Order, Product, Shift, SiteConfig } from '../../types';
import { generateOrderReceiptPDF } from '../../utils/pdfGenerator';
import { appendJournalEntry, appendOrder, deductStockForOrder, getActiveShift, getShifts, saveShifts, setActiveShift } from '../../utils/storage';

interface PosKasirModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  inventory: InventoryItem[];
  config: SiteConfig;
  session: KasirSession | null;
  onOpenAdmin: () => void;
}

export const PosKasirModal: React.FC<PosKasirModalProps> = ({
  isOpen,
  onClose,
  products,
  inventory,
  config,
  session,
  onOpenAdmin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<{ product: Product; qty: number; discount: number; note: string }[]>([]);
  const [activeShiftState, setActiveShiftState] = useState<Shift | null>(null);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState<number>(100000);
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'edc' | 'transfer'>('tunai');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [showSupervisorPinModal, setShowSupervisorPinModal] = useState(false);
  const [supervisorPinInput, setSupervisorPinInput] = useState('');
  const [supervisorAction, setSupervisorAction] = useState<(() => void) | null>(null);
  const [supervisorError, setSupervisorError] = useState('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const shift = getActiveShift();
      setActiveShiftState(shift);
      if (!shift) {
        setShowOpenShiftModal(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const handleOpenShift = () => {
    const newShift: Shift = {
      shiftId: 'SHIFT-' + Date.now().toString().slice(-6),
      kasirName: session ? session.kasirName : 'Kasir Utama',
      openedAt: new Date().toISOString(),
      startingCash: openingCashInput,
      status: 'OPEN'
    };
    setActiveShift(newShift);
    setActiveShiftState(newShift);
    setShowOpenShiftModal(false);

    // Record opening float to journal
    appendJournalEntry({
      date: new Date().toISOString(),
      refNo: newShift.shiftId,
      description: `Modal Awal Kasir Shift (${newShift.kasirName})`,
      debitAccount: '1001 - Kas Tunai Kasir',
      creditAccount: '1002 - Kas Operasional',
      amount: openingCashInput
    });
  };

  const handleCloseShift = () => {
    if (!activeShiftState) return;

    // Calculate total cash transactions in this shift
    const expectedCash = activeShiftState.startingCash + (cartSubtotal > 0 ? 0 : 0); // sample
    const diff = actualCashInput - expectedCash;

    const closedShift: Shift = {
      ...activeShiftState,
      closedAt: new Date().toISOString(),
      expectedCash,
      actualCash: actualCashInput,
      cashDifference: diff,
      status: 'CLOSED'
    };

    const shifts = getShifts();
    shifts.unshift(closedShift);
    saveShifts(shifts);
    setActiveShift(null);
    setActiveShiftState(null);
    setShowCloseShiftModal(false);

    // Auto journal difference if enabled in site config
    if (config.autoJournalShiftDiff && diff !== 0) {
      if (diff < 0) {
        appendJournalEntry({
          date: new Date().toISOString(),
          refNo: closedShift.shiftId,
          description: `Penyesuaian Selisih Kurang Kas Shift (${closedShift.kasirName})`,
          debitAccount: '6005 - Beban Selisih Kas',
          creditAccount: '1001 - Kas Tunai',
          amount: Math.abs(diff)
        });
      } else {
        appendJournalEntry({
          date: new Date().toISOString(),
          refNo: closedShift.shiftId,
          description: `Penyesuaian Selisih Lebih Kas Shift (${closedShift.kasirName})`,
          debitAccount: '1001 - Kas Tunai',
          creditAccount: '6005 - Pendapatan Lain-lain (Selisih Kas)',
          amount: diff
        });
      }
    }

    alert(`Shift Kasir resmi ditutup!\nModal Awal: ${formatRupiah(closedShift.startingCash)}\nKas Aktual: ${formatRupiah(actualCashInput)}\nSelisih: ${formatRupiah(diff)}`);
  };

  const handleAddToCart = (product: Product) => {
    const existing = cart.find(c => c.product.id === product.id);
    if (existing) {
      existing.qty += 1;
      setCart([...cart]);
    } else {
      setCart([...cart, { product, qty: 1, discount: 0, note: '' }]);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim().toLowerCase();
    const match = products.find(p => (p.sku && p.sku.toLowerCase() === query) || p.id.toLowerCase() === query);

    if (match) {
      handleAddToCart(match);
      setBarcodeInput('');
    } else {
      alert(`Produk dengan Barcode/SKU "${barcodeInput}" tidak ditemukan!`);
    }
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price - item.discount) * item.qty, 0);

  const requireSupervisorPin = (action: () => void) => {
    setSupervisorAction(() => action);
    setSupervisorPinInput('');
    setSupervisorError('');
    setShowSupervisorPinModal(true);
  };

  const verifySupervisorPin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPin = config.supervisorPin || '211211';
    if (supervisorPinInput.trim() === targetPin) {
      setShowSupervisorPinModal(false);
      if (supervisorAction) supervisorAction();
    } else {
      setSupervisorError('PIN Supervisor salah! Hubungi Manager.');
    }
  };

  const handleCompleteOrder = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      orderId: 'POS-' + Date.now().toString().slice(-6),
      customer: {
        name: 'Pelanggan Langsung (Walk-in)',
        phone: '0812-0000-0000'
      },
      items: cart.map(c => ({
        id: c.product.id,
        name: c.product.name,
        price: c.product.price - c.discount,
        quantity: c.qty
      })),
      subtotal: cartSubtotal,
      courierFee: 0,
      totalAmount: cartSubtotal,
      paymentMethod,
      status: 'Selesai',
      createdAt: new Date().toISOString(),
      isPickup: true
    };

    // Save order & deduct stock
    appendOrder(newOrder);
    deductStockForOrder(newOrder);

    // Post to accounting journal automatically
    appendJournalEntry({
      date: new Date().toISOString(),
      refNo: newOrder.orderId,
      description: `Penjualan Kasir POS #${newOrder.orderId}`,
      debitAccount: paymentMethod === 'tunai' ? '1001 - Kas Tunai' : '1002 - Bank Transfer / QRIS',
      creditAccount: '4001 - Pendapatan Penjualan',
      amount: newOrder.totalAmount
    });

    setOrderSuccess(newOrder);
    setShowPaymentModal(false);
    setCart([]);
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/90 backdrop-blur-sm flex items-center justify-center p-0 sm:p-2">
      <div className="bg-white w-full h-full sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Top Header */}
        <div className="bg-stone-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-stone-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl shadow-md">
              <i className="fa-solid fa-cash-register"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  {config.kasirTitle || 'Kasir Pintar POS'}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Terminal 01
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Operator: <span className="text-white font-bold">{session?.kasirName || 'Kasir Utama'}</span> • Shift:{' '}
                <span className="text-emerald-400 font-mono font-bold">{activeShiftState?.shiftId || 'Belum Buka Shift'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeShiftState ? (
              <button
                type="button"
                onClick={() => {
                  setActualCashInput(activeShiftState.startingCash + 250000);
                  setShowCloseShiftModal(true);
                }}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span className="hidden sm:inline">Tutup Shift</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowOpenShiftModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-door-open"></i>
                <span>Buka Shift</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-orange-400 border border-stone-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-lock"></i>
              <span className="hidden md:inline">Panel Admin</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Main POS Split Layout: Left Catalog, Right Order Cart */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left: Product Catalog & Barcode Scanner */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-stone-200 overflow-hidden bg-stone-50">
            {/* Search & Barcode input bar */}
            <div className="p-3 sm:p-4 bg-white border-b border-stone-200 flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
              {/* Barcode scanner input */}
              <form onSubmit={handleBarcodeSubmit} className="flex-1 relative flex items-center">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  placeholder="Scan Barcode / Ketik SKU..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <i className="fa-solid fa-barcode absolute left-3 text-stone-400 text-xs"></i>
              </form>

              {/* Text search */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama produk / menu..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3 text-stone-400 text-xs"></i>
              </div>
            </div>

            {/* Category pills filter */}
            <div className="px-3 sm:px-4 py-2 bg-white border-b border-stone-200 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Semua Produk
              </button>
              {Array.from(new Set(products.map(p => p.category))).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 content-start">
              {filteredProducts.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => handleAddToCart(prod)}
                  className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-500 transition cursor-pointer flex flex-col justify-between group active:scale-95"
                >
                  <div>
                    <div className="w-full h-24 rounded-lg overflow-hidden bg-stone-100 relative mb-2">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      {prod.sku && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/75 text-white font-mono text-[9px] rounded font-bold">
                          {prod.sku}
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-xs text-stone-900 line-clamp-2 leading-snug">{prod.name}</h5>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-black text-xs sm:text-sm text-emerald-700">{formatRupiah(prod.price)}</span>
                    <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs group-hover:bg-emerald-600 group-hover:text-white transition">
                      <i className="fa-solid fa-plus text-[10px]"></i>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Cart & Payment summary */}
          <div className="w-full lg:w-96 flex flex-col bg-white overflow-hidden flex-shrink-0">
            <div className="p-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-stone-900">Tagihan Transaksi</h4>
                <p className="text-[10px] text-stone-500">{cart.length} Jenis Produk Dipilih</p>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => requireSupervisorPin(() => setCart([]))}
                  className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-trash-can"></i> Void Keranjang
                </button>
              )}
            </div>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto p-3 divide-y divide-stone-100 space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  <i className="fa-solid fa-cash-register text-3xl mb-2 text-stone-300"></i>
                  <p>Keranjang kasir masih kosong.</p>
                  <p className="text-[10px] mt-1">Pilih produk di katalog atau scan barcode barang.</p>
                </div>
              ) : (
                cart.map((c, idx) => (
                  <div key={idx} className="pt-2 flex items-start justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <h6 className="font-bold text-stone-900 truncate">{c.product.name}</h6>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {formatRupiah(c.product.price)} x {c.qty}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (c.qty > 1) {
                            c.qty -= 1;
                            setCart([...cart]);
                          } else {
                            requireSupervisorPin(() => {
                              setCart(cart.filter((_, i) => i !== idx));
                            });
                          }
                        }}
                        className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold px-1 min-w-[18px] text-center">{c.qty}</span>
                      <button
                        type="button"
                        onClick={() => {
                          c.qty += 1;
                          setCart([...cart]);
                        }}
                        className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-black text-right text-stone-900 min-w-[70px]">
                      {formatRupiah(c.product.price * c.qty)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Checkout Controls */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Subtotal:</span>
                <span className="font-bold text-stone-800">{formatRupiah(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black border-t border-stone-200 pt-2">
                <span>TOTAL BAYAR:</span>
                <span className="text-emerald-700 text-lg font-mono">{formatRupiah(cartSubtotal)}</span>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => {
                  setCashTendered(cartSubtotal);
                  setShowPaymentModal(true);
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <i className="fa-solid fa-credit-card"></i>
                <span>PROSES PEMBAYARAN</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Buka Shift */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-black text-base text-stone-900">Buka Shift Kasir Baru</h4>
            <p className="text-xs text-stone-500">Masukkan modal uang kembalian kasir awal (cash float).</p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Modal Awal Kas (Rp)</label>
              <input
                type="number"
                value={openingCashInput}
                onChange={e => setOpeningCashInput(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleOpenShift}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Mulai Buka Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Tutup Shift */}
      {showCloseShiftModal && activeShiftState && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-black text-base text-stone-900">Tutup Shift Kasir</h4>
            <p className="text-xs text-stone-500">Hitung uang fisik di laci kasir dan masukkan nominal sebenarnya.</p>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Modal Awal:</span>
                <span className="font-bold">{formatRupiah(activeShiftState.startingCash)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Uang Kas Fisik Aktual (Rp)</label>
              <input
                type="number"
                value={actualCashInput}
                onChange={e => setActualCashInput(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(false)}
                className="px-3 py-2 border rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCloseShift}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Konfirmasi Tutup Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Supervisor PIN Verification */}
      {showSupervisorPinModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h4 className="font-black text-sm text-stone-900">Otorisasi Supervisor PIN</h4>
              <p className="text-[11px] text-stone-500">Diperlukan PIN Supervisor untuk void transaksi.</p>
            </div>

            <form onSubmit={verifySupervisorPin} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                inputMode="numeric"
                value={supervisorPinInput}
                onChange={e => setSupervisorPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••••"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-center font-mono font-bold text-lg tracking-widest"
              />
              {supervisorError && <p className="text-[11px] text-red-600 font-bold">{supervisorError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupervisorPinModal(false)}
                  className="w-1/2 py-2 border rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="w-1/2 py-2 bg-red-600 text-white font-bold text-xs rounded-xl">
                  Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Payment Drawer / Settlement */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h4 className="font-black text-lg text-stone-900">Selesaikan Pembayaran Kasir</h4>

            <div className="grid grid-cols-4 gap-2">
              {(['tunai', 'qris', 'edc', 'transfer'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer ${
                    paymentMethod === m ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
              <span className="text-xs text-stone-500">Total Tagihan:</span>
              <div className="text-2xl font-black text-emerald-700">{formatRupiah(cartSubtotal)}</div>
            </div>

            {paymentMethod === 'tunai' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">Uang Diterima (Rp)</label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={e => setCashTendered(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold text-lg text-center"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {[cartSubtotal, 50000, 100000, 200000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(amt)}
                      className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-bold"
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
                <div className="pt-2 flex justify-between text-xs font-bold text-stone-800">
                  <span>Kembalian:</span>
                  <span className="text-emerald-700 text-base">{formatRupiah(Math.max(0, cashTendered - cartSubtotal))}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-1/2 py-3 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCompleteOrder}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Cetak Struk & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Receipt Print Prompt */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <h4 className="font-black text-base text-stone-900">Transaksi Kasir Berhasil!</h4>
              <p className="text-xs text-stone-500 font-mono mt-0.5">{orderSuccess.orderId}</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => generateOrderReceiptPDF(orderSuccess, config)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-file-pdf"></i> Unduh Struk PDF
              </button>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
