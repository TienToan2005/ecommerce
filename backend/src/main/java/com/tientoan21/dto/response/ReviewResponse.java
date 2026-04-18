package com.tientoan21.dto.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ReviewResponse {
    private Long id;
    private String content;
    private int rating;
    private Long productId;
    private Long userId;
}
