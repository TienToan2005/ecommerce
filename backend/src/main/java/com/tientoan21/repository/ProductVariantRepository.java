package com.tientoan21.repository;

import com.tientoan21.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @Query("select v from ProductVariant v where v.stock < 10")
    List<ProductVariant> findAllLowStock();
}
