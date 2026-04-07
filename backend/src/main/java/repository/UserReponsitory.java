package repository;

import entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserReponsitory extends JpaRepository<User,Long> {

    Optional<User> findUsersByEmailOrPhoneNumber(String email, String phoneNumber);
}
