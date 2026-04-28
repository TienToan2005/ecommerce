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

        const res = await productApi.getAllProducts({
          ...initialParams,
          categoryId: categoryId || undefined
        });

        setData(res);
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(initialParams), categoryId]);

  return { data, loading, error };
};