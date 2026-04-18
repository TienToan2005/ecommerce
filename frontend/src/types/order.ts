import type { AddressResponse } from './address';
import type { PaymentResponse } from './payment';

export interface OrderRequest {
  addressId: number;
  paymentMethod: string;
  orderItemList: OrderItemRequest[];
}

export interface OrderResponse {
  id: number;
  order_number: string;
  totalPrice: string;
  deliveryAddress: AddressResponse;
  orderItems: OrderItemResponse[];
  paymentInfo: PaymentResponse;
}

export interface OrderItemRequest {
  productId: number;
  discount_amount: string;
  quantity: number;
}

export interface OrderItemResponse {
  id: number;
  price: string;
  quantity: number;
  discount_amount: string;
  userId: number;
  productId: number;
}

export interface UpdateOrderStatus {
  status: string;
}