package com.tientoan21.service;

/** Phát ra khi đơn được xác nhận thanh toán; email gửi sau khi transaction commit. */
public record OrderConfirmedEvent(String orderNumber) {
}
