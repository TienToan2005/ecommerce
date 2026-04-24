package com.tientoan21.mapper;

import com.tientoan21.dto.response.ProductVariantResponse;
import com.tientoan21.entity.ProductVariant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    ProductVariantResponse toProductVariantResponse(ProductVariant productVariant);
}
