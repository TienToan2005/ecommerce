import type { ProductResponse, ProductVariantResponse } from "./product";

export interface CartRequest {
    userId: number;
    variantId: number;
    quantity: number;
}

export interface CartItemResponse {
    id: number;
    quantity: number;
    product: ProductResponse; 
    variant: ProductVariantResponse;
}

export interface CartResponse {
    id: number;
    cartItemList: CartItemResponse[];
}

export interface UpdateQuantityRequest {
    quantity: number;
}