package com.tientoan21.controller;

import com.tientoan21.dto.request.VoucherRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.VoucherResponse;
import com.tientoan21.service.AdminVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
public class AdminVoucherController {
    private final AdminVoucherService voucherService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VoucherResponse>>> getAllVouchers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.<Page<VoucherResponse>>builder()
                .data(voucherService.getVouchers(pageable))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(@RequestBody VoucherRequest request) {
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .data(voucherService.createVoucher(request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(
            @PathVariable Long id,
            @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .data(voucherService.updateVoucherById(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucherById(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .data("Xóa mã giảm giá thành công")
                .build());
    }
}
