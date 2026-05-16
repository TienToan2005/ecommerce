package com.tientoan21.task;

import com.tientoan21.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class UnverifiedUserCleanupTask {

    private final UserRepository userRepository;

    /**
     * Hàm này sẽ tự động chạy ngầm mỗi ngày 1 lần vào đúng 02:00 sáng.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanUpTrashAccounts() {
        log.info("🧹 Bắt đầu tiến trình dọn dẹp tài khoản chưa xác thực...");

        // Chọn mốc thời gian: Những tài khoản tạo cách đây hơn 24 giờ
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);

        // Gọi hàm xóa và lấy số lượng bị chém
        int deletedCount = userRepository.deleteByIsEnabledFalseAndCreatedAtBefore(cutoffTime);

        if (deletedCount > 0) {
            log.info("✅ Đã chém bay {} tài khoản rác (Đăng ký quá 24h mà không kích hoạt).", deletedCount);
        } else {
            log.info("✨ Database sạch bóng, không có tài khoản rác nào cần dọn.");
        }
    }
}