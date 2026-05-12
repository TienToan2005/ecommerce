package com.tientoan21.controller;

import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.entity.Order;
import com.tientoan21.service.OrderService;
import com.tientoan21.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @PostMapping("/create-payment")
    public ApiResponse<String> createPayment(@RequestParam String orderNumber, HttpServletRequest request) {

        Order order = orderService.getOrderByNumber(orderNumber);

        String vnpayUrl = paymentService.createVnPayPaymentUrl(order, request);
        return ApiResponse.<String>builder()
                .data(vnpayUrl)
                .build();
    }
    @GetMapping("/payment-return")
    public ApiResponse<?> vnpayReturn(HttpServletRequest request) {
        return paymentService.processReturn(request);
    }
}