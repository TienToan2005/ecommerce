export interface PaymentResponse {
  id: number;
  method: 'COD' | 'VNPAY' | 'CREDIT_CARD' | 'SEPAY';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentUrl?: string;
  paymentCode?: string;
  qrUrl?: string;
  expiresAt?: string;
  serverTime?: string;
}