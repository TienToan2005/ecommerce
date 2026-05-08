import { create } from 'zustand';
import { getAllCategories } from '../services/category';
import type { CategoryResponse } from '../types/category';

interface CategoryState {
  categories: CategoryResponse[];
  isFetched: boolean;
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isFetched: false,
  isLoading: false,

  fetchCategories: async () => {
    if (get().isFetched) return;

    set({ isLoading: true });
    try {
      const data = await getAllCategories();
      set({ categories: data, isFetched: true, isLoading: false });
    } catch (error) {
      console.error('Lỗi khi lấy danh mục Global:', error);
      set({ isLoading: false });
    }
  },
}));