package com.tientoan21.controller;

import com.tientoan21.dto.request.CartRequest;
import com.tientoan21.dto.request.UpdateQuantityRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.CartItemResponse;
import com.tientoan21.dto.response.CartResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.CartService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;

    @PostMapping("/add")
    public ApiResponse<CartResponse> addToCart(@RequestBody @Valid CartRequest request){
        return ApiResponse.<CartResponse>builder()
                .data(cartService.addToCart(request))
                .build();
    }
    @GetMapping("/my-cart")
    public ApiResponse<CartResponse> getMyCart() {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.getCartForCurrentUser())
                .build();
    }
    @PutMapping("/items/{cartItemId}")
    public ApiResponse<CartResponse> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody UpdateQuantityRequest request) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.updateItemQuantity(cartItemId, request.quantity()))
                .build();
    }
    @DeleteMapping("/user/{userId}")
    public ApiResponse<String> clearCart(@PathVariable Long userId){
        cartService.clearCart(userId);
        return ApiResponse.<String>builder()
                .data("Đã xóa giỏ hàng thành công")
                .build();
    }
    @DeleteMapping("/items")
    public ApiResponse<String> deleteCartItem(@PathVariable Long cartItemId){
        cartService.deleteCartItem(cartItemId);
        return ApiResponse.<String>builder()
                .data("Đã xóa sản phẩm trong giỏ thành công")
                .build();
    }
}
