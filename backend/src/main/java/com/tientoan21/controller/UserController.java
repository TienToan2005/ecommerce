package com.tientoan21.controller;

import com.tientoan21.dto.request.UserRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.UserService;

@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserRequest request){
        return ApiResponse.<UserResponse>builder()
                .data(userService.createUser(request))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id){
        return ApiResponse.<UserResponse>builder()
                .data(userService.getUserById(id))
                .build();
    }
    @GetMapping
    public ApiResponse<Page<UserResponse>> getAllUser(Pageable pageable){
        return ApiResponse.<Page<UserResponse>>builder()
                .data(userService.getAllUser(pageable))
                .build();
    }
    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfileAndOderHistory(){
        return ApiResponse.<UserResponse>builder()
                .data(userService.getProfileAndOderHistory())
                .build();

    }
    @PostMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserRequest request){
        return ApiResponse.<UserResponse>builder()
                .data(userService.updateUser(id, request))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id){
        userService.deleteUser(id);
        return ApiResponse.<String>builder()
                .data("Xóa user thành công")
                .build();
    }
}
