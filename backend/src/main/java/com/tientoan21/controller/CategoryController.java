package com.tientoan21.controller;

import com.tientoan21.dto.request.CategoryRequest;
import com.tientoan21.dto.response.ApiResponse;
import com.tientoan21.dto.response.CategoryResponse;
import com.tientoan21.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> create(@RequestBody CategoryRequest request){
        return ApiResponse.<CategoryResponse>builder()
                .data(categoryService.create(request))
                .build();
    }
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getALlCategory(){
        return ApiResponse.<List<CategoryResponse>>builder()
                .data(categoryService.getALlCategory())
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getCategoryById(@PathVariable Long id){
        return ApiResponse.<CategoryResponse>builder()
                .data(categoryService.getCategoryById(id))
                .build();
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody @Valid CategoryRequest request){
        return ApiResponse.<CategoryResponse>builder()
                .data(categoryService.updateCategory(id, request))
                .build();
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteCategory(@PathVariable Long id){
        categoryService.deleteCategory(id);
        return ApiResponse.<String>builder()
                .data("Xóa danh mục thành công.")
                .build();
    }
}