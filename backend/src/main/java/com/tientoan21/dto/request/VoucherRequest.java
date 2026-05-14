package com.tientoan21.dto.request;

import com.tientoan21.enums.DiscountType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VoucherRequest(
     String code,
     DiscountType discountType,
     BigDecimal discountValue,
     BigDecimal minOrderValue,
     BigDecimal maxDiscount,
     LocalDateTime expiryDate,
     Integer usageLimit
) {
}
