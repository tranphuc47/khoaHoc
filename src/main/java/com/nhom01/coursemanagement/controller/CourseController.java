package com.nhom01.coursemanagement.controller;

import com.nhom01.coursemanagement.dto.request.*;
import com.nhom01.coursemanagement.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // STT 1 — public, phân trang: ?page=0&size=10&sort=createdAt,desc
    @GetMapping("/api/courses")
    public ResponseEntity<?> getAll(Pageable pageable) {
        return ResponseEntity.ok(courseService.getAllPublished(pageable));
    }

    // STT 2 — public, kèm chapters + lessons
    @GetMapping("/api/courses/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    // STT 6 — public
    @GetMapping("/api/courses/search")
    public ResponseEntity<?> search(@RequestParam String keyword, Pageable pageable) {
        return ResponseEntity.ok(courseService.search(keyword, pageable));
    }

    // STT 7 — INSTRUCTOR
    @GetMapping("/api/instructor/courses")
    public ResponseEntity<?> getMyCourses(Pageable pageable) {
        return ResponseEntity.ok(courseService.getMyCourses(pageable));
    }

    // STT 3 — ADMIN, INSTRUCTOR
    @PostMapping("/api/courses")
    public ResponseEntity<?> create(@Valid @RequestBody CourseCreateRequest req) {
        return ResponseEntity.ok(courseService.create(req));
    }

    // STT 4 — ADMIN hoặc INSTRUCTOR sở hữu
    @PutMapping("/api/courses/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody CourseUpdateRequest req) {
        return ResponseEntity.ok(courseService.update(id, req));
    }

    // STT 5 — ADMIN hoặc INSTRUCTOR sở hữu
    @DeleteMapping("/api/courses/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        courseService.delete(id);
        return ResponseEntity.ok("Xóa khóa học thành công");
    }
}
