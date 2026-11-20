package com.tientoan21.dto.response;

import com.tientoan21.enums.PaymentMethod;
import com.tientoan21.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private PaymentMethod method;
    private BigDecimal amount;
    private PaymentStatus status;
    private String paymentUrl;
    private String paymentCode;
    private String qrUrl;
    /** Hạn thanh toán (ISO-8601, UTC) cho đơn chuyển khoản. */
    private Instant expiresAt;
    /** Giờ máy chủ lúc trả phản hồi, để frontend bù lệch đồng hồ. */
    private Instant serverTime;
}
