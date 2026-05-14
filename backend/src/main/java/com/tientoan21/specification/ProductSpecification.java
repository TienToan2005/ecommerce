package com.tientoan21.specification;

import com.tientoan21.entity.Product;
import com.tientoan21.entity.ProductVariant;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.MapJoin;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
public class ProductSpecification {

    public static Specification<Product> hasName(String name){
        return (root, query, builder) -> {
            if (name == null || name.trim().isEmpty()) return null;
            String searchKeyword = "%" + name.trim().toLowerCase().replaceAll("\\s+", "%") + "%";
            return builder.like(builder.lower(root.get("name")), searchKeyword);
        };
    }

    public static Specification<Product> hasPriceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, builder) -> {
            if (minPrice == null && maxPrice == null) return null;

            Join<Product, ProductVariant> variantJoin = root.join("variants");
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
        return (root, query, builder) -> {
            if(categoryId == null) return null;
            return builder.equal(root.join("category").get("id"), categoryId);
        };
    }

    public static Specification<Product> hasBrand(String brand) {
        return (root, query, builder) -> {
            if (brand == null || brand.trim().isEmpty()) return null;

            MapJoin<Product, String, String> specJoin = root.joinMap("specifications");

            return builder.and(
                    builder.equal(specJoin.key(), "Thương hiệu"),
                    builder.equal(specJoin.value(), brand)
            );
        };
    }

    public static Specification<Product> isFeatured() {
        return (root, query, builder) -> {
            return builder.greaterThanOrEqualTo(root.get("averageRating"), 4.0);
        };
    }

    public static Specification<Product> inStock() {
        return (root, query, builder) -> {
            Join<Product, ProductVariant> variantJoin = root.join("variants");
            query.distinct(true);
            return builder.greaterThan(variantJoin.get("stock"), 0);
        };
    }
}