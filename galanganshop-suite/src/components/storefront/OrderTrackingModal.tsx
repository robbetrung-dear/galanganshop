import React, { useState } from 'react';
import { Order } from '../../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  recentOrders: Order[];
  onSelectRecentOrder: (order: Order) => void;
  onDownloadReceipt: (order: Order) => void;
  onSimulateStatus?: (status: string) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  activeOrder,
  recentOrders,
  onSelectRecentOrder,
  onDownloadReceipt,
  onSimulateStatus
}) => {
  const [searchId, setSearchId] = useState('');

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const getOrderStatusProgress = (status?: string) => {
    switch (status) {
      case 'Pending':
        return 20;
      case 'Dibayar':
        return 40;
      case 'Diproses':
        return 65;
      case 'Dikirim':
        return 85;
      case 'Selesai':
        return 100;
      default:
        return 15;
    }
  };

  const getOrderStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Dibayar':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Diproses':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Dikirim':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const handleSearch = () => {
    const match = recentOrders.find(o => o.orderId.toLowerCase() === searchId.trim().toLowerCase());
    if (match) {
      onSelectRecentOrder(match);
    } else {
      alert(`Pesanan dengan ID "${searchId}" tidak ditemukan di perangkat ini.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-xl mb-3 shadow-inner">
            <i className="fa-solid fa-satellite-dish"></i>
          </div>
          <h3 className="text-xl font-extrabold text-stone-900 font-serif">Lacak Pesanan Real-Time</h3>
          <p className="text-xs text-stone-500 mt-1">Status pemrosesan pesanan terintegrasi langsung dengan kasir.</p>
        </div>

        {/* Input Order ID Search */}
        <div className="mt-5 flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Masukkan No Order (misal: ORD-1726...)"
            className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none font-mono"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition cursor-pointer"
          >
            Lacak
          </button>
        </div>

        {/* Active Order Card */}
        {activeOrder ? (
          <div className="mt-6 bg-stone-50 rounded-2xl p-5 border border-stone-200">
            <div className="flex items-center justify-between text-xs mb-4">
              <div>
                <span className="text-stone-500 block">Nomor Order:</span>
                <span className="font-mono font-bold text-stone-800">{activeOrder.orderId}</span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block">Status:</span>
                <span className={`font-extrabold text-xs px-2.5 py-1 rounded-full border ${getOrderStatusColor(activeOrder.status)}`}>
                  {activeOrder.status}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative py-4">
              <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-stone-200">
                <div
                  style={{ width: `${getOrderStatusProgress(activeOrder.status)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-600 to-emerald-500 transition-all duration-700"
                ></div>
              </div>

              {/* Step labels */}
              <div className="flex justify-between text-[10px] font-bold text-stone-500 mt-3">
                <span className={['Pending', 'Dibayar', 'Diproses', 'Dikirim', 'Selesai'].includes(activeOrder.status) ? 'text-orange-600' : ''}>
                  1. Pending
                </span>
                <span className={['Dibayar', 'Diproses', 'Dikirim', 'Selesai'].includes(activeOrder.status) ? 'text-orange-600' : ''}>
                  2. Dibayar
                </span>
                <span className={['Diproses', 'Dikirim', 'Selesai'].includes(activeOrder.status) ? 'text-orange-600' : ''}>
                  3. Diproses
                </span>
                <span className={['Dikirim', 'Selesai'].includes(activeOrder.status) ? 'text-orange-600' : ''}>
                  4. Dikirim
                </span>
                <span className={activeOrder.status === 'Selesai' ? 'text-emerald-600' : ''}>5. Selesai</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span>
                Total Tagihan: <strong className="text-stone-900">{formatRupiah(activeOrder.totalAmount)}</strong>
              </span>
              <button
                type="button"
                onClick={() => onDownloadReceipt(activeOrder)}
                className="text-orange-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-file-pdf text-red-500"></i> Unduh Struk PDF
              </button>
            </div>

            {/* Tester simulation controls */}
            {onSimulateStatus && (
              <div className="mt-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <span className="font-bold block mb-1">🎮 Uji Demo Real-time Status:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Dibayar', 'Diproses', 'Dikirim', 'Selesai'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onSimulateStatus(st)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-amber-300 font-semibold text-[10px] cursor-pointer"
                    >
                      Set {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 text-center py-6 bg-stone-50 rounded-2xl border border-stone-200 text-stone-400 text-xs">
            <i className="fa-solid fa-receipt text-3xl mb-1 text-stone-300"></i>
            <p>Belum ada pesanan aktif yang sedang dilacak.</p>
          </div>
        )}

        {/* 5 Recent Orders List */}
        <div className="mt-6 border-t border-stone-200 pt-5 text-left">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-black text-stone-900 text-xs sm:text-sm flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-orange-600"></i>
              <span>Riwayat 5 Pesanan Terakhir</span>
            </h4>
            <span className="text-[10px] text-stone-500 font-medium">{recentOrders.length} Pesanan Tersimpan</span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-5 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs">
              Belum ada riwayat pesanan di perangkat ini.
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(hist => (
                <div
                  key={hist.orderId}
                  className="p-3 rounded-2xl border border-stone-200 bg-white hover:border-orange-300 transition flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-stone-900">{hist.orderId}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${getOrderStatusColor(hist.status)}`}>
                        {hist.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      <span>{new Date(hist.createdAt).toLocaleString('id-ID')}</span> •{' '}
                      <span className="font-bold text-stone-800">{formatRupiah(hist.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectRecentOrder(hist)}
                      className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Lacak
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadReceipt(hist)}
                      className="p-1.5 text-stone-500 hover:text-orange-600 border border-stone-200 rounded-lg cursor-pointer"
                      title="Cetak Struk PDF"
                    >
                      <i className="fa-solid fa-file-pdf text-red-500 text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
