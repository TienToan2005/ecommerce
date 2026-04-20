package com.tientoan21.dto.response;

import java.math.BigDecimal;

public record DashboardStatsDTO(
        BigDecimal totalRevenue,
        long totalOrdersDelivered,
        long totalOrdersCancelled,
        long totalUsers
) {}