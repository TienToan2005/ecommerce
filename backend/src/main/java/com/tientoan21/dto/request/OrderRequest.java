package com.tientoan21.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OrderRequest(
        @NotNull(message = " ID user is required")
        Long userId,
        @NotNull(message = " ID address is required")
         Long addressId,
        @NotBlank(message = "Payment method is required")
         String paymentMethod,
        @Valid
        @NotEmpty(message = "Order must contain at least one item")
         List<OrderItemRequest> orderItemList
) {
}
