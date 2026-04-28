package com.tientoan21.entity;

import com.tientoan21.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Builder
@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "products")
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @ElementCollection
    private List<String> images;
    private String poster;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection
    @CollectionTable(name = "product_specs")
    @MapKeyColumn(name = "spec_key")
    @Column(name = "spec_value")
    private Map<String, String> specifications = new HashMap<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @Formula("(SELECT COALESCE(AVG(r.rating), 0.0) FROM reviews r WHERE r.product_id = id AND r.deleted_at IS NULL)")
    private Double averageRating;

    @Formula("(SELECT COUNT(*) FROM reviews r WHERE r.product_id = id AND r.deleted_at IS NULL)")
    private Integer totalReviews;
}
