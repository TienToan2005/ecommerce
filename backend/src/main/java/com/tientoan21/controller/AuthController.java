package com.tientoan21.controller;

import com.tientoan21.dto.request.LoginRequest;
import com.tientoan21.dto.request.RegisterRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.RefreshTokenResponse;
import com.tientoan21.dto.response.TokenResponse;
import com.tientoan21.dto.response.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@RequestBody @Valid LoginRequest request){
        return ApiResponse.<TokenResponse>builder()
                .data(authService.login(request))
                .build();
    }
    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody @Valid RegisterRequest request){
        return ApiResponse.<UserResponse>builder()
                .data(authService.register(request))
                .build();
    }
    @PostMapping("/refresh")
    public ApiResponse<RefreshTokenResponse> refresh(@RequestParam String token){
        return ApiResponse.<RefreshTokenResponse>builder()
                .data(authService.refreshToken(token))
                .build();
    }
}
