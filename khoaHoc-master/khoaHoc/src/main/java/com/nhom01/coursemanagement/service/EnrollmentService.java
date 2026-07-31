// service/EnrollmentService.java
package com.nhom01.coursemanagement.service;

import com.nhom01.coursemanagement.dto.request.EnrollmentRequest;
import com.nhom01.coursemanagement.dto.response.*;
import com.nhom01.coursemanagement.entity.*;
import com.nhom01.coursemanagement.exception.*;
import com.nhom01.coursemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // ===== STT 1: Student đăng ký khóa học =====
    // Check trùng UNIQUE(user_id, course_id) trước khi insert, tránh lỗi DB constraint ném exception khó hiểu
    public EnrollmentResponse enroll(EnrollmentRequest req) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học id=" + req.getCourseId()));

        enrollmentRepository.findByUserIdAndCourseId(currentUser.getId(), course.getId())
                .ifPresent(e -> { throw new BusinessException("Bạn đã đăng ký khóa học này rồi"); });

        Enrollment enrollment = Enrollment.builder()
                .user(currentUser)
                .course(course)
                .status(Enrollment.EnrollmentStatus.PENDING)
                .build();

        return toResponse(enrollmentRepository.save(enrollment));
    }

    // ===== STT 2: Student xem các khóa học mình đã đăng ký =====
    public Page<EnrollmentResponse> getMyEnrollments(Pageable pageable) {
        User currentUser = getCurrentUser();
        return enrollmentRepository.findByUserId(currentUser.getId(), pageable).map(this::toResponse);
    }

    // ===== STT 3: Admin/Instructor xem danh sách học viên đã đăng ký 1 course =====
    public List<EnrollmentResponse> getByCourseId(Integer courseId) {
        checkCourseOwnership(courseId); // Instructor chỉ xem được course của chính mình, Admin xem tất cả
        return enrollmentRepository.findByCourseId(courseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ===== STT 4: Duyệt ghi danh — PENDING -> ACTIVE =====
    public EnrollmentResponse approve(Integer id) {
        Enrollment enrollment = findEntity(id);
        checkCourseOwnership(enrollment.getCourse().getId());

        if (enrollment.getStatus() != Enrollment.EnrollmentStatus.PENDING) {
            throw new BusinessException("Chỉ có thể duyệt ghi danh đang ở trạng thái PENDING");
        }
        enrollment.setStatus(Enrollment.EnrollmentStatus.ACTIVE);
        return toResponse(enrollmentRepository.save(enrollment));
    }

    // ===== STT 5: Hủy ghi danh — Student tự hủy của mình, hoặc Admin/Instructor hủy hộ =====
    public EnrollmentResponse cancel(Integer id) {
        Enrollment enrollment = findEntity(id);

        if (!isAdminOrInstructor()) {
            // Nếu là Student thì chỉ được hủy đăng ký của chính mình
            User currentUser = getCurrentUser();
            if (!enrollment.getUser().getId().equals(currentUser.getId())) {
                throw new BusinessException("Bạn không có quyền hủy ghi danh này");
            }
        } else if (!isAdmin()) {
            // Instructor chỉ hủy được ghi danh thuộc khóa học của mình
            checkCourseOwnership(enrollment.getCourse().getId());
        }

        enrollment.setStatus(Enrollment.EnrollmentStatus.CANCELLED);
        return toResponse(enrollmentRepository.save(enrollment));
    }

    // ===== STT 6: Thống kê số lượng học viên theo từng khóa học =====
    // Chỉ thống kê các course mà Instructor hiện tại sở hữu; Admin xem toàn bộ course
    public List<EnrollmentStatisticResponse> getStatistics() {
        List<Course> courses = isAdmin()
                ? courseRepository.findAll()
                : courseRepository.findByInstructorId(getCurrentUser().getId(), Pageable.unpaged()).getContent();

        return courses.stream().map(c -> EnrollmentStatisticResponse.builder()
                .courseId(c.getId())
                .courseTitle(c.getTitle())
                .totalEnrolled(enrollmentRepository.countByCourseId(c.getId()))
                .activeCount(enrollmentRepository.countByCourseIdAndStatus(c.getId(), Enrollment.EnrollmentStatus.ACTIVE))
                .completedCount(enrollmentRepository.countByCourseIdAndStatus(c.getId(), Enrollment.EnrollmentStatus.COMPLETED))
                .cancelledCount(enrollmentRepository.countByCourseIdAndStatus(c.getId(), Enrollment.EnrollmentStatus.CANCELLED))
                .build()
        ).collect(Collectors.toList());
    }

    // ---------- Helper ----------

    private Enrollment findEntity(Integer id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ghi danh id=" + id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user hiện tại"));
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isAdminOrInstructor() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_INSTRUCTOR"));
    }

    // Instructor chỉ thao tác được trên course của chính mình; Admin bỏ qua check này
    private void checkCourseOwnership(Integer courseId) {
        if (isAdmin()) return;
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học id=" + courseId));
        User currentUser = getCurrentUser();
        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new BusinessException("Bạn không có quyền thao tác trên khóa học này");
        }
    }

    private EnrollmentResponse toResponse(Enrollment e) {
        return EnrollmentResponse.builder()
                .id(e.getId())
                .userId(e.getUser().getId())
                .userFullName(e.getUser().getFullName())
                .courseId(e.getCourse().getId())
                .courseTitle(e.getCourse().getTitle())
                .status(e.getStatus().name())
                .enrolledDate(e.getEnrolledDate())
                .completedDate(e.getCompletedDate())
                .build();
    }
}