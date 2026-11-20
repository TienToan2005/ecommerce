package com.tientoan21;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.tientoan21.config.PaymentPolicy;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class ComApplication {

	// ÉP MÚI GIỜ VIỆT NAM: chạy khi lớp được nạp, trước khi Spring tạo bean nào,
	// cả khi khởi động qua main() lẫn khi @SpringBootTest nạp lớp này
	static {
		TimeZone.setDefault(TimeZone.getTimeZone(PaymentPolicy.APP_ZONE));
	}

	public static void main(String[] args) {
		SpringApplication.run(ComApplication.class, args);
	}
}
