import React from 'react';
import { SiteConfig } from '../../types';

interface StorefrontFooterProps {
  config: SiteConfig;
  onOpenAdmin: () => void;
  onOpenAccounting: () => void;
  onOpenPosKasir: () => void;
}

export const StorefrontFooter: React.FC<StorefrontFooterProps> = ({
  config,
  onOpenAdmin,
  onOpenAccounting,
  onOpenPosKasir
}) => {
  const brandWords = config.brandWords && config.brandWords.length > 0
    ? config.brandWords
    : (config.brandName || 'GALANGAN SHOP').split(' ').map((w, idx) => ({
        text: w,
        color: ['#ea580c', '#f59e0b', '#e11d48', '#10b981'][idx % 4]
      }));

  const cleanPhone = (config.phone || '6281234567890').replace(/[^0-9]/g, '');

  return (
    <footer
      style={{
        backgroundColor: config.footerBgColor || '#1c1917',
        color: config.footerTextColor || '#a8a29e'
      }}
      className="py-12 border-t border-stone-800 text-xs transition-colors mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Description */}
        <div>
          <div className="flex items-center gap-2 font-black text-lg mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow overflow-hidden flex-shrink-0"
              style={{ backgroundColor: config.logoBgColor || '#ea580c' }}
            >
              {config.logoType === 'image' && config.logoImage ? (
                <img src={config.logoImage} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <i className={`${config.logoIcon || 'fa-solid fa-store'} text-sm`}></i>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 font-black text-lg flex-wrap">
              {brandWords.map((word, idx) => (
                <span key={`footer-word-${idx}`} style={{ color: word.color }}>
                  {word.text}
                </span>
              ))}
            </div>
          </div>

          <p className="text-stone-400 leading-relaxed">{config.footerDesc}</p>

          <div className="mt-4 flex items-center gap-3 text-stone-400">
            {config.socialLinks.instagram && (
              <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <i className="fa-brands fa-instagram text-base"></i>
              </a>
            )}
            {config.socialLinks.facebook && (
              <a href={config.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <i className="fa-brands fa-facebook-f text-base"></i>
              </a>
            )}
            {config.socialLinks.tiktok && (
              <a href={config.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                <i className="fa-brands fa-tiktok text-base"></i>
              </a>
            )}
          </div>
        </div>

        {/* Alamat Fisik */}
        <div>
          <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-1.5">
            <i className="fa-solid fa-location-dot text-orange-500"></i>
            <span>Alamat & Lokasi Toko</span>
          </h5>
          <p className="text-stone-300 leading-relaxed">{config.address}</p>
          <div className="mt-3 pt-3 border-t border-stone-800">
            <span className="text-stone-500 block text-[10px] uppercase font-bold">Hotline & Pemesanan:</span>
            <a
              href={`https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-semibold flex items-center gap-1 mt-1"
            >
              <i className="fa-brands fa-whatsapp"></i>
              <span>{config.phone}</span>
            </a>
          </div>
        </div>

        {/* Jam Operasional */}
        <div>
          <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-1.5">
            <i className="fa-solid fa-clock text-orange-500"></i>
            <span>Jam Operasional</span>
          </h5>
          <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700/60">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px] mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Buka Setiap Hari
            </span>
            <p className="text-stone-300">{config.operationalHours}</p>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">Menerima pembelian ritel langsung, catering kantor, & delivery online.</p>
        </div>

        {/* Akses Manajemen Suite */}
        <div>
          <h5 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Akses Manajemen Suite</h5>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onOpenPosKasir}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 font-bold border border-stone-700 transition w-full cursor-pointer text-left"
            >
              <i className="fa-solid fa-cash-register"></i>
              <span>Terminal Kasir POS</span>
            </button>
            <button
              type="button"
              onClick={onOpenAccounting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-blue-400 font-bold border border-stone-700 transition w-full cursor-pointer text-left"
            >
              <i className="fa-solid fa-scale-balanced"></i>
              <span>Buku Besar & Pembukuan</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-400 font-bold border border-stone-700 transition w-full cursor-pointer text-left"
            >
              <i className="fa-solid fa-lock"></i>
              <span>Panel Master Admin</span>
            </button>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">Kontrol terpadu multi produk, kasir, harga, banner hero, dan keuangan.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-stone-500">
        <div>
          &copy; {new Date().getFullYear()}{' '}
          <span className="font-bold text-stone-300">{config.brandName || 'GalanganShop Suite'}</span>.{' '}
          {config.footerCopyright || 'All Rights Reserved.'}
        </div>
        <div className="text-[11px] text-stone-600">
          All-in-One Retail & POS Modern Shop Suite
        </div>
      </div>
    </footer>
  );
};
