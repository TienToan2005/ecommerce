package com.tientoan21.service;

import com.tientoan21.dto.request.SepayWebhookRequest;
import com.tientoan21.entity.Order;
import com.tientoan21.entity.PaymentTransaction;
import com.tientoan21.enums.OrderStatus;
import com.tientoan21.enums.PaymentStatus;
import com.tientoan21.enums.SepayResult;
import com.tientoan21.repository.OrderRepository;
import com.tientoan21.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class SepayPaymentProcessor {
    private final PaymentTransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final VoucherService voucherService;
    private final ApplicationEventPublisher eventPublisher;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final Pattern CODE_PATTERN = Pattern.compile("TC[A-Z0-9]{8}", Pattern.CASE_INSENSITIVE);

    @Transactional
    public SepayResult process(SepayWebhookRequest request){
        if (!"in".equalsIgnoreCase(request.transferType())){
            return SepayResult.IGNORED;
        }
        if(transactionRepository.existsBySepayTransactionId(request.id())){
            return null;
        }
        String code = extractCode(request);
        if (code == null){
            return unapplied(request, null, null, SepayResult.ORDER_NOT_FOUND, "Không tìm thấy mã thanh toán trong nội dung chuyển khoản");
        }

        Optional<Order> found = orderRepository.findByPaymentCode(code);
        if (found.isEmpty()){
            return unapplied(request, null, code, SepayResult.ORDER_NOT_FOUND, "Không có đơn nào ứng với mã " + code);
        }
        Order order = found.get();
        if(order.getStatus() != OrderStatus.PENDING){
            long earlier = transactionRepository.sumReceived(order);
            return unapplied(request, order, code, SepayResult.ORDER_NOT_PENDING,
                    "Đơn " + order.getOrderNumber() + " đang ở trạng thái " + order.getStatus() + ", không nhận thanh toán"
                            + (earlier > 0 ? " (trước đó đã nhận " + earlier + "đ cho đơn này)" : ""));
        }
        long received = transactionRepository.sumReceived(order) + request.transferAmount();
        int cmp = BigDecimal.valueOf(received).compareTo(order.getGrandTotal());
        if (cmp < 0) {
            return save(request, order, code, SepayResult.UNDERPAID, underpaidNote(received, order.getGrandTotal()));
        }

        boolean changed = orderService.updatePaymentStatus(order.getOrderNumber(), PaymentStatus.COMPLETED);
        if (changed)  voucherService.subtractionVoucher(order.getOrderNumber());
        return save(request, order, code, cmp == 0 ? SepayResult.PAID : SepayResult.PAID_OVERPAID, cmp == 0 ? "Đủ tiền" : "Thanh toán dư");
    }

    private String underpaidNote(long received, BigDecimal required) {
        return "Đã nhận " + received + "đ / cần " + required + "đ, còn thiếu " + required.subtract(BigDecimal.valueOf(received)) + "đ";
    }

    /** Lưu giao dịch tiền đã về nhưng không áp được vào đơn nào, và báo cho admin xử lý (hoàn tiền/đối soát). */
    private SepayResult unapplied(SepayWebhookRequest request, Order order, String code, SepayResult result, String note) {
        SepayResult saved = save(request, order, code, result, note);
        eventPublisher.publishEvent(new AdminAlertEvent(
                "SEPAY: có khoản " + request.transferAmount() + "đ chưa áp dụng (giao dịch " + request.id() + "): " + note));
        return saved;
    }

    private SepayResult save(SepayWebhookRequest request, Order order, String code, SepayResult result, String note) {
        PaymentTransaction paymentTransaction = PaymentTransaction.builder()
                .amount(request.transferAmount())
                .order(order)
                .note(note)
                .paymentCode(code)
                .sepayTransactionId(request.id())
                .gateway(request.gateway())
                .result(result)
                .content(request.content())
                .transferType(request.transferType())
                .transactionDate(parseDate(request.transactionDate()))
                .referenceCode(request.referenceCode())
                .build();

        transactionRepository.save(paymentTransaction);
        return result;
    }
    private String extractCode(SepayWebhookRequest p) {
        if (p.code() != null) { String c = p.code().trim().toUpperCase();
           if (CODE_PATTERN.matcher(c).matches()) return c;
        }
        if (p.content() == null) return null;
        Matcher m = CODE_PATTERN.matcher(p.content()); if (m.find()) return m.group().toUpperCase();
        return null;
    }
    private LocalDateTime parseDate(String s){
        if(s == null) return null;
        try {
            return LocalDateTime.parse(s, DATE_FORMAT);
        } catch (DateTimeParseException e) {
            log.warn("Sai định dạng ngày: {}", s);
            return null;
        }
    }
}
