package com.tientoan21.controller;

import com.tientoan21.dto.request.*;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.RefreshTokenResponse;
import com.tientoan21.dto.response.TokenResponse;
import com.tientoan21.dto.response.UserResponse;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import jakarta.servlet.http.HttpServletResponse; // <--- Cần import cái này
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
    public ApiResponse<TokenResponse> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletResponse response
    ){
        return ApiResponse.<TokenResponse>builder()
                .data(authService.login(request, response))
                .build();
    }
    @PostMapping("/google")
    public ApiResponse<TokenResponse> googleLogin(@RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        return ApiResponse.<TokenResponse>builder()
                .data(authService.googleLogin(request, response))
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody @Valid RegisterRequest request){
        return ApiResponse.<UserResponse>builder()
                .data(authService.register(request))
                .build();
    }

    @PostMapping("/verify")
    public ApiResponse<String> verifyOtp(@RequestBody VerifyAccountRequest request) {
        authService.verifyAccount(request.email(), request.otp());
        return ApiResponse.<String>builder()
                .data("Kích hoạt tài khoản thành công!")
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<RefreshTokenResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ){
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return ApiResponse.<RefreshTokenResponse>builder()
                .data(authService.refreshToken(refreshToken, response))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ){
        authService.logout(refreshToken, response);
        return ApiResponse.<String>builder()
                .data("Đăng xuất thành công!")
                .build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<String> resendOtp(@RequestParam String email) {
        authService.resendOtp(email);
        return ApiResponse.<String>builder().data("Mã OTP mới đã được gửi!").build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ApiResponse.<String>builder().data("Mã khôi phục đã được gửi tới email của bạn.").build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.<String>builder().data("Đổi mật khẩu thành công!").build();
    }
}