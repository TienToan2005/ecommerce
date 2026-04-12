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
    REVIEW_NOT_FOUND(1012,HttpStatus.NOT_FOUND,"Review item not found");
    private int code;
    private HttpStatus status;
    private String message;
}
