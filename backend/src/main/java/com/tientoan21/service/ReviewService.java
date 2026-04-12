package com.tientoan21.service;

import com.tientoan21.dto.request.ReviewRequest;
import com.tientoan21.dto.response.ReviewResponse;
import com.tientoan21.entity.Product;
import com.tientoan21.entity.Review;
import com.tientoan21.entity.User;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.enums.UserRole;
import com.tientoan21.exception.AppException;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.ReviewMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tientoan21.repository.ProductRepository;
import com.tientoan21.repository.ReviewRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final UserService userService;
    private final ProductRepository productRepository;
    @Transactional
    public ReviewResponse createReview(ReviewRequest request){
        User user = userService.getcurrentUser();

        Product product = getProductByIdOrThrow(request.productId());

        validateCreateReview(user.getId(), product.getId(), request.rating());

        Review review = Review.builder()
                .content(request.content())
                .rating(request.rating())
                .product(product)
                .user(user)
                .build();
        Review saved = reviewRepository.save(review);
        return reviewMapper.toReviewResponse(saved);
    }
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByProduct(Long productId, int page, int size){
        if(!productRepository.existsById(productId)){
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        Page<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, PageRequest.of(page,size));

        return reviews.map(reviewMapper::toReviewResponse);
    }
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyReviews(int page, int size){
        User user = userService.getcurrentUser();

        Page<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page,size));

        return reviews.map(reviewMapper::toReviewResponse);
    }
    public ReviewResponse getReviewById(Long reviewId) {
        Review review = getReviewByIdOrThrow(reviewId);
        return reviewMapper.toReviewResponse(review);
    }
    @Transactional
    public ReviewResponse updateReview(Long reviewId, String content, Integer rating){
        User user = userService.getcurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        validateReviewPermission(review,user);

        if (content != null) {
            review.setContent(normalizeContent(content));
        }

        if (rating != null) {
            validateRating(rating);
            review.setRating(rating);
        }

        Review saved = reviewRepository.save(review);
        return reviewMapper.toReviewResponse(saved);
    }
    @Transactional
    public void deleteReview(Long id){
        User currentUser = userService.getcurrentUser();
        Review review = getReviewByIdOrThrow(id);

        validateReviewPermission(review, currentUser);

        review.setDeletedAt(LocalDateTime.now());
    }

    // helpers
    private Product getProductByIdOrThrow(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
    }
    private Review getReviewByIdOrThrow(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
    }
    private void validateRating(Integer rating){
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }
    private void validateCreateReview(Long userId, Long productId, int rating){
        validateRating(rating);

        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalStateException("You have already reviewed this product");
        }
    }
    private void validateReviewPermission(Review review, User currentUser) {
        boolean isOwner = review.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("You do not have permission to modify this review");
        }
    }
    private String normalizeContent(String content) {
        if (content == null) {
            return null;
        }

        String trimmed = content.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
