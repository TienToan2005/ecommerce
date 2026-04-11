package controller;

import dto.request.CartRequest;
import dto.response.ApiResponse;
import dto.response.CartResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.*;
import service.CartService;

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
    @GetMapping()
    public ApiResponse<CartResponse> getCartByUserId(@Param("userId") Long userId){
        return ApiResponse.<CartResponse>builder()
                .data(cartService.getCartByUserId(userId))
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<CartResponse> updateItemQuantity(@Param("quantity") Integer quantity, @PathVariable Long id){
        return ApiResponse.<CartResponse>builder()
                .data(cartService.updateItemQuantity(id,quantity))
                .build();
    }
    @DeleteMapping
    public ApiResponse<String> clearCart(@Param("userId") Long userId){
        cartService.clearCart(userId);
        return ApiResponse.<String>builder()
                .data("Đã xóa giỏ hàng thành công")
                .build();
    }
}
