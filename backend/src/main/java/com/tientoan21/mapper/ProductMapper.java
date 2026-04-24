package com.tientoan21.mapper;

import com.tientoan21.dto.request.ProductRequest;
import com.tientoan21.dto.request.ProductVariantRequest;
import com.tientoan21.dto.response.ProductResponse;
import com.tientoan21.entity.Product;
import com.tientoan21.entity.ProductVariant;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        uses = {CategoryMapper.class, ProductVariantMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ProductMapper {
    ProductResponse toProductResponse(Product product);
    Product toProduct(ProductRequest request);
    ProductVariant toProductVariant(ProductVariantRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category" , ignore = true)
    void updateProductFromRequest(ProductRequest request, @MappingTarget Product product);
}