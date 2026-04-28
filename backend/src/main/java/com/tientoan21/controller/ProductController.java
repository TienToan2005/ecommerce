package com.tientoan21.controller;

import com.tientoan21.dto.request.FilterProductsRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import com.tientoan21.service.ProductService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id){

        return ApiResponse.<ProductResponse>builder()
                .data(productService.getProductById(id))
                .build();
    }
    @GetMapping
    public ApiResponse<Page<ProductResponse>> getProducts(@ModelAttribute FilterProductsRequest request, Pageable pageable){
        return ApiResponse.<Page<ProductResponse>>builder()
                .data(productService.filterProducts(request, pageable))
                .build();
    }
}
