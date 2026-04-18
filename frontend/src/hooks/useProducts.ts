import { useState, useEffect } from 'react';
import * as productApi from '../services/product';
import type { ProductResponse } from '../types/product';
import type { Page } from '../types/apiresponse';

export const useProducts = (initialParams: productApi.ProductQueryParams = {}, categoryId?: number | string) => {
  const [data, setData] = useState<Page<ProductResponse> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Nếu có truyền categoryId thì gọi API lọc theo danh mục, ngược lại gọi API lấy tất cả
        let result;
        if (categoryId) {
          result = await productApi.getAllProductsByCategory(categoryId, initialParams);
        } else {
          result = await productApi.getAllProducts(initialParams);
        }
        
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(initialParams), categoryId]); // Re-fetch khi params hoặc danh mục thay đổi

  return { data, loading, error };
};