package com.tientoan21.repository;

import com.tientoan21.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /** Trừ kho nguyên tử; trả về 0 nếu không đủ hàng. */
    @Modifying(flushAutomatically = true)
    @Query("update ProductVariant v set v.stock = v.stock - :quantity where v.id = :id and v.stock >= :quantity")
    int decrementStock(@Param("id") Long id, @Param("quantity") int quantity);

    /** Hoàn kho nguyên tử (hủy đơn, hoàn hàng). */
    @Modifying(flushAutomatically = true)
    @Query("update ProductVariant v set v.stock = v.stock + :quantity where v.id = :id")
    int incrementStock(@Param("id") Long id, @Param("quantity") int quantity);

    @Query("select v from ProductVariant v where v.stock < 10")
    List<ProductVariant> findAllLowStock();
}
