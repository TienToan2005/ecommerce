package com.tientoan21.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.tientoan21.config.JwtUtils;
import com.tientoan21.dto.request.GoogleLoginRequest;
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
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.tientoan21.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

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

    private final RedisTemplate<String, Object> redisTemplate;
    private GoogleIdTokenVerifier verifier;

    @Value("${app.security.cookie.secure}")
    private boolean isCookieSecure;
    @Value("${oauth2.clientId}")
    private String clientID;

    @PostConstruct
    public void init() {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientID))
                .build();
    }

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

        ResponseCookie cookie = buildRefreshTokenCookie(refreshToken.getToken(), 7 * 24 * 60 * 60);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .authenticated(true)
                .username(request.username())
                .role(user.getRole().name())
                .build();
    }
    @Transactional
    public TokenResponse googleLogin(GoogleLoginRequest request, HttpServletResponse response) {
        try {
            GoogleIdToken idToken = verifier.verify(request.credential());
            if (idToken == null) {
                throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Token Google không hợp lệ!");
            }

            // 2. Móc thông tin từ Google ra
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture"); // Móc luôn Avatar của Google

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                user = User.builder()
                        .fullName(name)
                        .email(email)
                        .avatar(pictureUrl)
                        .role(UserRole.USER)
                        .isEnabled(true)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .build();
                user = userRepository.save(user);
            }

            var accessToken = jwtUtils.generateAccessToken(user);
            var refreshToken = refreshTokenService.createRefreshToken(user);

            ResponseCookie cookie = buildRefreshTokenCookie(refreshToken.getToken(), 7 * 24 * 60 * 60);
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return TokenResponse.builder()
                    .accessToken(accessToken)
                    .authenticated(true)
                    .username(user.getEmail())
                    .role(user.getRole().name())
                    .build();

        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Lỗi xác thực Google: " + e.getMessage());
        }
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
                .build();

        User savedUser = userRepository.save(user);

        String redisKey = "OTP:REGISTER:" + request.email();
        redisTemplate.opsForValue().set(redisKey, otp, 15, TimeUnit.MINUTES);

        emailService.sendVerificationEmail(savedUser, otp);

        return userMapper.toUserResponse(savedUser);
    }

    @Transactional
    public RefreshTokenResponse refreshToken(String token, HttpServletResponse response) {
        RefreshToken oldToken = refreshTokenService.verifyToken(token);
        RefreshToken newRefreshToken = refreshTokenService.rotateToken(oldToken);
        String newAccessToken = jwtUtils.generateAccessToken(newRefreshToken.getUser());

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
    public void verifyAccount(String email, String otp) {
        String redisKey = "OTP:REGISTER:" + email;
        String savedOtp = (String) redisTemplate.opsForValue().get(redisKey);

        if (savedOtp == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
        if (!savedOtp.equals(otp)) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (user.isEnabled()) {
            throw new AppException(ErrorCode.USER_ALREADY_VERIFIED);
        }

        user.setEnabled(true);
        userRepository.save(user);

        redisTemplate.delete(redisKey);
    }

    @Transactional
    public void resendOtp(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.isEnabled()) {
            throw new AppException(ErrorCode.USER_ALREADY_VERIFIED);
        }

        String otp = generateOTP();
        String redisKey = "OTP:REGISTER:" + email;
        redisTemplate.opsForValue().set(redisKey, otp, 15, TimeUnit.MINUTES);

        emailService.sendOtpEmail(user, otp);
    }

    @Transactional
    public void forgotPassword(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String resetCode = generateOTP();
        String redisKey = "OTP:FORGOT:" + email;
        redisTemplate.opsForValue().set(redisKey, resetCode, 15, TimeUnit.MINUTES);

        emailService.sendForgotPasswordEmail(user, resetCode);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request){
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String redisKey = "OTP:FORGOT:" + request.email();
        String savedOtp = (String) redisTemplate.opsForValue().get(redisKey);

        if (savedOtp == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
        if (!savedOtp.equals(request.otp())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        redisTemplate.delete(redisKey);
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}