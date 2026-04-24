package com.tientoan21.service;

import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.tientoan21.config.VNPayConfig;
import com.tientoan21.entity.*;
import com.tientoan21.repository.ProductVariantRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tientoan21.dto.request.OrderItemRequest;
import com.tientoan21.dto.request.OrderRequest;
import com.tientoan21.dto.response.OrderResponse;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.enums.OrderStatus;
import com.tientoan21.enums.PaymentMethod;
import com.tientoan21.enums.PaymentStatus;
import com.tientoan21.enums.UserRole;
import com.tientoan21.exception.AppException;
import com.tientoan21.mapper.OrderMapper;
import com.tientoan21.repository.AddressRepository;
import com.tientoan21.repository.OrderRepository;
import com.tientoan21.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final EmailService emailService;
    private final UserService userService;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final ProductVariantRepository productVariantRepository;
    private final VNPayService vnPayService;
    private final VNPayConfig vnPayConfig;
    @Transactional
    public OrderResponse placeOrder(OrderRequest request, HttpServletRequest httpServletRequest) {
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
                .status(PaymentStatus.PENDING)
                .build();
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        cartService.clearCart(user.getId());

        log.info("Successfully placed order {} for user {}", savedOrder.getOrderNumber(), user.getEmail());

        OrderResponse response = orderMapper.toOrderResponse(savedOrder);
        if (method == PaymentMethod.VNPAY) {
            String baseUrl = httpServletRequest.getScheme() + "://" + httpServletRequest.getServerName() + ":" + httpServletRequest.getServerPort();
            String returnUrl = "http://localhost:5173/payment-return";
            String paymentUrl = vnPayService.createOrder(
                    httpServletRequest,
                    grandTotal.longValue(),
                    savedOrder.getOrderNumber(),
                    returnUrl
            );

            response.getPaymentInfo().setPaymentUrl(paymentUrl);
        }
        return response;
    }

    private List<OrderItem> processOrderItems(List<OrderItemRequest> requests, Order order) {
        return requests.stream().map(itemRequest -> {

            ProductVariant variant = productVariantRepository.findById(itemRequest.variantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

            Product product = variant.getProduct();

            if (variant.getStock() < itemRequest.quantity()) {
                throw new IllegalArgumentException("Phiên bản " + product.getName() + " (SKU: " + variant.getSku() + ") không đủ hàng trong kho.");
            }

            variant.setStock(variant.getStock() - itemRequest.quantity());
            productVariantRepository.save(variant);

            return OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity(itemRequest.quantity())
                    .price(variant.getPrice())
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

    public Page<OrderResponse> getUserOrders(Pageable pageable) {
        User user = userService.getcurrentUser();
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return orders.map(orderMapper::toOrderResponse);
    }
    public Page<OrderResponse> getAllOrder(Pageable pageable){
        Page<Order> orders = orderRepository.findAll(pageable);

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
    public void updatePaymentStatus(Long orderId, PaymentStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getPayment() != null) {
            order.getPayment().setStatus(newStatus);
        }

        if (newStatus == PaymentStatus.COMPLETED) {
            order.setStatus(OrderStatus.CONFIRMED);
            emailService.sendOrderConfirmationEmail(order);

        } else if (newStatus == PaymentStatus.FAILED) {
            order.setStatus(OrderStatus.CANCELLED);

            for (OrderItem item : order.getOrderItemList()) {
                ProductVariant variant = item.getProductVariant();
                variant.setStock(variant.getStock() + item.getQuantity());
            }
        }

        orderRepository.save(order);
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

        for(OrderItem item : order.getOrderItemList()){
            ProductVariant variant = item.getProductVariant();
            variant.setStock(variant.getStock() + item.getQuantity());

        }

        Order cancelOrderSaved = orderRepository.save(order);
        return orderMapper.toOrderResponse(cancelOrderSaved);
    }
    @Transactional
    public OrderResponse verifyVnPayPayment(String queryString) {
        try {
            // 1. Cắt bỏ dấu '?' ở đầu chuỗi (nếu có)
            if (queryString.startsWith("?")) {
                queryString = queryString.substring(1);
            }
            // 2. Bóc tách chuỗi URL thành một Map<String, String>
            Map<String, String> fields = new HashMap<>();
            String[] params = queryString.split("&");
            for (String param : params) {
                String[] keyValue = param.split("=");
                if (keyValue.length == 2) {
                    String key = URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8.toString());
                    String value = URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8.toString());
                    fields.put(key, value);
                }
            }

            // 3. Lấy chữ ký gốc của VNPAY và xóa nó khỏi Map để chuẩn bị băm lại
            String vnp_SecureHash = fields.get("vnp_SecureHash");
            fields.remove("vnp_SecureHashType");
            fields.remove("vnp_SecureHash");

            // 4. Tạo chữ ký mới từ dữ liệu để so sánh (Chống Fake URL)
            String signValue = VNPayConfig.hashAllFields(fields, vnPayConfig.getSecretKey());
            if (!signValue.equals(vnp_SecureHash)) {
                throw new RuntimeException("Cảnh báo: Chữ ký VNPAY không hợp lệ! Giao dịch có thể bị giả mạo.");
            }

            // 5. Nếu chữ ký chuẩn, lấy mã đơn hàng ra
            String orderNumber = fields.get("vnp_TxnRef");
            Order order = orderRepository.findByOrderNumber(orderNumber)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng mã: " + orderNumber));

            // 6. Kiểm tra trạng thái thanh toán ("00" là VNPAY báo thành công)
            if ("00".equals(fields.get("vnp_TransactionStatus"))) {
                // Tiền đã vào túi -> Đổi trạng thái Payment và Order
                order.getPayment().setStatus(PaymentStatus.COMPLETED);
                order.setStatus(OrderStatus.CONFIRMED);
            } else {
                // Khách hủy hoặc thẻ hết tiền
                order.getPayment().setStatus(PaymentStatus.FAILED);
                order.setStatus(OrderStatus.CANCELLED);
            }

            // 7. Lưu lại và trả về cho Frontend
            Order savedOrder = orderRepository.save(order);
            return orderMapper.toOrderResponse(savedOrder);

        } catch (Exception e) {
            log.error("Lỗi xác thực VNPAY: ", e);
            throw new RuntimeException("Lỗi trong quá trình xác thực thanh toán VNPAY");
        }
    }
}
