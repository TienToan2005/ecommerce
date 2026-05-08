package com.tientoan21.specification;

import com.tientoan21.entity.Order;
import com.tientoan21.enums.OrderStatus;
import org.springframework.data.jpa.domain.Specification;

public class OrderSpecification {
    public static Specification<Order> hasOrderNumber(String search){
        return (root, query, criteriaBuilder) -> {
            if(search == null || search.isEmpty()) return null;

            return criteriaBuilder.like(criteriaBuilder.lower(root.get("orderNumber")), "%" + search.toLowerCase() + "%");
        };
    }
    public static Specification<Order> hasStatus(OrderStatus status){
        return (root, query, criteriaBuilder) -> {
            if(status == null) return null;

            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

}
