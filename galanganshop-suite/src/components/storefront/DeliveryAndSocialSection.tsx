import React from 'react';
import { SiteConfig } from '../../types';

interface DeliveryAndSocialSectionProps {
  config: SiteConfig;
}

export const DeliveryAndSocialSection: React.FC<DeliveryAndSocialSectionProps> = ({ config }) => {
  return (
    <section className="mt-14">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-orange-600 font-extrabold text-xs uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200 inline-flex items-center gap-1.5">
            <i className="fa-solid fa-store"></i>
            <span>Mitra Resmi & Platform Online</span>
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-2.5">
            Pesan Juga Lewat Food Delivery Favorit Anda
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Lebih praktis pesan lewat aplikasi online? Kami telah bermitra resmi di ShopeeFood, GrabFood, dan GoFood dengan promo voucher diskon ongkir & cashback setiap hari.
          </p>
        </div>

        {/* 3 Delivery Apps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-5">
          {/* ShopeeFood */}
          <a
            href={config.deliveryLinks.shopeefood || 'https://shopee.co.id'}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-4 sm:p-5 rounded-2xl border-2 border-orange-100 hover:border-orange-500 bg-gradient-to-br from-orange-50/50 to-white hover:shadow-lg hover:shadow-orange-500/10 transition-all flex items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-orange-500/30 group-hover:scale-110 transition flex-shrink-0">
                <i className="fa-solid fa-bag-shopping"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <span className="font-black text-stone-900 text-sm sm:text-base leading-tight whitespace-nowrap">ShopeeFood</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap flex-shrink-0">Official</span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-1 leading-snug truncate">Voucher Diskon s.d 40% & Koin</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition flex-shrink-0 shadow-2xs">
              <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </div>
          </a>

          {/* GrabFood */}
          <a
            href={config.deliveryLinks.grabfood || 'https://food.grab.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-4 sm:p-5 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-emerald-500/30 group-hover:scale-110 transition flex-shrink-0">
                <i className="fa-solid fa-motorcycle"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <span className="font-black text-stone-900 text-sm sm:text-base leading-tight whitespace-nowrap">GrabFood</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap flex-shrink-0">Partner</span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-1 leading-snug truncate">Pengiriman Cepat & GrabUnlimited</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition flex-shrink-0 shadow-2xs">
              <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </div>
          </a>

          {/* GoFood */}
          <a
            href={config.deliveryLinks.gofood || 'https://gofood.co.id'}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-4 sm:p-5 rounded-2xl border-2 border-red-100 hover:border-red-500 bg-gradient-to-br from-red-50/50 to-white hover:shadow-lg hover:shadow-red-500/10 transition-all flex items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-red-500/30 group-hover:scale-110 transition flex-shrink-0">
                <i className="fa-solid fa-utensils"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <span className="font-black text-stone-900 text-sm sm:text-base leading-tight whitespace-nowrap">GoFood</span>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap flex-shrink-0">Super Partner</span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-1 leading-snug truncate">Promo GoPay Plus & Diskon Menu</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition flex-shrink-0 shadow-2xs">
              <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </div>
          </a>
        </div>

        {/* Official Social Media */}
        <div className="mt-8 pt-8 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <i className="fa-solid fa-hashtag text-orange-600"></i>
                <span>Ikuti Media Sosial Resmi Kami</span>
              </h4>
              <p className="text-xs text-stone-500">Tonton video produk, live cooking higienis, dan diskon flash sale!</p>
            </div>
            <span className="text-xs font-semibold text-stone-400">@galanganshop</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <a
              href={config.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50/70 to-rose-50/70 hover:border-pink-500 hover:shadow-md transition flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-lg shadow-sm">
                <i className="fa-brands fa-instagram"></i>
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-bold text-stone-900 truncate">Instagram</span>
                <span className="text-[11px] text-stone-500 block truncate">Lihat Foto & Reel Menu</span>
              </div>
            </a>

            <a
              href={config.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 hover:border-blue-500 hover:shadow-md transition flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
                <i className="fa-brands fa-facebook-f"></i>
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-bold text-stone-900 truncate">Facebook</span>
                <span className="text-[11px] text-stone-500 block truncate">Info Promo & Event Dapur</span>
              </div>
            </a>

            <a
              href={config.socialLinks.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-400 hover:shadow-md transition flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center text-lg shadow-sm">
                <i className="fa-brands fa-tiktok"></i>
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-bold text-stone-900 truncate">TikTok</span>
                <span className="text-[11px] text-stone-500 block truncate">Live Masak & Menu Viral</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
