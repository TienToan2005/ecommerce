package com.tientoan21.dto.request;

import java.math.BigDecimal;

public record OrderItemRequest(
        Long variantId,
        BigDecimal discount_amount,
        Integer quantity
) {
}
