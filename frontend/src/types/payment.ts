export interface PaymentResponse {
  id: number;
  method: 'COD' | 'VNPAY' | 'CREDIT_CARD';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentUrl?: string;
}