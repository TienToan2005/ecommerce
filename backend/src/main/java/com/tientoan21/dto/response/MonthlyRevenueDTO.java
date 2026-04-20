package com.tientoan21.dto.response;

import java.math.BigDecimal;

public record MonthlyRevenueDTO(
        int month,
        BigDecimal revenue
) {}
