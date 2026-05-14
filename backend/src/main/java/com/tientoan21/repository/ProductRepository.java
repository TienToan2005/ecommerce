package com.tientoan21.repository;

import com.tientoan21.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsProductByName(String name);

    Page<Product> findAllByCategoryId(Long categoryId, Pageable pageable);

    @Query("select distinct value(s) from Product p join p.specifications s where p.category.id = :categoryId and key(s) = 'Thương hiệu'")
    List<String> findDistinctBrandsByCategoryId(@Param("categoryId") Long categoryId);
}
