// repository/EnrollmentRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Enrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    // STT 2: lấy các khóa học mà 1 student đã đăng ký
    Page<Enrollment> findByUserId(Integer userId, Pageable pageable);

    // STT 3: lấy danh sách học viên đã đăng ký 1 khóa học (dùng cho Instructor/Admin xem)
    List<Enrollment> findByCourseId(Integer courseId);

    // Kiểm tra trùng đăng ký trước khi insert (khớp UNIQUE (user_id, course_id) trong DB)
    Optional<Enrollment> findByUserIdAndCourseId(Integer userId, Integer courseId);

    // STT 6: đếm số học viên đã đăng ký theo từng course — dùng cho thống kê
    long countByCourseId(Integer courseId);
    long countByCourseIdAndStatus(Integer courseId, Enrollment.EnrollmentStatus status);

    // Module Statistics: đếm enrollment theo status để làm dashboard tổng quan ADMIN
    long countByStatus(Enrollment.EnrollmentStatus status);

    // Module Statistics: đếm enrollment của 1 học viên theo status để làm thống kê STUDENT
    long countByUserIdAndStatus(Integer userId, Enrollment.EnrollmentStatus status);

    // Module Statistics: đếm số học viên khác nhau đã đăng ký course của 1 instructor
    @Query("SELECT COUNT(DISTINCT e.user.id) FROM Enrollment e WHERE e.course.instructor.id = :instructorId")
    long countDistinctStudentsByInstructor(@Param("instructorId") Integer instructorId);

    // Module Statistics: đếm số danh mục/môn khác nhau mà học viên đang học hoặc đã hoàn thành
    @Query("SELECT COUNT(DISTINCT e.course.category.id) FROM Enrollment e " +
           "WHERE e.user.id = :userId AND e.status IN :statuses AND e.course.category IS NOT NULL")
    long countDistinctCategoriesByStudent(@Param("userId") Integer userId,
                                          @Param("statuses") List<Enrollment.EnrollmentStatus> statuses);

    // Module Statistics: thống kê số lượt ghi danh theo từng tháng trong 1 năm cho ADMIN
    // Trả về mảng [year, month, enrollmentCount] cho từng tháng có dữ liệu
    @Query("SELECT FUNCTION('YEAR', e.enrolledDate), FUNCTION('MONTH', e.enrolledDate), COUNT(e) " +
           "FROM Enrollment e " +
           "WHERE FUNCTION('YEAR', e.enrolledDate) = :year " +
           "GROUP BY FUNCTION('YEAR', e.enrolledDate), FUNCTION('MONTH', e.enrolledDate) " +
           "ORDER BY FUNCTION('MONTH', e.enrolledDate)")
    List<Object[]> getMonthlyEnrollments(@Param("year") int year);

    // Module Statistics: thống kê số lượt ghi danh theo từng tháng trong 1 năm cho course của instructor
    // Trả về mảng [year, month, enrollmentCount] cho từng tháng có dữ liệu
    @Query("SELECT FUNCTION('YEAR', e.enrolledDate), FUNCTION('MONTH', e.enrolledDate), COUNT(e) " +
           "FROM Enrollment e " +
           "WHERE e.course.instructor.id = :instructorId AND FUNCTION('YEAR', e.enrolledDate) = :year " +
           "GROUP BY FUNCTION('YEAR', e.enrolledDate), FUNCTION('MONTH', e.enrolledDate) " +
           "ORDER BY FUNCTION('MONTH', e.enrolledDate)")
    List<Object[]> getMonthlyEnrollmentsByInstructor(@Param("instructorId") Integer instructorId,
                                                     @Param("year") int year);
}
