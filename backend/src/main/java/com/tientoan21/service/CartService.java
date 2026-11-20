package com.tientoan21.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Collection;
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
    private final UserService userService;

    public Cart createNewCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }
    @Transactional
    public CartResponse addToCart(CartRequest request){
        // Luôn dùng người dùng đang đăng nhập; bỏ qua userId client gửi lên
        User user = userService.getcurrentUser();
        Cart cart = getOrCreateCart(user);

        ProductVariant variant = productVariantRepository.findById(request.variantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        Optional<CartItem> existingItem = cart.getCartItemList().stream()
                .filter(item -> item.getProductVariant().getId().equals(request.variantId()))
                .findFirst();
        int newQuantity = request.quantity() + existingItem.map(CartItem::getQuantity).orElse(0);
        if (variant.getStock() < newQuantity) {
            throw new IllegalArgumentException("Not enough stock available");
        }

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setQuantity(request.quantity());
            newItem.setProductVariant(variant);
            cart.getCartItemList().add(newItem);
        }

        return cartMapper.toCartResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse getCartForCurrentUser() {
        return cartMapper.toCartResponse(getOrCreateCart(userService.getcurrentUser()));
    }

    @Transactional
    public CartResponse updateItemQuantity(Long cartItemId, int newQuantity){
        CartItem item = getOwnedItem(cartItemId);
        Cart cart = item.getCart();

        if (newQuantity <= 0) {
            cart.getCartItemList().remove(item); // orphanRemoval xóa dòng
        } else {
            if (item.getProductVariant().getStock() < newQuantity) {
                throw new IllegalArgumentException("Not enough stock available");
            }
            item.setQuantity(newQuantity);
        }
        return cartMapper.toCartResponse(cartRepository.save(cart));
    }

    /** Xóa toàn bộ sản phẩm trong giỏ của người dùng hiện tại. */
    @Transactional
    public void clearCart(Long userId){
        User user = userService.getcurrentUser();
        if (!user.getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        cartRepository.findCartByUserId(user.getId())
                .ifPresent(cart -> cart.getCartItemList().clear());
    }

    /** Bỏ các phiên bản vừa đặt hàng khỏi giỏ; không lỗi nếu người dùng chưa có giỏ. */
    @Transactional
    public void removeVariants(Long userId, Collection<Long> variantIds){
        cartRepository.findCartByUserId(userId).ifPresent(cart ->
                cart.getCartItemList().removeIf(item -> variantIds.contains(item.getProductVariant().getId())));
    }

    public int countItems(Long userId){
        return cartRepository.findCartByUserId(userId)
                .map(cart -> cart.getCartItemList().size())
                .orElse(0);
    }

    public BigDecimal calculateTotal(Long userId){
        return cartRepository.findCartByUserId(userId)
                .map(cart -> cart.getCartItemList().stream()
                        .map(item -> item.getProductVariant().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .orElse(BigDecimal.ZERO);
    }

    @Transactional
    public void deleteCartItem(Long cartItemId){
        CartItem item = getOwnedItem(cartItemId);
        // Bỏ khỏi danh sách của giỏ; orphanRemoval sẽ xóa dòng, không bị lưu lại khi save giỏ
        item.getCart().getCartItemList().remove(item);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findCartByUserId(user.getId()).orElseGet(() -> createNewCart(user));
    }

    private CartItem getOwnedItem(Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        User user = userService.getcurrentUser();
        if (!item.getCart().getUser().getId().equals(user.getId())) {
            // Không tiết lộ sản phẩm trong giỏ của người khác
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }
        return item;
    }
}
