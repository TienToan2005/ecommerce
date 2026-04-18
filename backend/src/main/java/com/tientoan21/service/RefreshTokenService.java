package com.tientoan21.service;

import com.tientoan21.entity.RefreshToken;
import com.tientoan21.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.tientoan21.repository.RefreshTokenRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 3;

    public RefreshToken createRefreshToken(User user){
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setRevoked(false);
        refreshToken.setExpiryDate(Instant.now().plus(REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS));
        return refreshTokenRepository.save(refreshToken);
    }
    public RefreshToken rotateToken(RefreshToken oldToken){
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        RefreshToken newToken = createRefreshToken(oldToken.getUser());
        newToken.setParent(oldToken);

        return refreshTokenRepository.save(newToken);
    }

    public RefreshToken verifyToken(String token){
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if(refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh token already revoked");
        }
        if(refreshToken.getExpiryDate().isBefore(Instant.now())){
            throw new RuntimeException("Refresh token expired");
        }
        return  refreshToken;
    }
}
