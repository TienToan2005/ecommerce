package com.tientoan21.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Builder
@Getter
public class ProductResponse {
    private Long id;
    private String name;
    private List<String> images;
    private String description;
    private CategoryResponse category;
    private Map<String, String> specifications;
    private ProductVariantResponse productVariantResponse;
}
