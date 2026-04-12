package com.tientoan21.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tientoan21.dto.request.CartRequest;
import com.tientoan21.dto.response.CartResponse;
import com.tientoan21.entity.Cart;
import com.tientoan21.entity.CartItem;
import com.tientoan21.entity.Product;
import com.tientoan21.entity.User;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import com.tientoan21.mapper.CartMapper;
import com.tientoan21.repository.CartItemRepository;
import com.tientoan21.repository.CartRepository;
import com.tientoan21.repository.ProductRepository;
import com.tientoan21.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartMapper cartMapper;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;

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

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if(product.getStock() < request.quantity()){
            throw new IllegalArgumentException("Not enough stock available");
        }

        Optional<CartItem> existingItem = cart.getCartItemList().stream()
                .filter(item -> item.getProduct().getId().equals(request.productId()))
                .findFirst();
        if(existingItem.isPresent()){
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.quantity());
        }else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setQuantity(request.quantity());
            newItem.setProduct(product);
            cart.getCartItemList().add(newItem);
        }

        return cartMapper.toCartResponse(cartRepository.save(cart));
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
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO,BigDecimal::add);
    }
}
