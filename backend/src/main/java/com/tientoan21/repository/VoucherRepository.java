package com.tientoan21.repository;


import com.tientoan21.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);

    /** Tăng lượt dùng nguyên tử; trả về 0 nếu voucher đã hết lượt. */
    @Modifying(flushAutomatically = true) // không clear: clear sẽ vứt các thay đổi chưa flush của đơn trong cùng transaction
    @Query("update Voucher v set v.usedCount = v.usedCount + 1 where v.code = :code and v.usedCount < v.usageLimit")
    int incrementUsedCount(@Param("code") String code);

    @Modifying(flushAutomatically = true) // không clear: clear sẽ vứt các thay đổi chưa flush của đơn trong cùng transaction
    @Query("update Voucher v set v.usedCount = v.usedCount - 1 where v.code = :code and v.usedCount > 0")
    int decrementUsedCount(@Param("code") String code);
}
