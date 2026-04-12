package com.tientoan21.dto.response;

import com.tientoan21.entity.Category;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private List<String> images;
    private String description;
    private int stock;
    private Category category;
    private Map<String, String> specifications;
}
