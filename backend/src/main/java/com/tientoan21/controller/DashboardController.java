package com.tientoan21.controller;

import com.tientoan21.dto.response.*;
import com.tientoan21.entity.ProductVariant;
import com.tientoan21.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsDTO> getStats() {
        return ApiResponse.<DashboardStatsDTO>builder()
                .data(dashboardService.getOverviewStats())
                .build();
    }

    @GetMapping("/revenue-chart")
    public ApiResponse<List<MonthlyRevenueDTO>> getRevenueChart(@RequestParam(defaultValue = "2024") int year) {
        return ApiResponse.<List<MonthlyRevenueDTO>>builder()
                .data(dashboardService.getMonthlyRevenue(year))
                .build();
    }

    @GetMapping("/top-selling")
    public ApiResponse<List<TopProductDTO>> getTopSellingProducts(){
        return ApiResponse.<List<TopProductDTO>>builder()
                .data(dashboardService.getTopSellingProducts())
                .build();
    }
    @GetMapping("/low-stock")
    public ApiResponse<List<ProductVariantResponse>> getLowStock(){
        return ApiResponse.<List<ProductVariantResponse>>builder()
                .data(dashboardService.getLowStock())
                .build();
    }
}
