package com.tientoan21.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tientoan21.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductVariantResponse {
    private Long id;
    private BigDecimal price;
    private int stock;
    private ProductStatus status;
    private String sku;
}