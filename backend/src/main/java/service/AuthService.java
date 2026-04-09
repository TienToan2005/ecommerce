package service;

import config.JwtUtils;
import dto.request.LoginRequest;
import dto.request.RegisterRequest;
import dto.response.RefreshTokenResponse;
import dto.response.TokenResponse;
import dto.response.UserResponse;
import entity.RefreshToken;
import entity.User;
import enums.ErrorCode;
import enums.UserRole;
import exception.AppException;
import lombok.RequiredArgsConstructor;
import mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import repository.UserRepository;


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
            throw new AppException(ErrorCode.USER_EXISTS);
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .role(UserRole.USER)
                .password(passwordEncoder.encode(request.password()))
                .birthday(request.birthday())
                .address(request.address())
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
