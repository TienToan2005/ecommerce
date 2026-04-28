package com.tientoan21.service;

import com.tientoan21.dto.request.ProductRequest;
import com.tientoan21.dto.request.ProductVariantRequest;
import com.tientoan21.dto.response.ProductResponse;
import com.tientoan21.dto.response.ProductVariantResponse;
import com.tientoan21.entity.Category;
import com.tientoan21.entity.Product;
import com.tientoan21.entity.ProductVariant;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.enums.ProductStatus;
import com.tientoan21.exception.AppException;
import com.tientoan21.mapper.ProductMapper;
import com.tientoan21.mapper.ProductVariantMapper;
import com.tientoan21.repository.CategoryRepository;
import com.tientoan21.repository.ProductRepository;
import com.tientoan21.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductService {
    private final ProductRepository productRepository;
    private  final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final FileUploadService fileUploadService;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantMapper productVariantMapper;
    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile poster, List<MultipartFile> images){
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Product product = productMapper.toProduct(request);
        product.setCategory(category);

        String posterUrl = null;
        if(poster != null && !poster.isEmpty()){
            posterUrl = fileUploadService.uploadFile(poster);
        }
        List<String> imageUrls = new ArrayList<>();
        if(images != null && !images.isEmpty()){
            imageUrls = fileUploadService.uploadMultipleFiles(images);
        }
        product.setPoster(posterUrl);
        product.setImages(imageUrls);

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
    @Transactional
    public ProductVariantResponse addVariantToProduct(Long productId, ProductVariantRequest request){
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductVariant variant = productVariantMapper.toProductVariant(request);
        variant.setProduct(product);

        if (variant.getSku() == null || variant.getSku().isBlank()) {
            variant.setSku(generateSku(product.getName(), variant.getAttributes()));
        }

        ProductVariant savedVariant = productVariantRepository.save(variant);

        return productVariantMapper.toProductVariantResponse(savedVariant);
    }
    public Page<ProductResponse> getAllProducts(Pageable pageable){
        Page<Product> products = productRepository.findAll(pageable);

        return products.map(productMapper::toProductResponse);
    }
    @Transactional
    public ProductResponse updateProductById(Long id, ProductRequest request, MultipartFile poster, List<MultipartFile> images){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if(request.categoryId() != null){
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }

        productMapper.updateProductFromRequest(request, product);
        if (poster != null && !poster.isEmpty()) {
            if (product.getPoster() != null) {
                   fileUploadService.deleteFile(product.getPoster());
            }
            String posterUrl = fileUploadService.uploadFile(poster);
            product.setPoster(posterUrl);

        }
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = fileUploadService.uploadMultipleFiles(images);
            product.setImages(imageUrls);
        }

        Product saved = productRepository.save(product);
        return productMapper.toProductResponse(saved);
    }

    @Transactional
    public ProductVariantResponse updateVariant(Long variantId, ProductVariantRequest request){
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        productVariantMapper.updateVariantFromRequest(request, variant);

        variant.setSku(generateSku(variant.getProduct().getName(), variant.getAttributes()));

        ProductVariant updatedVariant = productVariantRepository.save(variant);
        return productVariantMapper.toProductVariantResponse(updatedVariant);
    }
    @Transactional
    public void deleteProductById(Long id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        product.setDeletedAt(LocalDateTime.now());
    }
    @Transactional
    public void deleteVariant(Long variantId){
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        variant.setDeletedAt(LocalDateTime.now());
        variant.setStatus(ProductStatus.DELETED);
    }
    private String generateSku(String productName, Map<String, String> attributes) {
        String attrPart = String.join("-", attributes.values());
        String prefix = productName.length() >= 3 ? productName.substring(0, 3) : productName;
        return (prefix + "-" + attrPart).toUpperCase().replaceAll("\\s+", "");
    }
}
