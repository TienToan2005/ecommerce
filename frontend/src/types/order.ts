import type { AddressResponse } from './address';
import type { PaymentResponse } from './payment';
import type {ProductResponse, ProductVariantResponse} from './product';
export interface OrderRequest {
  userId: number;
  addressId: number;
  paymentMethod: string;
  orderItemList: OrderItemRequest[];
}

export interface OrderResponse {
  id: number;
  userId: number;
  orderNumber: string;
  totalPrice: string;
  deliveryAddress: AddressResponse;
  orderItems: OrderItemResponse[];
  paymentInfo: PaymentResponse;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface OrderItemRequest {
  variantId: number;
  discount_amount: string;
  quantity: number;
}

export interface OrderItemResponse {
  id: number;
  price: string;
  quantity: number;
  discount_amount: string;
  product: ProductResponse;
  variant: ProductVariantResponse;
}

export interface UpdateOrderStatus {
  status: string;
}