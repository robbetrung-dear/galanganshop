import React from 'react';
import { CartItem } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onIncreaseQty: (id: string) => void;
  onDecreaseQty: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onEmptyCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveItem,
  onEmptyCart,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      <div className="fixed inset-y-0 right-0 w-full max-w-full flex sm:pl-10">
        <div className="w-full sm:max-w-md h-full min-h-0 bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-cart-shopping text-orange-600 text-lg"></i>
              <h3 className="font-extrabold text-stone-900 text-lg">Keranjang Belanja</h3>
            </div>
            <div className="flex items-center gap-3">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onEmptyCart}
                  className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-trash-can"></i> Kosongkan
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 flex items-center justify-center cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>

          {/* Cart items list */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="text-center py-14 text-stone-400 text-xs">
                <i className="fa-solid fa-basket-shopping text-4xl mb-3 text-stone-300"></i>
                <p>Keranjang Anda masih kosong.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-stone-900 truncate">{item.name}</h5>
                    <span className="text-orange-700 font-extrabold text-xs">{formatRupiah(item.price)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDecreaseQty(item.id)}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs px-1 min-w-[20px] text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onIncreaseQty(item.id)}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-700 ml-2 text-xs cursor-pointer"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3 flex-shrink-0">
            <div className="flex justify-between text-xs text-stone-600">
              <span>Subtotal:</span>
              <span className="font-bold text-stone-900 text-sm">{formatRupiah(subtotal)}</span>
            </div>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              Lanjut ke Form Checkout & Ongkir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
