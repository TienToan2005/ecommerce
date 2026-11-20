import type { OrderResponse } from '../types/order';

/** Số tiền khách phải trả: grandTotal (sau voucher); đơn cũ chưa có grandTotal thì dùng totalPrice. */
export const orderPayableAmount = (order: OrderResponse): number =>
  Number(order.grandTotal ?? order.totalPrice);

/** Đơn SePay còn chờ thanh toán và chưa quá hạn: được phép quay lại trang QR. */
export const canResumeSepayPayment = (order: OrderResponse): boolean => {
  const payment = order.paymentInfo;
  if (order.status !== 'PENDING' || payment?.method !== 'SEPAY' || payment.status !== 'PENDING') {
    return false;
  }
  if (!payment.expiresAt) return true;
  const deadline = Date.parse(payment.expiresAt);
  return Number.isNaN(deadline) || deadline > Date.now();
};
