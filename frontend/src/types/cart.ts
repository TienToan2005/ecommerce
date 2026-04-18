import type {ProductResponse} from './product';

export interface CartRequest {
    productId: number;
    userId: number;
    quantity: number;
}
export interface CartResponse {
    id:number;
    userId: number;
    itemList?: CartItemResponse[];
}
export interface CartItemResponse {
    id: number;
    quantity: number;
    product :ProductResponse;
}
export interface UpdateQuantityRequest {
    quantity: number;
}