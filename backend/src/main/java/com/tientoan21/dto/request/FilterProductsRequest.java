package com.tientoan21.dto.request;

public record FilterProductsRequest(
        String name,
        Double minPrice,
        Double maxPrice,
        Long categoryId
) {
}
