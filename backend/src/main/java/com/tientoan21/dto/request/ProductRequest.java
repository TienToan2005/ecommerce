package com.tientoan21.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

public record ProductRequest(
         @NotBlank(message = "Name is required")
         String name,
         List<String> images,
         String description,
         @NotNull(message = "productId cannot null")
         Long categoryId,
         Map<String, String> specifications,
         List<ProductVariantRequest> variants
) {
}
