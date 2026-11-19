package com.tientoan21.service;

import com.tientoan21.dto.request.SepayWebhookRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SepayWebhookService {

    private final SepayPaymentProcessor processor;

    public void handle(SepayWebhookRequest payload) {
        try {
            processor.process(payload);
        } catch (DataIntegrityViolationException e) {
            log.info("SePay giao dịch trùng id={}, bỏ qua", payload.id());
        }
    }
}
