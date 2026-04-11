package controller;

import dto.request.LoginRequest;
import dto.request.RegisterRequest;
import dto.response.ApiResponse;
import dto.response.RefreshTokenResponse;
import dto.response.TokenResponse;
import dto.response.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import service.AuthService;

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
