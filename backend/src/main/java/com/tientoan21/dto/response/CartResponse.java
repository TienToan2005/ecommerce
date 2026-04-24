package com.tientoan21.dto.response;

import lombok.*;

import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> cartItemList;
}
