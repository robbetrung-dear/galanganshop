import React, { useState } from 'react';
import { InventoryItem, Product } from '../../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  inventory: InventoryItem[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  inventory
}) => {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const getStock = () => {
    if (typeof product.stock === 'number') return product.stock;
    if (product.linkedInventory) {
      const inv = inventory.find(i => i.id === product.linkedInventory);
      if (inv) return inv.stock;
    }
    return 20;
  };

  const currentStock = getStock();
  const isSoldOut = currentStock <= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        <div className="relative h-64 bg-stone-100">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            {product.badge && (
              <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg shadow-sm ${product.badgeColor || 'bg-orange-600 text-white'}`}>
                {product.badge}
              </span>
            )}
            <span className="px-2.5 py-0.5 text-xs font-bold bg-stone-900/80 text-white rounded backdrop-blur-sm">
              {product.categoryLabel || product.category}
            </span>
          </div>

          {product.isSpicy && (
            <div className="absolute bottom-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-black shadow-md">
                <i className="fa-solid fa-pepper-hot text-amber-300"></i>
                <span>Cita Rasa Pedas</span>
              </span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-stone-900 text-xl">{product.name}</h3>
              {product.sku && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 font-bold">
                  SKU: {product.sku}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-black text-orange-700 text-2xl">{formatRupiah(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="line-through text-stone-400 text-sm">{formatRupiah(product.originalPrice)}</span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Ketersediaan Stok</span>
              <span className={`font-black text-sm ${isSoldOut ? 'text-red-600' : 'text-emerald-700'}`}>
                {isSoldOut ? 'Stok Habis' : `${currentStock} ${product.unit || 'Unit'} Tersedia`}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase block">Supplier / Sumber</span>
              <span className="font-bold text-stone-800 text-xs truncate block">
                {product.supplier || 'Dapur & Gudang Utama'}
              </span>
            </div>
          </div>

          {/* Quantity selector & Add to cart */}
          <div className="pt-2 flex items-center gap-3">
            <div className="flex items-center gap-2 border border-stone-300 rounded-xl p-1 bg-stone-50">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 rounded-lg bg-white hover:bg-stone-200 font-bold text-sm shadow-xs flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="font-black text-sm px-2 min-w-[28px] text-center">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(Math.min(currentStock, qty + 1))}
                disabled={qty >= currentStock}
                className="w-9 h-9 rounded-lg bg-white hover:bg-stone-200 font-bold text-sm shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onAddToCart(product, qty);
                onClose();
              }}
              disabled={isSoldOut}
              className={`flex-1 py-3.5 rounded-xl font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                isSoldOut
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30'
              }`}
            >
              <i className="fa-solid fa-cart-plus"></i>
              <span>{isSoldOut ? 'Produk Tidak Tersedia' : `Beli Sekarang (${formatRupiah(product.price * qty)})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
