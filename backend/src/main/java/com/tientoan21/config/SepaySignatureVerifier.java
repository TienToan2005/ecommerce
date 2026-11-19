package com.tientoan21.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;

@Component
public class SepaySignatureVerifier {
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final long MAX_SKEW_SECONDS = 300;

    private final byte[] secret;

    public SepaySignatureVerifier(@Value("${sepay.webhook-secret}") String secret) {
        if(secret == null || secret.isBlank()){
            throw new IllegalStateException("Thiếu SEPAY_WEBHOOK_SECRET");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }
    public boolean verify(String timestampHeader, String signatureHeader, byte[] rawBody){
        if(timestampHeader == null || signatureHeader == null || rawBody == null){
            return false;
        }
        long timestamp;
        try {
            timestamp = Long.parseLong(timestampHeader.trim());
        }catch (NumberFormatException e){
            return false;
        }
        if (Math.abs(Instant.now().getEpochSecond() - timestamp) > MAX_SKEW_SECONDS){
            return false;
        }
        String expected = "sha256=" + HexFormat.of().formatHex(hmac(timestampHeader.trim(), rawBody));
        String received = signatureHeader.trim().toLowerCase(Locale.ROOT);

        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                received.getBytes(StandardCharsets.UTF_8)
        );
    }

    private byte[] hmac(String timestamp, byte[] rawBody) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret,HMAC_ALGORITHM));
            mac.update((timestamp + ".").getBytes(StandardCharsets.UTF_8));
            mac.update(rawBody);
            return mac.doFinal();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Lỗi tính HMAC", e);
        }
    }
}
