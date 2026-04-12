package com.tientoan21.service;

import com.tientoan21.config.JwtUtils;
import com.tientoan21.dto.request.LoginRequest;
import com.tientoan21.dto.request.RegisterRequest;
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


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findUsersByEmailOrPhoneNumber(request.username(), request.username())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if(passwordEncoder.matches(request.password(), user.getPassword())){
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

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .role(UserRole.USER)
                .password(passwordEncoder.encode(request.password()))
                .birthday(request.birthday())
                .build();

        //emailService

        return userMapper.toUserResponse(userRepository.save(user));
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
}
