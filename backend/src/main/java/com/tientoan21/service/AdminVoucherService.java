package com.tientoan21.service;

import com.tientoan21.dto.request.VoucherRequest;
import com.tientoan21.dto.response.VoucherResponse;
import com.tientoan21.entity.Voucher;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import com.tientoan21.mapper.VoucherMapper;
import com.tientoan21.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminVoucherService {
    private final VoucherMapper voucherMapper;
    private final VoucherRepository voucherRepository;

    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request){
        Voucher voucher = voucherMapper.toVoucher(request);

        voucherRepository.save(voucher);

        return voucherMapper.toVoucherResponse(voucher);
    }
    public Page<VoucherResponse> getVouchers(Pageable pageable){
        Page<Voucher> vouchers = voucherRepository.findAll(pageable);

        return vouchers.map(voucherMapper ::toVoucherResponse);
    }
    @Transactional
    public VoucherResponse updateVoucherById(Long id,VoucherRequest request){
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        voucher.setCode(request.code());
        voucher.setDiscountType(request.discountType());
        voucher.setDiscountValue(request.discountValue());
        voucher.setMinOrderValue(request.minOrderValue());
        voucher.setMaxDiscount(request.maxDiscount());
        voucher.setExpiryDate(request.expiryDate());
        voucher.setUsageLimit(request.usageLimit());

        return voucherMapper.toVoucherResponse(voucher);
    }
    @Transactional
    public void deleteVoucherById(Long id){
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        voucher.setDeletedAt(LocalDateTime.now());
    }
}
