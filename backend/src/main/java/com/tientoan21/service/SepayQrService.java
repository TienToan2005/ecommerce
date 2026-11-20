package com.tientoan21.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Dựng URL ảnh QR VietQR (do SePay cung cấp) cho một đơn thanh toán bằng chuyển khoản.
 * Số tài khoản (hoặc số VA) và ngân hàng lấy từ biến môi trường, không để trong code.
 */
@Service
public class SepayQrService {

    private final String account;
    private final String bank;
    private final String baseUrl;

    public SepayQrService(@Value("${sepay.qr.account:}") String account,
                          @Value("${sepay.qr.bank:}") String bank,
                          @Value("${sepay.qr.base-url:https://qr.sepay.vn/img}") String baseUrl) {
        this.account = account;
        this.bank = bank;
        this.baseUrl = baseUrl;
    }

    /** @return URL ảnh QR, hoặc null nếu chưa cấu hình tài khoản nhận tiền. */
    public String buildQrUrl(String paymentCode, BigDecimal amount) {
        if (account.isBlank() || bank.isBlank() || paymentCode == null || amount == null) {
            return null;
        }
        return baseUrl
                + "?acc=" + encode(account)
                + "&bank=" + encode(bank)
                + "&amount=" + amount.longValue()
                + "&des=" + encode(paymentCode);
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
