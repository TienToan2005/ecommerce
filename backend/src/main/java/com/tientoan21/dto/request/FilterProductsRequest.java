package com.tientoan21.dto.request;

import java.math.BigDecimal;

public record FilterProductsRequest(
        String name,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Long categoryId,
        String brand
) {
}
