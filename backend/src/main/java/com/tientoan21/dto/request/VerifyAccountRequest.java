package com.tientoan21.dto.request;

public record VerifyAccountRequest(
    String email,
    String otp
) {
}
