package service;

import entity.RefreshToken;
import entity.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import repository.RefreshTokenRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private RefreshTokenRepository refreshTokenRepository;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 3;

    public RefreshToken createRefreshToken(User user){
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setRevoked(false);
        refreshToken.setExpiryDate(LocalDate.from(Instant.now().plus(REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS)));

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
        if(refreshToken.getExpiryDate().isBefore(LocalDate.now())){
            throw new RuntimeException("Refresh token expired");
        }
        return  refreshToken;
    }
}
