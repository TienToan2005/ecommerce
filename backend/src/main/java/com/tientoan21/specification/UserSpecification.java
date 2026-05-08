package com.tientoan21.specification;

import com.tientoan21.entity.Order;
import com.tientoan21.entity.User;
import com.tientoan21.enums.OrderStatus;
import com.tientoan21.enums.UserStatus;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

public class UserSpecification {

    public static Specification<User> globalSearch(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.trim().isEmpty()) {
                return null;
            }

            String searchKeyword = "%" + search.toLowerCase().trim() + "%";

            Predicate matchFullName = criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), searchKeyword);
            Predicate matchEmail = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchKeyword);
            Predicate matchPhone = criteriaBuilder.like(criteriaBuilder.lower(root.get("phoneNumber")), searchKeyword);

            return criteriaBuilder.or(matchFullName, matchEmail, matchPhone);
        };
    }
    public static Specification<User> hasStatus(UserStatus status){
        return (root, query, criteriaBuilder) -> {
            if(status == null) return null;

            return criteriaBuilder.equal(root.get("status"), status);
        };
    }
    public static Specification<User> isNotRole(String roleName) {
        return (root, query, criteriaBuilder) -> {
            if (roleName == null || roleName.trim().isEmpty()) return null;

            return criteriaBuilder.notEqual(
                    root.get("role").as(String.class),
                    roleName.toUpperCase()
            );
        };
    }
}