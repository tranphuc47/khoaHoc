package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, Integer> {

    // STT 1: lấy course theo status (PUBLISHED), có phân trang
    Page<Course> findByStatus(Course.CourseStatus status, Pageable pageable);

    // STT 6: tìm theo title hoặc tên category, chỉ trong course PUBLISHED
    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Course> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // STT 7: lấy course do 1 instructor tạo
    Page<Course> findByInstructorId(Integer instructorId, Pageable pageable);

    // Module Statistics: đếm course theo trạng thái để làm dashboard tổng quan ADMIN
    long countByStatus(Course.CourseStatus status);

    // Module Statistics: đếm số course của 1 instructor, không load danh sách course
    long countByInstructorId(Integer instructorId);

    // Module Statistics: thống kê số course được tạo theo từng tháng trong 1 năm
    // Trả về mảng [year, month, courseCount] cho từng tháng có dữ liệu
    @Query("SELECT FUNCTION('YEAR', c.createdAt), FUNCTION('MONTH', c.createdAt), COUNT(c) " +
           "FROM Course c " +
           "WHERE FUNCTION('YEAR', c.createdAt) = :year " +
           "GROUP BY FUNCTION('YEAR', c.createdAt), FUNCTION('MONTH', c.createdAt) " +
           "ORDER BY FUNCTION('MONTH', c.createdAt)")
    java.util.List<Object[]> getMonthlyCreatedCourses(@Param("year") int year);
}
