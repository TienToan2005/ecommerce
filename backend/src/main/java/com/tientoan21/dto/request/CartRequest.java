package com.tientoan21.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CartRequest(
        @NotNull(message = "variantId cannot null")
        Long variantId,

        @NotNull(message = "Quantity cannot null")
        @Min(value = 1, message = "Quantity must be greater than 0")
        Integer quantity,

        @NotNull(message = "userId cannot null")
        Long userId
) {
}
