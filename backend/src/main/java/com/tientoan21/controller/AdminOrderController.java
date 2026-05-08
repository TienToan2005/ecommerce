package com.tientoan21.controller;

import com.tientoan21.dto.request.UpdateOrderStatus;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.OrderResponse;
import com.tientoan21.enums.OrderStatus;
import com.tientoan21.service.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {
    private  final AdminOrderService orderImplService;

    @GetMapping
    public ApiResponse<Page<OrderResponse>> getAllOrders(
            @RequestParam(value = "search",required = false) String search,
            @RequestParam(value = "status",required = false) String status,
            Pageable pageable) {

        return ApiResponse.<Page<OrderResponse>>builder()
                .data(orderImplService.getAllOrders(search, status, pageable))
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<OrderResponse> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatus request){
        return ApiResponse.<OrderResponse>builder()
                .data(orderImplService.updateOrderStatus(id,request.status()))
                .build();
    }
}
