package com.tientoan21.dto.response;

import com.tientoan21.enums.OrderStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private OrderStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
}
