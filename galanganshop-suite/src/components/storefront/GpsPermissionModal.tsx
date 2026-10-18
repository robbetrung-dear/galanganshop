import React from 'react';

interface GpsPermissionModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

export const GpsPermissionModal: React.FC<GpsPermissionModalProps> = ({
  isOpen,
  onConfirm,
  onReject
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-stone-200 text-center relative">
        <button
          onClick={onReject}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition cursor-pointer"
          aria-label="Tutup"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl mb-4 shadow-inner">
          <i className="fa-solid fa-location-dot animate-bounce"></i>
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-stone-900 mb-2 leading-snug">
          Permintaan Akses Lokasi Geografis
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
          Aplikasi meminta akses ke lokasi geografis perangkat Anda untuk mendeteksi alamat pengantaran dan menghitung estimasi ongkos kirim pesanan secara akurat. Apakah Anda ingin mengizinkan akses lokasi?
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReject}
            className="w-1/2 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
          >
            Tolak
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <i className="fa-solid fa-check"></i>
            <span>Izinkan Akses</span>
          </button>
        </div>
      </div>
    </div>
  );
};
