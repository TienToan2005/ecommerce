package com.tientoan21.repository;

import com.tientoan21.entity.Order;
import com.tientoan21.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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

    @Query("select sum(o.totalPrice) from Order o where o.status = 'DELIVERED' ")
    BigDecimal calculateTotalRevenue();

    long countByStatus(OrderStatus status);

    @Query("SELECT MONTH(o.createdAt) as month, SUM(o.totalPrice) as revenue " +
            "FROM Order o " +
            "WHERE YEAR(o.createdAt) = :year AND o.status = 'DELIVERED' " +
            "GROUP BY MONTH(o.createdAt) " +
            "ORDER BY MONTH(o.createdAt) ASC")
    List<Object[]> getMonthlyRevenueByYear(@Param("year") int year);

    @Query("select v.product.name,sum(oi.quantity) as totalSold, sum(oi.price * oi.quantity) as totalRevenue " +
            "from OrderItem oi " +
            "join oi.productVariant v " +
            "join oi.order o " +
            "where o.status = 'DELIVERED' " +
            "group by v.product.name, v.product.id " +
            "order by totalSold desc ")
    List<Object[]> getTopSellingProducts(Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);
}
