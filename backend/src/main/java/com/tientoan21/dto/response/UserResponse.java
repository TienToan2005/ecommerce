package com.tientoan21.dto.response;

import com.tientoan21.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Builder
@Getter
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    private UserRole role;
    private LocalDate birthday;
}
