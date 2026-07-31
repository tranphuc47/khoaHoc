// repository/CategoryRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
}