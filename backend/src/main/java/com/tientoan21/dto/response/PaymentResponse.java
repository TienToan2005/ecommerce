package com.tientoan21.dto.response;

import com.tientoan21.enums.PaymentMethod;
import com.tientoan21.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;

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
}
