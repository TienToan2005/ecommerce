package com.tientoan21.service;

import com.tientoan21.dto.request.CategoryRequest;
import com.tientoan21.dto.response.CategoryResponse;
import com.tientoan21.entity.Category;
import com.tientoan21.enums.ErrorCode;
import com.tientoan21.exception.AppException;
import lombok.RequiredArgsConstructor;
import com.tientoan21.mapper.CategoryMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tientoan21.repository.CategoryRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryResponse create(CategoryRequest request){
        if(categoryRepository.existsCategoryByName(request.name())){
            throw new AppException(ErrorCode.CATEGORY_EXISTS);
        }
        Category category = categoryMapper.toCategory(request);
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
    public CategoryResponse updateCategory(Long id, CategoryRequest request){
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        category.setName(request.name());
        Category saved = categoryRepository.save(category);

        return categoryMapper.toCategoryResponse(saved);
    }
    @Transactional
    public void deleteCategory(Long id){
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        category.setDeletedAt(LocalDateTime.now());
    }

}
