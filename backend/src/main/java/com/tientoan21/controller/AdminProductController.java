package com.tientoan21.controller;

import com.tientoan21.dto.request.ProductRequest;
import com.tientoan21.dto.request.ProductVariantRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.ProductResponse;
import com.tientoan21.dto.response.ProductVariantResponse;
import com.tientoan21.service.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {
    private final AdminProductService productImplService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProductResponse> createProduct(
            @RequestPart("data") @Valid ProductRequest request,
            @RequestPart(value = "poster", required = false) MultipartFile poster,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ){
        return ApiResponse.<ProductResponse>builder()
                .data(productImplService.createProduct(request, poster, images))
                .build();
    }
    @GetMapping
    public ApiResponse<Page<ProductResponse>> getAllProductsForAdmin(Pageable pageable){
        return ApiResponse.<Page<ProductResponse>>builder()
                .data(productImplService.getAllProducts(pageable))
                .build();
    }
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestPart("data") ProductRequest request,
            @RequestPart(value = "poster", required = false) MultipartFile poster,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ){
        return ApiResponse.<ProductResponse>builder()
                .data(productImplService.updateProductById(id, request, poster, images))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteProduct(@PathVariable Long id){
        productImplService.deleteProductById(id);
        return ApiResponse.<String>builder().data("Đã ẩn sản phẩm thành công").build();
    }
    @PostMapping("/{productId}/variants")
    public ApiResponse<ProductVariantResponse> addVariantToProduct(
            @PathVariable Long productId,
            @RequestBody @Valid ProductVariantRequest request) {
        return ApiResponse.<ProductVariantResponse>builder()
                .data(productImplService.addVariantToProduct(productId, request))
                .build();
    }
    @PutMapping("/variants/{variantId}")
    public ApiResponse<ProductVariantResponse> updateVariant(
            @PathVariable Long variantId,
            @RequestBody ProductVariantRequest request) {
        return ApiResponse.<ProductVariantResponse>builder()
                .data(productImplService.updateVariant(variantId, request))
                .build();
    }
    @DeleteMapping("/variants/{variantId}")
    public ApiResponse<String> deleteVariant(@PathVariable Long variantId) {
        productImplService.deleteVariant(variantId);
        return ApiResponse.<String>builder().data("Xóa phiên bản thành công").build();
    }
}
