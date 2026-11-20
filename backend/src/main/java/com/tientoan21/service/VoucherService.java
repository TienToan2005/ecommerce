package com.tientoan21.service;

import com.tientoan21.dto.response.VoucherResponse;
import com.tientoan21.entity.Order;
import com.tientoan21.entity.Voucher;
import com.tientoan21.enums.DiscountType;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import com.tientoan21.mapper.VoucherMapper;
import com.tientoan21.repository.OrderRepository;
import com.tientoan21.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@lombok.extern.slf4j.Slf4j
@RequiredArgsConstructor
public class VoucherService {
    private final VoucherRepository voucherRepository;
    private final OrderRepository orderRepository;
    private final VoucherMapper voucherMapper;

    @Transactional
    public VoucherResponse checkVoucher(String code, BigDecimal orderTotal) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        checkConditions(voucher, orderTotal);

        BigDecimal discountAmount = calculateDiscountAmount(voucher, orderTotal);

        VoucherResponse response = voucherMapper.toVoucherResponse(voucher);
        response.setCalculatedDiscount(discountAmount);
        return response;
    }
    public Page<VoucherResponse> getVouchers(Pageable pageable){
        Page<Voucher> vouchers = voucherRepository.findAll(pageable);

        return vouchers.map(voucherMapper ::toVoucherResponse);
    }

    public void checkConditions(Voucher voucher, BigDecimal orderTotal){
        if(voucher.getExpiryDate().isBefore(LocalDateTime.now())){
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }
        if(voucher.getUsedCount() >= voucher.getUsageLimit()){
            throw new AppException(ErrorCode.VOUCHER_OUT_OF_STOCK);
        }
        if (voucher.getMinOrderValue() != null) {
            BigDecimal minRequired = voucher.getMinOrderValue();
            if(orderTotal.compareTo(minRequired) < 0){
                throw new AppException(ErrorCode.ORDER_NOT_QUALIFIED);
            }
        }
    }

    private BigDecimal calculateDiscountAmount(Voucher voucher, BigDecimal orderTotal) {
        BigDecimal discountAmount = BigDecimal.ZERO;

        if(voucher.getDiscountType() == DiscountType.PERCENT){
            discountAmount = orderTotal.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);

            if(voucher.getMaxDiscount() != null && discountAmount.compareTo(voucher.getMaxDiscount()) > 0){
                discountAmount = voucher.getMaxDiscount();
            }
        } else {
            discountAmount = voucher.getDiscountValue();
        }

        if (discountAmount.compareTo(orderTotal) > 0) {
            discountAmount = orderTotal;
        }

        return discountAmount;
    }

    /** Giữ một lượt dùng voucher ngay (đơn COD); ném lỗi nếu đã hết lượt. */
    @Transactional
    public void consumeVoucher(String code) {
        if (voucherRepository.incrementUsedCount(code) == 0) {
            throw new AppException(ErrorCode.VOUCHER_OUT_OF_STOCK);
        }
    }

    /** Trả lại một lượt dùng khi đơn đã tính lượt bị hủy. */
    @Transactional
    public void releaseVoucher(String code) {
        if (code != null) {
            voucherRepository.decrementUsedCount(code);
        }
    }

    @Transactional
    public void subtractionVoucher(String orderCode){
        Order order = orderRepository.findByOrderNumber(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(order.getVoucherCode() != null){
            if (voucherRepository.incrementUsedCount(order.getVoucherCode()) == 0) {
                log.warn("Voucher {} đã hết lượt nhưng đơn {} vẫn áp dụng", order.getVoucherCode(), orderCode);
            }
        }
    }
}