package dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ReviewRequest(
         String content,
         @Min(value = 1,message = "")
         @Max(value = 5,message = "")
         int rating,
         @NotBlank(message = "productId cannot null")
         Long productId
) {
}
