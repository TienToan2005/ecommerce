package com.tientoan21.service;

import com.tientoan21.config.VNPayConfig;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.entity.Order;
import com.tientoan21.enums.PaymentStatus;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final VNPayConfig vnPayConfig;
    private final OrderService orderService;

    // --- LOGIC 1: TẠO LINK THANH TOÁN ---
    public String createVnPayPaymentUrl(Order order, HttpServletRequest request) {
        long amount = order.getTotalPrice().longValue() * 100;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", order.getOrderNumber());
        vnp_Params.put("vnp_OrderInfo", "ThanhToanDonHang_" + order.getOrderNumber());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");
        //vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8).replace("+", "%20");

                hashData.append(fieldName).append('=').append(encodedValue);
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8).replace("+", "%20"))
                        .append('=').append(encodedValue);

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        System.out.println("\n========== 🐞 VNPAY DEBUG 🐞 ==========");
        System.out.println("Chuỗi dữ liệu gốc (hashData): \n" + hashData.toString());
        System.out.println("URL thanh toán cuối cùng: \n" + vnPayConfig.getVnp_PayUrl() + "?" + queryUrl);
        System.out.println("=======================================\n");

        return vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
    }

    // --- LOGIC 2: XỬ LÝ IPN KHI VNPAY GỌI VỀ ---
    public ApiResponse<?> processReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String signValue = hashAllFields(fields, vnPayConfig.getSecretKey());

        if (signValue.equals(vnp_SecureHash)) {
            String orderCode = fields.get("vnp_TxnRef");
            String responseCode = fields.get("vnp_ResponseCode");

            if ("00".equals(responseCode)) {
                orderService.updatePaymentStatus(orderCode, PaymentStatus.COMPLETED);

                return ApiResponse.builder().data("Thanh toán thành công").build();
            } else {
                orderService.updatePaymentStatus(orderCode, PaymentStatus.FAILED);
                return ApiResponse.builder().data("Thanh toán thất bại").build();
            }
        } else {
            return ApiResponse.builder().data("Chữ ký không hợp lệ").build();
        }
    }

    // Helper method để hash data lúc nhận IPN
    private String hashAllFields(Map<String, String> fields, String secretKey) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName).append("=");

                sb.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8).replace("+", "%20"));

                if (itr.hasNext()) {
                    sb.append("&");
                }
            }
        }
        return VNPayConfig.hmacSHA512(secretKey, sb.toString());
    }
}