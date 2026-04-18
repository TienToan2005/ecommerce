package com.tientoan21.mapper;

import com.tientoan21.dto.response.CartItemResponse;
import com.tientoan21.entity.CartItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
    CartItemResponse toCartItemResponse(CartItem cartItem);
}
