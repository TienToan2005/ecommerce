package com.tientoan21.mapper;

import com.tientoan21.dto.request.CartRequest;
import com.tientoan21.dto.response.CartResponse;
import com.tientoan21.entity.Cart;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring" , uses = ProductMapper.class,unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartMapper {
    CartResponse toCartResponse(Cart cart);
    Cart toEntity(CartRequest request);
}
