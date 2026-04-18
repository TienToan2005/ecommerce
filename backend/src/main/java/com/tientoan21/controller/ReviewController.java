package com.tientoan21.controller;

import com.tientoan21.dto.request.ReviewRequest;
import com.tientoan21.dto.request.UpdateReview;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.ReviewService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@RequestBody ReviewRequest request){
        return ApiResponse.<ReviewResponse>builder()
                .data(reviewService.createReview(request))
                .build();
    }
    @GetMapping("/product/{productId}")
    public ApiResponse<Page<ReviewResponse>> getReviewsByProduct(@PathVariable Long productId, Pageable pageable){
        return ApiResponse.<Page<ReviewResponse>>builder()
                .data(reviewService.getReviewsByProduct(productId, pageable.getPageNumber(), pageable.getPageSize()))
                .build();
    }
    @GetMapping("/my_review")
    public ApiResponse<Page<ReviewResponse>> getMyReviews(Pageable pageable){
        return ApiResponse.<Page<ReviewResponse>>builder()
                .data(reviewService.getMyReviews(pageable.getPageNumber(), pageable.getPageSize()))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<ReviewResponse> getReviewById(@PathVariable Long id){
        return ApiResponse.<ReviewResponse>builder()
                .data(reviewService.getReviewById(id))
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<ReviewResponse> updateReview(@PathVariable Long id, @RequestBody UpdateReview request){
        return ApiResponse.<ReviewResponse>builder()
                .data(reviewService.updateReview(id,request.content(), request.rating()))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteReview(@PathVariable Long id){
        reviewService.deleteReview(id);
        return ApiResponse.<String>builder()
                .data("Đã xóa review thành công")
                .build();
    }
}
