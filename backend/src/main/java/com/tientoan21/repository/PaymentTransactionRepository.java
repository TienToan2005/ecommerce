package com.tientoan21.repository;

import com.tientoan21.entity.Order;
import com.tientoan21.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tientoan21.enums.SepayResult;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    boolean existsBySepayTransactionId(Long sepayTransactionId);

    @Query("select coalesce(sum(t.amount), 0) from PaymentTransaction t " +
            "where t.order = :order and t.result in :results")
    Long sumByOrderAndResults(@Param("order") Order order, @Param("results") Collection<SepayResult> results);

    default long sumReceived(Order order) {
        return sumByOrderAndResults(order, List.of(SepayResult.UNDERPAID, SepayResult.PAID, SepayResult.PAID_OVERPAID));
    }

    Optional<PaymentTransaction> findBySepayTransactionId(Long sepayTransactionId);
}
