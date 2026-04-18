package com.tientoan21.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.Map;

public record ProductVariantRequest(
        @NotBlank(message = "Sku is required")
        String sku,
        @Min(value = 0, message = "The price must be greater than zero.")
        BigDecimal price,
        @Min(value = 0, message = "The stock must be greater than zero.")
        int stock,

        Map<String, String> attributes
) {
}
