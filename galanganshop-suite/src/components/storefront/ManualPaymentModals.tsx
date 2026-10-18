import React, { useEffect, useState } from 'react';
import { Order, SiteConfig } from '../../types';

interface ManualPaymentModalsProps {
  order: Order | null;
  config: SiteConfig;
  isOpenQris: boolean;
  onCloseQris: () => void;
  onConfirmQris: () => void;
  isOpenBank: boolean;
  onCloseBank: () => void;
  onConfirmBank: () => void;
  isOpenEwallet: boolean;
  onCloseEwallet: () => void;
  onConfirmEwallet: () => void;
  onShowToast: (msg: string) => void;
}

export const ManualPaymentModals: React.FC<ManualPaymentModalsProps> = ({
  order,
  config,
  isOpenQris,
  onCloseQris,
  onConfirmQris,
  isOpenBank,
  onCloseBank,
  onConfirmBank,
  isOpenEwallet,
  onCloseEwallet,
  onConfirmEwallet,
  onShowToast
}) => {
  const [qrisViewMode, setQrisViewMode] = useState<'dynamic' | 'static'>('dynamic');
  const [timerSeconds, setTimerSeconds] = useState<number>(900); // 15 mins

  useEffect(() => {
    let interval: any;
    if (isOpenQris) {
      setTimerSeconds(900);
      interval = setInterval(() => {
        setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpenQris]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const copyToClipboard = (text: string, msg: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onShowToast(msg);
    }
  };

  const total = order?.totalAmount || 0;
  const orderId = order?.orderId || 'DEMO';

  const dynamicQrisUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    `00020101021226680016ID.CO.QRIS.WWW01189360091100223126830215ID10200234567890303UMI51440014ID.LINKAJA.WWW0215ID10200234567890303UMI520458125303360540${total.toString().length}${total}5802ID5919GALANGAN+SHOP+SUITE6007JAKARTA61051219062140703A0108${orderId}6304`
  )}`;

  return (
    <>
      {/* 1. MODAL QRIS */}
      {isOpenQris && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 relative my-8">
            <button
              onClick={onCloseQris}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <i className="fa-solid fa-qrcode"></i>
                <span>QRIS Standar Bank Indonesia</span>
              </div>
              <h3 className="text-lg font-extrabold text-stone-900">Scan QRIS untuk Membayar</h3>
              <p className="text-xs text-stone-500 mt-0.5">Dukung semua aplikasi Mobile Banking & E-Wallet Nasional</p>
            </div>

            {/* Countdown timer */}
            <div className="mt-3.5 flex items-center justify-center gap-2 bg-stone-100 p-2.5 rounded-xl text-xs font-bold text-stone-700">
              <i className="fa-regular fa-clock text-orange-600"></i>
              <span>Selesaikan pembayaran dalam:</span>
              <span className="font-mono text-orange-700 font-extrabold text-sm">{formatTimer(timerSeconds)}</span>
            </div>

            {/* Switcher Static vs Dynamic */}
            {config.paymentConfig?.qrisType === 'both' && (
              <div className="mt-4 flex rounded-xl bg-stone-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setQrisViewMode('dynamic')}
                  className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer ${
                    qrisViewMode === 'dynamic' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  <i className="fa-solid fa-bolt text-[11px]"></i>
                  <span>QRIS Dinamis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrisViewMode('static')}
                  className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer ${
                    qrisViewMode === 'static' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  <i className="fa-solid fa-store text-[11px]"></i>
                  <span>QRIS Toko</span>
                </button>
              </div>
            )}

            {/* QR Code Container */}
            <div className="mt-4 p-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/40 to-white flex flex-col items-center">
              <div className="flex items-center justify-between w-full px-2 mb-2">
                <span className="font-black text-xs tracking-wider text-stone-800">QRIS</span>
                <span className="text-[10px] font-bold text-stone-400">GPN / ASPI</span>
              </div>

              <div className="bg-white p-2.5 rounded-2xl shadow-md border border-stone-200 w-full max-w-[240px] aspect-square flex items-center justify-center">
                {qrisViewMode === 'dynamic' ? (
                  <img src={dynamicQrisUrl} alt="QRIS Dinamis" className="w-full h-full object-contain" />
                ) : (
                  <img
                    src={config.paymentConfig?.qrisImage || dynamicQrisUrl}
                    alt="QRIS Toko"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="mt-3 text-center">
                <h4 className="font-extrabold text-xs text-stone-900 uppercase">
                  {config.paymentConfig?.qrisMerchantName || 'GALANGAN SHOP SUITE'}
                </h4>
                <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                  NMID: {config.paymentConfig?.qrisNmid || 'ID1020023456789'}
                </p>
              </div>
            </div>

            {/* Nominal */}
            <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Pembayaran:</span>
                <span className="font-extrabold text-emerald-600 text-base font-mono">{formatRupiah(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(total.toString(), 'Nominal berhasil disalin!')}
                className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-lg border border-stone-300 transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-regular fa-copy"></i>
                <span>Salin</span>
              </button>
            </div>

            <div className="mt-3 text-[11px] text-stone-500 space-y-1">
              <p className="font-bold text-stone-700 flex items-center gap-1">
                <i className="fa-solid fa-circle-info text-emerald-600"></i>
                <span>Cara Pembayaran:</span>
              </p>
              <p>{config.paymentConfig?.qrisInstructions}</p>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={onConfirmQris}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-circle-check"></i>
                <span>Saya Sudah Membayar (Verifikasi & Unduh Struk)</span>
              </button>
              <button
                type="button"
                onClick={onCloseQris}
                className="w-full py-2 text-stone-500 hover:text-stone-800 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL BANK TRANSFER */}
      {isOpenBank && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 relative my-8">
            <button
              onClick={onCloseBank}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
                <i className="fa-solid fa-building-columns"></i>
                <span>Transfer Bank Manual</span>
              </div>
              <h3 className="text-lg font-extrabold text-stone-900">Instruksi Transfer Bank</h3>
              <p className="text-xs text-stone-500 mt-0.5">Silakan lakukan transfer ke rekening resmi toko berikut</p>
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Bank Tujuan</span>
                <span className="text-sm font-extrabold text-blue-900 font-serif">
                  {config.paymentConfig?.bankName || 'BCA (Bank Central Asia)'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Nomor Rekening</span>
                  <span className="text-base font-extrabold text-stone-900 font-mono tracking-wider">
                    {config.paymentConfig?.bankAccountNumber || '8735-0982-11'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      config.paymentConfig?.bankAccountNumber || '8735-0982-11',
                      'Nomor rekening berhasil disalin!'
                    )
                  }
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-regular fa-copy"></i>
                  <span>Salin</span>
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Atas Nama Rekening</span>
                <span className="text-xs font-extrabold text-stone-800 uppercase">
                  {config.paymentConfig?.bankAccountHolder || 'GALANGAN SHOP RETAIL'}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Jumlah yang Ditransfer:</span>
                <span className="font-extrabold text-orange-600 text-base font-mono">{formatRupiah(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(total.toString(), 'Nominal transfer berhasil disalin!')}
                className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-lg border border-stone-300 transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-regular fa-copy"></i>
                <span>Salin</span>
              </button>
            </div>

            <div className="mt-3 text-[11px] text-stone-500 space-y-1">
              <p className="font-bold text-stone-700 flex items-center gap-1">
                <i className="fa-solid fa-circle-info text-blue-600"></i>
                <span>Catatan Penting:</span>
              </p>
              <p>{config.paymentConfig?.bankInstructions}</p>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={onConfirmBank}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-brands fa-whatsapp text-base"></i>
                <span>Konfirmasi & Kirim Bukti ke WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={onCloseBank}
                className="w-full py-2 text-stone-500 hover:text-stone-800 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL E-WALLET TRANSFER */}
      {isOpenEwallet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 relative my-8">
            <button
              onClick={onCloseEwallet}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
                <i className="fa-solid fa-mobile-screen-button"></i>
                <span>Transfer E-Wallet</span>
              </div>
              <h3 className="text-lg font-extrabold text-stone-900">Instruksi Pembayaran E-Wallet</h3>
              <p className="text-xs text-stone-500 mt-0.5">Transfer saldo ke nomor akun resmi kami</p>
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Pilihan Aplikasi</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">DANA</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-[10px] font-bold">ShopeePay</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">GoPay</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold">OVO</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">LinkAja</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Nomor E-Wallet Tujuan</span>
                <div className="flex items-center justify-between bg-white px-3 py-2 border border-indigo-100 rounded-xl">
                  <span className="text-base font-black tracking-wider font-mono text-stone-800">
                    {config.paymentConfig?.ewalletPhone || '0812-3456-7890'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        config.paymentConfig?.ewalletPhone || '0812-3456-7890',
                        'Nomor E-Wallet berhasil disalin!'
                      )
                    }
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold text-[10px] uppercase bg-indigo-100 px-2 py-1 rounded-md cursor-pointer"
                  >
                    <i className="fa-solid fa-copy"></i> Salin
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-stone-200 pt-4 flex items-center justify-between text-sm font-black">
              <span className="text-stone-500">Total Tagihan</span>
              <span className="text-indigo-600 text-xl font-mono">{formatRupiah(total)}</span>
            </div>

            <div className="mt-2 bg-stone-50 p-3 rounded-xl border border-stone-200 text-[11px] text-stone-600 text-center leading-relaxed">
              {config.paymentConfig?.ewalletInstructions}
            </div>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={onConfirmEwallet}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-check-circle"></i>
                <span>Konfirmasi & Kirim Bukti ke WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={onCloseEwallet}
                className="w-full py-2 text-stone-500 hover:text-stone-800 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
