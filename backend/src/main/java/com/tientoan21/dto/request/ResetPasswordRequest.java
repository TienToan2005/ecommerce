package com.tientoan21.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResetPasswordRequest(
        @NotNull(message = "OTP is required")
        String otp,
        @NotBlank(message = "Email is required")
        String email,
        @NotBlank(message = "Password is required")
        String newPassword
) {
}
