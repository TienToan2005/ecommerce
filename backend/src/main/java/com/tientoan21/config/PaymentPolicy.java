package com.tientoan21.config;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

/** Một nguồn duy nhất cho thời hạn thanh toán online; dùng chung cho job hủy đơn và API trả về cho frontend. */
public final class PaymentPolicy {
    public static final Duration PAYMENT_WINDOW = Duration.ofMinutes(15);
    /** Múi giờ mà mọi LocalDateTime (vd. createdAt) trong ứng dụng được ghi theo. */
    public static final ZoneId APP_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private PaymentPolicy() {
    }

    /** createdAt là LocalDateTime ghi theo APP_ZONE (ComApplication đặt múi giờ mặc định trước khi khởi động). */
    public static Instant expiresAt(LocalDateTime createdAt) {
        if (createdAt == null) {
            return null;
        }
        return createdAt.atZone(APP_ZONE).toInstant()
                .plus(PAYMENT_WINDOW)
                .truncatedTo(ChronoUnit.SECONDS);
    }
}
