package com.tientoan21.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAlertListener {
    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAlert(AdminAlertEvent event) {
        try {
            messagingTemplate.convertAndSend("/topic/admin-notifications", event.message());
        } catch (Exception e) {
            log.warn("Không gửi được cảnh báo cho admin: {}", e.getMessage());
        }
    }
}
