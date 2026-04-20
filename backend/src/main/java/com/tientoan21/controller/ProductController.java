package com.tientoan21.controller;

import com.tientoan21.dto.request.FilterProductsRequest;
import com.tientoan21.dto.request.ProductRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.ProductResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.ProductService;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProductResponse> createProduct(
            @RequestPart("data") @Valid ProductRequest request,
            @RequestPart(value = "poster", required = false) MultipartFile poster,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ){
        return ApiResponse.<ProductResponse>builder()
                .data(productService.createProduct(request, poster, images))
                .build();
    }
    @GetMapping
    public ApiResponse<Page<ProductResponse>> getALlProduct(Pageable pageable){
        return ApiResponse.<Page<ProductResponse>>builder()
                .data(productService.getALlProduct(pageable))
                .build();
    }
    @GetMapping("/category/{categoryId}")
    public ApiResponse<Page<ProductResponse>> getAllProductByCategory(
            @PathVariable("categoryId") Long categoryId,
            Pageable pageable){
        return ApiResponse.<Page<ProductResponse>>builder()
                .data(productService.getAllProductByCategory(categoryId, pageable))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id){
        return ApiResponse.<ProductResponse>builder()
                .data(productService.getProductById(id))
                .build();
    }
    @GetMapping("/filter")
    public ApiResponse<Page<ProductResponse>> filterProducts(@ModelAttribute FilterProductsRequest request, Pageable pageable){
        return ApiResponse.<Page<ProductResponse>>builder()
                .data(productService.filterProducts(request, pageable))
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProductById(@PathVariable Long id, @RequestBody ProductRequest request){
        return ApiResponse.<ProductResponse>builder()
                .data(productService.updateProductById(id,request))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteProductById(@PathVariable Long id){
        productService.deleteProductById(id);
        return ApiResponse.<String>builder()
                .data("Đã xóa product thành công")
                .build();
    }
}
