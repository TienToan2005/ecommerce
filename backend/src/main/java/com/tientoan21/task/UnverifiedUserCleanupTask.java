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
     * Hàm này sẽ tự động chạy ngầm theo lịch sếp cài đặt.
     * Ở đây tôi đang cài chạy mỗi ngày 1 lần vào đúng 02:00 sáng.
     * (Cú pháp Cron: Giây Phút Giờ Ngày Tháng Thứ)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanUpTrashAccounts() {
        log.info("🧹 Bắt đầu tiến trình dọn dẹp tài khoản chưa xác thực...");

        LocalDateTime currentTime = LocalDateTime.now();

        int deletedCount = userRepository.deleteUnverifiedAndExpiredUsers(currentTime);

        if (deletedCount > 0) {
            log.info("✅ Đã chém bay {} tài khoản rác (Hết hạn OTP mà không kích hoạt).", deletedCount);
        } else {
            log.info("✨ Không có tài khoản rác nào cần dọn.");
        }
    }
}