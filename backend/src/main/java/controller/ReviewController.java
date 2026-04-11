package controller;

import dto.request.ReviewRequest;
import dto.response.ApiResponse;
import dto.response.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.*;
import service.ReviewService;

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
    @GetMapping
    public ApiResponse<Page<ReviewResponse>> getReviewsByProduct(@Param("productId") Long productId, Pageable pageable){
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
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable Long id,
            @Param("content") String content,
            @Param("rating") Integer rating){
        return ApiResponse.<ReviewResponse>builder()
                .data(reviewService.updateReview(id,content,rating))
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
