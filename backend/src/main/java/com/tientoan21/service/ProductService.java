package com.tientoan21.service;

import com.tientoan21.dto.request.ProductRequest;
import com.tientoan21.dto.response.ProductResponse;
import com.tientoan21.entity.Category;
import com.tientoan21.entity.Product;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.ProductMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tientoan21.repository.CategoryRepository;
import com.tientoan21.repository.ProductRepository;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private  final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;

    @Transactional
    public ProductResponse createProduct(ProductRequest request){
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Product product = productMapper.toProduct(request);
        product.setCategory(category);

        if (product.getVariants() != null) {
            product.getVariants().forEach(variant -> {
                variant.setProduct(product);
                if (variant.getSku() == null) {
                    variant.setSku(generateSku(product.getName(), variant.getAttributes()));
                }
            });
        }

        Product saved = productRepository.save(product);
        return productMapper.toProductResponse(saved);
    }
    public Page<ProductResponse> getALlProduct(int page, int size){
        Page<Product> products = productRepository.findAll(PageRequest.of(page, size));

        return products.map(productMapper::toProductResponse);

    }
    public Page<ProductResponse> getAllProductByCategory(Long categoryId, int page, int size){
        Pageable pageable = PageRequest.of(page, size);

        Page<Product> productPage = productRepository.findAllByCategoryId(categoryId, pageable);

        return productPage.map(productMapper::toProductResponse);
    }
    public ProductResponse getProductById(Long id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return productMapper.toProductResponse(product);
    }
    @Transactional
    public ProductResponse updateProductById(Long id, ProductRequest request){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if(request.categoryId() != null){
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }

        productMapper.updateProductFromRequest(request, product);

        if (request.variants() != null) {
            product.getVariants().clear(); // Cần cascade = ALL và orphanRemoval = true ở Entity
            product.getVariants().addAll(
                    request.variants().stream().map(vReq -> {
                        var v = productMapper.toProductVariant(vReq);
                        v.setProduct(product);
                        return v;
                    }).toList()
            );
        }

        Product saved = productRepository.save(product);
        return productMapper.toProductResponse(saved);
    }
    @Transactional
    public void deleteProductById(Long id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setDeletedAt(LocalDateTime.now());
    }
    private String generateSku(String productName, Map<String, String> attributes) {
        String attrPart = String.join("-", attributes.values());
        return (productName.substring(0, 3) + "-" + attrPart).toUpperCase().replaceAll("\\s+", "");
    }
}
