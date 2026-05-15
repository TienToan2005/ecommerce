package com.tientoan21.service;

import com.tientoan21.dto.request.FilterProductsRequest;
import com.tientoan21.dto.response.ProductResponse;
import com.tientoan21.entity.Product;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import com.tientoan21.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.ProductMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tientoan21.repository.CategoryRepository;
import com.tientoan21.repository.ProductRepository;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private  final ProductMapper productMapper;

    @Cacheable(value = "product_detail", key = "#id")
    public ProductResponse getProductById(Long id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return productMapper.toProductResponse(product);
    }
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#request.hashCode() + '-' + #pageable.pageNumber")
    public Page<ProductResponse> filterProducts(FilterProductsRequest request,Pageable pageable){
        Specification<Product> spec = Specification.where(ProductSpecification.hasName(request.name()))
                .and(ProductSpecification.hasCategory(request.categoryId()))
                .and(ProductSpecification.hasPriceBetween(request.minPrice(), request.maxPrice()))
                .and(ProductSpecification.hasBrand(request.brand()));

        Page<Product> products = productRepository.findAll(spec, pageable);

        return products.map(productMapper::toProductResponse);
    }

}
