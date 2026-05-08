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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        return new DashboardStatsDTO(revenue, delivered, cancelled, totalUsers);
    }

    @Transactional(readOnly = true)
    public List<MonthlyRevenueDTO> getMonthlyRevenue(int year){
        List<Object[]> results = orderRepository.getMonthlyRevenueByYear(year);

        Map<Integer, BigDecimal> monthlyMap = new HashMap<>();
        for (int i = 1; i <= 12; i++) {
            monthlyMap.put(i, BigDecimal.ZERO);
        }

        for(Object[] row : results){
            int month = ((Number) row[0]).intValue();
            BigDecimal revenue = (BigDecimal) row[1];
            monthlyMap.put(month, revenue);
        }

        List<MonthlyRevenueDTO> chartData = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            chartData.add(new MonthlyRevenueDTO(i, monthlyMap.get(i)));
        }

        return chartData;
    }

    @Transactional(readOnly = true)
    public List<TopProductDTO> getTopSellingProducts() {
        List<Object[]> results = orderRepository.getTopSellingProducts(PageRequest.of(0, 5));
        List<TopProductDTO> topProducts = new ArrayList<>();

        for (Object[] row : results) {
            String name = (String) row[0];
            Long totalSold = ((Number) row[1]).longValue();
            BigDecimal totalRevenue = (BigDecimal) row[2];

            topProducts.add(new TopProductDTO(name, totalSold, totalRevenue));
        }
        return topProducts;
    }

    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getLowStock(){
        List<ProductVariant> variantList = productVariantRepository.findAllLowStock();

        return variantList.stream()
                .map(productVariantMapper::toProductVariantResponse)
                .toList();
    }
}