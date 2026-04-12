package com.tientoan21.dto.response;

import lombok.Builder;

@Builder
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String username;
    private String role;
    private Boolean authenticated;
}
