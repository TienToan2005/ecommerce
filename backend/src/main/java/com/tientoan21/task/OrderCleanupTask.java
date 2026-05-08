package com.tientoan21.task;

import com.tientoan21.entity.Order;
import com.tientoan21.entity.OrderItem;
import com.tientoan21.entity.ProductVariant;
import com.tientoan21.enums.OrderStatus;
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

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredOrders(){
        LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);

        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(
                OrderStatus.PENDING, fifteenMinutesAgo
        );

        if(!expiredOrders.isEmpty()){
            log.info("Phát hiện {} đơn hàng quá thời gian thanh toán. Đang tiến hành hủy...", expiredOrders.size());

            for (Order order : expiredOrders){
                order.setStatus(OrderStatus.CANCELLED);
                if(order.getPayment() != null){
                    order.getPayment().setStatus(PaymentStatus.FAILED);
                }

                for (OrderItem item : order.getOrderItemList()){
                    ProductVariant variant = item.getProductVariant();
                    variant.setStock(variant.getStock() + item.getQuantity());
                    productVariantRepository.save(variant);
                }
            }
            orderRepository.saveAll(expiredOrders);
            log.info("Đã dọn dẹp xong {} đơn hàng rác!", expiredOrders.size());
        }
    }
}
