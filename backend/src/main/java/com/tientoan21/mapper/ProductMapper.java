package com.tientoan21.mapper;

import com.tientoan21.dto.request.ProductRequest;
import com.tientoan21.dto.response.ProductResponse;
import com.tientoan21.entity.Product;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductResponse toProductResponse(Product product);
    Product toProduct(ProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category" , ignore = true)
    void updateProductFromRequest(ProductRequest request, @MappingTarget Product product);
}
