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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor

public class AdminOrderService {
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public Page<OrderResponse> getAllOrder(Pageable pageable){
        Page<Order> orders = orderRepository.findAll(pageable);

        return orders.map(orderMapper::toOrderResponse);
    }
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status){
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        if (status == null) {
            throw new IllegalArgumentException("OrderStatus is required");
        }
        OrderStatus statusEnum = OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(statusEnum);

        if (statusEnum == OrderStatus.DELIVERED && order.getPayment().getMethod() == PaymentMethod.COD) {
            order.getPayment().setStatus(PaymentStatus.COMPLETED);
        }

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toOrderResponse(updatedOrder);
    }
}
