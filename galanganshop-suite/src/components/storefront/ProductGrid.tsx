import React from 'react';
import { InventoryItem, Product, SiteConfig } from '../../types';

interface ProductGridProps {
  products: Product[];
  inventory: InventoryItem[];
  viewMode: 'large' | 'compact' | 'list';
  onCycleViewMode: () => void;
  config: SiteConfig;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onOpenEditModal?: (product: Product) => void;
  isAdminLoggedIn: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalFilteredCount: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  inventory,
  viewMode,
  onCycleViewMode,
  config,
  onAddToCart,
  onSelectProduct,
  onOpenEditModal,
  isAdminLoggedIn,
  currentPage,
  setCurrentPage,
  totalPages,
  totalFilteredCount
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const getStockInfo = (item: Product) => {
    if (typeof item.stock === 'number') {
      return item.stock;
    }
    if (item.linkedInventory) {
      const inv = inventory.find(i => i.id === item.linkedInventory);
      if (inv) return inv.stock;
    }
    return 20; // default in-stock estimate
  };

  return (
    <div className="space-y-6">
      {/* Header of Menu Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h3 className="font-extrabold text-xl sm:text-2xl text-stone-900">
            {config.menuSectionTitle || 'Katalog Produk & Menu'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {config.menuSectionSubtitle || 'Pilihan produk kebutuhan harian, sembako, dan menu siap santap lezat.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs text-stone-500">
            Menampilkan <span className="font-bold text-stone-800">{products.length}</span> dari{' '}
            <span className="font-bold text-stone-800">{totalFilteredCount}</span> produk
            {config.menuItemsPerPage > 0 && totalPages > 1 && (
              <span className="text-stone-400"> (Hal. {currentPage}/{totalPages})</span>
            )}
          </div>

          {/* Switcher Layout View Mode */}
          <button
            type="button"
            onClick={onCycleViewMode}
            className="h-10 w-10 rounded-xl bg-white hover:bg-stone-50 active:scale-95 border border-stone-300 shadow-xs flex items-center justify-center text-stone-700 hover:text-orange-600 transition cursor-pointer"
            title={
              viewMode === 'list'
                ? 'Tampilan Daftar/List (Klik untuk Card Besar)'
                : viewMode === 'large'
                ? 'Tampilan Card Besar (Klik untuk Card Kecil)'
                : 'Tampilan Card Kecil (Klik untuk Daftar/List)'
            }
          >
            {viewMode === 'list' && <i className="fa-solid fa-bars text-base text-orange-600"></i>}
            {viewMode === 'large' && <i className="fa-regular fa-square text-base text-stone-700"></i>}
            {viewMode === 'compact' && <i className="fa-solid fa-border-all text-base text-stone-700"></i>}
          </button>
        </div>
      </div>

      {/* Mode 1: Large Cards */}
      {viewMode === 'large' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(item => {
            const stock = getStockInfo(item);
            const isSoldOut = stock <= 0;

            return (
              <div
                key={`large-${item.id}`}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group relative"
              >
                <div className="relative cursor-pointer overflow-hidden" onClick={() => onSelectProduct(item)}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />

                  {/* Top Right Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                    {item.badge && (
                      <span className={`px-2.5 py-1 text-[11px] font-extrabold uppercase rounded-lg shadow-xs ${item.badgeColor || 'bg-orange-600 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-red-600 text-white rounded shadow-xs">
                        HEMAT {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-900/80 text-white rounded backdrop-blur-sm">
                      {item.categoryLabel || item.category}
                    </span>
                  </div>

                  {/* Stock Indicator */}
                  {config.showMenuStockOnMain && (
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-black shadow-xs border rounded-full ${
                          isSoldOut
                            ? 'bg-red-600 text-white border-red-400'
                            : 'bg-white/95 backdrop-blur-sm text-stone-800 border-stone-200'
                        }`}
                      >
                        {isSoldOut ? 'Sold Out' : `Stok: ${stock} ${item.unit || ''}`}
                      </span>
                    </div>
                  )}

                  {/* Spicy Badge */}
                  {item.isSpicy && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-0.5 rounded-lg shadow-sm">
                        <i className="fa-solid fa-pepper-hot text-amber-300 text-xs"></i>
                        <span className="text-[10px] font-black uppercase">Pedas</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => onSelectProduct(item)}
                        className="font-bold text-stone-900 text-base group-hover:text-orange-600 transition cursor-pointer line-clamp-1"
                      >
                        {item.name}
                      </h4>
                      {isAdminLoggedIn && onOpenEditModal && (
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(item)}
                          className="text-stone-400 hover:text-orange-600 p-1 rounded hover:bg-stone-100"
                          title="Edit Produk"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">Harga</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-orange-700 text-base sm:text-lg">
                          {formatRupiah(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="line-through text-stone-400 text-xs">{formatRupiah(item.originalPrice)}</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToCart(item)}
                      disabled={isSoldOut}
                      className={`font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isSoldOut
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      <i className="fa-solid fa-plus text-xs"></i>
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: Compact Cards (2 Columns on Mobile) */}
      {viewMode === 'compact' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
          {products.map(item => {
            const stock = getStockInfo(item);
            const isSoldOut = stock <= 0;

            return (
              <div
                key={`compact-${item.id}`}
                className="bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group relative"
              >
                <div className="relative cursor-pointer" onClick={() => onSelectProduct(item)}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-28 sm:h-36 object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end z-10">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded shadow-xs bg-orange-600 text-white">
                        {item.badge}
                      </span>
                    )}
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold uppercase bg-red-600 text-white rounded shadow-xs">
                        -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {config.showMenuStockOnMain && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black shadow-xs border rounded-full ${
                          isSoldOut ? 'bg-red-600 text-white border-red-400' : 'bg-white/95 text-stone-800 border-stone-200'
                        }`}
                      >
                        {isSoldOut ? 'Sold Out' : `Stok: ${stock}`}
                      </span>
                    </div>
                  )}

                  {item.isSpicy && (
                    <div className="absolute bottom-1.5 right-1.5 z-10">
                      <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center shadow-xs">
                        <i className="fa-solid fa-pepper-hot text-amber-300 text-[9px]"></i>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      onClick={() => onSelectProduct(item)}
                      className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1 group-hover:text-orange-600 transition cursor-pointer"
                    >
                      {item.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 line-clamp-1">{item.description}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <div className="font-extrabold text-orange-700 text-xs sm:text-sm truncate">
                        {formatRupiah(item.price)}
                      </div>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="line-through text-stone-400 text-[9px] block truncate">
                          {formatRupiah(item.originalPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToCart(item)}
                      disabled={isSoldOut}
                      className={`font-bold text-[11px] sm:text-xs px-2 sm:px-2.5 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1 flex-shrink-0 active:scale-95 cursor-pointer ${
                        isSoldOut ? 'bg-stone-300 text-stone-500 opacity-60' : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i>
                      <span className="hidden sm:inline">Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 3: List Rows */}
      {viewMode === 'list' && (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {products.map(item => {
            const stock = getStockInfo(item);
            const isSoldOut = stock <= 0;

            return (
              <div
                key={`list-${item.id}`}
                className="bg-white rounded-2xl border border-stone-200/90 p-2.5 sm:p-3.5 shadow-2xs hover:shadow-md transition flex items-center gap-3 sm:gap-4 group relative"
              >
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 border border-stone-100 bg-stone-100 cursor-pointer"
                  onClick={() => onSelectProduct(item)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  {config.showMenuStockOnMain && (
                    <div className="absolute top-1 left-1 z-10">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-black shadow-xs border rounded-full ${
                          isSoldOut ? 'bg-red-600 text-white border-red-400' : 'bg-white/95 text-stone-800 border-stone-200'
                        }`}
                      >
                        {isSoldOut ? 'Sold Out' : `Stok: ${stock}`}
                      </span>
                    </div>
                  )}
                  {item.isSpicy && (
                    <div className="absolute bottom-1 right-1 z-10">
                      <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center shadow-xs">
                        <i className="fa-solid fa-pepper-hot text-amber-300 text-[10px]"></i>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold bg-stone-100 text-stone-600 rounded">
                      {item.categoryLabel || item.category}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-orange-600 text-white shadow-2xs">
                        {item.badge}
                      </span>
                    )}
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-red-600 text-white rounded">
                        HEMAT {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <h4
                    onClick={() => onSelectProduct(item)}
                    className="font-bold text-stone-900 text-sm sm:text-base truncate group-hover:text-orange-600 transition cursor-pointer"
                  >
                    {item.name}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-1 sm:line-clamp-2 mt-0.5">{item.description}</p>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end justify-between self-stretch gap-2">
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] text-stone-400 font-semibold uppercase">Harga</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-orange-700 text-base">{formatRupiah(item.price)}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="line-through text-stone-400 text-xs">{formatRupiah(item.originalPrice)}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddToCart(item)}
                    disabled={isSoldOut}
                    className={`font-bold text-xs px-3 sm:px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                      isSoldOut ? 'bg-stone-300 text-stone-500 opacity-60' : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                    <span className="hidden sm:inline">Tambah</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 disabled:opacity-40 hover:bg-stone-50 shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <i className="fa-solid fa-chevron-left text-[10px]"></i>
            <span>Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                  currentPage === p
                    ? 'bg-orange-600 text-white font-black shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 disabled:opacity-40 hover:bg-stone-50 shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <span>Selanjutnya</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      )}
    </div>
  );
};
