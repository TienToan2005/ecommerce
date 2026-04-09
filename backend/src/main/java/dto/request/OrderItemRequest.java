package dto.request;

import java.math.BigDecimal;

public record OrderItemRequest(
        Long productId,
        BigDecimal discount_amount,
        Integer quantity
) {
}
