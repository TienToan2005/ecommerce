package com.tientoan21.mapper;

import com.tientoan21.entity.OrderItem;
import com.tientoan21.dto.response.OrderItemResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        uses = {ProductMapper.class, ProductVariantMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderItemMapper {
    @Mapping(source = "productVariant", target = "variant")
    @Mapping(source = "productVariant.product", target = "product")
    OrderItemResponse toResponse(OrderItem orderItem);
}
