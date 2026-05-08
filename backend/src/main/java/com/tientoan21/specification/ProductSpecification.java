package com.tientoan21.specification;

import com.tientoan21.entity.Product;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasName(String name){
        return (root, query, builder) -> {
            if (name == null || name.isEmpty()) return null;
            String searchKeyword = "%" + name.trim().toLowerCase().replaceAll("\\s+", "%") + "%";
            return builder.like(builder.lower(root.get("name")), searchKeyword);
        };
    }
    public static Specification<Product> hasPriceBetween(Double minPrice, Double maxPrice) {
        return (root, query, builder) -> {
            if (minPrice == null && maxPrice == null) return null;

            Join<Object, Object> variantJoin = root.join("variants");

            query.distinct(true);

            if (minPrice != null && maxPrice == null) {
                return builder.greaterThanOrEqualTo(variantJoin.get("price"), minPrice);
            }
            if (minPrice == null && maxPrice != null) {
                return builder.lessThanOrEqualTo(variantJoin.get("price"), maxPrice);
            }
            return builder.between(variantJoin.get("price"), minPrice, maxPrice);
        };
    }
    public static Specification<Product> hasCategory(Long categoryId){
        return (root, query, criteriaBuilder) -> {
            if(categoryId == null) return null;
            return criteriaBuilder.equal(root.join("category").get("id"), categoryId);
        };
    }
}
