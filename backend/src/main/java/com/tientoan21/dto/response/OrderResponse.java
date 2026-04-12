package com.tientoan21.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public class OrderResponse {
    private Long id;
    private String order_number;
    private BigDecimal totalPrice;
    private AddressResponse deliveryAddress;
    private List<OrderItemResponse> orderItems;
    private PaymentResponse paymentInfo;
}
