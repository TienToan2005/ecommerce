package com.tientoan21.service;

import com.tientoan21.entity.Order;
import com.tientoan21.entity.OrderItem;
import com.tientoan21.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOrderConfirmationEmail(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            NumberFormat format = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

            StringBuilder itemsHtml = new StringBuilder();
            for (OrderItem item : order.getOrderItemList()) {
                itemsHtml.append("<li>")
                        .append(item.getProductVariant().getProduct().getName())
                        .append(" (").append(item.getProductVariant().getSku()).append(") - ")
                        .append("SL: ").append(item.getQuantity()).append(" - ")
                        .append(format.format(item.getPrice()))
                        .append("</li>");
            }

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2e6c80;">Cảm ơn bạn đã mua hàng tại TPHONE! 🎉</h2>
                    <p>Xin chào <b>%s</b>,</p>
                    <p>Đơn hàng <b>#%d</b> của bạn đã được thanh toán thành công và đang được chuẩn bị.</p>
                    <hr>
                    <h3>Chi tiết đơn hàng:</h3>
                    <ul>
                        %s
                    </ul>
                    <hr>
                    <h3 style="color: #d9534f;">Tổng thanh toán: %s</h3>
                    <p>Chúng tôi sẽ sớm giao hàng đến địa chỉ: <i>%s</i></p>
                    <br>
                    <p>Trân trọng,<br><b>Đội ngũ TPHONE</b></p>
                </div>
                """.formatted(
                    order.getUser().getEmail(),
                    order.getId(),
                    itemsHtml.toString(),
                    format.format(order.getTotalPrice()),
                    order.getAddress()
            );

            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Xác nhận đơn hàng #" + order.getId() + " - TPHONE");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email xác nhận cho đơn hàng: " + order.getId());

        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email cho đơn hàng: " + order.getId(), e);
        }
    }
    public void sendOtpEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String htmlContent = """
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
                <h2>Mã xác thực tài khoản TPHONE</h2>
                <h2>Chào %s,</h2>
                <p>Mã OTP xác thực của bạn là:</p>
                <div style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 5px; padding: 15px; border: 2px dashed #007bff; display: inline-block; margin-bottom: 20px;">
                    %s
                </div>
                <p style="color: red; font-size: 12px;"><i>Mã này sẽ hết hạn sau 15 phút.</i></p>
                <p>Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            </div>
            """.formatted(user.getFullName(), user.getVerificationCode());

            helper.setTo(user.getEmail());
            helper.setSubject("Mã OTP xác thực đăng ký - TPHONE");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Lỗi gửi email xác thực OTP", e);
        }
    }
    public void sendVerificationEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String verifyLink = "http://localhost:8080/api/auth/verify?code=" + user.getVerificationCode();

            String htmlContent = """
            <div style="font-family: Arial; padding: 20px;">
                <h2>Chào %s,</h2>
                <p>Vui lòng click vào link dưới đây để kích hoạt tài khoản:</p>
                <a href="%s" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none;">Kích hoạt tài khoản</a>
            </div>
            """.formatted(user.getFullName(), verifyLink);

            helper.setTo(user.getEmail());
            helper.setSubject("Kích hoạt tài khoản TPHONE");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Lỗi gửi email xác thực", e);
        }
    }

    public void sendForgotPasswordEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String htmlContent = """
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
                <h2>Mã xác thực tài khoản TPHONE</h2>
                <h2>Chào %s,</h2>
                <p>Mã OTP xác thực của bạn là:</p>
                <div style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 5px; padding: 15px; border: 2px dashed #007bff; display: inline-block; margin-bottom: 20px;">
                    %s
                </div>
                <p style="color: red; font-size: 12px;"><i>Mã này sẽ hết hạn sau 15 phút.</i></p>
                <p>Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            </div>
            """.formatted(user.getFullName(),user.getVerificationCode());

            helper.setTo(user.getEmail());
            helper.setSubject("Mã OTP xác thực quên mật khẩu - TPHONE");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e){
            log.error("Lỗi gửi email xác thực", e);
        }
    }
}