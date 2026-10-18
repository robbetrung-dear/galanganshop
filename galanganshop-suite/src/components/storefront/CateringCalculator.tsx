import React, { useState } from 'react';
import { CateringPackage, CourierRate, SiteConfig } from '../../types';

interface CateringCalculatorProps {
  config: SiteConfig;
  packages: CateringPackage[];
  courierRates: CourierRate[];
  selectedCourier: CourierRate;
  onSelectCourier: (rate: CourierRate) => void;
  onAddCateringToCart: (pkg: CateringPackage, pax: number) => void;
  onDetectLocation: () => void;
  customerAddress: string;
  setCustomerAddress: (addr: string) => void;
}

export const CateringCalculator: React.FC<CateringCalculatorProps> = ({
  config,
  packages,
  courierRates,
  selectedCourier,
  onSelectCourier,
  onAddCateringToCart,
  onDetectLocation,
  customerAddress,
  setCustomerAddress
}) => {
  const [selectedPkg, setSelectedPkg] = useState<CateringPackage>(packages[1] || packages[0]);
  const [pax, setPax] = useState<number>(20);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const handleSelectPackage = (pkg: CateringPackage) => {
    setSelectedPkg(pkg);
    if (pax < pkg.minPax) {
      setPax(pkg.minPax);
    }
  };

  const subtotalCatering = pax * selectedPkg.pricePerPax;
  const estimatedWeightKg = Math.ceil(pax * 0.4);

  return (
    <div id="catering-section" className="space-y-12 py-6">
      {/* 3 Packages Cards */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-orange-600 font-extrabold text-xs uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            {config.cateringBadge || 'Pilihan Box Catering Dapur'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-2">
            {config.cateringTitle || 'Paket Catering Harian & Acara Spesial'}
          </h2>
          <p className="text-stone-600 text-sm mt-1">
            {config.cateringSubtitle || 'Pilihan box catering higienis untuk meeting, arisan, syukuran, dan ulang tahun. Minimum order 15 pax.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map(pkg => {
            const isSelected = selectedPkg.id === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition relative ${
                  isSelected
                    ? 'ring-2 ring-orange-600 border-orange-500 shadow-md bg-orange-50/20'
                    : 'border-stone-200 bg-white hover:border-orange-300'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                    PALING LARIS
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-xl text-stone-900">{pkg.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700">
                      Min {pkg.minPax} Pax
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="text-2xl sm:text-3xl font-black text-orange-700">
                      {formatRupiah(pkg.pricePerPax)}
                    </span>
                    <span className="text-xs text-stone-500 font-medium"> / pax (box)</span>
                  </div>

                  <p className="text-xs text-stone-600 mt-2">{pkg.description}</p>

                  <div className="mt-5 space-y-2 border-t border-stone-100 pt-4">
                    <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">Isi Dalam Box:</div>
                    <ul className="space-y-1.5 text-xs text-stone-600">
                      {pkg.items.map((menuItem, idx) => (
                        <li key={`pkg-item-${idx}`} className="flex items-start gap-2">
                          <i className="fa-solid fa-check text-emerald-600 mt-0.5 text-[11px]"></i>
                          <span>{menuItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className={`w-full py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer font-bold ${
                      isSelected
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    <i className={isSelected ? 'fa-solid fa-circle-check' : 'fa-solid fa-calculator'}></i>
                    <span>{isSelected ? 'Paket Terpilih (Hitung di Bawah)' : 'Pilih & Hitung Ongkir'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kalkulator & Tabel Horizontal 7 Kurir Berdampingan */}
      <div id="ongkir-calculator" className="bg-white rounded-3xl border border-stone-300 p-6 sm:p-8 shadow-xs">
        <div className="border-b border-stone-200 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
              <i className="fa-solid fa-truck-ramp-box"></i>
              <span>Kalkulasi Logistik Real-Time</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-serif mt-1">
              Kalkulator Catering & Perbandingan 7 Kurir Berdampingan
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Tabel horizontal menampilkan perbandingan estimasi tarif pengiriman dari 7 kurir seketika.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-500 block">Paket Aktif:</span>
            <span className="font-extrabold text-stone-800">
              {selectedPkg.name} ({formatRupiah(selectedPkg.pricePerPax)}/pax)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Pax & Alamat */}
          <div className="space-y-4 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">1. Jumlah Pax (Porsi Box)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPax(Math.max(selectedPkg.minPax, pax - 5))}
                  className="w-10 h-10 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={pax}
                  min={selectedPkg.minPax}
                  onChange={e => setPax(Math.max(selectedPkg.minPax, parseInt(e.target.value) || selectedPkg.minPax))}
                  className="flex-1 text-center font-black text-lg py-2 rounded-lg border border-stone-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setPax(pax + 5)}
                  className="w-10 h-10 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Estimasi berat total: <strong>{estimatedWeightKg} kg</strong> (~400gr/box)
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 uppercase">2. Alamat Pengiriman</label>
                <button
                  type="button"
                  onClick={onDetectLocation}
                  className="text-[11px] text-orange-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-location-crosshairs"></i>
                  <span>Deteksi Lokasi GPS</span>
                </button>
              </div>
              <textarea
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                rows={2}
                placeholder="Jl. Sudirman No. 45, Jakarta Selatan / Nama Gedung Kantor..."
                className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Subtotal */}
            <div className="pt-3 border-t border-stone-200">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Subtotal Box ({pax} pax):</span>
                <span className="font-bold text-stone-900">{formatRupiah(subtotalCatering)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600 mt-1">
                <span>Kurir Dipilih:</span>
                <span className="font-bold text-orange-600">
                  {selectedCourier.courier_name} ({formatRupiah(selectedCourier.price)})
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 mt-2 pt-2 border-t border-dashed border-stone-300">
                <span>Total Catering Makanan:</span>
                <span className="text-orange-700 font-black text-base">{formatRupiah(subtotalCatering)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAddCateringToCart(selectedPkg, pax)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-cart-plus"></i>
              <span>Masukkan Catering ke Form Pesanan</span>
            </button>
          </div>

          {/* Tabel Horizontal 7 Kurir Berdampingan */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-stone-700 tracking-wider">
                  Perbandingan Tarif 7 Kurir Real-Time
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                  <i className="fa-solid fa-check-circle"></i> Tarif Terhitung Otomatis
                </span>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl shadow-inner bg-white">
                <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-3">Kurir</th>
                      <th className="py-3 px-3">Layanan</th>
                      <th className="py-3 px-3">Estimasi Tiba</th>
                      <th className="py-3 px-3 text-right">Tarif Ongkir</th>
                      <th className="py-3 px-3 text-center">Pilih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {courierRates.map(cr => {
                      const isSelected = selectedCourier.courier_code === cr.courier_code;

                      return (
                        <tr
                          key={cr.courier_code}
                          onClick={() => onSelectCourier(cr)}
                          className={`transition cursor-pointer ${isSelected ? 'bg-orange-50/70 font-semibold' : 'hover:bg-stone-50'}`}
                        >
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs ${cr.badge_color}`}>
                                <i className={`fa-solid ${cr.icon}`}></i>
                              </span>
                              <span className="font-bold text-stone-900">{cr.courier_name}</span>
                              {cr.recommended && (
                                <span className="ml-1 text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                                  Rekomendasi
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-stone-600 whitespace-nowrap">{cr.courier_service_name}</td>
                          <td className="py-3 px-3 text-stone-500 whitespace-nowrap">
                            <i className="fa-regular fa-clock mr-1 text-stone-400"></i>
                            <span>{cr.estimated_etd}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-black text-orange-700 whitespace-nowrap text-sm">
                            {formatRupiah(cr.price)}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <input
                              type="radio"
                              name="courier_choice"
                              checked={isSelected}
                              onChange={() => onSelectCourier(cr)}
                              className="text-orange-600 focus:ring-orange-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-amber-600 text-base flex-shrink-0"></i>
              <span>
                Untuk makanan siap santap hangat, kami merekomendasikan kurir <strong>Instant (GoSend / GrabExpress)</strong> atau <strong>Ambil Sendiri</strong> agar kualitas makanan terjaga maksimal.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
