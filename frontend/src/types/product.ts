export interface CategoryResponse {
  id?: number;
  name: string;
}

export interface ProductRequest {
    id?: number;
    name: string;
    price: string;
    images: string[];
    description: string;
    stock: number;
    categoryId: number;
    specifications: Record<string, string>
}
export interface ProductResponse extends Omit<ProductRequest, 'categoryId'> {
    category: CategoryResponse;
}