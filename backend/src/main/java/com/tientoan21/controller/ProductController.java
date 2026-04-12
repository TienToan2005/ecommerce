package com.tientoan21.controller;

import com.tientoan21.dto.request.ProductRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.ProductService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/product")
public class ProductController {
    private final ProductService productService;

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@RequestBody ProductRequest request){
        return ApiResponse.<ProductResponse>builder()
                .data(productService.createProduct(request))
                .build();
    }
    @GetMapping
    public ApiResponse<Page<ProductResponse>> getALlProduct(Pageable pageable){
        return ApiResponse.<Page<ProductResponse>>builder()
                .data(productService.getALlProduct(pageable.getPageNumber(), pageable.getPageSize()))
                .build();
    }
    @GetMapping("/category/{categoryId}")
    public ApiResponse<Page<ProductResponse>> getAllProductByCategory(
            @PathVariable("categoryId") Long categoryId,
            Pageable pageable){
        return ApiResponse.<Page<ProductResponse>>builder()
                .data(productService.getAllProductByCategory(categoryId, pageable.getPageNumber(),pageable.getPageSize()))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id){
        return ApiResponse.<ProductResponse>builder()
                .data(productService.getProductById(id))
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
