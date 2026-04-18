import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductResponse } from '../types/product';

interface CartItem extends ProductResponse {
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: ProductResponse) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            cart: currentCart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          set({ cart: [...currentCart, { ...product, quantity: 1 }] });
        }
      },
      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },
      clearCart: () => set({ cart: [] }),
      totalItems: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'cart-storage' } // Lưu giỏ hàng vào LocalStorage tự động
  )
);