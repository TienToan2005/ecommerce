package com.tientoan21.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
@Builder
@Getter
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> itemResponseList;
}
