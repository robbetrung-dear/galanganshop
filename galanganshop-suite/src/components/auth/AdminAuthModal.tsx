import React, { useState } from 'react';
import { getAdminPassword, setAdminPassword } from '../../utils/storage';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = password.trim();

    if (trimmed.length < 8) {
      setError('Password harus minimal 8 karakter!');
      return;
    }
    if (!/[A-Z]/.test(trimmed) || !/[0-9]/.test(trimmed) || !/[a-zA-Z]/.test(trimmed)) {
      setError('Password harus terdiri dari kombinasi huruf, angka, dan minimal satu huruf kapital (A-Z)!');
      return;
    }

    const saved = getAdminPassword();
    if (trimmed !== saved) {
      setError('Password Master Admin salah! Periksa kembali huruf besar dan angka.');
      return;
    }

    setPassword('');
    onSuccess();
    onClose();
    onShowToast('Autentikasi Master Admin berhasil! Membuka Panel Kontrol.');
  };

  const handleSecretReset = () => {
    setAdminPassword('Dear2226');
    setPassword('Dear2226');
    onShowToast('Kunci Master Admin di-reset ke default.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <div className="text-center">
          <div
            onClick={handleSecretReset}
            className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-xl mb-3 shadow-inner cursor-pointer select-none active:scale-95 transition"
            title="Klik untuk reset kunci default"
          >
            <i className="fa-solid fa-lock"></i>
          </div>
          <h3 className="text-xl font-extrabold text-stone-900 font-serif">Akses Panel Master Admin</h3>
          <p className="text-xs text-stone-500 mt-1">
            Masukkan password otorisasi untuk membuka konfigurasi Storefront, POS Kasir, dan Akuntansi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Password Admin</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                className="w-full p-3 pr-10 rounded-xl border border-stone-300 text-sm bg-stone-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-[11px] space-y-1">
            <span className="font-bold text-stone-700 block text-[10px] uppercase">Standar Keamanan Password:</span>
            <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-600 font-semibold' : 'text-stone-400'}`}>
              <i className={password.length >= 8 ? 'fa-solid fa-check-circle' : 'fa-regular fa-circle'}></i>
              <span>Minimal 8 karakter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${/[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'text-emerald-600 font-semibold' : 'text-stone-400'}`}>
              <i className={/[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'fa-solid fa-check-circle' : 'fa-regular fa-circle'}></i>
              <span>Kombinasi huruf & angka</span>
            </div>
            <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-emerald-600 font-semibold' : 'text-stone-400'}`}>
              <i className={/[A-Z]/.test(password) ? 'fa-solid fa-check-circle' : 'fa-regular fa-circle'}></i>
              <span>Minimal satu huruf kapital (A-Z)</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <i className="fa-solid fa-key"></i>
            <span>Buka Panel Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
