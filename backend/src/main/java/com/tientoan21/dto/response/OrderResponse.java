package com.tientoan21.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private BigDecimal totalPrice;
    private AddressResponse deliveryAddress;
    private List<OrderItemResponse> orderItems;
    private PaymentResponse paymentInfo;
}
