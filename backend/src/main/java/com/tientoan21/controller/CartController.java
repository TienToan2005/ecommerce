package com.tientoan21.controller;

import com.tientoan21.dto.request.CartRequest;
import com.tientoan21.dto.request.UpdateQuantityRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.CartResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.CartService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;

    @PostMapping
    public ApiResponse<CartResponse> addToCart(@RequestBody @Valid CartRequest request){
        return ApiResponse.<CartResponse>builder()
                .data(cartService.addToCart(request))
                .build();
    }
    @GetMapping("/user/{userId}")
    public ApiResponse<CartResponse> getCartByUserId(@PathVariable("userId") Long userId){
        return ApiResponse.<CartResponse>builder()
                .data(cartService.getCartByUserId(userId))
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<CartResponse> updateItemQuantity(@RequestBody UpdateQuantityRequest request, @PathVariable Long id){
        return ApiResponse.<CartResponse>builder()
                .data(cartService.updateItemQuantity(id,request.quantity()))
                .build();
    }
    @DeleteMapping("/user/{userId}")
    public ApiResponse<String> clearCart(@PathVariable("userId") Long userId){
        cartService.clearCart(userId);
        return ApiResponse.<String>builder()
                .data("Đã xóa giỏ hàng thành công")
                .build();
    }
}
