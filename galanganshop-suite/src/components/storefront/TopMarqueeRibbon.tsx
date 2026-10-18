import React from 'react';
import { SiteConfig } from '../../types';

interface TopMarqueeRibbonProps {
  config: SiteConfig;
}

export const TopMarqueeRibbon: React.FC<TopMarqueeRibbonProps> = ({ config }) => {
  return (
    <div
      className="text-xs py-2 overflow-hidden relative border-b border-stone-800 select-none z-30 transition-colors"
      style={{
        backgroundColor: config.promoRibbonBg || '#000000',
        color: config.promoRibbonTextColor || '#ffffff'
      }}
    >
      <div className="w-full overflow-hidden flex">
        <div className="animate-marquee-ribbon flex items-center gap-8 text-xs font-semibold tracking-wide">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(itemNum => (
            <div key={`marquee-${itemNum}`} className="inline-flex items-center gap-3">
              <span className="bg-orange-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-xs">
                {config.promoRibbonBadge || 'PROMO'}
              </span>
              <span className="font-extrabold text-amber-300 tracking-wider">
                {config.tagline || 'Ritel & Kuliner'}
              </span>
              <span className="text-stone-500 text-xs">•</span>
              {config.promoRibbon && (
                <span className="inline-flex items-center gap-3">
                  <span className="text-stone-200 font-medium">{config.promoRibbon}</span>
                  <span className="text-stone-500 text-xs">•</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
