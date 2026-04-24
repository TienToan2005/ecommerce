package com.tientoan21.mapper;

import com.tientoan21.dto.request.CartRequest;
import com.tientoan21.dto.response.CartItemResponse;
import com.tientoan21.dto.response.CartResponse;
import com.tientoan21.entity.Cart;
import com.tientoan21.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = {ProductVariantMapper.class, ProductMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface CartMapper {
    @Mapping(source = "user.id", target = "userId")
    CartResponse toCartResponse(Cart cart);

    @Mapping(source = "productVariant", target = "variant")
    @Mapping(source = "productVariant.product", target = "product")
    CartItemResponse toCartItemResponse(CartItem cartItem);
}
