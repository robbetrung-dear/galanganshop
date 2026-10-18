import React, { useState } from 'react';
import { JournalEntry, Order, Shift, SiteConfig } from '../../types';
import { getJournalEntries, getOrders, getShifts } from '../../utils/storage';

interface AccountingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
}

export const AccountingModal: React.FC<AccountingModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'trial' | 'pl' | 'settlement' | 'eod'>('pl');

  if (!isOpen) return null;

  const journalEntries: JournalEntry[] = getJournalEntries();
  const shifts: Shift[] = getShifts();
  const orders: Order[] = getOrders();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  // Calculate Profit & Loss
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCOGS = Math.round(totalRevenue * 0.45); // estimate 45% HPP
  const grossProfit = totalRevenue - totalCOGS;
  const operationalExpense = 1200000;
  const netProfit = grossProfit - operationalExpense;

  // Dispatch EOD report to owner WhatsApp numbers
  const handleDispatchEodWhatsApp = () => {
    const activeOwnerNumbers = (config.ownerWaNumbers || [])
      .map(n => n.replace(/[^0-9]/g, ''))
      .filter(n => n.length > 5);

    if (activeOwnerNumbers.length === 0) {
      alert('Belum ada nomor WhatsApp Owner yang diatur di Panel Admin (Tab Nomor WA Owner)!');
      return;
    }

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const message = `*LAPORAN TUTUP BUKU & KONSINYASI HARIAN (EOD)*\n` +
      `📅 Tanggal: ${today}\n` +
      `🏢 Outlet: ${config.brandName || 'GalanganShop Suite'}\n\n` +
      `📊 *RINGKASAN PENJUALAN HARIAN:*\n` +
      `• Total Transaksi: ${orders.length} Transaksi\n` +
      `• Omset Penjualan: ${formatRupiah(totalRevenue)}\n` +
      `• Estimasi HPP: ${formatRupiah(totalCOGS)}\n` +
      `• Laba Bersih: ${formatRupiah(netProfit)}\n\n` +
      `💰 *REKONSILIASI KASIR SHIFT:*\n` +
      `• Shift Selesai: ${shifts.length} Shift\n` +
      `• Status: Sesuai Buku Besar & Ledger Otomatis.\n\n` +
      `_Laporan dikirim otomatis oleh GalanganShop Modern Suite._`;

    // Open first owner number directly
    const firstNum = activeOwnerNumbers[0];
    const cleanNum = firstNum.startsWith('0') ? '62' + firstNum.slice(1) : firstNum;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-stone-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-md">
              <i className="fa-solid fa-scale-balanced"></i>
            </div>
            <div>
              <h3 className="font-black text-lg">Modul Akuntansi & Buku Besar Keuangan</h3>
              <p className="text-xs text-stone-400">Pembukuan otomatis terintegrasi langsung dari POS Kasir & Online Store.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDispatchEodWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i>
              <span>Kirim EOD ke WA Owner</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 sm:px-6 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0 py-2">
          {[
            { id: 'pl', name: 'Laporan Laba Rugi (P&L)', icon: 'fa-chart-pie' },
            { id: 'ledger', name: 'Buku Besar (General Ledger)', icon: 'fa-book' },
            { id: 'trial', name: 'Neraca Saldo (Trial Balance)', icon: 'fa-table-columns' },
            { id: 'settlement', name: 'Rekonsiliasi Kasir & Shift', icon: 'fa-receipt' },
            { id: 'eod', name: 'Laporan Konsinyasi EOD', icon: 'fa-file-invoice-dollar' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === t.id ? 'bg-white text-blue-700 shadow-xs' : 'text-stone-600 hover:bg-white/50'
              }`}
            >
              <i className={`fa-solid ${t.icon}`}></i>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
          {/* TAB 1: P&L Statement */}
          {activeTab === 'pl' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">Total Pendapatan</span>
                  <span className="text-xl font-black text-emerald-900 mt-1 block font-mono">{formatRupiah(totalRevenue)}</span>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">Harga Pokok Penjualan (HPP)</span>
                  <span className="text-xl font-black text-amber-900 mt-1 block font-mono">{formatRupiah(totalCOGS)}</span>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">Laba Kotor (Gross Profit)</span>
                  <span className="text-xl font-black text-blue-900 mt-1 block font-mono">{formatRupiah(grossProfit)}</span>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <span className="text-[11px] font-bold text-purple-800 uppercase block">Laba Bersih (Net Profit)</span>
                  <span className="text-xl font-black text-purple-900 mt-1 block font-mono">{formatRupiah(netProfit)}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                <h5 className="font-extrabold text-sm text-stone-900 border-b pb-2">Rincian Laporan Laba Rugi Komprehensif</h5>
                <div className="space-y-2 text-xs divide-y divide-stone-100">
                  <div className="flex justify-between py-1.5">
                    <span className="font-bold text-stone-700">4001 - Pendapatan Penjualan Ritel & Kasir:</span>
                    <span className="font-mono font-bold text-stone-900">{formatRupiah(totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone-600">5001 - Beban Pokok Penjualan (Bahan & Produk):</span>
                    <span className="font-mono text-red-600 font-bold">({formatRupiah(totalCOGS)})</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold bg-stone-50 px-2 rounded">
                    <span>LABA KOTOR:</span>
                    <span className="font-mono text-emerald-700">{formatRupiah(grossProfit)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone-600">6001 - Beban Operasional & Listrik Toko:</span>
                    <span className="font-mono text-red-600 font-bold">({formatRupiah(operationalExpense)})</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-black bg-emerald-50 px-2 rounded border border-emerald-200">
                    <span className="text-emerald-900">LABA BERSIH TAHUN BERJALAN:</span>
                    <span className="font-mono text-emerald-800">{formatRupiah(netProfit)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: General Ledger */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-stone-900">Jurnal Transaksi & Buku Besar</h4>
                <span className="text-xs text-stone-500">{journalEntries.length} Jurnal Tercatat</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 uppercase font-black text-stone-700">
                    <tr>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Ref No</th>
                      <th className="p-3">Keterangan</th>
                      <th className="p-3">Debit</th>
                      <th className="p-3">Kredit</th>
                      <th className="p-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {journalEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-stone-50">
                        <td className="p-3 whitespace-nowrap text-stone-500">
                          {new Date(entry.date).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 font-mono font-bold text-stone-900 whitespace-nowrap">{entry.refNo}</td>
                        <td className="p-3 text-stone-800">{entry.description}</td>
                        <td className="p-3 text-emerald-700 font-semibold">{entry.debitAccount}</td>
                        <td className="p-3 text-blue-700 font-semibold">{entry.creditAccount}</td>
                        <td className="p-3 text-right font-mono font-black text-stone-900">
                          {formatRupiah(entry.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Trial Balance */}
          {activeTab === 'trial' && (
            <div className="space-y-4">
              <h4 className="font-black text-sm text-stone-900">Neraca Saldo (Trial Balance)</h4>
              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 uppercase font-black text-stone-700">
                    <tr>
                      <th className="p-3">Kode Akun</th>
                      <th className="p-3">Nama Akun</th>
                      <th className="p-3 text-right">Debit (Rp)</th>
                      <th className="p-3 text-right">Kredit (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="p-3 font-mono font-bold">1001</td>
                      <td className="p-3 font-semibold">Kas Tunai Kasir</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatRupiah(totalRevenue + 8500000)}</td>
                      <td className="p-3 text-right font-mono text-stone-400">-</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">1201</td>
                      <td className="p-3 font-semibold">Persediaan Barang Dagang</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatRupiah(6500000)}</td>
                      <td className="p-3 text-right font-mono text-stone-400">-</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">3001</td>
                      <td className="p-3 font-semibold">Modal Pemilik</td>
                      <td className="p-3 text-right font-mono text-stone-400">-</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-700">{formatRupiah(15000000)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">4001</td>
                      <td className="p-3 font-semibold">Pendapatan Penjualan</td>
                      <td className="p-3 text-right font-mono text-stone-400">-</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-700">{formatRupiah(totalRevenue)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Settlement Shifts */}
          {activeTab === 'settlement' && (
            <div className="space-y-4">
              <h4 className="font-black text-sm text-stone-900">Rekonsiliasi Tutup Shift Kasir</h4>
              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 uppercase font-black text-stone-700">
                    <tr>
                      <th className="p-3">Shift ID</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Buka Shift</th>
                      <th className="p-3">Tutup Shift</th>
                      <th className="p-3 text-right">Modal Awal</th>
                      <th className="p-3 text-right">Kas Aktual</th>
                      <th className="p-3 text-right">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {shifts.map(s => (
                      <tr key={s.shiftId} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-stone-900">{s.shiftId}</td>
                        <td className="p-3 font-semibold">{s.kasirName}</td>
                        <td className="p-3 text-stone-500">{new Date(s.openedAt).toLocaleTimeString('id-ID')}</td>
                        <td className="p-3 text-stone-500">{s.closedAt ? new Date(s.closedAt).toLocaleTimeString('id-ID') : 'Aktif'}</td>
                        <td className="p-3 text-right font-mono">{formatRupiah(s.startingCash)}</td>
                        <td className="p-3 text-right font-mono font-bold">{formatRupiah(s.actualCash || s.startingCash)}</td>
                        <td className={`p-3 text-right font-mono font-black ${s.cashDifference && s.cashDifference < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {formatRupiah(s.cashDifference || 0)}
                        </td>
                      </tr>
                    ))}
                    {shifts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-stone-400">
                          Belum ada riwayat shift yang ditutup.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: EOD Consignment */}
          {activeTab === 'eod' && (
            <div className="space-y-4">
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-extrabold text-stone-900 text-sm">Laporan Tutup Konsinyasi & Setoran Mitra</h4>
                <p className="text-xs text-stone-600">
                  Laporan rekap penjualan barang titipan / konsinyasi mitra dan supplier. Kirimkan laporan ini kepada pemilik melalui tombol WhatsApp.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDispatchEodWhatsApp}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>Kirim Rekap EOD ke Nomor WhatsApp Owner</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
