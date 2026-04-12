package com.tientoan21.dto.request;

import com.tientoan21.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record UserRequest(
        @NotBlank(message = "Name is required")
        String fullName,

        @NotBlank(message = "Email is required")
        @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Email format is invalid")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?[0-9]{10}$", message = "Phone number must be 10 digits long")
        String phoneNumber,

        @NotBlank(message = "Password is required")
        String password,

        LocalDate birthday,
        UserRole role
) {
}
