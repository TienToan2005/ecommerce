package com.tientoan21.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ReviewRequest(
         String content,
         @Min(value = 1,message = "The rating must not be less than 1")
         @Max(value = 5,message = "The rating should not exceed 5")
         int rating,
         @NotBlank(message = "productId cannot null")
         Long productId
) {
}
