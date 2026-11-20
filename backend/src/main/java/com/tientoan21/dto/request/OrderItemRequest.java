package com.tientoan21.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record OrderItemRequest(
        @NotNull(message = "variantId is required")
        Long variantId,
        /** Bị bỏ qua: giảm giá chỉ được tính ở máy chủ. Giữ lại để không vỡ client cũ. */
        BigDecimal discount_amount,
        @NotNull(message = "quantity is required")
        @Min(value = 1, message = "quantity must be at least 1")
        Integer quantity
) {
}
