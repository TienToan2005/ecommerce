package com.tientoan21.service;

import com.tientoan21.config.JwtUtils;
import com.tientoan21.dto.request.LoginRequest;
import com.tientoan21.dto.request.RegisterRequest;
import com.tientoan21.dto.request.ResetPasswordRequest;
import com.tientoan21.dto.response.RefreshTokenResponse;
import com.tientoan21.dto.response.TokenResponse;
import com.tientoan21.dto.response.UserResponse;
import com.tientoan21.entity.RefreshToken;
import com.tientoan21.entity.User;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.enums.UserRole;
import com.tientoan21.exception.AppException;
import com.tientoan21.repository.RefreshTokenRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.tientoan21.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.security.cookie.secure}")
    private boolean isCookieSecure;

    private ResponseCookie buildRefreshTokenCookie(String token, long maxAgeInSeconds) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(isCookieSecure)
                .path("/")
                .maxAge(maxAgeInSeconds)
                .sameSite("Lax")
                .build();
    }

    public TokenResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmailOrPhoneNumber(request.username(), request.username())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Password does not match");
        }

        var accessToken = jwtUtils.generateAccessToken(user);
        var refreshToken = refreshTokenService.createRefreshToken(user);

        // Sử dụng hàm helper, sống 7 ngày
        ResponseCookie cookie = buildRefreshTokenCookie(refreshToken.getToken(), 7 * 24 * 60 * 60);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .authenticated(true)
                .username(request.username())
                .role(user.getRole().name())
                .build();
    }

    @Transactional(rollbackFor = Exception.class)
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new AppException(ErrorCode.USER_EXISTS, "Email already exists");
        }
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new AppException(ErrorCode.USER_EXISTS, "Phone already exists");
        }
        String otp = generateOTP();

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .role(UserRole.USER)
                .password(passwordEncoder.encode(request.password()))
                .birthday(request.birthday())
                .isEnabled(false)
                .verificationCode(otp)
                .verificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        User savedUser = userRepository.save(user);
        emailService.sendVerificationEmail(savedUser);

        return userMapper.toUserResponse(savedUser);
    }

    @Transactional
    public RefreshTokenResponse refreshToken(String token, HttpServletResponse response) {
        // Kiểm tra token cũ
        RefreshToken oldToken = refreshTokenService.verifyToken(token);

        // Cấp phát token mới (Rotate)
        RefreshToken newRefreshToken = refreshTokenService.rotateToken(oldToken);
        String newAccessToken = jwtUtils.generateAccessToken(newRefreshToken.getUser());

        // CHUẨN HOÁ: Ghi đè Cookie cũ bằng Refresh Token mới
        ResponseCookie cookie = buildRefreshTokenCookie(newRefreshToken.getToken(), 7 * 24 * 60 * 60);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .build();
    }

    @Transactional
    public void logout(String token, HttpServletResponse response) {
        if (token != null) {
            refreshTokenRepository.deleteByToken(token);
        }

        ResponseCookie deleteCookie = buildRefreshTokenCookie("", 0);
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
    }

    @Transactional
    public void verifyAccount(String email,String otp) {
        User user = userRepository.findByEmailAndVerificationCode(email,otp)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        if (user.isEnabled()) {
            throw new AppException(ErrorCode.USER_ALREADY_VERIFIED);
        }

        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);

        userRepository.save(user);
    }

    @Transactional
    public void resendOtp(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.isEnabled()) {
            throw new AppException(ErrorCode.USER_ALREADY_VERIFIED);
        }
        String otp = generateOTP();
        user.setVerificationCode(otp);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        emailService.sendOtpEmail(user);
    }

    @Transactional
    public void forgotPassword(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String resetCode = generateOTP();
        user.setVerificationCode(resetCode);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        emailService.sendForgotPasswordEmail(user);
    }
    @Transactional
    public void resetPassword(ResetPasswordRequest request){
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if(user.getVerificationCode() == null || !user.getVerificationCode().equals(request.otp())){
            throw new AppException(ErrorCode.INVALID_OTP);
        }
        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);

    }
    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
