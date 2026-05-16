package com.tientoan21.service;

import com.tientoan21.dto.response.CategoryFilterResponse;
import com.tientoan21.dto.response.CategoryResponse;
import com.tientoan21.entity.Category;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import com.tientoan21.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.CategoryMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tientoan21.repository.CategoryRepository;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final CloudinaryService cloudinaryService;
    private final ProductRepository productRepository;

    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse create(String name, MultipartFile file) {
        if(categoryRepository.existsCategoryByName(name)){
            throw new AppException(ErrorCode.CATEGORY_EXISTS);
        }

        Category category = new Category();
        category.setName(name);

        if (file != null && !file.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(file);
            category.setImage(imageUrl);
        }

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }
    public List<CategoryResponse> getALlCategory(){
        List<Category> categories = categoryRepository.findAll();

        return categories.stream().map(categoryMapper::toCategoryResponse).toList();
    }
    public CategoryResponse getCategoryById(Long id){
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        return categoryMapper.toCategoryResponse(category);
    }
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse updateCategory(Long id, String name, MultipartFile file) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        category.setName(name);

        if (file != null && !file.isEmpty()) {
            if (category.getImage() != null) {
                cloudinaryService.deleteFile(category.getImage());
            }
            String imageUrl = cloudinaryService.uploadFile(file);
            category.setImage(imageUrl);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(saved);
    }
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id){
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        category.setDeletedAt(LocalDateTime.now());
    }
    public CategoryFilterResponse getCategoryFilters(Long categoryId) {
        List<String> brands = productRepository.findDistinctBrandsByCategoryId(categoryId);

        return CategoryFilterResponse.builder()
                .brands(brands)
                .build();
    }
}
