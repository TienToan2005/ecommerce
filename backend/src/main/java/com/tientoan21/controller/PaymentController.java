package com.tientoan21.controller;

import com.tientoan21.config.SepaySignatureVerifier;
import com.tientoan21.dto.request.SepayWebhookRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.entity.Order;
import com.tientoan21.service.OrderService;
import com.tientoan21.service.PaymentService;
import com.tientoan21.service.SepayWebhookService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@Slf4j
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final SepaySignatureVerifier verifier;
    private final SepayWebhookService sepayWebhookService;
    private static final ObjectMapper MAPPER = new ObjectMapper();

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

    @PostMapping("/sepay-webhook")
    public ResponseEntity<Map<String, Object>> receive(
            @RequestBody byte[] rawBody,
            @RequestHeader(value = "X-SePay-Timestamp", required = false) String timestamp,
            @RequestHeader(value = "X-SePay-Signature", required = false) String signature) {

        if (!verifier.verify(timestamp, signature, rawBody)) {
            return ResponseEntity.status(401).body(Map.of("success", false));
        }

        SepayWebhookRequest payload;
        try {
            payload = MAPPER.readValue(rawBody, SepayWebhookRequest.class);
        } catch (tools.jackson.core.JacksonException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }
        sepayWebhookService.handle(payload);
        log.info("SePay webhook: id={}, type={}, amount={}",
                payload.id(), payload.transferType(), payload.transferAmount());

        return ResponseEntity.ok(Map.of("success", true));
    }

}