import React, { useRef } from 'react';
import { Category } from '../../types';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  getCategoryCount: (id: string) => number;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  getCategoryCount
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => scroll(-220)}
        className="flex-shrink-0 w-9 h-9 rounded-xl bg-white hover:bg-stone-100 active:scale-95 border border-stone-300 text-stone-600 hover:text-orange-600 shadow-xs flex items-center justify-center transition cursor-pointer"
        title="Geser kategori ke kiri"
        aria-label="Geser kategori ke kiri"
      >
        <i className="fa-solid fa-chevron-left text-xs"></i>
      </button>

      {/* Scrollable Categories List */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth flex-1"
      >
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 font-medium shadow-xs'
              }`}
            >
              {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:image')) ? (
                <img src={cat.icon} alt={cat.name} className="w-4 h-4 object-contain rounded flex-shrink-0" />
              ) : (
                <i className={`${cat.icon && cat.icon.includes(' ') ? cat.icon : `fa-solid ${cat.icon || 'fa-tag'}`} text-xs`}></i>
              )}
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => scroll(220)}
        className="flex-shrink-0 w-9 h-9 rounded-xl bg-white hover:bg-stone-100 active:scale-95 border border-stone-300 text-stone-600 hover:text-orange-600 shadow-xs flex items-center justify-center transition cursor-pointer"
        title="Geser kategori ke kanan"
        aria-label="Geser kategori ke kanan"
      >
        <i className="fa-solid fa-chevron-right text-xs"></i>
      </button>
    </div>
  );
};
