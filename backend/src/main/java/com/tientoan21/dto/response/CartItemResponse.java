package com.tientoan21.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItemResponse {
    private Long id;
    private int quantity;

    private ProductVariantResponse variant;
    private ProductResponse product;
}
