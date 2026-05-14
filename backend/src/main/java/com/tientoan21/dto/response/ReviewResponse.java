package com.tientoan21.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

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
    private String username;
    private LocalDateTime createdAt;
    private List<String> images;
}
