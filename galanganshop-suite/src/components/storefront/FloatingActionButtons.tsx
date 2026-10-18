import React, { useState } from 'react';
import { SiteConfig } from '../../types';

interface FloatingActionButtonsProps {
  config: SiteConfig;
  cartCount: number;
  onOpenWhatsApp: () => void;
  onOpenTracker: () => void;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  config,
  cartCount,
  onOpenWhatsApp,
  onOpenTracker
}) => {
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);

  const platforms: { name: string; url: string; icon: string; bgClass: string }[] = [];
  if (config.deliveryLinks.shopeefood) {
    platforms.push({ name: 'ShopeeFood', url: config.deliveryLinks.shopeefood, icon: 'fa-solid fa-bag-shopping', bgClass: 'bg-orange-500 hover:bg-orange-600' });
  }
  if (config.deliveryLinks.gofood) {
    platforms.push({ name: 'GoFood', url: config.deliveryLinks.gofood, icon: 'fa-solid fa-utensils', bgClass: 'bg-red-600 hover:bg-red-700' });
  }
  if (config.deliveryLinks.grabfood) {
    platforms.push({ name: 'GrabFood', url: config.deliveryLinks.grabfood, icon: 'fa-solid fa-motorcycle', bgClass: 'bg-emerald-600 hover:bg-emerald-700' });
  }

  return (
    <>
      {/* Floating Bottom-Left Action Button */}
      <aside aria-label="Aksi Cepat Lacak atau Platform" className="fixed bottom-4 sm:bottom-6 left-3 sm:left-6 z-40 pointer-events-auto flex flex-col gap-3 items-start">
        {config.showTrackerButton !== false ? (
          <button
            type="button"
            onClick={onOpenTracker}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white hover:bg-stone-50 text-orange-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-orange-500/20 hover:scale-110 active:scale-95 transition-all duration-200 group cursor-pointer"
            title="Lacak Pesanan Realtime"
          >
            <i className="fa-solid fa-satellite-dish text-xl sm:text-2xl group-hover:animate-pulse"></i>
          </button>
        ) : (
          <div className="flex flex-col gap-2.5 items-start">
            {showPlatformMenu && platforms.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-11 h-11 sm:w-12 sm:h-12 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 ring-2 ring-white/80 ${p.bgClass}`}
                title={`Pesan via ${p.name}`}
              >
                <i className={`${p.icon} text-base`}></i>
              </a>
            ))}

            <button
              type="button"
              onClick={() => setShowPlatformMenu(!showPlatformMenu)}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white hover:bg-stone-50 text-orange-600 rounded-full flex items-center justify-center shadow-2xl border-[3px] border-orange-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Pesan Online Platform Delivery"
            >
              <i className={`fa-solid ${showPlatformMenu ? 'fa-xmark text-lg' : 'fa-motorcycle text-xl'}`}></i>
            </button>
          </div>
        )}
      </aside>

      {/* Floating Bottom-Right WhatsApp Button */}
      <aside aria-label="Bantuan WhatsApp CS" className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={onOpenWhatsApp}
          className="group relative w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
          title="Chat WhatsApp Admin CS"
        >
          <i className="fa-brands fa-whatsapp text-2xl sm:text-3xl"></i>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
              {cartCount}
            </span>
          )}
        </button>
      </aside>
    </>
  );
};
