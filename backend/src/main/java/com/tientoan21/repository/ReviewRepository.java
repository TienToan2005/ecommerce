package com.tientoan21.repository;

import com.tientoan21.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
