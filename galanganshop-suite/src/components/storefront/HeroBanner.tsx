import React from 'react';
import { SiteConfig } from '../../types';

interface HeroBannerProps {
  config: SiteConfig;
  hideHeroBanner: boolean;
  setHideHeroBanner: (hide: boolean) => void;
  onOrderClick: () => void;
  onCateringClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  config,
  hideHeroBanner,
  setHideHeroBanner,
  onOrderClick,
  onCateringClick
}) => {
  if (config.hideHeroBannerPermanently) return null;

  return (
    <>
      {/* Ephemeral Checkbox Bar Hide Banner */}
      <div className="bg-stone-100 border-b border-stone-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-stone-600 hover:text-stone-900 transition">
            <span>Hide Banner</span>
            <input
              type="checkbox"
              checked={hideHeroBanner}
              onChange={e => {
                setHideHeroBanner(e.target.checked);
                if (e.target.checked) {
                  const el = document.getElementById('tab-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 focus:ring-2 cursor-pointer border-stone-300"
            />
            <i className={`text-[10px] ${hideHeroBanner ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}`}></i>
          </label>
        </div>
      </div>

      {!hideHeroBanner && (
        <section
          className="relative text-white overflow-hidden py-14 sm:py-20 transition-colors bg-stone-950"
          style={{ backgroundColor: config.heroOverlayColor || '#0c0a09' }}
        >
          {/* Background Graphic Image */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={config.heroImage}
              alt="Storefront Hero"
              className="w-full h-full object-cover scale-105"
              style={{ opacity: config.heroImageOpacity !== undefined ? config.heroImageOpacity : 0.65 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/65 to-stone-900/35"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold mb-4">
                <i className="fa-solid fa-fire text-orange-400"></i>
                <span>{config.heroBadge || 'Solusi Ritel Cerdas & Kuliner'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif leading-tight sm:leading-none">
                <span>{config.heroTitle1}</span> <br />
                <span style={{ color: config.heroTitle2Color || '#fb923c' }}>{config.heroTitle2}</span>
              </h1>

              <p className="mt-4 sm:mt-6 text-stone-300 text-base sm:text-lg leading-relaxed">
                {config.heroDescription}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 items-center">
                <button
                  type="button"
                  onClick={onOrderClick}
                  style={{
                    backgroundColor: config.heroBtn1Bg || '#ea580c',
                    color: config.heroBtn1TextColor || '#ffffff'
                  }}
                  className="h-12 sm:h-[52px] px-5 sm:px-6 rounded-xl border border-transparent font-bold text-sm sm:text-base shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                  <span>{config.heroBtn1 || 'Beli Sekarang'}</span>
                </button>

                {/* Promo button */}
                <button
                  type="button"
                  onClick={onOrderClick}
                  className="h-12 sm:h-[52px] px-5 sm:px-6 rounded-xl border border-amber-300 font-bold text-sm sm:text-base bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 group active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <span className="bg-stone-950 text-amber-300 text-[10px] uppercase font-black px-2 py-1 rounded-md tracking-wider leading-none inline-flex items-center">
                    {config.promoRibbonBadge || 'PROMO'}
                  </span>
                  <span className="whitespace-nowrap">{config.promoRibbonLinkText || 'Cek Semua Promo!'}</span>
                  <i className="fa-solid fa-tag text-xs transition-transform group-hover:scale-125"></i>
                </button>

                <button
                  type="button"
                  onClick={onCateringClick}
                  style={{
                    backgroundColor: config.heroBtn2Bg || '#292524',
                    color: config.heroBtn2TextColor || '#ffffff'
                  }}
                  className="h-12 sm:h-[52px] px-5 sm:px-6 rounded-xl border border-stone-600 font-bold text-sm sm:text-base backdrop-blur-sm transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <i className="fa-solid fa-boxes-packing text-orange-400"></i>
                  <span>{config.heroBtn2 || 'Order Catering / Grosir'}</span>
                </button>

                <div className="flex items-center gap-3 ml-1 sm:ml-2 text-stone-400 text-xs font-medium">
                  <div className="flex -space-x-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-stone-800">
                      4.9★
                    </span>
                    <span className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-stone-800">
                      <i className="fa-solid fa-shield-halved"></i>
                    </span>
                  </div>
                  <span>{config.heroProofBadge || '2.500+ Pesanan Puas'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
