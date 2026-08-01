// controller/EnrollmentController.java
package com.nhom01.coursemanagement.controller;

import com.nhom01.coursemanagement.dto.request.EnrollmentRequest;
import com.nhom01.coursemanagement.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // STT 1 — STUDENT đăng ký khóa học
    @PostMapping("/api/enrollments")
    public ResponseEntity<?> enroll(@Valid @RequestBody EnrollmentRequest req) {
        return ResponseEntity.ok(enrollmentService.enroll(req));
    }

    // STT 2 — STUDENT xem khóa học đã đăng ký (phân trang: ?page=0&size=10)
    @GetMapping("/api/student/courses")
    public ResponseEntity<?> getMyEnrollments(Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(pageable));
    }

    // STT 3 — ADMIN, INSTRUCTOR xem danh sách học viên của 1 course
    @GetMapping("/api/courses/{courseId}/enrollments")
    public ResponseEntity<?> getByCourse(@PathVariable Integer courseId) {
        return ResponseEntity.ok(enrollmentService.getByCourseId(courseId));
    }

    // STT 4 — ADMIN, INSTRUCTOR duyệt ghi danh
    @PutMapping("/api/enrollments/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Integer id) {
        return ResponseEntity.ok(enrollmentService.approve(id));
    }

    // STT 5 — ADMIN, INSTRUCTOR, STUDENT (của chính mình) hủy ghi danh
    @PutMapping("/api/enrollments/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Integer id) {
        return ResponseEntity.ok(enrollmentService.cancel(id));
    }

    // STT 6 — ADMIN, INSTRUCTOR xem thống kê
    @GetMapping("/api/enrollments/statistics")
    public ResponseEntity<?> getStatistics() {
        return ResponseEntity.ok(enrollmentService.getStatistics());
    }
}