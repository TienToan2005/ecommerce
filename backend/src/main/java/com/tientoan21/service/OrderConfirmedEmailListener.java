package com.tientoan21.service;

import com.tientoan21.entity.Order;
import com.tientoan21.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConfirmedEmailListener {
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void onOrderConfirmed(OrderConfirmedEvent event) {
        try {
            Order order = orderRepository.findByOrderNumber(event.orderNumber()).orElse(null);
            if (order == null) {
                return;
            }
            emailService.sendOrderConfirmationEmail(order);
        } catch (Exception e) {
            log.error("Lỗi gửi email xác nhận đơn {}: {}", event.orderNumber(), e.getMessage());
        }
    }
}
