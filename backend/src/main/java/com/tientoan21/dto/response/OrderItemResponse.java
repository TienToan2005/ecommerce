package com.tientoan21.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItemResponse {
    private  Long id;
    private BigDecimal price;
    private int quantity;
    private BigDecimal discount_amount;
    private ProductResponse product;
    private ProductVariantResponse variant;
}
