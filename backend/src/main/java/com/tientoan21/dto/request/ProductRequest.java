package com.tientoan21.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProductRequest(
         @NotBlank(message = "Name is required")
         String name,
         @Min(value = 0, message = "The price must not be negative.")
         BigDecimal price,
         List<String> images,
         String description,
         @Min(value = 0, message = "Inventory must not be negative")
         int stock,
         @NotNull(message = "productId cannot null")
         Long categoryId,
         Map<String, String> specifications
) {
}
