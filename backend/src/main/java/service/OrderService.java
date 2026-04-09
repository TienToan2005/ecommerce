package service;

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
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request){
        User user = userService.getcurrentUser();

        if (request.orderItemList() == null || request.orderItemList().isEmpty()) {
            throw new IllegalArgumentException("Order Items cannot be empty");
        }

        if (request.orderItemList().stream().anyMatch(i -> i.quantity() <= 0)) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Address address = addressRepository.findById(request.addressId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().toUpperCase().substring(0, 5))
                .user(user)
                .address(address)
                .build();
        orderRepository.save(order);

        List<OrderItem> orderItems = request.orderItemList().stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getStock() < itemRequest.quantity()) {
                throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
            }
            product.setStock(product.getStock() - itemRequest.quantity());
            productRepository.save(product);
            //userItemInteractionService.logInteraction(user, product, InteractionType.PURCHASE);

            return OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .discount_amount(itemRequest.discount_amount())
                    .price(product.getPrice())
                    .build();
        }).toList();
        orderItemRepository.saveAll(orderItems);

        BigDecimal total = orderItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalPrice(total);

        PaymentMethod paymentMethod = parsePaymentMethod(request.paymentMethod());
        Payment payment = Payment.builder()
                .oder(order)
                .amount(order.getTotalPrice())
                .method(paymentMethod)
                .status(paymentMethod == PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.COMPLETED)
                .build();
        order.setPayment(payment);

        Order saved = orderRepository.save(order);
        log.info("Order created: {}", saved.getId());

        return orderMapper.toOrderResponse(saved);
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
    public Page<OrderResponse> getAllOder(int page, int size){
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
