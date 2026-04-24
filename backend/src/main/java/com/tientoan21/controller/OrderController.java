package com.tientoan21.controller;

import com.tientoan21.dto.request.OrderRequest;
import com.tientoan21.dto.request.UpdateOrderStatus;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.OrderResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.Param;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.OrderService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> placeOrder(@RequestBody OrderRequest request, HttpServletRequest httpServletRequest ){
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.placeOrder(request,httpServletRequest))
                .build();
    }
    @GetMapping
    public ApiResponse<Page<OrderResponse>> getAllOrder(Pageable pageable){
        return ApiResponse.<Page<OrderResponse>>builder()
                .data(orderService.getAllOrder(pageable))
                .build();
    }
    @GetMapping("/my_order")
    public ApiResponse<Page<OrderResponse>> getUserOrders(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.<Page<OrderResponse>>builder()
                .data(orderService.getUserOrders(pageable))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Long id){
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.getOrderById(id))
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<OrderResponse> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatus request){
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.updateOrderStatus(id,request.status()))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable Long id){
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.cancelOrder(id))
                .build();
    }
    @GetMapping("/vnpay/return")
    public ApiResponse<OrderResponse> verifyVnPayPayment(@RequestParam("query") String query) {
        return ApiResponse.<OrderResponse>builder()
                .data(orderService.verifyVnPayPayment(query))
                .build();
    }
}
