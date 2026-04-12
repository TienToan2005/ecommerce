package com.tientoan21.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CartRequest(
        @NotBlank(message = "productId cannot null")
        Long productId,

        @Min(value = 1, message = "Quantity must be greater than 0")
        int quantity,

        @NotBlank(message = "userId cannot null")
        Long userId
) {
}
