package com.tientoan21.repository;

import com.tientoan21.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    boolean existsBySepayTransactionId(Long sepayTransactionId);

    Optional<PaymentTransaction> findBySepayTransactionId(Long sepayTransactionId);
}
