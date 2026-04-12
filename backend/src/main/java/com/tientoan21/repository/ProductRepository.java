package com.tientoan21.repository;

import com.tientoan21.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsProductByName(String name);

    Page<Product> findAllByCategoryId(Long categoryId, Pageable pageable);
}
