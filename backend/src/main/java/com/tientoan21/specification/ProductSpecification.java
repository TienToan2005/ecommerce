package com.tientoan21.specification;

import com.tientoan21.entity.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasName(String name){
        return (root, query, builder) -> {
            if (name == null || name.isEmpty()) return null;
            String searchKeyword = "%" + name.trim().toLowerCase().replaceAll("\\s+", "%") + "%";
            return builder.like(builder.lower(root.get("name")), searchKeyword);
        };
    }
    public static Specification<Product> hasPriceBetween(Double minPrice, Double maxPrice){
        return (root, query, builder) -> {
            if(minPrice == null && maxPrice == null) return null;
            if(minPrice != null   && maxPrice == null){
                return builder.greaterThanOrEqualTo(root.get("price"), minPrice);
            }
            if(minPrice == null && maxPrice != null){
                return builder.lessThanOrEqualTo(root.get("price"), maxPrice);
            }
            return builder.between(root.get("price"), minPrice, maxPrice);
        };
    }
    public static Specification<Product> hasCategory(Long categoryId){
        return (root, query, criteriaBuilder) -> {
            if(categoryId == null) return null;
            return criteriaBuilder.equal(root.join("category").get("id"), categoryId);
        };
    }
}
