// repository/EnrollmentRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Enrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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
}