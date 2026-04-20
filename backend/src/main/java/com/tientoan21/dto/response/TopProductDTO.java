package com.tientoan21.dto.response;

import java.math.BigDecimal;

public record TopProductDTO(
        String name,
        Long totalSold,
        BigDecimal totalRevenue
) { }

