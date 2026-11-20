package com.tientoan21.service;

import com.tientoan21.dto.response.OrderResponse;
import com.tientoan21.entity.Order;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.enums.OrderStatus;
import com.tientoan21.enums.PaymentMethod;
import com.tientoan21.enums.PaymentStatus;
import com.tientoan21.exception.AppException;
import com.tientoan21.mapper.OrderMapper;
import com.tientoan21.repository.OrderRepository;
import com.tientoan21.specification.OrderSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor

public class AdminOrderService {
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderService orderService;

    public Page<OrderResponse> getAllOrders(String search, String status, Pageable pageable) {
        Pageable customPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending()
        );

        OrderStatus orderStatus = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                orderStatus = OrderStatus.valueOf(status.toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                orderStatus = null;
            }
        }
        Specification<Order> spec = Specification.where(OrderSpecification.hasOrderNumber(search))
                .and(OrderSpecification.hasStatus(orderStatus));

        Page<Order> orderPage = orderRepository.findAll(spec, customPageable);

        return orderPage.map(orderMapper::toOrderResponse);
    }
    /** Các bước chuyển trạng thái admin được phép làm. */
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DELIVERED, OrderStatus.RETURNED),
            OrderStatus.DELIVERED, EnumSet.of(OrderStatus.RETURNED),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.RETURNED, EnumSet.noneOf(OrderStatus.class)
    );

    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status){
        if (status == null) {
            throw new IllegalArgumentException("OrderStatus is required");
        }
        OrderStatus target;
        try {
            target = OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
        }

        // Khóa đơn để không đua với webhook / job hủy đơn
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        OrderStatus current = order.getStatus();
        if (current == target) {
            return orderMapper.toOrderResponse(order);
        }
        if (!ALLOWED.getOrDefault(current, Set.of()).contains(target)) {
            throw new IllegalArgumentException("Không thể chuyển đơn từ " + current + " sang " + target);
        }

        boolean cod = order.getPayment() != null && order.getPayment().getMethod() == PaymentMethod.COD;
        boolean paid = order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.COMPLETED;
        if (target == OrderStatus.CONFIRMED && !cod && !paid) {
            throw new IllegalArgumentException("Đơn thanh toán online chưa nhận được tiền, không thể xác nhận");
        }

        if (target == OrderStatus.CANCELLED || target == OrderStatus.RETURNED) {
            // Hoàn kho, trả lượt voucher, báo hoàn tiền nếu đã thu
            orderService.closeOrder(order, target);
        } else {
            order.setStatus(target);
            if (target == OrderStatus.DELIVERED && cod) {
                order.getPayment().setStatus(PaymentStatus.COMPLETED);
            }
        }

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }
}
