package com.tientoan21.mapper;

import com.tientoan21.dto.response.ReviewResponse;
import com.tientoan21.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReviewMapper {

    @Mapping(target = "username", source = "user.fullName")
    @Mapping(target = "createdAt", source = "createdAt")
    ReviewResponse toReviewResponse(Review review);
}
