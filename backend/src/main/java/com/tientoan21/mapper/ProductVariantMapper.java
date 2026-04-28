package com.tientoan21.mapper;

import com.tientoan21.dto.request.ProductVariantRequest;
import com.tientoan21.dto.response.ProductVariantResponse;
import com.tientoan21.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    ProductVariantResponse toProductVariantResponse(ProductVariant productVariant);

    void updateVariantFromRequest(ProductVariantRequest request,@MappingTarget ProductVariant variant);

    ProductVariant toProductVariant(ProductVariantRequest request);
}
