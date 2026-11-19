package com.tientoan21.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SepayWebhookRequest(
        Long id,
        String gateway,
        String transactionDate,
        String accountNumber,
        String subAccount,
        String code,
        String content,
        String transferType,
        String description,
        Long transferAmount,
        Long accumulated,
        String referenceCode
) {
}