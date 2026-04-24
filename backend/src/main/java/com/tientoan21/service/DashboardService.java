package com.tientoan21.service;


import com.tientoan21.dto.response.DashboardStatsDTO;
import com.tientoan21.dto.response.MonthlyRevenueDTO;
import com.tientoan21.dto.response.ProductVariantResponse;
import com.tientoan21.dto.response.TopProductDTO;
import com.tientoan21.entity.ProductVariant;
import com.tientoan21.enums.OrderStatus;
import com.tientoan21.mapper.ProductVariantMapper;
import com.tientoan21.repository.OrderRepository;
import com.tientoan21.repository.ProductVariantRepository;
import com.tientoan21.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantMapper productVariantMapper;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getOverviewStats(){
        BigDecimal revenue = orderRepository.calculateTotalRevenue();
        if(revenue == null) revenue = BigDecimal.ZERO;

        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long totalUsers = userRepository.count();
        return new DashboardStatsDTO(revenue,delivered,cancelled,totalUsers);
    }
    @Transactional
    public List<MonthlyRevenueDTO> getMonthlyRevenue(int year){
        List<Object[]> results = orderRepository.getMonthlyRevenueByYear(year);
        List<MonthlyRevenueDTO> chartData = new ArrayList<>();

        for(Object[] row : results){
            int month = (Integer) row[0];
            BigDecimal revenue = (BigDecimal) row[1];
            chartData.add(new MonthlyRevenueDTO(month, revenue));
        }

        return chartData;
    }

    public List<TopProductDTO> getTopSellingProducts() {

        List<Object[]> results = orderRepository.getTopSellingProducts(PageRequest.of(0, 5));
        List<TopProductDTO> topProducts = new ArrayList<>();

        for (Object[] row : results) {
            String name = (String) row[0];
            Long totalSold = (Long) row[1];
            BigDecimal totalRevenue = (BigDecimal) row[2];
            topProducts.add(new TopProductDTO(name, totalSold, totalRevenue));
        }
        return topProducts;
    }

    public List<ProductVariantResponse> getLowStock(){
        List<ProductVariant> variantList = productVariantRepository.findAllLowStock();

        return variantList.stream()
                .map(productVariantMapper::toProductVariantResponse)
                .toList();
    }
}
