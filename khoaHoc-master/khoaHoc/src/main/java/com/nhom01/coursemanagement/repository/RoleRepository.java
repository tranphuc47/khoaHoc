// repository/RoleRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(String name);
}