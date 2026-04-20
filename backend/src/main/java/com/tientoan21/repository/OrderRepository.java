package com.tientoan21.repository;

import com.tientoan21.entity.Order;
import com.tientoan21.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long id, Pageable pageable);

    @Query("SELECT COUNT(o) > 0 FROM Order o " +
            "JOIN o.orderItemList oi " +
            "JOIN oi.productVariant v " +
            "WHERE o.user.id = :userId " +
            "AND v.product.id = :productId " +
            "AND o.status = :status")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId,
                                    @Param("productId") Long productId,
                                    @Param("status") OrderStatus status);
}
