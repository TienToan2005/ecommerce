package dto.response;

import lombok.Builder;

@Builder
public class ReviewResponse {
    private Long id;
    private String content;
    private int rating;
    private ProductResponse product;
    private UserResponse user;
}
