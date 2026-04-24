package com.tientoan21.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private List<String> images;
    private String description;
    private CategoryResponse category;
    private Map<String, String> specifications;

    @JsonIgnoreProperties("product")
    private List<ProductVariantResponse> variants;

    private Double averageRating;
    private Integer totalReviews;
}
