package com.tientoan21.controller;

import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.VoucherResponse;
import com.tientoan21.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {
    private final VoucherService voucherService;

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<VoucherResponse>> checkVoucher(
            @RequestParam String code,
            @RequestParam BigDecimal orderTotal) {

        VoucherResponse response = voucherService.checkVoucher(code, orderTotal);

        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .data(response)
                .build());
    }
    @GetMapping
    public ResponseEntity<ApiResponse<Page<VoucherResponse>>> getAllVouchers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<VoucherResponse>>builder()
                .data(voucherService.getVouchers(pageable))
                .build());
    }

}