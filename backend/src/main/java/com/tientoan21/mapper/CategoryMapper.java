package com.tientoan21.mapper;

import com.tientoan21.dto.request.CategoryRequest;
import com.tientoan21.dto.response.CategoryResponse;
import com.tientoan21.entity.Category;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;


@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toCategoryResponse(Category category);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Category toCategory(CategoryRequest request);
}
