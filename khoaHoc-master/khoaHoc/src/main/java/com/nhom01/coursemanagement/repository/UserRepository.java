// repository/UserRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    long countByRole_Name(String roleName);
}
