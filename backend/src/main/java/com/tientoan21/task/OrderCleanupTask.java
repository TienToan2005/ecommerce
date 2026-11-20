package com.tientoan21.task;

import com.tientoan21.entity.Order;
import com.tientoan21.entity.OrderItem;
import com.tientoan21.config.PaymentPolicy;
import com.tientoan21.enums.OrderStatus;
import com.tientoan21.enums.PaymentMethod;
import com.tientoan21.repository.PaymentTransactionRepository;
import com.tientoan21.service.AdminAlertEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.tientoan21.enums.PaymentStatus;
import com.tientoan21.repository.OrderRepository;
import com.tientoan21.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderCleanupTask {
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedRate = 15000) // quét 15 giây/lần để đơn hết hạn bị hủy gần đúng lúc trang báo hết giờ
    @Transactional
    public void cancelExpiredOrders(){
        LocalDateTime expiredBefore = LocalDateTime.now().minus(PaymentPolicy.PAYMENT_WINDOW);

        // Chỉ hủy đơn thanh toán online; đơn COD chờ admin xác nhận. Khóa từng đơn để không đua với webhook.
        List<Order> expiredOrders = orderRepository.findExpiredForUpdate(
                OrderStatus.PENDING, expiredBefore, List.of(PaymentMethod.SEPAY, PaymentMethod.VNPAY)
        );

        if(!expiredOrders.isEmpty()){
            log.info("Phát hiện {} đơn hàng quá thời gian thanh toán. Đang tiến hành hủy...", expiredOrders.size());

            for (Order order : expiredOrders){
                long received = transactionRepository.sumReceived(order);
                if (received > 0) {
                    eventPublisher.publishEvent(new AdminAlertEvent("SEPAY: đơn " + order.getOrderNumber()
                            + " bị hủy nhưng đã nhận " + received + "đ (trả thiếu), cần hoàn tiền"));
                }
                order.setStatus(OrderStatus.CANCELLED);
                if(order.getPayment() != null){
                    order.getPayment().setStatus(PaymentStatus.FAILED);
                }

                for (OrderItem item : order.getOrderItemList()){
                    // Hoàn kho nguyên tử, không ghi đè lượt trừ kho của đơn khác đang chạy song song
                    productVariantRepository.incrementStock(item.getProductVariant().getId(), item.getQuantity());
                }
            }
            orderRepository.saveAll(expiredOrders);
            log.info("Đã dọn dẹp xong {} đơn hàng rác!", expiredOrders.size());
        }
    }
}
