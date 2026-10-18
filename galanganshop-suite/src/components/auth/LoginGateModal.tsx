import React, { useState } from 'react';
import { KasirAccount, KasirSession } from '../../types';

interface LoginGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAdminGate: () => void;
  onKasirLoginSuccess: (session: KasirSession) => void;
  kasirAccounts: KasirAccount[];
  activeKasirSession: KasirSession | null;
  onOpenPosTerminal: () => void;
}

export const LoginGateModal: React.FC<LoginGateModalProps> = ({
  isOpen,
  onClose,
  onSelectAdminGate,
  onKasirLoginSuccess,
  kasirAccounts,
  activeKasirSession,
  onOpenPosTerminal
}) => {
  const [view, setView] = useState<'choice' | 'kasir-form'>('choice');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKasirLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanUser) {
      setErrorMessage('Username kasir wajib diisi.');
      return;
    }
    if (!/^\d{6}$/.test(cleanPin)) {
      setErrorMessage('PIN kasir harus berupa 6 digit angka numerik.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const match = kasirAccounts.find(a => a.username.toLowerCase() === cleanUser);
      if (!match) {
        setErrorMessage(`Username kasir "${cleanUser}" tidak terdaftar.`);
        setLoading(false);
        return;
      }

      if (match.status === 'Non-Aktif') {
        setErrorMessage('Akun kasir ini sedang dinonaktifkan oleh Admin.');
        setLoading(false);
        return;
      }

      if (match.pin !== cleanPin) {
        setErrorMessage('PIN kasir salah. Periksa kembali 6 digit PIN Anda.');
        setLoading(false);
        return;
      }

      // Login success
      const session: KasirSession = {
        username: match.username,
        kasirName: match.name,
        role: match.role,
        shiftId: 'SHIFT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + match.username,
        loginAt: new Date().toISOString()
      };

      setLoading(false);
      onKasirLoginSuccess(session);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {view === 'choice' ? (
          <div className="space-y-6">
            <div className="text-center pt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 shadow-xs mb-3">
                <i className="fa-solid fa-store text-2xl"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Pilih Pintu Akses</h2>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Silakan pilih akses sesuai peran operasional Anda di GalanganShop Suite.
              </p>
            </div>

            {/* Active Cashier Notice */}
            {activeKasirSession && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                  <div className="truncate">
                    <p className="font-bold text-emerald-900 truncate">
                      Sesi: {activeKasirSession.kasirName || activeKasirSession.username}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-mono">{activeKasirSession.shiftId}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPosTerminal();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex-shrink-0"
                >
                  Buka Kasir
                </button>
              </div>
            )}

            {/* Two Portal Cards */}
            <div className="space-y-3.5">
              {/* Option A: Kasir Pintar */}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setView('kasir-form');
                }}
                className="w-full text-left p-5 min-h-[110px] rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/90 transition-all shadow-xs hover:shadow-md group flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                    <i className="fa-solid fa-cash-register"></i>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <i className="fa-solid fa-cart-shopping text-[9px]"></i>
                      <span>Point of Sale</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors">
                      Kasir Pintar POS
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">Untuk operator kasir & input transaksi</p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition shadow-2xs flex-shrink-0">
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </div>
              </button>

              {/* Option B: Panel Admin */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectAdminGate();
                }}
                className="w-full text-left p-5 min-h-[110px] rounded-2xl border-2 border-orange-200 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50/90 transition-all shadow-xs hover:shadow-md group flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <i className="fa-solid fa-gear text-[9px]"></i>
                      <span>Master Control</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-stone-900 group-hover:text-orange-700 transition-colors">
                      Panel Master Admin
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">Satu panel kontrol landing page, kasir & keuangan</p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white border border-orange-200 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition shadow-2xs flex-shrink-0">
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-stone-400">
              Akses terproteksi PIN Kasir & Master Password terenkripsi
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <button
                type="button"
                onClick={() => setView('choice')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-700 transition py-1 cursor-pointer"
              >
                <i className="fa-solid fa-arrow-left text-[11px]"></i>
                <span>Kembali pilih akses</span>
              </button>
            </div>

            <div className="flex items-center gap-3.5 pb-2 border-b border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md flex-shrink-0">
                <i className="fa-solid fa-cash-register"></i>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">Login Kasir Pintar</h3>
                <p className="text-xs text-stone-500">Masukkan Username & 6 Digit PIN Operator</p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2.5">
                <i className="fa-solid fa-circle-exclamation text-red-600 mt-0.5 flex-shrink-0"></i>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleKasirLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">Username Kasir</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Contoh: kasir / kasir1"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-stone-300 text-sm bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <i className="fa-solid fa-user text-xs"></i>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase">PIN Kasir (6 Digit Angka)</label>
                  <span className="text-[11px] text-stone-400 font-mono">{pin.length}/6 digit</span>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••••"
                    className="w-full h-12 pl-10 pr-11 rounded-xl border border-stone-300 text-base tracking-widest bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-mono font-bold"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <i className="fa-solid fa-key text-xs"></i>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <i className={`text-xs ${showPin ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}`}></i>
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-info text-[10px]"></i>
                  <span>
                    Akun default demo: <strong>kasir</strong> / PIN: <strong>123456</strong>
                  </span>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
                      <span>Memverifikasi Akses Kasir...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-cash-register text-sm"></i>
                      <span>MASUK KASIR</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
