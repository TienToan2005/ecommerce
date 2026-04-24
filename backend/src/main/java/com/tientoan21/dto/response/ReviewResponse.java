package com.tientoan21.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private String content;
    private int rating;
    private Long productId;
    private Long userId;
}
