import React from 'react';
import { CartItem, CourierRate, SiteConfig } from '../../types';

interface CheckoutSectionProps {
  config: SiteConfig;
  cart: CartItem[];
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerAddress: string;
  setCustomerAddress: (addr: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  isPickup: boolean;
  setIsPickup: (pickup: boolean) => void;
  selectedCourier: CourierRate;
  courierRates: CourierRate[];
  onSelectCourierCode: (code: string) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  onDetectLocation: () => void;
  onProceedCheckout: () => void;
  onOpenCart: () => void;
  isProcessing: boolean;
}

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  config,
  cart,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  orderNotes,
  setOrderNotes,
  isPickup,
  setIsPickup,
  selectedCourier,
  courierRates,
  onSelectCourierCode,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onDetectLocation,
  onProceedCheckout,
  onOpenCart,
  isProcessing
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const courierFee = isPickup ? 0 : selectedCourier.price;
  const grandTotal = cartSubtotal + courierFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Keranjang belanja Anda masih kosong!');
      return;
    }
    if (!customerName || !customerPhone) {
      alert('Mohon isi nama lengkap dan nomor WhatsApp Anda!');
      return;
    }
    if (!isPickup && !customerAddress) {
      alert('Mohon isi alamat pengiriman pesanan Anda!');
      return;
    }
    onProceedCheckout();
  };

  return (
    <section id="checkout-section" className="mt-14 bg-white rounded-3xl border border-stone-300 p-6 sm:p-10 shadow-xs">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 uppercase">
            Proses Checkout Cepat
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-2">
            Formulir Pesanan & Pembayaran Instan
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Mendukung QRIS Instan (GoPay, OVO, DANA, BCA, Livin), Transfer Bank Resmi & E-Wallet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Pemesan */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
            <h4 className="font-bold text-sm text-stone-800 flex items-center gap-2">
              <i className="fa-solid fa-user-check text-orange-600"></i>
              <span>1. Data Pemesan</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nomor WhatsApp Aktif *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Pickup vs Delivery Kurir Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => setIsPickup(true)}
                className={`py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  isPickup ? 'bg-white text-orange-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <i className="fa-solid fa-store"></i>
                <span>Ambil di Outlet (Pickup)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPickup(false)}
                className={`py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isPickup ? 'bg-white text-orange-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <i className="fa-solid fa-motorcycle"></i>
                <span>Dikirim Kurir</span>
              </button>
            </div>

            {isPickup ? (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 leading-snug space-y-1">
                <p className="font-extrabold flex items-center gap-1.5">
                  <i className="fa-solid fa-store"></i> Pickup Mandiri di Outlet
                </p>
                <p>
                  Pesanan akan disiapkan di outlet kami ({config.address}). Anda dapat mengambilnya setelah pembayaran terverifikasi.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700 uppercase">Alamat Pengiriman Lengkap *</label>
                    <button
                      type="button"
                      onClick={onDetectLocation}
                      className="text-[11px] text-orange-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-location-crosshairs"></i>
                      <span>Gunakan Lokasi GPS Saya</span>
                    </button>
                  </div>
                  <textarea
                    required
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    rows={2}
                    placeholder="Nama Jalan, No. Rumah, RT/RW, Patokan atau Gedung Kantor..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Pilih Kurir Pengiriman *</label>
                  <select
                    value={selectedCourier.courier_code}
                    onChange={e => onSelectCourierCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-stone-800"
                  >
                    {courierRates
                      .filter(cr => cr.courier_code !== 'pickup')
                      .map(cr => (
                        <option key={cr.courier_code} value={cr.courier_code}>
                          {cr.courier_name} - {cr.courier_service_name} ({formatRupiah(cr.price)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Catatan Tambahan (Opsional)</label>
              <input
                type="text"
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                placeholder="Contoh: Titip di pos satpam, sambal dipisah, packaging rapat..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rincian Pesanan */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
            <h4 className="font-bold text-sm text-stone-800 flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-receipt text-orange-600"></i>
                <span>2. Rincian Pesanan Anda</span>
              </span>
              <button type="button" onClick={onOpenCart} className="text-xs text-orange-600 font-bold hover:underline cursor-pointer">
                Edit Keranjang
              </button>
            </h4>

            {cart.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs">
                <i className="fa-solid fa-basket-shopping text-3xl mb-2 text-stone-300"></i>
                <p>Keranjang belanja masih kosong. Silakan pilih produk di atas.</p>
              </div>
            ) : (
              <div className="space-y-2 divide-y divide-stone-200">
                {cart.map(cItem => (
                  <div key={cItem.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-800">{cItem.name}</span>
                      <span className="text-stone-500 ml-1">x{cItem.quantity}</span>
                      {cItem.isCatering && (
                        <span className="ml-1 text-[10px] bg-orange-100 text-orange-800 px-1 rounded font-bold">
                          Catering Box
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-stone-900">{formatRupiah(cItem.price * cItem.quantity)}</div>
                  </div>
                ))}

                <div className="pt-3 flex items-center justify-between text-xs text-stone-600">
                  <span>Subtotal Belanja:</span>
                  <span className="font-semibold text-stone-900">{formatRupiah(cartSubtotal)}</span>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-stone-500 italic">
                  <span>Estimasi Ongkir ({isPickup ? 'Ambil Sendiri' : selectedCourier.courier_name}):</span>
                  <span className="font-semibold text-stone-800">
                    {isPickup ? 'Gratis (Rp0)' : formatRupiah(courierFee)}
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between text-sm sm:text-base font-extrabold text-stone-900 mt-2 border-t border-stone-200">
                  <span>Total Tagihan:</span>
                  <span className="text-orange-700 text-lg sm:text-xl font-black">{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Metode Pembayaran */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-800 flex items-center gap-2">
                <i className="fa-solid fa-wallet text-orange-600"></i>
                <span>3. Pilihan Metode Pembayaran</span>
              </h4>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Bebas Biaya Admin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Opsi 1: QRIS */}
              <div
                onClick={() => setSelectedPaymentMethod('qris')}
                className={`p-3.5 rounded-xl cursor-pointer transition flex flex-col justify-between ${
                  selectedPaymentMethod === 'qris'
                    ? 'border-2 border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border border-stone-300 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-qrcode text-emerald-600 text-base"></i>
                    <span>QRIS Instan</span>
                  </span>
                  <i
                    className={`fa-solid fa-circle-check text-base ${
                      selectedPaymentMethod === 'qris' ? 'text-emerald-600' : 'text-stone-300'
                    }`}
                  ></i>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Scan via GoPay, OVO, DANA, BCA, Mandiri, LinkAja & ShopeePay.
                </p>
                <span className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 py-0.5 px-2 rounded-md self-start">
                  Rekomendasi Cepat
                </span>
              </div>

              {/* Opsi 2: E-Wallet */}
              <div
                onClick={() => setSelectedPaymentMethod('ewallet_transfer')}
                className={`p-3.5 rounded-xl cursor-pointer transition flex flex-col justify-between ${
                  selectedPaymentMethod === 'ewallet_transfer'
                    ? 'border-2 border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                    : 'border border-stone-300 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-mobile-screen-button text-indigo-600 text-base"></i>
                    <span>Transfer E-Wallet</span>
                  </span>
                  <i
                    className={`fa-solid fa-circle-check text-base ${
                      selectedPaymentMethod === 'ewallet_transfer' ? 'text-indigo-600' : 'text-stone-300'
                    }`}
                  ></i>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Transfer manual DANA, ShopeePay, GoPay, OVO, atau LinkAja.
                </p>
                <span className="mt-2 text-[10px] font-bold text-indigo-700 bg-indigo-100/70 py-0.5 px-2 rounded-md self-start">
                  Konfirmasi WA
                </span>
              </div>

              {/* Opsi 3: Bank Transfer */}
              <div
                onClick={() => setSelectedPaymentMethod('bank_transfer')}
                className={`p-3.5 rounded-xl cursor-pointer transition flex flex-col justify-between ${
                  selectedPaymentMethod === 'bank_transfer'
                    ? 'border-2 border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border border-stone-300 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-building-columns text-blue-600 text-base"></i>
                    <span>Transfer Bank</span>
                  </span>
                  <i
                    className={`fa-solid fa-circle-check text-base ${
                      selectedPaymentMethod === 'bank_transfer' ? 'text-blue-600' : 'text-stone-300'
                    }`}
                  ></i>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Transfer manual ke rekening resmi {config.paymentConfig?.bankName || 'BCA'}.
                </p>
                <span className="mt-2 text-[10px] font-bold text-blue-700 bg-blue-100/70 py-0.5 px-2 rounded-md self-start">
                  Konfirmasi WA
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing || cart.length === 0}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-orange-500/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Menyiapkan Pembayaran...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <i className={selectedPaymentMethod === 'qris' ? 'fa-solid fa-qrcode' : 'fa-solid fa-shield-halved'}></i>
                  <span>
                    Bayar Sekarang ({formatRupiah(grandTotal)})
                  </span>
                </span>
              )}
            </button>
            <p className="text-[11px] text-center text-stone-500 mt-2">
              <i className="fa-solid fa-lock mr-1 text-emerald-600"></i> Transaksi terenkripsi 256-bit SSL. Struk pesanan PDF otomatis terunduh setelah pembayaran.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};
