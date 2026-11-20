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
            return save(request,null,null,SepayResult.ORDER_NOT_FOUND, "no code");
        }

        Optional<Order> found = orderRepository.findByPaymentCode(code);
        if (found.isEmpty()){
            return save(request,null,code,SepayResult.ORDER_NOT_FOUND,"...");
        }
        Order order = found.get();
        if(order.getStatus() != OrderStatus.PENDING){
            return save(request,order,code,SepayResult.ORDER_NOT_PENDING,"...");
        }
        int cmp = BigDecimal.valueOf(request.transferAmount()).compareTo(order.getGrandTotal());
        if (cmp < 0)  return save(request, order, code, SepayResult.UNDERPAID, "insufficient transaction");
        orderService.updatePaymentStatus(order.getOrderNumber(), PaymentStatus.COMPLETED);
        voucherService.subtractionVoucher(order.getOrderNumber());
        return save(request, order, code, cmp == 0 ? SepayResult.PAID : SepayResult.PAID_OVERPAID, cmp == 0 ? "success" : "excess transaction");
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
