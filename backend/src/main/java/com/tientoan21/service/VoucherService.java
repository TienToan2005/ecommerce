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
            BigDecimal percent = voucher.getDiscountValue().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            discountAmount = orderTotal.multiply(percent);

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

    @Transactional
    public void subtractionVoucher(String orderCode){
        Order order = orderRepository.findByOrderNumber(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(order.getVoucherCode() != null){
            Voucher voucher = voucherRepository.findByCode(order.getVoucherCode())
                    .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

            if (voucher.getUsedCount() < voucher.getUsageLimit()) {
                voucher.setUsedCount(voucher.getUsedCount() + 1);
                voucherRepository.save(voucher);
            }
        }
    }
}