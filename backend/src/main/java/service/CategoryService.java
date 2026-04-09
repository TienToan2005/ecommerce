package service;

import dto.request.CategoryRequest;
import dto.response.CategoryResponse;
import entity.Category;
import enums.ErrorCode;
import exception.AppException;
import lombok.RequiredArgsConstructor;
import mapper.CategoryMapper;
import org.springframework.stereotype.Service;
import repository.CategoryRepository;

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
        Category category = new Category();
        category.setName(request.name());
        category.setProductList(request.products());

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
    public CategoryResponse updateCategory(Long id,CategoryRequest request){
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        category.setName(request.name());
        category.setProductList(request.products());
        Category saved = categoryRepository.save(category);

        return categoryMapper.toCategoryResponse(saved);
    }

    public void deleteCategory(Long id){
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        categoryRepository.delete(category);
    }

}
