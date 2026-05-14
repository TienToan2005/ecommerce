package com.tientoan21.mapper;

import com.tientoan21.dto.request.VoucherRequest;
import com.tientoan21.dto.response.VoucherResponse;
import com.tientoan21.entity.Voucher;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VoucherMapper {
    VoucherResponse toVoucherResponse(Voucher voucher);

    Voucher toVoucher(VoucherRequest request);
}
