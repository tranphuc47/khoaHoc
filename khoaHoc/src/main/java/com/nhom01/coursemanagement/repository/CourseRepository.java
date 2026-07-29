// repository/CourseRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, Integer> {

    // Dùng cho API "Lấy danh sách khóa học" (STT 1) — chỉ lấy course đã PUBLISHED, có phân trang
    Page<Course> findByStatus(Course.CourseStatus status, Pageable pageable);

    // Dùng cho API "Tìm kiếm khóa học" (STT 6) — tìm theo tên (title) HOẶC tên danh mục (category.name)
    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND " +
            "(LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Course> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Dùng cho API "Lấy khóa học của giảng viên" (STT 7) — lấy toàn bộ course do 1 instructor tạo
    Page<Course> findByInstructorId(Integer instructorId, Pageable pageable);
}