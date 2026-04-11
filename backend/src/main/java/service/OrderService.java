package service;

import dto.request.OrderItemRequest;
import dto.request.OrderRequest;
import dto.response.OrderResponse;
import entity.*;
import enums.*;
import exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mapper.OrderMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repository.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        User user = userService.getcurrentUser();

        Address address = addressRepository.findById(request.addressId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().toUpperCase().substring(0, 8))
                .user(user)
                .address(address)
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = processOrderItems(request.orderItemList(), order);
        order.setOrderItemList(orderItems);

        BigDecimal grandTotal = orderItems.stream()
                .map(item -> item.getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()))
                        .subtract(item.getDiscount_amount() != null ? item.getDiscount_amount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalPrice(grandTotal);

        PaymentMethod method = parsePaymentMethod(request.paymentMethod());
        Payment payment = Payment.builder()
                .order(order)
                .amount(grandTotal)
                .method(method)
                .status(method == PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.COMPLETED)
                .build();
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        cartService.clearCart(user.getId());

        log.info("Successfully placed order {} for user {}", savedOrder.getOrderNumber(), user.getEmail());

        return orderMapper.toOrderResponse(savedOrder);
    }

    private List<OrderItem> processOrderItems(List<OrderItemRequest> requests, Order order) {
        return requests.stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getStock() < itemRequest.quantity()) {
                throw new IllegalArgumentException("Sản phẩm " + product.getName() + " không đủ hàng trong kho");
            }

            product.setStock(product.getStock() - itemRequest.quantity());
            productRepository.save(product);

            return OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .price(product.getPrice())
                    .discount_amount(itemRequest.discount_amount())
                    .build();
        }).toList();
    }
    private PaymentMethod parsePaymentMethod(String method){
        if(method == null || method.trim().isEmpty()){
            throw new IllegalArgumentException("paymentMethod is required");
        }
        try {
            return PaymentMethod.valueOf(method.trim().toUpperCase());
        }catch (java.lang.IllegalArgumentException e) {
            throw new java.lang.IllegalArgumentException("Invalid paymentMethod: " + method);
        }
    }

    public Page<OrderResponse> getUserOrders(int page, int size) {
        User user = userService.getcurrentUser();
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size));
        return orders.map(orderMapper::toOrderResponse);
    }
    public Page<OrderResponse> getAllOrder(int page, int size){
        Page<Order> orders = orderRepository.findAll(PageRequest.of(page,size));

        return orders.map(orderMapper::toOrderResponse);
    }
    public OrderResponse getOrderById(Long id){
        User user = userService.getcurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(!order.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN){
            throw new IllegalArgumentException("You do not have permission to view this order");
        }

        return orderMapper.toOrderResponse(order);
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
    @Transactional
    public OrderResponse cancelOrder(Long id){
        User user = userService.getcurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(!order.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN){
            throw new IllegalArgumentException("You do not have permission to view this order");
        }

        if(order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED){
            throw new IllegalArgumentException("Cannot cancel an order that has already been shipped or delivered");
        }

        order.setStatus(OrderStatus.CANCELLED);
        if(order.getPayment().getStatus() == PaymentStatus.COMPLETED){
            order.getPayment().setStatus(PaymentStatus.REFUNDED);
        }

        // return Product
        for(OrderItem item : order.getOrderItemList()){
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        Order cancelOrderSaved = orderRepository.save(order);
        return orderMapper.toOrderResponse(cancelOrderSaved);
    }
}
