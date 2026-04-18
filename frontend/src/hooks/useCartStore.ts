import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductResponse } from '../types/product';
import Decimal from "decimal.js";


export interface CartItem extends ProductResponse {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: ProductResponse, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => Decimal;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // 1. Thêm sản phẩm vào giỏ
      addToCart: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          // Nếu đã có trong giỏ -> Tăng số lượng
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Nếu chưa có -> Thêm mới
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      // 2. Xóa 1 sản phẩm khỏi giỏ
      removeFromCart: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      // 3. Cập nhật số lượng (+ / -)
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      // 4. Xóa sạch giỏ hàng (Dùng khi thanh toán xong hoặc đăng xuất)
      clearCart: () => set({ items: [] }),

      // 5. Tính tổng số lượng sản phẩm (để hiển thị trên Header)
      getTotalItems: () => {
        return get().items.reduce(
            (total, item) => total + item.quantity,
            0
        );
      },

      // 6. Tính tổng tiền (để hiển thị ở trang Cart)
      getTotalPrice: () => {
        return get().items.reduce(
            (total, item) =>
                total.plus(new Decimal(item.price).times(item.quantity)),
            new Decimal(0)
        );
      },
    }),
    {
      name: 'cellphones-cart-storage', // Tên key lưu trong LocalStorage của trình duyệt
    }
  )
);