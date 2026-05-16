package com.tientoan21.dto.request;

import java.time.LocalDate;

public record UpdateProfileRequest(
        String fullName,
        String email,
        String phoneNumber,
        LocalDate birthday,
        String avatar
) {
}
