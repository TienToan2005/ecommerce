package com.tientoan21.mapper;

import com.tientoan21.dto.response.PaymentResponse;
import com.tientoan21.entity.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentResponse toPaymentResponse(Payment payment);
}
