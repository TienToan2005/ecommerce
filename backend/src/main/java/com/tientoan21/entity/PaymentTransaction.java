package com.tientoan21.entity;

import com.tientoan21.enums.SepayResult;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions", uniqueConstraints = @UniqueConstraint(name = "uk_sepay_tx_id", columnNames = "sepay_transaction_id"))
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sepay_transaction_id", nullable = false)
    private Long sepayTransactionId;

    private String gateway;
    private String referenceCode;
    private String paymentCode;
    @Column(length = 500) private String content;
    private Long amount;
    private String transferType;
    private LocalDateTime transactionDate;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    private SepayResult result;
    private String note;
}
