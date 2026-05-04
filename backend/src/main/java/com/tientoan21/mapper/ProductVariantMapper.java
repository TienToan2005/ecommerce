package com.tientoan21.mapper;

import com.tientoan21.dto.request.ProductVariantRequest;
import com.tientoan21.dto.response.ProductVariantResponse;
import com.tientoan21.entity.ProductVariant;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductVariantMapper {

    ProductVariantResponse toProductVariantResponse(ProductVariant productVariant);

    void updateVariantFromRequest(ProductVariantRequest request, @MappingTarget ProductVariant variant);

    @Mapping(target = "status", expression = "java(com.tientoan21.enums.ProductStatus.ACTIVE)")
    ProductVariant toProductVariant(ProductVariantRequest request);
}
