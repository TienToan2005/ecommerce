package com.tientoan21.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum ErrorCode {
    INVALID_CREDENTIALS(1000,HttpStatus.BAD_REQUEST,"INVALID_CREDENTIALS"),
    USER_NOT_FOUND(1001,HttpStatus.NOT_FOUND,"User not found"),
    USER_EXISTS(1002,HttpStatus.BAD_REQUEST, "User already exists"),
    CATEGORY_NOT_FOUND(1003,HttpStatus.NOT_FOUND,"Category not found"),
    CATEGORY_EXISTS(1004,HttpStatus.BAD_REQUEST, "Category already exists"),
    PRODUCT_NOT_FOUND(1005,HttpStatus.NOT_FOUND,"Product not found"),
    PRODUCT_EXISTS(1006,HttpStatus.BAD_REQUEST, "Product already exists"),
    ADDRESS_NOT_FOUND(1007,HttpStatus.NOT_FOUND,"Address not found"),
    ORDER_NOT_FOUND(1008,HttpStatus.NOT_FOUND,"Order not found"),
    CART_EXISTS(1009,HttpStatus.BAD_REQUEST, "Cart already exists"),
    CART_NOT_FOUND(1010,HttpStatus.NOT_FOUND,"Cart not found"),
    CART_ITEM_NOT_FOUND(1011,HttpStatus.NOT_FOUND,"Cart item not found"),
    REVIEW_NOT_FOUND(1012,HttpStatus.NOT_FOUND,"Review not found"),
    VARIANT_NOT_FOUND(1013,HttpStatus.NOT_FOUND,"Variant not found"),
    INVALID_OTP(1014,HttpStatus.BAD_REQUEST,"INVALID_OTP"),
    USER_ALREADY_VERIFIED(1015,HttpStatus.BAD_REQUEST, "USER_ALREADY_VERIFIED"),
    OTP_EXPIRED(1016,HttpStatus.BAD_REQUEST,"OTP_EXPIRED"),
    CANNOT_BLOCK_ADMIN(1017,HttpStatus.BAD_REQUEST, "CANNOT_BLOCK_ADMIN"),
    UNAUTHENTICATED(1018,HttpStatus.UNAUTHORIZED,"Invalid token"),
    VOUCHER_NOT_FOUND(1019,HttpStatus.NOT_FOUND,"Voucher not found"),
    VOUCHER_EXPIRED(1020,HttpStatus.BAD_REQUEST,"The discount code has expired!"),
    VOUCHER_OUT_OF_STOCK(1021,HttpStatus.BAD_REQUEST,"The discount code has expired!"),
    ORDER_NOT_QUALIFIED(1022, HttpStatus.BAD_REQUEST,"Your order has not reached the minimum value required to apply this code");
    private int code;
    private HttpStatus status;
    private String message;
}
