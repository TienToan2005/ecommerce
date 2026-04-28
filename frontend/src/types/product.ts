import type {ReviewResponse} from './review';
export interface CategoryResponse {
  id?: number;
  name: string;
}

export interface ProductVariantRequest {
  productId: number;
  sku: string;
  price: string;
  stock: number;
  attributes?: Record<string, string>;
}

export interface ProductVariantResponse extends ProductVariantRequest {
  id: number; 
}

export interface ProductRequest {
  name: string;
  images: string[];
  poster: string;
  description?: string;
  categoryId: number;
  specifications?: Record<string, string>;
  variants?: ProductVariantRequest[]; 
}

export interface ProductResponse extends Omit<ProductRequest, 'categoryId' | 'variants'> {
  id?: number;
  category: CategoryResponse;
  variants?: ProductVariantResponse[];
  reviews?: ReviewResponse[];
  averageRating?: number;
  totalReviews?: number;
}