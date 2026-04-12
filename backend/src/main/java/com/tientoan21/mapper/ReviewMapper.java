package com.tientoan21.mapper;

import com.tientoan21.dto.response.ReviewResponse;
import com.tientoan21.entity.Review;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    ReviewResponse toReviewResponse(Review review);
}
