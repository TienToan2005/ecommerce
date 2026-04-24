package com.tientoan21.dto.response;

import com.tientoan21.enums.UserRole;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    private UserRole role;
    private LocalDate birthday;
}
