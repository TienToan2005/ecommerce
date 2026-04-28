import { create } from 'zustand';
import Decimal from "decimal.js";
import * as cartApi from '../services/cart';
import { useAuthStore } from './useAuthStore'; // 🚨 Kéo AuthStore vào để lấy userId
import type { ProductResponse, ProductVariantResponse } from '../types/product';

export interface CartItem {
  id?: number;
  product: ProductResponse;
  variant: ProductVariantResponse;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (product: ProductResponse, variant: ProductVariantResponse, quantity?: number) => Promise<void>;
  removeFromCart: (variantId: number, cartItemId?: number) => Promise<void>; 
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>; // Sửa lại nhận cartItemId
  clearCartUI: () => void; 
  clearCartDB: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => Decimal;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  fetchCart: async () => {
    try {
      const isAuth = useAuthStore.getState().isAuthenticated;
      if (!isAuth) return;

      const cartData = await cartApi.getMyCart();
      
      const mappedItems: CartItem[] = (cartData?.cartItemList || []).map((item: any) => ({
        id: item.id, 
        quantity: item.quantity,
        variant: item.variant, 
        product: item.product 
      }));

      set({ items: mappedItems });
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng từ DB:", error);
      set({ items: [] });
    }
  },

  addToCart: async (product, variant, quantity = 1) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user?.id) {
        useAuthStore.getState().openAuthModal();
        return;
      }

      await cartApi.addToCart({
        userId: user.id,
        variantId: variant.id,
        quantity: quantity
      });

      await get().fetchCart();
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    try {
      if (quantity <= 0) {
        // Nếu user giảm về 0 -> Bắn cảnh báo hoặc gọi hàm xóa
        console.warn("Số lượng phải lớn hơn 0");
        return;
      }

      await cartApi.updateItemQuantity(cartItemId, { quantity });
      
      await get().fetchCart();
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
    }
  },

  removeFromCart: async (variantId, cartItemId) => {
      try {
        if (cartItemId) {
          await cartApi.removeCartItem(cartItemId); 
        }
        
        await get().fetchCart();
        
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
      }
    },

  clearCartUI: () => set({ items: [] }),

  clearCartDB: async () => {
    try {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        await cartApi.clearCart(userId); // Gọi API sếp đã viết
        set({ items: [] });
      }
    } catch (error) {
      console.error("Lỗi xóa giỏ hàng DB:", error);
    }
  },

  // 6. TÍNH TỔNG SỐ LƯỢNG UI
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  // 7. TÍNH TỔNG TIỀN UI
  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total.plus(new Decimal(item.variant?.price || 0).times(item.quantity)),
      new Decimal(0)
    );
  },
}));