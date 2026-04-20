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
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.UserMapper;
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

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findUsersByEmailOrPhoneNumber(request.username(), request.username())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if(!passwordEncoder.matches(request.password(), user.getPassword())){
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Password does not match");
        }
        var accessToken = jwtUtils.generateAccessToken(user);
        var refreshToken = refreshTokenService.createRefreshToken(user);
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .authenticated(true)
                .username(request.username())
                .role(user.getRole().name())
                .build();
    }
    public UserResponse register(RegisterRequest request){
        if(userRepository.existsByEmail(request.email())){
            throw new AppException(ErrorCode.USER_EXISTS, "Email already exists");
        }
        if(userRepository.existsByPhoneNumber(request.phoneNumber())){
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

    public RefreshTokenResponse refreshToken(String token){
        RefreshToken token1 = refreshTokenService.verifyToken(token);

        RefreshToken refreshToken = refreshTokenService.rotateToken(token1);

        String accessToken = jwtUtils.generateAccessToken(refreshToken.getUser());

        return RefreshTokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
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
