package com.tientoan21.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Builder
@Getter
public class OrderItemResponse {
    private  Long id;
    private BigDecimal price;
    private int quantity;
    private BigDecimal discount_amount;
    private Long orderId;
    private Long productId;
}
