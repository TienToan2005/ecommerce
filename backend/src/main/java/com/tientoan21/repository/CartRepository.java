package com.tientoan21.repository;

import com.tientoan21.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findCartByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
