package com.tientoan21.controller;

import com.tientoan21.dto.request.UserRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.UserResponse;
import com.tientoan21.enums.UserStatus;
import com.tientoan21.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final AdminUserService userImplService;

    @PostMapping
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserRequest request){
        return ApiResponse.<UserResponse>builder()
                .data(userImplService.createUser(request))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id){
        return ApiResponse.<UserResponse>builder()
                .data(userImplService.getUserById(id))
                .build();
    }
    @GetMapping
    public ApiResponse<Page<UserResponse>> getAllUser(Pageable pageable){
        return ApiResponse.<Page<UserResponse>>builder()
                .data(userImplService.getAllUser(pageable))
                .build();
    }
    @GetMapping("/customers")
    public ApiResponse<Page<UserResponse>> getAllCustomers(Pageable pageable) {
        return ApiResponse.<Page<UserResponse>>builder()
                .data(userImplService.getAllCustomers(pageable))
                .build();
    }
    @PutMapping("/{id}/toggle-status")
    public ApiResponse<String> toggleUserStatus(@PathVariable Long id) {
        UserStatus newStatus = userImplService.toggleUserStatus(id);

        return ApiResponse.<String>builder()
                .data("Cập nhật trạng thái thành công: " + newStatus)
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserRequest request){
        return ApiResponse.<UserResponse>builder()
                .data(userImplService.updateUser(id, request))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable Long id){
        userImplService.deleteUser(id);
        return ApiResponse.<String>builder()
                .data("Xóa user thành công")
                .build();
    }
}
