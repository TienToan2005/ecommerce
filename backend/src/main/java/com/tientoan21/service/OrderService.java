package com.tientoan21.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import com.tientoan21.config.PaymentPolicy;
import com.tientoan21.dto.response.VoucherResponse;
import com.tientoan21.entity.*;
import com.tientoan21.repository.ProductVariantRepository;
import com.tientoan21.repository.VoucherRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tientoan21.dto.request.OrderItemRequest;
import com.tientoan21.dto.request.OrderRequest;
import com.tientoan21.dto.response.OrderResponse;
import com.tientoan21.dto.response.PaymentResponse;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.enums.OrderStatus;
import com.tientoan21.enums.PaymentMethod;
import com.tientoan21.enums.PaymentStatus;
import com.tientoan21.enums.UserRole;
import com.tientoan21.exception.AppException;
import com.tientoan21.mapper.OrderMapper;
import com.tientoan21.repository.AddressRepository;
import com.tientoan21.repository.OrderRepository;

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
    private final VoucherService voucherService;
    private final SepayQrService sepayQrService;
    private final ApplicationEventPublisher eventPublisher;

    @Lazy
    @Autowired
    private PaymentService paymentService;

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

        // Giá chỉ tính từ dữ liệu máy chủ; không có giảm giá theo từng sản phẩm từ client
        BigDecimal totalPrice = orderItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalPrice(totalPrice);

        BigDecimal grandTotal = totalPrice;
        BigDecimal voucherDiscount = BigDecimal.ZERO;
        if (request.voucherCode() != null && !request.voucherCode().trim().isEmpty()) {
            VoucherResponse checkRes = voucherService.checkVoucher(request.voucherCode().trim(), totalPrice);

            voucherDiscount = checkRes.getCalculatedDiscount().setScale(0, RoundingMode.HALF_UP);
            grandTotal = totalPrice.subtract(voucherDiscount);

            order.setVoucherCode(request.voucherCode().trim());
            order.setVoucherDiscount(voucherDiscount);
        }
        order.setGrandTotal(grandTotal);

        PaymentMethod method = parsePaymentMethod(request.paymentMethod());
        if (method == PaymentMethod.COD && order.getVoucherCode() != null) {
            // Đơn COD không qua bước thanh toán online, nên tính lượt voucher ngay lúc đặt
            voucherService.consumeVoucher(order.getVoucherCode());
        }
        if (method == PaymentMethod.SEPAY) {
            order.setPaymentCode("TC" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase());
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(grandTotal)
                .method(method)
                .status(PaymentStatus.PENDING)
                .build();
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        // Chỉ bỏ các sản phẩm vừa đặt khỏi giỏ (mua ngay không làm mất các món khác)
        cartService.removeVariants(user.getId(),
                orderItems.stream().map(item -> item.getProductVariant().getId()).toList());

        log.info("Successfully placed order {} for user {}", savedOrder.getOrderNumber(), user.getEmail());

        OrderResponse response = orderMapper.toOrderResponse(savedOrder);

        if (method == PaymentMethod.VNPAY) {
            String paymentUrl = paymentService.createVnPayPaymentUrl(savedOrder, httpServletRequest);
            response.getPaymentInfo().setPaymentUrl(paymentUrl);
        } else if (method == PaymentMethod.SEPAY) {
            addSepayInfo(savedOrder, response);
        }

        String paymentNote = method == PaymentMethod.COD ? "thanh toán khi nhận hàng" : "đang chờ thanh toán " + method;
        eventPublisher.publishEvent(new AdminAlertEvent("TING_TING: Đơn hàng mới " + savedOrder.getOrderNumber()
                + " (" + grandTotal + "đ, " + paymentNote + ")"));
        return response;
    }

    private List<OrderItem> processOrderItems(List<OrderItemRequest> requests, Order order) {
        return requests.stream().map(itemRequest -> {
            if (itemRequest.quantity() == null || itemRequest.quantity() < 1) {
                throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
            }

            ProductVariant variant = productVariantRepository.findById(itemRequest.variantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

            Product product = variant.getProduct();

            // Trừ kho nguyên tử: hai đơn cùng lúc không thể cùng lấy món cuối cùng
            if (productVariantRepository.decrementStock(variant.getId(), itemRequest.quantity()) == 0) {
                throw new IllegalArgumentException("Phiên bản " + product.getName() + " (SKU: " + variant.getSku() + ") không đủ hàng trong kho.");
            }

            return OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity(itemRequest.quantity())
                    .price(variant.getPrice())
                    .discountAmount(BigDecimal.ZERO)
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
        return orders.map(order -> {
            OrderResponse response = orderMapper.toOrderResponse(order);
            if (order.getPayment() != null && order.getPayment().getMethod() == PaymentMethod.SEPAY) {
                addSepayInfo(order, response); // để danh sách biết hạn thanh toán
            }
            return response;
        });
    }

    public OrderResponse getOrderById(Long id){
        User user = userService.getcurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(!order.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN){
            throw new IllegalArgumentException("You do not have permission to view this order");
        }

        OrderResponse response = orderMapper.toOrderResponse(order);
        if (order.getPayment() != null && order.getPayment().getMethod() == PaymentMethod.SEPAY) {
            addSepayInfo(order, response);
        }
        return response;
    }

    /** Gắn mã thanh toán và URL mã QR vào phản hồi của đơn thanh toán bằng SePay. */
    private void addSepayInfo(Order order, OrderResponse response) {
        PaymentResponse paymentInfo = response.getPaymentInfo();
        if (paymentInfo == null) {
            return;
        }
        paymentInfo.setPaymentCode(order.getPaymentCode());
        paymentInfo.setQrUrl(sepayQrService.buildQrUrl(order.getPaymentCode(), order.getGrandTotal()));
        paymentInfo.setExpiresAt(PaymentPolicy.expiresAt(order.getCreatedAt()));
        paymentInfo.setServerTime(Instant.now().truncatedTo(ChronoUnit.MILLIS));
    }

    @Transactional
    public boolean updatePaymentStatus(String orderNumber, PaymentStatus newStatus) {
        Order order = orderRepository.findByOrderNumberForUpdate(orderNumber)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(order.getStatus() != OrderStatus.PENDING){
            return false;
        }
        if (order.getPayment() != null) {
            order.getPayment().setStatus(newStatus);
        }

        if (newStatus == PaymentStatus.COMPLETED) {
            order.setStatus(OrderStatus.CONFIRMED);
            eventPublisher.publishEvent(new OrderConfirmedEvent(order.getOrderNumber()));
            eventPublisher.publishEvent(new AdminAlertEvent("TING_TING: Đơn " + order.getOrderNumber()
                    + " đã thanh toán " + order.getGrandTotal() + "đ"));

        } else if (newStatus == PaymentStatus.FAILED && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CANCELLED);
            restock(order);
        }

        orderRepository.save(order);

        return true;
    }

    @Transactional
    public OrderResponse cancelOrder(Long id){
        User user = userService.getcurrentUser();
        // Khóa đơn để không đua với webhook SePay / job hủy đơn hết hạn
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if(!order.getUser().getId().equals(user.getId()) && !isAdmin){
            throw new IllegalArgumentException("You do not have permission to view this order");
        }

        if(order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED){
            throw new IllegalArgumentException("Cannot cancel an order that has already been shipped or delivered");
        }
        if(order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.RETURNED){
            // Hủy lần hai sẽ cộng kho lần nữa
            throw new IllegalArgumentException("Order is already cancelled");
        }

        boolean paid = order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.COMPLETED;
        if (paid && !isAdmin) {
            throw new IllegalArgumentException("Đơn đã thanh toán, vui lòng liên hệ cửa hàng để hủy và hoàn tiền");
        }

        closeOrder(order, OrderStatus.CANCELLED);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    /**
     * Đóng đơn đã bị khóa (CANCELLED hoặc RETURNED): hoàn kho, trả lượt voucher đã tính,
     * và nếu đã thu tiền thì đánh dấu REFUNDED và báo admin hoàn tiền thủ công.
     */
    public void closeOrder(Order order, OrderStatus finalStatus) {
        boolean paid = order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.COMPLETED;
        boolean cod = order.getPayment() != null && order.getPayment().getMethod() == PaymentMethod.COD;

        order.setStatus(finalStatus);
        restock(order);
        if (paid || cod) {
            // Lượt voucher đã được tính lúc thanh toán (online) hoặc lúc đặt (COD)
            voucherService.releaseVoucher(order.getVoucherCode());
        }
        if (paid) {
            order.getPayment().setStatus(PaymentStatus.REFUNDED);
            eventPublisher.publishEvent(new AdminAlertEvent("Đơn " + order.getOrderNumber() + " đã thanh toán "
                    + order.getGrandTotal() + "đ chuyển sang " + finalStatus + ": cần hoàn tiền cho khách"));
        }
    }

    private void restock(Order order) {
        for (OrderItem item : order.getOrderItemList()) {
            productVariantRepository.incrementStock(item.getProductVariant().getId(), item.getQuantity());
        }
    }

    /** Kiểm tra đơn thuộc người dùng hiện tại (hoặc người dùng là admin). */
    public Order getOwnedOrderByNumber(String orderNumber) {
        User user = userService.getcurrentUser();
        Order order = getOrderByNumber(orderNumber);
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("You do not have permission to view this order");
        }
        return order;
    }

    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }
}