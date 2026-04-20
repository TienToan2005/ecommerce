package com.tientoan21.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.tientoan21.dto.response.CartItemResponse;
import com.tientoan21.entity.*;
import com.tientoan21.mapper.CartItemMapper;
import com.tientoan21.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tientoan21.dto.request.CartRequest;
import com.tientoan21.dto.response.CartResponse;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import com.tientoan21.mapper.CartMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartMapper cartMapper;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final CartItemMapper cartItemMapper;

    public Cart createNewCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    public CartResponse getCartByUserId(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if(user.getCart() == null){
            Cart cart = createNewCart(user);
            return cartMapper.toCartResponse(cart);
        }

        return cartMapper.toCartResponse(user.getCart());
    }
    @Transactional
    public CartResponse addToCart(CartRequest request){
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Cart cart = user.getCart();
        if (cart == null) {
            cart = createNewCart(user);
        }

        ProductVariant variant = productVariantRepository.findById(request.variantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        if(variant.getStock() < request.quantity()){
            throw new IllegalArgumentException("Not enough stock available");
        }

        Optional<CartItem> existingItem = cart.getCartItemList().stream()
                .filter(item -> item.getProductVariant().getId().equals(request.variantId()))
                .findFirst();
        if(existingItem.isPresent()){
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.quantity());
        }else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setQuantity(request.quantity());
            newItem.setProductVariant(variant);
            cart.getCartItemList().add(newItem);
        }

        return cartMapper.toCartResponse(cartRepository.save(cart));
    }
    public List<CartItemResponse> getAllItems(Long cartId){
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        List<CartItem> items = cart.getCartItemList();

        return items.stream()
                .map(cartItemMapper::toCartItemResponse)
                .toList();
    }
    @Transactional
    public CartResponse updateItemQuantity(Long cartItemId, int newQuantity){
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        item.setQuantity(newQuantity);
        Cart cart = item.getCart();
        cartRepository.save(cart);

        return cartMapper.toCartResponse(cart);
    }
    @Transactional
    public void clearCart(Long userId){
        Cart cart = cartRepository.findCartByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        cart.setDeletedAt(LocalDateTime.now());
        cart.setChangedBy("User: " + userId);
    }

    public int countItems(Long userId){
        Cart cart = cartRepository.findCartByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        return cart.getCartItemList().size();
    }
    public BigDecimal calculateTotal(Long userId){
        Cart cart = cartRepository.findCartByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        return cart.getCartItemList().stream()
                .map(item -> item.getProductVariant().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO,BigDecimal::add);
    }
}
